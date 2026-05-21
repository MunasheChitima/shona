# Shona App — Forensic Deep-Dive & Adversarial Security Review

**Scope:** `/home/user/shona` (Next.js 14 + Prisma web app at `shona-learn/`, plus iOS/Android/watchOS sister projects).
**Posture:** Hostile. The app's worst enemy. No "looks generally secure" filler.
**Method:** Four parallel forensic agents covering (1) auth/API, (2) frontend/XSS, (3) supply chain/secrets/config, (4) code quality/architecture. Findings deduplicated, cross-validated, and ranked by exploitability.

> **Bottom line.** This codebase is not production-safe. It ships a *known* Google Cloud API key in plaintext, signs JWTs with a *known* fallback secret, hands every anonymous visitor write access to a shared "beta" DB user, lets anyone take over an account by hitting `/api/auth/register` with the victim's email, and embeds a paid ElevenLabs key in the browser bundle. Auth has effectively been *deleted* via `BETA_OPEN_ACCESS=true` while the surrounding infrastructure pretends it still exists. Every fix below is *required before any non-beta deployment*; several are required before the current deployment continues to run another day.

---

## 0. Headline disasters (fix today)

| # | What | Where | Impact |
|---|---|---|---|
| H0-1 | **Google Gemini/Veo API key committed in plaintext, 13 files + one published markdown doc** | `scripts/generate-veo-gemini-videos.ts:12` and 12 siblings; `shona-learn/VEO_VIDEO_GENERATION_SUCCESS.md:108` | Quota/billing theft. Key value: `AIzaSyBOGN6xFt_ylRMucqVHYDhsRE5IoMJZXEo`. **Revoke at GCP now.** Present in git history (`507b505`). |
| H0-2 | **`POST /api/auth/register` issues a JWT for an existing email without password check** | `shona-learn/app/api/auth/register/route.ts:37-55` | Full account takeover by email knowledge. The "user already exists" branch *returns a fresh token bound to the victim's userId.* |
| H0-3 | **JWT signing secret defaults to a hard-coded string in production** | `shona-learn/lib/auth-server.ts:6-10` | Production guard is bypassed when `BETA_OPEN_ACCESS=true`; tokens are minted/verified with literal `'development-secret-key-change-in-production'`. Anyone reading this report can forge a token for any userId. |
| H0-4 | **`BETA_OPEN_ACCESS=true` makes every API endpoint a shared admin user** | `shona-learn/lib/beta-access.ts:5`; fallback at `shona-learn/lib/auth-server.ts:26-29, 57-59` | Missing/invalid JWT silently resolves to the seeded `test@example.com` user (or "first user" if absent). Every `verifyAuth`-gated route operates as one shared identity. |
| H0-5 | **ElevenLabs API key shipped to the browser** | `app/components/FlashcardDeck.tsx:164`, `app/components/voice/TextToSpeech.tsx:40`, `lib/services/AudioService.ts:25`, `AudioContentManager.ts:203`, `NativeElevenLabsService.ts:32` | `NEXT_PUBLIC_*` is inlined into the JS bundle. Anyone with DevTools extracts the key. Paid API — unlimited abuse. |
| H0-6 | **`/api/flashcards` accepts `userId` as a query/body parameter, no auth** | `app/api/flashcards/route.ts:7-11, 53-58` | Trivial BOLA across the entire user base — read or mutate any user's flashcards by sending their userId. |
| H0-7 | **`sanitizeInput()` is applied to passwords at login but not at registration** | `app/api/auth/login/route.ts:35` vs `app/api/auth/register/route.ts:34-35,57` | Any password containing `< > & ' "` registers fine and never logs in. Worse: distinct passwords collide after HTML-escaping → bcrypt-comparison-equal. Password entropy silently destroyed. |
| H0-8 | **Seeded production user `test@example.com / password123`** | `prisma/seed.ts:59-71` | Known plaintext credentials baked into deploy artifacts; the same row is the "beta anonymous" fallback (`auth-server.ts:27`). |
| H0-9 | **`/api/sync/websocket` POST and the bare WebSocketServer accept anonymous broadcasts** | `app/api/sync/websocket/route.ts:25-57`; `websocketManager.ts:43-118` | Any internet caller can push attacker-controlled "content update" payloads to every connected client. The TCP WS server has no `verifyClient`, no JWT, no origin check. |
| H0-10 | **No CSP, no `X-Frame-Options`, no HSTS, no Referrer-Policy, no `X-Content-Type-Options`** | `next.config.js:19-49` only sets `Cache-Control` | Lighthouse already flags this (`lighthouse-report.json:1711`). Combined with H0-11 below, one XSS = 7-day session theft. |
| H0-11 | **JWTs stored in `localStorage`; the whole user object too** | `lib/auth.tsx:107,128,154,163,272,300,330`; consumed by `lib/api-auth-headers.ts:4` | Any script in the origin (XSS, extension, future 3rd-party) exfiltrates a 7-day token. No revocation, no rotation. |
| H0-12 | **`/api/pronunciation` is unauthenticated, CORS `*`, no size limit, writes attacker-controlled files to `/tmp`, calls paid Gemini per request** | `app/api/pronunciation/route.ts:7-95` | Cost-amplification DoS + disk-fill DoS, reachable from any origin. |
| H0-13 | **`/api/games` accepts arbitrary `score` from the client with zero clamping** | `app/api/games/route.ts:14-43` | Self-grant unlimited XP. `score: 1e9` is happily multiplied into XP and written to the user row. |
| H0-14 | **`/api/progress` auto-creates Lesson rows from attacker-supplied IDs** | `app/api/progress/route.ts:7-23` | `ensureLessonExists` upserts whatever `lessonId` you send, then marks it completed and pays the XP reward. DB pollution + XP farm. |
| H0-15 | **CDN-cacheable auth/private endpoints** | `next.config.js:30-38` — `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` on `/api/:path*` | Personalized API responses (progress, due reviews, XP) get cached in shared CDN/intermediates and served to *other users*. Cross-user data leak via cache. |

These 15 are individually deploy-blocking. Together they form an end-to-end account-takeover-plus-API-abuse story that costs nothing to execute.

---

## 1. Authentication & Authorization

### CRITICAL

1. **Auth is effectively disabled.** `BETA_OPEN_ACCESS=true` (`lib/beta-access.ts:5`) plus `verifyAuth()` falling back to `resolveBetaAnonymousUserId()` (`lib/auth-server.ts:57-59`) means missing *or invalid* tokens still resolve to a real DB user. `jwt.verify` failures are swallowed in `catch {}` — no signature check is enforced. `ProtectedRoute` in `lib/auth.tsx:370-372` is a literal pass-through (`return <>{children}</>`); every "protected" page renders for everyone. `validateToken()` returns `true` unconditionally under beta (`lib/auth.tsx:211-213`).

2. **Registration is an account-takeover endpoint.** `app/api/auth/register/route.ts:37-55` — on duplicate email, the handler issues a fresh JWT bound to the existing user without any password proof. Trivially exploitable.

3. **JWT secret default ships to prod.** `lib/auth-server.ts:6` — `process.env.JWT_SECRET || 'development-secret-key-change-in-production'`. The "throw in production" guard at `:8` is gated on `!BETA_OPEN_ACCESS`, which is currently `false`. Forge any token, any user, 7 days.

4. **JWT verification not algorithm-pinned.** `lib/auth-server.ts:50` — `jwt.verify(token, JWT_SECRET)` with no `algorithms: ['HS256']`. `jsonwebtoken@9` has hardened against the worst (`alg=none`), but algorithm-confusion remains possible if/when the project ever introduces RS256.

5. **Tokens in `localStorage`, plus the entire user object.** `lib/auth.tsx:107,128,...`. No `HttpOnly`, no `Secure`, no `SameSite`. One XSS = 7-day session theft. The "beta identity" generator also persists a *plaintext password* to `localStorage` (`lib/auth.tsx:78-86`) using `Math.random()` (non-CSPRNG) for the credential.

6. **`sanitizeInput()` corrupts the password at login.** `app/api/auth/login/route.ts:35` → `bcrypt.compare(sanitizeInput(password), user.password)`. Register uses raw `password` (`route.ts:57`). Distinct passwords (`a&b`, `a&amp;b`) collapse to the same comparison string. Login silently breaks for any password containing HTML-special characters.

### HIGH

7. **No rate limiting anywhere.** No middleware, no `next-rate-limit`, no Upstash, no `verifyClient` on WS. `/api/auth/login`, `/api/auth/register`, `/api/pronunciation` are wide open to brute-force / credential-stuffing / cost-bombing.

8. **User enumeration via timing.** `app/api/auth/login/route.ts:37-49` — if the user does not exist, the handler returns early *without* a dummy bcrypt round. The 50–200ms gap reliably reveals account existence.

9. **bcrypt cost 10, `bcryptjs` pure JS.** `app/api/auth/register/route.ts:57` + `package.json` (`bcryptjs`, not native `bcrypt`). Pure-JS bcrypt is ~30× slower; every login burns the event loop. Combined with no rate limit, this is a cheap CPU-DoS knob.

10. **No CSRF protection.** No middleware, no origin/referer check, no double-submit cookie. The beta fallback (`verifyAuth` returns a user even without Authorization) means cross-site forms POSTing JSON or multipart from `attacker.example` execute as the beta-anonymous user. `/api/pronunciation` is multipart and bypasses the CORS preflight entirely.

11. **JWT payload is `{ userId }` only.** No `iat`, `aud`, `iss`, `jti`. No environment binding. Tokens issued in dev work in prod and vice versa.

12. **7-day expiry, no refresh/revocation/blacklist.** `lib/auth-server.ts:40-42`. Logout (`lib/auth.tsx:316`) clears localStorage only; the token remains valid server-side until natural expiry.

13. **`expiresIn as any` cast.** `lib/auth-server.ts:41` — silent acceptance of malformed env vars; subtle expiry bugs.

14. **`Math.random()` for security-relevant IDs.** Beta identities (`lib/auth.tsx:78`), pronunciation tmp filenames (`api/pronunciation/route.ts:41`), WebSocket client IDs (`websocketManager.ts:138-141` — seeded with `Date.now() ^ Math.random() ^ pid`, SHA256-truncated; predictable seed → predictable IDs).

15. **`'null'`/`'undefined'` token strings whitelisted to fall through to beta user.** `lib/auth-server.ts:49`. Encourages clients to send broken auth and have it silently "work."

### MEDIUM

16. **`/api/auth/validate` leaks userIds (cuid format).** `app/api/auth/validate/route.ts:14` — `{valid: true, userId}`. Identifier format and existence both confirmed.

17. **Inconsistent error shapes.** Login returns `{error: 'Invalid credentials'}` (401). Register returns `{error, details: [...]}` with full Zod field paths (400). Attacker fingerprints exactly which field failed → enumeration.

18. **The seeded `test@example.com` IS the beta-fallback user.** `lib/auth-server.ts:26-29` — junk accumulates on a row with a known weak password. Flipping `BETA_OPEN_ACCESS=false` without rotating leaves the most-tampered account as the easiest target.

19. **`learningPathStartSchema.pathVariant` whitelists `'partner'`.** `lib/validation.ts:21-24` + `app/api/learning-path/start/route.ts:55-70` writes it verbatim. If `partner` ever becomes a privileged tier (paid affiliate), self-elevation is one POST away.

20. **`/api/reviews/schedule` accepts arbitrary `easeFactor`, `intervalDays`, `repetitions`, `nextReviewAt`.** `app/api/reviews/schedule/route.ts:34-57` — mass-assignment of the SRS state.

21. **`ProtectedRoute` no-op is a misleading API.** `lib/auth.tsx:370-372`. Future engineers will use this thinking it does something.

22. **`updateUser` writes arbitrary localStorage objects.** `lib/auth.tsx:325-333`. Combined with the 1-second `setTimeout`-delayed token validation (`:180-193`), the UI trusts whatever you put in `localStorage.user` for ~1s on every page load.

23. **`useEffect([isLoading])` re-entrancy in the AuthProvider.** `lib/auth.tsx:51-63` — every flip of `isLoading` re-invokes `checkAuthOnLoad`, which itself flips `isLoading`. Auto-registers/re-logs on every flicker; root cause of the random "beta@…" rows in the user table.

---

## 2. API Surface (BOLA / Injection / DoS)

### CRITICAL

24. **`/api/flashcards` IDOR** (see H0-6). No `verifyAuth`. `userId` from query/body controls everything: `due`, `stats`, `schedule`, `search`, `create`, `review`, `complete_session`, `import_from_lesson`.

25. **`/api/sync/websocket` POST broadcasts content updates without auth.** `app/api/sync/websocket/route.ts:25-51`. Combined with the WS server having no `verifyClient` (`websocketManager.ts:52-67`) and ignoring `origin`, anyone can push payloads to every connected client.

26. **`/api/sync/manifest` and `/api/sync/content/[type]` are public and CPU-bound.** No auth. `generateContentManifest` recursively reads every audio file and MD5-hashes it on cache miss (`api/sync/manifest/route.ts:206-225`). Defeat the 5-min cache by varying the `Platform` header → blocks event loop on every request.

27. **Cache poisoning via `Platform` header into a filename.** `api/sync/manifest/route.ts:67,96`: `path.join(process.cwd(), '.cache', \`manifest-${platform}.json\`)`. `path.join` collapses traversal, but an attacker can spam unique `Platform` values to generate unbounded cache files (disk fill) and to seed JSON responses with attacker-influenced metadata. Same untrusted header pattern in `api/sync/content/[type]/route.ts:92`.

### HIGH

28. **`/api/games` self-XP grant.** `score`, `gameType`, `difficulty` from request, no Zod, no clamp (see H0-13).

29. **`/api/progress` auto-creates Lessons from any ID** (see H0-14).

30. **`/api/pronunciation` is unauthenticated and amplifies cost** (see H0-12). `audioFile.type.startsWith('audio/')` is the entire validation; `File.type` is attacker-controlled. No magic-byte check, no size cap.

31. **Cache-Control:public on all `/api/*`** (see H0-15).

32. **Per-route `new PrismaClient()` connection exhaustion.** `app/api/vocabulary/route.ts:5`, `app/api/auth/login/route.ts:7`, `app/api/auth/register/route.ts:7`, `app/api/games/route.ts:5`, `lib/flashcard-service.ts:4`, `lib/notification-service.ts`. A proper singleton exists at `lib/prisma.ts` and is bypassed. Each warm Vercel lambda accumulates connections until Postgres `max_connections` is hit.

33. **Synchronous file IO on every content/manifest request.** `fs.readdirSync`, `fs.readFileSync` in `api/lessons/route.ts:27`, `api/exercises/[id]/route.ts:24`, `api/lessons/public/route.ts:14`, `api/sync/content/[type]/route.ts:171,178,214,261,302`, `api/sync/manifest/route.ts:153,206-225`. Blocks the event loop per request.

34. **Server-side `gzip-on-demand` based on client `Accept-Encoding`.** `api/sync/content/[type]/route.ts:122-133`. No size cap. Attacker requests gzip → server reads + compresses entire content corpus per request.

35. **Unbounded `parseInt(limit)` / negative `page` / `NaN` math.** `api/lessons/route.ts:15-16`, `api/flashcards/route.ts:8,25,33-34`. `?limit=99999999` is a memory exhaustion knob.

36. **`JSON.parse(item.examples)` with no try/catch.** `api/vocabulary/route.ts:28-29`. One malformed row → endpoint 500s.

37. **Stack traces / DB errors echoed to clients.** `api/pronunciation/route.ts:73-81` literally returns `{ details: error.message }`. `console.error` everywhere leaks via Vercel logs.

### MEDIUM

38. **CORS wildcard on `/api/pronunciation` without `Vary: Origin` and without `Authorization` in allowed headers.** `api/pronunciation/route.ts:86-95`.

39. **Path-style header reflection across sync endpoints.** Untrusted `Platform` header drives the response shape and the cache key (see #27).

40. **`Math.max(score, 0)` only on update, not on first-write.** `api/progress/route.ts:82,89` — negative scores accepted on first submission, clamped on later updates.

41. **Cache writes to `process.cwd()/.cache` on Vercel.** `api/sync/manifest/route.ts:87-101`. Serverless filesystem is ephemeral; the write silently no-ops, masking heavy recomputation as success.

---

## 3. Frontend / Client-Side

### CRITICAL

42. **`NEXT_PUBLIC_ELEVENLABS_API_KEY` in the bundle** (see H0-5).

43. **JWT + full user object in `localStorage`** (see #5, H0-11).

### HIGH

44. **No security headers** (see H0-10). No CSP, no `X-Frame-Options`/`frame-ancestors`, no HSTS, no `X-Content-Type-Options`, no Referrer-Policy, no Permissions-Policy. Clickjacking on auth flows is trivial.

45. **WebSocket URL from `window.location`, payloads parsed and cached without validation.** `lib/services/ContentSyncService.ts:128-130,149-156`. `JSON.parse(event.data)` → `handleContentUpdate(message.payload)` → `localStorage`. A rogue WS endpoint (or plain `ws://` MITM if site loads over `http://`) poisons client-side content cache.

46. **`SearchComponent.tsx:196` does `window.location.href = result.url`.** Today `result.url` is built from internal data; one refactor away from open-redirect. Also no `encodeURIComponent` on `lesson.id` / `vocab.shona` when building URLs (`:83, :102`).

47. **`localStorage`-as-source-of-truth across the UI.** `app/(app)/learn/page.tsx:287-290` and the four game pages directly mutate `userData.xp` in localStorage. Combined with #1 (server doesn't contradict) and #5 (token in localStorage), client state is fully attacker-tunable.

48. **Bridge `postMessage` forwards untrusted WS payloads to native iOS/Android.** `lib/services/ContentSyncService.ts:622-628, 634-639`. Compromised WS → native app payload injection.

49. **`betaIdentity` persists a plaintext password in localStorage forever.** `lib/auth.tsx:65-86`. Any XSS exfiltrates working credentials, not just a token.

50. **`validateToken` swallows non-401 failures.** `lib/auth.tsx:211-237`. 500/network errors do not log the user out. Token outage = effectively immortal session in production.

51. **`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'` fallback baked into client.** `lib/services/ContentSyncService.ts:742`. If env unset on Vercel, every visitor's browser hits localhost; mixed-content blocked under HTTPS — but the *fallback URL is in the bundle*.

### MEDIUM

52. **Voice navigation triggers DOM clicks.** `app/components/voice/VoiceNavigation.tsx:97,101,105` — `document.querySelector('[data-action=…]')?.click()` driven by voice transcript. Iframed app + parent-side voice synth = remote click trigger (depends on missing `X-Frame-Options`).

53. **Global `dispatchEvent('flashcard-practice')` bus.** `app/components/FlashcardDeck.tsx:55` + listener at `flashcards/page.tsx:154-156`. Any script can spoof. Replace with React state.

54. **Static-fetched `public/flashcards.json` spread into objects.** `app/components/FlashcardDeck.tsx:99-101,125-129`. If anything ever rewrites that file (CDN misconfig, content-sync push), arbitrary properties land in the UI.

55. **`ErrorBoundary` logs full stack + componentStack in `console.error` unconditionally.** `app/components/ErrorBoundary.tsx:28,56-66`. The `process.env.NODE_ENV === 'development'` gate only hides the UI panel; the data still hits the console in prod.

### POSITIVE — confirmed absent
- **No `dangerouslySetInnerHTML` anywhere** in `app/`, `lib/`, `hooks/`.
- No `eval()`, `new Function()`, `document.write`, `innerHTML =`.
- No `target="_blank"` (so no `noopener` regression yet).
- No 3rd-party tracking/analytics that would auto-receive localStorage tokens.

These are the only good news in the audit and they should stay that way.

---

## 4. Supply Chain & Secrets

### CRITICAL

56. **Gemini key in 13 files + a published doc** (H0-1). The key is `AIzaSyBOGN6xFt_ylRMucqVHYDhsRE5IoMJZXEo`. Even after deletion, it lives in git history (committed in `507b505`). Required:
    1. Revoke at GCP.
    2. Rotate the new key into env vars (never source).
    3. `git filter-repo --replace-text` and force-push (coordinate with team).

57. **`scripts/execute-veo-operation.ts:79` puts the key in a URL query string** — leaks via access logs, browser referrers, proxy logs.

58. **`scripts/debug-veo-operation.ts:28` logs `GEMINI_API_KEY.substring(0,20)` to stdout** — first 20 chars in CI/Vercel logs.

### HIGH

59. **No `package-lock.json` in repo + `legacy-peer-deps=true`.** `shona-learn/.npmrc:1`; lockfile deleted in commit `f1a6a15`; ignored by root `.gitignore`. Every install re-resolves the graph. Typosquat/hijack risk. No integrity pinning.

60. **`next@^14.2.3` caret.** `shona-learn/package.json:49`. Next 14.2.x has multiple CVEs (CVE-2024-34351 SSRF, CVE-2024-46982 cache poisoning, CVE-2025-29927 middleware bypass). Pin ≥14.2.30 and add `npm audit` to CI.

61. **`node-fetch@^2.6.7`** (devDep). Unmaintained; CVE-2022-0235 (Authorization/Cookie leak on redirect). Used by several committed scripts.

62. **`vercel.json:5` forces `--include=dev`.** Pulls Puppeteer (~300MB Chromium postinstall), Playwright, Jest, Vitest, ts-node, eslint into the production build environment. Supply-chain surface is the union of all of these.

63. **`tailwindcss`, `postcss`, `autoprefixer` moved to `dependencies`** (commit `d5f7014`). Build-only packages now runtime — doubles cold-start install, doubles surface.

64. **`critters@^0.0.23` (deprecated 0.0.x) enabled via `experimental.optimizeCss: true`.** `next.config.js:6`. Next now recommends `beasties`.

65. **`ws` runtime package missing from dependencies.** `app/api/sync/websocket/websocketManager.ts:1` imports `WebSocketServer` from `ws` but `package.json` only lists `@types/ws` in devDeps. The route either never executes (because `next start` won't bind another port on Vercel) or resolves a transitive `ws` of unspecified version. Either way, broken or unpinned.

66. **Self-immolation pattern: `dev:prepare`/`db:seed` will wipe production if ever invoked.** `prisma/seed.ts:31-54` calls `prisma.*.deleteMany()` on users/achievements/progress before reseeding the test user. `vercel-build` does *not* call seed today, but the script is one line away and the misnamed `dev:prepare` is in `package.json`. One hook misconfig = total data loss.

67. **Migration baseline squashed; `migration_lock.toml` was *hand-edited* from sqlite to postgresql.** Commit `ce88d1b` titled exactly that. Single migration encodes the entire schema. Drift detection is impossible; rollback is impossible; a half-applied future migration leaves the DB in an inconsistent state with `_prisma_migrations` partially populated.

68. **`shona-ios-app.tar.gz` (60 KB) committed at repo root.** `.gitignore` now excludes `*.tar.gz` but this file was added first and remains tracked. Inspect contents for embedded credentials/build artifacts.

69. **`cursor agent logs/` (16 markdown files) committed.** Includes real credential snippets: `cursor_review_and_debug_app_for_user_te.md:855` shows `DATABASE_URL="file:./dev.db"`; `cursor_implement_module_request.md:3758` contains `password: 'testpass123'`. `.vercelignore` excludes them from deploys, but they are in git — *public if the repo is public*.

70. **17 MB PDF (`153747653-Learn-Shona-FSI-Basic-Course.pdf`) committed.** Tracked before `.gitignore` rule was added. Repo bloat + potential PDF metadata leak.

71. **`.vercelignore` patterns miss several ElevenLabs test scripts.** Patterns are `test-*.js` / `*-test.js`; files like `improve-elevenlabs-pronunciation.js`, `natural-elevenlabs-pronunciation.js`, `test-elevenlabs-real.js` are bundled into the deployment.

### MEDIUM

72. **`dotenv` in runtime `dependencies`.** `package.json:48`. Next.js loads env on its own; runtime `dotenv` widens the bundle.

73. **`bcryptjs` vs native `bcrypt`.** Pure-JS, ~5× slower, no native binding. Marginal timing-attack surface and the CPU-DoS knob noted in #9.

74. **ESLint config is bare.** `eslint.config.mjs:12-14` extends only `next/core-web-vitals` + `next/typescript`. No `eslint-plugin-security`, no `no-explicit-any`, no secret scanning. The Gemini key would never be flagged by lint.

75. **`tsconfig.json: allowJs: true`.** Combined with 27 untyped root-level JS files plus mixed `.ts/.js/.mjs` in `scripts/`, TS coverage bleeds.

76. **`RUN_ON_MAC.sh:16` does `chmod +x copy-content-resources.sh`** on a tracked shell script. If that script were ever modified by a malicious commit, it auto-executes for Mac contributors. Trust-on-first-clone footgun.

---

## 5. Database & Schema

### CRITICAL

77. **Hand-rolled "baseline" migration after sqlite→postgres swap** (see #67).

78. **Zero non-unique indices on foreign keys.** Of the 18 indices in the baseline migration, *all* are unique constraints. No covering index on `Flashcard.lessonId`, `Flashcard.userId` (non-composite), `UserProgress.lessonId`, `SRSProgress.flashcardId`, `Exercise.lessonId`, `Unit.stageId`, `Unit.lessonId`, `UserUnitProgress.unitId`, `ReviewSchedule.nextReviewAt`, `UserCheckpointAttempt.checkpointId`, `UserAchievement.achievementId`. SRS "what's due now" is a sequential scan. Will not scale past a few thousand rows.

### HIGH

79. **Inconsistent `ON DELETE` policies.** `User → Flashcard, IntrinsicMotivation, LearningGoal, NotificationPreference, QuestProgress, SocialConnection, SRSProgress, UserProgress` use **RESTRICT**. `User → ReviewSchedule, UserLearningPath, UserUnitProgress, UserCheckpointAttempt, UserAchievement` use **CASCADE**. Deleting any user with progress data **fails with FK violation** under the RESTRICT side. There is no GDPR deletion path.

80. **`User.password` (not `passwordHash`) typed `String`.** `schema.prisma:16`. The column stores a bcrypt hash but the name lies — anyone wiring an admin tool, backup pipeline, or Prisma Studio will treat it as a literal password column. No DB-level encryption.

81. **Email uniqueness is case-sensitive; no normalization.** `schema.prisma:15`. `Test@x.com` and `test@x.com` are distinct rows. Combined with #6 (sanitizer mangling) → duplicate-account vector.

### MEDIUM

82. **14 JSON-as-`String` columns** (`Lesson.learningObjectives`, `Lesson.discoveryElements`, `Quest.collaborativeElements`, `Quest.intrinsicRewards`, `Exercise.options`, `Exercise.intrinsicFeedback`, `VocabularyItem.examples`, `Flashcard.tags`, `NotificationPreference.enabledDays/enabledTypes/deviceTokens`, `NotificationLog.data`, `Checkpoint.questionData`, `UserCheckpointAttempt.answersJson`). Postgres has `JSONB`. Using `String` discards type safety, indexability, partial updates, and validation. Every read must `JSON.parse` + try/catch — and several do not (see #36).

83. **`NotificationLog.userId` is `String?` with no FK relation.** `schema.prisma:223`. Orphan rows guaranteed.

84. **`User.lastActive` / `User.createdAt` have no indices** despite being used for streaks/leaderboards.

85. **`Flashcard.difficulty: Float` and `SRSProgress.easeFactor: Float` lack CHECK constraints.** App expects 0–1 / 1.3–2.5; DB will store `-999`.

---

## 6. Code Quality & Architecture

### CRITICAL

86. **Documentation rot — 67 root-level `.md` "report/summary" files.** `ls shona-learn/*.md | wc -l` → 67. Three "Comprehensive App Reviews" (`COMPREHENSIVE_APP_REVIEW.md`, `_2024.md`, `_2025.md`). Five "Implementation Complete" files. Three "Mudzidzisi AI Success" reports. Filenames like `100_QUALITY_ACHIEVEMENT_SUMMARY.md`, `PERFECT_10_NDAU_ENHANCEMENT_SUMMARY.md`, `REVOLUTIONARY_INTEGRATION_SHOWCASE.md` read as LLM self-congratulation. `lesson-plan-guide.md` is 1 byte. This is signal: the project has been driven by AI scaffolding without a human deletion pass.

87. **The beta gate is "removed" but the cruft remains.** Commit `398ea57` deleted login/register/logout pages but kept: `lib/beta-access.ts` (the kill switch), 41 conditional references to `BETA_OPEN_ACCESS`, a hard-coded `BETA_GUEST_USER` (`lib/auth.tsx:29-37`), a `Math.random`-based identity generator that calls `/api/auth/register` per visitor (`:65-137`), and the no-op `ProtectedRoute`. Flipping `BETA_OPEN_ACCESS=false` will *break the app* (`auth-server.ts:8-10` throws at boot, dead branches at `auth.tsx:140-167`, `ProtectedRoute` still passes through) — not re-enable auth.

### HIGH

88. **243 occurrences of `: any` / `as any` in `app/` + `lib/`.** Worst offender: `lib/error-handling.ts`. Every handler signature is `(error: any)`.

89. **`useEffect([isLoading])` re-entrancy** (see #23).

90. **`useCachedData` hook stale-closure deps.** `lib/cache.ts:94-119` — `useEffect([key])` with `fetcher`/`ttl` not in deps. React's exhaustive-deps lint would catch it; not enforced.

91. **`CacheManager` `setInterval` never cleared.** `lib/cache.ts:7-16` — 60s interval persists for the lambda lifetime; no `destroy()` call site.

92. **`npm test` runs a Puppeteer smoke script against `localhost:3004`, not unit tests.** `package.json:22` → `node __tests__/comprehensive-app-test.js`. 269-line Puppeteer driver. Hard-codes `test@example.com / password123` (lines 58-59). Asserts nav labels (`'Quests'`, `'Pronunciation Test'`, …) that no longer exist after the beta-gate removal. CI will silently green-fail.

93. **Three test runners coexist, none actually run together.** Vitest, Jest, Playwright + 3 custom node scripts. `jest.config.js` has a typo: `moduleNameMapping` (should be `moduleNameMapper`) — alias broken. No `vitest.config.ts` or `playwright.config.ts`. The only real unit tests with assertions are the three pure-function files (`lib/checkpoints/score.test.ts`, `lib/spaced-repetition/sm2.test.ts`, `lib/learning-path/prerequisites.test.ts`). Coverage on API routes: **zero**. Coverage on components: **zero**.

94. **Real auth tests exist but aren't wired into CI.** `__tests__/auth.test.ts` runs JWT logic against fully-mocked modules; never invoked by `npm test`.

95. **45 of 57 `.tsx` files under `app/` are `'use client'` (79%).** Defeats App Router. The marketing page is the only meaningful server component.

96. **`framer-motion` imported in 15+ client components** alongside `AnimatePresence`. `optimizePackageImports` helps but doesn't fully tree-shake.

97. **`recharts` declared in `dependencies` but never imported.** `grep -rn "recharts" lib app` → 0. ~100 KB of dead library shipped.

98. **Dead-code services (~80 KB on disk):** `lib/services/AdvancedCacheService.ts` (23 KB) — only `ContentSyncTestSuite` imports it. `lib/services/ConflictResolutionService.ts` (22 KB) — same. `lib/testing/ContentSyncTestSuite.ts` (33 KB) — only `scripts/run-sync-tests.ts`. `app/components/ZimbabweanThemeDemo.tsx` (20 KB) — never imported. `lib/autonomous-generation-agent.ts` (16 KB), `lib/asset-generation-pipeline.ts` (15 KB) — no callers in `app/`.

### MEDIUM

99. **81 `console.log` and 122 `console.error` calls in `lib/app/`.** No central logger, no Sentry, no log redaction. `lib/autonomous-generation-agent.ts:111-198` is emoji-heavy debug spam.

100. **27+ JS/TS scripts at repo root** (`analyze-native-pronunciation.js`, `check-content.js`, `comprehensive-app-review.js`, `debug-pages.js`, `fix-eslint-errors.js`, etc.). No organization, no documentation. Six `fix-*` scripts — band-aid culture.

101. **Auto-save scripts referenced in `package.json:35-38` resolve to non-existent paths (`../scripts/…`).** Broken references that would run forever if found.

102. **`archive/` directory contains 1.2 MB of "vocabulary master" duplicates** (`_complete`, `_comprehensive`, `_simplified`, `_merged`, `_enhanced`).

103. **Lighthouse JSON reports committed (`lighthouse-mobile.json` 595 KB, `lighthouse-report.json` 622 KB)** plus a dozen `*-report.json` outputs.

104. **`ErrorBoundary` only wraps 5 places**; none of the game pages (`word-builder` 30 KB, `cultural-quiz` 23 KB, `story-complete` 22 KB, `memory-match` 14 KB) have boundaries. A single render crash blanks the app.

105. **`featureFlags.ts` is a 7-line file with one constant (`AUDIO_ENABLED=false`) never imported.** Voice features run regardless.

106. **`lib/cache.ts:140` imports React at the bottom of the file.** TS hoists, so it compiles — but it's a signal of careless edits.

107. **`logout()` clears localStorage but doesn't invalidate the server-side JWT** (see #12).

### LOW

108. **Engine pin `"node": "22.x"`** vs Vercel's 20.x LTS default. Operational mismatch.

109. **Marketing landing `text-[#78716c]` on `bg-[#fffdf7]` is 4.16:1** — borderline AA, fails AAA for body text. `text-[#fce300]` on cream likely <3:1.

110. **No `<a href="#main">` skip link, no `lang="sn"` annotations** on Shona spans — screen readers will mispronounce.

111. **`Subresource Integrity` not used.** No external scripts today, preventive note.

---

## 7. WebSocket / Sync Subsystem

112. **No auth, no origin filter, no `verifyClient`** (`websocketManager.ts:52-67`).
113. **`maxPayload: 1024 * 1024` per message** — 1 MB × N connections of attacker memory pressure.
114. **`client.subscriptions.add(message.contentType)` unbounded** (`websocketManager.ts:171-183`). Spamming distinct `contentType` strings grows the Set without limit.
115. **Broadcast retains `setTimeout` closures for up to 5s** (`websocketUtils.ts:33-39`). Loop the broadcast endpoint → thousands of timers in flight.
116. **Log injection via `console.log` of platform/version from the query string** (`websocketManager.ts:74`). Newline injection forges log entries.
117. **WS server can't run on Vercel** (no long-lived TCP listeners). Dead code in production target; live and dangerous if anyone self-hosts.

---

## 8. Severity Roll-Up

| Theme | CRIT | HIGH | MED | LOW |
|---|---:|---:|---:|---:|
| Auth & Authz | 6 | 9 | 8 | — |
| API surface | 4 | 8 | 4 | — |
| Frontend/XSS surface | 2 | 7 | 4 | — |
| Supply chain & secrets | 3 | 11 | 5 | — |
| Database/schema | 1 | 3 | 4 | — |
| Code/architecture | 2 | 11 | 9 | 4 |
| WebSocket | — | 1 | 5 | — |
| **Total (deduped across agents)** | **18** | **50** | **39** | **4** |

Cross-validation: four independent agents arrived at overlapping CRITICAL findings (Gemini key, JWT fallback, BETA_OPEN_ACCESS, ElevenLabs key in bundle, register-as-takeover, password sanitizer, localStorage JWT). The convergence is the strongest possible signal that these are real and exploitable.

---

## 9. Remediation order (priority)

1. **Right now (today, before another deploy):**
   - Revoke the Gemini key at GCP; rotate; `git filter-repo` the value out of history.
   - Patch `app/api/auth/register/route.ts:37-55` to return 409 on duplicate email, never a token.
   - Remove the hard-coded fallback string in `lib/auth-server.ts:6`; refuse to boot without `JWT_SECRET`.
   - Proxy ElevenLabs through a server route; remove every `NEXT_PUBLIC_ELEVENLABS_*` reference; rotate the key.
   - Remove `Cache-Control: public, max-age=3600` from `/api/:path*` in `next.config.js`.

2. **This week:**
   - Stop `sanitizeInput`-ing the password on login. Validate via Zod; pass raw to bcrypt.
   - Add `verifyAuth` (with no beta fallback) to `/api/flashcards`, `/api/pronunciation`, `/api/sync/*`, `/api/games`, `/api/progress`, `/api/reviews/*`. Stop trusting `userId` from body/query.
   - Decide: kill `BETA_OPEN_ACCESS` entirely (replace with a real `Anonymous` user model + per-session UUID), or document it and gate by env var with explicit production guard. Pick a lane.
   - Move JWT into an `HttpOnly Secure SameSite=Lax` cookie set by `/api/auth/login`. Have `verifyAuth` read the cookie.
   - Add security headers (CSP, HSTS, XFO=DENY, XCTO=nosniff, Referrer-Policy=strict-origin-when-cross-origin) via `next.config.js`.
   - Add per-IP + per-user rate limiting (Upstash) on auth + AI + write endpoints. Add a dummy bcrypt round on missing-user login to neutralize timing enumeration.
   - Consolidate Prisma to the singleton in `lib/prisma.ts`. Delete every `new PrismaClient()` outside it.
   - Re-add `package-lock.json`. Remove `legacy-peer-deps=true`. Remove `--include=dev` from `vercel.json`. Move build-time deps back to `devDependencies`. Pin `next` to ≥14.2.30.

3. **Next sprint:**
   - Clamp/Zod-validate every `parseInt`, every game `score`, every SRS field.
   - Add CHECK constraints to `Flashcard.difficulty`, `SRSProgress.easeFactor`. Migrate JSON-as-`String` columns to `JSONB`. Add non-unique indices on FK columns.
   - Reconcile `ON DELETE` semantics or implement a soft-delete model.
   - Delete the `cursor agent logs/` directory; rotate any credentials they touched.
   - Delete `shona-ios-app.tar.gz`, the 17 MB PDF, and `lighthouse-*.json` from git; move them to releases or external storage.
   - Wire `__tests__/auth.test.ts` (and the pure-function tests) into a real CI step. Pick **one** test runner (Vitest) and remove Jest/Puppeteer driver scripts.
   - Delete unused services (#98), `recharts` (#97), `featureFlags.ts` (#105), `ZimbabweanThemeDemo` (#98), the no-op `ProtectedRoute`, dead `compressContent`.
   - Collapse the 67-file documentation graveyard into one `docs/` directory with a single living `ARCHITECTURE.md`. Stop letting agents append victory-lap markdown.

4. **Architectural:**
   - Pick a lane between server components and client components. The current 79% `'use client'` defeats App Router.
   - Decide on a session story: real cookie-based sessions, or anonymous-by-design with a per-device UUID and zero user table writes for guests. The hybrid is the worst of both worlds.
   - Pick **one** TTS provider integration pattern: server-proxied with key in env, audio cached to disk by content hash. The current pattern (`NEXT_PUBLIC` keys, per-page-load API calls) burns money and leaks secrets.
   - Re-baseline Prisma migrations on a clean production snapshot, with a documented rollback procedure.

---

## 10. What the agents did *not* find (good news, kept honest)

- No `dangerouslySetInnerHTML`, no `eval`, no `Function()`, no `document.write`, no `innerHTML =` writes.
- No SQL injection via raw Prisma queries (no `$queryRawUnsafe` usage found).
- No `target="_blank"` without `rel` — because there are no `target="_blank"` anchors at all.
- No 3rd-party tracking/analytics that would auto-receive `localStorage`.
- Pure-function unit tests for SRS, checkpoint scoring, and prerequisites are correct and well-shaped.
- Zod schemas exist for several endpoints (login, register, learning-path start). The problem is what happens *after* validation passes — not the validation itself.

These are worth preserving. The fix for everything else above does not need to start by re-litigating these.

---

## 11. Final adversarial assessment

The kindest reading of this codebase is "AI-driven beta that was never reviewed by a human security engineer." The unkindest reading is "an account-takeover-as-a-service deployment with three different ways to steal API keys and one way to wipe the database." Both readings end in the same place:

> **Do not promote this past beta. Do not give it real PII. Do not let it accept payment. Rotate the leaked Gemini and ElevenLabs keys now, then triage the CRITICAL findings before another deploy.**

The single most valuable change is *philosophical*: stop layering anonymous-fallback hacks on top of a real auth system. Either implement real auth and gate it, or commit fully to anonymous-with-per-device-UUID and delete the JWT/User-row machinery entirely. The current hybrid creates every category of vulnerability above by design.

— end of audit

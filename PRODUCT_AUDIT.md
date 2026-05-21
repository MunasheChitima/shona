# Shona App — Product, UX, Content & Pedagogy Audit (Pass 2)

**Companion to** `SECURITY_AUDIT.md` (pass 1, security + code quality).
**Method:** Four parallel hostile agents — (1) UX & flows, (2) game design, (3) content quality & pedagogy, (4) native iOS/watchOS/Android — plus a personal SRS / learning-science review.
**Scope:** What the *user* experiences and what the app actually *teaches*. Findings are deduplicated across agents and cross-referenced against pass-1 where overlap exists.

---

## 0. The single thing that matters

> **This is a language-learning app where audio doesn't work and the pronunciation AI is a placebo.**

Two findings, both verified in code, make most of the rest cosmetic:

1. **Audio is broken end-to-end.** `app/components/FlashcardDeck.tsx:226` plays from `/content/audio/${file}`, which resolves to `public/content/audio/` — that directory contains only `.gitkeep`. The 134 real `.mp3` files live in `content/audio/` (outside `public/`), so Next.js never serves them. The fallback (`lib/services/AudioService.ts:101-125`) hands the Shona text to `speechSynthesis` with `utterance.lang = 'en-US'`. **Every audio play attempt either 404s or pronounces Shona words with American English phonology.** In a tonal Bantu language this is fatal. `AudioService.ts:9` even has a comment admitting "the repo often ships without mp3 assets under `public/content/audio/`" — the developer knew.

2. **"Mudzidzisi AI" pronunciation analysis never reads the audio.** `lib/pronunciation-analysis.ts:383-387` — `readAudioFile()` returns a hard-coded `{ inlineData: { data: "placeholder", mimeType: "audio/wav" } }`. The audio buffer that `app/api/pronunciation/route.ts:44` writes to `/tmp/pronunciation_*.wav` is never read back. Gemini receives the literal string `"placeholder"` and hallucinates feedback codes like `IMPLOSIVE_TOO_PLOSIVE`, `BREATHY_VOICE_WEAK`. **Every pronunciation score the app shows is fictional.** The `MUDZIDZISI_AI_SUCCESS_REPORT.md` and `MUDZIDZISI_AI_IMPLEMENTATION.md` files describe this as a working acoustic analysis system. They are wrong.

Fix these two and the app starts to be a language app. Don't fix these and everything else below is rearranging deck chairs.

---

## 1. UX & First-Run Flow

### BLOCKERS (rage-quit material)

1. **No login UI exists, but every protected page redirects to `/login`.** No `app/login/page.tsx` anywhere. References at `app/(app)/games/page.tsx:17`, `quests/page.tsx:20`, `flashcards/page.tsx:69,72`, `lib/auth.tsx:227`, plus every game's gate. With `BETA_OPEN_ACCESS=true` this is dormant; flip it off (which a developer will eventually do thinking it "re-enables auth") and the entire app 404s on every redirect.

2. **The OnboardingFlow component is built and never mounted.** `app/components/OnboardingFlow.tsx` — 244 lines, complete 5-step intro, "Get Started" CTA. Referenced only by `LazyComponents.tsx:6`; no page renders `LazyOnboardingFlow`. First-time users see "Mhoro, shamwari!" on `/learn` with zero explanation of hearts, XP, levels, paths, quests, or what any button does.

3. **The marketing landing has no Sign-in or Sign-up link.** `app/(marketing)/page.tsx:88-110`. Returning users have nowhere to log in. The site advertises "thousands of learners" but there is no way to become one.

4. **The marketing site sells voice features that `AUDIO_ENABLED=false` has disabled.** `(marketing)/page.tsx:29-35,187-198` shows a "Rhythm and tone tracker" with a "75% Active" gradient bar and the line *"You are sounding more natural every session."* `lib/featureFlags.ts:7` is hard-coded `false`. `ExerciseModal.tsx:300` explicitly excludes voice exercises. The marquee value prop on the home page is non-functional on launch.

5. **The Games hub marks 4 of 5 tiles "Coming Soon" — but all four routes exist and work.** `app/(app)/games/page.tsx:55,67,79,91`. Memory Match is the only one not flagged. New users click "Explore cultural games" from the landing, land on a graveyard of locked tiles, and find one playable game. Bait-and-switch.

6. **The "Begin your Shona journey" CTA opens a demographic chooser, not a lesson.** `learn/page.tsx:357-362` mounts `<PathVariantOnboarding>` with three identities (Heritage / New / With partner) and a single small "Skip" link. Two competing focal points the first second: the "Learn Shona" H1 and the modal asking you to label yourself.

7. **No home / dashboard. The "Home" tab returns to the marketing site.** `Navigation.tsx:12` — clicking Home from inside the app dumps you back to the giant "Begin your Shona journey" landing. No "Continue where you left off", no streak, no XP, no due reviews.

### HIGH

8. **The Continue button lies.** `LessonRow.tsx:50-52` shows `score > 0 ? 'Continue' : 'Start'` — but `isNext` lessons are always uncompleted, so `score` is a *previous failed attempt*. The modal at `ExerciseModal.tsx:43-55` always restarts from index 0 — Continue = restart.

9. **Hearts UI is purely decorative.** `ExerciseModal.tsx:26,110` decrements hearts on wrong answers but there is no end-state at 0; you keep going. Identical pattern in Memory Match (`memory-match/page.tsx:157`: `if (hearts > 1)` stops decrementing — so hearts asymptote to 1 and never end the game). Users recognize the Duolingo metaphor and the metaphor is broken.

10. **Closing the exercise modal kills the session silently.** `ExerciseModal.tsx:36-41,157` — backdrop click or ESC closes; `currentIndex` is not persisted; `fetchExercises` always restarts at 0. Fat-finger the backdrop at question 4/5 → you lose everything.

11. **The Lesson Complete celebration has no "Next lesson →".** `CelebrationModal.tsx:201-210` — "Continue Learning" just calls `onClose`, dropping the user back on the lesson list with no auto-scroll and no prompt. After the confetti, dead air.

12. **`/quests` is orphaned.** Page exists (268 lines, quest narratives, "Begin Quest" buttons) but nothing in Navigation, the learn page, or the landing links to it. Reachable only by URL. Meanwhile the marketing site advertises "real-life phrase missions" — that's quests.

13. **Quest level calc means beta testers see nothing playable.** `quests/page.tsx:25-33` — `xp:0 → level:1 → filter(q.requiredLevel < 1) → []`. New users land on `/quests` and every quest is locked.

14. **`/profile` is permanently broken if `user.name` is missing.** `profile/page.tsx:215-217` returns a red error if the user object is empty `{}` — which happens whenever localStorage parsing returns an empty object. No retry, no fix-it CTA.

15. **`PathVariantOnboarding` promises a "restart from your profile later" UI that doesn't exist.** `PathVariantOnboarding.tsx:33-35` vs `profile/page.tsx`. No restart-path control anywhere. The promise is a lie at point of decision.

16. **Lesson counts disagree across the app.** Profile shows 60 (`profile/page.tsx:61`), Quests shows 60 (`quests/page.tsx:173`), Onboarding shows 79 (`OnboardingFlow.tsx:35`). Three hard-coded numbers, none derived from the actual JSON.

17. **Three pronunciation-adjacent nav tabs back to back, all confusingly labeled.** `Navigation.tsx:14-16` — `Sounds` (`/sound-guide`), `Drills` (`/practice/sounds`), `Speak` (`/pronunciation`). A new user cannot tell theory from practice from microphone.

18. **Six racing useEffects on `/flashcards`.** `flashcards/page.tsx:53,60,83,104,144,153`. Two set `selectedCategory` from `searchParams`; gating logic may then `router.replace('/flashcards', { scroll: false })` if you deep-link to a locked category. No toast, no message — looks like a glitch.

19. **Flashcards are 13 padlocks for a new user.** `flashcards/page.tsx:128-133`. Every deck is locked behind a lesson — no "free starter deck" — yet the marketing page implies free flashcards.

### MEDIUM

20. **Quest details modal renders unmapped IDs.** `quests/page.tsx:237-241` strips `lesson-` prefix and shows `Lesson greetings-basics`. Looks like a placeholder leaked.

21. **Achievements never fire client-side.** `profile/page.tsx:67-108`. List is computed once on mount; no toast, no celebration when you cross a streak — you have to manually open Profile to see them.

22. **Two XP economies coexist and don't add up.** Lessons increment `user.xp`. Games write to `gameProgress` localStorage. `games/page.tsx:26-29` reads it, but `lib/auth.tsx` and `profile/page.tsx` never merge them. Playing 50 games adds 0 to your level.

23. **`Made with love for Shona language preservation` footer on every app page clashes with the premium "Crafted for momentum, not pressure." landing.** Two voices, two brands.

24. **Sticky double-nav stacks on transitions.** Marketing has a sticky header (`(marketing)/page.tsx:88`), app layout has its own sticky `Navigation.tsx:24`. Full chrome swap when navigating from `/` to `/learn`.

25. **The 60–69% celebration message reads as condescending.** `CelebrationModal.tsx:33-39` — "Good effort! You're making progress!" Users passed a quiz; they don't need grade-school encouragement.

26. **`lesson.exercises?.length || 5` falls back to claiming 5 exercises everywhere.** `LessonCard.tsx:130-131`. If exercises haven't loaded, every card lies about its size.

(46 UX findings total in the agent report; the rest are paper cuts.)

---

## 2. Games

> Premise of the section: *would a user play any of these twice?* Mostly no.

### HIGH

27. **Memory Match is the same game every time.** `memory-match/page.tsx:93` — `vocabularyPairs.slice(0, 6)`. Always indices 0–5. The other 6 hard-coded pairs are never shown.

28. **Cultural Quiz has only 12 questions total.** `cultural-quiz/page.tsx:57-177`. Draws 10 per session. ~2 plays exhausts the bank.

29. **Story Complete has 2 stories total.** `story-complete/page.tsx:46-237`. Memorization after one play-through.

30. **Word Builder teaches incorrect Shona morphology.** `word-builder/page.tsx:187-203` — challenge `w8` (`vanowanikwa`) is segmented `va + no + wan + ik + wa` and double-marks the passive with both `ik` *and* `wa`. The actual morpheme is `-ikw-` or `-w-`, not both. Learners taught this will produce ungrammatical Shona. Challenge `w7` (`ndichakuvona`) uses dialectal `vona` instead of standard `ona`. Same chip `ka` is used as past tense in `w2` (`vakatenga`) and conditional in `w6` (`ndikakuona`) — presented as the same morpheme, different meanings expected.

31. **Story Complete has an English word as the correct answer to a Shona blank.** `story-complete/page.tsx:85` — blank 4 of the first story has correct answer `"tea"` (the English word) instead of `tii`. Sentence at `:50` is also broken Shona: `"Ndinoshambidzwa _2_"` with `ndichizorora` as the "correct" fill doesn't grammatically follow.

32. **`/api/games` accepts client-supplied `score`.** `app/api/games/route.ts:14-34`. POST `{gameId:'word-builder', score:9999, difficulty:'Hard'}` farms XP without ever playing. No rate limit, no per-day cap, no signed session. (Also in pass-1 security audit.)

33. **No audio in any game.** Zero `new Audio()` or TTS call across the four game pages. The 2 audio-systems in the repo are unused at game time. Fatal in a tonal language.

34. **No game is SRS-aware.** Every game uses a hard-coded in-file array; no game imports the review queue. The whole *point* of game modes in a learning app — surface what you're weak at — is missing.

35. **Cultural Quiz celebrates losses.** `cultural-quiz:288` triggers `setShowCelebration(true)` when the player loses all lives. Celebrating failure with confetti is a weird signal.

### MEDIUM

36. **No game has adaptive difficulty.** Each content item has a `difficulty` field; selection is always `sort(() => Math.random() - 0.5)`. The Easy/Medium/Hard tags are cosmetic.

37. **Story Complete and Word Builder have no fail state.** Wrong answers don't end the round; you proceed regardless.

38. **Timers are too generous.** Memory Match 2 min for 6 pairs. Story 5 min. Word Builder 4 min for 6. Duolingo Match Madness is 60 seconds.

39. **`gameProgress` is localStorage-only.** No leaderboard, no daily challenge, no streak hook. Compare Duolingo Friends Quests, Drops session screens.

40. **Word Builder mutates state objects in place.** `word-builder/page.tsx:265-267,279-281,289,327` mutates `currentChallenge.morphemes` directly — race-y on re-renders; after `nextChallenge` the previous round's "used" flags can persist.

41. **Memory Match relies on stale closures.** `memory-match/page.tsx:137` reads from outer `cards` after a `setCards` call — works today, fragile pattern.

42. **Cultural Quiz submits score one question stale.** `cultural-quiz:219-223` calls `endGame()` from a `useEffect` watching `lives`/`questionsAnswered`; reads `quizState.correctAnswers` before the latest update has flushed.

43. **Word Builder copy says "Drop morphemes here" but interaction is tap.** `word-builder:542`. Misleading affordance.

(30 game findings total.)

**Comparison vs industry:** prototype quality. The "Rhythm Tones" game — the only one that would actually teach what makes Shona *Shona* — is listed on the index but the directory doesn't exist.

---

## 3. Content Quality & Pedagogy

### CRITICAL

44. **Audio broken end-to-end** (see §0).

45. **Pronunciation AI is fake** (see §0).

46. **Templated nonsense in the vocabulary master.** `content/vocabulary_master_improved.json` — 184 entries follow `"The <english noun> is good"` and 185 follow `"I want <english noun>"`, producing examples like:
    - `"Ndinoda hongu"` → `"I want yes"`
    - `"kufa yakanaka"` → `"The to die is good"`
    - `"kuberekerwa yakanaka"` → `"The to be born is good"`
    - `"kubata mapoka yakanaka"` → `"The to attend meetings is good"`

    350/476 example sentences (73%) carry `"context": "Basic sentence structure"`. The Shona is grammatically wrong too: `yakanaka` is a class-9 adjective form that doesn't agree with interjections or infinitives. This file feeds `content/unified/` and `content/integrated/` which feed the iOS/Android JSONs.

47. **`prisma/seed.ts` contains hallucinated Shona distractors.** `seed.ts:683` lists `"serebun"` (not a word in Shona) as an MCQ distractor for "seven". `seed.ts:692` lists `"naira"` (the Nigerian currency) and `"umi"` (not Shona) as distractors for "ten". Looks like the author asked an LLM for distractors and got hallucinated words.

48. **The seeded DB curriculum and the served lessons are different curricula.** `prisma/seed.ts:253-699` hard-codes 15 lessons (`lesson-1` … `lesson-numbers-1-10`). `/api/lessons` reads the 60-lesson `content/lessons_consolidated.json`. The UI shows one set; the DB tracks progress on another. Same ID can mean different lessons (DB's `lesson-11` = "Food Vocabulary"; JSON's `lesson-11` = a Daily Life topic).

### HIGH

49. **Below A1 vocabulary floor.** `lessons_consolidated.json` has 60 lessons but only **353 unique Shona headwords**. CEFR A1 needs ~500 active words. The 480-item `vocabulary_master_improved.json` is poisoned by #46 so it can't backfill the gap.

50. **Almost no exercise variety.** 308 exercises across 60 lessons: 80.5% multiple-choice, 19.5% pronunciation, **zero translation, zero fill-blank, zero matching, zero listening, zero typing**. Average 5.13 exercises/lesson. The schemas for richer types exist (`lib/exercise-types/ExerciseTypes.ts`) and are unused.

51. **104 of 308 exercises are stock-template "supplementary".** IDs match `*-sup-a` / `*-sup-b`. 144 exercises share identical explanation text. Eight exercises literally use the placeholder question *"You want to connect what you learned. Which phrase links 'X' to a full reply?"* — LLM filler pass.

52. **Audio coverage is 22% of what the app references** (and 0% from the path the UI actually serves):
    - `flashcards.json` references 307 audio files; 68 (22%) exist on disk; **0 are served**.
    - `audio_audit_report.json` itself logs `"missing": 190, "found": 0`.
    - Color words, family words, and numbers referenced by lessons 3/4/5/9 have no audio file at all, anywhere.

53. **`tonePattern` is empty on 96% of vocab.** `lessons_consolidated.json` — 13/369 items have a tone marking; 356 do not. Tone is the defining feature of Shona. `culturalContext` is empty on 100% of items (369/369).

54. **`lesson_progression.json` has an empty `"advanced": []` slot** while `lessons_consolidated.json` declares Units 11-13 as advanced. The files contradict each other; nothing in the codebase knows lessons 41-52 are advanced.

55. **Unit progression is a single linear chain.** `prisma/seed.ts:872-876` creates one global prerequisite chain across all 19 units. A learner who knows numbers cannot test out of Unit 3; one failed checkpoint blocks the rest of the curriculum.

56. **`mudzidzisi-ai.ts` calls itself "AI" but is a rule-based template engine.** `lib/mudzidzisi-ai.ts:310-692` — 500-line class that tokenizes phonemes and emits prompt strings. No model calls. The `MUDZIDZISI_AI_*` docs describe an autonomous system; the implementation is `switch` statements.

### MEDIUM

57. **20 overlapping lesson/vocab JSONs in `content/`.** `lessons.json` (60), `lessons_harmonized.json` (38), `lessons_updated_harmonized.json` (41), `lessons_enhanced.json` (52), `lessons_enhanced_harmonized.json` (2), `lessons_consolidated.json` (60), `lessons_comprehensive.json` (79). 62/138 overlapping shona words have different English between `flashcards.json` and `vocabulary_master_improved.json`. 66/150 overlapping words disagree between `lessons_comprehensive.json` and `lessons_consolidated.json`. Same word taught one meaning and quizzed on another.

58. **77% of lessons share identical boilerplate learning objectives.** `lessons_consolidated.json` — 46/60 lessons list `["Learn 6 new Shona words","Practice pronunciation with audio","Complete exercises to test understanding"]`. 87% have one-element `discoveryElements` arrays of the form `"Explore vocabulary related to: <title>"`.

59. **Unmatched parentheses in english phrases.** `lessons_consolidated.json:361` — `"hello (formal/plural"`. `lesson-8 / ex-8-2` — `"you (informal"`. Will render with stray punctuation.

60. **The unified/integrated content pipelines produced empty output.** `content/unified/lessons_unified.json` → `"totalLessons": 0, "lessons": []`. `content/integrated/lessons_integrated.json` → 11 lines, empty. Yet `unified/integration_report.md` reports success.

61. **`audioText`/`pronunciation` uses English mnemonics, not IPA.** Throughout seed.ts and lessons JSON: `"Bah-bah"`, `"Moo-koh-mah"`, `"mm-HO-ro"`. The `phonetic` field exists in the schema for IPA; it's empty for 100% of vocab. A learner reading "Bah-bah" pronounces *baba* with American /æ/.

62. **8/60 pronunciation exercises have no `audioFile` set.** Even with the audio bug fixed, these have nothing to play.

63. **Quest namespace disagrees between seed and runtime.** `prisma/seed.ts:106-240` creates `quest-1`…`quest-7`. `lib/quests.ts:18-` uses slugs (`quest-first-words`, `quest-people`). `lessons_consolidated.json` references the slugs. The DB and the runtime quest model are different systems.

64. **Lesson `culturalNotes` are generic platitudes** while the rich `content/cultural_notes.json` (unhu/ubuntu, totem system, ancestor veneration) is orphaned. No lesson loads from the good file.

65. **Multiple quest manifests, none canonical.** `quests_enhanced.json` (8), `quests_harmonized.json` (22), `quests_updated_harmonized.json` (24), `lib/quests.ts` (hard-coded). No `/api/quests/*` route exists.

66. **`ndau-dialect-lessons.js`** (894 lines, 5 lessons) is not referenced anywhere. Consolidated curriculum mentions Ndau zero times.

### LOW

67. **52/60 lessons have exactly 5 exercises, 8 have 6.** No lesson exceeds 6. At ~10 minute estimated duration, that's ~100 seconds per attempt to consolidate 6 new words.

68. **Audio file naming chaos.** `n'anga.mp3` and `munin'ina.mp3` (apostrophes are URL-encoding traps). Manifest lists `Mwari.mp3` (capital M) but disk has `mwari.mp3`. Case-sensitive 404.

69. **Three 1-byte files at repo root.** `lesson-plan-guide.md`, `extended-lesson-plans.js`, `integrate-all-lessons.js` — empty stubs.

70. **60+ self-congratulatory markdown reports.** `FINAL_INTEGRATION_SUCCESS.md`, `100_QUALITY_ACHIEVEMENT_SUMMARY.md`, `MUDZIDZISI_AI_SUCCESS_REPORT.md`, `PRONUNCIATION_CONTENT_SUCCESS.md`, etc. None describe the broken audio path or the placebo AI. Pass-1 already flagged this as documentation rot; the content audit confirms it actively obscures real defects.

(37 content/pedagogy findings total.)

---

## 4. SRS / Learning Science

### HIGH

71. **Two incompatible SRS algorithms coexist; reviews and flashcards use different math.** `/api/reviews/complete/route.ts:3` imports `applySM2` from `lib/spaced-repetition/sm2.ts` (vanilla SM-2). `lib/flashcard-service.ts:2` imports `AdaptiveSRSAlgorithm` from `lib/srs-algorithm.ts` (adaptive variant with streak bonuses + time penalties). They write to *different tables* (`ReviewSchedule` vs `SRSProgress`). The same conceptual concept (review a flashcard) is scheduled by two non-communicating systems. Whichever one a user sees first is the one they continue with — and the *other* never schedules them.

72. **Adaptive SRS double-penalizes failures.** `lib/srs-algorithm.ts:110-113` — SM-2 already resets interval/repetitions when `quality < 3`. Then `:145-148` `applyStreakAdjustments` subtracts up to 0.5 from ease factor based on `wrongStreak`. So a failed card is reset (interval=1) AND its ease tanks for the next several reviews. Recovery is brutal — common SRS guidance is to reset OR reduce ease, not both at full strength.

73. **`applyTimeAdjustments` reduces the interval by 20% whenever response time > 10 seconds.** `lib/srs-algorithm.ts:173-180`. 10 seconds is *fast* for a thinking response on a language card; most thoughtful learners will trip this on most cards. The result is that careful learners get shorter intervals than fast guessers — backwards from the intent.

74. **`calculateDailySchedule(cards, availableHours: 8)` defaults to 8 hours of daily study.** `lib/srs-algorithm.ts:245-251`. `availableHours * 3600 / 30s` = 960 cards/day. Nobody studies vocab 8 hours a day. A 30-minute default (60 cards) would be sane.

### MEDIUM

75. **`SRSProgress` schema stores streak/time fields the *vanilla* SM-2 path ignores.** `prisma/schema.prisma` has `correctStreak`, `wrongStreak`, `averageTime`. `applySM2` reads/writes none of them. So if `ReviewSchedule` is the active table, those fields rot.

76. **Falsy guard `intervalDays || 1` accepts 0 but coerces to 1.** `lib/spaced-repetition/sm2.ts:25`. Minor; `Math.max(1, ...)` handles it. But the `|| 1` short-circuit will also coerce negative numbers — `intervalDays: -5` becomes `-5` (not 1) because `-5` is truthy. Trivial bug.

77. **`calculateConfidenceScore` can exceed 1.0 before clamping.** `lib/srs-algorithm.ts:185-203`. `confidence = quality/5 + 0.1 + min(streak*0.05, 0.2)` → `1.0 + 0.1 + 0.2 = 1.3`. Clamped to 1 at return. Cosmetic but signals lack of unit testing on the edge case.

---

## 5. Native Apps — Truth Assessment

| App | Status | Reality |
|---|---|---|
| **iOS** (`/Ios/Shona App/`) | **Won't compile** | ~5,000 lines of Swift on disk; **0 lines in the build**. The Xcode project's `PBXBuildFile` section is empty (`grep -c PBXBuildFile` returns 0). Even if you wire the sources, multiple compile errors: `User(id, name)` missing required `email` arg (`Models.swift:23` vs `OnboardingView.swift:153`), `OnboardingView(isFirstLaunch:)` doesn't match init (`MainTabView.swift:24`), undefined `NotificationPreference` referenced in `modelContainer(...)` (`MainTabView.swift:82`), `[String]` accessed as struct with `.token`/`.type` (`PronunciationView.swift:276-278`). Zero auth code (no `URLSession`, no `/api/auth/*` consumption). |
| **watchOS** (`/shona-learn/ShonaWatch/`) | **Closest to working** | Project IS wired (16 `PBXBuildFile` entries, watchOS 9.0 target). Would likely build. But `DEVELOPMENT_TEAM = ""` (cannot archive/distribute). No host app target. Falls back to a 12-item sample vocab on JSON failure (`VocabularyData.swift:7-16`). No tests. No network/auth. `SpeechSynthesizer.swift:46-58` uses `en-ZA`/`en-US`/`en-GB` voices for Shona, with the comment *"Try to find a voice that might work well for Shona / Fall back to default"*. |
| **Orphan WatchKit Extension** (`/Ios/Shona App WatchKit Extension/`) | **Dead code** | 425-line file, not in any target's productType. Won't run. Compile error if you tried (`.fontFamily(.monospaced)` is not a SwiftUI API). Current "word" hard-coded to **`"Hallo"` (German)** with English IPA. Demo content never replaced. |
| **Android** (`/android/`) | **Vaporware** | Two Kotlin files (~425 lines), one of which is just a button component. No `AndroidManifest.xml`, no `settings.gradle`, no root `build.gradle`, no Gradle wrapper, no themes, no resources. `MainActivity.kt:17-18` imports `ShonaNavHost` and `ShonaTheme` — neither exists. Namespace typo: `com.shonaalearn.android` (double-a) vs `applicationId com.shonalearn.android`. `build.gradle.kts:90-119` declares Room, Hilt, Retrofit, Media3, ML Kit, Coil, Lottie — **none are imported by any code**. Pure aspirational dependency manifest. |

### CRITICAL

78. **`CROSS_PLATFORM_IMPLEMENTATION_SUMMARY.md:265-267` claims:**
    - "iOS: ✅ Xcode build successful" — *mathematically impossible* given an empty `PBXBuildFile` section.
    - "watchOS: ✅ WatchKit build successful" — *references the orphan extension that isn't a target*.
    - Both lines are false.

79. **`CROSS_PLATFORM_IMPLEMENTATION_SUMMARY.md:223` shows iOS Authentication ✅.** No auth code on iOS. False.

80. **`CROSS_PLATFORM_IMPLEMENTATION_SUMMARY.md:75-80, 226-230` claims Android has "MVVM with Architecture Components / Jetpack Compose / Room database / Hilt DI" implemented.** Reality: one button file. False on every count.

### HIGH

81. **`scripts/sync-ios-content.mjs` targets iOS only.** Despite a watchOS app and an Android stub, the script only writes to `Ios/Shona App/Shona App/Content`. The watch's `vocabulary.json` is hand-maintained and disconnected; Android has no content directory to sync to.

82. **Stub admission in production code.** `ShonaWatch/Services/GamificationService.swift:568` — comment `// MARK: - Stub Methods (would be implemented fully in production)`. The author shipped a "deployment ready" document over their own TODOs.

83. **Five "DEPLOYMENT READY"-style docs for an app with no tests, no signing team, no host app.** `ShonaWatch/DEPLOYMENT_READY.md`, `FINAL_COMPREHENSIVE_REPORT.md`, `CLINICAL_VALIDATION_REPORT.md`, `EXPANSION_COMPLETE.md`, `WATCHOS_APP_SUMMARY.md`. The "clinical validation" file is particularly bold given the watch app uses American English voices for Shona.

### MEDIUM

84. **iOS bundle id is personal-developer-style.** `PRODUCT_BUNDLE_IDENTIFIER = "Urban-Conservatory.Shona-App"` (project.pbxproj:413). Not a reverse-DNS form. Would need to change before App Store.

85. **iOS entitlements file is macOS-flavoured.** `Shona_App.entitlements` declares `com.apple.security.app-sandbox` and `files.user-selected.read-only` — macOS sandbox keys, irrelevant on iOS. Cargo-culted.

86. **iOS marketing version is `1.0`, build `1`** — placeholder.

(38 native-app findings total.)

---

## 6. Severity Roll-Up (Pass 2)

| Area | CRIT | HIGH | MED | LOW |
|---|---:|---:|---:|---:|
| Audio + AI (the headline) | 2 | — | — | — |
| UX & flows | — | 12 | 7 | 6 |
| Games | — | 9 | 8 | 5 |
| Content & pedagogy | 4 | 6 | 10 | 10 |
| SRS / learning science | — | 4 | 3 | — |
| Native iOS | 1 | 4 | 3 | 2 |
| Native watchOS | — | 3 | 4 | 1 |
| Native Android | 2 | 2 | — | — |
| Documentation honesty (cross-cutting) | 3 | 1 | — | — |
| **Total (deduped)** | **12** | **41** | **35** | **24** |

Cross-referenced with pass-1: ~10 findings overlap (the games API trusts client score, the JWT/auth stuff, the dead `featureFlags.ts`, the `lib/featureFlags.ts AUDIO_ENABLED=false`). Pass-2 net new: ~110 findings.

**Combined total across both passes: ~220 distinct findings.**

---

## 7. If You Could Only Fix Five Things — in Priority Order

1. **Make audio work.** Move `content/audio/*.mp3` into `public/content/audio/`, or add a Next.js rewrite. Change `AudioService.ts:125` from `'en-US'` to leave the lang unset, or attempt `'sn-ZW'`. Without this, **the app does not function as a language app**.

2. **Make the pronunciation analysis read the actual audio.** `lib/pronunciation-analysis.ts:383` — `await fs.readFile(audioPath)`, base64, send to Gemini. Or remove the feature entirely and stop scoring users on a model that never heard them.

3. **Pick one source of truth for content.** Delete 18 of the 20 overlapping JSONs in `content/`. Make `prisma/seed.ts` read from the surviving one. Rewrite the 350 templated nonsense examples by hand or with a real Shona-speaker pass. Fix the hallucinated distractors (`serebun`, `naira`, `umi`) in `seed.ts`.

4. **Mount the OnboardingFlow that already exists, or delete it.** `app/components/OnboardingFlow.tsx` is 244 lines of unrendered UI. Either show it on first visit or stop shipping dead code.

5. **Stop selling features that don't exist.**
   - Either build the voice/rhythm tracker the marketing page advertises, or remove the section.
   - Either un-`comingSoon` the four games whose routes work, or hide the routes.
   - Either delete the iOS/Android marketing claims in the cross-platform docs, or finish the apps.
   - The pattern of "doc says ✅, code says no" is the deepest problem in this codebase — it's why a user (and an investor, and a reviewer) will distrust everything else once they notice.

---

## 8. What pass-2 confirms about pass-1's verdict

Pass-1 ended with: *"AI-driven beta that was never reviewed by a human."* Pass-2 doesn't soften that — it sharpens it.

- The 67 markdown victory-lap files in `shona-learn/` are now *demonstrably* false in specific ways (audio works, AI hears audio, iOS builds, Android is implemented, deployment ready). Documentation theatre.
- The codebase carries the **vocabulary** of language pedagogy — SRS, checkpoints, units, quests, hearts, XP, achievements, IPA, tone patterns, cultural notes — and uses ~5% of each. They're switches on a dashboard with the wires cut.
- The single feature that would justify a Shona app over Duolingo (audio + pronunciation feedback for a tonal Bantu language) is the *most broken* part. Everything else is downstream of that.

The good news from pass-1 still stands:
- React/Next.js structure is reasonable.
- Pure-function unit tests for SM-2, checkpoint scoring, and prerequisites are correct.
- No XSS sinks, no SQL injection, no obvious crash vectors in the React tree.
- The marketing landing is well-designed visually (the **only** part of the product that delivers on its claim).

**Bottom line:** the gap between what this app *says* it is and what it *is* is wider than any individual finding. The fix is not 220 small fixes — it's a decision to stop generating success reports and start generating working features, then truthfully describe them. Until that decision is made, every audit will produce the same shape.

— end of pass 2

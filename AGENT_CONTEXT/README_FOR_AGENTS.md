# README for Agents

## Table of Contents
1. Reading Order for Key Documents
2. Priority Objectives & Deliverables
3. Parallel Development Strategy (24/7 Workflow)
4. Success Criteria & Quality Standards
5. Cultural Sensitivity Guidelines

---

## 1. Reading Order for Key Documents
Follow this sequence to build context quickly and avoid information overload:

1. **This README (README_FOR_AGENTS.md)** – high-level overview & working rules.
2. **AGENT_PROJECT_OVERVIEW.md** – project vision, architecture, and domain context.
3. **AGENT_QUICK_START.md** – step-by-step environment setup & common commands.
4. **MASTER_PROMPT_FOR_AGENTS.md** – detailed prompting framework & conventions.
5. **Source Materials** (in `AGENT_CONTEXT/source_materials/`) – reference PDFs & research. Skim abstracts first; deep-dive only when a task requires it.
6. **Existing App Reference** – browse code & docs in `AGENT_CONTEXT/existing_app_reference/` to understand prior implementations.
7. **Scripts & Guides** – e.g. `scripts/content-extraction-guide.md`, `scripts/quest-creation-guide.md`, etc.

> Tip: Keep these docs open in split panes for fast cross-referencing.

---

## 2. Priority Objectives & Deliverables
| # | Objective | Key Deliverables | Owner(s) | Due |
|---|-----------|-----------------|----------|-----|
| 1 | MVP of Shona learning web app | Functional Next.js app with lessons, exercises, progress tracking | Web Agents | Sprint 1 |
| 2 | Voice-enabled learning features | Pronunciation practice, speech recognition, text-to-speech modules | Voice Agents | Sprint 2 |
| 3 | iOS companion app parity | SwiftUI app mirroring core web functionality | iOS Agents | Sprint 3 |
| 4 | Gamification layer | Intrinsic motivation tracker, social learning, quests | Gamification Agents | Sprint 3 |
| 5 | Content ingestion pipeline | Automated extraction of lessons from PDFs & other resources | Data Agents | Sprint 2 |
| 6 | Production deployment | CI/CD pipelines, staging & prod environments | DevOps Agents | Continuous |

Each objective must ship with:
- Unit & integration tests (≥80% coverage)
- Lint-clean, type-safe code
- Documentation (README/snippets in code)
- Demo recording or staging URL

---

## 3. Parallel Development Strategy (24/7 Workflow)
1. **Explicit Handover Notes**  – Finish every working session by pushing code & writing TODOs in `/.handover/` markdown files.
2. **Issue-centric Branching**  – One branch per Jira/GitHub issue; descriptive names (e.g. `feature/voice-practice-ui`).
3. **Time-Zone Relay**         – Americas → EMEA → APAC agents cycle. Each picks up the latest handover branch.
4. **Small, Atomic PRs**       – Keep PRs <300 lines; easier reviews & reduces merge conflicts.
5. **Automated Checks**        – CI runs lint, tests, type check, and e2e tests on every push.
6. **Async Communication**     – Document decisions in the repo (ADR/md) rather than chat only.

> Goal: Zero idle time—codebase is always moving forward while someone sleeps.

---

## 4. Success Criteria & Quality Standards
- **Functional Coverage**: All acceptance criteria in user stories are met & demonstrated.
- **Code Quality**: Passes ESLint/SwiftLint, Prettier formatting, and TypeScript/Swift type checks.
- **Test Coverage**: ≥80% unit + integration; critical paths have e2e tests (Cypress/Playwright).
- **Performance**: FCP <2 s, TTI <5 s on mid-range devices; API p95 latency <300 ms.
- **Accessibility (a11y)**: WCAG 2.1 AA compliance.
- **Security**: No high/critical vulnerabilities from automated scans (OWASP ZAP, Snyk).
- **Documentation**: Updated docs & inline comments explaining non-obvious logic.
- **User Feedback**: Beta testers rate ≥4/5 on usefulness & usability.

---

## 5. Cultural Sensitivity Guidelines
1. **Respectful Content** – All lessons, examples, and UI text should honor Shona culture and avoid stereotypes.
2. **Inclusive Language** – Use gender-neutral terms where possible; avoid colonial or derogatory language.
3. **Community Review** – Engage native Shona speakers for content validation.
4. **Ethical Data Use** – Obtain permissions for any third-party materials; cite sources appropriately.
5. **Localization** – Ensure translations preserve meaning, humour, and idioms without distortion.
6. **Imagery & Icons** – Use culturally appropriate visuals; avoid misappropriation of symbols.

---

_Updated © 2025 Shona Language Learning Project_
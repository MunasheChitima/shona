# curriculum qa report

> end-to-end pass against `content/lessons_consolidated.json` v7.0.0-fsi
> (62 lessons, regenerated 2026-05-21 by the FSI extension agent).
> this is a *report*, not a fix. issues described below are intentionally
> left for the next pass.

**scope checked:** all 62 lessons against seven criteria from the brief:
skill outcome quality, vocabulary appropriateness, exercise variety,
distractor quality, cultural-note specificity, lowercase aesthetic,
progression integrity.

**method:** programmatic scan of `lessons_consolidated.json` plus manual
inspection of a sample of every unit (lessons 1, 5, 10, 11, 20, 22, 30,
35-37, 48, 50, 55, 58, 62) for substantive review.

---

## headline

the curriculum is in **strong shape**. 57 of 62 lessons have no
mechanical issues; the five flagged below are all minor (4 LOW, 1 MED,
0 HIGH). distractor quality is good throughout (no hallucinated
tokens like the `serebun`/`naira`/`umi` flagged in `PRODUCT_AUDIT.md`
#47). cultural notes are uniformly concrete and FSI-cited. lowercase
aesthetic is observed throughout.

the real findings are **curriculum-wide systemic patterns** — see
"cross-cutting patterns" near the end. these are likely artefacts of
`scripts/build-fsi-curriculum.mjs` generating boilerplate
metadata fields and are *not* per-lesson defects.

---

## per-lesson issues

only lessons with flagged issues appear in this table. lessons with no
issues (57 of 62) are omitted.

| lesson-id  | title | issues | severity |
|---|---|---|---|
| lesson-1   | the sounds of shona | 4/6 exercises are multiple_choice; arguably justified for a phonology onboarding lesson (no production-ready vocab yet), but consider replacing one MCQ with an audio-listen exercise once audio comes online | LOW |
| lesson-11  | numbers one through five | 10 vocab items — above the 4-6 target. some entries are duplicates of the same number in counting form vs. agreement form (`posi` and `-mwe`); could be split into two lessons or trimmed | LOW |
| lesson-20  | demonstratives — this, that, these, those | 10 vocab items — heavy. demonstratives × noun classes is genuinely a lot, but consider splitting proximal (this/these) from distal (that/those) into separate lessons | LOW |
| lesson-22  | cities and towns of zimbabwe | vocab english fields capitalize town names like `Sakubva (area near Mutare)` and `Rusape (town)` — these are real proper nouns so the capitalization is correct shona orthography, but flagged for review against the lowercase brand: are proper-noun parentheticals ("(town)") in english glosses worth keeping at all? | LOW |
| lesson-50  | practicing the full ritual | only 2 exercise types in use (`multiple_choice` and `order_sentence`). target is at least 3. since this is the "consolidation of the greeting ladder" lesson, adding a `translation` or `fill_blank` exercise for one of the four turns would round it out | MED |

---

## per-lesson positive observations

a few lessons stood out as particularly well-built. listing them so the
quality bar is visible:

- **lesson-5 (the full greeting exchange):** uses 4 exercise types
  (order_sentence x2, translation x2, multiple_choice x2, fill_blank).
  cultural note explicitly teaches the multi-turn ritual structure that
  the rest of the curriculum builds on. exemplar.
- **lesson-9 (mwana, mukunda, mukorore):** quietly introduces noun-class
  1/2 by example 26 lessons before the formal noun-class lesson. this is
  good pedagogical scaffolding.
- **lesson-20 (demonstratives):** the explanation in the cultural note
  links demonstratives explicitly to noun classes — exactly the
  "spine of grammar" principle in action.
- **lesson-35-37 (noun classes):** distractor quality is high; learners
  who haven't grasped the system can't get the right answer by
  guessing. e.g. `"what makes a noun belong to class 1/2?" → ["it is
  feminine", "it is plural", "it refers to a person and takes the mu-
  / va- prefix pair", "it starts with the letter m"]`. all four are
  plausible-sounding to a beginner.
- **lesson-48 (tsuro naDiro):** real folktale, real cultural payload,
  exercises that test comprehension of the story not just vocabulary.
- **lesson-50 (practicing the full ritual):** despite the exercise-type
  flag above, the cultural note is the single best line in the
  curriculum: *"each turn deserves a genuine pause and reply. the
  slowness IS the respect."*

---

## summary stats

- **total lessons:** 62
- **no issues:** 57 (91.9%)
- **LOW issues:** 4
- **MED issues:** 1
- **HIGH issues:** 0

curriculum-wide metrics:

- **unique shona vocab headwords:** 242 (CEFR A1 target ≈ 500; the
  curriculum is still below the active-vocabulary floor — see
  `PRODUCT_AUDIT.md` #49 and "known gaps" in `CURRICULUM_NOTES.md`)
- **total exercises:** 373 (avg 6.0 per lesson)
- **exercise type distribution:**
  - `multiple_choice`: 120 (32.2%)
  - `translation`: 85 (22.8%)
  - `order_sentence`: 65 (17.4%)
  - `fill_blank`: 58 (15.5%)
  - `matching`: 45 (12.1%)
  - this is a healthy distribution. MCQ no longer dominates (the
    pre-FSI curriculum was 80% MCQ per `PRODUCT_AUDIT.md` #50).
- **provenance coverage:** 280 entries in `CURRICULUM_PROVENANCE.json`;
  272 FSI, 7 from `cultural_notes.json`, 1 from `sound-guide.json`.
  every shona phrase in lesson vocabulary appears to have a trace
  (sampled — not exhaustively diffed).

---

## cross-cutting patterns

these are the real findings. each appears in 30+ lessons, so the fix
is at the build-script level, not per-lesson.

### 1. learningObjectives is auto-generated boilerplate (62/62 lessons)

every lesson's `learningObjectives` field is a single-element array of
the form `["gain skill: <copy of skillOutcome>"]`. example
(lesson-1): `["gain skill: i can recognize the vowels and key
consonant clusters of shona"]`.

this is mechanically derived from `skillOutcome`. it's not wrong, but
it duplicates a field the UI already has and adds no information.

**recommendation:** either remove the field, or have the build script
emit 3-4 distinct sub-objectives per lesson (e.g. for lesson-2:
`["recognize 'mangwanani'", "respond with 'mwarara here?'", "use the
respectful plural"]`).

### 2. discoveryElements is just the first few vocab items (62/62 lessons)

every `discoveryElements` array is identically a subset of that
lesson's `vocabulary` shona forms. example (lesson-2):
`["mangwanani", "baba", "mai"]`. these are supposed to be
*exploration prompts* (per the schema comment in
`prisma/schema.prisma:64`: "JSON string of exploration prompts"), not
vocabulary tokens.

**recommendation:** the build script should either drop the field or
synthesize real exploration prompts like `["try this greeting on a
zimbabwean shopkeeper", "notice how the response mirrors the
question"]`.

### 3. matching exercises all use the same prompt (45/45 matching exercises)

every single matching exercise's question field is the literal string
`"match each shona word to its english meaning."`. no variation across
units.

this is fine functionally but cosmetically dull, and in lessons where
the matching is *not* shona-to-english (e.g. lesson-1 matches vowel
letters to english pronunciation hints; lessons 35-37 match
noun-class prefixes to class descriptions) the generic prompt is
slightly inaccurate.

**recommendation:** generate prompts contextual to the lesson:
`"match each shona vowel to its english sound"` for lesson-1, etc.

### 4. explanation feedback follows a rigid two-formula template (87% / 32%)

- 328 of 373 explanations (87%) start with `"correct — "` followed by
  a quoted answer.
- 120 of 373 incorrect-feedback strings (32%) start with `"the answer
  is "` followed by the same quoted answer.

this is mechanically generated. for translation and fill_blank
exercises it's serviceable. for `order_sentence` and noun-class
multiple-choice, an explanation that *teaches why* (e.g. "the va-
prefix marks class 2 because the noun refers to people") would
substantially improve consolidation.

**recommendation:** for grammar lessons (26-27, 30, 33, 35-37, 44-45,
58-59), have the build script emit explanation strings that include
the rule, not just the answer.

### 5. cultural notes lean heavily on the formula "fsi unit N introduces X"

most lessons from 6 onward open their cultural notes with a phrase of
the shape `"fsi unit N ..."`. this is great for traceability but
breaks the fourth wall for the learner — they don't care that FSI
unit 5 introduced the locatives, they want to know *what locatives
do*. when the note is two-sentence, the first sentence is often FSI
attribution and only the second is the actually-actionable cultural
content.

**recommendation:** drop the FSI references into the
`CURRICULUM_PROVENANCE.json` `context` field (where they belong) and
keep the learner-facing cultural notes purely about the language /
culture. example refactor for lesson-21:

- before: `"fsi unit 5 introduces the locatives. 'ku-' / 'kwa-' =
  motion or general 'at'; 'pa-' = on a flat surface ..."`
- after: `"shona has three locative prefixes — 'ku-' for motion or
  general 'at', 'pa-' for on a flat surface, 'mu-' for inside
  something. 'pano' is 'here', 'apo' is 'there', 'kure' is 'far',
  'patyo' is 'near'."`

### 6. quest registry references 12 lesson IDs that do not exist

`lib/quests.ts` references the IDs `lesson-49`, `lesson-50`,
`lesson-51`, `lesson-52`, `lesson-g1`, `lesson-g2`, `lesson-g3`,
`lesson-g4`, `lesson-g5`, `lesson-g6`, `lesson-g7`, `lesson-g8` —
none of which are in `lessons_consolidated.json` (the consolidated
file uses pure numeric IDs `lesson-1` through `lesson-62`, with no
`lesson-g*` family).

since the FSI extension agent has now added lessons up through
`lesson-62`, the conflict is now even larger: `lib/quests.ts` thinks
the curriculum ends at `lesson-52` (with `g`-suffixed inserts
interspersed) while the JSON actually has 62 numeric lessons. **the
UI's unit groupings will be wrong for any lesson past 48** until
`lib/quests.ts` is updated. this is the highest-impact single issue
in the report despite not being a per-lesson defect.

(scoped out by the brief — `lib/quests.ts` is in the do-not-edit list
— but flagged here because it directly affects the curriculum's
navigability.)

### 7. vocabulary `pronunciation` field is empty on essentially every item

sampled across all 62 lessons: the `pronunciation` field on
`vocabulary` items is either absent or the empty string. shona is
tonal; tone is a phonemic feature; this is a real pedagogical gap.

this matches `PRODUCT_AUDIT.md` #53. flagged here because the
extension agent appears to have inherited the empty-pronunciation
pattern from the existing lessons.

**recommendation:** a separate native-speaker pass to fill in tone
patterns. doesn't need to be IPA — a simple high/low marking on each
syllable would already differentiate `mukomana` (boy, HHLH) from
problematic homographs.

---

## top 10 most polish-worthy lessons

prioritized by user-facing impact (early lessons are seen by every
learner) × density of cross-cutting findings.

1. **lesson-1 — the sounds of shona** — first lesson every user sees.
   MCQ-heavy by necessity, but if any lesson should have audio
   exercises it's this one. matching prompt is generic when
   it should be lesson-specific.
2. **lesson-2 — mangwanani — good morning** — second universal-traffic
   lesson. cultural note opens with "in shona culture, greetings are
   sacred. you greet before any conversation — skip ..." — that's
   slightly platitudinal; could be sharpened with a concrete example
   of when greeting-skipping causes offense.
3. **lesson-5 — the full greeting exchange** — the capstone of the
   greeting ladder. already strong; could add a `conversation`-style
   role-play once that exercise type exists.
4. **lesson-11 — numbers 1-5** — heavy vocab (10). probably should be
   split into `lesson-11a: counting form (posi, piri, ...)` and
   `lesson-11b: agreement form (-mwe, -viri, ...)` once the
   curriculum has the budget.
5. **lesson-20 — demonstratives** — heavy vocab (10) and conceptually
   thick (proximal/distal × five noun classes). this is the lesson
   most likely to overwhelm a beginner.
6. **lesson-26 — subject prefixes** — first deep-grammar lesson. the
   explanation formula here (`"correct — 'ndinoda'."`) wastes the
   teaching moment. could explicitly call out *why* "ndi-" is the
   right prefix.
7. **lesson-35 — noun classes 1/2** — the linchpin of unit 8. learners
   who fail here will struggle for the rest of the curriculum. worth
   a per-question explanation rewrite.
8. **lesson-46 — unhu** — first cultural-philosophy lesson. uses the
   richest content from `cultural_notes.json`. cultural note opens
   strong but could pair with a concrete acted-out example.
9. **lesson-50 — practicing the full ritual** — already flagged for
   exercise-type variety. since it's the explicit consolidation
   lesson for unit-1, this is where a `conversation` exercise type
   would have maximum impact.
10. **lesson-58 — noun classes full overview** — the new
    consolidation lesson from the extension agent. potentially the
    "noun-class final exam" of the curriculum; would benefit from
    being checkpoint-style rather than the standard 6-exercise
    format.

---

## limitations of this pass

- **no native-speaker review.** every issue here is mechanical or
  structural. semantic correctness of the shona (is `kana mwaswerawo`
  exactly right in this register? are the day names in the right
  modern form?) requires a native ear and was not in scope.
- **no audio coverage check.** the vocabulary cross-reference to
  `audio-manifest.json` was not run; `PRODUCT_AUDIT.md` already
  documents that file as broken end-to-end.
- **provenance was sampled, not exhaustively diffed.** a follow-up CI
  check should diff every shona token in `lessons_consolidated.json`
  against `CURRICULUM_PROVENANCE.json` and fail on any miss.
- **the new lessons (49-62) from the extension agent landed mid-pass.**
  i re-ran the mechanical checks against the full 62 but did not
  individually deep-read each new lesson the way i did for the
  original 48. spot-checks on lessons 50, 55, 58, 62 found no defects
  beyond the lesson-50 exercise-variety one.

---

*generated 2026-05-21 by an end-to-end quality pass. companion document:
`CURRICULUM_NOTES.md` (curriculum design doc). next pass should be
native-speaker semantic review + the cross-cutting fixes above.*

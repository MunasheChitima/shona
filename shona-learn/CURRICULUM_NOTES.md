# curriculum notes

> design doc for the shona-learn curriculum. read this before editing
> `content/lessons_consolidated.json`, `content/CURRICULUM_PROVENANCE.json`,
> or `scripts/build-fsi-curriculum.mjs`.

---

## overview

shona-learn is a 48-lesson (extending toward 65-75) skill-outcome curriculum
for learners of standard zezuru shona. every lesson is built from the
**FSI shona basic course (1965)** — a 700-page us state department field
text written for foreign-service officers posted to what was then rhodesia.
the FSI book is one of the few open, page-numbered, dialogue-first sources
for shona. we use it as the spine.

the design philosophy: a lesson is **a skill the user can do**, not a vocab
page. each lesson opens with an "i can ___" sentence and is engineered to
make that sentence true. the curriculum is built by
`scripts/build-fsi-curriculum.mjs`, which mines the FSI PDF and emits
`content/lessons_consolidated.json`. every shona phrase that appears
anywhere in the curriculum is traced in `content/CURRICULUM_PROVENANCE.json`
to an FSI page (or, rarely, to a sibling source like `cultural_notes.json`).

a previous pass (`PRODUCT_AUDIT.md` pass 2, may 2026) flagged that the older
curriculum was vocab-soup with stock learning objectives, hallucinated MCQ
distractors (`serebun`, `naira`, `umi`), and platitude cultural notes. this
curriculum is the rebuild. its differentiator is **traceability** — no
phrase appears in a lesson unless it appears in provenance.

---

## pedagogical principles

these are the seven invariants. every lesson must satisfy all seven.

1. **every lesson has a clear "i can ___" outcome.**
   the lesson's `description` and `skillOutcome` both start with "i can".
   examples from real lessons:
   - lesson-2: "i can give and reply to a basic morning greeting"
   - lesson-21: "i can say 'to', 'at', and 'in' with shona locative prefixes"
   - lesson-30: "i can politely ask permission or make a soft request"

   this is the litmus test: if a learner finishes the lesson and can't do
   the thing in the title, the lesson failed.

2. **noun classes are the spine of shona grammar — taught explicitly,
   not glossed over.**
   most beginner shona materials hand-wave the class system as "advanced".
   we treat it as the load-bearing pillar. lessons 35-37 are dedicated
   noun-class lessons (classes 1/2, 3/4, 5/6, 7/8, 9/10), but the system
   is foreshadowed from lesson 9 onward (`mukunda` / `vakunda` —
   son/sons) and used to motivate demonstratives (lesson 20), locatives
   (lesson 21), and number concord (lessons 11-12).

3. **greetings are ritual, not just words — laddered across multiple
   lessons.**
   see the "greeting ladder" section below. one lesson is never enough.
   shona greeting culture has its own pedagogy embedded in it (you ask
   about the person, then their family, then their children, each as a
   separate turn). we teach this as a multi-lesson arc: 2 → 3 → 4 → 5.

4. **mixed exercise types per lesson, every lesson.**
   five types are in rotation: `multiple_choice`, `translation`,
   `fill_blank`, `matching`, `order_sentence`. every lesson uses at
   least 3 of the 5. recognition (MCQ, matching) gets balanced with
   production (translation, fill_blank, order_sentence). lesson 1 is the
   only intentional exception (4/6 MCQ because it's the phonology onboarding
   and there isn't yet enough vocabulary for production tasks).

5. **cultural notes are concrete and actionable, never platitudes.**
   compare these two formulations:
   - bad: "greetings are important in shona culture."
   - good (lesson-5): "a proper greeting in shona is a multi-turn exchange.
     you ask how the person slept, how their family slept, how the children
     slept — each is a separate question with its own reply."

   every cultural note must teach something the learner can act on or
   recognize in a real conversation. "important" is not actionable.

6. **lowercase aesthetic by default.**
   see the "lowercase convention" section. titles, descriptions, exercise
   prompts, options, and explanations are lowercase. proper nouns
   (`Harare`, `Mutare`, `Zimbabwe`, person names, `FSI`) and the day names
   (`Musumbunuko`, `Chipiri`, …) are the only capitalized strings.

7. **every shona phrase traces to a source.**
   this is non-negotiable. if you add a new shona phrase to a lesson,
   you must also add it to `CURRICULUM_PROVENANCE.json` with `source`,
   `page`, and `context`. unsourced phrases are how curricula drift into
   "i think i heard this once" territory. the FSI page numbers make this
   auditable.

---

## unit-by-unit breakdown

13 units, 48 lessons. units are grouped by quest in `lib/quests.ts` (and
the consolidated.json `metadata.topicCategories` lists the same units).
"FSI draws" cites the source unit(s) from the basic course; "skill
outcomes" is the literal "i can" list extracted from each lesson.

### unit 1: first words (lessons 1-5)

phonology onboarding plus the greeting ladder. FSI draws: units 1-2.

- lesson-1 — the sounds of shona: i can recognize the vowels and key
  consonant clusters of shona
- lesson-2 — mangwanani — good morning: i can give and reply to a basic
  morning greeting
- lesson-3 — masikati & manheru: i can greet someone at different times
  of day
- lesson-4 — plural vs singular formal: i can use the plural-of-respect
  when greeting an elder
- lesson-5 — the full greeting exchange: i can complete a multi-turn
  greeting with someone respectfully

### unit 2: people around you (lessons 6-10)

identity, family, pronouns. FSI draws: units 3-5.

- lesson-6 — ndini: i can tell someone my name and ask theirs
- lesson-7 — ndinobva: i can say where i come from and ask where someone
  is from
- lesson-8 — mhuri yangu: i can introduce members of my family using
  "baba", "mai", and "vana"
- lesson-9 — mwana, mukunda, mukorore: i can name children, sons, and
  daughters using the right class form (foreshadows noun classes)
- lesson-10 — shona pronouns: i can use shona personal pronouns to refer
  to myself and others

### unit 3: numbers & time (lessons 11-16)

numbers, days, time, money, when-questions. FSI draws: units 6-7, 9.

- lesson-11 — numbers 1-5
- lesson-12 — numbers 6-10
- lesson-13 — days of the week
- lesson-14 — time periods (day/week/month/year)
- lesson-15 — how much (asking prices)
- lesson-16 — when (past + future arrival questions; intro of `-ka-` past)

### unit 4: daily life (lessons 17-20)

food, kitchen, home, demonstratives. FSI draws: units 7, 18.

- lesson-17 — sadza
- lesson-18 — mvura (water and the kitchen)
- lesson-19 — imba (home and adjectives huru/diki/chena)
- lesson-20 — demonstratives (this/that/these/those, with noun-class agreement)

### unit 5: getting around (lessons 21-25)

locatives, places, work, transport. FSI draws: units 5, 8, 23.

- lesson-21 — locative prefixes ku-/pa-/mu-
- lesson-22 — cities and towns of zimbabwe
- lesson-23 — where do you live / work
- lesson-24 — going places (kumusha, kumunda, kuchechi, …)
- lesson-25 — transport (motoka, bhazi, chitima, with ne- prefix)

### unit 6: doing things (lessons 26-29)

verbs and verb morphology. FSI draws: units 5, 9.

- lesson-26 — subject prefixes (ndi-/u-/a-/ti-/mu-/va-)
- lesson-27 — present continuous (ndiri ku- + infinitive)
- lesson-28 — common verbs (go/come/do/eat/drink/want)
- lesson-29 — work verbs (kurima, kuchaira, kuweza, kurapa, kuvaka, kudzidzisa)

### unit 7: expressing yourself (lessons 30-33)

potential, shopping, wanting, past tense. FSI draws: units 7-9.

- lesson-30 — asking permission (ndingaenda?, the -nga- potential)
- lesson-31 — shopping at the chitoro
- lesson-32 — wanting and choosing (-da, possessives -angu/-ake)
- lesson-33 — past tense (-ka-)

### unit 8: culture & traditions (lessons 34-37)

kinship and the formal noun-class lessons. FSI draws: units 5, 23.

- lesson-34 — kinship (sekuru, ambuya, tete, mukoma, muninina, hanzvadzi)
- lesson-35 — noun classes 1/2 (mu-/va-)
- lesson-36 — noun classes 3/4 and 5/6
- lesson-37 — noun classes 7/8 and 9/10

### unit 9: nature & environment (lessons 38-39)

animals and weather. FSI draws: appendix vocabulary.

- lesson-38 — animals you'll hear about (shumba, tsuro)
- lesson-39 — sun, rain, seasons

### unit 10: modern life (lessons 40-41)

modern transport and modern places. FSI draws: units 8, 23, with loan
words flagged.

- lesson-40 — getting around town
- lesson-41 — in the modern city (loan words: ofisi, hosipitari, chechi)

### unit 11: society & governance (lessons 42-43)

asking after someone, talking about work. FSI draws: units 5, 10.

- lesson-42 — looking for someone
- lesson-43 — talking about work and institutions

### unit 12: complex communication (lessons 44-45)

connectives and interrogatives. FSI draws: units 9, 14.

- lesson-44 — connecting with "na" (and/with)
- lesson-45 — asking "how" and "what kind" (-senyi, -rinyi, -nyi)

### unit 13: deeper culture (lessons 46-48)

unhu, totems, folktale. FSI draws: unit 41 + `cultural_notes.json`.

- lesson-46 — unhu (philosophy of language)
- lesson-47 — the totem tradition (mutupo)
- lesson-48 — tsuro naDiro (folktale)

---

## exercise types

five types are in rotation. each teaches something distinct.

### multiple_choice (97 of 289 exercises, 33.6%)

- **what it teaches:** recognition / discrimination. fastest to grade,
  lowest cognitive load.
- **when to use:** introducing new vocabulary, testing comprehension of
  a grammar rule, sanity-checking listening (when audio comes online).
- **shape:** 4 options, one correct, three semantically-near distractors.
  distractors must be *real shona* (or *real english* when the question is
  shona-to-english). no hallucinated tokens.
- **example (lesson-28):** `"-uya" means:` → `[to be, to come, to go, to leave]`.
  the distractors are all real verbs of motion or copulas.

### translation (63, 21.8%)

- **what it teaches:** production. forces the learner to retrieve, not
  recognize.
- **when to use:** for short, in-lesson phrases (one to four words) the
  learner has just seen.
- **shape:** prompt is a shona phrase or an english phrase; answer is the
  other. accepts minor spelling variants.

### order_sentence (48, 16.6%)

- **what it teaches:** syntax. shona word order matters (subject-verb-object,
  but with concord-bearing prefixes that the learner has to assemble).
- **when to use:** any lesson where a full sentence is on the table — i.e.
  not phonology, but everything after.
- **shape:** scrambled words, target sentence in the prompt's english gloss.

### fill_blank (45, 15.6%)

- **what it teaches:** morphology. the blank is almost always a prefix or
  suffix that depends on noun class / tense / person.
- **when to use:** when you want to isolate one morpheme without making
  the learner build the whole sentence.
- **example (lesson-30):** `ti___ enda nguvanyi?` → `nga` (the potential
  prefix between subject ti- and verb stem -enda).

### matching (36, 12.5%)

- **what it teaches:** paired association. light cognitive load; good for
  consolidation at end of a lesson.
- **when to use:** review pass. typically one per lesson, paired with the
  lesson's vocabulary list.
- **shape:** 5 shona words ↔ 5 english meanings.

---

## the noun-class system

shona has roughly 10 productive noun classes plus a few minor / locative
classes. each class has a singular prefix and a plural prefix, and every
adjective, demonstrative, possessive, and verb that refers to a noun in
that class agrees with it via a "concord" prefix.

this is the single thickest concept in shona grammar. our curriculum
introduces it in three stages.

### stage 1 — implicit foreshadowing (lessons 9, 11, 20)

before naming the system, we show it.

- lesson-9 introduces `mukunda` / `vakunda` (son / sons), `mukorore` /
  `vakorore`, `mwana` / `vana`. the cultural note explicitly says
  "class 1 / 2 (mu-/va-) covers nouns for people".
- lesson-11's cultural note: "two children" is "vana va-viri" — the va-
  agrees with class 2.
- lesson-20 (demonstratives) requires class agreement to choose between
  `uyu mwana` (this child, class 1) and `iyi imba` (this house, class 9).

at this stage the learner has *seen* the pattern many times without being
told it's a system.

### stage 2 — naming and labeling (lessons 35-37)

three back-to-back lessons that name what the learner has already
absorbed:

- lesson-35 — classes 1/2 (mu-/va-): people. `munhu/vanhu`,
  `mukomana/vakomana`. the cultural note notes the `mwana/vana`
  irregularity (singular drops the mu-).
- lesson-36 — classes 3/4 (mu-/mi-) and 5/6 (often ø/ma-): natural
  things; paired or large items. `muti/miti` (tree/trees),
  `zuva/mazuva` (day/days).
- lesson-37 — classes 7/8 (chi-/zvi-) and 9/10 (often n- or ø): things,
  languages, diminutives; many class-9 nouns just begin with a
  consonant (`imba`, `motoka`).

### stage 3 — application (lessons 38-48)

once classes are named, later lessons use them as the framework for
concord-bearing constructions: possessives (lesson 32), connective `na`
(lesson 44), interrogative enclitics (lesson 45).

**pedagogical rationale:** introducing the meta-system before the learner
has internalized the pattern produces glazed eyes. introducing it after
they've seen 50+ examples produces the "oh, *that's* what's been going
on" moment. we delay the formal lesson until lesson 35 (~73% of the way
through the current curriculum) on purpose.

---

## greeting ladder

shona greeting is a multi-turn ritual, not a single word. learners who
get `mhoro` and stop will be culturally illegible. so we ladder it.

| lesson | what gets added | example |
|---|---|---|
| lesson-1 | `mhoro` as one of the five "first words" you can recognize | "mhoro" → "hello (informal)" |
| lesson-2 | `mangwanani` (morning) + the "did you sleep" / "i slept fine" exchange | "mangwanani baba" → "mwarara here?" → "ndarara zvangu" |
| lesson-3 | `masikati` (afternoon), `manheru` (evening), `kana mwaswerawo` (if you also had a good day) | swapping the time-of-day word into the same frame |
| lesson-4 | the plural-of-respect form: `mwarara` (resp.) vs `warara` (familiar) | choosing the right form based on the addressee's age/status |
| lesson-5 | the multi-turn full exchange: asking after the family, the children, each as its own turn | "mhuri yarara zvakanaka here?" → "varara zvakanaka" |

`mhoroi` (the respectful / plural form of `mhoro`) is mentioned in
provenance but is not explicitly taught as a lesson-1 vocab entry —
the FSI book uses `mangwanani`/`masikati` instead, so the formal
greeting in the early lessons is time-of-day-based, not `mhoroi`.
this is a deliberate choice to follow FSI, but it's worth flagging
for future native-speaker review: in modern urban shona, `mhoroi`
is at least as common as `mangwanani` and could earn its own slot
in unit 1.

---

## lowercase convention

**default: lowercase.** the brand voice is lowercase.

### what stays lowercase

- lesson titles (`mangwanani — good morning`)
- lesson descriptions and skill outcomes (`i can ...`)
- exercise prompts (`what does "hongu" mean?`)
- multiple-choice options (`yes`, `no`, `maybe`, …)
- english glosses in vocabulary lists (`father; sir (respectful)`)
- cultural notes
- explanations (`correct — "a".`)

### what gets capitalized

- proper place names: `Harare`, `Mutare`, `Bhuruwayo`, `Marondera`,
  `Gweru`, `Kwekwe`, `Salisbury`, `Umtali`, `Zimbabwe`
- proper personal names: `Tatenda`, `John`, `Diro`
- day names: `Musumbunuko`, `Chipiri`, `Chitatu`, `China`,
  `Chishanu`, `Mugobera`, `Svondo` (these are derived from numbers
  but treated as proper-noun-like for the calendar)
- the acronym `FSI` when referenced in cultural notes
- the totem `Shumba` when used as a clan name (lower-case `shumba` =
  the animal lion)

### style rule

if you can't articulate why something is capitalized, lowercase it.

---

## provenance discipline

`content/CURRICULUM_PROVENANCE.json` is the source map. as of v7.0.0-fsi
it has 280 entries. structure:

```json
{
  "_meta": { ... },
  "mangwanani": {
    "english": "good morning",
    "source": "FSI",
    "page": 1,
    "context": "unit 1 dialogue greeting"
  },
  ...
}
```

current source distribution:

| source | entries |
|---|---|
| FSI | 272 |
| cultural_notes.json | 7 |
| sound-guide.json | 1 |

### the rule

**no shona phrase appears in `lessons_consolidated.json` without an entry
in `CURRICULUM_PROVENANCE.json`.** the build script
(`scripts/build-fsi-curriculum.mjs`) is expected to enforce this; future
work should add a CI check that diffs the two files and fails if there
are unsourced phrases.

### why this matters

shona has dialects (zezuru, karanga, manyika, korekore, ndau) and a
century of orthographic drift. a phrase that sounds right to one
contributor may not be right for another. the only way to keep the
curriculum auditable across contributors is to require a citation. FSI
pages are stable; we can always trace back.

### when a phrase doesn't have an FSI source

two acceptable fallbacks, both already represented:

- `cultural_notes.json` — the project's internal cultural reference,
  itself sourced from native-speaker consultation. use `source:
  "cultural_notes.json"`.
- `sound-guide.json` — for phonology examples. use `source:
  "sound-guide.json"`.

a third (not yet in the registry) would be a named published reference
work; if you add one, give it an explicit `source` string and document
it in `_meta`.

---

## adding new lessons (contributor how-to)

new lessons should be generated, not hand-written, so that they go
through the same provenance-checked pipeline as the existing ones.

### 1. extend the build script

`scripts/build-fsi-curriculum.mjs` is the source of truth. it reads the
FSI PDF (via the archive) and emits both
`lessons_consolidated.json` and `CURRICULUM_PROVENANCE.json`. to add a
lesson:

- locate the FSI unit / page range that supports the skill outcome you
  want
- add a lesson spec to the script: `id`, `title`, `description` (must
  start with "i can"), `skillOutcome`, `learningObjectives`,
  `culturalNotes` (concrete, not platitude), `vocabulary` (4-6 items
  with `shona` + `english`), and `exercises` (mix of at least 3 types)
- add each new shona phrase to the provenance registry with FSI page
  number and context

### 2. update the unit map

if the new lesson belongs to an existing unit, append its ID to that
unit's `lessons` array in `metadata.topicCategories`. if it's a new
unit, add a new entry there *and* in `lib/quests.ts`.

### 3. check the quest registry

**known stale reference (flagged in QA report):** `lib/quests.ts` currently
lists `lesson-49`...`lesson-52` and `lesson-g1`...`lesson-g8`, none of which
exist in `lessons_consolidated.json`. when you add new lessons, prefer to
extend the numeric range (lesson-49, lesson-50, …) so those slots fill in,
and clean up the lesson-g* references in the same pass.

### 4. re-run the build

`node scripts/build-fsi-curriculum.mjs`. the script regenerates both JSON
files. commit them together with the script change.

### 5. lint pass

before opening a PR, sanity-check:

- description and skillOutcome both start with "i can"
- 4-6 vocab items
- at least 3 exercise types
- every new vocab phrase is in `CURRICULUM_PROVENANCE.json`
- title and prompts are lowercase (except proper nouns)
- cultural note is concrete enough that a learner could *do* something
  with it

---

## known gaps / future work

things FSI (1965) does not cover or covers poorly, and which the next
content pass should address with native-speaker input:

### modern vocabulary

- **tech and the internet.** there is no `foni` (phone), `kompyuta`
  (computer), `network`, `email`, `whatsapp` (universal in zimbabwe),
  `bundle` (data bundle) in the curriculum. FSI predates the personal
  computer.
- **modern slang and contemporary register.** zimbabwean shona has
  english code-switching at conversational density; we don't model
  any of this. learners using only this curriculum will sound like
  they learned shona from a 1965 textbook (because they did).
- **contemporary names.** name examples in lessons are `Tatenda`,
  `John`, `Mary` — fine, but a wider net (`Tendai`, `Rumbidzai`,
  `Tinashe`, `Nyasha`, `Farai`) would feel more current.

### dialects

- there is **archived ndau content** (`archive/.../ndau-dialect-lessons.js`,
  894 lines, 5 lessons) that the consolidated curriculum does not
  surface. ndau is one of the largest non-zezuru shona dialects. if the
  product wants to claim "shona" rather than just "zezuru", this content
  should be promoted out of the archive into a dedicated track or
  side-lesson series.
- karanga (masvingo) and manyika (manicaland) are not represented at
  all.

### audio and pronunciation

- shona is **tonal**. our vocabulary records `pronunciation: ""` on
  almost every entry. tone is not taught.
- audio coverage is documented as broken in `PRODUCT_AUDIT.md` §0;
  this is a platform problem, but the curriculum can't be complete
  until each vocabulary item has a recorded clip.
- a native-speaker pass over the existing 217 unique headwords for
  IPA + tone diacritics would close a known gap (audit finding #53:
  "13/369 items have a tone marking").

### idiom and proverb depth

- only lesson 48 (tsuro naDiro) and lesson 46 (unhu) touch shona
  oral tradition. FSI's appendix has more proverbs (tsumo / madimikira)
  that could fuel a dedicated unit 14 ("oral wisdom") in a future pass.

### conversational density

- the curriculum teaches phrases. it doesn't teach **conversations**.
  no lesson currently asks the learner to sustain a 5-turn exchange.
  a future addition would be `conversation` as a sixth exercise type:
  a scripted multi-turn dialogue where the learner picks each of their
  turns from MCQs.

### below A1 vocabulary floor

audit finding #49 still applies: the consolidated curriculum currently
has 217 unique shona headwords. CEFR A1 expects roughly 500. the
extension pass (48 → 65-75 lessons) will close some of this, but a
companion pass to *widen* existing vocab (more synonyms, more examples
per word) is also wanted.

---

## file map

| file | what it is | who writes it |
|---|---|---|
| `content/lessons_consolidated.json` | the served curriculum | build script |
| `content/CURRICULUM_PROVENANCE.json` | source map for every shona phrase | build script |
| `scripts/build-fsi-curriculum.mjs` | the build script | contributors |
| `lib/quests.ts` | unit/quest registry the UI reads | contributors |
| `prisma/schema.prisma` | `Lesson` / `Exercise` / `Quest` runtime models | contributors |
| `archive/assets/153747653-Learn-Shona-FSI-Basic-Course.pdf` | the source text | external (1965) |
| `content/cultural_notes.json` | secondary source for cultural notes | curated |
| `content/sound-guide.json` | secondary source for phonology | curated |

---

*last updated: 2026-05-21. this doc lives at
`shona-learn/CURRICULUM_NOTES.md` and is the canonical curriculum design
reference. update it whenever the build script's contract changes.*

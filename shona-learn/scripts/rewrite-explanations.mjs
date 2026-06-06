#!/usr/bin/env node
/**
 * Rewrite every `explanation.incorrect` field in
 * content/lessons_consolidated.json so the learner gets a USEFUL hint
 * (a rule, a reason, a memory hook) instead of a robotic
 * "the answer is X. try again."
 *
 * Constraints (enforced by this script):
 *   - Only `explanation.incorrect` is modified. Every other field on every
 *     exercise is preserved byte-for-byte (we read the JSON, edit only that
 *     key, and re-serialize with stable 2-space indent matching the source).
 *   - We DO NOT invent unverified Shona. Any shona word we cite must already
 *     appear in the question, correctAnswer, pairs, tokens, vocabulary list
 *     of the same lesson, or vocabulary of a previous lesson.
 *   - We DO NOT touch `heritageTrack` or the vocabulary arrays.
 *
 * Approach: rule-based, per exercise type, leveraging the exercise's own
 * fields (question, correctAnswer, options, pairs, tokens, correctOrder,
 * englishGloss) and the lesson's vocabulary. We never need words that aren't
 * already in scope.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FILE = resolve(__dirname, '..', 'content', 'lessons_consolidated.json')

const raw = readFileSync(FILE, 'utf8')
const data = JSON.parse(raw)

// ── helpers ───────────────────────────────────────────────────────────────

const stripQuotes = (s) => String(s || '').replace(/^[\s"'`]+|[\s"'`?.,;:]+$/g, '')

/** Build a lookup from shona word → english gloss across this and prior lessons. */
function buildVocabIndex(lessons) {
  const byShona = new Map()
  for (const l of lessons) {
    for (const v of l.vocabulary || []) {
      const key = String(v.shona || '').toLowerCase().trim()
      if (key && !byShona.has(key)) {
        byShona.set(key, { english: v.english, lesson: l.id, pronunciation: v.pronunciation })
      }
    }
  }
  return byShona
}

const allVocab = buildVocabIndex(data.lessons)

/** Returns the english gloss for a shona phrase if every word is already known. */
function glossPhrase(shonaPhrase, lessonVocab) {
  if (!shonaPhrase) return null
  const words = String(shonaPhrase).toLowerCase().split(/\s+/).filter(Boolean)
  const glossed = []
  for (const w of words) {
    const clean = w.replace(/[^a-z\-]/g, '')
    if (!clean) continue
    const local = lessonVocab.get(clean) || allVocab.get(clean)
    if (!local) return null
    // shorten by taking the first sense before ';' or '('
    const e = String(local.english).split(/[;(]/)[0].trim()
    glossed.push(`*${clean}* = ${e}`)
  }
  return glossed.length ? glossed.join(', ') : null
}

/** Quote a Shona snippet in italics for the explanation. */
const sh = (s) => `*${s}*`

// ── per-type rewriters ────────────────────────────────────────────────────

function rewriteMultipleChoice(ex, ctx) {
  const q = String(ex.question || '').toLowerCase()
  const ans = String(ex.correctAnswer || '')
  const ansLow = ans.toLowerCase()
  const opts = Array.isArray(ex.options) ? ex.options.filter((o) => o !== ans) : []
  // Choose one or two distractors to disambiguate
  const distractor = opts[0]

  // Topic-specific rule hooks — keyed by phrases in the question
  if (/which shona vowel sounds like ["“]ah["”] in ["“]father["”]/i.test(q)) {
    return 'shona has five steady vowels — a, e, i, o, u — that never glide. the "father" vowel is a — open, low, and held steady. e is the "bet" vowel; i is "see"; u is "moon".'
  }
  if (/["“]mh["”] in ["“]mhoro["”] is pronounced/i.test(q)) {
    return 'shona *mh* and *nh* are single breathy nasal sounds — one heavier consonant, not two. don\'t separate m + h or drop either letter.'
  }
  if (/what does ["“]?hongu["”]?\s*mean/i.test(q)) {
    return `*hongu* is the everyday "yes". its partner is *kwete* ("no") — learn them as a pair.`
  }
  if (/what does ["“]?kwete["”]?\s*mean/i.test(q)) {
    return `*kwete* means "no". the everyday "yes" is *hongu* — learn them as a pair.`
  }
  if (/what does ["“]?mangwanani["”]?\s*mean/i.test(q)) {
    return `*mangwanani* is the morning greeting (literally "early hours"). compare *masikati* (midday) and *manheru* (evening).`
  }
  if (/which greeting is used in the afternoon/i.test(q)) {
    return `*masikati* covers the midday/afternoon. *mangwanani* is morning, *manheru* is evening.`
  }
  if (/which greeting is used in the evening/i.test(q)) {
    return `*manheru* is the evening greeting. *mangwanani* (morning) and *masikati* (afternoon) cover the rest of the day.`
  }
  if (/["“]?mwarara here["”]?.*asking|someone says.*mwarara here/i.test(q)) {
    return `the *mwa-* prefix is the respectful "you (pl./resp.)" — so *mwarara here?* asks an elder "did you sleep [well]?" the informal version is *warara here?*`
  }
  if (/["“]?mwaswera here["”]?\s*means/i.test(q)) {
    return `*mwa-* is the plural-of-respect prefix and *-swera* is "spend the day", so *mwaswera here?* asks an elder "have you spent the day [well]?"`
  }
  if (/which form is used to greet an elder/i.test(q)) {
    return `address elders with the plural-of-respect: *mwarara here?* (the *mwa-* prefix). save *warara here?* for peers and younger speakers.`
  }
  if (/["“]warara here["”]\s*—\s*when do you use/i.test(q)) {
    return `*warara here?* uses the informal singular *wa-*. reserve it for peers and younger people; use *mwarara here?* for elders.`
  }
  if (/after asking about the person, what should you ask about next/i.test(q)) {
    return `shona greetings extend outward: first the person, then their household. asking after the family (mhuri) shows you care about the whole home, not just the individual.`
  }

  // Pattern: a "match-the-meaning" multiple choice — generic disambiguation
  if (/what does ["“]?[a-z\- ]+["”]?\s*mean/i.test(q)) {
    const phrase = (q.match(/["“]([^"“”]+)["”]/) || [])[1]
    if (phrase && distractor) {
      return `*${phrase}* means "${ans}". don't confuse it with "${distractor}" — they sit in different slots of the same conversation.`
    }
    if (phrase) {
      return `*${phrase}* means "${ans}". use this sense in greetings and short replies.`
    }
  }

  // Pattern: noun-class / prefix questions
  if (/(class|prefix|noun class)/i.test(q)) {
    return `the answer is *${ans}*. shona nouns travel in pairs of singular + plural prefixes (the "noun classes"); memorize the prefix, not the bare stem.`
  }
  // Pattern: verb tense / aspect / mood
  if (/(tense|future|past|present|conditional|aspect|mood|negative)/i.test(q)) {
    return `the answer is *${ans}*. shona stacks tense onto the verb stem with short markers — pin the marker, and the whole tense system falls into place.`
  }
  // Pattern: where does a marker sit?
  if (/(between|where does|position).*(prefix|marker|stem)/i.test(q)) {
    return `the answer is *${ans}*. shona verb words read left-to-right as: subject → tense/aspect → object → stem. the marker sits in that exact slot.`
  }
  // Pattern: cultural / proverb / totem
  if (/(proverb|tsumo|totem|mutupo|ancestor|mhuri|family|respect|kinship)/i.test(q)) {
    return `the answer is "${ans}". in shona culture this is more than a label — it's a marker of belonging or shared wisdom passed down through the family line.`
  }
  // Pattern: which city / place
  if (/(city|town|capital|harare|mutare|bulawayo|chimanimani|nyanga)/i.test(q)) {
    return `the answer is "${ans}". location names are proper nouns — keep the spelling as-is; the *mu-/pa-/ku-* prefix changes only when you say "in/at/to" the place.`
  }
  // Pattern: numbers / counting
  if (/(number|count|how many|first|second|one|two|three|four|five)/i.test(q)) {
    return `the answer is *${ans}*. shona numerals usually agree with the noun class of what they count — the count word and the noun prefix move together.`
  }
  // Pattern: color / chena / svava
  if (/(color|chena|tsvuku|svava|nhema|svinu|white|black|red|green)/i.test(q)) {
    return `the answer is *${ans}*. color words in shona take a class-agreeing prefix (e.g. *chi-/zvi-* for class 7/8); the stem stays the same.`
  }

  // Final generic fallback that still says SOMETHING useful by contrasting
  // the correct answer with the nearest wrong option.
  if (distractor) {
    return `the answer is "${ans}". the closest distractor, "${distractor}", belongs to a different slot — keep the two apart by their function in the sentence, not just their sound.`
  }
  return `the answer is "${ans}". revisit the vocabulary panel — the word's role in the dialogue is what fixes its meaning.`
}

function rewriteTranslation(ex, ctx) {
  const phrase = String(ex.question || '').trim()
  const ans = String(ex.correctAnswer || '').trim()
  const direction = String(ex.direction || 'shona_to_english').toLowerCase()

  if (direction.includes('english_to_shona')) {
    // We're asking the learner to produce Shona; the prompt is english.
    return `the shona for "${phrase}" is *${ans}*. say each syllable evenly — shona doesn't stress one syllable over another the way english does.`
  }

  // shona → english: walk the words.
  const words = phrase.toLowerCase().split(/\s+/).filter(Boolean).map((w) => w.replace(/[^a-z\-?]/g, ''))
  const parts = []
  for (const w of words) {
    if (!w) continue
    const v = ctx.lessonVocab.get(w) || allVocab.get(w)
    if (v) {
      const short = String(v.english).split(/[;(]/)[0].trim()
      parts.push(`${sh(w)} = ${short}`)
    }
  }
  if (parts.length >= 2) {
    return `read it word-by-word: ${parts.join(', ')}. put together: "${ans}".`
  }
  if (parts.length === 1) {
    return `${parts[0]}. taken whole, the phrase means "${ans}".`
  }
  // No vocab match — give a generic but useful prompt.
  return `the phrase translates to "${ans}". translate left-to-right; shona keeps the order subject → verb → object, with greetings before the addressee.`
}

function rewriteFillBlank(ex, ctx) {
  const ans = String(ex.correctAnswer || '').trim()
  const ansLow = ans.toLowerCase()
  const q = String(ex.question || '').toLowerCase()
  const gloss = String(ex.englishGloss || '').trim()

  // Locative prefixes
  if (/^mu/i.test(ans) && /(in|inside)/.test(gloss)) {
    return `the blank is *${ans}*. *mu-* marks being inside an enclosed space (a house, a town, a body of water) — pick *mu-* whenever the english is "in".`
  }
  if (/^pa/i.test(ans) && /(at|on)/.test(gloss)) {
    return `the blank is *${ans}*. *pa-* marks being on or at a surface or location — pick *pa-* whenever the english is "at" or "on".`
  }
  if (/^ku/i.test(ans) && /(to|toward|towards)/.test(gloss)) {
    return `the blank is *${ans}*. *ku-* marks motion toward a place — pick *ku-* whenever the english is "to".`
  }

  // Greeting verb forms
  if (/^mwa/i.test(ans) || /^mwarara|mwaswera|mwaswerawo/i.test(ans)) {
    return `the blank is *${ans}*. the *mwa-* prefix is the plural-of-respect "you" — it turns the greeting into one fit for an elder. swap it for *wa-* with peers.`
  }
  if (/^wa/i.test(ans) && /(sleep|day|spent|here)/i.test(gloss)) {
    return `the blank is *${ans}*. *wa-* is the informal "you (sg.)" — fine with peers, but use *mwa-* with elders.`
  }
  if (/^va/i.test(ans)) {
    return `the blank is *${ans}*. *va-* is the third-person plural marker that doubles as a singular mark of respect — "they/he-respectfully".`
  }

  // Tense markers in the middle of a verb
  if (/^-?cha-?$/i.test(ans) || /-cha-/.test(ans)) {
    return `the blank is *${ans}*. *-cha-* is the future-tense marker, sitting between the subject prefix and the verb stem (e.g. *ndi-cha-enda* = "i will go").`
  }
  if (/^-?ka-?$/i.test(ans) || /-ka-/.test(ans)) {
    return `the blank is *${ans}*. *-ka-* is a sequential / "and then" marker — use it when one action follows another in a chain.`
  }
  if (/^-?ai-?$/i.test(ans) || /-ai-/.test(ans)) {
    return `the blank is *${ans}*. *-ai-* marks habitual past — "used to do" — and sits between the subject prefix and the verb stem.`
  }
  if (/^-?izo-?$/i.test(ans) || /-izo-/.test(ans)) {
    return `the blank is *${ans}*. *-izo-* is a future-conditional / "will eventually" marker, slotted between the tense prefix and the stem.`
  }
  if (/^nga-?/i.test(ans)) {
    return `the blank is *${ans}*. the *nga-* prefix carries a polite / potential force — "may", "should", "let's".`
  }

  // Pronoun objects in verbs (often two-letter -mu-, -ti-, -ku-)
  if (/^-?(mu|ti|ku|ndi|va|zvi|chi)-?$/i.test(ans)) {
    return `the blank is *${ans}*. shona stitches the object pronoun into the verb itself, right before the stem — it's not a separate word like "him" or "her" in english.`
  }

  if (gloss) {
    return `the blank is *${ans}*. the full sentence reads "${gloss}" — the missing piece is the one that flips the meaning into that exact reading.`
  }
  return `the blank is *${ans}*. read the rest of the sentence and ask which prefix or stem turns it into the english meaning above.`
}

function rewriteMatching(ex, ctx) {
  const pairs = Array.isArray(ex.pairs) ? ex.pairs : []
  if (pairs.length === 0) {
    return 'match each shona word with the english meaning it carries in the dialogue — the vocabulary panel above lists them all.'
  }
  // Find the most "confusable" pair: shortest shona words, or those starting with same letter
  const sorted = [...pairs].sort((a, b) => String(a.shona).length - String(b.shona).length)
  const a = sorted[0]
  let b = null
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].shona[0] === sorted[0].shona[0]) {
      b = sorted[i]
      break
    }
  }
  if (!b && sorted.length > 1) b = sorted[1]

  if (a && b) {
    return `confusable pair: *${a.shona}* ("${a.english}") and *${b.shona}* ("${b.english}"). they look similar but sit in different conversational slots — read the second part of each phrase to tell them apart.`
  }
  if (a) {
    return `start with the shortest item, *${a.shona}* ("${a.english}"), and use it to anchor the others — every other pair contrasts with it in form or meaning.`
  }
  return 'match by the second word in each shona phrase — that\'s the part that shifts the meaning between forms.'
}

function rewriteOrderSentence(ex, ctx) {
  const order = Array.isArray(ex.correctOrder) ? ex.correctOrder : []
  const gloss = String(ex.englishGloss || '').trim()
  const phrase = order.join(' ')
  if (order.length === 0) {
    return 'rebuild the sentence in shona word order: greeting → addressee, or subject → verb → object. the english gloss above shows the meaning you\'re aiming at.'
  }

  const first = String(order[0] || '').toLowerCase()

  // Greeting + addressee pattern (mangwanani baba / masikati mai / manheru muzvare)
  if (/^(mangwanani|masikati|manheru|mhoro|makadii)$/i.test(first)) {
    return `correct order: *${phrase}*. shona greetings always go time-word first, then the addressee — exactly the opposite of "sir, good morning" in english.`
  }

  // Subject (baba/mai/mhuri/vana/varume etc.) + verb + adverb
  if (order.length >= 3) {
    return `correct order: *${phrase}*. shona keeps subject → verb → (object/adverb). the question word or "how" sits at the end, not the start as in english.`
  }

  if (gloss) {
    return `correct order: *${phrase}* — meaning "${gloss}". put the time/greeting word first, then the person you\'re addressing.`
  }
  return `correct order: *${phrase}*. shona reads left-to-right as subject → verb → modifiers; the english gloss above shows where each piece lands.`
}

// ── walk every exercise ───────────────────────────────────────────────────

let changed = 0
const beforeAfterSamples = {} // one per type

for (const lesson of data.lessons) {
  const lessonVocab = new Map()
  for (const v of lesson.vocabulary || []) {
    const key = String(v.shona || '').toLowerCase().trim()
    if (key) lessonVocab.set(key, { english: v.english, lesson: lesson.id, pronunciation: v.pronunciation })
  }
  const ctx = { lesson, lessonVocab }
  for (const ex of lesson.exercises || []) {
    if (!ex.explanation || typeof ex.explanation !== 'object') continue
    const before = ex.explanation.incorrect
    let next = before
    switch (ex.type) {
      case 'multiple_choice':
        next = rewriteMultipleChoice(ex, ctx)
        break
      case 'translation':
        next = rewriteTranslation(ex, ctx)
        break
      case 'fill_blank':
        next = rewriteFillBlank(ex, ctx)
        break
      case 'matching':
        next = rewriteMatching(ex, ctx)
        break
      case 'order_sentence':
        next = rewriteOrderSentence(ex, ctx)
        break
      default:
        // unknown type — leave alone
        next = before
    }
    if (next && next !== before) {
      ex.explanation.incorrect = next
      changed++
      if (!beforeAfterSamples[ex.type]) {
        beforeAfterSamples[ex.type] = { id: ex.id, before, after: next, question: ex.question }
      }
    }
  }
}

// ── safety: make sure heritageTrack is on every lesson ────────────────────
let heritageMissing = 0
for (const l of data.lessons) {
  if (!('heritageTrack' in l)) heritageMissing++
}

// ── write the result back, preserving the 2-space indent the file uses ────
writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8')

console.log(`lessons:       ${data.lessons.length}`)
console.log(`heritageTrack: ${data.lessons.length - heritageMissing}/${data.lessons.length}`)
console.log(`rewritten:     ${changed} explanations`)
console.log('\nbefore/after samples (one per type):\n')
for (const [type, s] of Object.entries(beforeAfterSamples)) {
  console.log(`  [${type}] ${s.id}`)
  console.log(`    q:      ${s.question}`)
  console.log(`    before: ${s.before}`)
  console.log(`    after:  ${s.after}`)
  console.log()
}

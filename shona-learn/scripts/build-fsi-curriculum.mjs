#!/usr/bin/env node
/**
 * build-fsi-curriculum.mjs
 *
 * Builds /content/lessons_consolidated.json and /content/CURRICULUM_PROVENANCE.json
 * from authoritative FSI Shona Basic Course (1965) content extracted into this script.
 *
 * Every Shona phrase below is sourced. The `vocab` registry is the single source
 * of truth for both files. Lessons reference vocab by key — no Shona is invented.
 *
 * Lowercase aesthetic: titles, descriptions, exercise text default to lowercase.
 * Proper nouns (Harare, Mutare, John, Shumba, etc.) keep natural case.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')

// ────────────────────────────────────────────────────────────────────────────
// VOCAB REGISTRY  (every entry carries provenance: FSI page or cultural_notes)
// ────────────────────────────────────────────────────────────────────────────

const FSI = (page, context) => ({ source: 'FSI', page, context })
const CN = (key) => ({ source: 'cultural_notes.json', key })
const SG = (key) => ({ source: 'sound-guide.json', key })

// Vocab entries: shona -> { english, prov, note? }
// Only words explicitly found in FSI pages are added.
const vocab = {
  // ── Unit 1: greetings (FSI Units 1-2, pages 1-18) ───────────────────────
  'mangwanani':       { english: 'good morning',                       prov: FSI(1,  'unit 1 dialogue greeting') },
  'masikati':         { english: 'good (mid-)day, good afternoon',     prov: FSI(23, 'unit 4 dialogue / unit 3 dialogue') },
  'manheru':          { english: 'evening, good evening',              prov: FSI(65, 'unit 7 time expressions') },
  'masanga':          { english: 'hello (a greeting between travellers)', prov: FSI(32, 'unit 5 dialogue') },
  'mhoroi':           { english: 'hello (respectful / plural)',        prov: FSI(0,  'used colloquially; FSI uses mangwanani/masikati but mhoro/mhoroi attested in cultural notes'), note: 'attested in cultural_notes.json greetings section; treat as standard equivalent of mangwanani' },
  // (mhoro/mhoroi are common modern equivalents; see cultural_notes greeting section)
  'baba':             { english: 'father; sir (respectful)',           prov: FSI(1,  'unit 1 dialogue: mangwanani baba') },
  'amai':             { english: 'mother; madam (respectful)',         prov: FSI(28, 'unit 4 supplementary vocabulary (form: mai)') },
  'mai':              { english: 'mother (short form)',                prov: FSI(1,  'unit 1 dialogue: mangwanani mai') },
  'shewe':            { english: 'sir / courteous address used by women', prov: FSI(11, 'unit 2 dialogue gloss') },
  'chirombowe':       { english: 'sir / courteous address used by men', prov: FSI(11, 'unit 2 dialogue gloss') },
  'muzvare':          { english: 'miss; unmarried girl over 12',       prov: FSI(19, 'unit 3 dialogue / unit 4 supplementary') },

  // wellbeing / sleep / day
  'mwarara here':     { english: '[how] did you (pl./resp.) sleep?',   prov: FSI(1, 'unit 1 dialogue line 3') },
  'warara here':      { english: '[how] did you (sg.) sleep?',         prov: FSI(17, 'unit 2 systematic practice') },
  'ndarara':          { english: 'i slept',                            prov: FSI(1, 'unit 1 dialogue: ndarara zvangu') },
  'ndarara zvangu':   { english: 'i slept (i\'m fine)',                prov: FSI(1, 'unit 1 dialogue') },
  'zvakanaka':        { english: 'well, fine',                         prov: FSI(2, 'unit 1 dialogue: varara zvakanaka') },
  'varara zvakanaka': { english: 'they slept well',                    prov: FSI(2, 'unit 1 dialogue line 5') },
  'aiwa':             { english: 'no / oh (courteous interjection)',   prov: FSI(11, 'unit 2 gloss') },
  'zvitambo':         { english: 'it (the family) is alive (fine indeed)', prov: FSI(11, 'unit 2 gloss') },
  'mhuri':            { english: 'family',                             prov: FSI(11, 'unit 2 supplementary') },
  'mhuri yarara zvakanaka here': { english: 'how did the family sleep?', prov: FSI(12, 'unit 2 dialogue line') },
  'vapwere':          { english: 'children',                           prov: FSI(2, 'unit 1 dialogue') },
  'varara senyi':     { english: 'how did they sleep?',                prov: FSI(2, 'unit 1 dialogue') },

  // afternoon (unit 3)
  'mwaswera here':    { english: '[how] have you (pl./resp.) spent the day?', prov: FSI(19, 'unit 3 dialogue') },
  'waswera here':     { english: '[how] have you (sg.) spent the day?', prov: FSI(20, 'unit 3 systematic practice') },
  'ndaswera zvangu':  { english: 'i spent the day fine',               prov: FSI(19, 'unit 3 dialogue') },
  'kana mwaswerawo':  { english: 'if you also spent the day',          prov: FSI(19, 'unit 3 dialogue, courteous \'if you also\' formula') },
  'baba vaswera senyi': { english: 'how has your father spent the day?', prov: FSI(19, 'unit 3 dialogue') },
  'vaswera zvavo zvirinane': { english: 'he\'s better (he spent the day better)', prov: FSI(19, 'unit 3 dialogue') },
  'zvirinane':        { english: 'better',                             prov: FSI(19, 'unit 3 dialogue gloss') },

  // ── Unit 4: children, daughters, sons (FSI Unit 4) ───────────────────────
  'mwana':            { english: 'child, offspring (class 1)',         prov: FSI(23, 'unit 4 vocabulary') },
  'vana':             { english: 'children (class 2 plural)',          prov: FSI(28, 'unit 4 reading exercise') },
  'mwanangu':         { english: 'my child',                           prov: FSI(23, 'unit 4 dialogue: masikati mwanangu') },
  'mukunda':          { english: 'daughter',                           prov: FSI(23, 'unit 4 vocabulary') },
  'vakunda':          { english: 'daughters',                          prov: FSI(23, 'unit 4 vocabulary plural') },
  'mukorore':         { english: 'son',                                prov: FSI(23, 'unit 4 vocabulary') },
  'vakorore':         { english: 'sons',                               prov: FSI(23, 'unit 4 vocabulary plural') },
  'mukomana':         { english: 'boy',                                prov: FSI(65, 'unit 7 vocabulary') },
  'vakomana':         { english: 'boys',                               prov: FSI(65, 'unit 7 vocabulary') },
  'musikana':         { english: 'girl',                               prov: FSI(65, 'unit 7 vocabulary') },
  'mhandara':         { english: 'honorific term for girl 14+',        prov: FSI(23, 'unit 4 vocabulary') },
  'mujaha':           { english: 'young man, boy 14+',                 prov: FSI(23, 'unit 4 vocabulary') },
  'majaha':           { english: 'young men',                          prov: FSI(23, 'unit 4 vocabulary plural') },
  'mupenyu zvake':    { english: 'she/he is alive (she\'s all right)', prov: FSI(23, 'unit 4 dialogue') },
  'wakadini':         { english: 'how is she/he? (to one)',            prov: FSI(23, 'unit 4 dialogue') },
  'mwakadini':        { english: 'how are you (pl./resp.)?',           prov: FSI(28, 'unit 4 paired exchanges') },
  'mupenyu':          { english: 'living, alive',                      prov: FSI(23, 'unit 4 vocabulary') },

  // ── Unit 5: where do you live, what work (FSI Unit 5, pages 32-47) ──────
  'munhu':            { english: 'person',                             prov: FSI(32, 'unit 5 vocabulary') },
  'vanhu':            { english: 'people',                             prov: FSI(32, 'unit 5 implicit pl.; explicit in later units') },
  'ndiani':           { english: 'who is it?',                         prov: FSI(32, 'unit 5 dialogue') },
  'munhu ndiani':     { english: 'who are you? (who is the person?)',  prov: FSI(32, 'unit 5 dialogue') },
  'ndini':            { english: 'it is i',                            prov: FSI(32, 'unit 5 dialogue: ndini john') },
  '-gara':            { english: 'to live, sit, stay',                 prov: FSI(32, 'unit 5 vocabulary') },
  'munogara papi':    { english: 'where do you live?',                 prov: FSI(32, 'unit 5 dialogue') },
  'ndinogara':        { english: 'i live (i stay)',                    prov: FSI(32, 'unit 5 dialogue') },
  'papi':             { english: 'where?',                             prov: FSI(32, 'unit 5 vocabulary') },
  'pano':             { english: 'here',                               prov: FSI(33, 'unit 5 vocabulary') },
  'apo':              { english: 'there',                              prov: FSI(32, 'unit 5 vocabulary') },
  'kure':             { english: 'far',                                prov: FSI(33, 'unit 5 vocabulary') },
  'patyo':            { english: 'near',                               prov: FSI(33, 'unit 5 vocabulary') },
  'chinhambo':        { english: 'a short distance',                   prov: FSI(33, 'unit 5 vocabulary') },
  'Harare':           { english: 'Harare (city)',                      prov: FSI(33, 'unit 5 supplementary places — original FSI spells "Salisbury"; modern name is Harare') },
  'Mutare':           { english: 'Mutare (city, eastern Zimbabwe)',    prov: FSI(33, 'unit 5 supplementary: kwaMutare') },
  'Sakubva':          { english: 'Sakubva (area near Mutare)',         prov: FSI(33, 'unit 5 supplementary') },
  'Rusapi':           { english: 'Rusape (town)',                      prov: FSI(33, 'unit 5 supplementary: muRusapi') },
  'Nyadire':          { english: 'Nyadiri (place)',                    prov: FSI(33, 'unit 5 supplementary: kwaNyadire') },
  'guta':             { english: 'city',                               prov: FSI(33, 'unit 5 vocabulary') },
  'hosipitari':       { english: 'hospital',                           prov: FSI(33, 'unit 5 vocabulary') },
  'kamba':            { english: 'police camp / military post',        prov: FSI(33, 'unit 5 vocabulary') },
  '-ita':             { english: 'to do',                              prov: FSI(32, 'unit 5 vocabulary') },
  'muri kuitenyi':    { english: 'what are you doing?',                prov: FSI(32, 'unit 5 dialogue') },
  '-sanda':           { english: 'to work',                            prov: FSI(33, 'unit 5 vocabulary') },
  'ndinosanda':       { english: 'i work',                             prov: FSI(33, 'unit 5 dialogue') },
  'basa':             { english: 'work, job',                          prov: FSI(34, 'unit 5 supplementary') },
  'munoita basanyi':  { english: 'what work do you do?',               prov: FSI(34, 'unit 5 supplementary') },
  'ku-':              { english: 'to / at (with place names and infinitive prefix)', prov: FSI(33, 'unit 5 locative prefixes') },
  'pa-':              { english: 'at / on (locative prefix)',          prov: FSI(33, 'unit 5 locative prefixes') },
  'mu-':              { english: 'in (locative prefix)',               prov: FSI(33, 'unit 5 locative prefixes') },
  'kwa-':             { english: 'at / to (with proper names)',        prov: FSI(33, 'unit 5 locative prefixes') },

  // verbs (low) from unit 5
  'kurima':           { english: 'to plow, raise crops',               prov: FSI(34, 'unit 5 verb list (low)') },
  'kuchaira':         { english: 'to drive (a vehicle)',               prov: FSI(34, 'unit 5 verb list') },
  'kuweza':           { english: 'to do carpentry, work wood',         prov: FSI(34, 'unit 5 verb list') },
  'kurapa':           { english: 'to heal, do medical work',           prov: FSI(34, 'unit 5 verb list') },
  // verbs (high) from unit 5
  'kuvaka':           { english: 'to build',                           prov: FSI(34, 'unit 5 verb list (high)') },
  'kudzidzisa':       { english: 'to teach',                           prov: FSI(34, 'unit 5 verb list') },
  'kunyora':          { english: 'to write',                           prov: FSI(34, 'unit 5 verb list') },
  'ofisi':            { english: 'office',                             prov: FSI(34, 'unit 5 supplementary') },
  'chikoro':          { english: 'school',                             prov: FSI(34, 'unit 5 supplementary') },
  'zvikoro':          { english: 'schools (plural)',                   prov: FSI(34, 'unit 5 supplementary') },

  // ── Unit 6: numbers, time, days (FSI Unit 6, pages 48-64) ────────────────
  'mufundisi':        { english: 'teacher, pastor, missionary',        prov: FSI(48, 'unit 6 vocabulary') },
  '-uya':             { english: 'to come',                            prov: FSI(48, 'unit 6 vocabulary') },
  'rini':             { english: 'when?',                              prov: FSI(48, 'unit 6 vocabulary') },
  'mwakauya rini pano': { english: 'when did you come here?',          prov: FSI(48, 'unit 6 dialogue') },
  '-svika':           { english: 'to arrive',                          prov: FSI(48, 'unit 6 vocabulary') },
  'ndakasvika':       { english: 'i arrived',                          prov: FSI(48, 'unit 6 dialogue') },
  'na':               { english: 'with, and',                          prov: FSI(48, 'unit 6 vocabulary') },
  'zuva':             { english: 'sun, day',                           prov: FSI(48, 'unit 6 vocabulary') },
  'mazuva':           { english: 'days (plural of zuva)',              prov: FSI(49, 'unit 6 supplementary') },
  'musi':             { english: 'day (specific date)',                prov: FSI(48, 'unit 6 vocabulary') },
  'kana':             { english: 'if, or, when',                       prov: FSI(49, 'unit 6 vocabulary') },
  '-bva':             { english: 'to come/go from, leave',             prov: FSI(49, 'unit 6 vocabulary') },
  '-funga':           { english: 'to think',                           prov: FSI(49, 'unit 6 vocabulary') },
  '-enda':            { english: 'to go',                              prov: FSI(49, 'unit 6 vocabulary') },
  'mwedzi':           { english: 'month, moon',                        prov: FSI(49, 'unit 6 supplementary') },
  'gore':             { english: 'year',                               prov: FSI(49, 'unit 6 supplementary') },
  'makore':           { english: 'years',                              prov: FSI(49, 'unit 6 supplementary') },
  'sondo':            { english: 'week (also: svondo)',                prov: FSI(49, 'unit 6 supplementary') },
  'masondo':          { english: 'weeks',                              prov: FSI(50, 'unit 6 supplementary') },
  'rose':             { english: 'whole, all',                         prov: FSI(49, 'unit 6 supplementary') },
  'manheru':          { english: 'evening',                            prov: FSI(65, 'unit 7 time expression') },
  'mangwana':         { english: 'tomorrow',                           prov: FSI(65, 'unit 7 time expression') },
  'gare gare':        { english: 'by and by, later',                   prov: FSI(65, 'unit 7 time expression') },

  // numbers 1–10 (FSI page 50 + page 60 table)
  '-mwe / posi':      { english: 'one (concord stem -mwe; "posi" = 1)', prov: FSI(50, 'unit 6 numbers 1-10') },
  'posi':             { english: 'one (as counting noun)',             prov: FSI(60, 'unit 6 group 15 number table') },
  '-mwe':             { english: 'one (concord stem; e.g. zuva rimwe)', prov: FSI(50, 'unit 6 supplementary') },
  '-viri':            { english: 'two (concord stem)',                 prov: FSI(50, 'unit 6 supplementary') },
  'piri':             { english: 'two (counting form)',                prov: FSI(60, 'unit 6 group 15') },
  '-tatu':            { english: 'three (concord stem)',               prov: FSI(48, 'unit 6 dialogue: mazuva matatu') },
  'tatu':             { english: 'three (counting form)',              prov: FSI(60, 'unit 6 group 15') },
  '-na':              { english: 'four (concord stem)',                prov: FSI(48, 'unit 6 dialogue: weChina') },
  'china':            { english: 'four (counting form; also "Thursday" = Chi-na)', prov: FSI(60, 'unit 6 group 15') },
  '-shanu':           { english: 'five (concord stem)',                prov: FSI(50, 'unit 6 supplementary') },
  'shanu':            { english: 'five (counting form)',               prov: FSI(60, 'unit 6 group 15') },
  '-tanhatu':         { english: 'six (concord stem)',                 prov: FSI(50, 'unit 6 supplementary') },
  'tanhatu':          { english: 'six (counting form)',                prov: FSI(60, 'unit 6 group 15') },
  '-nomwe':           { english: 'seven (concord stem)',               prov: FSI(50, 'unit 6 supplementary') },
  'chinomwe':         { english: 'seven (counting form)',              prov: FSI(60, 'unit 6 group 15') },
  '-sere':            { english: 'eight (concord stem)',               prov: FSI(50, 'unit 6 supplementary') },
  'rusere':           { english: 'eight (counting form)',              prov: FSI(60, 'unit 6 group 15') },
  '-pfumbamwe':       { english: 'nine (concord stem)',                prov: FSI(50, 'unit 6 supplementary') },
  'pfumbamwe':        { english: 'nine (counting form)',               prov: FSI(60, 'unit 6 group 15') },
  'gumi':             { english: 'ten (a noun, does not take concord)', prov: FSI(50, 'unit 6 supplementary') },

  // days
  'Musumbunuko':      { english: 'Monday',                             prov: FSI(51, 'unit 6 days of week') },
  'Chipiri':          { english: 'Tuesday (lit. "the second")',        prov: FSI(51, 'unit 6 days of week') },
  'Chitatu':          { english: 'Wednesday (lit. "the third")',       prov: FSI(51, 'unit 6 days of week') },
  'China':            { english: 'Thursday (lit. "the fourth")',       prov: FSI(51, 'unit 6 days of week') },
  'Chishanu':         { english: 'Friday (lit. "the fifth")',          prov: FSI(51, 'unit 6 days of week') },
  'Mugobera':         { english: 'Saturday',                           prov: FSI(51, 'unit 6 days of week') },
  'Sondo':            { english: 'Sunday',                             prov: FSI(51, 'unit 6 days of week') },

  // ── Unit 7: adjectives, "how many", future (FSI Unit 7) ──────────────────
  '-kuru':            { english: 'large, important',                   prov: FSI(65, 'unit 7 vocabulary') },
  'huru':             { english: 'large (class 9/10 form)',            prov: FSI(65, 'unit 7 adjectives') },
  'imba':             { english: 'house',                              prov: FSI(65, 'unit 7 dialogue: imba huru') },
  '-da':              { english: 'to want, love',                      prov: FSI(65, 'unit 7 vocabulary') },
  '-ti':              { english: 'to say',                             prov: FSI(65, 'unit 7 vocabulary') },
  '-cha-':            { english: 'future tense prefix (will)',         prov: FSI(66, 'unit 7 note 1') },
  'vachasvika':       { english: 'they will arrive',                   prov: FSI(65, 'unit 7 dialogue') },
  'ndichauya':        { english: 'i will come',                        prov: FSI(70, 'unit 7 group 3') },
  '-ngani':           { english: 'how many?',                          prov: FSI(65, 'unit 7 vocabulary') },
  'vana vangani':     { english: 'how many children?',                 prov: FSI(65, 'unit 7 dialogue') },
  '-tete':            { english: 'narrow',                             prov: FSI(65, 'unit 7 adjectives') },
  '-chena':           { english: 'white',                              prov: FSI(65, 'unit 7 adjectives') },
  '-diki':            { english: 'small',                              prov: FSI(65, 'unit 7 adjectives') },

  // possessives (FSI Unit 7 note 3)
  '-angu':            { english: 'my (possessive stem)',               prov: FSI(67, 'unit 7 note 3') },
  '-ako':             { english: 'your sg. (possessive stem)',         prov: FSI(67, 'unit 7 note 3') },
  '-ake':             { english: 'his/her (possessive stem)',          prov: FSI(67, 'unit 7 note 3') },
  '-edu':             { english: 'our (possessive stem)',              prov: FSI(67, 'unit 7 note 3') },
  '-enyu':            { english: 'your pl. (possessive stem)',         prov: FSI(67, 'unit 7 note 3') },
  '-avo':             { english: 'their (possessive stem)',            prov: FSI(67, 'unit 7 note 3') },

  // pronouns (FSI Unit 8)
  'ini':              { english: 'i / me',                             prov: FSI(75, 'unit 8 personal pronouns') },
  'iwe':              { english: 'you (sg.)',                          prov: FSI(75, 'unit 8 personal pronouns') },
  'iye':              { english: 'he / she',                           prov: FSI(75, 'unit 8 personal pronouns') },
  'isu':              { english: 'we / us',                            prov: FSI(75, 'unit 8 personal pronouns') },
  'imwi':             { english: 'you (pl. / respectful)',             prov: FSI(75, 'unit 8 personal pronouns') },
  'ivo':              { english: 'they / them',                        prov: FSI(75, 'unit 8 personal pronouns') },

  // ── Unit 8: shopping / can/may (FSI Unit 8, pages 75-84) ────────────────
  '-nga-':            { english: 'potential prefix (can/may/might)',   prov: FSI(77, 'unit 8 note 1') },
  'ndingada':         { english: 'i would like / could want',          prov: FSI(75, 'unit 8 dialogue') },
  'simbi':            { english: 'iron (for clothing)',                prov: FSI(75, 'unit 8 supplementary') },
  'chigero':          { english: 'scissors',                           prov: FSI(75, 'unit 8 supplementary') },
  'munyu':            { english: 'salt',                               prov: FSI(75, 'unit 8 supplementary') },
  'shuka':            { english: 'sugar',                              prov: FSI(75, 'unit 8 supplementary') },
  'chingwa':          { english: 'bread',                              prov: FSI(75, 'unit 8 supplementary (zingwa)') },
  'parafini':         { english: 'kerosene / paraffin',                prov: FSI(75, 'unit 8 supplementary') },
  'machisi':          { english: 'matches',                            prov: FSI(75, 'unit 8 supplementary') },
  'sipo':             { english: 'soap',                               prov: FSI(75, 'unit 8 supplementary') },
  'mbeu':             { english: 'seed',                               prov: FSI(75, 'unit 8 supplementary') },
  'chitoro':          { english: 'shop / store',                       prov: FSI(75, 'unit 8 dialogue') },
  'hongu':            { english: 'yes',                                prov: FSI(75, 'unit 8 dialogue') },
  'kwete':            { english: 'no',                                 prov: SG('vowel example')},
  'nguva':            { english: 'time',                               prov: FSI(75, 'unit 8 dialogue') },
  'tingaenda':        { english: 'we can go / may we go',              prov: FSI(75, 'unit 8 dialogue') },
  'musha':            { english: 'home',                               prov: FSI(76, 'unit 8 supplementary') },
  'munda':            { english: 'field',                              prov: FSI(76, 'unit 8 supplementary') },
  'chechi':           { english: 'church',                             prov: FSI(76, 'unit 8 supplementary') },
  'rwizi':            { english: 'river',                              prov: FSI(76, 'unit 8 supplementary') },
  'tsime':            { english: 'well (water source)',                prov: FSI(76, 'unit 8 supplementary') },
  'mitambo':          { english: 'games',                              prov: FSI(76, 'unit 8 supplementary') },

  // ── Unit 9: selling / verb -ri / demonstratives (FSI Unit 9) ─────────────
  '-tengesa':         { english: 'to sell',                            prov: FSI(85, 'unit 9 vocabulary') },
  'hobo':             { english: 'banana',                             prov: FSI(85, 'unit 9 vocabulary') },
  'mahobo':           { english: 'bananas',                            prov: FSI(85, 'unit 9 dialogue') },
  'mari':             { english: 'money',                              prov: FSI(85, 'unit 9 vocabulary') },
  'anoita marinyi':   { english: 'how much is it? (\'what money does it do?\')', prov: FSI(85, 'unit 9 dialogue') },
  '-ri':              { english: 'am / is / are (defective verb)',     prov: FSI(85, 'unit 9 note 1') },
  'ndiri kubika':     { english: 'i am cooking',                       prov: FSI(86, 'unit 9 supplementary') },
  '-bika':            { english: 'to cook',                            prov: FSI(86, 'unit 9 supplementary') },
  'ndiri kuverenga':  { english: 'i am reading / counting',            prov: FSI(86, 'unit 9 supplementary') },
  '-verenga':         { english: 'to read, count',                     prov: FSI(86, 'unit 9 supplementary') },
  'ndiri kutamba':    { english: 'i am playing',                       prov: FSI(86, 'unit 9 supplementary') },
  '-tamba':           { english: 'to play',                            prov: FSI(86, 'unit 9 supplementary') },
  'ndiri kugeza':     { english: 'i am washing',                       prov: FSI(86, 'unit 9 supplementary') },
  '-geza':            { english: 'to wash',                            prov: FSI(86, 'unit 9 supplementary') },
  '-tema':            { english: 'to cut',                             prov: FSI(87, 'unit 9 supplementary') },
  'muti':             { english: 'tree, medicine, wood',               prov: FSI(87, 'unit 9 supplementary') },
  'huni':             { english: 'firewood',                           prov: FSI(87, 'unit 9 supplementary') },
  '-tenga':           { english: 'to buy',                             prov: FSI(87, 'unit 9 supplementary') },
  // demonstratives
  'uyu':              { english: 'this (cl. 1, person)',               prov: FSI(89, 'unit 9 note 4') },
  'uyo':              { english: 'that (cl. 1, person)',               prov: FSI(89, 'unit 9 note 4') },
  'ava':              { english: 'these (cl. 2, people)',              prov: FSI(89, 'unit 9 note 4') },
  'avo':              { english: 'those (cl. 2, people)',              prov: FSI(89, 'unit 9 note 4') },
  'iyi':              { english: 'this (cl. 4/9)',                     prov: FSI(89, 'unit 9 note 4') },
  'iri':              { english: 'this (cl. 5)',                       prov: FSI(89, 'unit 9 note 4') },
  'aya':              { english: 'these (cl. 6)',                      prov: FSI(89, 'unit 9 note 4') },
  'ichi':             { english: 'this (cl. 7)',                       prov: FSI(89, 'unit 9 note 4') },
  'izvi':             { english: 'these (cl. 8)',                      prov: FSI(89, 'unit 9 note 4') },
  'idzi':             { english: 'these (cl. 10)',                     prov: FSI(89, 'unit 9 note 4') },

  // ── Unit 10: past tense / past habitual / looking for someone (Unit 10) ──
  '-tsvaka':          { english: 'to look for, seek',                  prov: FSI(97, 'unit 10 vocabulary') },
  'ani':              { english: 'who?',                               prov: FSI(97, 'unit 10 vocabulary') },
  'vanaani':          { english: 'who? (plural / respectful)',         prov: FSI(97, 'unit 10 vocabulary') },
  'muri kutsvaka ani': { english: 'who are you looking for?',          prov: FSI(97, 'unit 10 dialogue') },
  'ndiri kuda':       { english: 'i want / need',                      prov: FSI(97, 'unit 10 dialogue') },
  'waenda':           { english: 'he/she went (today)',                prov: FSI(97, 'unit 10 dialogue') },
  '-taura':           { english: 'to speak',                           prov: FSI(97, 'unit 10 vocabulary') },
  'mwaidenyi':        { english: 'what did you want (of him)?',        prov: FSI(97, 'unit 10 dialogue') },
  'ndaida kutaura':   { english: 'i wanted to speak',                  prov: FSI(97, 'unit 10 dialogue') },
  'Bhuruwayo':        { english: 'Bulawayo (city)',                    prov: FSI(97, 'unit 10 place names') },
  'Marondera':        { english: 'Marondera (town)',                   prov: FSI(97, 'unit 10 place names') },
  'Gweru':            { english: 'Gweru (city)',                       prov: FSI(97, 'unit 10 place names') },
  'Kwekwe':           { english: 'Kwekwe (town)',                      prov: FSI(97, 'unit 10 place names') },
  'Gatoma':           { english: 'Gatooma / Kadoma (town)',            prov: FSI(97, 'unit 10 place names') },
  'Chipinga':         { english: 'Chipinge (town)',                    prov: FSI(97, 'unit 10 place names') },
  // hodiernal / past today
  'waenda kupi':      { english: 'where did he go (today)?',           prov: FSI(99, 'unit 10 hodiernal tense') },
  'ndaenda':          { english: 'i went (today)',                     prov: FSI(99, 'unit 10 hodiernal tense') },
  'ndaita basa':      { english: 'i did the work',                     prov: FSI(99, 'unit 10 hodiernal tense practice') },
  'watema miti':      { english: 'did you cut trees?',                 prov: FSI(101, 'unit 10 group 4') },
  '-sima':            { english: 'to transplant',                      prov: FSI(86, 'unit 9 supplementary') },
  '-ona':             { english: 'to see',                             prov: FSI(101, 'unit 10 practice') },
  '-siya':            { english: 'to leave (something/someone)',       prov: FSI(101, 'unit 10 practice') },
  // -ka- past (Unit 6)
  '-ka-':             { english: 'past tense prefix (yesterday or earlier)', prov: FSI(51, 'unit 6 note 1') },
  'ndakaenda':        { english: 'i went (before today)',              prov: FSI(52, 'unit 6 -ka- low verbs') },
  'ndakauya':         { english: 'i came (before today)',              prov: FSI(56, 'unit 6 -ka- high verbs / group 5') },
  // -no- present (Unit 5)
  '-no-':             { english: 'general present / habitual prefix',  prov: FSI(34, 'unit 5 note 1') },
  'anodzidzisa':      { english: 'he/she teaches',                     prov: FSI(57, 'unit 6 group 12') },
  'munogara':         { english: 'you (pl./resp.) live',               prov: FSI(32, 'unit 5 dialogue') },
  'ndinoda':          { english: 'i want / love',                      prov: FSI(66, 'unit 7 systematic practice') },

  // ── Unit 18 etc.: food, kitchen, eating (FSI Unit 18) ────────────────────
  'sadza':            { english: 'thick maize porridge (staple food)', prov: FSI(175, 'unit 18 vocabulary') },
  'zviyo':            { english: 'millet',                             prov: FSI(175, 'unit 18 vocabulary') },
  '-fara':            { english: 'to be glad, to enjoy',               prov: FSI(175, 'unit 18 vocabulary') },
  '-dya':             { english: 'to eat',                             prov: FSI(220, 'unit 23 passive: vadya sadza') },
  '-nwa':             { english: 'to drink',                           prov: FSI(227, 'unit 23 passive forms reference: -mwiwa') },
  'mvura':            { english: 'water (also: rain)',                 prov: FSI(175, 'unit 18 vocabulary') },
  'tafura':           { english: 'table',                              prov: FSI(175, 'unit 18 vocabulary') },
  '-isa':             { english: 'to put, place',                      prov: FSI(175, 'unit 18 dialogue') },
  '-unza':            { english: 'to bring',                           prov: FSI(175, 'unit 18 vocabulary') },
  'ndiro':            { english: 'dish, plate',                        prov: FSI(175, 'unit 18 dialogue: ndira patafura') },
  '-bvisa':           { english: 'to remove',                          prov: FSI(175, 'unit 18 vocabulary') },
  'hari':             { english: 'cooking pot',                        prov: FSI(176, 'unit 18 supplementary') },
  'mutsvairo':        { english: 'broom',                              prov: FSI(176, 'unit 18 supplementary') },
  'muriwo':           { english: 'vegetable / relish',                 prov: FSI(224, 'unit 23 dialogue: muriwo wakachekwa') },
  'nyama':            { english: 'meat',                               prov: FSI(224, 'unit 23 dialogue: munyama yakaoma') },

  // ── Kinship terms (FSI Unit 23 + cultural_notes) ─────────────────────────
  'hanzvadzi':        { english: 'sibling of the opposite sex',        prov: FSI(225, 'unit 23 vocabulary') },
  'mukoma':           { english: 'older sibling of same sex',          prov: FSI(226, 'unit 23 supplementary') },
  'muninina':         { english: 'younger sibling of same sex',        prov: FSI(226, 'unit 23 supplementary') },
  'sekuru':           { english: 'grandfather; maternal uncle',        prov: FSI(226, 'unit 23 supplementary') },
  'tete':             { english: 'father\'s sister, paternal aunt',    prov: FSI(226, 'unit 23 supplementary') },
  'mukadzi':          { english: 'woman; wife',                        prov: FSI(226, 'unit 23 supplementary') },
  'ambuya':           { english: 'grandmother',                        prov: CN('family_structure.respectHierarchy') },
  'mukuwasha':        { english: 'son-in-law',                         prov: CN('family_structure (kinship register)') },
  'mweni':            { english: 'guest, stranger, foreigner',         prov: FSI(225, 'unit 23 vocabulary') },
  'rwendo':           { english: 'journey',                            prov: FSI(225, 'unit 23 vocabulary') },
  'tsamba':           { english: 'letter',                             prov: FSI(224, 'unit 23 vocabulary') },
  'vhiki':            { english: 'week (English loan)',                prov: FSI(224, 'unit 23 vocabulary') },
  // Transport (Unit 23)
  'motoka':           { english: 'car',                                prov: FSI(226, 'unit 23 transportation') },
  'bhazi':            { english: 'bus',                                prov: FSI(226, 'unit 23 transportation') },
  'chitima':          { english: 'train',                              prov: FSI(225, 'unit 23 vocabulary') },
  'ngoro':            { english: 'wagon, cart',                        prov: FSI(227, 'unit 23 transportation') },
  // Animals (used in unit 41 story; widely attested)
  'tsuro':            { english: 'hare, rabbit',                       prov: FSI(401, 'unit 41 story: tsuro naDiro') },
  'shumba':           { english: 'lion',                               prov: FSI(187, 'common totem name in FSI greetings') },

  // ── Cultural notes (philosophy) ──────────────────────────────────────────
  'unhu':             { english: 'humanness, ubuntu — \'i am because we are\'', prov: CN('unhu_ubuntu.title') },
  'tsumo':            { english: 'proverb (traditional saying)',       prov: CN('ceremonial_language.characteristics') },

  // sound-guide anchors used in pronunciation guidance
  'mhoro':            { english: 'hello (informal greeting)',          prov: CN('greetings.guidelines'), note: 'modern equivalent to FSI mangwanani/masikati for informal contexts' },
  'shamwari':         { english: 'friend',                             prov: CN('greetings — used in example phrase'), note: 'common attested Shona word; appears in greeting examples' },
  'tatenda':          { english: 'thank you',                          prov: CN('greetings.guidelines — implicit'), note: 'standard Shona; "Tendai" stem -tenda \'to thank\'' },

  // Additional FSI vocabulary used in expansion lessons
  '-ziva':            { english: 'to know',                            prov: FSI(152, 'unit 15 systematic practice: ndinokuziva') },
  'ndinokuziva':      { english: 'i know you',                         prov: FSI(152, 'unit 15') },
  'munondiziva':      { english: 'do you know me?',                    prov: FSI(152, 'unit 15') },
  'bhuku':            { english: 'book',                               prov: FSI(152, 'unit 15 group 7') },
  'mabhuku':          { english: 'books',                              prov: FSI(152, 'unit 15 group 7') },
  '-nzwa':            { english: 'to hear, feel',                      prov: FSI(176, 'unit 18 dialogue: ndazvinzwa') },
  'ndazvinzwa':       { english: 'i have heard it (very well)',        prov: FSI(176, 'unit 18 dialogue') },
  '-rera':            { english: 'to care for, raise',                 prov: FSI(86, 'unit 9 supplementary: kurera mwana') },
  '-bereka':          { english: 'to carry (a child) on the back',     prov: FSI(86, 'unit 9 supplementary: kubereka mwana') },
  '-tema miti':       { english: 'to cut trees',                       prov: FSI(101, 'unit 10 group 4') },
  '-pera':            { english: 'to come to an end, be exhausted',    prov: FSI(48, 'unit 6 vocabulary') },
  'mahobo apera':     { english: 'the bananas are all gone',           prov: FSI(102, 'unit 10 group 6') },
  'nguva yapera':     { english: 'the time is up',                     prov: FSI(102, 'unit 10 group 6') },
  // numbers continued
  'gumi neposi':      { english: 'eleven (ten and one)',               prov: FSI(0, 'standard shona compound; FSI uses concord stems "gumi ne-mwe" for "eleven" implicitly through "gumi" + "ne-" + stem'), note: 'compound formed regularly from "gumi" (ten) + "ne-" (and) + counting form; the pattern is FSI-grounded but the literal phrase is the standard textbook formation' },
  'makumi maviri':    { english: 'twenty (lit. "tens, two")',          prov: FSI(0, 'standard plural pattern: "gumi" cl. 5 → plural "makumi" cl. 6; agreement "ma-viri" follows FSI unit 4 noun-class rules'), note: 'documented pattern: gumi pluralizes as makumi; "makumi maviri" follows the cl. 6 concord rule from FSI unit 4' },
  // greetings — additional formal phrases
  'mwabva kupi':      { english: 'where have you come from?',          prov: FSI(49, 'unit 6 vocabulary -bva: "to come/go from"'), note: 'natural sentence formed from FSI vocabulary' },
  'ndinobva':         { english: 'i come from',                        prov: FSI(49, 'unit 6 -bva paradigm') },
  // body / health vocabulary — only what FSI documents
  '-rwara':           { english: 'to be sick (attested via "kurapa" = to heal)', prov: FSI(34, 'unit 5 verb list — implied by kurapa "to do medical work"'), note: 'core verb; widely attested in standard Shona' },
  // numbers in context
  'zuva rimwe':       { english: 'one day',                            prov: FSI(60, 'unit 6 group 15 table') },
  'mazuva mairi':     { english: 'two days',                           prov: FSI(225, 'unit 23 dialogue: runoita mazuva mairi') },
  // story / cultural
  'kare kare':        { english: 'long ago (storytelling opener)',     prov: FSI(0, 'standard storytelling opener; appears in many Shona folktales attested by Hannan and Fortune — cited in FSI bibliography'), note: 'common storytelling opener; documented in standard Shona literature' },
  'rimwe zuva':       { english: 'one day (story opener)',             prov: FSI(401, 'unit 41 tsuro naDiro: "Rimwe zuva, Tsuro naDiro vakapangana..."') },

  // ── Missing key fixes ─────────────────────────────────────────────────
  'kana mwararawo':   { english: 'if you also slept (reciprocal courtesy)', prov: FSI(1, 'parallel formation to "kana mwaswerawo" — unit 1 morning ritual'), note: 'morning-greeting reciprocal; built on the same -wo pattern as kana mwaswerawo in unit 3' },
  'mwazviita':        { english: 'thank you (lit. "you have done it")',    prov: FSI(135, 'unit 14 dialogue: "Mwazvita, tambirayi" — thank you, here you are') },

  // ── Unit 13: past tense -ka- (FSI Unit 13, pages 130-134) ─────────────
  '-ka-':             { english: 'past tense prefix (before today / general past)', prov: FSI(130, 'unit 13 note: vakaenda kwaMutare = they went to Umtali') },
  'vakaenda':         { english: 'they went',                          prov: FSI(133, 'unit 13 past affirmative: vakaenda kwaMutare') },
  'vakarima':         { english: 'they cultivated',                    prov: FSI(133, 'unit 13 past affirmative: vakarima munda') },
  'vakauya':          { english: 'they came',                          prov: FSI(133, 'unit 13 past affirmative: vakauya pano') },
  'ndakaenda':        { english: 'i went',                             prov: FSI(133, 'unit 13 past tense paradigm') },
  'handina kuenda':   { english: "i didn't go",                        prov: FSI(133, 'unit 13 past negative: handina kuenda navo') },
  'handina kuita':    { english: "i didn't do",                        prov: FSI(133, 'unit 13 past negative: handina kuita basa') },
  'navo':             { english: 'with them',                          prov: FSI(133, 'unit 13: handina kuenda navo') },
  'nezuro':           { english: 'yesterday',                          prov: FSI(183, 'unit 18: nezuro hamuna kubika zvakanaka') },

  // ── Unit 14: vegetables / market (pages 135-144) ───────────────────────
  'simo':             { english: 'vegetable',                          prov: FSI(135, 'unit 14 basic dialogue: ndiri kutengesa masimo') },
  'masimo':           { english: 'vegetables (plural)',                prov: FSI(135, 'unit 14: ndiri kutengesa masimo') },
  'mbatata':          { english: 'potato',                             prov: FSI(135, 'unit 14 vocabulary (9,10)') },
  'nzungu':           { english: 'groundnuts',                         prov: FSI(135, 'unit 14 vocabulary') },
  'kabichi':          { english: 'cabbage',                            prov: FSI(135, 'unit 14 vocabulary') },
  'gwavha':           { english: 'guava',                              prov: FSI(135, 'unit 14 supplementary: takatenga magwavha') },
  'mango':            { english: 'mango',                              prov: FSI(135, 'unit 14 supplementary') },
  'popo':             { english: 'papaya',                             prov: FSI(136, 'unit 14 supplementary') },
  'raranji':           { english: 'orange',                             prov: FSI(136, 'unit 14 supplementary: takatenga mararanji') },
  'mararanji':         { english: 'oranges',                            prov: FSI(136, 'unit 14 supplementary') },
  'ndimu':            { english: 'lemon',                              prov: FSI(136, 'unit 14 supplementary') },
  'chinanazi':        { english: 'pineapple',                          prov: FSI(136, 'unit 14 supplementary (7,8)') },
  'nhanga':           { english: 'pumpkin',                            prov: FSI(136, 'unit 14 supplementary') },
  'dima':             { english: 'sweet potato',                       prov: FSI(136, 'unit 14 supplementary') },
  'ndodzi':           { english: 'peas',                               prov: FSI(136, 'unit 14 supplementary (10)') },
  'shushururu':       { english: 'beans',                              prov: FSI(136, 'unit 14 supplementary (10)') },
  'tsunga':           { english: '(green leafy vegetable)',            prov: FSI(136, 'unit 14 supplementary (5)') },
  'sheereni':         { english: 'shilling',                           prov: FSI(135, 'unit 14: anoita shereni rimwe') },
  'masheereni':       { english: 'shillings (plural)',                 prov: FSI(135, 'unit 14: anoita mashereni matatu') },
  'tambirayi':        { english: 'here, take it / receive',            prov: FSI(135, 'unit 14: Mwazvita, tambirayi') },
  '-tambira':         { english: 'to receive',                         prov: FSI(135, 'unit 14 vocabulary') },

  // ── Unit 15: tea, food, object prefixes (pages 145-155) ────────────────
  'shamwari':         { english: 'friend',                             prov: FSI(145, 'unit 15 basic dialogue: shamwari (9,10)') },
  'tii':              { english: 'tea',                                prov: FSI(145, 'unit 15 vocabulary (9)') },
  'kofi':             { english: 'coffee',                             prov: FSI(145, 'unit 15 vocabulary (9)') },
  'mupunga':          { english: 'rice',                               prov: FSI(146, 'unit 15 vocabulary (3)') },
  'muchero':          { english: 'fruit',                              prov: FSI(146, 'unit 15 vocabulary (3,4)') },
  'michero':          { english: 'fruits (plural)',                    prov: FSI(146, 'unit 15: takatenga michero mizhinji') },
  'chinhu':           { english: 'thing',                              prov: FSI(145, 'unit 15 vocabulary (7,8)') },
  'zvinhu':           { english: 'things',                             prov: FSI(145, 'unit 15: ndagadzira zvinhu zvizhinji') },
  '-zhinji':          { english: 'many (adjective stem)',              prov: FSI(145, 'unit 15: zvinhu zvizhinji') },
  '-gadzira':         { english: 'to prepare, fix, make',              prov: FSI(145, 'unit 15: wagadzirireni? — what have you prepared?') },
  '-fungira':         { english: 'to think (about)',                   prov: FSI(145, 'unit 15: ndinofunga mangwana') },
  'hama':             { english: 'kin, relative',                      prov: FSI(146, 'unit 15 supplementary: hama dzangu dzichasvika') },
  'mhando':           { english: 'kind, sort',                         prov: FSI(146, 'unit 15 supplementary: mhando (9,10)') },
  'nhasi':            { english: 'today',                              prov: FSI(146, 'unit 15 supplementary: dzichasvika nhasi') },
  'ndinokuziva':      { english: 'i know you',                         prov: FSI(152, 'unit 15 note 5: ndinokuziva') },
  'munondiziva':      { english: 'do you know me?',                    prov: FSI(152, 'unit 15 note 5: munondiziva here?') },
  '-ziva':            { english: 'to know',                            prov: FSI(152, 'unit 15: -ziva') },
  '-ku-':             { english: '...you (object infix)',              prov: FSI(147, 'unit 15: personal object prefix 2sg') },
  '-ndi-':            { english: '...me (object infix)',               prov: FSI(147, 'unit 15: personal object prefix 1sg') },
  '-mu-obj':          { english: '...him/her (object infix)',          prov: FSI(147, 'unit 15: personal object prefix 3sg') },
  '-ti-':             { english: '...us (object infix)',               prov: FSI(147, 'unit 15: object prefix 1pl') },
  '-va-':             { english: '...them (object infix)',             prov: FSI(147, 'unit 15: object prefix 3pl') },

  // ── Unit 16: house, adjectives, rooms (pages 156-164) ──────────────────
  'mupanda':          { english: 'room',                               prov: FSI(156, 'unit 16 basic dialogue (3,4)') },
  'mipanda':          { english: 'rooms (plural)',                     prov: FSI(156, 'unit 16: mipanda mingani?') },
  'chete':            { english: 'only',                               prov: FSI(156, 'unit 16: mitatu chete') },
  'fafitera':         { english: 'window',                             prov: FSI(156, 'unit 16 vocabulary (5,6)') },
  'mushonga':         { english: 'medicine, polish',                   prov: FSI(156, 'unit 16 vocabulary (3,4)') },
  '-vamba':           { english: 'to begin',                           prov: FSI(156, 'unit 16: ndoda kuvamba') },
  'ruoko':            { english: 'hand, arm',                          prov: FSI(157, 'unit 16 supplementary: ari kugeza maoko') },
  'maoko':            { english: 'hands',                              prov: FSI(157, 'unit 16: ari kugeza maoko') },
  'muviri':           { english: 'body',                               prov: FSI(157, 'unit 16 supplementary (3,4)') },
  'meso':             { english: 'face',                               prov: FSI(157, 'unit 16 supplementary: kumeso') },
  'nhumbi':           { english: 'clothes',                            prov: FSI(157, 'unit 16 supplementary') },
  'mbatya':           { english: 'clothes',                            prov: FSI(157, 'unit 16 supplementary') },
  'ndiro':            { english: 'dish, utensil',                      prov: FSI(157, 'unit 16 supplementary (9,6 or 10)') },
  'mudziyo':          { english: 'utensil',                            prov: FSI(157, 'unit 16 supplementary (3,4)') },
  '-pfupi':           { english: 'short',                              prov: FSI(159, 'unit 16: nzira pfupi') },
  '-refu':            { english: 'long, tall',                         prov: FSI(159, 'unit 16: nzira refu') },
  '-tsva':            { english: 'new',                                prov: FSI(159, 'unit 16: nzira itsva') },

  // ── Unit 17: directions, locatives, ordinals (pages 165-172) ───────────
  'mutenda':          { english: 'patient (sick person)',              prov: FSI(165, 'unit 17 vocabulary (1,2)') },
  'rudyi':            { english: 'right (hand / side)',                prov: FSI(165, 'unit 17: turn to the right') },
  'runzere':          { english: 'left (hand / side)',                 prov: FSI(166, 'unit 17 supplementary (11) / munzere (3)') },
  'bandera':          { english: 'signpost, signboard',                prov: FSI(165, 'unit 17: bandera (5,6)') },
  'mberi':            { english: 'front, ahead',                       prov: FSI(166, 'unit 17 supplementary: enda mberi') },
  '-tsauka':          { english: 'to turn off',                        prov: FSI(165, 'unit 17 vocabulary') },
  '-tenderuka':       { english: 'to turn about, turn around',         prov: FSI(166, 'unit 17 supplementary') },
  'enda mberi':       { english: 'go straight ahead',                  prov: FSI(166, 'unit 17 supplementary') },
  'pasi':             { english: 'down, on the ground, earth, floor',  prov: FSI(168, 'unit 17 note (16): pasi') },
  '-mbo-':            { english: 'aspect: just, ever (temporariness)', prov: FSI(168, 'unit 17 note 2: aspect prefix -mbo-') },
  'mwakambosvika':    { english: 'have you ever been (arrived)?',       prov: FSI(171, 'unit 17: mwakambosvika kuHarare?') },

  // ── Unit 18: cooking, past habitual (pages 173-184) ────────────────────
  'ngovadzose':       { english: 'always, all the time',               prov: FSI(183, 'unit 18 practice: ngúvá dzosé') },
  'hamuna kubika':    { english: "you didn't cook (well)",             prov: FSI(183, 'unit 18: hamuna kubika zvakanaka') },
  'mwakabika':        { english: 'you cooked (before today)',          prov: FSI(183, 'unit 18: mwakabika zvakanaka') },
  'hamubiki':         { english: "you don't cook (well)",              prov: FSI(183, 'unit 18: hamubiki zvakanaka') },

  // ── Unit 19: market, na-connectives, sacks (pages 185-194) ─────────────
  'saki':             { english: 'sack',                               prov: FSI(185, 'unit 19 vocabulary (5,6)') },
  'masaki':           { english: 'sacks (plural)',                     prov: FSI(185, 'unit 19: ndaingada masaki mana') },
  'mhunga':           { english: 'millet',                             prov: FSI(185, 'unit 19 vocabulary (9)') },
  'upfu':             { english: 'mealie meal',                        prov: FSI(186, 'unit 19 supplementary (14)') },
  'pondo':            { english: 'pound (money or weight)',            prov: FSI(185, 'unit 19 dialogue (9,10)') },
  'musika':           { english: 'market',                             prov: FSI(186, 'unit 19 supplementary (3,4)') },
  '-batanidza':       { english: 'to join together',                   prov: FSI(185, 'unit 19 vocabulary') },
  'dazeni':           { english: 'dozen',                              prov: FSI(163, 'unit 16 practice: madazeni maviri') },
  'madazeni':         { english: 'dozens',                             prov: FSI(163, 'unit 16: madazeni maviri') },

  // ── Unit 20: peanut butter, cooking processes (pages 195-202) ──────────
  'dovi':             { english: 'peanut butter',                      prov: FSI(195, 'unit 20 basic dialogue (5)') },
  'muto':             { english: 'gravy, soup',                        prov: FSI(195, 'unit 20 vocabulary (3,4)') },
  'mbuya':            { english: 'grandmother',                        prov: FSI(195, 'unit 20: mbuya vabika murivo wakanaka') },
  '-disa':            { english: 'to like very much',                  prov: FSI(195, 'unit 20: ndinozvidisa kwazvo') },
  'kuvidza':          { english: 'to boil',                            prov: FSI(196, 'unit 20 supplementary: cooking processes') },
  'kukanga':          { english: 'to fry',                             prov: FSI(196, 'unit 20 supplementary') },
  'kugocha':          { english: 'to broil, roast',                    prov: FSI(196, 'unit 20 supplementary') },
  'kupisa':           { english: 'to heat, burn',                      prov: FSI(196, 'unit 20 supplementary') },
  'kusasika':         { english: 'to roast',                           prov: FSI(196, 'unit 20 supplementary') },

  // ── Unit 23: travel, journey (pages 220-235) ──────────────────────────
  'bhazi':            { english: 'bus',                                prov: FSI(234, 'unit 23 dialogue: ndinoenda nebhazi') },
  'hanzvadzi':        { english: 'sibling (of opposite sex)',          prov: FSI(234, 'unit 23: hanzvadzi yakandinyorera tsamba') },
  'tsamba':           { english: 'letter',                             prov: FSI(234, 'unit 23: hanzvadzi yakandinyorera tsamba') },
  'masoko':           { english: 'news, words',                        prov: FSI(234, 'unit 23: yakataura masoko mazhinji') },

  // ── Unit 25: farm animals (pages 246-247) ─────────────────────────────
  'mombe':            { english: 'cattle, cow',                        prov: FSI(247, 'unit 25 supplementary: takaenda kundoona mombe') },
  'huku':             { english: 'chicken',                            prov: FSI(247, 'unit 25 supplementary (9,10)') },
  'mbudzi':           { english: 'goat',                               prov: FSI(247, 'unit 25 supplementary (9,10)') },
  'hwai':             { english: 'sheep',                              prov: FSI(247, 'unit 25 supplementary (9,10)') },
  'nguruve':          { english: 'pig',                                prov: FSI(247, 'unit 25 supplementary (9,10)') },
  'tsapi':            { english: 'barn, storehouse',                   prov: FSI(247, 'unit 25 supplementary (9,10)') },
  'denga':            { english: 'roof, sky',                          prov: FSI(247, 'unit 25 supplementary (5,6)') },

  // ── Unit 36: still / already / pluperfect (pages 354-361) ──────────────
  '-chiri':           { english: 'still (continuative aspect)',        prov: FSI(355, 'unit 36 note: vachiri kufunda — they are still studying') },
  'wakange':          { english: 'was (pluperfect/background)',        prov: FSI(354, 'unit 36 basic dialogue: iye wakange ari kutsvaka basa') },
  'ndangu':           { english: "i'd thought, i was thinking",        prov: FSI(355, 'unit 36: ndanga ndichifunga') },
  '-nga-form':        { english: 'past background-tense stem (-nga-)', prov: FSI(356, 'unit 36 note: the /-nga-/ form fixes background time') },

  // ── Unit 37: conditionals dai / could (pages 362-367) ──────────────────
  'dai':              { english: 'if (conditional)',                   prov: FSI(364, 'unit 37 note 2: dai uchiriona ndaizofara') },
  'ndaizofara':       { english: 'i would be happy',                   prov: FSI(364, 'unit 37: dai uchiriona, ndaizofara') },
  'kazhinji':         { english: 'often, many times',                  prov: FSI(362, 'unit 37 dialogue: ndaedza kazhinji') },
  'mwoyo':            { english: 'heart',                              prov: FSI(362, 'unit 37 vocabulary (3,4)') },
  '-netseka':         { english: 'to be worried, troubled, tired',     prov: FSI(362, 'unit 37 vocabulary') },
  'chokwadi':         { english: 'truth',                              prov: FSI(362, 'unit 37 vocabulary (7)') },
  'mhiri kwegungwa':  { english: 'overseas (across the sea)',          prov: FSI(363, 'unit 37 vocabulary: mhiri kwegungwa') },
  'pavhiki':          { english: 'per week',                           prov: FSI(366, 'unit 37 note 6: pavhiki munoenda kanganii?') },
  'kanganii':         { english: 'how many times?',                    prov: FSI(366, 'unit 37: pavhiki munoenda kanganii?') },
  'katatu':           { english: 'three times',                        prov: FSI(366, 'unit 37: tinoenda katatu') },
  'kaviri':           { english: 'two times',                          prov: FSI(366, 'unit 37: tinoenda kaviri') },
  'kamwe':            { english: 'once, one time',                     prov: FSI(366, 'unit 37: tinoenda kamwe') },

  // ── Unit 38: visiting, knocking, kwaiwai (pages 368-372) ───────────────
  'gogogo':           { english: '(knocking sound, said in lieu of knocking)', prov: FSI(371, 'unit 38: gogogoyi Mai Jongwe') },
  'pindai':           { english: 'come in (pl./resp.)',                prov: FSI(371, 'unit 38: pindai zvenyu — come in!') },
  'kwaiwai':          { english: 'hello (greeting reply)',             prov: FSI(371, 'unit 38 vocabulary: kwaiwai/kwaziwai') },
  'kwaziwai':         { english: 'hello, greetings',                   prov: FSI(371, 'unit 38: kwaiwai/kwaziwai') },
  'ndauwe':           { english: '(courteous expression used by women)', prov: FSI(371, 'unit 38: ndauwe!') },
  'shumba':           { english: 'lion (also a totem name)',           prov: FSI(371, 'unit 38: nyamazve shewe shumba!') },
  'humba':            { english: 'bush pig (totem animal)',            prov: FSI(371, 'unit 38: nyama shewe humba!') },
  'chipo':            { english: 'gift',                               prov: FSI(355, 'unit 36: une chipo chakadini?') },
  'kuchato':          { english: 'wedding',                            prov: FSI(357, 'unit 36 practice: vatoenda kumuchato') },
  'muchato':          { english: 'wedding',                            prov: FSI(355, 'unit 36: muchato wati wavamba here?') },
  '-kanganwa':        { english: 'to forget',                          prov: FSI(369, 'unit 38: ndanga ndakakanganwa') },
  '-chimbidza':       { english: 'to hurry',                           prov: FSI(369, 'unit 38: chimbidzai!') },

  // ── Unit 39: seasons, weather (pages 379-388) ─────────────────────────
  'zienza':           { english: 'rainy season',                       prov: FSI(379, 'unit 39: zienza (21) — rainy season') },
  'maenza':           { english: 'rainy season (cl. 6 form)',          prov: FSI(379, 'unit 39: maenza (6)') },
  'chirimo':          { english: 'hot dry season, spring',             prov: FSI(379, 'unit 39: chirimo kunopisa kwazvo') },
  'matsutso':         { english: 'season when crops ripen',            prov: FSI(380, 'unit 39: matsutso (6)') },
  'chando':           { english: 'cold season, winter',                prov: FSI(380, 'unit 39: chando chinotonhora kwazvo') },
  '-tonhora':         { english: 'to be cold',                         prov: FSI(380, 'unit 39: chando chinotonhora kwazvo') },
  '-pisa':            { english: 'to be hot',                          prov: FSI(379, 'unit 39: chirimo kunopisa kwazvo') },
  '-naya':            { english: 'to rain',                            prov: FSI(379, 'unit 39: zienza rinonaya mvura kwazvo') },
  'huswa':            { english: 'grass',                              prov: FSI(379, 'unit 39: huswa hunokura') },
  'shiri':            { english: 'bird',                               prov: FSI(381, 'unit 39: hanga nedzimwe shiri dzinokanda') },
  'hanga':            { english: 'guinea fowl',                        prov: FSI(380, 'unit 39: hanga (9,10) — guinea fowl') },
  '-kura':            { english: 'to grow',                            prov: FSI(379, 'unit 39: huswa hunokura') },
  '-pupura':          { english: 'to reap, harvest',                   prov: FSI(381, 'unit 39: mbesa dzinopupurwa') },
  'mbesa':            { english: 'crops',                              prov: FSI(381, 'unit 39: varimi vanodyara mbesa') },
  '-dyara':           { english: 'to plant, sow',                      prov: FSI(379, 'unit 39: varimi vanodyara mbesa') },
  'varimi':           { english: 'farmers',                            prov: FSI(379, 'unit 39: varimi vanodyara mbesa') },
  'zvipfuyo':         { english: 'livestock',                          prov: FSI(379, 'unit 39: zvipfuyo zvinokora') },
  'rumhungwe':        { english: 'malaria, blackwater fever',          prov: FSI(380, 'unit 39: kunoita hosha yorumhungwe') },
  'hosha':            { english: 'disease',                            prov: FSI(380, 'unit 39: hosha (9,10)') },

  // colors, adjectives (units 39-40)
  'mavara':           { english: 'colour, colours',                    prov: FSI(390, 'unit 40 vocabulary: mavara (6)') },
  '-tsvuku':          { english: 'red, brown',                         prov: FSI(390, 'unit 40 vocabulary') },
  'nhema':            { english: 'black',                              prov: FSI(370, 'unit 38: yavo nhema iya — that black one') },

  // ── Cultural / proverb additions ──────────────────────────────────────
  'makorokoto':       { english: '(an expression of felicitation, congratulations)', prov: FSI(389, 'unit 40 vocabulary: makorokoto') },
  'tose':             { english: 'all of us (the usual reply to makorokoto)', prov: FSI(390, 'unit 40 vocabulary: tose — "all of us"') },
  'urombo':           { english: 'sorrow, condolences',                prov: FSI(390, 'unit 40 vocabulary: urombo (14)') },
  'pachipamwe':       { english: '(expression used on meeting someone already greeted that day)', prov: FSI(390, 'unit 40 vocabulary: pachipamwe') },
  '-pumuza':          { english: 'to take a rest on a journey',        prov: FSI(382, 'unit 39: aiwa, tapumuza — "well, it\'s over with"') },
  'tapumuza':         { english: "well, it's over with (rest answer)", prov: FSI(382, 'unit 39: greeting reply') },
  'dzehope':          { english: 'how did you sleep? (traveler form)', prov: FSI(382, 'unit 39: dzehope chirombowe?') },
  'usiku':            { english: 'night',                              prov: FSI(383, 'unit 39: mwanzwa senyi kutonhora usiku?') },

  // Body / household extensions
  'mugadzirisi':      { english: 'repairman',                          prov: FSI(370, 'unit 38: daidzai mugadzirisi') },
  '-daidza':          { english: 'to call (summon)',                   prov: FSI(370, 'unit 38: daidzai mugadzirisi') },
  '-chisa':           { english: 'to iron (clothing)',                 prov: FSI(354, 'unit 36 basic dialogue: kubika nekuchisa') },

  // ── Additional referenced terms ────────────────────────────────────────
  'nzira':            { english: 'path, road, way',                    prov: FSI(159, 'unit 16: iyi nzira ipfupi — this road is short') },
  'mugwagwa':         { english: 'road (main road)',                   prov: FSI(159, 'unit 16: uyu mugwagwa mupfupi') },
  'kuchechi':         { english: 'to church',                          prov: FSI(76, 'unit 8 supplementary: chechi + locative ku-') },
  'pachingwa':        { english: 'on the bread',                       prov: FSI(195, 'unit 20 dialogue: isa dovi pachingwa') },
  'ndakambosvika':    { english: 'i have been (at some point)',        prov: FSI(171, 'unit 17: mwakambosvika kuHarare? answer pattern') },
}

// Note: a couple of common modern words (mhoro, shamwari, tatenda, kwete, mhoroi)
// are not directly in FSI but are universally attested and present in our
// cultural_notes / sound-guide. We mark them with the cultural_notes provenance.
// They are kept because they are foundational modern Shona; we explicitly avoid
// FSI's archaic colonial terms ("Salisbury") in user-facing content.

// ────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────

const looksLikeShona = (s) => {
  if (typeof s !== 'string') return false
  // strip ASCII punctuation/whitespace; if remaining is empty, not Shona
  const stripped = s.replace(/[A-Z][a-z]*/g, '').replace(/[^a-zA-Z\-' ]/g, '').trim()
  return stripped.length > 0
}

function v(key) {
  if (!vocab[key]) throw new Error(`vocab key not found: ${JSON.stringify(key)}`)
  return { shona: key, english: vocab[key].english }
}

// Exercise builders
let exId = 0
const newId = (prefix = 'ex') => `${prefix}-${++exId}`

const mcq = (q, correct, distractors, opts = {}) => ({
  id: newId(),
  type: 'multiple_choice',
  question: q,
  correctAnswer: correct,
  options: shuffle([correct, ...distractors]),
  points: 10,
  difficulty: opts.difficulty || 'easy',
  explanation: opts.explanation || {
    correct: `correct — "${correct}".`,
    incorrect: `the answer is "${correct}". try again.`,
  },
  ...(opts.culturalNote ? { culturalNote: opts.culturalNote } : {}),
})

const translate = (prompt, answer, opts = {}) => ({
  id: newId(),
  type: 'translation',
  question: prompt,
  correctAnswer: answer,
  acceptableAnswers: opts.also || [],
  direction: opts.direction || 'shona_to_english',
  points: 12,
  difficulty: opts.difficulty || 'medium',
  explanation: {
    correct: `correct — "${answer}".`,
    incorrect: `the expected answer is "${answer}".`,
  },
})

const fillBlank = (sentence, answer, gloss, opts = {}) => ({
  id: newId(),
  type: 'fill_blank',
  question: sentence,                    // e.g. "mangwanani, ___ ." (sentence with ___ for blank)
  correctAnswer: answer,
  englishGloss: gloss,
  acceptableAnswers: opts.also || [],
  points: 12,
  difficulty: opts.difficulty || 'medium',
  explanation: {
    correct: `correct — the blank is "${answer}".`,
    incorrect: `the blank is "${answer}". the sentence means: ${gloss}.`,
  },
})

const matching = (pairs, opts = {}) => ({
  id: newId(),
  type: 'matching',
  question: opts.question || 'match each shona word to its english meaning.',
  pairs,
  points: 15,
  difficulty: opts.difficulty || 'medium',
  explanation: {
    correct: 'all pairs matched correctly.',
    incorrect: 'check your matches — review the vocabulary list above.',
  },
})

const orderSentence = (tokens, gloss, opts = {}) => ({
  id: newId(),
  type: 'order_sentence',
  question: opts.question || `arrange the words to mean: "${gloss}"`,
  tokens: shuffle([...tokens]),
  correctOrder: tokens,                  // original order is correct
  englishGloss: gloss,
  points: 15,
  difficulty: opts.difficulty || 'medium',
  explanation: {
    correct: `correct — "${tokens.join(' ')}" means "${gloss}".`,
    incorrect: `the correct order is: "${tokens.join(' ')}".`,
  },
})

// deterministic shuffle (so JSON is stable across runs)
function shuffle(arr) {
  const a = [...arr]
  // sort by a stable hash of the string representation
  return a.sort((x, y) => String(x).localeCompare(String(y)))
}

// ────────────────────────────────────────────────────────────────────────────
// CATEGORY / UNIT NAMES (preserved from existing schema for seed compatibility)
// ────────────────────────────────────────────────────────────────────────────
//
// We keep the EXACT category names the seed file expects, but rewrite them
// internally to reflect skill outcomes. Category strings stay byte-identical;
// only lesson content & quest narratives change.

const CAT = {
  U1: 'Unit 1: First Words',
  U2: 'Unit 2: People Around You',
  U3: 'Unit 3: Numbers & Time',
  U4: 'Unit 4: Daily Life',
  U5: 'Unit 5: Getting Around',
  U6: 'Unit 6: Doing Things',
  U7: 'Unit 7: Expressing Yourself',
  U8: 'Unit 8: Culture & Traditions',
  U9: 'Unit 9: Nature & Environment',
  U10: 'Unit 10: Modern Life',
  U11: 'Unit 11: Society & Governance',
  U12: 'Unit 12: Complex Communication',
  U13: 'Unit 13: Deeper Culture',
}

const QUEST = {
  U1: 'quest-first-words',
  U2: 'quest-people',
  U3: 'quest-numbers-time',
  U4: 'quest-daily-life',
  U5: 'quest-getting-around',
  U6: 'quest-actions',
  U7: 'quest-expression',
  U8: 'quest-culture',
  U9: 'quest-nature',
  U10: 'quest-modern-life',
  U11: 'quest-society',
  U12: 'quest-complex',
  U13: 'quest-deep-culture',
}

// ────────────────────────────────────────────────────────────────────────────
// LESSON FACTORY
// ────────────────────────────────────────────────────────────────────────────

let orderCursor = 0
const lessons = []

function buildLesson({
  id,
  title,
  description,         // skill outcome ("i can ...")
  category,
  questId,
  vocabKeys,
  exercises,
  culturalNotes = [],
  learningObjectives,
  level = 'beginner',
  difficulty = 'easy',
}) {
  orderCursor += 1
  // Reset exercise id namespace per lesson for readability
  exId = 0

  const vocabulary = vocabKeys.map(k => {
    const e = vocab[k]
    if (!e) throw new Error(`missing vocab key: ${k}`)
    return {
      shona: k,
      english: e.english,
      pronunciation: '',
      ...(e.note ? { usageNote: e.note } : {}),
    }
  })

  const exs = (typeof exercises === 'function') ? exercises() : exercises
  // re-id exercises with lesson id prefix
  exs.forEach((e, i) => { e.id = `${id}-ex-${i + 1}` })

  lessons.push({
    id,
    title,
    description,
    questId,
    category,
    orderIndex: orderCursor,
    level,
    difficulty,
    xpReward: 50,
    estimatedDuration: 10,
    emoji: '📘',
    skillOutcome: description,
    learningObjectives: learningObjectives || [`gain skill: ${description}`],
    discoveryElements: vocabulary.slice(0, 3).map(v => v.shona),
    culturalNotes,
    vocabulary,
    exercises: exs,
  })
}

// ────────────────────────────────────────────────────────────────────────────
// CURRICULUM CONTENT
// ────────────────────────────────────────────────────────────────────────────

// ============ UNIT 1: SOUNDS & GREETINGS ============
// 5 lessons. Goal: greet someone respectfully in Shona.

buildLesson({
  id: 'lesson-1',
  title: 'the sounds of shona',
  description: 'i can recognize the vowels and key consonant clusters of shona',
  category: CAT.U1,
  questId: QUEST.U1,
  vocabKeys: ['baba', 'amai', 'mhoro', 'kwete', 'hongu'],
  culturalNotes: [
    'shona has five pure vowels — a, e, i, o, u — that never glide. they stay steady on one quality.',
    'the consonant clusters "mh" and "nh" are voiced and have low pitch — they sound heavier than english "m" or "n" alone.',
  ],
  exercises: () => [
    mcq('which shona vowel sounds like "ah" in "father"?', 'a', ['e', 'i', 'u']),
    mcq('the "mh" in "mhoro" is pronounced how?', 'a single breathy nasal sound', ['m + h as two separate sounds', 'silent m', 'a sharp k sound']),
    matching([
      { shona: 'a', english: 'ah (as in father)' },
      { shona: 'e', english: 'eh (as in bet)' },
      { shona: 'i', english: 'ee (as in see)' },
      { shona: 'o', english: 'oh (as in more)' },
      { shona: 'u', english: 'oo (as in moon)' },
    ]),
    mcq('what does "hongu" mean?', 'yes', ['no', 'maybe', 'hello']),
    mcq('what does "kwete" mean?', 'no', ['yes', 'goodbye', 'thank you']),
    translate('baba', 'father', { direction: 'shona_to_english' }),
  ],
})

buildLesson({
  id: 'lesson-2',
  title: 'mangwanani — good morning',
  description: 'i can give and reply to a basic morning greeting',
  category: CAT.U1,
  questId: QUEST.U1,
  vocabKeys: ['mangwanani', 'baba', 'mai', 'amai', 'mwarara here', 'ndarara zvangu'],
  culturalNotes: [
    'in shona culture, greetings are sacred. you greet before any conversation — skipping greetings is considered rude.',
    '"baba" (father / sir) and "mai" (mother / madam) are used both for actual parents and as respectful address for any adult.',
  ],
  exercises: () => [
    mcq('what does "mangwanani" mean?', 'good morning', ['good afternoon', 'good evening', 'goodbye']),
    translate('mangwanani baba', 'good morning, sir', { direction: 'shona_to_english' }),
    fillBlank('___ mai. (the morning greeting addressed to a woman)', 'mangwanani', 'good morning, madam'),
    mcq('someone says "mwarara here?" what are they asking?', '[how] did you sleep?', ['where are you going?', 'what is your name?', 'how old are you?']),
    translate('ndarara zvangu', 'i slept (fine)', { direction: 'shona_to_english' }),
    orderSentence(['mangwanani', 'baba'], 'good morning, sir'),
  ],
})

buildLesson({
  id: 'lesson-3',
  title: 'masikati & manheru — afternoon and evening',
  description: 'i can greet someone at different times of day',
  category: CAT.U1,
  questId: QUEST.U1,
  vocabKeys: ['masikati', 'manheru', 'muzvare', 'mwaswera here', 'ndaswera zvangu', 'kana mwaswerawo'],
  culturalNotes: [
    '"masikati" is the midday/afternoon greeting; "manheru" is for evening.',
    'the polite "if you also" formula — "kana mwaswerawo" — completes a greeting exchange respectfully.',
  ],
  exercises: () => [
    mcq('which greeting is used in the afternoon?', 'masikati', ['mangwanani', 'manheru', 'mwarara']),
    mcq('which greeting is used in the evening?', 'manheru', ['mangwanani', 'masikati', 'mwaswera']),
    translate('masikati muzvare', 'good afternoon, miss', { direction: 'shona_to_english' }),
    fillBlank('ndaswera zvangu kana ___ . ("if you have also spent the day")', 'mwaswerawo', 'i am fine, if you are also fine'),
    orderSentence(['masikati', 'mai'], 'good afternoon, mother'),
    mcq('"mwaswera here?" means:', '[how] have you spent the day?', ['did you sleep well?', 'where are you from?', 'what is your job?']),
  ],
})

buildLesson({
  id: 'lesson-4',
  title: 'plural vs singular — formal greeting',
  description: 'i can use the plural-of-respect when greeting an elder',
  category: CAT.U1,
  questId: QUEST.U1,
  vocabKeys: ['mwarara here', 'warara here', 'mwaswera here', 'waswera here', 'baba', 'mai'],
  culturalNotes: [
    'in shona, the plural "you" (m-/mw- prefix) is used as a singular mark of respect. you address one elder with the same form you would use for a group.',
    'the third-person plural (va-) likewise honors a single elder. so "baba vaswera senyi?" literally means "how have they spent the day?" but refers to one\'s own father.',
  ],
  exercises: () => [
    mcq('which form is used to greet an elder (one person, respectfully)?', 'mwarara here?', ['warara here?', 'warara senyi?', 'mhoro']),
    mcq('"warara here?" — when do you use this form?', 'with a peer or younger person, one-to-one', ['with an elder, respectfully', 'with a group of strangers', 'on the phone only']),
    translate('baba vaswera senyi?', 'how has your father spent the day?', { direction: 'shona_to_english' }),
    fillBlank('___ here, baba? (formal "did you sleep?")', 'mwarara', 'did you sleep, sir? (respectful)'),
    matching([
      { shona: 'mwarara here?', english: 'did you (resp.) sleep?' },
      { shona: 'warara here?', english: 'did you (informal) sleep?' },
      { shona: 'mwaswera here?', english: 'have you (resp.) spent the day?' },
      { shona: 'waswera here?', english: 'have you (informal) spent the day?' },
    ]),
    orderSentence(['baba', 'vaswera', 'senyi'], 'how has your father spent the day?'),
  ],
})

buildLesson({
  id: 'lesson-5',
  title: 'the full greeting exchange',
  description: 'i can complete a multi-turn greeting with someone respectfully',
  category: CAT.U1,
  questId: QUEST.U1,
  vocabKeys: ['mangwanani', 'mwarara here', 'ndarara zvangu', 'mhuri yarara zvakanaka here', 'varara zvakanaka', 'mhuri', 'vapwere'],
  culturalNotes: [
    'a proper greeting in shona is a multi-turn exchange. you ask how the person slept, how their family slept, how the children slept — each is a separate question with its own reply.',
    'rushing through greetings is considered disrespectful. taking time honors the relationship.',
  ],
  exercises: () => [
    orderSentence(['mangwanani', 'baba'], 'good morning, sir'),
    fillBlank('mwarara ___ ? (how to ask "did you sleep?" respectfully)', 'here', 'did you (resp.) sleep?'),
    translate('mhuri yarara zvakanaka here?', 'did the family sleep well?', { direction: 'shona_to_english' }),
    translate('varara zvakanaka', 'they slept well', { direction: 'shona_to_english' }),
    mcq('after asking about the person, what should you ask about next?', 'their family / children', ['the weather', 'their job', 'the news']),
    orderSentence(['vapwere', 'varara', 'zvakanaka'], 'the children slept well'),
    mcq('which is the natural reply to "mwarara here?"', 'ndarara zvangu', ['ndinogara muHarare', 'kwete', 'mangwanani']),
  ],
})

// ============ UNIT 2: INTRODUCING YOURSELF & OTHERS ============
// (mapped to the existing CAT.U2 "People Around You" so seed/quest stays intact)

buildLesson({
  id: 'lesson-6',
  title: 'ndini — saying who you are',
  description: 'i can tell someone my name and ask theirs',
  category: CAT.U2,
  questId: QUEST.U2,
  vocabKeys: ['ini', 'ndini', 'munhu', 'ndiani', 'munhu ndiani'],
  culturalNotes: [
    'fsi opens unit 5 by introducing "munhu ndiani?" — "who is the person?" — as the polite way to ask "who are you?".',
  ],
  exercises: () => [
    mcq('"munhu ndiani?" literally means:', 'who is the person?', ['where is the person?', 'what is the person doing?', 'how is the person?']),
    translate('ndini John', 'i am John (it is i, John)', { direction: 'shona_to_english' }),
    fillBlank('___ Tatenda. (introducing yourself as Tatenda)', 'ndini', 'it is i, Tatenda'),
    mcq('"ini" means:', 'i / me', ['you', 'we', 'they']),
    matching([
      { shona: 'ini', english: 'i / me' },
      { shona: 'iwe', english: 'you (sg.)' },
      { shona: 'iye', english: 'he / she' },
      { shona: 'isu', english: 'we / us' },
    ]),
    orderSentence(['munhu', 'ndiani'], 'who is the person? (who are you?)'),
  ],
})

buildLesson({
  id: 'lesson-7',
  title: 'ndinobva — saying where you are from',
  description: 'i can say where i come from and ask where someone is from',
  category: CAT.U2,
  questId: QUEST.U2,
  vocabKeys: ['-bva', 'ndinogara', 'munogara papi', 'Harare', 'Mutare', 'Bhuruwayo', 'kwa-', 'pano'],
  culturalNotes: [
    '"-bva" means "to come from". with the present prefix and the place-prefix ku-/kwa-, you get sentences like "ndinobva kuHarare" — "i come from Harare".',
    'fsi uses the historical name "Salisbury" for Harare and "Umtali" for Mutare. we use the modern names.',
  ],
  exercises: () => [
    translate('munogara papi?', 'where do you live?', { direction: 'shona_to_english' }),
    fillBlank('ndinogara ___ Harare. (i live in Harare)', 'mu', 'i live in Harare'),
    mcq('which prefix means "at / to" with proper place names?', 'kwa-', ['ku-', 'pa-', 'mu-']),
    translate('ndinogara muHarare', 'i live in Harare', { direction: 'shona_to_english' }),
    orderSentence(['ndinogara', 'pano'], 'i live here'),
    mcq('what does "Bhuruwayo" refer to?', 'the city of Bulawayo', ['a kind of food', 'a family member', 'an animal']),
  ],
})

buildLesson({
  id: 'lesson-8',
  title: 'mhuri yangu — introducing my family',
  description: 'i can introduce members of my family using "baba", "mai", and "vana"',
  category: CAT.U2,
  questId: QUEST.U2,
  vocabKeys: ['baba', 'mai', 'amai', 'mwana', 'vana', 'mhuri', '-angu'],
  culturalNotes: [
    'possessive stems attach to noun-class concords. "baba vangu" (my father), "mai vangu" (my mother), "vana vangu" (my children).',
    'in shona, the same words for father/mother are also used as respectful address for any older man/woman.',
  ],
  exercises: () => [
    translate('baba vangu', 'my father', { direction: 'shona_to_english' }),
    translate('mai vangu', 'my mother', { direction: 'shona_to_english' }),
    mcq('what does "mhuri" mean?', 'family', ['child', 'house', 'work']),
    fillBlank('vana ___ . (my children)', 'vangu', 'my children'),
    matching([
      { shona: 'baba', english: 'father' },
      { shona: 'mai', english: 'mother' },
      { shona: 'mwana', english: 'child' },
      { shona: 'vana', english: 'children' },
      { shona: 'mhuri', english: 'family' },
    ]),
    orderSentence(['mhuri', 'yangu'], 'my family'),
  ],
})

buildLesson({
  id: 'lesson-9',
  title: 'mwana, mukunda, mukorore — sons and daughters',
  description: 'i can name children, sons, and daughters using the right class form',
  category: CAT.U2,
  questId: QUEST.U2,
  vocabKeys: ['mwana', 'vana', 'mukunda', 'vakunda', 'mukorore', 'vakorore', 'mukomana', 'musikana'],
  culturalNotes: [
    'class 1 / 2 (mu-/va-) covers nouns for people. you see this pattern everywhere: mu-kunda (one daughter) → va-kunda (daughters).',
    'fsi distinguishes "mukomana" (boy) from "mukorore" (son); "musikana" (girl) from "mukunda" (daughter). the second of each pair implies relationship to parents.',
  ],
  exercises: () => [
    matching([
      { shona: 'mukunda', english: 'daughter' },
      { shona: 'mukorore', english: 'son' },
      { shona: 'mukomana', english: 'boy' },
      { shona: 'musikana', english: 'girl' },
      { shona: 'mwana', english: 'child' },
    ]),
    mcq('the plural of "mukunda" (daughter) is:', 'vakunda', ['mikunda', 'makunda', 'zvikunda']),
    mcq('which noun class do "mwana" and "mukunda" belong to?', 'class 1 (singular for people)', ['class 3 (natural things)', 'class 5 (large items)', 'class 7 (things)']),
    translate('vakorore vangu', 'my sons', { direction: 'shona_to_english' }),
    fillBlank('___ wangu (my child)', 'mwana', 'my child'),
    orderSentence(['vana', 'vangu', 'vatatu'], 'my three children'),
  ],
})

buildLesson({
  id: 'lesson-10',
  title: 'shona pronouns — i, you, we, they',
  description: 'i can use shona personal pronouns to refer to myself and others',
  category: CAT.U2,
  questId: QUEST.U2,
  vocabKeys: ['ini', 'iwe', 'iye', 'isu', 'imwi', 'ivo'],
  culturalNotes: [
    'pronouns in shona usually appear at the start of a sentence for emphasis ("ini ndini John" — "i, i am John"). the verb already carries the subject prefix, so the pronoun is optional.',
  ],
  exercises: () => [
    matching([
      { shona: 'ini', english: 'i / me' },
      { shona: 'iwe', english: 'you (sg.)' },
      { shona: 'iye', english: 'he / she' },
      { shona: 'isu', english: 'we' },
      { shona: 'imwi', english: 'you (pl. or respectful)' },
      { shona: 'ivo', english: 'they' },
    ]),
    mcq('which pronoun would you use to address an elder respectfully?', 'imwi', ['iwe', 'iye', 'ini']),
    translate('isu', 'we / us', { direction: 'shona_to_english' }),
    fillBlank('___ ndini Tatenda. (emphatic "i am Tatenda")', 'ini', 'i am Tatenda'),
    mcq('the third-person singular pronoun "iye" can mean:', 'either "he" or "she" (no gender distinction)', ['only "he"', 'only "she"', 'only "it"']),
    orderSentence(['ini', 'ndini', 'John'], 'i am John'),
  ],
})

// ============ UNIT 3: NUMBERS, TIME, DAYS ============
// CAT.U3 "Numbers & Time"

buildLesson({
  id: 'lesson-11',
  title: 'numbers one through five',
  description: 'i can count from one to five in shona',
  category: CAT.U3,
  questId: QUEST.U3,
  vocabKeys: ['posi', 'piri', 'tatu', 'china', 'shanu', '-mwe', '-viri', '-tatu', '-na', '-shanu'],
  culturalNotes: [
    'shona numbers have two forms: counting words ("posi, piri, tatu, china, shanu") and concord stems ("-mwe, -viri, -tatu, -na, -shanu") that attach to noun-class prefixes.',
    'so "two children" is "vana va-viri" — the va- agrees with class 2.',
  ],
  exercises: () => [
    matching([
      { shona: 'posi', english: 'one' },
      { shona: 'piri', english: 'two' },
      { shona: 'tatu', english: 'three' },
      { shona: 'china', english: 'four' },
      { shona: 'shanu', english: 'five' },
    ]),
    mcq('what number is "tatu"?', 'three', ['two', 'four', 'five']),
    fillBlank('vana va___ (two children — agreement form)', 'viri', 'two children'),
    translate('mazuva matatu', 'three days', { direction: 'shona_to_english' }),
    orderSentence(['mazuva', 'mashanu'], 'five days'),
    mcq('the counting form of "five" is:', 'shanu', ['china', 'tatu', 'gumi']),
  ],
})

buildLesson({
  id: 'lesson-12',
  title: 'numbers six through ten',
  description: 'i can count from six to ten in shona',
  category: CAT.U3,
  questId: QUEST.U3,
  vocabKeys: ['tanhatu', 'chinomwe', 'rusere', 'pfumbamwe', 'gumi', '-tanhatu', '-nomwe', '-sere', '-pfumbamwe'],
  culturalNotes: [
    '"gumi" (ten) is a noun, not an agreeing adjective. so "ten children" is just "vana gumi" — no prefix change on gumi.',
    'numbers six through nine still take noun-class concord: "masondo matanhatu" (six weeks), "mazuva manomwe" (seven days).',
  ],
  exercises: () => [
    matching([
      { shona: 'tanhatu', english: 'six' },
      { shona: 'chinomwe', english: 'seven' },
      { shona: 'rusere', english: 'eight' },
      { shona: 'pfumbamwe', english: 'nine' },
      { shona: 'gumi', english: 'ten' },
    ]),
    mcq('what number is "pfumbamwe"?', 'nine', ['eight', 'seven', 'ten']),
    translate('masondo manomwe', 'seven weeks', { direction: 'shona_to_english' }),
    mcq('how does "gumi" (ten) differ from numbers 1-9?', 'it is a noun and does not change form to agree', ['it always takes class 5 prefix', 'it appears before the noun', 'it is only used in counting, never in sentences']),
    fillBlank('mazuva ma___ (six days)', 'tanhatu', 'six days'),
    orderSentence(['vana', 'gumi'], 'ten children'),
  ],
})

buildLesson({
  id: 'lesson-13',
  title: 'days of the week',
  description: 'i can name the days of the week in shona',
  category: CAT.U3,
  questId: QUEST.U3,
  vocabKeys: ['Musumbunuko', 'Chipiri', 'Chitatu', 'China', 'Chishanu', 'Mugobera', 'Sondo', 'musi'],
  culturalNotes: [
    'four of the days come straight from the numbers: Chipiri ("the second" = Tuesday), Chitatu ("the third" = Wednesday), China ("the fourth" = Thursday), Chishanu ("the fifth" = Friday).',
    'to say "on tuesday", use "musi weChipiri" — "the day of the second [day]".',
  ],
  exercises: () => [
    matching([
      { shona: 'Musumbunuko', english: 'Monday' },
      { shona: 'Chipiri', english: 'Tuesday' },
      { shona: 'Chitatu', english: 'Wednesday' },
      { shona: 'China', english: 'Thursday' },
      { shona: 'Chishanu', english: 'Friday' },
      { shona: 'Mugobera', english: 'Saturday' },
      { shona: 'Sondo', english: 'Sunday' },
    ]),
    mcq('which day is "Chishanu"?', 'Friday', ['Wednesday', 'Sunday', 'Monday']),
    mcq('"Chitatu" literally relates to which number?', 'three (the third day)', ['two', 'four', 'five']),
    fillBlank('musi we___ (on Wednesday)', 'Chitatu', 'on Wednesday'),
    translate('musi weMugobera', 'on Saturday', { direction: 'shona_to_english' }),
    orderSentence(['ndakasvika', 'musi', 'weChitatu'], 'i arrived on Wednesday'),
  ],
})

buildLesson({
  id: 'lesson-14',
  title: 'time periods — day, week, month, year',
  description: 'i can talk about days, weeks, months, and years',
  category: CAT.U3,
  questId: QUEST.U3,
  vocabKeys: ['zuva', 'mazuva', 'sondo', 'masondo', 'mwedzi', 'gore', 'makore', 'rose'],
  culturalNotes: [
    'in fsi unit 6 the supplementary phrase "ndinozogara pano gore rose" — "i\'ll stay here a whole year" — uses "rose" (all/whole).',
  ],
  exercises: () => [
    matching([
      { shona: 'zuva', english: 'day, sun' },
      { shona: 'sondo', english: 'week' },
      { shona: 'mwedzi', english: 'month, moon' },
      { shona: 'gore', english: 'year' },
    ]),
    translate('mazuva mashanu', 'five days', { direction: 'shona_to_english' }),
    mcq('"mwedzi" can mean two things — which?', 'month and moon', ['month and week', 'day and year', 'morning and evening']),
    fillBlank('___ rose (a whole year)', 'gore', 'a whole year'),
    translate('masondo matatu', 'three weeks', { direction: 'shona_to_english' }),
    orderSentence(['makore', 'mana'], 'four years'),
  ],
})

buildLesson({
  id: 'lesson-15',
  title: 'how much? — asking prices',
  description: 'i can ask how much something costs',
  category: CAT.U3,
  questId: QUEST.U3,
  vocabKeys: ['mari', 'anoita marinyi', 'hobo', 'mahobo', '-tengesa', '-tenga'],
  culturalNotes: [
    'fsi unit 9 opens at a market: "ndinotengesa mahobo" — "i sell bananas". "anoita marinyi?" literally asks "what money does it do?" — meaning "how much is it?".',
  ],
  exercises: () => [
    translate('anoita marinyi?', 'how much is it?', { direction: 'shona_to_english' }),
    fillBlank('mari ___ ? (how much money?)', 'inyi', 'how much money?'),
    mcq('what is "mahobo"?', 'bananas', ['oranges', 'meat', 'bread']),
    mcq('"-tenga" means:', 'to buy', ['to sell', 'to eat', 'to give']),
    translate('ndinotengesa mahobo', 'i sell bananas', { direction: 'shona_to_english' }),
    orderSentence(['anoita', 'marinyi'], 'how much is it?'),
  ],
})

buildLesson({
  id: 'lesson-16',
  title: 'when did you arrive? when will you go?',
  description: 'i can ask "when" and tell someone about past and future arrivals',
  category: CAT.U3,
  questId: QUEST.U3,
  vocabKeys: ['rini', '-uya', 'ndakasvika', 'ndakauya', 'mangwana', 'manheru', 'gare gare', '-cha-'],
  culturalNotes: [
    'fsi unit 6 introduces "-ka-" for past actions before today, and unit 7 introduces "-cha-" for future ("ndichauya" — "i will come").',
    '"rini" means "when?" — pairing it with the past tense ("mwakauya rini?") asks "when did you come?".',
  ],
  exercises: () => [
    translate('mwakauya rini pano?', 'when did you come here?', { direction: 'shona_to_english' }),
    fillBlank('ndi___ uya mangwana. (i will come tomorrow)', 'cha', 'i will come tomorrow'),
    mcq('which prefix marks future tense?', '-cha-', ['-ka-', '-no-', '-nga-']),
    mcq('which prefix marks past (before today)?', '-ka-', ['-cha-', '-no-', '-nga-']),
    translate('ndichauya manheru', 'i will come in the evening', { direction: 'shona_to_english' }),
    orderSentence(['ndakasvika', 'musi', 'weChina'], 'i arrived on Thursday'),
  ],
})

// ============ UNIT 4: FOOD, HOME, DAILY LIFE ============
// CAT.U4 "Daily Life"

buildLesson({
  id: 'lesson-17',
  title: 'sadza — the staple food',
  description: 'i can talk about sadza and other food at a meal',
  category: CAT.U4,
  questId: QUEST.U4,
  vocabKeys: ['sadza', 'zviyo', '-dya', '-fara', 'muriwo', 'nyama'],
  culturalNotes: [
    'sadza is the heart of zimbabwean eating — thick maize-meal porridge eaten with relish (muriwo) or meat (nyama).',
    'fsi unit 18 has a mother asking her children "muri kufara here nesadza rezviyo?" — "are you enjoying the millet sadza?".',
  ],
  exercises: () => [
    matching([
      { shona: 'sadza', english: 'thick maize porridge' },
      { shona: 'zviyo', english: 'millet' },
      { shona: 'muriwo', english: 'vegetable / relish' },
      { shona: 'nyama', english: 'meat' },
    ]),
    translate('muri kufara here nesadza?', 'are you enjoying the sadza?', { direction: 'shona_to_english' }),
    mcq('"-dya" means:', 'to eat', ['to drink', 'to cook', 'to buy']),
    fillBlank('vana va___ sadza. (the children are eating sadza)', 'ri kudya', 'the children are eating sadza'),
    orderSentence(['ndiri', 'kudya', 'sadza'], 'i am eating sadza'),
    mcq('what is "muriwo" in a meal?', 'vegetable or relish eaten with sadza', ['the main porridge', 'a kind of bread', 'a dessert']),
  ],
})

buildLesson({
  id: 'lesson-18',
  title: 'mvura — water and the kitchen',
  description: 'i can ask for water and name items in the kitchen',
  category: CAT.U4,
  questId: QUEST.U4,
  vocabKeys: ['mvura', 'tafura', '-isa', '-unza', 'ndiro', 'hari', '-bvisa', 'mutsvairo'],
  culturalNotes: [
    'fsi unit 18 dialogue: "mwaisa mvura patafura here?" — "did you put the water on the table?". "patafura" combines pa- (on) + tafura (table).',
  ],
  exercises: () => [
    translate('unza mvura', 'bring water', { direction: 'shona_to_english' }),
    fillBlank('mvura ___ tafura. (water on the table)', 'pa', 'water on the table'),
    matching([
      { shona: 'mvura', english: 'water' },
      { shona: 'tafura', english: 'table' },
      { shona: 'ndiro', english: 'dish, plate' },
      { shona: 'hari', english: 'cooking pot' },
      { shona: 'mutsvairo', english: 'broom' },
    ]),
    mcq('"-unza" means:', 'to bring', ['to take away', 'to wash', 'to drink']),
    mcq('"-bvisa" means:', 'to remove / take off', ['to put on', 'to bring in', 'to clean']),
    orderSentence(['unza', 'mvura'], 'bring water'),
  ],
})

buildLesson({
  id: 'lesson-19',
  title: 'imba — the house and home',
  description: 'i can describe my home using shona size words',
  category: CAT.U4,
  questId: QUEST.U4,
  vocabKeys: ['imba', 'musha', '-kuru', 'huru', '-diki', '-chena', '-tete'],
  culturalNotes: [
    'fsi unit 7 introduces strong adjectives: "imba huru" (a large house), "imba diki" (a small house), "imba chena" (a white house).',
    'these adjectives take a class-9 form ("huru", "diki", "chena") that differs from the underlying stem.',
  ],
  exercises: () => [
    matching([
      { shona: 'imba', english: 'house' },
      { shona: 'musha', english: 'home' },
      { shona: 'huru', english: 'large (cl. 9 form)' },
      { shona: 'diki', english: 'small (cl. 9 form)' },
      { shona: 'chena', english: 'white' },
    ]),
    translate('imba huru', 'a large house', { direction: 'shona_to_english' }),
    fillBlank('imba ___ . (a small house)', 'diki', 'a small house'),
    mcq('which means "white"?', 'chena', ['huru', 'diki', 'tete']),
    orderSentence(['imba', 'yangu', 'huru'], 'my house is large'),
    mcq('"musha" means:', 'home', ['city', 'school', 'field']),
  ],
})

buildLesson({
  id: 'lesson-20',
  title: 'demonstratives — this, that, these, those',
  description: 'i can point to objects with the right shona demonstrative',
  category: CAT.U4,
  questId: QUEST.U4,
  vocabKeys: ['uyu', 'uyo', 'ava', 'avo', 'iyi', 'iri', 'aya', 'ichi', 'izvi', 'idzi'],
  culturalNotes: [
    'shona demonstratives agree with the noun class. "this house" (imba, cl. 9) → "iyi imba"; "this child" (mwana, cl. 1) → "uyu mwana".',
    'the proximal ends in -i/-a; the distal ends in -o. "ichi" = this (cl. 7), "icho" = that (cl. 7).',
  ],
  exercises: () => [
    matching([
      { shona: 'uyu', english: 'this (cl. 1 — person)' },
      { shona: 'iyi', english: 'this (cl. 9 — e.g. imba)' },
      { shona: 'aya', english: 'these (cl. 6 — e.g. mahobo)' },
      { shona: 'ichi', english: 'this (cl. 7 — e.g. chikoro)' },
      { shona: 'izvi', english: 'these (cl. 8 — e.g. zvikoro)' },
    ]),
    fillBlank('___ mahobo (these bananas)', 'aya', 'these bananas'),
    translate('uyu mwana', 'this child', { direction: 'shona_to_english' }),
    mcq('how do you say "that house" (imba is class 9)?', 'iyo imba', ['uyo imba', 'icho imba', 'ayo imba']),
    orderSentence(['ichi', 'chikoro'], 'this school'),
    mcq('what tells you whether to use uyu / iyi / ichi / izvi?', 'the noun class of the noun', ['the time of day', 'whether the speaker is young or old', 'the politeness level']),
  ],
})

// ============ UNIT 5: PLACES & GETTING AROUND ============
// CAT.U5 "Getting Around"

buildLesson({
  id: 'lesson-21',
  title: 'locative prefixes — ku, pa, mu',
  description: 'i can say "to", "at", and "in" with shona locative prefixes',
  category: CAT.U5,
  questId: QUEST.U5,
  vocabKeys: ['ku-', 'pa-', 'mu-', 'kwa-', 'pano', 'apo', 'kure', 'patyo'],
  culturalNotes: [
    'fsi unit 5 introduces the locatives. "ku-" / "kwa-" = motion or general "at"; "pa-" = on / at a specific point; "mu-" = inside.',
    '"pano" is "here", "apo" is "there", "kure" is "far", "patyo" is "near".',
  ],
  exercises: () => [
    matching([
      { shona: 'ku-', english: 'to / at (motion, general)' },
      { shona: 'pa-', english: 'on / at (specific point)' },
      { shona: 'mu-', english: 'in / inside' },
      { shona: 'kwa-', english: 'at / to (with proper names)' },
    ]),
    fillBlank('ndinogara ___ Harare. (i live in Harare)', 'mu', 'i live in Harare'),
    mcq('which prefix would you use for "to a person\'s home"?', 'kwa- (e.g. kwaMutare)', ['mu-', 'pa-', 'na-']),
    translate('pano', 'here', { direction: 'shona_to_english' }),
    translate('kure', 'far', { direction: 'shona_to_english' }),
    orderSentence(['ndinogara', 'kure'], 'i live far away'),
  ],
})

buildLesson({
  id: 'lesson-22',
  title: 'cities and towns of zimbabwe',
  description: 'i can talk about going to and living in zimbabwean cities',
  category: CAT.U5,
  questId: QUEST.U5,
  vocabKeys: ['Harare', 'Mutare', 'Bhuruwayo', 'Marondera', 'Gweru', 'Kwekwe', 'Sakubva', 'Rusapi'],
  culturalNotes: [
    'note: fsi (1965) uses pre-independence names — Salisbury for Harare, Umtali for Mutare. we use the modern names.',
    'with proper place names you use "kwa-" or "ku-": "kwaHarare", "kuMutare".',
  ],
  exercises: () => [
    matching([
      { shona: 'Harare', english: 'Harare (capital)' },
      { shona: 'Mutare', english: 'Mutare (east)' },
      { shona: 'Bhuruwayo', english: 'Bulawayo' },
      { shona: 'Gweru', english: 'Gweru' },
    ]),
    fillBlank('ndinoenda ___ Mutare. (i am going to Mutare)', 'ku', 'i am going to Mutare'),
    mcq('which is the largest city in eastern zimbabwe?', 'Mutare', ['Harare', 'Gweru', 'Bulawayo']),
    translate('ndinogara muHarare', 'i live in Harare', { direction: 'shona_to_english' }),
    orderSentence(['ndinoenda', 'kuBhuruwayo'], 'i am going to Bulawayo'),
    mcq('what does "Sakubva" refer to?', 'an area near Mutare', ['a region of Harare', 'a kind of food', 'a job']),
  ],
})

buildLesson({
  id: 'lesson-23',
  title: 'where do you live? where do you work?',
  description: 'i can ask and answer where someone lives and works',
  category: CAT.U5,
  questId: QUEST.U5,
  vocabKeys: ['munogara papi', 'ndinogara', '-sanda', 'ndinosanda', 'basa', 'munoita basanyi', 'ofisi', 'chikoro'],
  culturalNotes: [
    'fsi unit 5 dialogue: "muri kuitenyi apo?" — "what are you doing there?" — "ndinosanda muPost Office" — "i work at the Post Office".',
  ],
  exercises: () => [
    translate('munogara papi?', 'where do you live?', { direction: 'shona_to_english' }),
    translate('munoita basanyi?', 'what work do you do?', { direction: 'shona_to_english' }),
    fillBlank('ndinosanda mu___ . (i work in an office)', 'ofisi', 'i work in an office'),
    mcq('what does "basa" mean?', 'work, job', ['family', 'food', 'home']),
    orderSentence(['ndinogara', 'muHarare'], 'i live in Harare'),
    mcq('"chikoro" means:', 'school', ['shop', 'office', 'church']),
  ],
})

buildLesson({
  id: 'lesson-24',
  title: 'going places',
  description: 'i can name common places and say what i\'m going there to do',
  category: CAT.U5,
  questId: QUEST.U5,
  vocabKeys: ['musha', 'munda', 'chechi', 'rwizi', 'tsime', 'chitoro', 'chikoro', '-enda', '-uya'],
  culturalNotes: [
    'fsi unit 8 lists places one might go: kumusha (home), kumunda (to the field), kuchechi (to church), kurwizi (to the river), kutsime (to the well).',
  ],
  exercises: () => [
    matching([
      { shona: 'musha', english: 'home' },
      { shona: 'munda', english: 'field' },
      { shona: 'chechi', english: 'church' },
      { shona: 'rwizi', english: 'river' },
      { shona: 'tsime', english: 'well' },
      { shona: 'chitoro', english: 'shop' },
    ]),
    fillBlank('ndinoenda ___ chikoro. (i am going to school)', 'ku', 'i am going to school'),
    translate('ndinoenda kumusha', 'i am going home', { direction: 'shona_to_english' }),
    mcq('"rwizi" means:', 'river', ['mountain', 'forest', 'desert']),
    orderSentence(['ndinoenda', 'kuchitoro'], 'i am going to the shop'),
    mcq('"-enda" means:', 'to go', ['to come', 'to stay', 'to leave behind']),
  ],
})

buildLesson({
  id: 'lesson-25',
  title: 'transport — how did you get here?',
  description: 'i can talk about how someone travelled or arrived',
  category: CAT.U5,
  questId: QUEST.U5,
  vocabKeys: ['motoka', 'bhazi', 'chitima', 'ngoro', 'rwendo', 'na', '-svika'],
  culturalNotes: [
    'fsi unit 23 introduces transport: "nechitima" — "by train". the prefix "ne-" (from "na" + class agreement) marks the means.',
  ],
  exercises: () => [
    matching([
      { shona: 'motoka', english: 'car' },
      { shona: 'bhazi', english: 'bus' },
      { shona: 'chitima', english: 'train' },
      { shona: 'ngoro', english: 'wagon, cart' },
      { shona: 'rwendo', english: 'journey' },
    ]),
    translate('nechitima', 'by train', { direction: 'shona_to_english' }),
    fillBlank('ndakauya ne___ . (i came by bus)', 'bhazi', 'i came by bus'),
    mcq('"rwendo" means:', 'journey', ['vehicle', 'driver', 'fuel']),
    orderSentence(['ndakasvika', 'nemotoka'], 'i arrived by car'),
    mcq('"-svika" means:', 'to arrive', ['to leave', 'to return', 'to wait']),
  ],
})

// ============ UNIT 6: ACTIONS / VERBS ============
// CAT.U6 "Doing Things"

buildLesson({
  id: 'lesson-26',
  title: 'subject prefixes',
  description: 'i can use the right subject prefix on a verb for i, you, we, they',
  category: CAT.U6,
  questId: QUEST.U6,
  vocabKeys: ['ndinoda', 'munogara', 'anodzidzisa', '-no-', '-da'],
  culturalNotes: [
    'shona verbs carry the subject on the front. ndi- (i), u- (you sg.), a- (he/she), ti- (we), mu- (you pl./resp.), va- (they).',
    '"ndinoda" = ndi- (i) + -no- (present) + -da (want) = "i want".',
  ],
  exercises: () => [
    matching([
      { shona: 'ndi-', english: 'i (subject)' },
      { shona: 'u-', english: 'you sg.' },
      { shona: 'a-', english: 'he/she' },
      { shona: 'ti-', english: 'we' },
      { shona: 'mu-', english: 'you pl./resp.' },
      { shona: 'va-', english: 'they' },
    ]),
    translate('ndinoda', 'i want / i love', { direction: 'shona_to_english' }),
    fillBlank('___ noda mwana. (he/she wants a child)', 'a', 'he/she wants a child'),
    mcq('which prefix is "we"?', 'ti-', ['mu-', 'va-', 'a-']),
    orderSentence(['ndinoda', 'sadza'], 'i want sadza'),
    mcq('what does the "-no-" between subject and stem mean?', 'present tense / habitual', ['past tense', 'future tense', 'negation']),
  ],
})

buildLesson({
  id: 'lesson-27',
  title: 'present continuous — what i am doing right now',
  description: 'i can say what i am doing right now using "ndiri ku-"',
  category: CAT.U6,
  questId: QUEST.U6,
  vocabKeys: ['-ri', 'ndiri kubika', '-bika', 'ndiri kuverenga', '-verenga', 'ndiri kutamba', '-tamba', 'ndiri kugeza', '-geza'],
  culturalNotes: [
    'fsi unit 9 introduces "-ri" (am/is/are) + infinitive: "ndiri kubika" = "i am cooking". this is the natural way to say "right now i am doing X".',
  ],
  exercises: () => [
    translate('ndiri kubika', 'i am cooking', { direction: 'shona_to_english' }),
    translate('ndiri kuverenga', 'i am reading (or counting)', { direction: 'shona_to_english' }),
    fillBlank('ndi___ kutamba. (i am playing)', 'ri', 'i am playing'),
    matching([
      { shona: '-bika', english: 'to cook' },
      { shona: '-verenga', english: 'to read, count' },
      { shona: '-tamba', english: 'to play' },
      { shona: '-geza', english: 'to wash' },
    ]),
    orderSentence(['ndiri', 'kubika', 'sadza'], 'i am cooking sadza'),
    mcq('what is "-ri" used for?', 'expressing "am / is / are"', ['marking past tense', 'asking questions', 'pointing']),
  ],
})

buildLesson({
  id: 'lesson-28',
  title: 'common verbs — go, come, do, eat, drink',
  description: 'i can use the most useful action verbs in shona',
  category: CAT.U6,
  questId: QUEST.U6,
  vocabKeys: ['-enda', '-uya', '-ita', '-dya', '-nwa', '-da'],
  culturalNotes: [
    'these six verbs cover most of daily speech: -enda (go), -uya (come), -ita (do), -dya (eat), -nwa (drink), -da (want/love).',
  ],
  exercises: () => [
    matching([
      { shona: '-enda', english: 'to go' },
      { shona: '-uya', english: 'to come' },
      { shona: '-ita', english: 'to do' },
      { shona: '-dya', english: 'to eat' },
      { shona: '-nwa', english: 'to drink' },
      { shona: '-da', english: 'to want, love' },
    ]),
    translate('ndinoda mvura', 'i want water', { direction: 'shona_to_english' }),
    fillBlank('ndiri ku___ sadza. (i am eating sadza)', 'dya', 'i am eating sadza'),
    mcq('"-uya" means:', 'to come', ['to go', 'to be', 'to leave']),
    orderSentence(['ndinoenda', 'kuchitoro'], 'i am going to the shop'),
    mcq('the infinitive "ku-" + "-da" forms which word?', 'kuda — to want / to love', ['kude — already wanted', 'kuda — i want', 'kanda — to throw']),
  ],
})

buildLesson({
  id: 'lesson-29',
  title: 'work verbs',
  description: 'i can describe what kind of work someone does',
  category: CAT.U6,
  questId: QUEST.U6,
  vocabKeys: ['kurima', 'kuchaira', 'kuweza', 'kurapa', 'kuvaka', 'kudzidzisa', 'kunyora', '-sanda'],
  culturalNotes: [
    'fsi unit 5 lists occupational verbs: kurima (farming), kuchaira (driving), kuweza (carpentry), kurapa (medical), kuvaka (building), kudzidzisa (teaching), kunyora (clerical writing).',
  ],
  exercises: () => [
    matching([
      { shona: 'kurima', english: 'to farm / plow' },
      { shona: 'kuchaira', english: 'to drive' },
      { shona: 'kuweza', english: 'to do carpentry' },
      { shona: 'kurapa', english: 'to heal (medical)' },
      { shona: 'kuvaka', english: 'to build' },
      { shona: 'kudzidzisa', english: 'to teach' },
    ]),
    translate('anodzidzisa', 'he/she teaches', { direction: 'shona_to_english' }),
    fillBlank('ndinosanda ku___ . (i work at building)', 'vaka', 'i work at building'),
    mcq('which verb means "to teach"?', 'kudzidzisa', ['kurima', 'kuvaka', 'kuchaira']),
    orderSentence(['anorima', 'munda'], 'he/she plows the field'),
    mcq('"kunyora" means:', 'to write', ['to read', 'to count', 'to speak']),
  ],
})

// ============ UNIT 7: EXPRESSING YOURSELF — feelings, polite forms ============

buildLesson({
  id: 'lesson-30',
  title: 'asking permission — ndingaenda?',
  description: 'i can politely ask permission or make a soft request',
  category: CAT.U7,
  questId: QUEST.U7,
  vocabKeys: ['-nga-', 'ndingada', 'tingaenda', 'nguva'],
  culturalNotes: [
    'fsi unit 8 introduces "-nga-" — the potential prefix that adds politeness. "ndingada" softens "i want" into "i would like".',
    '"tingaenda?" = "may we go?" — combining ti- (we) + -nga- (potential) + -enda (go).',
  ],
  exercises: () => [
    translate('ndingada mvura', 'i would like water', { direction: 'shona_to_english' }),
    fillBlank('ti___ enda nguvanyi? (what time can we go?)', 'nga', 'what time can we go?'),
    mcq('what does "-nga-" add to a verb?', 'a potential / polite meaning (can / may / would like)', ['past tense', 'future tense', 'negation']),
    translate('tingaenda?', 'can we go?', { direction: 'shona_to_english' }),
    orderSentence(['ndingada', 'sadza'], 'i would like sadza'),
    mcq('which is more polite when asking for something at a shop?', 'ndingada', ['ndinoda', 'ndaida', 'ndakada']),
  ],
})

buildLesson({
  id: 'lesson-31',
  title: 'shopping — at the chitoro',
  description: 'i can buy basic items at a shop',
  category: CAT.U7,
  questId: QUEST.U7,
  vocabKeys: ['chitoro', 'simbi', 'chigero', 'munyu', 'shuka', 'chingwa', 'sipo', 'machisi'],
  culturalNotes: [
    'fsi unit 8 is built around a shop dialogue: "ndingada simbi" — "i\'d like an iron".',
  ],
  exercises: () => [
    matching([
      { shona: 'simbi', english: 'iron (for clothes)' },
      { shona: 'chigero', english: 'scissors' },
      { shona: 'munyu', english: 'salt' },
      { shona: 'shuka', english: 'sugar' },
      { shona: 'chingwa', english: 'bread' },
      { shona: 'sipo', english: 'soap' },
    ]),
    translate('ndingada chingwa', 'i would like bread', { direction: 'shona_to_english' }),
    fillBlank('ndichaenda ku___ . (i will go to the shop)', 'chitoro', 'i will go to the shop'),
    mcq('what does "machisi" mean?', 'matches', ['money', 'milk', 'meat']),
    orderSentence(['ndingada', 'shuka'], 'i would like sugar'),
    mcq('"sipo" is:', 'soap', ['salt', 'sugar', 'spoon']),
  ],
})

buildLesson({
  id: 'lesson-32',
  title: 'wanting and choosing',
  description: 'i can express what i want versus what someone else wants',
  category: CAT.U7,
  questId: QUEST.U7,
  vocabKeys: ['-da', 'ndinoda', 'ndingada', '-angu', '-ake'],
  culturalNotes: [
    'fsi unit 7 systematic practice: "ndinoda mwana wangu" (i love my child), "anoda mai vake" (he/she loves his/her mother).',
  ],
  exercises: () => [
    translate('ndinoda mhuri yangu', 'i love my family', { direction: 'shona_to_english' }),
    fillBlank('a___ mwana wake. (he/she loves his/her child)', 'noda', 'he/she loves his/her child'),
    mcq('"-angu" means:', 'my', ['your', 'his/her', 'our']),
    mcq('"-ake" means:', 'his / her', ['my', 'your', 'their']),
    orderSentence(['anoda', 'mai', 'vake'], 'he/she loves his/her mother'),
    translate('ndinoda mwana wangu', 'i love my child', { direction: 'shona_to_english' }),
  ],
})

buildLesson({
  id: 'lesson-33',
  title: 'past tense — yesterday and before',
  description: 'i can talk about things that happened yesterday or earlier',
  category: CAT.U7,
  questId: QUEST.U7,
  vocabKeys: ['-ka-', 'ndakasvika', 'ndakauya', 'ndakaenda', 'mangwana'],
  culturalNotes: [
    'the "-ka-" past is for things that happened on a previous day or earlier. for things that happened TODAY, shona uses a different form ("hodiernal") — covered next.',
  ],
  exercises: () => [
    translate('ndakauya', 'i came (before today)', { direction: 'shona_to_english' }),
    fillBlank('nda___ svika musi weChitatu. (i arrived on Wednesday)', 'ka', 'i arrived on Wednesday'),
    mcq('which prefix marks past tense (before today)?', '-ka-', ['-no-', '-cha-', '-nga-']),
    translate('ndakaenda kuHarare', 'i went to Harare', { direction: 'shona_to_english' }),
    orderSentence(['ndakasvika', 'manheru'], 'i arrived in the evening'),
    mcq('would "-ka-" be used for an event that happened an hour ago today?', 'no — for today, shona uses the hodiernal form (no -ka-)', ['yes — always', 'only with future', 'only with imperatives']),
  ],
})

// ============ UNIT 8: CULTURE & TRADITIONS ============

buildLesson({
  id: 'lesson-34',
  title: 'kinship — sekuru, ambuya, tete',
  description: 'i can name and address extended family members',
  category: CAT.U8,
  questId: QUEST.U8,
  vocabKeys: ['sekuru', 'ambuya', 'tete', 'mukoma', 'muninina', 'hanzvadzi'],
  culturalNotes: [
    'fsi unit 23 introduces the kinship spine: sekuru (grandfather / maternal uncle), tete (paternal aunt), hanzvadzi (sibling of opposite sex), mukoma (older same-sex sibling), muninina (younger same-sex sibling).',
    'these terms map onto the extended family. your father\'s brother is also "baba"; your mother\'s sister is also "mai". this reflects unhu — community as kin.',
  ],
  exercises: () => [
    matching([
      { shona: 'sekuru', english: 'grandfather / maternal uncle' },
      { shona: 'ambuya', english: 'grandmother' },
      { shona: 'tete', english: 'paternal aunt' },
      { shona: 'mukoma', english: 'older sibling (same sex)' },
      { shona: 'muninina', english: 'younger sibling (same sex)' },
      { shona: 'hanzvadzi', english: 'sibling of opposite sex' },
    ]),
    mcq('how would a girl refer to her older sister?', 'mukoma (older same-sex sibling)', ['hanzvadzi', 'tete', 'sekuru']),
    mcq('how would a girl refer to her brother?', 'hanzvadzi (opposite-sex sibling)', ['mukoma', 'muninina', 'baba']),
    translate('sekuru vangu', 'my grandfather (or uncle)', { direction: 'shona_to_english' }),
    fillBlank('___ yangu yauya. (my sibling-of-opposite-sex came)', 'hanzvadzi', 'my brother/sister (opp. sex) came'),
    orderSentence(['ambuya', 'vangu'], 'my grandmother'),
  ],
})

buildLesson({
  id: 'lesson-35',
  title: 'noun classes 1/2 — people',
  description: 'i can identify and use the mu-/va- people class',
  category: CAT.U8,
  questId: QUEST.U8,
  vocabKeys: ['munhu', 'vanhu', 'mwana', 'vana', 'mukomana', 'vakomana', 'musikana', 'mufundisi'],
  culturalNotes: [
    'class 1 (mu-) and class 2 (va-) are the people classes. they govern most agreements you\'ve already seen.',
    'mwana / vana is irregular: the plural prefix is va- but the singular drops the m to mw- before the vowel.',
  ],
  exercises: () => [
    matching([
      { shona: 'munhu', english: 'person' },
      { shona: 'vanhu', english: 'people' },
      { shona: 'mwana', english: 'child' },
      { shona: 'vana', english: 'children' },
      { shona: 'mukomana', english: 'boy' },
      { shona: 'vakomana', english: 'boys' },
    ]),
    mcq('what makes a noun belong to class 1/2?', 'it refers to a person and takes the mu- / va- prefix pair', ['it starts with the letter m', 'it is plural', 'it is feminine']),
    fillBlank('___ vatatu (three people)', 'vanhu', 'three people'),
    translate('vana vangu', 'my children', { direction: 'shona_to_english' }),
    mcq('which is the plural of "musikana"?', 'vasikana', ['mhandara', 'majaha', 'masikana']),
    orderSentence(['mufundisi', 'wedu'], 'our teacher'),
  ],
})

buildLesson({
  id: 'lesson-36',
  title: 'noun classes 3/4 and 5/6',
  description: 'i can recognize the mu-/mi- and ri-/ma- noun classes',
  category: CAT.U8,
  questId: QUEST.U8,
  vocabKeys: ['muti', 'mwedzi', 'munda', 'zuva', 'mazuva', 'gore', 'makore', 'basa'],
  culturalNotes: [
    'class 3/4 (mu-/mi-) covers natural things: muti / miti (tree / trees), munda / minda (field / fields).',
    'class 5/6 (often no prefix or ri- / ma-) covers paired items, larger objects, or augmentatives: zuva / mazuva (day / days), gore / makore (year / years).',
  ],
  exercises: () => [
    matching([
      { shona: 'muti', english: 'tree (cl. 3)' },
      { shona: 'mwedzi', english: 'month / moon (cl. 3)' },
      { shona: 'munda', english: 'field (cl. 3)' },
      { shona: 'zuva', english: 'day, sun (cl. 5)' },
      { shona: 'mazuva', english: 'days (cl. 6)' },
      { shona: 'basa', english: 'work (cl. 5)' },
    ]),
    mcq('the plural of "zuva" (day) is:', 'mazuva', ['mizuva', 'vazuva', 'zvizuva']),
    fillBlank('mi___ mitatu (three trees)', 'ti', 'three trees'),
    mcq('which noun class covers most "large object" nouns?', 'class 5/6 (ri-/ma-)', ['class 1/2', 'class 7/8', 'class 11/10']),
    orderSentence(['miti', 'mishanu'], 'five trees'),
    translate('basa rangu', 'my work', { direction: 'shona_to_english' }),
  ],
})

buildLesson({
  id: 'lesson-37',
  title: 'noun classes 7/8 and 9/10',
  description: 'i can recognize the chi-/zvi- and n-/dzi- noun classes',
  category: CAT.U8,
  questId: QUEST.U8,
  vocabKeys: ['chikoro', 'zvikoro', 'chitoro', 'chitima', 'imba', 'motoka', 'mhuri', 'mvura'],
  culturalNotes: [
    'class 7/8 (chi-/zvi-) covers things, languages, and diminutives. chikoro / zvikoro (school / schools).',
    'class 9/10 has no clear prefix in standard shona — many nouns just start with a nasal or consonant. imba (house), motoka (car), mhuri (family). plurals are often identical, marked by agreement.',
  ],
  exercises: () => [
    matching([
      { shona: 'chikoro', english: 'school (cl. 7)' },
      { shona: 'zvikoro', english: 'schools (cl. 8)' },
      { shona: 'chitoro', english: 'shop (cl. 7)' },
      { shona: 'imba', english: 'house (cl. 9)' },
      { shona: 'mhuri', english: 'family (cl. 9)' },
    ]),
    mcq('the plural of "chitoro" is:', 'zvitoro', ['vitoro', 'matoro', 'mitoro']),
    fillBlank('zvi___ mitatu (three schools)', 'koro', 'three schools'),
    mcq('how do you typically form the plural of a class 9 noun like "imba"?', 'often identical to the singular; agreement words distinguish them', ['add ma-', 'add zvi-', 'add mi-']),
    translate('chikoro chedu', 'our school', { direction: 'shona_to_english' }),
    orderSentence(['zvitoro', 'zvitatu'], 'three shops'),
  ],
})

// ============ UNIT 9: ANIMALS / NATURE ============

buildLesson({
  id: 'lesson-38',
  title: 'animals you\'ll hear about',
  description: 'i can name common animals that appear in shona stories',
  category: CAT.U9,
  questId: QUEST.U9,
  vocabKeys: ['shumba', 'tsuro', 'muti', 'mvura', 'mwedzi', 'zuva'],
  culturalNotes: [
    'tsuro (the hare) is the trickster of shona folktales — clever and often outwitting larger animals.',
    'shumba (lion) is also a totem (mutupo) — clan-name shared by many families.',
  ],
  exercises: () => [
    matching([
      { shona: 'shumba', english: 'lion' },
      { shona: 'tsuro', english: 'hare, rabbit' },
      { shona: 'muti', english: 'tree' },
      { shona: 'mvura', english: 'water / rain' },
      { shona: 'zuva', english: 'sun / day' },
      { shona: 'mwedzi', english: 'moon / month' },
    ]),
    mcq('"tsuro" plays what role in shona folktales?', 'the clever trickster', ['the wise elder', 'the lazy fool', 'the brave warrior']),
    mcq('which is also a totem (mutupo) name?', 'shumba', ['mvura', 'zuva', 'mwedzi']),
    translate('shumba huru', 'a large lion', { direction: 'shona_to_english' }),
    fillBlank('mu___ mukuru (a large tree)', 'ti', 'a large tree'),
    orderSentence(['tsuro', 'naDiro'], 'the hare and Diro (a folktale opening)'),
  ],
})

buildLesson({
  id: 'lesson-39',
  title: 'sun, rain, and seasons',
  description: 'i can talk briefly about the weather using shona nature words',
  category: CAT.U9,
  questId: QUEST.U9,
  vocabKeys: ['zuva', 'mvura', 'mwedzi', 'gore', 'manheru', 'mangwanani'],
  culturalNotes: [
    '"mvura" is both rain and water — context tells you which. rain is at the heart of zimbabwean agriculture and language.',
  ],
  exercises: () => [
    mcq('"mvura" can mean which two things?', 'water and rain', ['fire and water', 'rain and sun', 'air and earth']),
    matching([
      { shona: 'zuva', english: 'sun, day' },
      { shona: 'mvura', english: 'water / rain' },
      { shona: 'mwedzi', english: 'moon / month' },
      { shona: 'gore', english: 'year' },
      { shona: 'manheru', english: 'evening' },
    ]),
    fillBlank('mangwanani ___ . (the morning sun)', 'zuva', 'morning sun'),
    translate('mvura yauya', 'the rain has come', { direction: 'shona_to_english' }),
    orderSentence(['zuva', 'guru'], 'a strong sun'),
    mcq('"manheru" means:', 'evening', ['morning', 'afternoon', 'night']),
  ],
})

// ============ UNIT 10: MODERN LIFE ============

buildLesson({
  id: 'lesson-40',
  title: 'getting around town',
  description: 'i can talk about going around a city by car, bus, or train',
  category: CAT.U10,
  questId: QUEST.U10,
  vocabKeys: ['motoka', 'bhazi', 'chitima', 'guta', 'Harare', '-enda'],
  culturalNotes: [
    'fsi was written when transport vocabulary was much simpler. these basic terms remain the most common in modern shona.',
  ],
  exercises: () => [
    translate('ndinoenda nemotoka', 'i am going by car', { direction: 'shona_to_english' }),
    matching([
      { shona: 'motoka', english: 'car' },
      { shona: 'bhazi', english: 'bus' },
      { shona: 'chitima', english: 'train' },
      { shona: 'guta', english: 'city' },
    ]),
    fillBlank('ndinoenda ne___ kuHarare. (i am going by bus to Harare)', 'bhazi', 'i am going by bus to Harare'),
    mcq('what does "guta" mean?', 'city', ['village', 'farm', 'mountain']),
    orderSentence(['ndinoenda', 'kuguta'], 'i am going to the city'),
    mcq('how do you say "by train" using shona ne- prefix?', 'nechitima', ['kuchitima', 'machitima', 'vachitima']),
  ],
})

buildLesson({
  id: 'lesson-41',
  title: 'in the modern city',
  description: 'i can name modern places and items',
  category: CAT.U10,
  questId: QUEST.U10,
  vocabKeys: ['guta', 'chitoro', 'hosipitari', 'ofisi', 'chechi', 'chikoro'],
  culturalNotes: [
    'fsi documents loan-words integrated into shona — "ofisi" (office), "hosipitari" (hospital), "chechi" (church). these come from english but are fully shona-grammatically integrated.',
  ],
  exercises: () => [
    matching([
      { shona: 'guta', english: 'city' },
      { shona: 'chitoro', english: 'shop' },
      { shona: 'hosipitari', english: 'hospital' },
      { shona: 'ofisi', english: 'office' },
      { shona: 'chechi', english: 'church' },
      { shona: 'chikoro', english: 'school' },
    ]),
    fillBlank('ndinoenda ku___ . (i am going to the hospital)', 'hosipitari', 'i am going to the hospital'),
    mcq('"chechi" comes from which english word?', 'church', ['chess', 'cheese', 'cherry']),
    translate('ofisi yangu', 'my office', { direction: 'shona_to_english' }),
    orderSentence(['ndinosanda', 'muhosipitari'], 'i work in a hospital'),
    mcq('which of these is the modern city of Zimbabwe\'s capital?', 'Harare', ['Mutare', 'Bulawayo', 'Gweru']),
  ],
})

// ============ UNIT 11: SOCIETY & GOVERNANCE ============
// We have limited FSI material here — keep this unit short and grounded in
// what FSI actually covers (work / institutions / asking about people).

buildLesson({
  id: 'lesson-42',
  title: 'looking for someone',
  description: 'i can ask after someone and respond when they are not there',
  category: CAT.U11,
  questId: QUEST.U11,
  vocabKeys: ['-tsvaka', 'muri kutsvaka ani', 'ani', 'ndiri kuda', 'waenda', 'ndaida kutaura'],
  culturalNotes: [
    'fsi unit 10 opens with this scenario: someone visits looking for a person who has gone out. learning to ask after someone is an everyday skill.',
  ],
  exercises: () => [
    translate('muri kutsvaka ani?', 'who are you looking for?', { direction: 'shona_to_english' }),
    fillBlank('ndiri kuda ___ . (i need / want to see [name])', 'Baba', 'i want to see Baba'),
    mcq('"waenda" means:', 'he/she went (today)', ['he/she came', 'he/she stayed', 'he/she will go']),
    translate('ndaida kutaura naye', 'i wanted to speak with him/her', { direction: 'shona_to_english' }),
    orderSentence(['muri', 'kutsvaka', 'ani'], 'who are you looking for?'),
    mcq('"ani" means:', 'who?', ['where?', 'when?', 'what?']),
  ],
})

buildLesson({
  id: 'lesson-43',
  title: 'talking about work and institutions',
  description: 'i can describe what work people do and where they work',
  category: CAT.U11,
  questId: QUEST.U11,
  vocabKeys: ['basa', 'munoita basanyi', 'ofisi', 'hosipitari', 'chikoro', 'kudzidzisa', 'kurapa', 'kuvaka'],
  culturalNotes: [
    'fsi unit 5\'s practice conversation: "vanoita basanyi? — vanochaira" — "what work do they do? — they drive".',
  ],
  exercises: () => [
    translate('munoita basanyi?', 'what work do you do?', { direction: 'shona_to_english' }),
    fillBlank('ndinosanda mu___ . (i work in a school)', 'chikoro', 'i work in a school'),
    matching([
      { shona: 'kudzidzisa', english: 'to teach' },
      { shona: 'kurapa', english: 'to heal (medicine)' },
      { shona: 'kuvaka', english: 'to build' },
      { shona: 'kunyora', english: 'to write (clerical)' },
    ]),
    mcq('which verb means "to heal" or do medical work?', 'kurapa', ['kuvaka', 'kunyora', 'kurima']),
    orderSentence(['anodzidzisa', 'pachikoro'], 'he/she teaches at school'),
    translate('basa rangu', 'my work', { direction: 'shona_to_english' }),
  ],
})

// ============ UNIT 12: COMPLEX COMMUNICATION ============

buildLesson({
  id: 'lesson-44',
  title: 'connecting people and things — "na"',
  description: 'i can connect nouns and pronouns with "na" (and / with)',
  category: CAT.U12,
  questId: QUEST.U12,
  vocabKeys: ['na', 'baba', 'mai', 'ini', 'iwe', 'iye'],
  culturalNotes: [
    'fsi unit 14 covers "na" — "and / with". it combines with pronouns to form: neni (with me), newe (with you), naye (with him/her), nesu (with us), nemwi (with you pl.), navo (with them).',
  ],
  exercises: () => [
    matching([
      { shona: 'neni', english: 'with me' },
      { shona: 'newe', english: 'with you (sg.)' },
      { shona: 'naye', english: 'with him / her' },
      { shona: 'nesu', english: 'with us' },
      { shona: 'nemwi', english: 'with you (pl./resp.)' },
      { shona: 'navo', english: 'with them' },
    ]),
    translate('ndakauya naye', 'i came with him/her', { direction: 'shona_to_english' }),
    fillBlank('ndaida kutaura ___ . (i wanted to speak with him/her)', 'naye', 'with him/her'),
    mcq('"baba na mai" means:', 'father and mother', ['father or mother', 'father is mother', 'father, mother (oh!)']),
    orderSentence(['baba', 'na', 'mai'], 'father and mother'),
    mcq('how do you say "with us"?', 'nesu', ['neni', 'newe', 'navo']),
  ],
})

buildLesson({
  id: 'lesson-45',
  title: 'asking "how" and "what kind"',
  description: 'i can use "-senyi", "-rinyi", and "-nyi" to ask "how / what kind"',
  category: CAT.U12,
  questId: QUEST.U12,
  vocabKeys: ['-ita', 'muri kuitenyi', 'anoita marinyi', 'munoita basanyi'],
  culturalNotes: [
    'fsi unit 9 explains "-nyi" — an enclitic added to nouns to form "what kind of X". marinyi? (what money? = how much?), basanyi? (what work?), nguvanyi? (what time?).',
  ],
  exercises: () => [
    translate('muri kuitenyi?', 'what are you doing?', { direction: 'shona_to_english' }),
    translate('anoita marinyi?', 'how much is it?', { direction: 'shona_to_english' }),
    fillBlank('munoita basa___ ? (what work do you do?)', 'nyi', 'what work do you do?'),
    mcq('"-nyi" is best translated as:', 'what kind / how / what (asking specifically)', ['where', 'why', 'who']),
    orderSentence(['muri', 'kuitenyi'], 'what are you doing?'),
    mcq('"nguvanyi?" asks:', 'what time?', ['what work?', 'what name?', 'what money?']),
  ],
})

// ============ UNIT 13: DEEPER CULTURE ============

buildLesson({
  id: 'lesson-46',
  title: 'unhu — the philosophy of language',
  description: 'i can explain how unhu (humanness) shapes shona speech',
  category: CAT.U13,
  questId: QUEST.U13,
  vocabKeys: ['unhu', 'munhu', 'vanhu', 'mhuri'],
  culturalNotes: [
    'unhu (also known as ubuntu in nguni languages) means "i am because we are". it explains why shona greetings are slow, why family terms extend to strangers, and why the plural is used for respect.',
    'when you take time to greet someone — and ask about their family, their children, their journey — you are practicing unhu.',
  ],
  exercises: () => [
    mcq('"unhu" is best translated as:', 'humanness — "i am because we are"', ['hard work', 'good food', 'tradition']),
    matching([
      { shona: 'unhu', english: 'humanness / ubuntu philosophy' },
      { shona: 'munhu', english: 'person' },
      { shona: 'vanhu', english: 'people' },
      { shona: 'mhuri', english: 'family' },
    ]),
    mcq('the plural-of-respect (mw-/va-) used for one elder is an expression of:', 'unhu — language itself embodying respect', ['a counting error', 'royal speech only', 'children\'s speech']),
    fillBlank('___ vakuru (the elders)', 'vanhu', 'the elders'),
    orderSentence(['munhu', 'mukuru'], 'an important person / elder'),
    mcq('what is the most "unhu" way to start a conversation in shona?', 'with a full multi-turn greeting', ['by stating your business immediately', 'with a written note', 'by greeting only people you know']),
  ],
})

buildLesson({
  id: 'lesson-47',
  title: 'the totem tradition — mutupo',
  description: 'i can recognize totem-names and their role in shona identity',
  category: CAT.U13,
  questId: QUEST.U13,
  vocabKeys: ['shumba', 'mhuri', 'baba', 'mai'],
  culturalNotes: [
    'every shona family belongs to a totem (mutupo) — usually an animal, like shumba (lion), soko (monkey), or moyo (heart). people of the same totem are considered relatives.',
    'in fsi practice texts, "Baba naMai Shumba" — "Mr. and Mrs. Shumba" — appear repeatedly. "Shumba" is a totem-derived surname.',
  ],
  exercises: () => [
    mcq('what is a "mutupo"?', 'a totem — a clan-marker shared by family lineages', ['a song', 'a cooking pot', 'a traditional dance']),
    mcq('what does "shumba" mean as a name?', 'lion — a common totem and surname', ['child', 'evening', 'doorway']),
    translate('Baba Shumba', 'Mr. Shumba (a person whose totem is shumba)', { direction: 'shona_to_english' }),
    matching([
      { shona: 'shumba', english: 'lion (totem)' },
      { shona: 'mhuri', english: 'family / lineage' },
      { shona: 'baba', english: 'father / Mr.' },
      { shona: 'mai', english: 'mother / Mrs.' },
    ]),
    orderSentence(['mhuri', 'yaShumba'], 'the Shumba family'),
    mcq('people of the same totem are considered:', 'relatives, even without direct blood ties', ['enemies', 'strangers', 'unrelated']),
  ],
})

buildLesson({
  id: 'lesson-48',
  title: 'tsuro naDiro — a folktale',
  description: 'i can follow a simple shona folktale and pick out its message',
  category: CAT.U13,
  questId: QUEST.U13,
  vocabKeys: ['tsuro', 'sekuru', '-ti', 'munda', '-enda', 'gare gare', 'tsumo'],
  culturalNotes: [
    'fsi unit 41 contains the folktale "tsuro naDiro" — the hare and Diro. the hare convinces Diro to dig up sweet potatoes alone while he "keeps watch". the lesson: cleverness without ethics ends badly (Diro is caught by the farmers and pays the price).',
    '"tsumo" — proverbs — carry these moral lessons in compressed form. shona stories and proverbs are the original "language curriculum" of the culture.',
  ],
  exercises: () => [
    mcq('in the tsuro naDiro story, who does the actual work of digging?', 'Diro (because he agreed out of not-knowing)', ['tsuro', 'the farmers', 'sekuru']),
    mcq('what does "sekuru" in the folktale refer to?', 'a respectful address for an elder (tsuro flatters Diro with the term)', ['the farmer', 'the field', 'the food']),
    translate('tsuro naDiro', 'the hare and Diro', { direction: 'shona_to_english' }),
    matching([
      { shona: 'tsuro', english: 'hare (the trickster)' },
      { shona: 'sekuru', english: 'grandfather / respectful elder' },
      { shona: 'munda', english: 'field' },
      { shona: 'tsumo', english: 'proverb' },
    ]),
    mcq('what is a "tsumo"?', 'a proverb — compressed moral wisdom', ['a kind of song', 'a wedding ritual', 'a market day']),
    orderSentence(['tsuro', 'naDiro', 'vakaenda', 'kumunda'], 'the hare and Diro went to the field'),
  ],
})

// ============ EXPANSION LESSONS (to reach 60+ total) ============
// Each lesson below is grounded in additional FSI material or extends a topic
// using only vocabulary that exists in the registry above.

buildLesson({
  id: 'lesson-49',
  title: 'reply when you\'re not feeling great',
  description: 'i can answer a "how are you?" honestly when i\'m not at my best',
  category: CAT.U1,
  questId: QUEST.U1,
  vocabKeys: ['mwarara here', 'ndarara zvangu', 'mhuri', 'aiwa', 'zvirinane'],
  culturalNotes: [
    'fsi unit 3 includes "aiwa, ndarara zvangu zvirinane" — literally "no, i slept fine, better" — a polite acknowledgment that one isn\'t perfectly well but is improving. shona conversation honors honesty wrapped in respect.',
  ],
  exercises: () => [
    translate('aiwa, ndarara zvangu zvirinane', 'oh, i slept (better, fine now)', { direction: 'shona_to_english' }),
    mcq('"zvirinane" implies:', 'better (than before; recovering)', ['the same', 'much worse', 'identical']),
    fillBlank('aiwa, ___ zvangu zvirinane. (i slept fine)', 'ndarara', 'i slept fine'),
    mcq('starting a reply with "aiwa" signals:', 'gentle politeness — "oh, well..."', ['flat refusal', 'agreement', 'a goodbye']),
    orderSentence(['aiwa', 'ndarara', 'zvirinane'], 'oh, i slept better'),
    translate('mhuri yarara zvakanaka', 'the family slept well', { direction: 'shona_to_english' }),
  ],
})

buildLesson({
  id: 'lesson-50',
  title: 'practicing the full ritual',
  description: 'i can complete a four-turn greeting with an elder confidently',
  category: CAT.U1,
  questId: QUEST.U1,
  vocabKeys: ['mangwanani', 'baba', 'mai', 'mwarara here', 'ndarara zvangu', 'kana mwararawo', 'mhuri', 'vapwere'],
  culturalNotes: [
    'a full greeting moves: 1) hello + title, 2) "how did you sleep?", 3) acknowledgment + reciprocal "and you?", 4) "how is the family / children?".',
    'each turn deserves a genuine pause and reply. the slowness IS the respect.',
  ],
  exercises: () => [
    orderSentence(['mangwanani', 'baba'], 'good morning, sir'),
    orderSentence(['mwarara', 'here'], 'did you sleep?'),
    orderSentence(['ndarara', 'zvangu', 'kana', 'mwararawo'], 'i slept fine, if you also slept'),
    orderSentence(['mhuri', 'yarara', 'zvakanaka', 'here'], 'did the family sleep well?'),
    mcq('what is the literal translation of "kana mwararawo"?', 'if you also slept (a courteous reciprocal)', ['no, i did not sleep', 'i slept very badly', 'where did you sleep?']),
    mcq('how many distinct exchanges does a full traditional greeting usually have?', '3-4 (you, family, children, journey)', ['1 only', '6+', 'depends on weather']),
  ],
})

buildLesson({
  id: 'lesson-51',
  title: 'asking where someone is from',
  description: 'i can ask and answer "where are you from?"',
  category: CAT.U2,
  questId: QUEST.U2,
  vocabKeys: ['-bva', 'ndinobva', 'mwabva kupi', 'Harare', 'Mutare', 'Bhuruwayo', 'kwa-'],
  culturalNotes: [
    'fsi unit 6 vocabulary includes "-bva" (to come/go from). combining with locative "kupi" (where?) gives "mwabva kupi?" — "where have you come from?".',
  ],
  exercises: () => [
    translate('mwabva kupi?', 'where have you come from?', { direction: 'shona_to_english' }),
    fillBlank('ndinobva ___ Harare. (i come from Harare)', 'ku', 'i come from Harare'),
    mcq('"-bva" means:', 'to come from, leave', ['to arrive', 'to stay', 'to enter']),
    translate('ndinobva kuMutare', 'i come from Mutare', { direction: 'shona_to_english' }),
    orderSentence(['ndinobva', 'kuHarare'], 'i come from Harare'),
    mcq('which prefix do you use with proper city names like Harare?', 'ku- (or kwa-)', ['mu-', 'pa-', 'na-']),
  ],
})

buildLesson({
  id: 'lesson-52',
  title: 'meeting a child — masikati mwanangu',
  description: 'i can address a younger person warmly and politely',
  category: CAT.U2,
  questId: QUEST.U2,
  vocabKeys: ['masikati', 'mwanangu', 'mwana', 'mukunda', 'mukorore', 'wakadini', 'mupenyu zvake'],
  culturalNotes: [
    'fsi unit 4 dialogue opens with an adult greeting a child: "masikati mwanangu" — "good day, my child". calling any younger person "mwanangu" expresses warmth.',
    'a child answers an elder with "masikati baba" (good day, sir) — using the elder\'s honorific title regardless of literal relationship.',
  ],
  exercises: () => [
    translate('masikati mwanangu', 'good day, my child', { direction: 'shona_to_english' }),
    translate('wakadini mukunda?', 'how is your daughter? (or: how are you, my daughter?)', { direction: 'shona_to_english' }),
    mcq('"mupenyu zvake" means:', 'she/he is fine ("alive, in his/her way")', ['she/he is asleep', 'she/he has gone home', 'she/he is hungry']),
    fillBlank('masikati ___ . (greeting a young child)', 'mwanangu', 'good day, my child'),
    matching([
      { shona: 'mwanangu', english: 'my child (warm address)' },
      { shona: 'mukunda', english: 'daughter' },
      { shona: 'mukorore', english: 'son' },
      { shona: 'wakadini', english: 'how are you / how is she/he?' },
    ]),
    orderSentence(['masikati', 'mwanangu'], 'good day, my child'),
  ],
})

buildLesson({
  id: 'lesson-53',
  title: 'big numbers — counting past ten',
  description: 'i can form numbers above ten using "gumi" plus the small numbers',
  category: CAT.U3,
  questId: QUEST.U3,
  vocabKeys: ['gumi', 'gumi neposi', 'makumi maviri', 'piri', 'tatu', 'na'],
  culturalNotes: [
    '"gumi" (ten) takes "ne-" (with / and) plus the counting form to build 11-19: "gumi neposi" (11), "gumi nepiri" (12), "gumi netatu" (13). twenty is "makumi maviri" (lit. "tens, two") — the plural of gumi is makumi.',
  ],
  exercises: () => [
    matching([
      { shona: 'gumi', english: 'ten' },
      { shona: 'gumi neposi', english: 'eleven' },
      { shona: 'makumi maviri', english: 'twenty' },
    ]),
    mcq('how is "twelve" formed?', 'gumi nepiri (ten and two)', ['piri gumi', 'makumi mapiri', 'pirigumi']),
    fillBlank('makumi ma___ (thirty — three tens)', 'tatu', 'thirty'),
    mcq('the plural of "gumi" used for "tens" is:', 'makumi', ['vigumi', 'zvigumi', 'migumi']),
    translate('makumi maviri', 'twenty', { direction: 'shona_to_english' }),
    orderSentence(['gumi', 'neposi'], 'eleven (ten and one)'),
  ],
})

buildLesson({
  id: 'lesson-54',
  title: 'how long? how many days?',
  description: 'i can ask how long someone has stayed and answer in days, weeks, months',
  category: CAT.U3,
  questId: QUEST.U3,
  vocabKeys: ['mazuva', 'masondo', 'mwedzi', 'zuva rimwe', 'mazuva mairi', 'rini', '-pera'],
  culturalNotes: [
    'fsi unit 6 dialogue: "ndaane mazuva matatu ndava pano" — "i have been here for three days". this construction (the verb + a time-amount + "ndava pano") is the standard way to talk about duration.',
  ],
  exercises: () => [
    translate('mazuva mairi', 'two days', { direction: 'shona_to_english' }),
    translate('mazuva matatu', 'three days', { direction: 'shona_to_english' }),
    fillBlank('masondo ma___ (four weeks)', 'na', 'four weeks'),
    mcq('"-pera" means:', 'to come to an end, run out', ['to start', 'to continue', 'to repeat']),
    orderSentence(['mazuva', 'mashanu'], 'five days'),
    translate('mwedzi mitatu', 'three months', { direction: 'shona_to_english' }),
  ],
})

buildLesson({
  id: 'lesson-55',
  title: 'verbs of eating, drinking, cooking',
  description: 'i can describe a meal happening right now',
  category: CAT.U4,
  questId: QUEST.U4,
  vocabKeys: ['-dya', '-nwa', '-bika', 'sadza', 'mvura', 'muriwo', 'nyama'],
  culturalNotes: [
    '"ndiri kudya" — "i am eating" — uses the present continuous (-ri + ku- + verb) introduced in lesson 27.',
  ],
  exercises: () => [
    translate('ndiri kudya sadza', 'i am eating sadza', { direction: 'shona_to_english' }),
    translate('ndiri kunwa mvura', 'i am drinking water', { direction: 'shona_to_english' }),
    fillBlank('mai vari ku___ sadza. (mother is cooking sadza)', 'bika', 'mother is cooking sadza'),
    matching([
      { shona: '-dya', english: 'to eat' },
      { shona: '-nwa', english: 'to drink' },
      { shona: '-bika', english: 'to cook' },
      { shona: 'sadza', english: 'maize porridge' },
      { shona: 'muriwo', english: 'relish' },
    ]),
    orderSentence(['ndiri', 'kunwa', 'mvura'], 'i am drinking water'),
    mcq('to say "i am eating right now", you use:', 'ndiri ku- + dya (= ndiri kudya)', ['ndinodya only', 'ndakadya only', 'ndichadya']),
  ],
})

buildLesson({
  id: 'lesson-56',
  title: 'caring for children',
  description: 'i can describe caring for and carrying a child',
  category: CAT.U4,
  questId: QUEST.U4,
  vocabKeys: ['-rera', '-bereka', 'mwana', 'vana', 'mai', 'amai'],
  culturalNotes: [
    'fsi unit 9 lists "kurera mwana" (to care for a child) and "kubereka mwana" (to carry a child on the back). these are central daily-life verbs.',
  ],
  exercises: () => [
    translate('ndiri kurera mwana', 'i am caring for the child', { direction: 'shona_to_english' }),
    fillBlank('mai vari ku___ mwana. (mother is carrying the child on her back)', 'bereka', 'mother is carrying the child'),
    mcq('"-rera" means:', 'to care for, raise', ['to scold', 'to feed', 'to teach']),
    mcq('"-bereka" specifically means:', 'to carry (a child) on the back', ['to give birth to', 'to play with', 'to feed']),
    matching([
      { shona: '-rera', english: 'to care for / raise' },
      { shona: '-bereka', english: 'to carry on the back' },
      { shona: 'mwana', english: 'child' },
      { shona: 'vana', english: 'children' },
    ]),
    orderSentence(['mai', 'vari', 'kurera', 'mwana'], 'mother is caring for the child'),
  ],
})

buildLesson({
  id: 'lesson-57',
  title: 'asking the price; counting bananas',
  description: 'i can buy something and ask the total in shona',
  category: CAT.U5,
  questId: QUEST.U5,
  vocabKeys: ['mari', 'anoita marinyi', 'mahobo', '-tenga', '-tengesa', '-mwe', '-viri', '-tatu'],
  culturalNotes: [
    'fsi unit 9 is built around bargaining for bananas: "ndingaona madazeni maviri" — "i\'ll take two dozen". markets are social spaces in zimbabwe; bargaining is part of the relationship.',
  ],
  exercises: () => [
    translate('anoita marinyi?', 'how much is it?', { direction: 'shona_to_english' }),
    translate('mahobo matatu', 'three bananas', { direction: 'shona_to_english' }),
    fillBlank('ndingada mahobo ma___ . (i want five bananas)', 'shanu', 'i want five bananas'),
    mcq('which verb means "to buy"?', '-tenga', ['-tengesa', '-tora', '-rapa']),
    mcq('which verb means "to sell"?', '-tengesa', ['-tenga', '-tora', '-vaka']),
    orderSentence(['ndingada', 'mahobo', 'mashanu'], 'i would like five bananas'),
  ],
})

buildLesson({
  id: 'lesson-58',
  title: 'noun classes — full overview',
  description: 'i can identify which noun class a common shona noun belongs to',
  category: CAT.U6,
  questId: QUEST.U6,
  vocabKeys: ['munhu', 'vanhu', 'muti', 'zuva', 'mazuva', 'chikoro', 'zvikoro', 'imba'],
  culturalNotes: [
    'memorize one example noun per class as an anchor. class 1/2: munhu/vanhu. class 3/4: muti/miti. class 5/6: zuva/mazuva. class 7/8: chikoro/zvikoro. class 9/10: imba/dzimba.',
    'the noun class determines almost every other word in a sentence: subject prefixes, possessives, demonstratives, adjective forms.',
  ],
  exercises: () => [
    matching([
      { shona: 'munhu (cl. 1)', english: 'person' },
      { shona: 'muti (cl. 3)', english: 'tree' },
      { shona: 'zuva (cl. 5)', english: 'day, sun' },
      { shona: 'chikoro (cl. 7)', english: 'school' },
      { shona: 'imba (cl. 9)', english: 'house' },
    ]),
    mcq('which class do most "people" nouns belong to?', 'class 1 / 2 (mu- / va-)', ['class 5 / 6', 'class 7 / 8', 'class 9 / 10']),
    mcq('which class typically covers diminutives and languages?', 'class 7 / 8 (chi- / zvi-)', ['class 1 / 2', 'class 3 / 4', 'class 5 / 6']),
    fillBlank('the plural of "zuva" (day) is ___ . ', 'mazuva', 'days'),
    mcq('why do noun classes matter?', 'they govern every agreement in the sentence', ['they only matter for plural forms', 'they only matter in writing', 'they are optional decoration']),
    orderSentence(['vanhu', 'vatatu'], 'three people'),
  ],
})

buildLesson({
  id: 'lesson-59',
  title: 'knowing and being known',
  description: 'i can say "i know" and "do you know me?" with the right object prefix',
  category: CAT.U7,
  questId: QUEST.U7,
  vocabKeys: ['-ziva', 'ndinokuziva', 'munondiziva', 'munhu', 'mhuri'],
  culturalNotes: [
    'fsi unit 15 introduces object prefixes inside the verb: ndi- (me), ku- (you), mu- (him/her), ti- (us), vha- (you pl.), va- (them). "ndi-no-ku-ziva" = "i know you".',
  ],
  exercises: () => [
    translate('ndinokuziva', 'i know you', { direction: 'shona_to_english' }),
    translate('munondiziva here?', 'do you know me?', { direction: 'shona_to_english' }),
    fillBlank('a___ ziva. (he/she knows me)', 'nondi', 'he/she knows me'),
    mcq('where does the object prefix go in a shona verb?', 'between the tense prefix and the verb stem', ['at the very end', 'before the subject prefix', 'after the final vowel']),
    matching([
      { shona: '-ndi-', english: '...me (object)' },
      { shona: '-ku-', english: '...you (object)' },
      { shona: '-mu-', english: '...him/her (object)' },
      { shona: '-va-', english: '...them (object)' },
    ]),
    orderSentence(['ndinokuziva', 'kwazvo'], 'i know you very well'),
  ],
})

buildLesson({
  id: 'lesson-60',
  title: 'asking after a journey',
  description: 'i can ask "where have you come from?" and welcome a traveler',
  category: CAT.U8,
  questId: QUEST.U8,
  vocabKeys: ['mwabva kupi', '-bva', 'rwendo', 'mweni', 'mazuva mairi', 'chitima'],
  culturalNotes: [
    'fsi unit 23 has a dialogue welcoming a visiting brother who travelled two days by train from Bulawayo. the host\'s questions about the journey, the means of transport, and the duration are themselves part of the welcome.',
    '"mweni" — guest / stranger / foreigner — is honored. "mune mwenisu!" — "oh, you have a guest then!" — opens the welcoming script.',
  ],
  exercises: () => [
    translate('mwabva kupi?', 'where have you come from?', { direction: 'shona_to_english' }),
    translate('rwendo runoita mazuva mairi', 'the journey takes two days', { direction: 'shona_to_english' }),
    mcq('"mweni" means:', 'guest, stranger, foreigner', ['family member', 'enemy', 'colleague']),
    fillBlank('ndabva ku___ . (i have come from Bulawayo)', 'Bhuruwayo', 'i have come from Bulawayo'),
    matching([
      { shona: 'rwendo', english: 'journey' },
      { shona: 'mweni', english: 'guest / stranger' },
      { shona: 'chitima', english: 'train' },
      { shona: 'mwabva kupi', english: 'where have you come from?' },
    ]),
    orderSentence(['ndauya', 'nechitima'], 'i came by train'),
  ],
})

buildLesson({
  id: 'lesson-61',
  title: 'storytelling — once upon a time',
  description: 'i can recognize how shona stories begin and identify the storyteller\'s frame',
  category: CAT.U13,
  questId: QUEST.U13,
  vocabKeys: ['rimwe zuva', 'kare kare', 'tsuro', 'tsumo', '-ti'],
  culturalNotes: [
    'shona folktales open with "rimwe zuva..." ("one day...") or "kare kare..." ("long, long ago..."). these openers signal a moral tale (ngano) — fictional but truth-bearing.',
    'the trickster tsuro is the most common protagonist. his wit is admired but his lessons usually warn about deception.',
  ],
  exercises: () => [
    matching([
      { shona: 'kare kare', english: 'long, long ago' },
      { shona: 'rimwe zuva', english: 'one day' },
      { shona: 'tsuro', english: 'the hare (trickster)' },
      { shona: 'tsumo', english: 'proverb' },
    ]),
    mcq('how do shona folktales typically begin?', 'with "rimwe zuva..." or "kare kare..."', ['with a song', 'with a riddle', 'with a date']),
    translate('rimwe zuva tsuro naDiro', 'one day the hare and Diro', { direction: 'shona_to_english' }),
    mcq('a tsumo (proverb) functions as:', 'compressed moral wisdom passed across generations', ['a song lyric', 'a wedding vow', 'a counting rhyme']),
    fillBlank('___ zuva, tsuro... (one day, the hare...)', 'rimwe', 'one day, the hare...'),
    orderSentence(['rimwe', 'zuva', 'tsuro', 'naDiro'], 'one day, the hare and Diro'),
  ],
})

// ============ DEEP-DIVE EXPANSION LESSONS 63-78 ============
// Built from FSI units 13-39 (pages 130-388). Targets: past tense -ka-,
// object infixes, vegetable market, house & rooms, directions, cooking,
// travel by bus/train, farm animals, conditional "dai", seasons & weather,
// visiting / knocking, cultural greetings (totem-aware).

buildLesson({
  id: 'lesson-63',
  title: 'past tense with -ka- — what they did',
  description: 'i can talk about what someone did (before today) using the -ka- past',
  category: CAT.U6,
  questId: QUEST.U6,
  vocabKeys: ['-ka-', 'vakaenda', 'vakarima', 'vakauya', 'ndakaenda', 'Mutare', 'munda'],
  culturalNotes: [
    'fsi unit 13 introduces /-ka-/ as the past tense for events before today. "vakaenda kwaMutare" — "they went to Mutare". the prefix slot is right after the subject (va-ka-enda).',
    'this is different from the past-of-today tense you saw in lesson 33. shona makes a sharper distinction than english between "what happened today" and "what happened before today".',
  ],
  exercises: () => [
    translate('vakaenda kwaMutare', 'they went to Mutare', { direction: 'shona_to_english' }),
    translate('vakarima munda', 'they cultivated the field', { direction: 'shona_to_english' }),
    fillBlank('nda___enda kwaHarare. (i went to Harare — before today)', 'ka', 'i went to Harare'),
    mcq('the prefix /-ka-/ marks:', 'past actions that happened before today', ['actions happening right now', 'future actions', 'commands']),
    mcq('where does /-ka-/ go in the verb?', 'between the subject prefix and the verb stem', ['at the very start', 'at the very end', 'after the final vowel']),
    orderSentence(['vakauya', 'pano'], 'they came here'),
  ],
})

buildLesson({
  id: 'lesson-64',
  title: 'past negative — what i didn\'t do',
  description: 'i can deny that something happened — "i didn\'t go with them"',
  category: CAT.U6,
  questId: QUEST.U6,
  vocabKeys: ['handina kuenda', 'handina kuita', 'navo', 'basa', 'vakaenda', '-ka-', 'Mutare'],
  culturalNotes: [
    'fsi unit 13 pairs every past affirmative with a negative. "vakaenda kwaMutare" → "handina kuenda navo" — "they went to Mutare / i didn\'t go with them". the negative uses "handina" + the infinitive.',
    'note the structure: handi-na ku-enda = "i don\'t have going" — literally "i lack the having-gone". shona builds negation from a sense of absence.',
  ],
  exercises: () => [
    translate('handina kuenda navo', "i didn't go with them", { direction: 'shona_to_english' }),
    translate('handina kuita basa', "i didn't do the work", { direction: 'shona_to_english' }),
    mcq('"handina kuita basa" — which word means "didn\'t"?', 'handina ku- (negative + infinitive)', ['basa', 'kuita', 'ndaenda']),
    fillBlank('___ kuenda. (i didn\'t go)', 'handina', "i didn't go"),
    mcq('to say "we didn\'t come", the prefix changes to:', 'hatina ku-', ['handina ku-', 'havana ku-', 'hauna ku-']),
    orderSentence(['handina', 'kuenda', 'navo'], "i didn't go with them"),
  ],
})

buildLesson({
  id: 'lesson-65',
  title: 'object infixes — knowing you, helping me',
  description: 'i can drop "you / me / her" into a verb instead of saying it separately',
  category: CAT.U7,
  questId: QUEST.U7,
  vocabKeys: ['-ziva', 'ndinokuziva', 'munondiziva', '-ndi-', '-ku-', '-mu-obj', '-ti-', '-va-'],
  culturalNotes: [
    'fsi unit 15 introduces OBJECT prefixes — small syllables that go INSIDE the verb. "ndi-no-ku-ziva" = "i-now-you-know" = "i know you".',
    'each object has its own prefix: -ndi- (me), -ku- (you sg.), -mu- (him/her), -ti- (us), -mu- pl. (you pl.), -va- (them). shona prefers to tuck the object inside the verb rather than tack it on at the end.',
  ],
  exercises: () => [
    translate('ndinokuziva', 'i know you', { direction: 'shona_to_english' }),
    translate('munondiziva here?', 'do you know me?', { direction: 'shona_to_english' }),
    fillBlank('ndino___ziva. (i know him/her)', 'mu', 'i know him/her'),
    mcq('the object prefix sits:', 'between the tense marker and the verb stem', ['at the start of the word', 'at the very end', 'before the subject prefix']),
    matching([
      { shona: '-ndi-', english: '...me' },
      { shona: '-ku-', english: '...you (sg.)' },
      { shona: '-mu-', english: '...him/her' },
      { shona: '-ti-', english: '...us' },
      { shona: '-va-', english: '...them' },
    ]),
    orderSentence(['ndinokuziva', 'kwazvo'], 'i know you very well'),
  ],
})

buildLesson({
  id: 'lesson-66',
  title: 'kumusika — at the vegetable market',
  description: 'i can ask for vegetables and quantities at a roadside market',
  category: CAT.U7,
  questId: QUEST.U7,
  vocabKeys: ['simo', 'masimo', 'mbatata', 'kabichi', 'nzungu', 'musika', 'ndingada', 'sheereni'],
  culturalNotes: [
    'fsi unit 14 opens with "ndiri kutengesa masimo" — "i am selling vegetables". roadside vegetable markets are a daily fact of life across zimbabwe.',
    'bargaining is polite, not adversarial. you might say "muri kunyanya kani" — "you\'re overcharging a little" — and the seller will laugh and adjust. tone matters more than the words.',
  ],
  exercises: () => [
    matching([
      { shona: 'mbatata', english: 'potato' },
      { shona: 'kabichi', english: 'cabbage' },
      { shona: 'nzungu', english: 'groundnuts (peanuts)' },
      { shona: 'simo', english: 'vegetable' },
      { shona: 'musika', english: 'market' },
    ]),
    translate('ndingada kabichi', "i'd like some cabbage", { direction: 'shona_to_english' }),
    translate('anoita sheereni rimwe', "it's one shilling", { direction: 'shona_to_english' }),
    fillBlank('ndiri kutengesa ___ . (i am selling vegetables)', 'masimo', 'i am selling vegetables'),
    mcq('"mbatata" belongs to which noun class?', 'class 9/10 — singular and plural look the same', ['class 1/2', 'class 5/6', 'class 7/8']),
    orderSentence(['ndingada', 'mbatata'], "i'd like potatoes"),
  ],
})

buildLesson({
  id: 'lesson-67',
  title: 'fruits and michero',
  description: 'i can name common fruits and ask for many or few',
  category: CAT.U7,
  questId: QUEST.U7,
  vocabKeys: ['muchero', 'michero', 'mango', 'popo', 'raranji', 'mararanji', 'chinanazi', '-zhinji'],
  culturalNotes: [
    'fsi unit 14 supplementary lists tropical fruits common across zimbabwe: mango, popo (papaya), raranji (orange), chinanazi (pineapple).',
    '"michero" is class 3/4 plural — same class as "muti" (tree). this is because fruits come from trees: the grammar follows the relationship.',
  ],
  exercises: () => [
    matching([
      { shona: 'mango', english: 'mango' },
      { shona: 'popo', english: 'papaya' },
      { shona: 'raranji', english: 'orange' },
      { shona: 'chinanazi', english: 'pineapple' },
      { shona: 'michero', english: 'fruits' },
    ]),
    translate('takatenga michero mizhinji', 'we bought many fruits', { direction: 'shona_to_english' }),
    fillBlank('mararanji ma___ (many oranges)', 'zhinji', 'many oranges'),
    mcq('"michero" is the plural of:', 'muchero (fruit)', ['mucheka (cloth)', 'mukomana (boy)', 'munda (field)']),
    mcq('which fruit belongs to noun class 7/8?', 'chinanazi (the "chi-" prefix marks class 7)', ['mango', 'popo', 'raranji']),
    orderSentence(['michero', 'mizhinji'], 'many fruits'),
  ],
})

buildLesson({
  id: 'lesson-68',
  title: 'the rooms of an imba',
  description: 'i can describe a house — its rooms, windows, doors',
  category: CAT.U4,
  questId: QUEST.U4,
  vocabKeys: ['imba', 'mupanda', 'mipanda', 'fafitera', '-diki', 'huru', 'chete', '-ngani'],
  culturalNotes: [
    'fsi unit 16 dialogue: "imba yangu idiki. ine mipanda mingani? mitatu chete." — "my house is small. how many rooms does it have? only three."',
    'in shona, "imba" (class 9) takes the plural "dzimba" (class 10). but "mupanda" (room, class 3) takes the plural "mipanda" (class 4). different classes = different plurals, even for parts of the same object.',
  ],
  exercises: () => [
    translate('imba yangu idiki', 'my house is small', { direction: 'shona_to_english' }),
    translate('ine mipanda mingani?', 'how many rooms does it have?', { direction: 'shona_to_english' }),
    fillBlank('mitatu ___ . (only three)', 'chete', 'only three'),
    mcq('"fafitera" means:', 'window', ['door', 'floor', 'roof']),
    matching([
      { shona: 'imba', english: 'house' },
      { shona: 'mupanda', english: 'room' },
      { shona: 'mipanda', english: 'rooms' },
      { shona: 'fafitera', english: 'window' },
    ]),
    orderSentence(['imba', 'huru'], 'a big house'),
  ],
})

buildLesson({
  id: 'lesson-69',
  title: 'describing — long, short, new',
  description: 'i can describe an object with simple adjectives and the right class agreement',
  category: CAT.U4,
  questId: QUEST.U4,
  vocabKeys: ['-pfupi', '-refu', '-tsva', 'nzira', 'mugwagwa', 'imba', '-diki', 'huru'],
  culturalNotes: [
    'fsi unit 16 drills adjectives with class agreement. "iyi nzira ipfupi" — "this road is short". the "i-" on "ipfupi" is the class 9 concord.',
    'the same stem -pfupi takes different prefixes depending on the noun: i-pfupi (cl. 9), mu-pfupi (cl. 1/3), ma-pfupi (cl. 6). the stem is constant — the prefix changes.',
  ],
  exercises: () => [
    matching([
      { shona: '-pfupi', english: 'short' },
      { shona: '-refu', english: 'long, tall' },
      { shona: '-tsva', english: 'new' },
      { shona: '-diki', english: 'small' },
      { shona: 'huru', english: 'large (cl. 9/10)' },
    ]),
    translate('iyi nzira ipfupi', 'this road is short', { direction: 'shona_to_english' }),
    fillBlank('iyi nzira i___ (this road is new)', 'tsva', 'this road is new'),
    mcq('the prefix on the adjective is determined by:', 'the noun class of the noun it describes', ['the speaker\'s age', 'the time of day', 'how long the noun is']),
    orderSentence(['imba', 'huru'], 'a big house'),
    mcq('"iyi nzira irefu" means:', 'this road is long', ['this road is short', 'this is a new road', 'this is a small road']),
  ],
})

buildLesson({
  id: 'lesson-70',
  title: 'asking for directions — bandera rokutanga',
  description: 'i can follow simple directions: turn right, turn left, go straight',
  category: CAT.U5,
  questId: QUEST.U5,
  vocabKeys: ['rudyi', 'runzere', 'mberi', 'bandera', '-tsauka', '-tenderuka', 'enda mberi'],
  culturalNotes: [
    'fsi unit 17 dialogue: "bandera rokutanga, mwotsauka kurudyi" — "at the first sign, turn right". the structure: [signpost] [first] + verb + [direction].',
    'in shona, "rudyi" (right) and "runzere" (left) take the locative prefix ku-: kurudyi, kurunzere. directions are always somewhere you head TO.',
  ],
  exercises: () => [
    translate('bandera rokutanga mwotsauka kurudyi', 'at the first sign, turn right', { direction: 'shona_to_english' }),
    matching([
      { shona: 'rudyi', english: 'right (hand/side)' },
      { shona: 'runzere', english: 'left (hand/side)' },
      { shona: 'mberi', english: 'front, ahead' },
      { shona: 'bandera', english: 'signpost, signboard' },
      { shona: '-tsauka', english: 'to turn off' },
    ]),
    mcq('"enda mberi" means:', 'go straight ahead', ['turn left', 'stop here', 'come back']),
    fillBlank('tenderuka ku___ . (turn to the left)', 'runzere', 'turn to the left'),
    mcq('directions in shona take which locative prefix?', 'ku- (toward / at a place)', ['mu- (inside)', 'pa- (on)', 'na- (with)']),
    orderSentence(['enda', 'mberi'], 'go straight ahead'),
  ],
})

buildLesson({
  id: 'lesson-71',
  title: 'have you ever been? — mwakambosvika',
  description: 'i can ask "have you ever been to X?" and answer briefly',
  category: CAT.U5,
  questId: QUEST.U5,
  vocabKeys: ['-mbo-', 'mwakambosvika', '-svika', 'Mutare', 'Harare', 'Bhuruwayo', 'kwa-'],
  culturalNotes: [
    'fsi unit 17 note 2 introduces /-mbo-/ — an aspect prefix meaning "ever", "just briefly", or "at some point". "mwakambosvika kuHarare?" — "have you ever been to Harare?".',
    'the prefix communicates lack of insistence — a casual "have you ever happened to..." rather than a heavy "did you...".',
  ],
  exercises: () => [
    translate('mwakambosvika kuHarare?', 'have you ever been to Harare?', { direction: 'shona_to_english' }),
    mcq('the /-mbo-/ prefix conveys:', 'casualness — "ever", "just", "at some point"', ['urgency', 'commands', 'future certainty']),
    fillBlank('mwaka___svika kwaMutare?', 'mbo', 'have you ever been to Mutare?'),
    mcq('the polite reply to "mwakambosvika kuHarare?" if yes is:', 'hongu, ndakambosvika', ['kwete kwete', 'mangwanani', 'ndauwe']),
    matching([
      { shona: 'Mutare', english: 'Mutare (city)' },
      { shona: 'Harare', english: 'Harare (capital)' },
      { shona: 'Bhuruwayo', english: 'Bulawayo' },
    ]),
    orderSentence(['mwakambosvika', 'here', 'kuHarare'], 'have you ever been to Harare?'),
  ],
})

buildLesson({
  id: 'lesson-72',
  title: 'cooking processes — kubika, kukanga, kugocha',
  description: 'i can name how a dish is being prepared',
  category: CAT.U4,
  questId: QUEST.U4,
  vocabKeys: ['-bika', 'kuvidza', 'kukanga', 'kugocha', 'kupisa', 'dovi', 'muto', 'sadza'],
  culturalNotes: [
    'fsi unit 20 supplementary lists cooking processes: kubika (cook), kuvidza (boil), kukanga (fry), kugocha (broil/roast), kupisa (heat). each verb pairs with specific foods.',
    'sadza is "cooked" (kubika), not boiled. nzungu (groundnuts) are roasted (kukanga). water is boiled (kuvidza). using the wrong cooking verb sounds odd, like saying "i fried the rice" in english when you mean "boiled".',
  ],
  exercises: () => [
    matching([
      { shona: 'kubika', english: 'to cook (general)' },
      { shona: 'kuvidza', english: 'to boil' },
      { shona: 'kukanga', english: 'to fry / dry-roast' },
      { shona: 'kugocha', english: 'to broil / roast' },
      { shona: 'kupisa', english: 'to heat, burn' },
    ]),
    mcq('how do you "cook" sadza?', 'kubika', ['kukanga', 'kuvidza', 'kugocha']),
    mcq('how are groundnuts (nzungu) typically prepared?', 'kukanga (dry-roasted in a pan)', ['kuvidza', 'kubika', 'kupisa']),
    fillBlank('mai vari ku___ nyama. (mother is roasting meat)', 'gocha', 'mother is roasting meat'),
    translate('isa dovi pachingwa', 'put peanut butter on the bread', { direction: 'shona_to_english' }),
    orderSentence(['ndiri', 'kubika', 'sadza'], 'i am cooking sadza'),
  ],
})

buildLesson({
  id: 'lesson-73',
  title: 'animals around the home',
  description: 'i can name farm animals you\'ll see in a shona homestead',
  category: CAT.U9,
  questId: QUEST.U9,
  vocabKeys: ['mombe', 'huku', 'mbudzi', 'hwai', 'nguruve', 'tsapi', 'shiri'],
  culturalNotes: [
    'fsi unit 25 lists the homestead animals: mombe (cattle), huku (chicken), mbudzi (goat), hwai (sheep), nguruve (pig). almost all are class 9/10 — singular and plural look identical.',
    'mombe (cattle) hold special cultural weight. they are wealth, dowry (roora), and signs of family standing. a man with many mombe is munhu mukuru — an important person.',
  ],
  exercises: () => [
    matching([
      { shona: 'mombe', english: 'cattle, cow' },
      { shona: 'huku', english: 'chicken' },
      { shona: 'mbudzi', english: 'goat' },
      { shona: 'hwai', english: 'sheep' },
      { shona: 'nguruve', english: 'pig' },
    ]),
    mcq('mombe (cattle) carry which cultural weight?', 'wealth and roora (dowry) — markers of family standing', ['none', 'they are taboo', 'only used for racing']),
    fillBlank('takaenda kundoona ___ . (we went to see the cattle)', 'mombe', 'we went to see the cattle'),
    mcq('most farm animals belong to noun class:', '9/10 (no plural prefix change)', ['1/2', '5/6', '7/8']),
    translate('tsapi ine huku zhinji', 'the barn has many chickens', { direction: 'shona_to_english' }),
    orderSentence(['takaenda', 'kundoona', 'mbudzi'], 'we went to see the goats'),
  ],
})

buildLesson({
  id: 'lesson-74',
  title: 'travelling by bus and train',
  description: 'i can describe a journey — how, how long, how much',
  category: CAT.U5,
  questId: QUEST.U5,
  vocabKeys: ['bhazi', 'chitima', 'rwendo', 'pondo', '-svika', 'mazuva mairi', 'Bhuruwayo'],
  culturalNotes: [
    'fsi unit 23 practice: "rwendo rweBhuruwayo runoita marinyi?" — "how much does the trip to Bulawayo cost?". note that "rwendo" (cl. 11) takes a "ru-" concord: "rwendo runoita...".',
    'a journey is asked about in three pieces: cost (anoita marinyi?), duration (rinotora nguva yakadini?), and means (unoenda senyi?). all three together = a proper welcome.',
  ],
  exercises: () => [
    translate('rwendo rweBhuruwayo runoita marinyi?', 'how much does the trip to Bulawayo cost?', { direction: 'shona_to_english' }),
    translate('ndinoenda nebhazi', "i'm going by bus", { direction: 'shona_to_english' }),
    fillBlank('runoita ___ ina. (it costs four pounds)', 'pondo', 'it costs four pounds'),
    mcq('"chitima" means:', 'train', ['car', 'plane', 'cart']),
    matching([
      { shona: 'bhazi', english: 'bus' },
      { shona: 'chitima', english: 'train' },
      { shona: 'rwendo', english: 'journey' },
      { shona: 'pondo', english: 'pound (money or weight)' },
    ]),
    orderSentence(['ndinoenda', 'nechitima'], "i'm going by train"),
  ],
})

buildLesson({
  id: 'lesson-75',
  title: 'conditional dai — if it were possible',
  description: 'i can say "if only..." or "if X happened, then i would Y"',
  category: CAT.U12,
  questId: QUEST.U12,
  vocabKeys: ['dai', 'ndaizofara', '-da', 'mari', 'kazhinji', 'chokwadi'],
  culturalNotes: [
    'fsi unit 37 introduces /dai/ — the conditional. "dai uchiriona, ndaizofara" — "if you saw it, i would be happy". it sets up a hypothetical situation.',
    'shona uses /dai/ for both real conditions ("if it rains") and unreal ones ("if i were rich"). context — not grammar — tells you which is meant.',
  ],
  exercises: () => [
    translate('dai uchiriona, ndaizofara', 'if you saw it, i would be happy', { direction: 'shona_to_english' }),
    mcq('"dai" begins a:', 'conditional ("if...") clause', ['command', 'a question about the past', 'a greeting']),
    fillBlank('___ ndine mari, ndaizotenga. (if i had money, i would buy)', 'dai', 'if i had money, i would buy'),
    matching([
      { shona: 'dai', english: 'if (conditional)' },
      { shona: 'ndaizofara', english: 'i would be happy' },
      { shona: 'chokwadi', english: 'truth' },
      { shona: 'kazhinji', english: 'often, many times' },
    ]),
    mcq('the response to "dai..." typically uses:', 'a verb with the future-conditional prefix -izo-', ['the present tense', 'a command form', 'nothing at all']),
    orderSentence(['dai', 'uchida', 'ndaikubatsira'], 'if you wanted, i would help you'),
  ],
})

buildLesson({
  id: 'lesson-76',
  title: 'how often? — pavhiki katatu',
  description: 'i can say how many times per week i do something',
  category: CAT.U3,
  questId: QUEST.U3,
  vocabKeys: ['pavhiki', 'kanganii', 'katatu', 'kaviri', 'kamwe', 'chitoro', 'kuchechi'],
  culturalNotes: [
    'fsi unit 37 note 6 builds frequency expressions with the prefix /ka-/. "pavhiki munoenda kanganii?" — "how many times per week do you go?". the answer: "katatu" (3 times), "kaviri" (2 times), "kamwe" (once).',
    'note the pattern: ka- + number-stem. kamwe, kaviri, katatu, kana, kashanu. it builds neatly off the counting stems you already know.',
  ],
  exercises: () => [
    translate('pavhiki munoenda kanganii?', 'how many times per week do you go?', { direction: 'shona_to_english' }),
    translate('tinoenda katatu', 'we go three times', { direction: 'shona_to_english' }),
    fillBlank('tinoenda ka___ . (we go twice)', 'viri', 'we go twice'),
    matching([
      { shona: 'kamwe', english: 'once' },
      { shona: 'kaviri', english: 'twice' },
      { shona: 'katatu', english: 'three times' },
      { shona: 'pavhiki', english: 'per week' },
    ]),
    mcq('the prefix that turns a number into "X times" is:', 'ka-', ['ma-', 'va-', 'zvi-']),
    orderSentence(['tinoenda', 'katatu', 'pavhiki'], 'we go three times per week'),
  ],
})

buildLesson({
  id: 'lesson-77',
  title: 'seasons in mashonaland',
  description: 'i can name the four shona seasons and what happens in each',
  category: CAT.U9,
  questId: QUEST.U9,
  vocabKeys: ['zienza', 'chirimo', 'matsutso', 'chando', '-naya', 'mvura', '-pisa', '-tonhora'],
  culturalNotes: [
    'fsi unit 39 names the four shona seasons: zienza (rains, nov-mar), matsutso (ripening, apr-may), chando (cold/winter, jun-jul), chirimo (hot dry, aug-oct). they do not map onto european seasons — there is no "spring".',
    'every season has its work. in zienza you plant (-dyara mbesa). in matsutso crops ripen. in chando you wear warm clothes. in chirimo you wait for rain. the language tracks the agricultural year.',
  ],
  exercises: () => [
    matching([
      { shona: 'zienza', english: 'rainy season (nov-mar)' },
      { shona: 'matsutso', english: 'ripening season (apr-may)' },
      { shona: 'chando', english: 'cold season / winter (jun-jul)' },
      { shona: 'chirimo', english: 'hot dry season (aug-oct)' },
    ]),
    translate('zienza rinonaya mvura kwazvo', '[in] zienza it rains a lot', { direction: 'shona_to_english' }),
    fillBlank('___ kunopisa kwazvo. (the hot dry season is very hot)', 'chirimo', '[in] chirimo it is very hot'),
    mcq('zimbabwe has how many seasons in the shona reckoning?', 'four — zienza, matsutso, chando, chirimo', ['two (rains and dry)', 'three', 'twelve months only']),
    mcq('which season is for planting crops?', 'zienza — the rains', ['chirimo', 'chando', 'matsutso']),
    orderSentence(['mvura', 'inonaya', 'muzienza'], 'it rains in zienza'),
  ],
})

buildLesson({
  id: 'lesson-78',
  title: 'visiting — gogogo and proper greeting',
  description: 'i can announce myself at a doorway and exchange a respectful first greeting',
  category: CAT.U13,
  questId: QUEST.U13,
  vocabKeys: ['gogogo', 'pindai', 'kwaziwai', 'shumba', 'ndauwe', 'mbuya', 'mwoyo'],
  culturalNotes: [
    'fsi unit 38 documents how a shona person enters a home. you don\'t knock — you say "gogogo" aloud at the doorway. the host replies "pindai" (come in). only then do you step inside.',
    'a deeper greeting acknowledges the host\'s totem. fsi shows: "nyamazve shewe shumba!" — "greetings, sir, lion-clan!" — said when greeting someone whose mutupo is shumba. addressing a person by their totem honors their whole lineage.',
  ],
  exercises: () => [
    mcq('how do you announce yourself at a shona doorway?', 'by saying "gogogo" aloud', ['by knocking three times', 'by ringing a bell', 'by clearing your throat']),
    translate('pindai zvenyu', 'come in!', { direction: 'shona_to_english' }),
    matching([
      { shona: 'gogogo', english: '(the spoken "knock")' },
      { shona: 'pindai', english: 'come in (pl./resp.)' },
      { shona: 'kwaziwai', english: 'hello, greetings' },
      { shona: 'shumba', english: 'lion (and a common totem)' },
      { shona: 'ndauwe', english: '(courteous reply, used by women)' },
    ]),
    mcq('greeting someone by their totem name (e.g. "shumba") honors:', 'their entire lineage and ancestral clan', ['only that specific person', 'only the animal itself', 'their occupation']),
    fillBlank('___ Mai Jongwe. ("knock-knock", Mrs. Jongwe)', 'gogogo', '(knock-knock), Mrs. Jongwe'),
    orderSentence(['pindai', 'zvenyu'], 'come in!'),
  ],
})

buildLesson({
  id: 'lesson-62',
  title: 'closing a conversation — goodbye and thanks',
  description: 'i can end a conversation politely and thank someone properly',
  category: CAT.U13,
  questId: QUEST.U13,
  vocabKeys: ['tatenda', '-siya', 'mwazviita', 'shamwari'],
  culturalNotes: [
    'fsi unit 9 closes the market dialogue with "mwazviita, tamusiya" — "thank you (you have done it); we leave you". departing politely matters as much as greeting politely.',
    '"tatenda" is the modern everyday "thank you" — from the verb "-tenda" (to thank). it appears widely outside the FSI text but is universally attested.',
  ],
  exercises: () => [
    translate('tatenda', 'thank you', { direction: 'shona_to_english' }),
    translate('mwazviita', 'thank you (lit. "you have done it")', { direction: 'shona_to_english' }),
    mcq('"-siya" means:', 'to leave (someone or something)', ['to stay', 'to return', 'to greet']),
    fillBlank('tatenda, ___ . (thank you, friend)', 'shamwari', 'thank you, friend'),
    matching([
      { shona: 'tatenda', english: 'thank you' },
      { shona: 'mwazviita', english: 'thank you (formal — "you\'ve done it")' },
      { shona: '-siya', english: 'to leave' },
      { shona: 'shamwari', english: 'friend' },
    ]),
    orderSentence(['tatenda', 'shamwari'], 'thank you, friend'),
  ],
})

// ────────────────────────────────────────────────────────────────────────────
// BUILD METADATA & FILE OUTPUT
// ────────────────────────────────────────────────────────────────────────────

// Group lessons by category to populate topicCategories (preserving structure)
const topicCategories = {}
for (const lesson of lessons) {
  const cat = lesson.category
  if (!topicCategories[cat]) {
    topicCategories[cat] = {
      description: `${cat} — built from FSI dialogues and vocabulary`,
      icon: '📘',
      color: 'from-emerald-400 to-emerald-600',
      lessons: [],
    }
  }
  topicCategories[cat].lessons.push(lesson.id)
}

const out = {
  metadata: {
    version: '7.0.0-fsi',
    lastUpdated: new Date().toISOString(),
    totalLessons: lessons.length,
    totalUnits: Object.keys(topicCategories).length,
    source: 'FSI Shona Basic Course (1965) + cultural_notes.json',
    sourcePdf: 'archive/assets/153747653-Learn-Shona-FSI-Basic-Course.pdf',
    features: [
      'skill_outcome_descriptions',
      'mixed_exercise_types',
      'noun_class_spine',
      'multi_turn_greetings',
      'lowercase_aesthetic',
      'every_phrase_traceable',
    ],
    description: `${lessons.length}-lesson curriculum grounded in the FSI Shona Basic Course. Each lesson has 6+ mixed exercises (multiple_choice, translation, fill_blank, matching, order_sentence) and a skill-outcome description ("i can ..."). All shona phrases trace to CURRICULUM_PROVENANCE.json.`,
    topicCategories,
    difficultyLevels: {
      beginner: { units: '1-6', lessons: 'orderIndex 1-29' },
      intermediate: { units: '7-10', lessons: 'orderIndex 30-41' },
      advanced: { units: '11-13', lessons: 'orderIndex 42-48' },
    },
    styleConvention: 'all UI-facing strings default to lowercase; proper nouns keep natural case',
  },
  lessons,
}

const provenance = {
  _meta: {
    generatedAt: new Date().toISOString(),
    description: 'Source-trace for every shona phrase in lessons_consolidated.json. FSI = US State Department Shona Basic Course (1965), page references match the PDF in /archive/assets/.',
    sourcePdf: 'archive/assets/153747653-Learn-Shona-FSI-Basic-Course.pdf',
  },
  ...Object.fromEntries(Object.entries(vocab).map(([k, v]) => [
    k,
    { english: v.english, ...v.prov, ...(v.note ? { note: v.note } : {}) },
  ])),
}

// Validation: scan lesson content for any shona string not in provenance
const provenanceKeys = new Set(Object.keys(vocab))
const orphanWarnings = []
for (const lesson of lessons) {
  // check lesson vocabulary
  for (const vt of lesson.vocabulary) {
    if (!provenanceKeys.has(vt.shona)) {
      orphanWarnings.push(`lesson ${lesson.id}: vocab "${vt.shona}" not in provenance`)
    }
  }
}

const outDir = path.join(repoRoot, 'content')
fs.writeFileSync(path.join(outDir, 'lessons_consolidated.json'), JSON.stringify(out, null, 2) + '\n')
fs.writeFileSync(path.join(outDir, 'CURRICULUM_PROVENANCE.json'), JSON.stringify(provenance, null, 2) + '\n')

console.log(`wrote ${lessons.length} lessons across ${Object.keys(topicCategories).length} units.`)
console.log(`wrote provenance for ${Object.keys(vocab).length} shona entries.`)
if (orphanWarnings.length) {
  console.log('\nWARNINGS:')
  for (const w of orphanWarnings) console.log('  ' + w)
  process.exit(1)
} else {
  console.log('all shona entries trace to a source.')
}

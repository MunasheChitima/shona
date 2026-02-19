// Comprehensive Shona Pronunciation Dictionary Data
// This file contains the complete pronunciation mappings from the dictionary

export interface PronunciationEntry {
  word: string
  english: string
  ipa: string
  cmu: string
  syllables?: string[]
  tonePattern?: string
  specialSounds?: Array<{
    token: string
    type: string
    description: string
  }>
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export const pronunciationDictionary: PronunciationEntry[] = [
  // Numbers
  {
    word: 'potsi',
    english: 'one',
    ipa: '/pó.tsi/',
    cmu: 'P OW1H-TS IY0',
    syllables: ['po', 'tsi'],
    category: 'Numbers'
  },
  {
    word: 'piri',
    english: 'two',
    ipa: '/pí.ɾi/',
    cmu: 'P IY1H-R IY0',
    syllables: ['pi', 'ri'],
    category: 'Numbers'
  },
  {
    word: 'tatu',
    english: 'three',
    ipa: '/tá.tu/',
    cmu: 'T AA1H-T UW0',
    syllables: ['ta', 'tu'],
    category: 'Numbers'
  },
  {
    word: 'ina',
    english: 'four',
    ipa: '/í.na/',
    cmu: 'IY1H-N AA0',
    syllables: ['i', 'na'],
    category: 'Numbers'
  },
  {
    word: 'shanu',
    english: 'five',
    ipa: '/ʃá.nu/',
    cmu: 'SH AA1H-N UW0',
    syllables: ['sha', 'nu'],
    category: 'Numbers'
  },
  {
    word: 'tanhatu',
    english: 'six',
    ipa: '/ta.ɲá.tu/',
    cmu: 'T AA0-NY AA1H-T UW0',
    syllables: ['ta', 'nha', 'tu'],
    category: 'Numbers',
    specialSounds: [{
      token: 'nh',
      type: 'palatalized',
      description: 'Palatalized n sound'
    }]
  },
  {
    word: 'nomwe',
    english: 'seven',
    ipa: '/nó.mwe/',
    cmu: 'N OW1H-M W EH0',
    syllables: ['no', 'mwe'],
    category: 'Numbers'
  },
  {
    word: 'sere',
    english: 'eight',
    ipa: '/sé.ɾe/',
    cmu: 'S EH1H-R EH0',
    syllables: ['se', 're'],
    category: 'Numbers'
  },
  {
    word: 'pfumbamwe',
    english: 'nine',
    ipa: '/p͡fu.ᵐbá.mwe/',
    cmu: 'PF UW0-MB AA1H-M W EH0',
    syllables: ['pfu', 'mba', 'mwe'],
    category: 'Numbers',
    specialSounds: [
      {
        token: 'pf',
        type: 'affricate',
        description: 'Affricate pf sound'
      },
      {
        token: 'mb',
        type: 'prenasalized',
        description: 'Prenasalized b'
      }
    ]
  },
  {
    word: 'gumi',
    english: 'ten',
    ipa: '/ɡú.mi/',
    cmu: 'G UW1H-M IY0',
    syllables: ['gu', 'mi'],
    category: 'Numbers'
  },
  {
    word: 'zana',
    english: 'hundred',
    ipa: '/zá.na/',
    cmu: 'Z AA1H-N AA0',
    syllables: ['za', 'na'],
    category: 'Numbers'
  },
  {
    word: 'churu',
    english: 'thousand',
    ipa: '/tʃú.ɾu/',
    cmu: 'CH UW1H-R UW0',
    syllables: ['chu', 'ru'],
    category: 'Numbers'
  },

  // Greetings
  {
    word: 'mangwanani',
    english: 'good morning',
    ipa: '/ma.ŋʷa.ná.ni/',
    cmu: 'M AA0-NGW AA0-N AA1H-N IY0',
    syllables: ['ma', 'ngwa', 'na', 'ni'],
    category: 'Greetings',
    difficulty: 'intermediate',
    specialSounds: [{
      token: 'ngw',
      type: 'labialized',
      description: 'Labialized ng sound'
    }]
  },
  {
    word: 'masikati',
    english: 'good afternoon',
    ipa: '/ma.si.ká.ti/',
    cmu: 'M AA0-S IY0-K AA1H-T IY0',
    syllables: ['ma', 'si', 'ka', 'ti'],
    category: 'Greetings',
    difficulty: 'beginner'
  },
  {
    word: 'manheru',
    english: 'good evening',
    ipa: '/ma.ɲé.ɾu/',
    cmu: 'M AA0-NY EH1H-R UW0',
    syllables: ['ma', 'nhe', 'ru'],
    category: 'Greetings',
    difficulty: 'beginner',
    specialSounds: [{
      token: 'nh',
      type: 'palatalized',
      description: 'Palatalized n'
    }]
  },

  // Common words with special sounds
  {
    word: 'svika',
    english: 'arrive',
    ipa: '/s̫í.ka/',
    cmu: 'SV IY1H-K AA0',
    syllables: ['svi', 'ka'],
    category: 'Movement',
    difficulty: 'intermediate',
    specialSounds: [{
      token: 'sv',
      type: 'whistled',
      description: 'Whistled sibilant - high frequency s with lip rounding'
    }]
  },
  {
    word: 'zvino',
    english: 'now',
    ipa: '/z̫í.no/',
    cmu: 'ZV IY1H-N OW0',
    syllables: ['zvi', 'no'],
    category: 'Time',
    difficulty: 'intermediate',
    specialSounds: [{
      token: 'zv',
      type: 'whistled',
      description: 'Voiced whistled sibilant - high frequency z with lip rounding'
    }]
  },
  {
    word: 'bhazi',
    english: 'bus',
    ipa: '/bʱá.zi/',
    cmu: 'BH AA1H-Z IY0',
    syllables: ['bha', 'zi'],
    category: 'Transport',
    difficulty: 'intermediate',
    specialSounds: [{
      token: 'bh',
      type: 'breathy',
      description: 'Breathy b - English b with simultaneous audible sigh'
    }]
  },
  {
    word: 'mbira',
    english: 'thumb piano',
    ipa: '/ᵐbí.ɾa/',
    cmu: 'MB IY1H-R AA0',
    syllables: ['mbi', 'ra'],
    category: 'Music',
    difficulty: 'intermediate',
    specialSounds: [{
      token: 'mb',
      type: 'prenasalized',
      description: 'Brief nasal airflow immediately precedes the b'
    }]
  },
  {
    word: 'ndimi',
    english: 'you (plural)',
    ipa: '/ⁿdí.mi/',
    cmu: 'ND IY1H-M IY0',
    syllables: ['ndi', 'mi'],
    category: 'Pronouns',
    difficulty: 'beginner',
    specialSounds: [{
      token: 'nd',
      type: 'prenasalized',
      description: 'Brief nasal airflow immediately precedes the d'
    }]
  },
  {
    word: 'ngoma',
    english: 'drum',
    ipa: '/ᵑɡó.ma/',
    cmu: 'NG OW1H-M AA0',
    syllables: ['ngo', 'ma'],
    category: 'Music',
    difficulty: 'intermediate',
    specialSounds: [{
      token: 'ng',
      type: 'prenasalized',
      description: 'Prenasalized g consonant'
    }]
  },
  {
    word: 'ndatenda',
    english: 'thank you',
    ipa: '/ⁿda.té.nda/',
    cmu: 'ND AA0-T EH1H-ND AA0',
    syllables: ['nda', 'te', 'nda'],
    category: 'Courtesy',
    difficulty: 'intermediate',
    specialSounds: [{
      token: 'nd',
      type: 'prenasalized',
      description: 'Brief nasal airflow immediately precedes the d'
    }]
  },
  {
    word: 'zvakanaka',
    english: 'fine/good',
    ipa: '/z̫a.ka.ná.ka/',
    cmu: 'ZV AA0-K AA0-N AA1H-K AA0',
    syllables: ['zva', 'ka', 'na', 'ka'],
    category: 'Responses',
    difficulty: 'intermediate',
    specialSounds: [{
      token: 'zv',
      type: 'whistled',
      description: 'Voiced whistled sibilant'
    }]
  },

  // Family terms
  {
    word: 'baba',
    english: 'father',
    ipa: '/ɓá.ɓa/',
    cmu: 'B AA1H-B AA0',
    syllables: ['ba', 'ba'],
    category: 'Family'
  },
  {
    word: 'amai',
    english: 'mother',
    ipa: '/a.má.i/',
    cmu: 'AA0-M AA1H-IY0',
    syllables: ['a', 'ma', 'i'],
    category: 'Family'
  },
  {
    word: 'mukoma',
    english: 'older brother',
    ipa: '/mu.kó.ma/',
    cmu: 'M UW0-K OW1H-M AA0',
    syllables: ['mu', 'ko', 'ma'],
    category: 'Family'
  },
  {
    word: 'hanzvadzi',
    english: 'sibling',
    ipa: '/ha.nz̫á.dzi/',
    cmu: 'HH AA0-NZV AA1H-DZ IY0',
    syllables: ['ha', 'nzva', 'dzi'],
    category: 'Family',
    specialSounds: [{
      token: 'nzv',
      type: 'whistled',
      description: 'Prenasalized whistled z'
    }]
  },
  {
    word: 'mwana',
    english: 'child',
    ipa: '/mwá.na/',
    cmu: 'MW AA1H-N AA0',
    syllables: ['mwa', 'na'],
    category: 'Family',
    specialSounds: [{
      token: 'mw',
      type: 'labialized',
      description: 'Labialized m'
    }]
  },
  {
    word: 'sekuru',
    english: 'grandfather/uncle',
    ipa: '/se.kú.ɾu/',
    cmu: 'S EH0-K UW1H-R UW0',
    syllables: ['se', 'ku', 'ru'],
    category: 'Family'
  },
  {
    word: 'mbuya',
    english: 'grandmother',
    ipa: '/ᵐbú.ja/',
    cmu: 'MB UW1H-Y AA0',
    syllables: ['mbu', 'ya'],
    category: 'Family',
    specialSounds: [{
      token: 'mb',
      type: 'prenasalized',
      description: 'Prenasalized b'
    }]
  },

  // Body parts
  {
    word: 'musoro',
    english: 'head',
    ipa: '/mu.só.ɾo/',
    cmu: 'M UW0-S OW1H-R OW0',
    syllables: ['mu', 'so', 'ro'],
    category: 'Body'
  },
  {
    word: 'ziso',
    english: 'eye',
    ipa: '/zí.so/',
    cmu: 'Z IY1H-S OW0',
    syllables: ['zi', 'so'],
    category: 'Body'
  },
  {
    word: 'mhino',
    english: 'nose',
    ipa: '/m̥í.no/',
    cmu: 'MH IY1H-N OW0',
    syllables: ['mhi', 'no'],
    category: 'Body',
    specialSounds: [{
      token: 'mh',
      type: 'breathy',
      description: 'Voiceless m'
    }]
  },
  {
    word: 'nzeve',
    english: 'ear',
    ipa: '/ⁿzé.ve/',
    cmu: 'NZ EH1H-V EH0',
    syllables: ['nze', 've'],
    category: 'Body',
    specialSounds: [{
      token: 'nz',
      type: 'prenasalized',
      description: 'Prenasalized z'
    }]
  },
  {
    word: 'ruoko',
    english: 'hand/arm',
    ipa: '/ɾu.ó.ko/',
    cmu: 'R UW0-OW1H-K OW0',
    syllables: ['ru', 'o', 'ko'],
    category: 'Body'
  },
  {
    word: 'gumbo',
    english: 'leg/foot',
    ipa: '/ɡú.ᵐbo/',
    cmu: 'G UW1H-MB OW0',
    syllables: ['gu', 'mbo'],
    category: 'Body',
    specialSounds: [{
      token: 'mb',
      type: 'prenasalized',
      description: 'Prenasalized b'
    }]
  },
  {
    word: 'moyo',
    english: 'heart',
    ipa: '/mó.jo/',
    cmu: 'M OW1H-Y OW0',
    syllables: ['mo', 'yo'],
    category: 'Body'
  },

  // Common verbs
  {
    word: 'kuenda',
    english: 'to go',
    ipa: '/ku.é.nda/',
    cmu: 'K UW0-EH1H-ND AA0',
    syllables: ['ku', 'e', 'nda'],
    category: 'Verbs',
    specialSounds: [{
      token: 'nd',
      type: 'prenasalized',
      description: 'Prenasalized d'
    }]
  },
  {
    word: 'kuuya',
    english: 'to come',
    ipa: '/ku.ú.ja/',
    cmu: 'K UW0-UW1H-Y AA0',
    syllables: ['ku', 'u', 'ya'],
    category: 'Verbs'
  },
  {
    word: 'kudya',
    english: 'to eat',
    ipa: '/kú.dja/',
    cmu: 'K UW1H-D Y AA0',
    syllables: ['ku', 'dya'],
    category: 'Verbs',
    specialSounds: [{
      token: 'dy',
      type: 'palatalized',
      description: 'Palatalized d'
    }]
  },
  {
    word: 'kunwa',
    english: 'to drink',
    ipa: '/kú.nwa/',
    cmu: 'K UW1H-N W AA0',
    syllables: ['ku', 'nwa'],
    category: 'Verbs'
  },
  {
    word: 'kutaura',
    english: 'to speak',
    ipa: '/ku.ta.ú.ɾa/',
    cmu: 'K UW0-T AA0-UW1H-R AA0',
    syllables: ['ku', 'ta', 'u', 'ra'],
    category: 'Verbs'
  },
  {
    word: 'kunzwa',
    english: 'to hear/feel',
    ipa: '/kú.ⁿzwa/',
    cmu: 'K UW1H-NZ W AA0',
    syllables: ['ku', 'nzwa'],
    category: 'Verbs',
    specialSounds: [{
      token: 'nz',
      type: 'prenasalized',
      description: 'Prenasalized z'
    }]
  },
  {
    word: 'kuona',
    english: 'to see',
    ipa: '/ku.ó.na/',
    cmu: 'K UW0-OW1H-N AA0',
    syllables: ['ku', 'o', 'na'],
    category: 'Verbs'
  },
  {
    word: 'kufamba',
    english: 'to walk',
    ipa: '/ku.fá.mba/',
    cmu: 'K UW0-F AA1H-MB AA0',
    syllables: ['ku', 'fa', 'mba'],
    category: 'Verbs',
    specialSounds: [{
      token: 'mb',
      type: 'prenasalized',
      description: 'Prenasalized b'
    }]
  },
  {
    word: 'kushanda',
    english: 'to work',
    ipa: '/ku.ʃá.nda/',
    cmu: 'K UW0-SH AA1H-ND AA0',
    syllables: ['ku', 'sha', 'nda'],
    category: 'Verbs',
    specialSounds: [{
      token: 'nd',
      type: 'prenasalized',
      description: 'Prenasalized d'
    }]
  },
  {
    word: 'kuverenga',
    english: 'to read',
    ipa: '/ku.ve.ɾé.ŋa/',
    cmu: 'K UW0-V EH0-R EH1H-NG AA0',
    syllables: ['ku', 've', 're', 'nga'],
    category: 'Verbs',
    specialSounds: [{
      token: 'ng',
      type: 'velar',
      description: 'Velar nasal'
    }]
  },
  {
    word: 'kunyora',
    english: 'to write',
    ipa: '/ku.ɲó.ɾa/',
    cmu: 'K UW0-NY OW1H-R AA0',
    syllables: ['ku', 'nyo', 'ra'],
    category: 'Verbs',
    specialSounds: [{
      token: 'ny',
      type: 'palatalized',
      description: 'Palatalized n'
    }]
  },
  {
    word: 'kudzidza',
    english: 'to learn',
    ipa: '/ku.dzí.dza/',
    cmu: 'K UW0-DZ IY1H-DZ AA0',
    syllables: ['ku', 'dzi', 'dza'],
    category: 'Verbs',
    specialSounds: [{
      token: 'dz',
      type: 'affricate',
      description: 'Affricate dz'
    }]
  },

  // Days of the week
  {
    word: 'svondo',
    english: 'Sunday',
    ipa: '/s̫ó.ndo/',
    cmu: 'SV OW1H-ND OW0',
    syllables: ['svo', 'ndo'],
    category: 'Days',
    specialSounds: [
      {
        token: 'sv',
        type: 'whistled',
        description: 'Whistled sibilant'
      },
      {
        token: 'nd',
        type: 'prenasalized',
        description: 'Prenasalized d'
      }
    ]
  },
  {
    word: 'muvhuro',
    english: 'Monday',
    ipa: '/mu.v̤ú.ɾo/',
    cmu: 'M UW0-VH UW1H-R OW0',
    syllables: ['mu', 'vhu', 'ro'],
    category: 'Days',
    specialSounds: [{
      token: 'vh',
      type: 'breathy',
      description: 'Breathy v'
    }]
  },
  {
    word: 'chipiri',
    english: 'Tuesday',
    ipa: '/tʃi.pí.ɾi/',
    cmu: 'CH IY0-P IY1H-R IY0',
    syllables: ['chi', 'pi', 'ri'],
    category: 'Days'
  },
  {
    word: 'chitatu',
    english: 'Wednesday',
    ipa: '/tʃi.tá.tu/',
    cmu: 'CH IY0-T AA1H-T UW0',
    syllables: ['chi', 'ta', 'tu'],
    category: 'Days'
  },
  {
    word: 'china',
    english: 'Thursday',
    ipa: '/tʃí.na/',
    cmu: 'CH IY1H-N AA0',
    syllables: ['chi', 'na'],
    category: 'Days'
  },
  {
    word: 'chishanu',
    english: 'Friday',
    ipa: '/tʃi.ʃá.nu/',
    cmu: 'CH IY0-SH AA1H-N UW0',
    syllables: ['chi', 'sha', 'nu'],
    category: 'Days'
  },
  {
    word: 'mugovera',
    english: 'Saturday',
    ipa: '/mu.ɡo.vé.ɾa/',
    cmu: 'M UW0-G OW0-V EH1H-R AA0',
    syllables: ['mu', 'go', 've', 'ra'],
    category: 'Days'
  },

  // Common phrases
  {
    word: 'pamusoroi',
    english: 'excuse me',
    ipa: '/pa.mu.só.ɾo.i/',
    cmu: 'P AA0-M UW0-S OW1H-R OW0-IY0',
    syllables: ['pa', 'mu', 'so', 'ro', 'i'],
    category: 'Courtesy',
    difficulty: 'advanced'
  },
  {
    word: 'zita rangu ndi',
    english: 'my name is',
    ipa: '/zí.ta ɾá.ŋu ⁿdi/',
    cmu: 'Z IY1H-T AA0 R AA1H-NG UW0 ND IY0',
    syllables: ['zi', 'ta', 'ra', 'ngu', 'ndi'],
    category: 'Introduction',
    specialSounds: [
      {
        token: 'ng',
        type: 'velar',
        description: 'Velar nasal'
      },
      {
        token: 'nd',
        type: 'prenasalized',
        description: 'Prenasalized d'
      }
    ]
  },

  // Food items
  {
    word: 'sadza',
    english: 'staple food (maize meal)',
    ipa: '/sá.dza/',
    cmu: 'S AA1H-DZ AA0',
    syllables: ['sa', 'dza'],
    category: 'Food',
    specialSounds: [{
      token: 'dz',
      type: 'affricate',
      description: 'Affricate dz'
    }]
  },
  {
    word: 'nyama',
    english: 'meat',
    ipa: '/ɲá.ma/',
    cmu: 'NY AA1H-M AA0',
    syllables: ['nya', 'ma'],
    category: 'Food',
    specialSounds: [{
      token: 'ny',
      type: 'palatalized',
      description: 'Palatalized n'
    }]
  },
  {
    word: 'mukaka',
    english: 'milk',
    ipa: '/mu.ká.ka/',
    cmu: 'M UW0-K AA1H-K AA0',
    syllables: ['mu', 'ka', 'ka'],
    category: 'Food'
  },
  {
    word: 'mvura',
    english: 'water/rain',
    ipa: '/mvú.ɾa/',
    cmu: 'M V UW1H-R AA0',
    syllables: ['mvu', 'ra'],
    category: 'Nature',
    specialSounds: [{
      token: 'mv',
      type: 'prenasalized',
      description: 'Prenasalized v'
    }]
  },

  // Traditional/Cultural terms
  {
    word: 'bira',
    english: 'ancestral ceremony',
    ipa: '/ɓí.ɾa/',
    cmu: 'B IY1H-R AA0',
    syllables: ['bi', 'ra'],
    category: 'Culture'
  },
  {
    word: 'mudzimu',
    english: 'ancestor spirit',
    ipa: '/mu.dzí.mu/',
    cmu: 'M UW0-DZ IY1H-M UW0',
    syllables: ['mu', 'dzi', 'mu'],
    category: 'Culture',
    specialSounds: [{
      token: 'dz',
      type: 'affricate',
      description: 'Affricate dz'
    }]
  },
  {
    word: "n'anga",
    english: 'traditional healer',
    ipa: '/ná.ŋa/',
    cmu: 'N AA1H-NG AA0',
    syllables: ['n\'a', 'nga'],
    category: 'Culture',
    specialSounds: [{
      token: 'ng',
      type: 'velar',
      description: 'Velar nasal'
    }]
  },
  {
    word: 'mhondoro',
    english: 'lion spirit',
    ipa: '/m̥o.ndó.ɾo/',
    cmu: 'MH OW0-ND OW1H-R OW0',
    syllables: ['mho', 'ndo', 'ro'],
    category: 'Culture',
    specialSounds: [
      {
        token: 'mh',
        type: 'breathy',
        description: 'Voiceless m'
      },
      {
        token: 'nd',
        type: 'prenasalized',
        description: 'Prenasalized d'
      }
    ]
  },
  {
    word: 'svikiro',
    english: 'spirit medium',
    ipa: '/s̫i.kí.ɾo/',
    cmu: 'SV IY0-K IY1H-R OW0',
    syllables: ['svi', 'ki', 'ro'],
    category: 'Culture',
    specialSounds: [{
      token: 'sv',
      type: 'whistled',
      description: 'Whistled sibilant'
    }]
  },
  {
    word: 'dare',
    english: 'court/meeting place',
    ipa: '/dá.ɾe/',
    cmu: 'D AA1H-R EH0',
    syllables: ['da', 're'],
    category: 'Culture'
  },
  {
    word: 'mambo',
    english: 'king/chief',
    ipa: '/má.mbo/',
    cmu: 'M AA1H-MB OW0',
    syllables: ['ma', 'mbo'],
    category: 'Culture',
    specialSounds: [{
      token: 'mb',
      type: 'prenasalized',
      description: 'Prenasalized b'
    }]
  },

  // Nature terms
  {
    word: 'zuva',
    english: 'sun',
    ipa: '/zú.va/',
    cmu: 'Z UW1H-V AA0',
    syllables: ['zu', 'va'],
    category: 'Nature'
  },
  {
    word: 'mwedzi',
    english: 'moon/month',
    ipa: '/mwé.dzi/',
    cmu: 'M W EH1H-DZ IY0',
    syllables: ['mwe', 'dzi'],
    category: 'Nature',
    specialSounds: [
      {
        token: 'mw',
        type: 'labialized',
        description: 'Labialized m'
      },
      {
        token: 'dz',
        type: 'affricate',
        description: 'Affricate dz'
      }
    ]
  },
  {
    word: 'nyeredzi',
    english: 'star',
    ipa: '/ɲe.ɾé.dzi/',
    cmu: 'NY EH0-R EH1H-DZ IY0',
    syllables: ['nye', 're', 'dzi'],
    category: 'Nature',
    specialSounds: [
      {
        token: 'ny',
        type: 'palatalized',
        description: 'Palatalized n'
      },
      {
        token: 'dz',
        type: 'affricate',
        description: 'Affricate dz'
      }
    ]
  },
  {
    word: 'denga',
    english: 'sky',
    ipa: '/dé.ŋa/',
    cmu: 'D EH1H-NG AA0',
    syllables: ['de', 'nga'],
    category: 'Nature',
    specialSounds: [{
      token: 'ng',
      type: 'velar',
      description: 'Velar nasal'
    }]
  },
  {
    word: 'mhepo',
    english: 'wind/air',
    ipa: '/m̥é.po/',
    cmu: 'MH EH1H-P OW0',
    syllables: ['mhe', 'po'],
    category: 'Nature',
    specialSounds: [{
      token: 'mh',
      type: 'breathy',
      description: 'Voiceless m'
    }]
  },
  {
    word: 'gomo',
    english: 'mountain',
    ipa: '/ɡó.mo/',
    cmu: 'G OW1H-M OW0',
    syllables: ['go', 'mo'],
    category: 'Nature'
  },
  {
    word: 'rwizi',
    english: 'river',
    ipa: '/ɾwí.zi/',
    cmu: 'RW IY1H-Z IY0',
    syllables: ['rwi', 'zi'],
    category: 'Nature',
    specialSounds: [{
      token: 'rw',
      type: 'labialized',
      description: 'Labialized r'
    }]
  },
  {
    word: 'sango',
    english: 'forest',
    ipa: '/sá.ŋo/',
    cmu: 'S AA1H-NG OW0',
    syllables: ['sa', 'ngo'],
    category: 'Nature',
    specialSounds: [{
      token: 'ng',
      type: 'velar',
      description: 'Velar nasal'
    }]
  },
  {
    word: 'muti',
    english: 'tree/medicine',
    ipa: '/mú.ti/',
    cmu: 'M UW1H-T IY0',
    syllables: ['mu', 'ti'],
    category: 'Nature'
  },
  {
    word: 'ruva',
    english: 'flower',
    ipa: '/ɾú.va/',
    cmu: 'R UW1H-V AA0',
    syllables: ['ru', 'va'],
    category: 'Nature'
  },
  {
    word: 'ivhu',
    english: 'soil',
    ipa: '/í.v̤u/',
    cmu: 'IY1H-VH UW0',
    syllables: ['i', 'vhu'],
    category: 'Nature',
    specialSounds: [{
      token: 'vh',
      type: 'breathy',
      description: 'Breathy v'
    }]
  },

  // Modern/Borrowed words
  {
    word: 'bhuku',
    english: 'book',
    ipa: '/bʱú.ku/',
    cmu: 'BH UW1H-K UW0',
    syllables: ['bhu', 'ku'],
    category: 'Education',
    specialSounds: [{
      token: 'bh',
      type: 'breathy',
      description: 'Breathy b'
    }]
  },
  {
    word: 'chikoro',
    english: 'school',
    ipa: '/tʃi.kó.ɾo/',
    cmu: 'CH IY0-K OW1H-R OW0',
    syllables: ['chi', 'ko', 'ro'],
    category: 'Education'
  },
  {
    word: 'ticha',
    english: 'teacher',
    ipa: '/tí.tʃa/',
    cmu: 'T IY1H-CH AA0',
    syllables: ['ti', 'cha'],
    category: 'Education'
  },
  {
    word: 'motokari',
    english: 'car',
    ipa: '/mo.to.ká.ɾi/',
    cmu: 'M OW0-T OW0-K AA1H-R IY0',
    syllables: ['mo', 'to', 'ka', 'ri'],
    category: 'Transport'
  },
  {
    word: 'chitima',
    english: 'train',
    ipa: '/tʃi.tí.ma/',
    cmu: 'CH IY0-T IY1H-M AA0',
    syllables: ['chi', 'ti', 'ma'],
    category: 'Transport'
  },
  {
    word: 'ndege',
    english: 'airplane',
    ipa: '/ndé.ɡe/',
    cmu: 'ND EH1H-G EH0',
    syllables: ['nde', 'ge'],
    category: 'Transport',
    specialSounds: [{
      token: 'nd',
      type: 'prenasalized',
      description: 'Prenasalized d'
    }]
  },
  {
    word: 'chipatara',
    english: 'hospital',
    ipa: '/tʃi.pa.tá.ɾa/',
    cmu: 'CH IY0-P AA0-T AA1H-R AA0',
    syllables: ['chi', 'pa', 'ta', 'ra'],
    category: 'Health'
  },
  {
    word: 'kereke',
    english: 'church',
    ipa: '/ke.ɾé.ke/',
    cmu: 'K EH0-R EH1H-K EH0',
    syllables: ['ke', 're', 'ke'],
    category: 'Religion'
  },
  {
    word: 'bhaibheri',
    english: 'bible',
    ipa: '/bʱa.i.bʱé.ɾi/',
    cmu: 'BH AA0-IY0-BH EH1H-R IY0',
    syllables: ['bha', 'i', 'bhe', 'ri'],
    category: 'Religion',
    specialSounds: [{
      token: 'bh',
      type: 'breathy',
      description: 'Breathy b'
    }]
  },
  {
    word: 'musika',
    english: 'market',
    ipa: '/mu.sí.ka/',
    cmu: 'M UW0-S IY1H-K AA0',
    syllables: ['mu', 'si', 'ka'],
    category: 'Commerce'
  },
  {
    word: 'sitoro',
    english: 'store',
    ipa: '/si.tó.ɾo/',
    cmu: 'S IY0-T OW1H-R OW0',
    syllables: ['si', 'to', 'ro'],
    category: 'Commerce'
  },
  {
    word: 'mari',
    english: 'money',
    ipa: '/má.ɾi/',
    cmu: 'M AA1H-R IY0',
    syllables: ['ma', 'ri'],
    category: 'Commerce'
  },

  // Common phrases with special pronunciation
  {
    word: 'ndine urombo',
    english: 'I am sorry',
    ipa: '/ⁿdi.ne u.ɾó.mbo/',
    cmu: 'ND IY0-N EH0 UW0-R OW1H-MB OW0',
    syllables: ['ndi', 'ne', 'u', 'ro', 'mbo'],
    category: 'Courtesy',
    specialSounds: [
      {
        token: 'nd',
        type: 'prenasalized',
        description: 'Prenasalized d'
      },
      {
        token: 'mb',
        type: 'prenasalized',
        description: 'Prenasalized b'
      }
    ]
  },
  {
    word: 'fambai zvakanaka',
    english: 'go well (goodbye)',
    ipa: '/fa.mbá.i z̫a.ka.ná.ka/',
    cmu: 'F AA0-MB AA1H-IY0 ZV AA0-K AA0-N AA1H-K AA0',
    syllables: ['fa', 'mba', 'i', 'zva', 'ka', 'na', 'ka'],
    category: 'Greetings',
    specialSounds: [
      {
        token: 'mb',
        type: 'prenasalized',
        description: 'Prenasalized b'
      },
      {
        token: 'zv',
        type: 'whistled',
        description: 'Voiced whistled sibilant'
      }
    ]
  },
  {
    word: 'ndinokumbira',
    english: 'please (I request)',
    ipa: '/ⁿdi.no.ku.mbí.ɾa/',
    cmu: 'ND IY0-N OW0-K UW0-MB IY1H-R AA0',
    syllables: ['ndi', 'no', 'ku', 'mbi', 'ra'],
    category: 'Courtesy',
    specialSounds: [
      {
        token: 'nd',
        type: 'prenasalized',
        description: 'Prenasalized d'
      },
      {
        token: 'mb',
        type: 'prenasalized',
        description: 'Prenasalized b'
      }
    ]
  }
]

// Export additional helper data
export const specialSoundTypes = {
  prenasalized: {
    name: 'Prenasalized Consonants',
    description: 'Consonants preceded by a brief nasal sound',
    examples: ['mb', 'nd', 'ng', 'nj', 'nz', 'mv']
  },
  whistled: {
    name: 'Whistled Sibilants',
    description: 'High-frequency sibilants pronounced with rounded lips',
    examples: ['sv', 'zv', 'tsv', 'dzv', 'nzv']
  },
  breathy: {
    name: 'Breathy Consonants',
    description: 'Consonants pronounced with audible breath/aspiration',
    examples: ['bh', 'dh', 'vh', 'mh', 'th', 'kh', 'ph']
  },
  labialized: {
    name: 'Labialized Consonants',
    description: 'Consonants pronounced with lip rounding',
    examples: ['gw', 'kw', 'ngw', 'mw', 'pw', 'rw', 'sw', 'tw', 'zw', 'hw', 'chw']
  },
  palatalized: {
    name: 'Palatalized Consonants',
    description: 'Consonants pronounced with the tongue raised toward the palate',
    examples: ['dy', 'ty', 'ny', 'nh']
  },
  affricate: {
    name: 'Affricates',
    description: 'Consonants that begin as stops and release as fricatives',
    examples: ['ch', 'dz', 'ts', 'pf']
  }
}

export const tonePatterns = {
  H: 'High tone',
  L: 'Low tone (unmarked)',
  R: 'Rising tone',
  F: 'Falling tone',
  HL: 'High-Low pattern',
  LH: 'Low-High pattern',
  HLH: 'High-Low-High pattern'
}

export default pronunciationDictionary
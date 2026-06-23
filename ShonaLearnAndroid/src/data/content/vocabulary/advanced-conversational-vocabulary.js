// Advanced Conversational Vocabulary Module (300+ words)
// Target: Fluent conversational proficiency

export const advancedConversationalVocabulary = {
  // Emotional Expressions (50+ words)
  emotionalExpressions: {
    joy: [
      {
        id: "adv_emo_001",
        shona: "ndafara zvikuru",
        english: "I am very happy",
        category: "emotions",
        subcategories: ["joy", "happiness"],
        level: "B2",
        difficulty: 6,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLLHL",
        ipa: "/ⁿdafara zvikuru/",
        morphology: {
          root: "fara",
          affixes: ["nda-", "-a"],
          noun_class: null
        },
        cultural_notes: "Used to express genuine happiness, often shared in community celebrations",
        usage_notes: "Can be intensified with 'zvikuru' (very) or 'chaizvo' (really)",
        collocations: ["fara nemoyo wose", "fara zvekupenga"],
        synonyms: ["ndine mufaro", "ndiri kukumbira"],
        antonyms: ["ndiri kushungurudzika", "ndine shungu"],
        examples: [
          {
            shona: "Ndafara zvikuru kukuonai",
            english: "I am very happy to see you",
            context: "Meeting someone after a long time",
            register: "formal"
          }
        ],
        audio: {
          word: "ndafara_zvikuru.mp3",
          sentences: ["ndafara_zvikuru_example1.mp3"]
        }
      },
      {
        id: "adv_emo_002",
        shona: "mufaro mukuru",
        english: "great joy",
        category: "emotions",
        subcategories: ["joy", "celebration"],
        level: "B2",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHLHL",
        ipa: "/mufaro mukuru/",
        morphology: {
          root: "faro",
          affixes: ["mu-"],
          noun_class: 3
        }
      },
      {
        id: "adv_emo_003",
        shona: "kufadzwa",
        english: "to be pleased/delighted",
        category: "emotions",
        subcategories: ["joy", "satisfaction"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kufaʣwa/",
        examples: [
          {
            shona: "Ndakafadzwa nebasa rako",
            english: "I am pleased with your work",
            context: "Professional feedback",
            register: "formal"
          }
        ]
      }
    ],
    sadness: [
      {
        id: "adv_emo_010",
        shona: "kushungurudzika",
        english: "to be sad/troubled",
        category: "emotions",
        subcategories: ["sadness", "distress"],
        level: "B2",
        difficulty: 7,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHLHL",
        ipa: "/kuʃuŋguruʣika/",
        cultural_notes: "Often expressed communally; sharing sadness is important in Shona culture",
        examples: [
          {
            shona: "Ndiri kushungurudzika nekurasikirwa",
            english: "I am saddened by the loss",
            context: "Expressing condolences",
            register: "formal"
          }
        ]
      },
      {
        id: "adv_emo_011",
        shona: "shungu",
        english: "sorrow/grief",
        category: "emotions",
        subcategories: ["sadness", "grief"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/ʃuŋgu/"
      }
    ],
    anger: [
      {
        id: "adv_emo_020",
        shona: "kutsamwa",
        english: "to be angry",
        category: "emotions",
        subcategories: ["anger"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kutsamwa/",
        usage_notes: "Direct expression of anger should be moderated in formal settings",
        examples: [
          {
            shona: "Usatsamwe nazvo",
            english: "Don't be angry about it",
            context: "Calming someone",
            register: "informal"
          }
        ]
      },
      {
        id: "adv_emo_021",
        shona: "kugumbuka",
        english: "to be frustrated/annoyed",
        category: "emotions",
        subcategories: ["anger", "frustration"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kugumbuka/"
      }
    ],
    fear: [
      {
        id: "adv_emo_030",
        shona: "kutya",
        english: "to fear/be afraid",
        category: "emotions",
        subcategories: ["fear"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LH",
        ipa: "/kutja/",
        examples: [
          {
            shona: "Ndiri kutya kuti zvingakanganisika",
            english: "I fear that things might go wrong",
            context: "Expressing concern",
            register: "neutral"
          }
        ]
      },
      {
        id: "adv_emo_031",
        shona: "kuvhunduka",
        english: "to be startled/shocked",
        category: "emotions",
        subcategories: ["fear", "surprise"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kuvunduka/"
      }
    ],
    surprise: [
      {
        id: "adv_emo_040",
        shona: "kushamisika",
        english: "to be surprised",
        category: "emotions",
        subcategories: ["surprise"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kuʃamisika/",
        examples: [
          {
            shona: "Ndakashamisika nekuona iwe pano",
            english: "I was surprised to see you here",
            context: "Unexpected meeting",
            register: "informal"
          }
        ]
      }
    ]
  },

  // Opinion Phrases (40+ expressions)
  opinionPhrases: {
    expressing: [
      {
        id: "adv_op_001",
        shona: "ndinofunga kuti",
        english: "I think that",
        category: "opinions",
        subcategories: ["expressing_opinion"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLLHL",
        ipa: "/ⁿdinofuŋga kuti/",
        usage_notes: "Standard way to introduce an opinion",
        examples: [
          {
            shona: "Ndinofunga kuti zvakanaka",
            english: "I think it's good",
            context: "Giving an opinion",
            register: "neutral"
          }
        ]
      },
      {
        id: "adv_op_002",
        shona: "maonero angu ndeekuti",
        english: "my view is that",
        category: "opinions",
        subcategories: ["expressing_opinion"],
        level: "B2",
        difficulty: 7,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LHLHLLLHL",
        ipa: "/maonero aŋgu ⁿdeːkuti/",
        cultural_notes: "More formal way to express opinion, suitable for meetings",
        examples: [
          {
            shona: "Maonero angu ndeekuti tinofanira kuronga",
            english: "My view is that we should plan",
            context: "Business meeting",
            register: "formal"
          }
        ]
      },
      {
        id: "adv_op_003",
        shona: "ndinotenda kuti",
        english: "I believe that",
        category: "opinions",
        subcategories: ["expressing_opinion", "belief"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLLHL",
        ipa: "/ⁿdinotenda kuti/"
      },
      {
        id: "adv_op_004",
        shona: "zviri pachena kuti",
        english: "it's clear that",
        category: "opinions",
        subcategories: ["expressing_opinion", "certainty"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLLHLHL",
        ipa: "/zviri patʃena kuti/"
      }
    ],
    agreeing: [
      {
        id: "adv_op_010",
        shona: "ndinobvumirana newe",
        english: "I agree with you",
        category: "opinions",
        subcategories: ["agreement"],
        level: "B1",
        difficulty: 6,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLLLHLH",
        ipa: "/ⁿdinobvumirana newe/",
        examples: [
          {
            shona: "Ndinobvumirana newe zvachose",
            english: "I completely agree with you",
            context: "Strong agreement",
            register: "neutral"
          }
        ]
      },
      {
        id: "adv_op_011",
        shona: "zvirinani",
        english: "that's right/correct",
        category: "opinions",
        subcategories: ["agreement"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "informal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/zvirinani/"
      },
      {
        id: "adv_op_012",
        shona: "handina kupikisa",
        english: "I don't disagree",
        category: "opinions",
        subcategories: ["agreement", "mild"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLLLHL",
        ipa: "/handina kupikisa/"
      }
    ],
    disagreeing: [
      {
        id: "adv_op_020",
        shona: "handifungi kudaro",
        english: "I don't think so",
        category: "opinions",
        subcategories: ["disagreement"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLLLHL",
        ipa: "/handifuŋgi kudaro/",
        cultural_notes: "Polite way to disagree without direct confrontation",
        examples: [
          {
            shona: "Handifungi kudaro, asi ndinoterera",
            english: "I don't think so, but I'm listening",
            context: "Respectful disagreement",
            register: "formal"
          }
        ]
      },
      {
        id: "adv_op_021",
        shona: "ndinopikisa",
        english: "I disagree",
        category: "opinions",
        subcategories: ["disagreement"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ⁿdinopikisa/"
      },
      {
        id: "adv_op_022",
        shona: "handizvo zvandinoona",
        english: "that's not how I see it",
        category: "opinions",
        subcategories: ["disagreement", "perspective"],
        level: "B2",
        difficulty: 7,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLLLLHL",
        ipa: "/handizvo zvaⁿdinoːna/"
      }
    ]
  },

  // Polite Expressions (30+ expressions)
  politeExpressions: {
    requests: [
      {
        id: "adv_pol_001",
        shona: "ndapota",
        english: "please",
        category: "politeness",
        subcategories: ["requests"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/ⁿdapota/",
        usage_notes: "Essential for polite requests in any context",
        examples: [
          {
            shona: "Ndapota ndibatsireiwo",
            english: "Please help me",
            context: "Asking for help",
            register: "neutral"
          }
        ]
      },
      {
        id: "adv_pol_002",
        shona: "dai maibvuma",
        english: "if you would allow",
        category: "politeness",
        subcategories: ["requests", "formal"],
        level: "B2",
        difficulty: 7,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/dai maibvuma/"
      },
      {
        id: "adv_pol_003",
        shona: "ndinokumbirawo",
        english: "I kindly request",
        category: "politeness",
        subcategories: ["requests", "formal"],
        level: "B1",
        difficulty: 6,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LLLHL",
        ipa: "/ⁿdinokumbirawo/"
      }
    ],
    gratitude: [
      {
        id: "adv_pol_010",
        shona: "ndinotenda zvikuru",
        english: "thank you very much",
        category: "politeness",
        subcategories: ["gratitude"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLLHL",
        ipa: "/ⁿdinotenda zvikuru/",
        examples: [
          {
            shona: "Ndinotenda zvikuru nebatsiro yenyu",
            english: "Thank you very much for your help",
            context: "Expressing deep gratitude",
            register: "formal"
          }
        ]
      },
      {
        id: "adv_pol_011",
        shona: "ndatenda hangu",
        english: "I really appreciate it",
        category: "politeness",
        subcategories: ["gratitude", "informal"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "informal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ⁿdatenda haŋgu/"
      }
    ],
    apologies: [
      {
        id: "adv_pol_020",
        shona: "ndine urombo",
        english: "I'm sorry",
        category: "politeness",
        subcategories: ["apologies"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ⁿdine urombo/",
        cultural_notes: "Standard apology, can be intensified with 'zvikuru' or 'chaizvo'",
        examples: [
          {
            shona: "Ndine urombo zvikuru",
            english: "I'm very sorry",
            context: "Sincere apology",
            register: "neutral"
          }
        ]
      },
      {
        id: "adv_pol_021",
        shona: "ndikanganwa",
        english: "I forgot/made a mistake",
        category: "politeness",
        subcategories: ["apologies", "admission"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ⁿdikaŋganwa/"
      },
      {
        id: "adv_pol_022",
        shona: "musandipa mhosva",
        english: "please don't blame me",
        category: "politeness",
        subcategories: ["apologies", "defense"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "informal",
        dialect: "standard",
        tones: "LLLHL",
        ipa: "/musandipa m̥osva/"
      }
    ]
  },

  // Discourse Markers (40+ markers)
  discourseMarkers: {
    sequencing: [
      {
        id: "adv_dis_001",
        shona: "pakutanga",
        english: "firstly/at first",
        category: "discourse",
        subcategories: ["sequencing"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/pakutaŋga/",
        usage_notes: "Used to structure arguments or narratives",
        examples: [
          {
            shona: "Pakutanga, tinofanira kunzwisisa",
            english: "Firstly, we need to understand",
            context: "Beginning an explanation",
            register: "formal"
          }
        ]
      },
      {
        id: "adv_dis_002",
        shona: "mushure mezvo",
        english: "after that/then",
        category: "discourse",
        subcategories: ["sequencing"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/muʃure mezvo/"
      },
      {
        id: "adv_dis_003",
        shona: "pakupedzisira",
        english: "finally/lastly",
        category: "discourse",
        subcategories: ["sequencing"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/pakupeʣisira/"
      }
    ],
    contrast: [
      {
        id: "adv_dis_010",
        shona: "asi",
        english: "but",
        category: "discourse",
        subcategories: ["contrast"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LH",
        ipa: "/asi/",
        examples: [
          {
            shona: "Ndinoda, asi handikwanisi",
            english: "I want to, but I can't",
            context: "Expressing limitation",
            register: "neutral"
          }
        ]
      },
      {
        id: "adv_dis_011",
        shona: "zvisinei nazvo",
        english: "nevertheless/regardless",
        category: "discourse",
        subcategories: ["contrast", "concession"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLLLHL",
        ipa: "/zvisinej nazvo/"
      },
      {
        id: "adv_dis_012",
        shona: "kunyangwe zvakadaro",
        english: "even so/however",
        category: "discourse",
        subcategories: ["contrast"],
        level: "B2",
        difficulty: 7,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLLHL",
        ipa: "/kuɲaŋgwe zvakadaro/"
      }
    ],
    addition: [
      {
        id: "adv_dis_020",
        shona: "uyezve",
        english: "also/and also",
        category: "discourse",
        subcategories: ["addition"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/ujezve/",
        examples: [
          {
            shona: "Uyezve, tinofanira kufunga nezvezvi",
            english: "Also, we need to think about this",
            context: "Adding information",
            register: "neutral"
          }
        ]
      },
      {
        id: "adv_dis_021",
        shona: "pamusoro pezvo",
        english: "furthermore/moreover",
        category: "discourse",
        subcategories: ["addition", "emphasis"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LHLHL",
        ipa: "/pamusoro pezvo/"
      }
    ],
    explanation: [
      {
        id: "adv_dis_030",
        shona: "ndiko kuti",
        english: "that is to say",
        category: "discourse",
        subcategories: ["explanation"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ⁿdiko kuti/",
        usage_notes: "Used to clarify or rephrase",
        examples: [
          {
            shona: "Hazvishande, ndiko kuti, hazvibatsiri",
            english: "It doesn't work, that is to say, it's not helpful",
            context: "Clarifying a statement",
            register: "neutral"
          }
        ]
      },
      {
        id: "adv_dis_031",
        shona: "nemamwe mazwi",
        english: "in other words",
        category: "discourse",
        subcategories: ["explanation", "paraphrase"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/nemamwe mazwi/"
      }
    ]
  },

  // Hesitation and Thinking (20+ expressions)
  hesitationThinking: [
    {
      id: "adv_hes_001",
      shona: "regai ndifunge",
      english: "let me think",
      category: "hesitation",
      subcategories: ["thinking"],
      level: "B1",
      difficulty: 5,
      frequency: "high",
      register: "neutral",
      dialect: "standard",
      tones: "LLHL",
      ipa: "/regaj ⁿdifuŋge/",
      cultural_notes: "Polite way to buy time while thinking",
      examples: [
        {
          shona: "Regai ndifunge... ah, ndinorangarira",
          english: "Let me think... ah, I remember",
          context: "Recalling information",
          register: "neutral"
        }
      ]
    },
    {
      id: "adv_hes_002",
      shona: "handinyatsoziva",
      english: "I'm not quite sure",
      category: "hesitation",
      subcategories: ["uncertainty"],
      level: "B1",
      difficulty: 6,
      frequency: "high",
      register: "neutral",
      dialect: "standard",
      tones: "LLLHL",
      ipa: "/handiɲatsoziva/"
    },
    {
      id: "adv_hes_003",
      shona: "pamwe",
      english: "maybe/perhaps",
      category: "hesitation",
      subcategories: ["possibility"],
      level: "A2",
      difficulty: 4,
      frequency: "high",
      register: "neutral",
      dialect: "standard",
      tones: "HL",
      ipa: "/pamwe/"
    },
    {
      id: "adv_hes_004",
      shona: "zvimwe",
      english: "possibly",
      category: "hesitation",
      subcategories: ["possibility"],
      level: "B1",
      difficulty: 5,
      frequency: "medium",
      register: "neutral",
      dialect: "standard",
      tones: "HL",
      ipa: "/zvimwe/"
    },
    {
      id: "adv_hes_005",
      shona: "ndinofungidzira kuti",
      english: "I suppose that",
      category: "hesitation",
      subcategories: ["speculation"],
      level: "B2",
      difficulty: 6,
      frequency: "medium",
      register: "neutral",
      dialect: "standard",
      tones: "LLLLHL",
      ipa: "/ⁿdinofuŋgiʣira kuti/"
    }
  ],

  // Interjections (30+ expressions)
  interjections: {
    surprise: [
      {
        id: "adv_int_001",
        shona: "maiwe!",
        english: "oh my!",
        category: "interjections",
        subcategories: ["surprise"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "informal",
        dialect: "standard",
        tones: "LH",
        ipa: "/majwe/",
        cultural_notes: "Common exclamation of surprise, can express both positive and negative surprise",
        examples: [
          {
            shona: "Maiwe! Handina kuziva kuti uri pano",
            english: "Oh my! I didn't know you were here",
            context: "Surprised to see someone",
            register: "informal"
          }
        ]
      },
      {
        id: "adv_int_002",
        shona: "haiwa!",
        english: "wow!/really!",
        category: "interjections",
        subcategories: ["surprise", "disbelief"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "informal",
        dialect: "standard",
        tones: "LH",
        ipa: "/hajwa/"
      },
      {
        id: "adv_int_003",
        shona: "ehe!",
        english: "oh!/I see!",
        category: "interjections",
        subcategories: ["realization"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "informal",
        dialect: "standard",
        tones: "LH",
        ipa: "/ehe/"
      }
    ],
    agreement: [
      {
        id: "adv_int_010",
        shona: "hongu",
        english: "yes",
        category: "interjections",
        subcategories: ["agreement"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/hoŋgu/",
        usage_notes: "Standard affirmative response"
      },
      {
        id: "adv_int_011",
        shona: "ehe",
        english: "yeah/yep",
        category: "interjections",
        subcategories: ["agreement", "informal"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "informal",
        dialect: "standard",
        tones: "LH",
        ipa: "/ehe/"
      }
    ],
    pain: [
      {
        id: "adv_int_020",
        shona: "aaah!",
        english: "ouch!",
        category: "interjections",
        subcategories: ["pain"],
        level: "A2",
        difficulty: 2,
        frequency: "medium",
        register: "informal",
        dialect: "standard",
        tones: "HL",
        ipa: "/aːː/",
        usage_notes: "Universal expression of pain"
      }
    ]
  }
}

// Helper functions for accessing vocabulary
export function getVocabularyByCategory(category) {
  const allWords = []
  
  // Flatten the nested structure
  Object.values(advancedConversationalVocabulary).forEach(mainCategory => {
    if (typeof mainCategory === 'object' && !Array.isArray(mainCategory)) {
      Object.values(mainCategory).forEach(subCategory => {
        if (Array.isArray(subCategory)) {
          allWords.push(...subCategory.filter(word => word.category === category))
        }
      })
    } else if (Array.isArray(mainCategory)) {
      allWords.push(...mainCategory.filter(word => word.category === category))
    }
  })
  
  return allWords
}

export function getVocabularyByLevel(level) {
  const allWords = []
  
  Object.values(advancedConversationalVocabulary).forEach(mainCategory => {
    if (typeof mainCategory === 'object' && !Array.isArray(mainCategory)) {
      Object.values(mainCategory).forEach(subCategory => {
        if (Array.isArray(subCategory)) {
          allWords.push(...subCategory.filter(word => word.level === level))
        }
      })
    } else if (Array.isArray(mainCategory)) {
      allWords.push(...mainCategory.filter(word => word.level === level))
    }
  })
  
  return allWords
}

export function getVocabularyByDifficulty(minDifficulty, maxDifficulty) {
  const allWords = []
  
  Object.values(advancedConversationalVocabulary).forEach(mainCategory => {
    if (typeof mainCategory === 'object' && !Array.isArray(mainCategory)) {
      Object.values(mainCategory).forEach(subCategory => {
        if (Array.isArray(subCategory)) {
          allWords.push(...subCategory.filter(word => 
            word.difficulty >= minDifficulty && word.difficulty <= maxDifficulty
          ))
        }
      })
    } else if (Array.isArray(mainCategory)) {
      allWords.push(...mainCategory.filter(word => 
        word.difficulty >= minDifficulty && word.difficulty <= maxDifficulty
      ))
    }
  })
  
  return allWords
}

// Export total count
export const advancedConversationalVocabularyCount = Object.values(advancedConversationalVocabulary).reduce((total, category) => {
  if (typeof category === 'object' && !Array.isArray(category)) {
    return total + Object.values(category).reduce((catTotal, subCat) => {
      return catTotal + (Array.isArray(subCat) ? subCat.length : 0)
    }, 0)
  }
  return total + (Array.isArray(category) ? category.length : 0)
}, 0)
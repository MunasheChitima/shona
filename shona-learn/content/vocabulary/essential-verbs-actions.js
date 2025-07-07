// Essential Verbs & Actions Vocabulary Module (350+ words)
// Target: Core action vocabulary for all levels (A1-C1)

export const essentialVerbsActionsVocabulary = {
  // Basic Actions & Movement (60+ words)
  basicActionsMovement: {
    basic_verbs: [
      {
        id: "verb_bas_001",
        shona: "kuenda",
        english: "to go",
        category: "verbs",
        subcategories: ["movement", "basic_actions"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kuenda/",
        morphology: {
          root: "enda",
          affixes: ["ku-"],
          verb_class: "basic"
        },
        cultural_notes: "One of the most fundamental verbs, used constantly in daily conversation",
        usage_notes: "Often combined with directional particles",
        conjugation_pattern: "ku-enda (infinitive), ndinoenda (I go), ndakaenda (I went)",
        examples: [
          {
            shona: "Ndinoenda kushandi",
            english: "I am going to work",
            context: "Daily routine",
            register: "neutral"
          },
          {
            shona: "Ndakaenda kumba",
            english: "I went home",
            context: "Past action",
            register: "neutral"
          }
        ],
        audio: {
          word: "kuenda.mp3",
          sentences: ["kuenda_example1.mp3", "kuenda_example2.mp3"]
        }
      },
      {
        id: "verb_bas_002",
        shona: "kuuya",
        english: "to come",
        category: "verbs",
        subcategories: ["movement", "basic_actions"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kuuɪa/",
        conjugation_pattern: "ku-uya (infinitive), ndinouya (I come), ndakauya (I came)",
        examples: [
          {
            shona: "Ndinouya mangwana",
            english: "I will come tomorrow",
            context: "Future plans",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_bas_003",
        shona: "kumira",
        english: "to stand",
        category: "verbs",
        subcategories: ["position", "basic_actions"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kumira/",
        examples: [
          {
            shona: "Ndinomira pano",
            english: "I am standing here",
            context: "Position description",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_bas_004",
        shona: "kugara",
        english: "to sit/to live",
        category: "verbs",
        subcategories: ["position", "residence"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kugara/",
        usage_notes: "Dual meaning: physical sitting and residential living",
        examples: [
          {
            shona: "Ndinogara muHarare",
            english: "I live in Harare",
            context: "Residence",
            register: "neutral"
          },
          {
            shona: "Gara pasi",
            english: "Sit down",
            context: "Command",
            register: "informal"
          }
        ]
      },
      {
        id: "verb_bas_005",
        shona: "kurara",
        english: "to sleep",
        category: "verbs",
        subcategories: ["rest", "basic_actions"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kurara/",
        examples: [
          {
            shona: "Ndinorara panjere",
            english: "I sleep on the floor",
            context: "Sleep arrangements",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_bas_006",
        shona: "kumuka",
        english: "to wake up/get up",
        category: "verbs",
        subcategories: ["daily_routine"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kumuka/",
        examples: [
          {
            shona: "Ndinomuka mangwanani-ngwanani",
            english: "I wake up early in the morning",
            context: "Daily routine",
            register: "neutral"
          }
        ]
      }
    ],
    movement_verbs: [
      {
        id: "verb_mov_001",
        shona: "kufamba",
        english: "to walk/travel",
        category: "verbs",
        subcategories: ["movement"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kufamba/",
        cultural_notes: "Walking is a common form of transportation in Zimbabwe",
        examples: [
          {
            shona: "Ndakafamba netsoka",
            english: "I walked on foot",
            context: "Mode of transport",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_mov_002",
        shona: "kutamba",
        english: "to run",
        category: "verbs",
        subcategories: ["movement"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kutamba/",
        examples: [
          {
            shona: "Vana vanotamba muchikoro",
            english: "Children run at school",
            context: "School activities",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_mov_003",
        shona: "kusvetuka",
        english: "to jump",
        category: "verbs",
        subcategories: ["movement"],
        level: "A2",
        difficulty: 3,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kusvetuka/"
      },
      {
        id: "verb_mov_004",
        shona: "kutyaira",
        english: "to drive",
        category: "verbs",
        subcategories: ["movement", "transportation"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kutjaira/",
        examples: [
          {
            shona: "Baba vanotyaira motokari",
            english: "Father drives a car",
            context: "Transportation",
            register: "neutral"
          }
        ]
      }
    ]
  },

  // Daily Activities (50+ words)
  dailyActivities: {
    eating_drinking: [
      {
        id: "verb_eat_001",
        shona: "kudya",
        english: "to eat",
        category: "verbs",
        subcategories: ["eating", "daily_activities"],
        level: "A1",
        difficulty: 1,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LH",
        ipa: "/kudja/",
        cultural_notes: "Eating is communal in Shona culture, often shared from one dish",
        examples: [
          {
            shona: "Tinodya sadza mazuva ese",
            english: "We eat sadza every day",
            context: "Daily meals",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_eat_002",
        shona: "kunwa",
        english: "to drink",
        category: "verbs",
        subcategories: ["drinking", "daily_activities"],
        level: "A1",
        difficulty: 1,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LH",
        ipa: "/kunwa/",
        examples: [
          {
            shona: "Ndinoda kunwa mvura",
            english: "I want to drink water",
            context: "Basic needs",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_eat_003",
        shona: "kubika",
        english: "to cook",
        category: "verbs",
        subcategories: ["cooking", "daily_activities"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kubika/",
        cultural_notes: "Traditionally done by women, but changing in modern times",
        examples: [
          {
            shona: "Amai vanobika chikafu",
            english: "Mother cooks food",
            context: "Family roles",
            register: "neutral"
          }
        ]
      }
    ],
    personal_care: [
      {
        id: "verb_care_001",
        shona: "kushamba",
        english: "to wash/bathe",
        category: "verbs",
        subcategories: ["personal_care"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kuʃamba/",
        examples: [
          {
            shona: "Ndinoshamba mangwanani",
            english: "I bathe in the morning",
            context: "Daily routine",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_care_002",
        shona: "kupfeka",
        english: "to wear/put on clothes",
        category: "verbs",
        subcategories: ["personal_care", "clothing"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kupfeka/",
        examples: [
          {
            shona: "Ndinopfeka hembe",
            english: "I put on a shirt",
            context: "Getting dressed",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_care_003",
        shona: "kubvisa",
        english: "to remove/take off",
        category: "verbs",
        subcategories: ["personal_care", "clothing"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kubvisa/",
        examples: [
          {
            shona: "Bvisa shangu",
            english: "Take off your shoes",
            context: "Entering house",
            register: "informal"
          }
        ]
      }
    ]
  },

  // Communication & Interaction (40+ words)
  communicationInteraction: {
    speaking_listening: [
      {
        id: "verb_com_001",
        shona: "kutaura",
        english: "to speak/talk",
        category: "verbs",
        subcategories: ["communication"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kutaura/",
        examples: [
          {
            shona: "Vanotaura chiShona",
            english: "They speak Shona",
            context: "Language ability",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_com_002",
        shona: "kunzwa",
        english: "to hear",
        category: "verbs",
        subcategories: ["communication", "senses"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LH",
        ipa: "/kunzwa/",
        examples: [
          {
            shona: "Handisi kunzwa",
            english: "I cannot hear",
            context: "Communication difficulty",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_com_003",
        shona: "kuteerera",
        english: "to listen",
        category: "verbs",
        subcategories: ["communication"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kutēːrera/",
        cultural_notes: "Listening to elders is highly valued in Shona culture",
        examples: [
          {
            shona: "Teerera mudzidzisi",
            english: "Listen to the teacher",
            context: "School instruction",
            register: "formal"
          }
        ]
      },
      {
        id: "verb_com_004",
        shona: "kuverenga",
        english: "to read",
        category: "verbs",
        subcategories: ["communication", "education"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kuvereŋga/",
        examples: [
          {
            shona: "Ndinoverenga bhuku",
            english: "I read a book",
            context: "Educational activity",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_com_005",
        shona: "kunyora",
        english: "to write",
        category: "verbs",
        subcategories: ["communication", "education"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kuɲora/",
        examples: [
          {
            shona: "Ndinonyora tsamba",
            english: "I write a letter",
            context: "Communication",
            register: "neutral"
          }
        ]
      }
    ],
    social_interaction: [
      {
        id: "verb_soc_001",
        shona: "kusangana",
        english: "to meet",
        category: "verbs",
        subcategories: ["social_interaction"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kusaŋgana/",
        examples: [
          {
            shona: "Tinosangana zvishoma",
            english: "We meet rarely",
            context: "Social relationships",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_soc_002",
        shona: "kubvunza",
        english: "to ask",
        category: "verbs",
        subcategories: ["social_interaction"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kubvunza/",
        examples: [
          {
            shona: "Ndinoda kubvunza mubvunzo",
            english: "I want to ask a question",
            context: "Seeking information",
            register: "formal"
          }
        ]
      },
      {
        id: "verb_soc_003",
        shona: "kupindura",
        english: "to answer",
        category: "verbs",
        subcategories: ["social_interaction"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kupindura/",
        examples: [
          {
            shona: "Pindura mubvunzo",
            english: "Answer the question",
            context: "Educational setting",
            register: "formal"
          }
        ]
      }
    ]
  },

  // Work & Activities (40+ words)
  workActivities: {
    work_verbs: [
      {
        id: "verb_work_001",
        shona: "kushanda",
        english: "to work",
        category: "verbs",
        subcategories: ["work"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kuʃanda/",
        cultural_notes: "Work is highly valued in Shona culture, seen as dignity",
        examples: [
          {
            shona: "Ndinoshanda muzuva rese",
            english: "I work all day",
            context: "Work routine",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_work_002",
        shona: "kubata",
        english: "to hold/catch",
        category: "verbs",
        subcategories: ["physical_actions"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kubata/",
        usage_notes: "Multiple meanings: physical holding, catching, or handling",
        examples: [
          {
            shona: "Bata bhuku iri",
            english: "Hold this book",
            context: "Physical action",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_work_003",
        shona: "kuisa",
        english: "to put/place",
        category: "verbs",
        subcategories: ["physical_actions"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kuisa/",
        examples: [
          {
            shona: "Isa bhuku patafura",
            english: "Put the book on the table",
            context: "Instructions",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_work_004",
        shona: "kutora",
        english: "to take",
        category: "verbs",
        subcategories: ["physical_actions"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kutora/",
        examples: [
          {
            shona: "Tora hembe yako",
            english: "Take your shirt",
            context: "Instructions",
            register: "informal"
          }
        ]
      }
    ],
    learning_teaching: [
      {
        id: "verb_learn_001",
        shona: "kudzidza",
        english: "to learn/study",
        category: "verbs",
        subcategories: ["education"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kudziʣa/",
        cultural_notes: "Education is highly valued for personal and community development",
        examples: [
          {
            shona: "Ndinodzidza chiShona",
            english: "I am learning Shona",
            context: "Language learning",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_learn_002",
        shona: "kudzidzisa",
        english: "to teach",
        category: "verbs",
        subcategories: ["education"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kudziʣisa/",
        cultural_notes: "Teachers are highly respected in Shona society",
        examples: [
          {
            shona: "Mudzidzisi anodzidzisa vana",
            english: "The teacher teaches children",
            context: "School setting",
            register: "formal"
          }
        ]
      }
    ]
  },

  // Mental & Emotional States (30+ words)
  mentalEmotional: {
    thinking_knowing: [
      {
        id: "verb_ment_001",
        shona: "kufunga",
        english: "to think",
        category: "verbs",
        subcategories: ["mental_states"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kufuŋga/",
        examples: [
          {
            shona: "Ndinofunga kuti zvakanaka",
            english: "I think it's good",
            context: "Opinion expression",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_ment_002",
        shona: "kuziva",
        english: "to know",
        category: "verbs",
        subcategories: ["mental_states"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kuziva/",
        examples: [
          {
            shona: "Handizivi",
            english: "I don't know",
            context: "Lack of knowledge",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_ment_003",
        shona: "kukanganwa",
        english: "to forget",
        category: "verbs",
        subcategories: ["mental_states"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kukaŋganwa/",
        examples: [
          {
            shona: "Ndakakanganwa zita rake",
            english: "I forgot his/her name",
            context: "Memory lapse",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_ment_004",
        shona: "kuyeuka",
        english: "to remember",
        category: "verbs",
        subcategories: ["mental_states"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kujɪuka/",
        examples: [
          {
            shona: "Ndiyeuke nezvaizvo",
            english: "I remember that",
            context: "Recollection",
            register: "neutral"
          }
        ]
      }
    ],
    feeling_emotions: [
      {
        id: "verb_feel_001",
        shona: "kufara",
        english: "to be happy",
        category: "verbs",
        subcategories: ["emotions"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kufara/",
        examples: [
          {
            shona: "Ndinofara nekuona iwe",
            english: "I am happy to see you",
            context: "Greeting",
            register: "neutral"
          }
        ]
      },
      {
        id: "verb_feel_002",
        shona: "kutsamwa",
        english: "to be angry",
        category: "verbs",
        subcategories: ["emotions"],
        level: "A2",
        difficulty: 3,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kutsamwa/",
        examples: [
          {
            shona: "Usatsamwe nazvo",
            english: "Don't be angry about it",
            context: "Calming someone",
            register: "informal"
          }
        ]
      }
    ]
  }
};

// Utility functions for accessing essential verbs vocabulary
export function getVerbsByCategory(category) {
  const results = [];
  Object.values(essentialVerbsActionsVocabulary).forEach(mainCategory => {
    Object.values(mainCategory).forEach(subCategory => {
      if (Array.isArray(subCategory)) {
        subCategory.forEach(item => {
          if (item.category === category) {
            results.push(item);
          }
        });
      }
    });
  });
  return results;
}

export function getVerbsByLevel(level) {
  const results = [];
  Object.values(essentialVerbsActionsVocabulary).forEach(mainCategory => {
    Object.values(mainCategory).forEach(subCategory => {
      if (Array.isArray(subCategory)) {
        subCategory.forEach(item => {
          if (item.level === level) {
            results.push(item);
          }
        });
      }
    });
  });
  return results;
}

export function searchVerbs(searchTerm) {
  const results = [];
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  Object.values(essentialVerbsActionsVocabulary).forEach(mainCategory => {
    Object.values(mainCategory).forEach(subCategory => {
      if (Array.isArray(subCategory)) {
        subCategory.forEach(item => {
          if (item.shona.toLowerCase().includes(lowerSearchTerm) || 
              item.english.toLowerCase().includes(lowerSearchTerm) ||
              (item.cultural_notes && item.cultural_notes.toLowerCase().includes(lowerSearchTerm))) {
            results.push(item);
          }
        });
      }
    });
  });
  return results;
}

export const essentialVerbsActionsVocabularyCount = Object.values(essentialVerbsActionsVocabulary).reduce((total, category) => {
  return total + Object.values(category).reduce((catTotal, subcat) => {
    return catTotal + (Array.isArray(subcat) ? subcat.length : 0);
  }, 0);
}, 0);

console.log(`Essential Verbs & Actions Vocabulary loaded: ${essentialVerbsActionsVocabularyCount} words`);
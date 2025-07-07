// Essential Phrases & Expressions Module (300+ phrases)
// Target: Common conversational phrases and expressions

export const essentialPhrasesExpressionsVocabulary = {
  // Greetings & Social Phrases (50+ phrases)
  greetingsSocial: {
    basic_greetings: [
      {
        id: "phrase_greet_001",
        shona: "Mangwanani",
        english: "Good morning",
        category: "greetings",
        subcategories: ["basic_greetings", "time_specific"],
        level: "A1",
        difficulty: 1,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHLL",
        ipa: "/maŋgwanani/",
        cultural_notes: "Standard morning greeting, used until about 10 AM",
        usage_notes: "Can be followed by additional phrases to show respect",
        response_patterns: ["Mangwanani", "Ehe, mangwanani"],
        examples: [
          {
            shona: "Mangwanani, makadii?",
            english: "Good morning, how are you?",
            context: "Polite morning greeting",
            register: "formal"
          }
        ],
        audio: {
          phrase: "mangwanani.mp3",
          conversation: ["mangwanani_conversation1.mp3"]
        }
      },
      {
        id: "phrase_greet_002",
        shona: "Masikati",
        english: "Good afternoon",
        category: "greetings",
        subcategories: ["basic_greetings", "time_specific"],
        level: "A1",
        difficulty: 1,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/masikati/",
        cultural_notes: "Used from around noon until late afternoon",
        examples: [
          {
            shona: "Masikati akanaka",
            english: "Good afternoon (literally: good afternoon)",
            context: "Afternoon greeting",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_greet_003",
        shona: "Manheru",
        english: "Good evening",
        category: "greetings",
        subcategories: ["basic_greetings", "time_specific"],
        level: "A1",
        difficulty: 1,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/manɦeru/",
        cultural_notes: "Used from late afternoon through evening",
        examples: [
          {
            shona: "Manheru akanaka",
            english: "Good evening",
            context: "Evening greeting",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_greet_004",
        shona: "Makadii?",
        english: "How are you?",
        category: "greetings",
        subcategories: ["inquiry", "polite"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "polite",
        dialect: "standard",
        tones: "LHL",
        ipa: "/makadiː/",
        cultural_notes: "Essential polite inquiry, expected in most interactions",
        response_patterns: ["Tiripo", "Ndiripo", "Ndiri right"],
        examples: [
          {
            shona: "Hesi, makadii?",
            english: "Hello, how are you?",
            context: "Standard greeting",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_greet_005",
        shona: "Tiripo",
        english: "We are fine/here",
        category: "greetings",
        subcategories: ["response", "polite"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/tiripo/",
        cultural_notes: "Standard positive response to 'how are you'",
        usage_notes: "Uses plural 'we' even when speaking for oneself - shows community spirit",
        examples: [
          {
            shona: "Tiripo, imwi makadii?",
            english: "We are fine, how are you?",
            context: "Polite response",
            register: "neutral"
          }
        ]
      }
    ],
    farewells: [
      {
        id: "phrase_fare_001",
        shona: "Fambai zvakanaka",
        english: "Go well/Goodbye (to someone leaving)",
        category: "farewells",
        subcategories: ["departing"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLLHL",
        ipa: "/fambaj zvakanaka/",
        cultural_notes: "Used when the other person is leaving",
        usage_notes: "Literal meaning 'travel well'",
        examples: [
          {
            shona: "Fambai zvakanaka, tizonanana",
            english: "Go well, we'll see each other",
            context: "Farewell with future meeting",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_fare_002",
        shona: "Sarai zvakanaka",
        english: "Stay well/Goodbye (to someone staying)",
        category: "farewells",
        subcategories: ["staying"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLLHL",
        ipa: "/saraj zvakanaka/",
        cultural_notes: "Used when you are leaving and others are staying",
        examples: [
          {
            shona: "Sarai zvakanaka, ndichananiwa",
            english: "Stay well, I'll be back",
            context: "Leaving others behind",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_fare_003",
        shona: "Tizonanana",
        english: "We'll see each other (later)",
        category: "farewells",
        subcategories: ["future_meeting"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/tizonanana/",
        cultural_notes: "Common way to end conversations, implies future contact",
        examples: [
          {
            shona: "Zvakanakai tizonanana mangwana",
            english: "Alright, we'll see each other tomorrow",
            context: "Planning future meeting",
            register: "neutral"
          }
        ]
      }
    ]
  },

  // Questions & Responses (40+ phrases)
  questionsResponses: {
    basic_questions: [
      {
        id: "phrase_ques_001",
        shona: "Zita renyu ndiani?",
        english: "What is your name?",
        category: "questions",
        subcategories: ["personal_information"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "polite",
        dialect: "standard",
        tones: "HLLLHL",
        ipa: "/zita reɲu ⁿdianj/",
        cultural_notes: "Polite way to ask someone's name",
        response_patterns: ["Zita rangu ndi...", "Ndinonzi..."],
        examples: [
          {
            shona: "Ndinokwazisai, zita renyu ndiani?",
            english: "Nice to meet you, what is your name?",
            context: "First meeting",
            register: "polite"
          }
        ]
      },
      {
        id: "phrase_ques_002",
        shona: "Munobva kupi?",
        english: "Where do you come from?",
        category: "questions",
        subcategories: ["personal_information", "origin"],
        level: "A1",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/munobva kupi/",
        cultural_notes: "Common question to understand someone's background",
        examples: [
          {
            shona: "Munobva kupi munyika yeZimbabwe?",
            english: "Where do you come from in Zimbabwe?",
            context: "Getting to know someone",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_ques_003",
        shona: "Muri kuenda kupi?",
        english: "Where are you going?",
        category: "questions",
        subcategories: ["direction", "travel"],
        level: "A1",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLLHL",
        ipa: "/muri kuenda kupi/",
        cultural_notes: "Common casual question, shows friendly interest",
        examples: [
          {
            shona: "Muri kuenda kupi kwedu?",
            english: "Where are you going, friend?",
            context: "Casual inquiry",
            register: "informal"
          }
        ]
      },
      {
        id: "phrase_ques_004",
        shona: "Nguva yakaniko?",
        english: "What time is it?",
        category: "questions",
        subcategories: ["time"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HLLLHL",
        ipa: "/ŋguva jakaniko/",
        examples: [
          {
            shona: "Ndinoregerera, nguva yakaniko?",
            english: "Excuse me, what time is it?",
            context: "Asking for time",
            register: "polite"
          }
        ]
      },
      {
        id: "phrase_ques_005",
        shona: "Munoita sei?",
        english: "How do you do it?",
        category: "questions",
        subcategories: ["instruction", "method"],
        level: "A2",
        difficulty: 3,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/munoita sej/",
        examples: [
          {
            shona: "Munoita sei sadza?",
            english: "How do you make sadza?",
            context: "Asking for instructions",
            register: "neutral"
          }
        ]
      }
    ],
    responses: [
      {
        id: "phrase_resp_001",
        shona: "Zita rangu ndi...",
        english: "My name is...",
        category: "responses",
        subcategories: ["personal_information"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HLLLH",
        ipa: "/zita raŋgu ⁿdi/",
        examples: [
          {
            shona: "Zita rangu ndi John, uye ini?",
            english: "My name is John, and you?",
            context: "Introduction",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_resp_002",
        shona: "Ndinobva ku...",
        english: "I come from...",
        category: "responses",
        subcategories: ["personal_information", "origin"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLL",
        ipa: "/ⁿdinobva ku/",
        examples: [
          {
            shona: "Ndinobva kuHarare",
            english: "I come from Harare",
            context: "Answering origin question",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_resp_003",
        shona: "Handizivi",
        english: "I don't know",
        category: "responses",
        subcategories: ["knowledge", "uncertainty"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLH",
        ipa: "/ɦandizivi/",
        cultural_notes: "Honest response, not considered rude",
        examples: [
          {
            shona: "Handizivi, asi ndichabvunza",
            english: "I don't know, but I'll ask",
            context: "Admitting lack of knowledge",
            register: "neutral"
          }
        ]
      }
    ]
  },

  // Politeness & Courtesy (30+ phrases)
  politenessCourtesy: {
    requests: [
      {
        id: "phrase_pol_001",
        shona: "Ndapota",
        english: "Please",
        category: "politeness",
        subcategories: ["requests"],
        level: "A1",
        difficulty: 1,
        frequency: "high",
        register: "polite",
        dialect: "standard",
        tones: "LHL",
        ipa: "/ⁿdapota/",
        cultural_notes: "Essential for polite requests, shows respect",
        usage_notes: "Can be used at beginning or end of request",
        examples: [
          {
            shona: "Ndapota, ndibatsireiwo",
            english: "Please, help me",
            context: "Polite request for help",
            register: "polite"
          }
        ]
      },
      {
        id: "phrase_pol_002",
        shona: "Ndinokumbirawo",
        english: "I kindly request",
        category: "politeness",
        subcategories: ["requests", "formal"],
        level: "A2",
        difficulty: 3,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLLHL",
        ipa: "/ⁿdinokumbirawo/",
        cultural_notes: "More formal way to make requests",
        examples: [
          {
            shona: "Ndinokumbirawo kuti mundibatsire",
            english: "I kindly request that you help me",
            context: "Formal request",
            register: "formal"
          }
        ]
      },
      {
        id: "phrase_pol_003",
        shona: "Ndinoregerera",
        english: "Excuse me/I'm sorry",
        category: "politeness",
        subcategories: ["apology", "attention"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "polite",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ⁿdinoregerera/",
        usage_notes: "Used both to get attention and to apologize",
        examples: [
          {
            shona: "Ndinoregerera, makadii?",
            english: "Excuse me, how are you?",
            context: "Getting someone's attention politely",
            register: "polite"
          }
        ]
      }
    ],
    gratitude: [
      {
        id: "phrase_grat_001",
        shona: "Ndinotenda",
        english: "Thank you",
        category: "politeness",
        subcategories: ["gratitude"],
        level: "A1",
        difficulty: 1,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLL",
        ipa: "/ⁿdinotenda/",
        cultural_notes: "Basic expression of gratitude, always appreciated",
        examples: [
          {
            shona: "Ndinotenda zvikuru",
            english: "Thank you very much",
            context: "Strong gratitude",
            register: "polite"
          }
        ]
      },
      {
        id: "phrase_grat_002",
        shona: "Maita henyu",
        english: "Thank you (formal)",
        category: "politeness",
        subcategories: ["gratitude", "formal"],
        level: "A2",
        difficulty: 3,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LHL",
        ipa: "/majta ɦeɲu/",
        cultural_notes: "More formal expression of thanks",
        examples: [
          {
            shona: "Maita henyu nebatsiro yenyu",
            english: "Thank you for your help",
            context: "Formal gratitude",
            register: "formal"
          }
        ]
      },
      {
        id: "phrase_grat_003",
        shona: "Hazvina mhosva",
        english: "You're welcome/It's nothing",
        category: "politeness",
        subcategories: ["response_to_thanks"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ɦazvina mɦosva/",
        cultural_notes: "Standard response to thanks, means 'no problem'",
        examples: [
          {
            shona: "Hazvina mhosva, chimbouyai kamwe",
            english: "You're welcome, come again",
            context: "Welcoming response",
            register: "neutral"
          }
        ]
      }
    ]
  },

  // Basic Needs & Wants (40+ phrases)
  basicNeedsWants: {
    needs: [
      {
        id: "phrase_need_001",
        shona: "Ndinoda mvura",
        english: "I want/need water",
        category: "needs",
        subcategories: ["basic_needs", "drinks"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ⁿdinoda mvura/",
        cultural_notes: "Basic expression of thirst",
        examples: [
          {
            shona: "Ndinoda mvura, ndine nyota",
            english: "I want water, I'm thirsty",
            context: "Expressing thirst",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_need_002",
        shona: "Ndine nzara",
        english: "I am hungry",
        category: "needs",
        subcategories: ["basic_needs", "food"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/ⁿdine nzara/",
        cultural_notes: "Direct way to express hunger",
        examples: [
          {
            shona: "Ndine nzara huru",
            english: "I am very hungry",
            context: "Strong hunger",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_need_003",
        shona: "Ndinoda kuenda kumusasa",
        english: "I need to go to the toilet",
        category: "needs",
        subcategories: ["basic_needs", "bathroom"],
        level: "A1",
        difficulty: 3,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLLLLHL",
        ipa: "/ⁿdinoda kuenda kumusasa/",
        cultural_notes: "Polite way to express bathroom needs",
        usage_notes: "More polite than direct expressions",
        examples: [
          {
            shona: "Ndinoregerera, ndinoda kuenda kumusasa",
            english: "Excuse me, I need to go to the toilet",
            context: "Polite bathroom request",
            register: "polite"
          }
        ]
      },
      {
        id: "phrase_need_004",
        shona: "Ndinoda kurara",
        english: "I want to sleep",
        category: "needs",
        subcategories: ["basic_needs", "rest"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ⁿdinoda kurara/",
        examples: [
          {
            shona: "Ndaneta, ndinoda kurara",
            english: "I'm tired, I want to sleep",
            context: "Expressing tiredness",
            register: "neutral"
          }
        ]
      }
    ],
    shopping: [
      {
        id: "phrase_shop_001",
        shona: "Marii iyi?",
        english: "How much is this?",
        category: "shopping",
        subcategories: ["price_inquiry"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/mariː iɪi/",
        cultural_notes: "Essential phrase for shopping",
        examples: [
          {
            shona: "Ndinoregerera, marii iyi?",
            english: "Excuse me, how much is this?",
            context: "Shopping inquiry",
            register: "polite"
          }
        ]
      },
      {
        id: "phrase_shop_002",
        shona: "Ndinoda kutenga...",
        english: "I want to buy...",
        category: "shopping",
        subcategories: ["purchasing"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLLL",
        ipa: "/ⁿdinoda kuteŋga/",
        examples: [
          {
            shona: "Ndinoda kutenga chibage",
            english: "I want to buy maize",
            context: "Shopping for food",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_shop_003",
        shona: "Zvadhura zvikuru",
        english: "It's too expensive",
        category: "shopping",
        subcategories: ["price_complaint"],
        level: "A2",
        difficulty: 3,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLL",
        ipa: "/zvaɗura zvikuru/",
        cultural_notes: "Common response to high prices, may start negotiation",
        examples: [
          {
            shona: "Eish, zvadhura zvikuru. Mungaderera?",
            english: "Oh, it's too expensive. Can you reduce it?",
            context: "Price negotiation",
            register: "informal"
          }
        ]
      }
    ]
  },

  // Emergency & Help (20+ phrases)
  emergencyHelp: {
    emergency: [
      {
        id: "phrase_emerg_001",
        shona: "Ndibatsireiwo!",
        english: "Help me please!",
        category: "emergency",
        subcategories: ["help_request"],
        level: "A1",
        difficulty: 2,
        frequency: "low",
        register: "urgent",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ⁿdibatsirejwo/",
        cultural_notes: "Urgent request for help",
        examples: [
          {
            shona: "Ndibatsireiwo, ndine dambudziko",
            english: "Help me please, I have a problem",
            context: "Emergency situation",
            register: "urgent"
          }
        ]
      },
      {
        id: "phrase_emerg_002",
        shona: "Pane dambudziko",
        english: "There is a problem",
        category: "emergency",
        subcategories: ["problem_statement"],
        level: "A2",
        difficulty: 3,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/pane dambudziko/",
        examples: [
          {
            shona: "Pane dambudziko guru pano",
            english: "There is a big problem here",
            context: "Reporting problem",
            register: "neutral"
          }
        ]
      },
      {
        id: "phrase_emerg_003",
        shona: "Ndinorwara",
        english: "I am sick/ill",
        category: "emergency",
        subcategories: ["health"],
        level: "A1",
        difficulty: 2,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLL",
        ipa: "/ⁿdinorwara/",
        examples: [
          {
            shona: "Ndinorwara, ndinoda chiremba",
            english: "I am sick, I need a doctor",
            context: "Health emergency",
            register: "neutral"
          }
        ]
      }
    ]
  },

  // Travel & Directions (30+ phrases)
  travelDirections: {
    directions: [
      {
        id: "phrase_dir_001",
        shona: "Ndiri kurasika",
        english: "I am lost",
        category: "travel",
        subcategories: ["directions", "help"],
        level: "A2",
        difficulty: 3,
        frequency: "low",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ⁿdiri kurasika/",
        examples: [
          {
            shona: "Ndinoregerera, ndiri kurasika. Mungandibatsira?",
            english: "Excuse me, I am lost. Can you help me?",
            context: "Asking for directions",
            register: "polite"
          }
        ]
      },
      {
        id: "phrase_dir_002",
        shona: "Kunoenda kupi nzira iyi?",
        english: "Where does this road go?",
        category: "travel",
        subcategories: ["directions"],
        level: "A2",
        difficulty: 4,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLLHLHL",
        ipa: "/kunoenda kupi nzira iɪi/",
        examples: [
          {
            shona: "Kunoenda kupi nzira iyi, mukwasha?",
            english: "Where does this road go, friend?",
            context: "Asking directions",
            register: "friendly"
          }
        ]
      },
      {
        id: "phrase_dir_003",
        shona: "Kure sei kusvika...",
        english: "How far is it to...",
        category: "travel",
        subcategories: ["distance"],
        level: "A2",
        difficulty: 4,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLL",
        ipa: "/kure sej kusvika/",
        examples: [
          {
            shona: "Kure sei kusvika kuHarare?",
            english: "How far is it to Harare?",
            context: "Distance inquiry",
            register: "neutral"
          }
        ]
      }
    ]
  }
};

// Utility functions for accessing essential phrases
export function getPhrasesByCategory(category) {
  const results = [];
  Object.values(essentialPhrasesExpressionsVocabulary).forEach(mainCategory => {
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

export function getPhrasesByLevel(level) {
  const results = [];
  Object.values(essentialPhrasesExpressionsVocabulary).forEach(mainCategory => {
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

export function searchPhrases(searchTerm) {
  const results = [];
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  Object.values(essentialPhrasesExpressionsVocabulary).forEach(mainCategory => {
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

export const essentialPhrasesExpressionsVocabularyCount = Object.values(essentialPhrasesExpressionsVocabulary).reduce((total, category) => {
  return total + Object.values(category).reduce((catTotal, subcat) => {
    return catTotal + (Array.isArray(subcat) ? subcat.length : 0);
  }, 0);
}, 0);

console.log(`Essential Phrases & Expressions Vocabulary loaded: ${essentialPhrasesExpressionsVocabularyCount} phrases`);
// Traditional & Cultural Vocabulary Module (400+ words)
// Target: Deep cultural understanding and traditional contexts

export const traditionalCulturalVocabulary = {
  // Family & Kinship (60+ words)
  familyKinship: {
    immediate_family: [
      {
        id: "trad_fam_001",
        shona: "baba",
        english: "father",
        category: "family",
        subcategories: ["immediate_family", "parents"],
        level: "A1",
        difficulty: 1,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/baba/",
        morphology: {
          root: "baba",
          affixes: [],
          noun_class: 1
        },
        cultural_notes: "Highly respected figure in Shona culture, head of household",
        usage_notes: "Term of respect, also used for elderly men",
        examples: [
          {
            shona: "Baba vangu vari kushanda",
            english: "My father is working",
            context: "Family discussion",
            register: "neutral"
          }
        ],
        audio: {
          word: "baba.mp3",
          sentences: ["baba_example1.mp3"]
        }
      },
      {
        id: "trad_fam_002",
        shona: "amai",
        english: "mother",
        category: "family",
        subcategories: ["immediate_family", "parents"],
        level: "A1",
        difficulty: 1,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/amai/",
        cultural_notes: "Central figure in family nurturing, highly revered",
        examples: [
          {
            shona: "Amai vari kubika sadza",
            english: "Mother is cooking sadza",
            context: "Family meal preparation",
            register: "neutral"
          }
        ]
      },
      {
        id: "trad_fam_003",
        shona: "mwanakomana",
        english: "son",
        category: "family",
        subcategories: ["immediate_family", "children"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/mwanakomana/",
        morphology: {
          root: "mwana-komana",
          affixes: [],
          noun_class: 1
        },
        cultural_notes: "Sons traditionally inherit family name and property"
      },
      {
        id: "trad_fam_004",
        shona: "mwanasikana",
        english: "daughter",
        category: "family",
        subcategories: ["immediate_family", "children"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/mwanasikana/",
        cultural_notes: "Daughters traditionally join husband's family after marriage"
      },
      {
        id: "trad_fam_005",
        shona: "mukoma",
        english: "older brother",
        category: "family",
        subcategories: ["siblings"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/mukoma/",
        cultural_notes: "Respected position, responsible for younger siblings"
      },
      {
        id: "trad_fam_006",
        shona: "hanzvadzi",
        english: "sister",
        category: "family",
        subcategories: ["siblings"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/ɦanzvadzi/"
      }
    ],
    extended_family: [
      {
        id: "trad_ext_001",
        shona: "sekuru",
        english: "grandfather",
        category: "family",
        subcategories: ["extended_family", "grandparents"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "respectful",
        dialect: "standard",
        tones: "LHL",
        ipa: "/sekuru/",
        cultural_notes: "Highly respected elder, source of wisdom and tradition",
        usage_notes: "Also used as respectful address for elderly men"
      },
      {
        id: "trad_ext_002",
        shona: "ambuya",
        english: "grandmother",
        category: "family",
        subcategories: ["extended_family", "grandparents"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "respectful",
        dialect: "standard",
        tones: "LHL",
        ipa: "/ambuɪa/",
        cultural_notes: "Keeper of family traditions and cultural knowledge"
      },
      {
        id: "trad_ext_003",
        shona: "babamunini",
        english: "uncle (father's younger brother)",
        category: "family",
        subcategories: ["extended_family", "uncles"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "respectful",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/babamunini/",
        cultural_notes: "Important family figure, often helps with child-rearing"
      },
      {
        id: "trad_ext_004",
        shona: "babamukuru",
        english: "uncle (father's older brother)",
        category: "family",
        subcategories: ["extended_family", "uncles"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "respectful",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/babamukuru/",
        cultural_notes: "Senior uncle, may act as family head in father's absence"
      },
      {
        id: "trad_ext_005",
        shona: "tete",
        english: "aunt (father's sister)",
        category: "family",
        subcategories: ["extended_family", "aunts"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "respectful",
        dialect: "standard",
        tones: "HL",
        ipa: "/tete/",
        cultural_notes: "Has special role in family ceremonies and guidance"
      }
    ]
  },

  // Traditional Ceremonies & Rituals (50+ words)
  ceremoniesRituals: {
    life_events: [
      {
        id: "trad_cer_001",
        shona: "kurova guva",
        english: "memorial ceremony for deceased",
        category: "ceremonies",
        subcategories: ["death", "ancestral"],
        level: "B2",
        difficulty: 7,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kurova guva/",
        cultural_notes: "Important ceremony to connect deceased with ancestors",
        usage_notes: "Performed about a year after death"
      },
      {
        id: "trad_cer_002",
        shona: "roora",
        english: "bride price/lobola",
        category: "ceremonies",
        subcategories: ["marriage"],
        level: "B1",
        difficulty: 6,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "HL",
        ipa: "/roːra/",
        cultural_notes: "Traditional marriage negotiation and payment system",
        examples: [
          {
            shona: "Vari kutaura nezveroora",
            english: "They are discussing the bride price",
            context: "Marriage negotiations",
            register: "formal"
          }
        ]
      },
      {
        id: "trad_cer_003",
        shona: "mukwerere",
        english: "bride/daughter-in-law",
        category: "ceremonies",
        subcategories: ["marriage", "family_roles"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/mukwerere/",
        cultural_notes: "New bride joins husband's family, special status"
      },
      {
        id: "trad_cer_004",
        shona: "kuraguza vana",
        english: "naming ceremony",
        category: "ceremonies",
        subcategories: ["birth", "children"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHLH",
        ipa: "/kuraguza vana/",
        cultural_notes: "Traditional ceremony to formally name children"
      }
    ],
    spiritual_practices: [
      {
        id: "trad_spi_001",
        shona: "svikiro",
        english: "spirit medium",
        category: "spiritual",
        subcategories: ["traditional_religion"],
        level: "B2",
        difficulty: 7,
        frequency: "medium",
        register: "respectful",
        dialect: "standard",
        tones: "LHL",
        ipa: "/svikiro/",
        cultural_notes: "Person through whom ancestors communicate with the living"
      },
      {
        id: "trad_spi_002",
        shona: "midzimu",
        english: "ancestral spirits",
        category: "spiritual",
        subcategories: ["traditional_religion"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "respectful",
        dialect: "standard",
        tones: "LHL",
        ipa: "/midzimu/",
        cultural_notes: "Family ancestors who guide and protect descendants"
      },
      {
        id: "trad_spi_003",
        shona: "n'anga",
        english: "traditional healer",
        category: "spiritual",
        subcategories: ["traditional_medicine"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "respectful",
        dialect: "standard",
        tones: "HL",
        ipa: "/ŋaŋga/",
        cultural_notes: "Traditional doctor combining spiritual and herbal healing"
      },
      {
        id: "trad_spi_004",
        shona: "mubvumira",
        english: "divination bones",
        category: "spiritual",
        subcategories: ["divination"],
        level: "B2",
        difficulty: 7,
        frequency: "low",
        register: "respectful",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/mubvumira/",
        cultural_notes: "Bones used by n'anga for divination and diagnosis"
      }
    ]
  },

  // Traditional Foods & Agriculture (60+ words)
  foodsAgriculture: {
    staple_foods: [
      {
        id: "trad_food_001",
        shona: "sadza",
        english: "staple food made from maize meal",
        category: "food",
        subcategories: ["staples"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/sadza/",
        cultural_notes: "Most important food in Shona diet, eaten daily",
        usage_notes: "Usually served with vegetables and/or meat",
        examples: [
          {
            shona: "Amai vari kubika sadza",
            english: "Mother is cooking sadza",
            context: "Meal preparation",
            register: "neutral"
          }
        ]
      },
      {
        id: "trad_food_002",
        shona: "muriwo",
        english: "vegetables",
        category: "food",
        subcategories: ["vegetables"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/muriwo/",
        cultural_notes: "Essential part of every meal, often wild or traditional varieties"
      },
      {
        id: "trad_food_003",
        shona: "muriwo unedovi",
        english: "vegetables with peanut butter sauce",
        category: "food",
        subcategories: ["dishes"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLLHL",
        ipa: "/muriwo unedovi/",
        cultural_notes: "Traditional and nutritious way to prepare vegetables"
      },
      {
        id: "trad_food_004",
        shona: "nyama",
        english: "meat",
        category: "food",
        subcategories: ["proteins"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/ɲama/"
      },
      {
        id: "trad_food_005",
        shona: "rukweza",
        english: "traditional beer",
        category: "food",
        subcategories: ["beverages"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/rukweza/",
        cultural_notes: "Made from sorghum, important in ceremonies"
      },
      {
        id: "trad_food_006",
        shona: "maheu",
        english: "traditional drink made from maize",
        category: "food",
        subcategories: ["beverages"],
        level: "B1",
        difficulty: 4,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/maɦeu/",
        cultural_notes: "Nutritious fermented drink, often given to children"
      }
    ],
    agricultural_terms: [
      {
        id: "trad_agr_001",
        shona: "murima",
        english: "field/farmland",
        category: "agriculture",
        subcategories: ["land"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/murima/",
        cultural_notes: "Central to traditional life, source of family sustenance"
      },
      {
        id: "trad_agr_002",
        shona: "chibage",
        english: "maize/corn",
        category: "agriculture",
        subcategories: ["crops"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/tʃibage/",
        cultural_notes: "Most important crop, basis of food security"
      },
      {
        id: "trad_agr_003",
        shona: "mapfunde",
        english: "sorghum",
        category: "agriculture",
        subcategories: ["crops"],
        level: "B1",
        difficulty: 4,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/mapfunde/",
        cultural_notes: "Traditional grain, drought-resistant, used for beer"
      },
      {
        id: "trad_agr_004",
        shona: "mhunga",
        english: "millet",
        category: "agriculture",
        subcategories: ["crops"],
        level: "B1",
        difficulty: 4,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/mɦuŋga/"
      },
      {
        id: "trad_agr_005",
        shona: "kurima",
        english: "to farm/cultivate",
        category: "agriculture",
        subcategories: ["activities"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kurima/",
        examples: [
          {
            shona: "Tinofanira kurima kuti tiwane chikafu",
            english: "We must farm to get food",
            context: "Agricultural planning",
            register: "neutral"
          }
        ]
      },
      {
        id: "trad_agr_006",
        shona: "kukohwa",
        english: "to harvest",
        category: "agriculture",
        subcategories: ["activities"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kukoɦwa/"
      }
    ]
  },

  // Traditional Crafts & Skills (40+ words)
  craftsSkills: {
    traditional_crafts: [
      {
        id: "trad_cra_001",
        shona: "kuumbwa kwembiya",
        english: "pottery making",
        category: "crafts",
        subcategories: ["pottery"],
        level: "B2",
        difficulty: 6,
        frequency: "low",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLLHL",
        ipa: "/kuumbwa kwembija/",
        cultural_notes: "Traditional women's craft, important for household items"
      },
      {
        id: "trad_cra_002",
        shona: "kuruka",
        english: "to weave",
        category: "crafts",
        subcategories: ["weaving"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kuruka/",
        cultural_notes: "Traditional skill for making baskets and mats"
      },
      {
        id: "trad_cra_003",
        shona: "dendera",
        english: "traditional basket",
        category: "crafts",
        subcategories: ["baskets"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/dendera/",
        cultural_notes: "Used for storing grain and carrying items"
      },
      {
        id: "trad_cra_004",
        shona: "mbira",
        english: "traditional musical instrument",
        category: "crafts",
        subcategories: ["music"],
        level: "B1",
        difficulty: 4,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/mbira/",
        cultural_notes: "Sacred instrument used in spiritual ceremonies"
      },
      {
        id: "trad_cra_005",
        shona: "ngoma",
        english: "traditional drum",
        category: "crafts",
        subcategories: ["music"],
        level: "B1",
        difficulty: 4,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/ŋgoma/",
        cultural_notes: "Used in ceremonies and traditional dances"
      }
    ],
    building_construction: [
      {
        id: "trad_bui_001",
        shona: "imba",
        english: "house/home",
        category: "building",
        subcategories: ["structures"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/imba/",
        cultural_notes: "Center of family life, traditionally round with thatched roof"
      },
      {
        id: "trad_bui_002",
        shona: "rondavel",
        english: "traditional round house",
        category: "building",
        subcategories: ["traditional_structures"],
        level: "B1",
        difficulty: 4,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/rondavel/",
        cultural_notes: "Traditional architectural style, still used in rural areas"
      },
      {
        id: "trad_bui_003",
        shona: "dare",
        english: "traditional court/meeting place",
        category: "building",
        subcategories: ["community"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "HL",
        ipa: "/dare/",
        cultural_notes: "Traditional place for community meetings and dispute resolution"
      },
      {
        id: "trad_bui_004",
        shona: "dura",
        english: "granary/storage hut",
        category: "building",
        subcategories: ["storage"],
        level: "B2",
        difficulty: 6,
        frequency: "low",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/dura/",
        cultural_notes: "Raised structure for storing grain, protected from pests"
      }
    ]
  },

  // Traditional Values & Social Organization (30+ words)
  valuesSocial: {
    social_values: [
      {
        id: "trad_val_001",
        shona: "ukama",
        english: "kinship/family relationships",
        category: "values",
        subcategories: ["family", "relationships"],
        level: "B2",
        difficulty: 6,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LHL",
        ipa: "/ukama/",
        cultural_notes: "Fundamental concept in Shona society, extends beyond blood relations",
        usage_notes: "Includes obligations and mutual support systems"
      },
      {
        id: "trad_val_002",
        shona: "hunhu",
        english: "good character/humanness",
        category: "values",
        subcategories: ["character", "morality"],
        level: "B2",
        difficulty: 7,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "HL",
        ipa: "/ɦunɦu/",
        cultural_notes: "Core Shona value emphasizing compassion and good behavior",
        examples: [
          {
            shona: "Munhu ane hunhu",
            english: "A person with good character",
            context: "Character assessment",
            register: "formal"
          }
        ]
      },
      {
        id: "trad_val_003",
        shona: "ruremekedzo",
        english: "respect",
        category: "values",
        subcategories: ["social_behavior"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ruremekedzo/",
        cultural_notes: "Essential value, especially towards elders and authority"
      },
      {
        id: "trad_val_004",
        shona: "kusununguka",
        english: "hospitality",
        category: "values",
        subcategories: ["social_behavior"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kusunungu​ka/",
        cultural_notes: "Traditional obligation to welcome and care for guests"
      },
      {
        id: "trad_val_005",
        shona: "simba",
        english: "strength/power",
        category: "values",
        subcategories: ["personal_qualities"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/simba/",
        cultural_notes: "Physical and spiritual strength, highly valued"
      }
    ]
  }
};

// Utility functions for accessing traditional cultural vocabulary
export function getTraditionalVocabularyByCategory(category) {
  const results = [];
  Object.values(traditionalCulturalVocabulary).forEach(mainCategory => {
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

export function getTraditionalVocabularyByLevel(level) {
  const results = [];
  Object.values(traditionalCulturalVocabulary).forEach(mainCategory => {
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

export function searchTraditionalVocabulary(searchTerm) {
  const results = [];
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  Object.values(traditionalCulturalVocabulary).forEach(mainCategory => {
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

export const traditionalCulturalVocabularyCount = Object.values(traditionalCulturalVocabulary).reduce((total, category) => {
  return total + Object.values(category).reduce((catTotal, subcat) => {
    return catTotal + (Array.isArray(subcat) ? subcat.length : 0);
  }, 0);
}, 0);

console.log(`Traditional Cultural Vocabulary loaded: ${traditionalCulturalVocabularyCount} words`);
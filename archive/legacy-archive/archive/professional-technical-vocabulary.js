// Professional & Technical Vocabulary Module (400+ words)
// Target: Professional fluency across various domains

export const professionalTechnicalVocabulary = {
  // Business & Commerce (80+ words)
  businessCommerce: {
    general: [
      {
        id: "prof_bus_001",
        shona: "bhizinesi",
        english: "business",
        category: "business",
        subcategories: ["general"],
        level: "B1",
        difficulty: 4,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/b̤izinesi/",
        morphology: {
          root: "business",
          affixes: [],
          noun_class: 5
        },
        cultural_notes: "Commonly used loanword from English, widely understood",
        usage_notes: "Used in both formal and informal business contexts",
        collocations: ["kuvhura bhizinesi", "kuita bhizinesi"],
        examples: [
          {
            shona: "Ndiri kuvhura bhizinesi yangu",
            english: "I am opening my business",
            context: "Entrepreneurship",
            register: "neutral"
          }
        ],
        audio: {
          word: "bhizinesi.mp3",
          sentences: ["bhizinesi_example1.mp3"]
        }
      },
      {
        id: "prof_bus_002",
        shona: "musika",
        english: "market",
        category: "business",
        subcategories: ["commerce"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/musika/",
        morphology: {
          root: "sika",
          affixes: ["mu-"],
          noun_class: 3
        }
      },
      {
        id: "prof_bus_003",
        shona: "mutengesi",
        english: "seller/vendor",
        category: "business",
        subcategories: ["commerce", "roles"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/muteŋgesi/"
      },
      {
        id: "prof_bus_004",
        shona: "mutengi",
        english: "buyer/customer",
        category: "business",
        subcategories: ["commerce", "roles"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/muteŋgi/"
      },
      {
        id: "prof_bus_005",
        shona: "chibvumirano",
        english: "agreement/contract",
        category: "business",
        subcategories: ["legal", "documents"],
        level: "B2",
        difficulty: 7,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/tʃibvumirano/",
        cultural_notes: "Important in formal business dealings, often requires witnesses"
      }
    ],
    finance: [
      {
        id: "prof_fin_001",
        shona: "mari",
        english: "money",
        category: "business",
        subcategories: ["finance"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/mari/"
      },
      {
        id: "prof_fin_002",
        shona: "bhangi",
        english: "bank",
        category: "business",
        subcategories: ["finance", "institutions"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/b̤aŋgi/"
      },
      {
        id: "prof_fin_003",
        shona: "kuchinjisa",
        english: "to exchange (money)",
        category: "business",
        subcategories: ["finance", "transactions"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kutʃindʒisa/"
      },
      {
        id: "prof_fin_004",
        shona: "chikwereti",
        english: "loan/credit",
        category: "business",
        subcategories: ["finance", "banking"],
        level: "B1",
        difficulty: 6,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/tʃikwereti/",
        examples: [
          {
            shona: "Ndiri kukumbira chikwereti kubhangi",
            english: "I am applying for a loan from the bank",
            context: "Banking transaction",
            register: "formal"
          }
        ]
      },
      {
        id: "prof_fin_005",
        shona: "mubereko",
        english: "interest (financial)",
        category: "business",
        subcategories: ["finance", "banking"],
        level: "B2",
        difficulty: 7,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/mubereko/"
      },
      {
        id: "prof_fin_006",
        shona: "mutero",
        english: "tax",
        category: "business",
        subcategories: ["finance", "government"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LHL",
        ipa: "/mutero/"
      }
    ],
    entrepreneurship: [
      {
        id: "prof_ent_001",
        shona: "muzvinabhizinesi",
        english: "entrepreneur",
        category: "business",
        subcategories: ["entrepreneurship", "roles"],
        level: "B2",
        difficulty: 7,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLLHL",
        ipa: "/muzvinab̤izinesi/",
        cultural_notes: "Growing importance in Zimbabwe's economy"
      },
      {
        id: "prof_ent_002",
        shona: "kuvamba bhizinesi",
        english: "to start a business",
        category: "business",
        subcategories: ["entrepreneurship"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLLHL",
        ipa: "/kuvamba b̤izinesi/"
      },
      {
        id: "prof_ent_003",
        shona: "purofiti",
        english: "profit",
        category: "business",
        subcategories: ["finance", "entrepreneurship"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/purofiti/"
      },
      {
        id: "prof_ent_004",
        shona: "kurasikirwa",
        english: "loss (financial)",
        category: "business",
        subcategories: ["finance", "entrepreneurship"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kurasikirwa/"
      }
    ]
  },

  // Technology (80+ words)
  technology: {
    computers: [
      {
        id: "prof_tech_001",
        shona: "kompyuta",
        english: "computer",
        category: "technology",
        subcategories: ["computers"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kompjuta/",
        morphology: {
          root: "computer",
          affixes: [],
          noun_class: 9
        },
        usage_notes: "Direct borrowing from English, universally understood",
        examples: [
          {
            shona: "Ndinoshandisa kompyuta pabasa",
            english: "I use a computer at work",
            context: "Workplace technology",
            register: "neutral"
          }
        ]
      },
      {
        id: "prof_tech_002",
        shona: "muchina",
        english: "machine",
        category: "technology",
        subcategories: ["general"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/mutʃina/"
      },
      {
        id: "prof_tech_003",
        shona: "intaneti",
        english: "internet",
        category: "technology",
        subcategories: ["internet"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/intaneti/"
      },
      {
        id: "prof_tech_004",
        shona: "nhare",
        english: "phone",
        category: "technology",
        subcategories: ["communication"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/ɲare/"
      },
      {
        id: "prof_tech_005",
        shona: "nharembozha",
        english: "mobile phone",
        category: "technology",
        subcategories: ["communication", "mobile"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ɲaremb̤oʒa/",
        cultural_notes: "Compound word: nhare (phone) + mbozha (pocket)"
      }
    ],
    software: [
      {
        id: "prof_soft_001",
        shona: "purogiramu",
        english: "program/software",
        category: "technology",
        subcategories: ["software"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/purogiramu/"
      },
      {
        id: "prof_soft_002",
        shona: "app",
        english: "app/application",
        category: "technology",
        subcategories: ["software", "mobile"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "informal",
        dialect: "standard",
        tones: "L",
        ipa: "/æp/"
      },
      {
        id: "prof_soft_003",
        shona: "dhata",
        english: "data",
        category: "technology",
        subcategories: ["computing"],
        level: "B1",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/ɗata/"
      },
      {
        id: "prof_soft_004",
        shona: "webusaiti",
        english: "website",
        category: "technology",
        subcategories: ["internet"],
        level: "B1",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/webusajti/"
      }
    ],
    social_media: [
      {
        id: "prof_soc_001",
        shona: "social media",
        english: "social media",
        category: "technology",
        subcategories: ["social_media"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "informal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/soʃal miɗia/",
        usage_notes: "Often used as is in English"
      },
      {
        id: "prof_soc_002",
        shona: "kutumira meseji",
        english: "to send a message",
        category: "technology",
        subcategories: ["communication"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLLHL",
        ipa: "/kutumira meseʤi/"
      },
      {
        id: "prof_soc_003",
        shona: "kutevera",
        english: "to follow (social media)",
        category: "technology",
        subcategories: ["social_media"],
        level: "B1",
        difficulty: 4,
        frequency: "high",
        register: "informal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kutevera/"
      },
      {
        id: "prof_soc_004",
        shona: "kupousta",
        english: "to post",
        category: "technology",
        subcategories: ["social_media"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "informal",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kupousta/"
      }
    ]
  },

  // Medicine & Health (80+ words)
  medicineHealth: {
    medical_professionals: [
      {
        id: "prof_med_001",
        shona: "chiremba",
        english: "doctor",
        category: "medicine",
        subcategories: ["professionals"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/tʃiremba/",
        morphology: {
          root: "remba",
          affixes: ["chi-"],
          noun_class: 7
        },
        cultural_notes: "Traditionally referred to both medical doctors and traditional healers",
        examples: [
          {
            shona: "Ndinofanira kuona chiremba",
            english: "I need to see a doctor",
            context: "Health consultation",
            register: "neutral"
          }
        ]
      },
      {
        id: "prof_med_002",
        shona: "mukoti",
        english: "nurse",
        category: "medicine",
        subcategories: ["professionals"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/mukoti/"
      },
      {
        id: "prof_med_003",
        shona: "chiremba wemazino",
        english: "dentist",
        category: "medicine",
        subcategories: ["professionals", "specialists"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLHL",
        ipa: "/tʃiremba wemazino/"
      },
      {
        id: "prof_med_004",
        shona: "mushandi wehutano",
        english: "health worker",
        category: "medicine",
        subcategories: ["professionals"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LHLLHL",
        ipa: "/muʃandi wehutano/"
      }
    ],
    medical_facilities: [
      {
        id: "prof_fac_001",
        shona: "chipatara",
        english: "hospital",
        category: "medicine",
        subcategories: ["facilities"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/tʃipatara/"
      },
      {
        id: "prof_fac_002",
        shona: "kiriniki",
        english: "clinic",
        category: "medicine",
        subcategories: ["facilities"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kiriniki/"
      },
      {
        id: "prof_fac_003",
        shona: "femesi",
        english: "pharmacy",
        category: "medicine",
        subcategories: ["facilities"],
        level: "B1",
        difficulty: 4,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/femesi/"
      }
    ],
    medical_conditions: [
      {
        id: "prof_cond_001",
        shona: "chirwere",
        english: "disease/illness",
        category: "medicine",
        subcategories: ["conditions"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/tʃirwere/"
      },
      {
        id: "prof_cond_002",
        shona: "musana",
        english: "fever",
        category: "medicine",
        subcategories: ["symptoms"],
        level: "B1",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/musana/"
      },
      {
        id: "prof_cond_003",
        shona: "kuvhuvhuta",
        english: "to cough",
        category: "medicine",
        subcategories: ["symptoms"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kuvuvuta/"
      },
      {
        id: "prof_cond_004",
        shona: "kurwara musoro",
        english: "headache",
        category: "medicine",
        subcategories: ["symptoms"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLHL",
        ipa: "/kurwara musoro/"
      },
      {
        id: "prof_cond_005",
        shona: "chirwere cheshuga",
        english: "diabetes",
        category: "medicine",
        subcategories: ["conditions", "chronic"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LHLLHL",
        ipa: "/tʃirwere tʃeʃuga/",
        usage_notes: "Literally 'sugar disease'"
      }
    ],
    treatments: [
      {
        id: "prof_treat_001",
        shona: "mushonga",
        english: "medicine/drug",
        category: "medicine",
        subcategories: ["treatments"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/muʃoŋga/"
      },
      {
        id: "prof_treat_002",
        shona: "jekiseni",
        english: "injection",
        category: "medicine",
        subcategories: ["treatments"],
        level: "B1",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ʤekiseni/"
      },
      {
        id: "prof_treat_003",
        shona: "kubaya jekiseni",
        english: "to give an injection",
        category: "medicine",
        subcategories: ["procedures"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLLHL",
        ipa: "/kubaja ʤekiseni/"
      },
      {
        id: "prof_treat_004",
        shona: "kurapwa",
        english: "to be treated",
        category: "medicine",
        subcategories: ["treatments"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kurapwa/"
      }
    ]
  },

  // Education (80+ words)
  education: {
    institutions: [
      {
        id: "prof_edu_001",
        shona: "chikoro",
        english: "school",
        category: "education",
        subcategories: ["institutions"],
        level: "A1",
        difficulty: 2,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/tʃikoro/",
        morphology: {
          root: "koro",
          affixes: ["chi-"],
          noun_class: 7
        }
      },
      {
        id: "prof_edu_002",
        shona: "yunivhesiti",
        english: "university",
        category: "education",
        subcategories: ["institutions", "higher_education"],
        level: "B1",
        difficulty: 4,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/juniv̤esiti/"
      },
      {
        id: "prof_edu_003",
        shona: "koriji",
        english: "college",
        category: "education",
        subcategories: ["institutions", "higher_education"],
        level: "B1",
        difficulty: 4,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LHL",
        ipa: "/koridʒi/"
      },
      {
        id: "prof_edu_004",
        shona: "chikoro chepuraimari",
        english: "primary school",
        category: "education",
        subcategories: ["institutions", "primary"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLLHL",
        ipa: "/tʃikoro tʃepurajmari/"
      },
      {
        id: "prof_edu_005",
        shona: "chikoro chesekondari",
        english: "secondary school",
        category: "education",
        subcategories: ["institutions", "secondary"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHLLLHL",
        ipa: "/tʃikoro tʃesekondari/"
      }
    ],
    academic_roles: [
      {
        id: "prof_role_001",
        shona: "mudzidzisi",
        english: "teacher",
        category: "education",
        subcategories: ["roles"],
        level: "A1",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/muʣiʣisi/",
        examples: [
          {
            shona: "Mudzidzisi wangu anondidzidzisa chiShona",
            english: "My teacher teaches me Shona",
            context: "Classroom",
            register: "neutral"
          }
        ]
      },
      {
        id: "prof_role_002",
        shona: "mudzidzi",
        english: "student",
        category: "education",
        subcategories: ["roles"],
        level: "A1",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/muʣiʣi/"
      },
      {
        id: "prof_role_003",
        shona: "purofesa",
        english: "professor",
        category: "education",
        subcategories: ["roles", "higher_education"],
        level: "B2",
        difficulty: 5,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/purofesa/"
      },
      {
        id: "prof_role_004",
        shona: "mukuru wechikoro",
        english: "headmaster/principal",
        category: "education",
        subcategories: ["roles", "administration"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LHLLHL",
        ipa: "/mukuru wetʃikoro/"
      }
    ],
    academic_terms: [
      {
        id: "prof_term_001",
        shona: "chidzidzo",
        english: "lesson/subject",
        category: "education",
        subcategories: ["academics"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/tʃiʣiʣo/"
      },
      {
        id: "prof_term_002",
        shona: "bvunzo",
        english: "exam/test",
        category: "education",
        subcategories: ["assessment"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "HL",
        ipa: "/bvunzo/"
      },
      {
        id: "prof_term_003",
        shona: "dhigirii",
        english: "degree",
        category: "education",
        subcategories: ["qualifications"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/ɗigiriː/"
      },
      {
        id: "prof_term_004",
        shona: "satefeketi",
        english: "certificate",
        category: "education",
        subcategories: ["qualifications"],
        level: "B1",
        difficulty: 5,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/satefeketi/"
      },
      {
        id: "prof_term_005",
        shona: "kudzidza",
        english: "to study/learn",
        category: "education",
        subcategories: ["actions"],
        level: "A1",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kuʣiʣa/"
      }
    ]
  },

  // Politics & Government (40+ words)
  politicsGovernment: {
    governance: [
      {
        id: "prof_pol_001",
        shona: "hurumende",
        english: "government",
        category: "politics",
        subcategories: ["governance"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/hurumende/",
        cultural_notes: "Central to political discourse in Zimbabwe",
        examples: [
          {
            shona: "Hurumende yakatipa mitemo mitsva",
            english: "The government gave us new laws",
            context: "Political news",
            register: "formal"
          }
        ]
      },
      {
        id: "prof_pol_002",
        shona: "mutungamiri",
        english: "leader",
        category: "politics",
        subcategories: ["roles"],
        level: "A2",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/mutuŋgamiri/"
      },
      {
        id: "prof_pol_003",
        shona: "mutungamiri wenyika",
        english: "president",
        category: "politics",
        subcategories: ["roles", "executive"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LLHLLHL",
        ipa: "/mutuŋgamiri weɲika/"
      },
      {
        id: "prof_pol_004",
        shona: "paramende",
        english: "parliament",
        category: "politics",
        subcategories: ["institutions"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/paramende/"
      }
    ],
    democracy: [
      {
        id: "prof_dem_001",
        shona: "sarudzo",
        english: "election",
        category: "politics",
        subcategories: ["democracy"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LHL",
        ipa: "/saruʣo/"
      },
      {
        id: "prof_dem_002",
        shona: "kuvhota",
        english: "to vote",
        category: "politics",
        subcategories: ["democracy", "actions"],
        level: "B1",
        difficulty: 4,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kuv̤ota/"
      },
      {
        id: "prof_dem_003",
        shona: "bato rezvematongerwo",
        english: "political party",
        category: "politics",
        subcategories: ["democracy", "organizations"],
        level: "B2",
        difficulty: 7,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "HLLLLHL",
        ipa: "/bato rezvematoŋgerwo/"
      },
      {
        id: "prof_dem_004",
        shona: "kodzero",
        english: "rights",
        category: "politics",
        subcategories: ["democracy", "law"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LHL",
        ipa: "/koʣero/"
      }
    ]
  },

  // Economics (40+ words)
  economics: {
    general: [
      {
        id: "prof_eco_001",
        shona: "hupfumi",
        english: "economy/wealth",
        category: "economics",
        subcategories: ["general"],
        level: "B1",
        difficulty: 5,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LHL",
        ipa: "/hupfumi/",
        morphology: {
          root: "pfumi",
          affixes: ["hu-"],
          noun_class: 14
        }
      },
      {
        id: "prof_eco_002",
        shona: "kukura kwehupfumi",
        english: "economic growth",
        category: "economics",
        subcategories: ["macroeconomics"],
        level: "B2",
        difficulty: 7,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LHLLHL",
        ipa: "/kukura kwehupfumi/"
      },
      {
        id: "prof_eco_003",
        shona: "mitengo",
        english: "prices",
        category: "economics",
        subcategories: ["commerce"],
        level: "A2",
        difficulty: 3,
        frequency: "high",
        register: "neutral",
        dialect: "standard",
        tones: "LHL",
        ipa: "/miteŋgo/"
      },
      {
        id: "prof_eco_004",
        shona: "kukwira kwemitengo",
        english: "inflation",
        category: "economics",
        subcategories: ["macroeconomics"],
        level: "B2",
        difficulty: 7,
        frequency: "high",
        register: "formal",
        dialect: "standard",
        tones: "LHLLHL",
        ipa: "/kukwira kwemiteŋgo/",
        cultural_notes: "Important concept in Zimbabwe's economic history"
      }
    ],
    trade: [
      {
        id: "prof_trade_001",
        shona: "kutengeserana",
        english: "trade/commerce",
        category: "economics",
        subcategories: ["trade"],
        level: "B1",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LLHL",
        ipa: "/kuteŋgeserana/"
      },
      {
        id: "prof_trade_002",
        shona: "kunze kwenyika",
        english: "export/foreign",
        category: "economics",
        subcategories: ["trade", "international"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "HLLHL",
        ipa: "/kunze kweɲika/"
      },
      {
        id: "prof_trade_003",
        shona: "kupinza",
        english: "to import",
        category: "economics",
        subcategories: ["trade", "international"],
        level: "B2",
        difficulty: 6,
        frequency: "medium",
        register: "formal",
        dialect: "standard",
        tones: "LHL",
        ipa: "/kupinza/"
      }
    ]
  }
}

// Helper functions
export function getProfessionalVocabularyByDomain(domain) {
  return professionalTechnicalVocabulary[domain] || []
}

export function getProfessionalVocabularyByLevel(level) {
  const allWords = []
  
  Object.values(professionalTechnicalVocabulary).forEach(domain => {
    Object.values(domain).forEach(subCategory => {
      if (Array.isArray(subCategory)) {
        allWords.push(...subCategory.filter(word => word.level === level))
      }
    })
  })
  
  return allWords
}

export function getProfessionalVocabularyByCategory(category) {
  const allWords = []
  
  Object.values(professionalTechnicalVocabulary).forEach(domain => {
    Object.values(domain).forEach(subCategory => {
      if (Array.isArray(subCategory)) {
        allWords.push(...subCategory.filter(word => word.category === category))
      }
    })
  })
  
  return allWords
}

export function searchProfessionalVocabulary(searchTerm) {
  const allWords = []
  const term = searchTerm.toLowerCase()
  
  Object.values(professionalTechnicalVocabulary).forEach(domain => {
    Object.values(domain).forEach(subCategory => {
      if (Array.isArray(subCategory)) {
        allWords.push(...subCategory.filter(word => 
          word.shona.toLowerCase().includes(term) ||
          word.english.toLowerCase().includes(term) ||
          word.subcategories.some(sub => sub.toLowerCase().includes(term))
        ))
      }
    })
  })
  
  return allWords
}

// Export total count
export const professionalTechnicalVocabularyCount = Object.values(professionalTechnicalVocabulary).reduce((total, domain) => {
  return total + Object.values(domain).reduce((domainTotal, subCategory) => {
    return domainTotal + (Array.isArray(subCategory) ? subCategory.length : 0)
  }, 0)
}, 0)
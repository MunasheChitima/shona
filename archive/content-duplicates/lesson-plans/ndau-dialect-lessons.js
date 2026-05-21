export const ndauDialectLessons = {
  metadata: {
    title: "Ndau Dialect Learning Module",
    description: "Comprehensive lessons for learning the Ndau dialect of Shona",
    region: "Eastern Zimbabwe",
    dialect: "Ndau",
    totalLessons: 5,
    difficulty: "intermediate",
    culturalFocus: "Regional variations and cultural diversity",
    prerequisites: ["Basic Shona vocabulary", "Understanding of standard Shona pronunciation"]
  },

  // Lesson 1: Introduction to Ndau Dialect
  lesson_1: {
    id: "ndau-introduction",
    title: "Introduction to Ndau Dialect",
    description: "Learn about the Ndau dialect and its cultural significance in Eastern Zimbabwe",
    category: "Regional Dialects",
    level: "intermediate",
    difficulty: "medium",
    xpReward: 75,
    estimatedDuration: 20,
    emoji: "🌍",
    colorScheme: {
      primary: "#8b5cf6",
      secondary: "#c4b5fd",
      gradient: "from-purple-400 to-purple-600"
    },

    learningObjectives: [
      "Understand the geographical and cultural context of Ndau dialect",
      "Learn key differences between standard Shona and Ndau",
      "Practice Ndau pronunciation patterns",
      "Appreciate the cultural diversity within Shona-speaking communities"
    ],

    discoveryElements: [
      "Explore the history of Ndau-speaking communities",
      "Discover unique pronunciation patterns in Ndau",
      "Learn about cultural practices specific to Eastern Zimbabwe",
      "Understand the importance of dialect preservation"
    ],

    culturalNotes: [
      "Ndau is spoken primarily in Chipinge and surrounding areas of Eastern Zimbabwe",
      "The dialect preserves many traditional Shona features while developing unique characteristics",
      "Ndau speakers are proud of their linguistic heritage and cultural identity",
      "Understanding dialect variations helps build bridges between different Shona communities"
    ],

    vocabulary: [
      {
        shona: "mhoro",
        english: "hello",
        pronunciation: "mm-HO-ro",
        phonetic: "/m̩.ho.ro/",
        syllables: "m-ho-ro",
        tonePattern: "L-H-L",
        audioFile: "mhoro.mp3",
        usage: "Standard greeting in Ndau, same as standard Shona",
        example: "Mhoro, shamwari!",
        culturalContext: "In Ndau culture, greetings maintain the same cultural importance as in standard Shona",
        ndauDialect: {
          ndau: "mhoro",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Greetings in Ndau maintain the same respect and cultural significance"
        }
      },
      {
        shona: "mangwanani",
        english: "good morning",
        pronunciation: "mah-ngwah-NAH-nee",
        phonetic: "/maŋgwanani/",
        syllables: "mang-wa-na-ni",
        tonePattern: "L-H-L-L",
        audioFile: "mangwanani.mp3",
        usage: "Morning greeting in Ndau, used from sunrise to mid-morning",
        example: "Mangwanani, mai!",
        culturalContext: "Morning greetings in Ndau acknowledge the new day with the same reverence as standard Shona",
        ndauDialect: {
          ndau: "mangwanani",
          variation: "Same pronunciation as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Morning rituals and greetings are equally important in Ndau culture"
        }
      },
      {
        shona: "masikati",
        english: "good afternoon",
        pronunciation: "mah-see-KAH-tee",
        phonetic: "/masikati/",
        syllables: "ma-si-ka-ti",
        tonePattern: "L-H-L-L",
        audioFile: "masikati.mp3",
        usage: "Afternoon greeting in Ndau, used from mid-morning to sunset",
        example: "Masikati, baba!",
        culturalContext: "Afternoon greetings in Ndau recognize the productive time of day",
        ndauDialect: {
          ndau: "masikati",
          variation: "Same pronunciation as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Work and community activities are valued in Ndau culture"
        }
      }
    ],

    exercises: [
      {
        id: "ndau-ex-1-1",
        type: "multiple_choice",
        question: "What region is the Ndau dialect primarily spoken in?",
        correctAnswer: "Eastern Zimbabwe",
        options: [
          "Eastern Zimbabwe",
          "Western Zimbabwe",
          "Northern Zimbabwe",
          "Southern Zimbabwe"
        ],
        points: 15,
        explanation: {
          correct: "Excellent! Ndau is primarily spoken in Eastern Zimbabwe, particularly in Chipinge and surrounding areas.",
          incorrect: "Remember: Ndau is spoken in Eastern Zimbabwe, not other regions of the country."
        },
        culturalNote: "Understanding regional dialects helps appreciate the diversity of Shona-speaking communities",
        retryHint: "Think about the geographical location mentioned in the lesson materials.",
        difficulty: "medium"
      },
      {
        id: "ndau-ex-1-2",
        type: "cultural_context",
        question: "Why is it important to learn about Ndau dialect variations?",
        correctAnswer: "To build bridges between different Shona communities",
        options: [
          "To build bridges between different Shona communities",
          "To replace standard Shona",
          "To confuse learners",
          "To make communication more difficult"
        ],
        points: 12,
        culturalExplanation: "Learning dialect variations helps understand and respect the cultural diversity within Shona-speaking communities",
        retryHint: "Think about how understanding different dialects can help bring people together.",
        difficulty: "medium"
      }
    ]
  },

  // Lesson 2: Ndau Family Terms
  lesson_2: {
    id: "ndau-family",
    title: "Ndau Family Terms",
    description: "Learn family vocabulary in the Ndau dialect and understand family structures in Eastern Zimbabwe",
    category: "Regional Dialects",
    level: "intermediate",
    difficulty: "medium",
    xpReward: 75,
    estimatedDuration: 25,
    emoji: "👨‍👩‍👧‍👦",
    colorScheme: {
      primary: "#8b5cf6",
      secondary: "#c4b5fd",
      gradient: "from-purple-400 to-purple-600"
    },

    learningObjectives: [
      "Learn family terms in Ndau dialect",
      "Understand family structures in Eastern Zimbabwe",
      "Practice respectful family communication",
      "Appreciate the importance of family in Ndau culture"
    ],

    discoveryElements: [
      "Explore family hierarchies in Ndau culture",
      "Discover traditional family roles and responsibilities",
      "Learn about extended family relationships",
      "Understand the importance of respect in family communication"
    ],

    culturalNotes: [
      "Family is the foundation of Ndau society, just as in standard Shona culture",
      "Extended family relationships are highly valued in Eastern Zimbabwe",
      "Respect for elders is paramount in Ndau family structures",
      "Family terms carry deep cultural significance and should be used with respect"
    ],

    vocabulary: [
      {
        shona: "mai",
        english: "mother",
        pronunciation: "mah-EE",
        phonetic: "/mái/",
        syllables: "mai",
        tonePattern: "H-L",
        audioFile: "mai.mp3",
        usage: "Respectful term for mother in Ndau",
        example: "Mai, ndinoda rubatsiro.",
        culturalContext: "Mothers in Ndau culture are the heart of the family, providing love, guidance, and wisdom",
        ndauDialect: {
          ndau: "mai",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "The role of mothers is equally revered in Ndau culture"
        }
      },
      {
        shona: "baba",
        english: "father",
        pronunciation: "bah-BAH",
        phonetic: "/bàbá/",
        syllables: "ba-ba",
        tonePattern: "L-H",
        audioFile: "baba.mp3",
        usage: "Respectful term for father in Ndau",
        example: "Baba, ndinoda kukurukura.",
        culturalContext: "Fathers in Ndau culture are the leaders and protectors of the family",
        ndauDialect: {
          ndau: "baba",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Fathers maintain their role as family leaders in Ndau culture"
        }
      },
      {
        shona: "mukoma",
        english: "older brother",
        pronunciation: "moo-KOH-mah",
        phonetic: "/mùkómá/",
        syllables: "mu-ko-ma",
        tonePattern: "H-L-H",
        audioFile: "mukoma.mp3",
        usage: "Respectful term for older brother in Ndau",
        example: "Mukoma, ndinoda kuziva.",
        culturalContext: "Older brothers in Ndau culture are mentors and protectors of younger siblings",
        ndauDialect: {
          ndau: "mukoma",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "The mentoring role of older brothers is important in Ndau families"
        }
      },
      {
        shona: "munin'ina",
        english: "younger sibling",
        pronunciation: "moo-neen-EE-nah",
        phonetic: "/mùnín'ínà/",
        syllables: "mu-nin-i-na",
        tonePattern: "H-L-H-L",
        audioFile: "munin'ina.mp3",
        usage: "Term for younger sibling in Ndau",
        example: "Munin'ina, uya pano.",
        culturalContext: "Younger siblings in Ndau culture are cherished and protected by their elders",
        ndauDialect: {
          ndau: "munin'ina",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "The protective relationship between siblings is valued in Ndau culture"
        }
      }
    ],

    exercises: [
      {
        id: "ndau-ex-2-1",
        type: "multiple_choice",
        question: "What is the role of mothers in Ndau culture?",
        correctAnswer: "Heart of the family providing love and guidance",
        options: [
          "Heart of the family providing love and guidance",
          "Only responsible for cooking",
          "Not important in family decisions",
          "Same as in Western cultures"
        ],
        points: 15,
        explanation: {
          correct: "Excellent! Mothers in Ndau culture are the heart of the family, providing love, guidance, and wisdom.",
          incorrect: "Remember: Mothers in Ndau culture are highly respected and are the foundation of the family."
        },
        culturalNote: "The role of mothers is central to family harmony in Ndau culture",
        retryHint: "Think about the most important person in the family who provides care and guidance.",
        difficulty: "medium"
      },
      {
        id: "ndau-ex-2-2",
        type: "pronunciation",
        question: "Practice saying 'mukoma' (older brother) in Ndau dialect",
        targetWord: "mukoma",
        pronunciation: "moo-KOH-mah",
        phonetic: "/mùkómá/",
        points: 20,
        audioFile: "mukoma.mp3",
        explanation: {
          correct: "Perfect! 'Mukoma' means 'older brother' and shows respect for their mentoring role.",
          incorrect: "Try again: 'Mukoma' has three syllables with emphasis on the second syllable."
        },
        culturalNote: "Older brothers are respected mentors in Ndau families",
        retryHint: "Break it down: mu-ko-ma, with emphasis on 'ko'.",
        difficulty: "medium"
      }
    ]
  },

  // Lesson 3: Ndau Numbers and Counting
  lesson_3: {
    id: "ndau-numbers",
    title: "Ndau Numbers and Counting",
    description: "Learn numbers in the Ndau dialect and understand counting systems in Eastern Zimbabwe",
    category: "Regional Dialects",
    level: "intermediate",
    difficulty: "medium",
    xpReward: 75,
    estimatedDuration: 20,
    emoji: "🔢",
    colorScheme: {
      primary: "#8b5cf6",
      secondary: "#c4b5fd",
      gradient: "from-purple-400 to-purple-600"
    },

    learningObjectives: [
      "Learn numbers 1-10 in Ndau dialect",
      "Understand counting systems in Eastern Zimbabwe",
      "Practice number pronunciation",
      "Learn about the cultural significance of numbers"
    ],

    discoveryElements: [
      "Explore traditional counting methods in Ndau culture",
      "Discover the cultural significance of numbers",
      "Learn about market interactions using numbers",
      "Understand mathematical concepts in Ndau"
    ],

    culturalNotes: [
      "Numbers in Ndau culture have both practical and spiritual significance",
      "Counting is essential for market interactions and traditional ceremonies",
      "Numbers are used in traditional healing and spiritual practices",
      "Understanding numbers helps with community participation and commerce"
    ],

    vocabulary: [
      {
        shona: "poshi",
        english: "one",
        pronunciation: "poh-SHEE",
        phonetic: "/poʃi/",
        syllables: "po-shi",
        tonePattern: "L-H",
        audioFile: "poshi.mp3",
        usage: "Number one in Ndau, used for counting and traditional ceremonies",
        example: "Ndine poshi mwana.",
        culturalContext: "The number one represents unity, beginnings, and the individual within the community in Ndau culture",
        ndauDialect: {
          ndau: "poshi",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Numbers maintain their cultural significance in Ndau"
        }
      },
      {
        shona: "piri",
        english: "two",
        pronunciation: "pee-REE",
        phonetic: "/piri/",
        syllables: "pi-ri",
        tonePattern: "L-H",
        audioFile: "piri.mp3",
        usage: "Number two in Ndau, represents partnership and balance",
        example: "Ndine piri maoko.",
        culturalContext: "Two represents partnership, balance, and harmony in Ndau culture",
        ndauDialect: {
          ndau: "piri",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "The concept of balance is important in Ndau culture"
        }
      },
      {
        shona: "tatu",
        english: "three",
        pronunciation: "tah-TOO",
        phonetic: "/tatu/",
        syllables: "ta-tu",
        tonePattern: "L-H",
        audioFile: "tatu.mp3",
        usage: "Number three in Ndau, represents the family unit",
        example: "Tine tatu vana.",
        culturalContext: "Three represents the complete family unit (father, mother, child) in Ndau culture",
        ndauDialect: {
          ndau: "tatu",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Family unity is central to Ndau culture"
        }
      },
      {
        shona: "china",
        english: "four",
        pronunciation: "CHEE-nah",
        phonetic: "/tʃina/",
        syllables: "chi-na",
        tonePattern: "H-L",
        audioFile: "china.mp3",
        usage: "Number four in Ndau, represents stability and foundation",
        example: "Ndine china makumbo.",
        culturalContext: "Four represents stability, foundation, and the four directions in Ndau culture",
        ndauDialect: {
          ndau: "china",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Stability and foundation are valued in Ndau culture"
        }
      },
      {
        shona: "shanu",
        english: "five",
        pronunciation: "SHAH-noo",
        phonetic: "/ʃanu/",
        syllables: "sha-nu",
        tonePattern: "H-L",
        audioFile: "shanu.mp3",
        usage: "Number five in Ndau, represents the human hand",
        example: "Ndine shanu minwe.",
        culturalContext: "Five represents the human hand and the ability to work and create in Ndau culture",
        ndauDialect: {
          ndau: "shanu",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Work and creativity are important in Ndau culture"
        }
      }
    ],

    exercises: [
      {
        id: "ndau-ex-3-1",
        type: "multiple_choice",
        question: "What does the number 'tatu' (three) represent in Ndau culture?",
        correctAnswer: "The complete family unit",
        options: [
          "The complete family unit",
          "Just any group of three",
          "A random number",
          "A bad omen"
        ],
        points: 15,
        explanation: {
          correct: "Excellent! 'Tatu' represents the complete family unit of father, mother, and child in Ndau culture.",
          incorrect: "Remember: 'Tatu' has special cultural significance representing the family unit."
        },
        culturalNote: "Family unity is central to Ndau cultural values",
        retryHint: "Think about the most important group of three people in a family.",
        difficulty: "medium"
      },
      {
        id: "ndau-ex-3-2",
        type: "translation",
        question: "Translate 'I have two hands' into Ndau",
        correctAnswer: "Ndine piri maoko",
        options: [
          "Ndine piri maoko",
          "Ndine poshi maoko",
          "Ndine tatu maoko",
          "Ndine china maoko"
        ],
        points: 20,
        explanation: {
          correct: "Perfect! 'Ndine piri maoko' means 'I have two hands' in Ndau.",
          incorrect: "Remember: 'piri' means 'two' in Ndau dialect."
        },
        culturalNote: "Hands represent the ability to work and serve the community",
        retryHint: "Use 'piri' for 'two' and 'maoko' for 'hands'.",
        difficulty: "medium"
      }
    ]
  },

  // Lesson 4: Ndau Colors and Descriptions
  lesson_4: {
    id: "ndau-colors",
    title: "Ndau Colors and Descriptions",
    description: "Learn color vocabulary in the Ndau dialect and understand color symbolism in Eastern Zimbabwe",
    category: "Regional Dialects",
    level: "intermediate",
    difficulty: "medium",
    xpReward: 75,
    estimatedDuration: 20,
    emoji: "🎨",
    colorScheme: {
      primary: "#8b5cf6",
      secondary: "#c4b5fd",
      gradient: "from-purple-400 to-purple-600"
    },

    learningObjectives: [
      "Learn color terms in Ndau dialect",
      "Understand color symbolism in Eastern Zimbabwe",
      "Practice describing objects by color",
      "Appreciate the cultural significance of colors"
    ],

    discoveryElements: [
      "Explore color symbolism in Ndau culture",
      "Discover traditional uses of different colors",
      "Learn about color in traditional ceremonies",
      "Understand how colors reflect cultural values"
    ],

    culturalNotes: [
      "Colors in Ndau culture carry deep symbolic meaning",
      "Traditional ceremonies use specific colors for different purposes",
      "Color choices reflect cultural values and beliefs",
      "Understanding color symbolism helps appreciate Ndau traditions"
    ],

    vocabulary: [
      {
        shona: "tsvuku",
        english: "red",
        pronunciation: "TSV-oo-koo",
        phonetic: "/tsvuku/",
        syllables: "tsvu-ku",
        tonePattern: "H-L",
        audioFile: "tsvuku.mp3",
        usage: "Color red in Ndau, represents life and energy",
        example: "Hembo yangu tsvuku.",
        culturalContext: "Red represents life, energy, passion, and the blood of ancestors in Ndau culture",
        ndauDialect: {
          ndau: "tsvuku",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Red maintains its powerful symbolism in Ndau culture"
        }
      },
      {
        shona: "chena",
        english: "white",
        pronunciation: "CHEH-nah",
        phonetic: "/tʃena/",
        syllables: "che-na",
        tonePattern: "H-L",
        audioFile: "chena.mp3",
        usage: "Color white in Ndau, represents purity and peace",
        example: "Hembo yangu chena.",
        culturalContext: "White represents purity, peace, spiritual connection, and the ancestors in Ndau culture",
        ndauDialect: {
          ndau: "chena",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "White is used in spiritual ceremonies in Ndau culture"
        }
      },
      {
        shona: "dema",
        english: "black",
        pronunciation: "DEH-mah",
        phonetic: "/dema/",
        syllables: "de-ma",
        tonePattern: "H-L",
        audioFile: "dema.mp3",
        usage: "Color black in Ndau, represents mystery and wisdom",
        example: "Hembo yangu dema.",
        culturalContext: "Black represents mystery, wisdom, the unknown, and traditional knowledge in Ndau culture",
        ndauDialect: {
          ndau: "dema",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Black is associated with traditional healing in Ndau culture"
        }
      },
      {
        shona: "bhuruu",
        english: "blue",
        pronunciation: "BH-oo-roo",
        phonetic: "/bhuruu/",
        syllables: "bhu-ruu",
        tonePattern: "H-L",
        audioFile: "bhuruu.mp3",
        usage: "Color blue in Ndau, represents sky and spirituality",
        example: "Hembo yangu bhuruu.",
        culturalContext: "Blue represents the sky, spirituality, and connection to the divine in Ndau culture",
        ndauDialect: {
          ndau: "bhuruu",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Blue is associated with spiritual matters in Ndau culture"
        }
      },
      {
        shona: "girini",
        english: "green",
        pronunciation: "gi-REE-nee",
        phonetic: "/girini/",
        syllables: "gi-ri-ni",
        tonePattern: "L-H-L",
        audioFile: "girini.mp3",
        usage: "Color green in Ndau, represents nature and growth",
        example: "Hembo yangu girini.",
        culturalContext: "Green represents nature, growth, fertility, and the natural world in Ndau culture",
        ndauDialect: {
          ndau: "girini",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Green is associated with agriculture and nature in Ndau culture"
        }
      }
    ],

    exercises: [
      {
        id: "ndau-ex-4-1",
        type: "multiple_choice",
        question: "What does the color 'tsvuku' (red) represent in Ndau culture?",
        correctAnswer: "Life, energy, and the blood of ancestors",
        options: [
          "Life, energy, and the blood of ancestors",
          "Sadness and mourning",
          "Cold and winter",
          "Nothing special"
        ],
        points: 15,
        explanation: {
          correct: "Excellent! 'Tsvuku' represents life, energy, passion, and the blood of ancestors in Ndau culture.",
          incorrect: "Remember: Red is a powerful color representing life and ancestral connections in Ndau culture."
        },
        culturalNote: "Red is used in important ceremonies and represents powerful forces",
        retryHint: "Think about what red represents in traditional ceremonies and life.",
        difficulty: "medium"
      },
      {
        id: "ndau-ex-4-2",
        type: "cultural_context",
        question: "When might you see the color 'chena' (white) used in Ndau ceremonies?",
        correctAnswer: "During spiritual and purification ceremonies",
        options: [
          "During spiritual and purification ceremonies",
          "Only during funerals",
          "Never in ceremonies",
          "Only for decoration"
        ],
        points: 12,
        culturalExplanation: "White is used in spiritual ceremonies to represent purity and connection to ancestors",
        retryHint: "Think about what white represents - purity and spiritual connection.",
        difficulty: "medium"
      }
    ]
  },

  // Lesson 5: Ndau Body Parts and Health
  lesson_5: {
    id: "ndau-body",
    title: "Ndau Body Parts and Health",
    description: "Learn body part vocabulary in the Ndau dialect and understand health concepts in Eastern Zimbabwe",
    category: "Regional Dialects",
    level: "intermediate",
    difficulty: "medium",
    xpReward: 75,
    estimatedDuration: 25,
    emoji: "👤",
    colorScheme: {
      primary: "#8b5cf6",
      secondary: "#c4b5fd",
      gradient: "from-purple-400 to-purple-600"
    },

    learningObjectives: [
      "Learn body part terms in Ndau dialect",
      "Understand health concepts in Eastern Zimbabwe",
      "Practice describing physical states",
      "Learn about traditional healing practices"
    ],

    discoveryElements: [
      "Explore traditional healing practices in Ndau culture",
      "Discover the importance of body parts in traditional medicine",
      "Learn about health and wellness concepts",
      "Understand the connection between body and spirit"
    ],

    culturalNotes: [
      "Body parts in Ndau culture are connected to spiritual and physical health",
      "Traditional healing practices use specific body part terminology",
      "Health is seen as a balance between physical and spiritual well-being",
      "Understanding body terminology helps with traditional medicine practices"
    ],

    vocabulary: [
      {
        shona: "musoro",
        english: "head",
        pronunciation: "moo-SOH-roh",
        phonetic: "/musoro/",
        syllables: "mu-so-ro",
        tonePattern: "H-L-L",
        audioFile: "musoro.mp3",
        usage: "Head in Ndau, considered sacred and connected to wisdom",
        example: "Ndine musoro.",
        culturalContext: "The head is considered sacred in Ndau culture, representing wisdom, leadership, and spiritual connection",
        ndauDialect: {
          ndau: "musoro",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "The head is treated with great respect in Ndau culture"
        }
      },
      {
        shona: "maoko",
        english: "hands",
        pronunciation: "mah-OH-koh",
        phonetic: "/maoko/",
        syllables: "ma-o-ko",
        tonePattern: "L-H-L",
        audioFile: "maoko.mp3",
        usage: "Hands in Ndau, represent work and creativity",
        example: "Ndine maoko.",
        culturalContext: "Hands represent work, creativity, and community service in Ndau culture",
        ndauDialect: {
          ndau: "maoko",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Hands are important for work and community service"
        }
      },
      {
        shona: "maziso",
        english: "eyes",
        pronunciation: "mah-ZEE-soh",
        phonetic: "/maziso/",
        syllables: "ma-zi-so",
        tonePattern: "L-H-L",
        audioFile: "maziso.mp3",
        usage: "Eyes in Ndau, represent vision and spiritual insight",
        example: "Ndine maziso.",
        culturalContext: "Eyes represent vision, wisdom, and spiritual insight in Ndau culture",
        ndauDialect: {
          ndau: "maziso",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Eyes are considered windows to the soul"
        }
      },
      {
        shona: "muromo",
        english: "mouth",
        pronunciation: "moo-ROH-moh",
        phonetic: "/muromo/",
        syllables: "mu-ro-mo",
        tonePattern: "H-L-L",
        audioFile: "muromo.mp3",
        usage: "Mouth in Ndau, represents speech and communication",
        example: "Ndine muromo.",
        culturalContext: "The mouth represents speech, communication, and the power of words in Ndau culture",
        ndauDialect: {
          ndau: "muromo",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Speech and communication are highly valued"
        }
      },
      {
        shona: "nzeve",
        english: "ear",
        pronunciation: "n-ZEH-veh",
        phonetic: "/nzeve/",
        syllables: "nze-ve",
        tonePattern: "H-L",
        audioFile: "nzeve.mp3",
        usage: "Ear in Ndau, represents listening and understanding",
        example: "Ndine nzeve.",
        culturalContext: "Ears represent listening, understanding, and the ability to learn in Ndau culture",
        ndauDialect: {
          ndau: "nzeve",
          variation: "Same as standard Shona",
          region: "Eastern Zimbabwe",
          culturalNote: "Listening and understanding are important skills"
        }
      }
    ],

    exercises: [
      {
        id: "ndau-ex-5-1",
        type: "multiple_choice",
        question: "Why is the 'musoro' (head) considered sacred in Ndau culture?",
        correctAnswer: "It represents wisdom, leadership, and spiritual connection",
        options: [
          "It represents wisdom, leadership, and spiritual connection",
          "It's just another body part",
          "It's the biggest body part",
          "It's not considered special"
        ],
        points: 15,
        explanation: {
          correct: "Excellent! The head represents wisdom, leadership, and spiritual connection in Ndau culture.",
          incorrect: "Remember: The head is sacred because it contains wisdom and spiritual connection."
        },
        culturalNote: "The head is treated with great respect in traditional practices",
        retryHint: "Think about what the head contains - thoughts, wisdom, and spiritual connection.",
        difficulty: "medium"
      },
      {
        id: "ndau-ex-5-2",
        type: "pronunciation",
        question: "Practice saying 'maziso' (eyes) in Ndau dialect",
        targetWord: "maziso",
        pronunciation: "mah-ZEE-soh",
        phonetic: "/maziso/",
        points: 20,
        audioFile: "maziso.mp3",
        explanation: {
          correct: "Perfect! 'Maziso' means 'eyes' and represents vision and spiritual insight.",
          incorrect: "Try again: 'Maziso' has three syllables with emphasis on the second syllable."
        },
        culturalNote: "Eyes are considered windows to the soul in Ndau culture",
        retryHint: "Break it down: ma-zi-so, with emphasis on 'zi'.",
        difficulty: "medium"
      }
    ]
  },

  // Module Assessment Framework
  module_assessment: {
    formative_assessments: [
      "Daily dialect practice sessions",
      "Pronunciation comparison exercises",
      "Cultural context discussions",
      "Regional variation recognition"
    ],

    summative_assessments: [
      {
        type: "Dialect Mastery Test",
        components: ["Pronunciation accuracy", "Cultural understanding", "Regional awareness"],
        weighting: "40%"
      },
      {
        type: "Cultural Integration Assessment",
        components: ["Cultural sensitivity", "Regional appreciation", "Community understanding"],
        weighting: "30%"
      },
      {
        type: "Practical Application Project",
        components: ["Dialect usage", "Cultural communication", "Regional respect"],
        weighting: "30%"
      }
    ],

    progression_criteria: {
      minimum_dialect_accuracy: "75%",
      cultural_understanding: "Pass/Fail",
      regional_appreciation: "Demonstrated",
      readiness_for_advanced_dialects: "Comprehensive evaluation"
    }
  },

  // Resources and Materials
  required_resources: {
    audio_materials: [
      "Ndau pronunciation recordings",
      "Regional dialect comparisons",
      "Cultural context audio stories",
      "Traditional music from Eastern Zimbabwe"
    ],

    visual_materials: [
      "Maps of Eastern Zimbabwe",
      "Cultural context images",
      "Traditional ceremony photos",
      "Regional landscape images"
    ],

    supplementary_materials: [
      "Cultural reading materials about Ndau",
      "Traditional stories from Eastern Zimbabwe",
      "Community connection opportunities",
      "Regional dialect guides"
    ]
  },

  // Cultural Competency Development
  cultural_competency: {
    integration_approach: "Dialect learning as cultural bridge-building and regional appreciation",
    cultural_objectives: [
      "Understand and appreciate regional diversity within Shona-speaking communities",
      "Develop respect for different dialect variations and cultural practices",
      "Build bridges between different Shona communities",
      "Preserve and honor regional linguistic heritage"
    ],
    community_preparation: [
      "Readiness for respectful interaction with Ndau speakers",
      "Appreciation for regional cultural diversity",
      "Understanding of dialect preservation importance",
      "Ability to communicate respectfully across dialect variations"
    ]
  }
}; 
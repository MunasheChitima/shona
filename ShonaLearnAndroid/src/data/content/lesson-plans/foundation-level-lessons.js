// Foundation Level Lesson Plans (Lessons 9-20)
// These lessons build upon the existing basic lessons (1-8)

export const foundationLessons = [
  {
    title: "Personal Information & Introductions",
    description: "Learn to introduce yourself and share personal information",
    category: "Communication",
    orderIndex: 9,
    culturalContext: "In Shona culture, proper introductions include mentioning your totem (mutupo) and showing respect to elders",
    exercises: [
      {
        type: "multiple_choice",
        question: "How do you say 'What is your name?' in Shona?",
        correctAnswer: "Zita renyu ndiani?",
        options: JSON.stringify(["Zita renyu ndiani?", "Makadii?", "Munobva kupi?", "Mune makore mangani?"]),
        englishPhrase: "What is your name?",
        audioText: "ZEE-tah ren-yoo ndee-AH-nee",
        culturalNote: "This formal version shows respect, especially to elders"
      },
      {
        type: "translation",
        question: "Translate to Shona: I am 25 years old",
        correctAnswer: "Ndine makore makumi maviri nemashanu",
        options: JSON.stringify([]),
        englishPhrase: "I am 25 years old",
        shonaPhrase: "Ndine makore makumi maviri nemashanu",
        audioText: "Ndee-neh mah-koh-reh mah-koo-mee mah-vee-ree neh-mah-shah-noo"
      },
      {
        type: "multiple_choice",
        question: "What does 'Munobva kupi?' mean?",
        correctAnswer: "Where do you come from?",
        options: JSON.stringify(["Where do you come from?", "How old are you?", "What is your job?", "Where do you live?"]),
        shonaPhrase: "Munobva kupi?",
        audioText: "Moo-noh-bvah koo-pee"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice introducing yourself",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Zita rangu ndi [Your Name]",
              english: "My name is [Your Name]",
              phonetic: "ZEE-tah rah-ngoo ndee",
              tonePattern: "HLHL"
            },
            {
              shona: "Ndinobva kuHarare",
              english: "I come from Harare",
              phonetic: "ndee-noh-bvah koo-hah-RAH-reh",
              tonePattern: "LHLHL"
            }
          ]
        }),
        points: 15
      },
      {
        type: "matching",
        question: "Match personal information questions with answers",
        correctAnswer: "Zita-Name",
        options: JSON.stringify([
          "Zita renyu ndiani? - Zita rangu ndi John",
          "Munobva kupi? - Ndinobva kuBulawayo",
          "Mune makore mangani? - Ndine makore makumi matatu",
          "Munoita basa rei? - Ndiri mudzidzisi"
        ]),
        culturalNote: "Always show respect when asking personal questions"
      }
    ]
  },
  {
    title: "Time & Days of the Week",
    description: "Learn to tell time and discuss days of the week",
    category: "Time",
    orderIndex: 10,
    culturalContext: "Traditional Shona time concepts differ from Western time - events happen 'when they happen'",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is 'Monday' in Shona?",
        correctAnswer: "Muvhuro",
        options: JSON.stringify(["Muvhuro", "Chipiri", "Chitatu", "China"]),
        englishPhrase: "Monday",
        audioText: "Moo-vhoo-roh"
      },
      {
        type: "translation",
        question: "Translate to English: Chishanu",
        correctAnswer: "Friday",
        options: JSON.stringify([]),
        shonaPhrase: "Chishanu",
        englishPhrase: "Friday",
        audioText: "Chee-shah-noo"
      },
      {
        type: "multiple_choice",
        question: "How do you say 'What time is it?' in Shona?",
        correctAnswer: "Inguva yei?",
        options: JSON.stringify(["Inguva yei?", "Nezuva ripi?", "Musi upi?", "Riini zuva?"]),
        englishPhrase: "What time is it?",
        audioText: "Ee-ngoo-vah yay"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice days of the week",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Muvhuro",
              english: "Monday",
              phonetic: "moo-VHOO-roh",
              tonePattern: "LHL"
            },
            {
              shona: "Chipiri",
              english: "Tuesday",
              phonetic: "chee-PEE-ree",
              tonePattern: "LHL"
            },
            {
              shona: "Chitatu",
              english: "Wednesday",
              phonetic: "chee-TAH-too",
              tonePattern: "LHL"
            }
          ]
        }),
        points: 12
      },
      {
        type: "translation",
        question: "Translate: It is 3 o'clock",
        correctAnswer: "Inguva yechitatu",
        options: JSON.stringify([]),
        englishPhrase: "It is 3 o'clock",
        shonaPhrase: "Inguva yechitatu",
        audioText: "Ee-ngoo-vah yeh-chee-tah-too"
      }
    ]
  },
  {
    title: "Food & Eating",
    description: "Essential vocabulary for food and eating",
    category: "Food",
    orderIndex: 11,
    culturalContext: "Sharing food is central to Shona culture - 'ukama' (kinship) is strengthened through eating together",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is 'sadza' in English?",
        correctAnswer: "Thick porridge/staple food",
        options: JSON.stringify(["Thick porridge/staple food", "Meat", "Vegetables", "Bread"]),
        shonaPhrase: "Sadza",
        audioText: "SAH-dzah",
        culturalNote: "Sadza is the staple food of Zimbabwe, made from mealie meal"
      },
      {
        type: "translation",
        question: "Translate to Shona: I am hungry",
        correctAnswer: "Ndine nzara",
        options: JSON.stringify([]),
        englishPhrase: "I am hungry",
        shonaPhrase: "Ndine nzara",
        audioText: "Ndee-neh n-zah-rah"
      },
      {
        type: "multiple_choice",
        question: "How do you say 'meat' in Shona?",
        correctAnswer: "Nyama",
        options: JSON.stringify(["Nyama", "Mriwo", "Dovi", "Mapinda"]),
        englishPhrase: "Meat",
        audioText: "Nyah-mah"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice food vocabulary",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Sadza",
              english: "Thick porridge (staple food)",
              phonetic: "SAH-dzah",
              tonePattern: "HL"
            },
            {
              shona: "Nyama",
              english: "Meat",
              phonetic: "NYAH-mah",
              tonePattern: "HL"
            },
            {
              shona: "Mriwo",
              english: "Vegetables",
              phonetic: "m-REE-woh",
              tonePattern: "HL"
            }
          ]
        }),
        points: 10
      },
      {
        type: "translation",
        question: "Translate: The food is delicious",
        correctAnswer: "Kudya kwakanaka",
        options: JSON.stringify([]),
        englishPhrase: "The food is delicious",
        shonaPhrase: "Kudya kwakanaka",
        audioText: "Koo-dyah kwah-kah-nah-kah"
      }
    ]
  },
  {
    title: "Shopping & Market",
    description: "Learn to shop and negotiate at the market",
    category: "Commerce",
    orderIndex: 12,
    culturalContext: "Market culture is vital in Zimbabwe - bargaining is expected and relationship-building is important",
    exercises: [
      {
        type: "multiple_choice",
        question: "How do you say 'How much does this cost?' in Shona?",
        correctAnswer: "Zvinodhura marii izvi?",
        options: JSON.stringify(["Zvinodhura marii izvi?", "Ndingatenga sei?", "Ndiri kuda zvishoma", "Hazvikwanisi"]),
        englishPhrase: "How much does this cost?",
        audioText: "Zvee-noh-dhoo-rah mah-ree-ee iz-vee"
      },
      {
        type: "translation",
        question: "Translate to English: Tengesai",
        correctAnswer: "Please sell (to me)",
        options: JSON.stringify([]),
        shonaPhrase: "Tengesai",
        englishPhrase: "Please sell (to me)",
        audioText: "Ten-geh-say"
      },
      {
        type: "multiple_choice",
        question: "What does 'Zvakadaro' mean in bargaining?",
        correctAnswer: "That's too expensive",
        options: JSON.stringify(["That's too expensive", "I'll take it", "Very good", "Thank you"]),
        shonaPhrase: "Zvakadaro",
        audioText: "Zvah-kah-dah-roh",
        culturalNote: "Used when the price is too high - polite way to start negotiation"
      },
      {
        type: "voice",
        voiceType: "conversation",
        question: "Practice market conversation",
        voiceContent: JSON.stringify({
          dialogue: [
            {
              speaker: "Buyer",
              shona: "Zvinodhura marii izvi?",
              english: "How much does this cost?",
              phonetic: "zvee-noh-dhoo-rah mah-ree-ee iz-vee"
            },
            {
              speaker: "Seller",
              shona: "Zvinodhura madhora mashanu",
              english: "It costs five dollars",
              phonetic: "zvee-noh-dhoo-rah mah-dho-rah mah-shah-noo"
            }
          ]
        }),
        points: 15
      },
      {
        type: "translation",
        question: "Translate: I want to buy tomatoes",
        correctAnswer: "Ndiri kuda kutenga tomato",
        options: JSON.stringify([]),
        englishPhrase: "I want to buy tomatoes",
        shonaPhrase: "Ndiri kuda kutenga tomato",
        audioText: "Ndee-ree koo-dah koo-ten-gah toh-mah-toh"
      }
    ]
  },
  {
    title: "Directions & Transportation",
    description: "Learn to ask for directions and discuss transportation",
    category: "Travel",
    orderIndex: 13,
    culturalContext: "Giving detailed directions is important in Shona culture - landmarks and relationships are often used",
    exercises: [
      {
        type: "multiple_choice",
        question: "How do you say 'Where is the bus station?' in Shona?",
        correctAnswer: "Chiteshi chebhazi chiripi?",
        options: JSON.stringify(["Chiteshi chebhazi chiripi?", "Bhazi rinosvikarinhi?", "Ndingaenda sei?", "Nzira ipi?"]),
        englishPhrase: "Where is the bus station?",
        audioText: "Chee-teh-shee cheh-bah-zee chee-ree-pee"
      },
      {
        type: "translation",
        question: "Translate to English: Chengetai kuruboshwe",
        correctAnswer: "Turn left",
        options: JSON.stringify([]),
        shonaPhrase: "Chengetai kuruboshwe",
        englishPhrase: "Turn left",
        audioText: "Chen-geh-tay koo-roo-boh-shweh"
      },
      {
        type: "multiple_choice",
        question: "What does 'Mberi' mean in directions?",
        correctAnswer: "Straight ahead",
        options: JSON.stringify(["Straight ahead", "Turn right", "Go back", "Stop here"]),
        shonaPhrase: "Mberi",
        audioText: "m-BEH-ree"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice direction words",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Kurudyi",
              english: "To the right",
              phonetic: "koo-roo-DYEE",
              tonePattern: "LLH"
            },
            {
              shona: "Kuruboshwe",
              english: "To the left",
              phonetic: "koo-roo-BOH-shweh",
              tonePattern: "LLHL"
            },
            {
              shona: "Mberi",
              english: "Straight ahead",
              phonetic: "m-BEH-ree",
              tonePattern: "HL"
            }
          ]
        }),
        points: 12
      },
      {
        type: "translation",
        question: "Translate: The hospital is far",
        correctAnswer: "Chipatara chiri kure",
        options: JSON.stringify([]),
        englishPhrase: "The hospital is far",
        shonaPhrase: "Chipatara chiri kure",
        audioText: "Chee-pah-tah-rah chee-ree koo-reh"
      }
    ]
  },
  {
    title: "Weather & Seasons",
    description: "Discuss weather conditions and seasons",
    category: "Environment",
    orderIndex: 14,
    culturalContext: "Weather is closely tied to agricultural cycles in Shona culture - seasons determine planting and harvesting",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is 'rainy season' in Shona?",
        correctAnswer: "Nguva yemvura",
        options: JSON.stringify(["Nguva yemvura", "Nguva yezuva", "Nguva yechando", "Nguva yekupisa"]),
        englishPhrase: "Rainy season",
        audioText: "Ngoo-vah yeh-m-voo-rah",
        culturalNote: "The rainy season (October-March) is crucial for agriculture in Zimbabwe"
      },
      {
        type: "translation",
        question: "Translate to English: Kuri kupisa",
        correctAnswer: "It is hot",
        options: JSON.stringify([]),
        shonaPhrase: "Kuri kupisa",
        englishPhrase: "It is hot",
        audioText: "Koo-ree koo-pee-sah"
      },
      {
        type: "multiple_choice",
        question: "How do you say 'It is raining' in Shona?",
        correctAnswer: "Mvura inonaya",
        options: JSON.stringify(["Mvura inonaya", "Zuva rinobuda", "Chando chakakomba", "Mhepo inovhuvhuta"]),
        englishPhrase: "It is raining",
        audioText: "m-VOO-rah ee-noh-nah-yah"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice weather vocabulary",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Mvura",
              english: "Rain",
              phonetic: "m-VOO-rah",
              tonePattern: "HL"
            },
            {
              shona: "Zuva",
              english: "Sun",
              phonetic: "ZOO-vah",
              tonePattern: "HL"
            },
            {
              shona: "Chando",
              english: "Cold weather",
              phonetic: "CHAHN-doh",
              tonePattern: "HL"
            }
          ]
        }),
        points: 10
      },
      {
        type: "translation",
        question: "Translate: The weather is nice today",
        correctAnswer: "Mamiriro ekunze akanaka nhasi",
        options: JSON.stringify([]),
        englishPhrase: "The weather is nice today",
        shonaPhrase: "Mamiriro ekunze akanaka nhasi",
        audioText: "Mah-mee-ree-roh eh-koon-zeh ah-kah-nah-kah n-hah-see"
      }
    ]
  },
  {
    title: "Body Parts & Health",
    description: "Learn body parts and basic health vocabulary",
    category: "Health",
    orderIndex: 15,
    culturalContext: "Traditional healing is important in Shona culture alongside modern medicine",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is 'head' in Shona?",
        correctAnswer: "Musoro",
        options: JSON.stringify(["Musoro", "Ruoko", "Gumbo", "Dumbu"]),
        englishPhrase: "Head",
        audioText: "Moo-soh-roh"
      },
      {
        type: "translation",
        question: "Translate to English: Ndinorwara",
        correctAnswer: "I am sick",
        options: JSON.stringify([]),
        shonaPhrase: "Ndinorwara",
        englishPhrase: "I am sick",
        audioText: "Ndee-noh-rwah-rah"
      },
      {
        type: "multiple_choice",
        question: "How do you say 'My stomach hurts' in Shona?",
        correctAnswer: "Dumbu rangu rinorwadza",
        options: JSON.stringify(["Dumbu rangu rinorwadza", "Musoro wangu unopfuta", "Mazino angu anorwadza", "Ruoko rwangu rwakakuvara"]),
        englishPhrase: "My stomach hurts",
        audioText: "DOOM-boo rah-ngoo ree-noh-rwah-dzah"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice body parts",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Musoro",
              english: "Head",
              phonetic: "moo-SOH-roh",
              tonePattern: "LHL"
            },
            {
              shona: "Ruoko",
              english: "Hand/arm",
              phonetic: "roo-OH-koh",
              tonePattern: "LHL"
            },
            {
              shona: "Gumbo",
              english: "Leg/foot",
              phonetic: "GOOM-boh",
              tonePattern: "HL"
            }
          ]
        }),
        points: 12
      },
      {
        type: "translation",
        question: "Translate: I need to see a doctor",
        correctAnswer: "Ndinofanira kuona murapi",
        options: JSON.stringify([]),
        englishPhrase: "I need to see a doctor",
        shonaPhrase: "Ndinofanira kuona murapi",
        audioText: "Ndee-noh-fah-nee-rah koo-oh-nah moo-rah-pee"
      }
    ]
  }
];

// Grammar Foundation Lessons (16-20)
export const grammarFoundationLessons = [
  {
    title: "Present Tense Verbs",
    description: "Master present tense verb conjugation",
    category: "Grammar",
    orderIndex: 16,
    culturalContext: "Shona verbs change based on the subject - understanding this is crucial for communication",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is the present tense of 'to eat' for 'I'?",
        correctAnswer: "Ndinodya",
        options: JSON.stringify(["Ndinodya", "Unodya", "Anodya", "Tinodya"]),
        englishPhrase: "I eat",
        audioText: "Ndee-noh-dyah",
        grammarNote: "Ndi- is the prefix for 'I' in present tense"
      },
      {
        type: "translation",
        question: "Translate to Shona: You speak",
        correctAnswer: "Unotaura",
        options: JSON.stringify([]),
        englishPhrase: "You speak",
        shonaPhrase: "Unotaura",
        audioText: "Oo-noh-tow-rah"
      },
      {
        type: "multiple_choice",
        question: "What is the present tense pattern for 'he/she'?",
        correctAnswer: "A- + verb stem + -a",
        options: JSON.stringify(["A- + verb stem + -a", "U- + verb stem + -a", "Ndi- + verb stem + -a", "Ti- + verb stem + -a"]),
        grammarNote: "Third person singular uses 'a-' prefix"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice present tense conjugation",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Ndinodya",
              english: "I eat",
              phonetic: "ndee-noh-DYAH",
              tonePattern: "LLH"
            },
            {
              shona: "Unotaura",
              english: "You speak",
              phonetic: "oo-noh-TOW-rah",
              tonePattern: "LLH"
            },
            {
              shona: "Anofamba",
              english: "He/she walks",
              phonetic: "ah-noh-FAHM-bah",
              tonePattern: "LLH"
            }
          ]
        }),
        points: 15
      },
      {
        type: "translation",
        question: "Translate: We are working",
        correctAnswer: "Tiri kushanda",
        options: JSON.stringify([]),
        englishPhrase: "We are working",
        shonaPhrase: "Tiri kushanda",
        audioText: "Tee-ree koo-shahn-dah"
      }
    ]
  },
  {
    title: "Past Tense Introduction",
    description: "Learn to talk about past actions",
    category: "Grammar",
    orderIndex: 17,
    culturalContext: "Past tense is important for storytelling, which is central to Shona oral tradition",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is the past tense of 'to go' for 'I'?",
        correctAnswer: "Ndakaenda",
        options: JSON.stringify(["Ndakaenda", "Ndinoenda", "Ndichaenda", "Ndingatenda"]),
        englishPhrase: "I went",
        audioText: "Ndah-kah-en-dah",
        grammarNote: "Past tense uses -aka- infix"
      },
      {
        type: "translation",
        question: "Translate to English: Akadya",
        correctAnswer: "He/she ate",
        options: JSON.stringify([]),
        shonaPhrase: "Akadya",
        englishPhrase: "He/she ate",
        audioText: "Ah-kah-dyah"
      },
      {
        type: "multiple_choice",
        question: "What is the past tense marker in Shona?",
        correctAnswer: "-aka-",
        options: JSON.stringify(["-aka-", "-cha-", "-no-", "-nga-"]),
        grammarNote: "The -aka- infix indicates completed past action"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice past tense forms",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Ndakaenda",
              english: "I went",
              phonetic: "ndah-kah-EN-dah",
              tonePattern: "LLHL"
            },
            {
              shona: "Wakatamba",
              english: "You played",
              phonetic: "wah-kah-TAHM-bah",
              tonePattern: "LLHL"
            },
            {
              shona: "Akaona",
              english: "He/she saw",
              phonetic: "ah-kah-OH-nah",
              tonePattern: "LLHL"
            }
          ]
        }),
        points: 15
      },
      {
        type: "translation",
        question: "Translate: We arrived yesterday",
        correctAnswer: "Takasvika nezuro",
        options: JSON.stringify([]),
        englishPhrase: "We arrived yesterday",
        shonaPhrase: "Takasvika nezuro",
        audioText: "Tah-kah-svee-kah neh-zoo-roh"
      }
    ]
  },
  {
    title: "Question Formation",
    description: "Learn to ask questions properly",
    category: "Grammar",
    orderIndex: 18,
    culturalContext: "Proper question formation shows respect and cultural understanding",
    exercises: [
      {
        type: "multiple_choice",
        question: "What question word means 'what' in Shona?",
        correctAnswer: "Chii",
        options: JSON.stringify(["Chii", "Ani", "Riini", "Kupi"]),
        englishPhrase: "What",
        audioText: "Chee-ee"
      },
      {
        type: "translation",
        question: "Translate to English: Wakamuka riini?",
        correctAnswer: "When did you wake up?",
        options: JSON.stringify([]),
        shonaPhrase: "Wakamuka riini?",
        englishPhrase: "When did you wake up?",
        audioText: "Wah-kah-moo-kah ree-ee-nee"
      },
      {
        type: "multiple_choice",
        question: "How do you ask 'How many?' in Shona?",
        correctAnswer: "Zvingani?",
        options: JSON.stringify(["Zvingani?", "Zvipi?", "Sei?", "Riini?"]),
        englishPhrase: "How many?",
        audioText: "Zvee-ngah-nee"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice question words",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Chii",
              english: "What",
              phonetic: "CHEE-ee",
              tonePattern: "HL"
            },
            {
              shona: "Ani",
              english: "Who",
              phonetic: "AH-nee",
              tonePattern: "HL"
            },
            {
              shona: "Kupi",
              english: "Where",
              phonetic: "KOO-pee",
              tonePattern: "HL"
            }
          ]
        }),
        points: 12
      },
      {
        type: "translation",
        question: "Translate: Why are you late?",
        correctAnswer: "Sei wakanonoka?",
        options: JSON.stringify([]),
        englishPhrase: "Why are you late?",
        shonaPhrase: "Sei wakanonoka?",
        audioText: "Say wah-kah-noh-noh-kah"
      }
    ]
  },
  {
    title: "Negation",
    description: "Learn to make negative statements",
    category: "Grammar",
    orderIndex: 19,
    culturalContext: "Negation can be subtle in Shona - sometimes indirect refusal is more polite",
    exercises: [
      {
        type: "multiple_choice",
        question: "How do you say 'I don't eat' in Shona?",
        correctAnswer: "Handidyi",
        options: JSON.stringify(["Handidyi", "Ndinodya", "Ndisingadyi", "Ndakadya"]),
        englishPhrase: "I don't eat",
        audioText: "Hahn-dee-dyee",
        grammarNote: "Ha- prefix negates present tense"
      },
      {
        type: "translation",
        question: "Translate to English: Haasisataure",
        correctAnswer: "He/she doesn't speak anymore",
        options: JSON.stringify([]),
        shonaPhrase: "Haasisataure",
        englishPhrase: "He/she doesn't speak anymore",
        audioText: "Hah-ah-see-sah-tow-reh"
      },
      {
        type: "multiple_choice",
        question: "What is the negative prefix for 'I' in present tense?",
        correctAnswer: "Ha-",
        options: JSON.stringify(["Ha-", "Ndi-", "A-", "Ti-"]),
        grammarNote: "Ha- + subject prefix + verb stem"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice negative forms",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Handidyi",
              english: "I don't eat",
              phonetic: "hahn-dee-DYEE",
              tonePattern: "LLH"
            },
            {
              shona: "Hautaure",
              english: "You don't speak",
              phonetic: "how-tow-reh",
              tonePattern: "LHL"
            },
            {
              shona: "Haende",
              english: "He/she doesn't go",
              phonetic: "hah-en-deh",
              tonePattern: "LHL"
            }
          ]
        }),
        points: 15
      },
      {
        type: "translation",
        question: "Translate: We don't have money",
        correctAnswer: "Hatina mari",
        options: JSON.stringify([]),
        englishPhrase: "We don't have money",
        shonaPhrase: "Hatina mari",
        audioText: "Hah-tee-nah mah-ree"
      }
    ]
  },
  {
    title: "Possessives",
    description: "Learn to express ownership and possession",
    category: "Grammar",
    orderIndex: 20,
    culturalContext: "Possessives in Shona reflect community ownership concepts as well as individual possession",
    exercises: [
      {
        type: "multiple_choice",
        question: "How do you say 'my book' in Shona?",
        correctAnswer: "Bhuku rangu",
        options: JSON.stringify(["Bhuku rangu", "Bhuku rako", "Bhuku rake", "Bhuku redu"]),
        englishPhrase: "My book",
        audioText: "BHOO-koo rah-ngoo",
        grammarNote: "Possessive pronouns agree with noun class"
      },
      {
        type: "translation",
        question: "Translate to English: Imba yako",
        correctAnswer: "Your house",
        options: JSON.stringify([]),
        shonaPhrase: "Imba yako",
        englishPhrase: "Your house",
        audioText: "Eem-bah yah-koh"
      },
      {
        type: "multiple_choice",
        question: "What is the possessive for 'his/her' with class 1 nouns?",
        correctAnswer: "wake",
        options: JSON.stringify(["wake", "wako", "wangu", "wedu"]),
        grammarNote: "Class 1 nouns use 'w-' possessive prefix"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice possessive forms",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Bhuku rangu",
              english: "My book",
              phonetic: "BHOO-koo rah-ngoo",
              tonePattern: "HLHL"
            },
            {
              shona: "Imba yako",
              english: "Your house",
              phonetic: "EEM-bah yah-koh",
              tonePattern: "HLHL"
            },
            {
              shona: "Mwana wake",
              english: "His/her child",
              phonetic: "MWAH-nah wah-keh",
              tonePattern: "HLHL"
            }
          ]
        }),
        points: 15
      },
      {
        type: "translation",
        question: "Translate: Our car is new",
        correctAnswer: "Mota yedu itsva",
        options: JSON.stringify([]),
        englishPhrase: "Our car is new",
        shonaPhrase: "Mota yedu itsva",
        audioText: "Moh-tah yeh-doo eet-svah"
      }
    ]
  }
];

export const allFoundationLessons = [
  ...foundationLessons,
  ...grammarFoundationLessons
];
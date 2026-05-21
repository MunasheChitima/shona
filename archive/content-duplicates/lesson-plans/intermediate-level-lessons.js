// Intermediate Level Lesson Plans (Lessons 21-40)
// These lessons focus on cultural context, practical situations, and advanced grammar

export const culturalContextLessons = [
  {
    title: "Traditional Shona Culture",
    description: "Learn about Shona cultural practices and beliefs",
    category: "Culture",
    orderIndex: 21,
    culturalContext: "Understanding Shona culture is essential for meaningful communication and respect",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is 'mutupo' in Shona culture?",
        correctAnswer: "Totem/clan identity",
        options: JSON.stringify(["Totem/clan identity", "Traditional dance", "Ancestral spirits", "Marriage ceremony"]),
        shonaPhrase: "Mutupo",
        audioText: "Moo-too-poh",
        culturalNote: "Mutupo defines your clan identity and ancestry"
      },
      {
        type: "translation",
        question: "Translate to English: Madzinza",
        correctAnswer: "Ancestral spirits",
        options: JSON.stringify([]),
        shonaPhrase: "Madzinza",
        englishPhrase: "Ancestral spirits",
        audioText: "Mah-dzee-n-zah"
      },
      {
        type: "voice",
        voiceType: "cultural",
        question: "Practice cultural greetings",
        voiceContent: JSON.stringify({
          phrases: [
            {
              shona: "Makadii, mutupo wenyu ndeupi?",
              english: "How are you, what is your totem?",
              phonetic: "mah-kah-dee moo-too-poh wen-yoo ndeh-oo-pee",
              context: "Formal cultural greeting"
            }
          ]
        }),
        points: 20
      }
    ]
  },
  {
    title: "Proverbs & Wisdom (Tsumo)",
    description: "Learn traditional Shona proverbs and their meanings",
    category: "Culture",
    orderIndex: 23,
    culturalContext: "Proverbs carry deep wisdom and are used to teach life lessons",
    exercises: [
      {
        type: "multiple_choice",
        question: "What does 'Chakafukidza dzimba matenga' mean?",
        correctAnswer: "What destroyed the homes was the roofs",
        options: JSON.stringify(["What destroyed the homes was the roofs", "The house is very big", "We need to build a roof", "The rain is coming"]),
        shonaPhrase: "Chakafukidza dzimba matenga",
        audioText: "Chah-kah-foo-kee-dzah dzeem-bah mah-ten-gah",
        culturalNote: "Means: internal problems destroy from within"
      },
      {
        type: "translation",
        question: "Translate the proverb: Huku huru haizvari",
        correctAnswer: "A big fowl doesn't lay eggs",
        options: JSON.stringify([]),
        shonaPhrase: "Huku huru haizvari",
        englishPhrase: "A big fowl doesn't lay eggs",
        audioText: "Hoo-koo hoo-roo high-zvah-ree",
        culturalNote: "Meaning: appearances can be deceiving"
      }
    ]
  }
];

export const practicalSituationsLessons = [
  {
    title: "At the Doctor/Clinic",
    description: "Medical consultations and health discussions",
    category: "Health",
    orderIndex: 26,
    culturalContext: "Health discussions often involve both modern and traditional medicine",
    exercises: [
      {
        type: "multiple_choice",
        question: "How do you say 'I have a headache' in Shona?",
        correctAnswer: "Musoro wangu unopfuta",
        options: JSON.stringify(["Musoro wangu unopfuta", "Dumbu rangu rinorwadza", "Ndinofema", "Ndinozvimba"]),
        englishPhrase: "I have a headache",
        audioText: "Moo-soh-roh wah-ngoo oo-noh-pfoo-tah"
      },
      {
        type: "voice",
        voiceType: "conversation",
        question: "Practice medical consultation",
        voiceContent: JSON.stringify({
          dialogue: [
            {
              speaker: "Doctor",
              shona: "Mune dambudziko rei nhasi?",
              english: "What problem do you have today?",
              phonetic: "moo-neh dahm-boo-dzee-koh ray n-hah-see"
            },
            {
              speaker: "Patient",
              shona: "Musoro wangu unopfuta kubva mangwanani",
              english: "My head has been aching since morning",
              phonetic: "moo-soh-roh wah-ngoo oo-noh-pfoo-tah koo-bvah mah-ngwah-nah-nee"
            }
          ]
        }),
        points: 25
      }
    ]
  },
  {
    title: "School & Education",
    description: "Educational contexts and academic discussions",
    category: "Education",
    orderIndex: 27,
    culturalContext: "Education is highly valued in Shona culture",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is 'homework' in Shona?",
        correctAnswer: "Basa rekumba",
        options: JSON.stringify(["Basa rekumba", "Basa rechikoro", "Kukodza", "Kudzidza"]),
        englishPhrase: "Homework",
        audioText: "Bah-sah reh-koom-bah"
      },
      {
        type: "translation",
        question: "Translate: The teacher is explaining the lesson",
        correctAnswer: "Mudzidzisi ari kutsanangura chishandiso",
        options: JSON.stringify([]),
        englishPhrase: "The teacher is explaining the lesson",
        shonaPhrase: "Mudzidzisi ari kutsanangura chishandiso",
        audioText: "Moo-dzee-dzee-see ah-ree koo-tsah-nah-ngoo-rah chee-shahn-dee-soh"
      }
    ]
  }
];

export const advancedGrammarLessons = [
  {
    title: "Future Tense",
    description: "Learn to express future actions and plans",
    category: "Grammar",
    orderIndex: 31,
    culturalContext: "Future planning is important in Shona culture but often includes 'kana Mwari achida' (if God wills)",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is the future tense of 'to go' for 'I'?",
        correctAnswer: "Ndichaenda",
        options: JSON.stringify(["Ndichaenda", "Ndakaenda", "Ndinoenda", "Ndingatenda"]),
        englishPhrase: "I will go",
        audioText: "Ndee-chah-en-dah",
        grammarNote: "Future tense uses -cha- infix"
      },
      {
        type: "translation",
        question: "Translate to Shona: We will arrive tomorrow",
        correctAnswer: "Tichasvika mangwana",
        options: JSON.stringify([]),
        englishPhrase: "We will arrive tomorrow",
        shonaPhrase: "Tichasvika mangwana",
        audioText: "Tee-chah-svee-kah mah-ngwah-nah"
      },
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice future tense conjugation",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Ndichaenda",
              english: "I will go",
              phonetic: "ndee-chah-EN-dah",
              tonePattern: "LLHL"
            },
            {
              shona: "Uchauya",
              english: "You will come",
              phonetic: "oo-chah-OO-yah",
              tonePattern: "LLHL"
            },
            {
              shona: "Achashanda",
              english: "He/she will work",
              phonetic: "ah-chah-SHAHN-dah",
              tonePattern: "LLHL"
            }
          ]
        }),
        points: 20
      }
    ]
  },
  {
    title: "Conditional Statements",
    description: "Learn to express conditions and possibilities",
    category: "Grammar",
    orderIndex: 32,
    culturalContext: "Conditional statements are common in Shona for polite requests and hypothetical situations",
    exercises: [
      {
        type: "multiple_choice",
        question: "How do you say 'If I had money' in Shona?",
        correctAnswer: "Dai ndaiva nemari",
        options: JSON.stringify(["Dai ndaiva nemari", "Kana ndine mari", "Ndine mari", "Handina mari"]),
        englishPhrase: "If I had money",
        audioText: "Dah-ee ndah-ee-vah neh-mah-ree",
        grammarNote: "'Dai' expresses contrary-to-fact conditions"
      },
      {
        type: "translation",
        question: "Translate: If it rains, we will stay home",
        correctAnswer: "Kana mvura ikanaya, tichagara kumba",
        options: JSON.stringify([]),
        englishPhrase: "If it rains, we will stay home",
        shonaPhrase: "Kana mvura ikanaya, tichagara kumba",
        audioText: "Kah-nah m-voo-rah ee-kah-nah-yah tee-chah-gah-rah koom-bah"
      }
    ]
  }
];

export const advancedCommunicationLessons = [
  {
    title: "Formal vs Informal Speech",
    description: "Learn appropriate register for different situations",
    category: "Communication",
    orderIndex: 36,
    culturalContext: "Respect and hierarchy are crucial in Shona communication",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is the formal way to say 'How are you?' to an elder?",
        correctAnswer: "Makadii henyu?",
        options: JSON.stringify(["Makadii henyu?", "Wakadii?", "Uri bhoo?", "Makadii iwe?"]),
        englishPhrase: "How are you? (formal)",
        audioText: "Mah-kah-dee hen-yoo",
        culturalNote: "Adding 'henyu' shows respect to elders"
      },
      {
        type: "translation",
        question: "Translate formal request: May I please have some water?",
        correctAnswer: "Ndikumbire mvura henyu?",
        options: JSON.stringify([]),
        englishPhrase: "May I please have some water?",
        shonaPhrase: "Ndikumbire mvura henyu?",
        audioText: "Ndee-koom-bee-reh m-voo-rah hen-yoo"
      }
    ]
  },
  {
    title: "Storytelling & Narratives",
    description: "Master the art of Shona storytelling",
    category: "Culture",
    orderIndex: 38,
    culturalContext: "Storytelling is central to Shona culture for teaching and entertainment",
    exercises: [
      {
        type: "multiple_choice",
        question: "How do traditional Shona stories typically begin?",
        correctAnswer: "Paivapo...",
        options: JSON.stringify(["Paivapo...", "Rimwe zuva...", "Kare kare...", "Mangwanani..."]),
        englishPhrase: "Once upon a time...",
        audioText: "Pah-ee-vah-poh",
        culturalNote: "Traditional opening for folktales"
      },
      {
        type: "voice",
        voiceType: "narrative",
        question: "Practice storytelling opening",
        voiceContent: JSON.stringify({
          story: {
            shona: "Paivapo nzou netsoko zvakanga zvichigara musango",
            english: "Once upon a time, an elephant and a hare lived in the forest",
            phonetic: "pah-ee-vah-poh n-zoh neh-tsoh-koh zvah-kah-ngah zvee-chee-gah-rah moo-sahn-goh",
            context: "Traditional story opening"
          }
        }),
        points: 30
      }
    ]
  }
];

export const allIntermediateLessons = [
  ...culturalContextLessons,
  ...practicalSituationsLessons,
  ...advancedGrammarLessons,
  ...advancedCommunicationLessons
];
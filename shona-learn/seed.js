const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.exercise.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.quest.deleteMany()
  
  // Create quests first
  const questsData = [
    {
      id: "quest-1",
      title: "The Village Greeting",
      description: "Begin your journey by learning to greet people in a Shona village",
      storyNarrative: "You've just arrived in a beautiful Shona village. The villagers are warm and welcoming, but you need to learn their greetings to connect with them. Each person you meet will teach you something new about Shona culture and language.",
      category: "Cultural Immersion",
      orderIndex: 1,
      requiredLevel: 1,
      learningObjectives: JSON.stringify([
        "Master basic Shona greetings",
        "Understand cultural context of greetings",
        "Practice pronunciation with confidence"
      ]),
      discoveryElements: JSON.stringify([
        "Explore different times of day greetings",
        "Discover regional variations in greetings",
        "Learn about the importance of respect in Shona culture"
      ]),
      collaborativeElements: JSON.stringify([
        "Practice greetings with other learners",
        "Share cultural insights from your background",
        "Help others with pronunciation"
      ]),
      intrinsicRewards: JSON.stringify([
        "Feel the joy of connecting with Shona speakers",
        "Experience cultural understanding",
        "Build confidence in language learning"
      ])
    },
    {
      id: "quest-2",
      title: "Family Connections",
      description: "Learn about family relationships and build your Shona family vocabulary",
      storyNarrative: "A family in the village has invited you to their home. You'll learn about family relationships, which are central to Shona culture. Understanding family terms will help you connect more deeply with the community.",
      category: "Family & Relationships",
      orderIndex: 2,
      requiredLevel: 2,
      learningObjectives: JSON.stringify([
        "Learn family member terms",
        "Understand Shona family structure",
        "Practice using family vocabulary in context"
      ]),
      discoveryElements: JSON.stringify([
        "Explore extended family relationships",
        "Discover cultural family values",
        "Learn about family roles in Shona society"
      ]),
      collaborativeElements: JSON.stringify([
        "Share your family structure with others",
        "Practice family conversations together",
        "Create family trees using Shona terms"
      ]),
      intrinsicRewards: JSON.stringify([
        "Deepen understanding of Shona culture",
        "Feel connected to family values",
        "Build meaningful relationships"
      ])
    },
    {
      id: "quest-3",
      title: "Market Adventures",
      description: "Navigate a Shona market using numbers, colors, and basic phrases",
      storyNarrative: "You're exploring a vibrant Shona market where you need to count, identify colors, and negotiate. This real-world scenario will help you apply your language skills in practical situations.",
      category: "Practical Communication",
      orderIndex: 3,
      requiredLevel: 3,
      learningObjectives: JSON.stringify([
        "Master numbers 1-10 in Shona",
        "Learn color vocabulary",
        "Practice basic negotiation phrases"
      ]),
      discoveryElements: JSON.stringify([
        "Explore market culture and traditions",
        "Discover traditional Shona crafts",
        "Learn about local foods and products"
      ]),
      collaborativeElements: JSON.stringify([
        "Role-play market scenarios together",
        "Share market experiences from your culture",
        "Practice bargaining as a group"
      ]),
      intrinsicRewards: JSON.stringify([
        "Experience practical language application",
        "Feel confident in real-world situations",
        "Connect with local culture and commerce"
      ])
    },
    {
      id: "quest-4",
      title: "Voice of the Village",
      description: "Master Shona pronunciation and tones through voice practice",
      storyNarrative: "The village elders want to teach you the proper way to speak Shona. You'll learn the musical tones and sounds that make Shona unique, connecting you more deeply to the language's soul.",
      category: "Pronunciation Mastery",
      orderIndex: 4,
      requiredLevel: 4,
      learningObjectives: JSON.stringify([
        "Master Shona tone patterns",
        "Practice prenasalized consonants",
        "Develop authentic pronunciation"
      ]),
      discoveryElements: JSON.stringify([
        "Explore the musical nature of Shona",
        "Discover how tones change meaning",
        "Learn about regional pronunciation differences"
      ]),
      collaborativeElements: JSON.stringify([
        "Practice pronunciation with native speakers",
        "Record and share pronunciation attempts",
        "Give and receive constructive feedback"
      ]),
      intrinsicRewards: JSON.stringify([
        "Feel the rhythm and beauty of Shona",
        "Build authentic speaking confidence",
        "Connect with the language's musical heritage"
      ])
    },
    {
      id: "quest-5",
      title: "Meeting the Family",
      description: "Visit a Shona family and learn to address each member with proper respect",
      storyNarrative: "You've been invited to visit the Moyo family. This is your chance to learn how to properly greet and address family members in Shona culture. Each family member will teach you their title and the cultural significance behind it.",
      category: "Family & Relationships",
      orderIndex: 5,
      requiredLevel: 2,
      learningObjectives: JSON.stringify([
        "Learn family member titles and names",
        "Understand Shona family hierarchy",
        "Practice respectful family greetings"
      ]),
      discoveryElements: JSON.stringify([
        "Discover extended family relationships",
        "Learn about cultural family values",
        "Explore family roles and responsibilities"
      ]),
      collaborativeElements: JSON.stringify([
        "Role-play family introductions",
        "Share your family structure",
        "Practice family conversations together"
      ]),
      intrinsicRewards: JSON.stringify([
        "Build deeper family connections",
        "Understand cultural respect",
        "Feel part of the family"
      ])
    },
    {
      id: "quest-6",
      title: "Family Dinner",
      description: "Join the family for a traditional Shona meal and learn food vocabulary",
      storyNarrative: "The family has prepared a traditional Shona meal for you. Learn the names of different foods, how to express gratitude, and participate in the cultural experience of sharing a meal together.",
      category: "Family & Relationships",
      orderIndex: 6,
      requiredLevel: 3,
      learningObjectives: JSON.stringify([
        "Learn food and meal vocabulary",
        "Practice expressing gratitude",
        "Understand meal-time customs"
      ]),
      discoveryElements: JSON.stringify([
        "Explore traditional Shona foods",
        "Learn about meal preparation",
        "Discover dining customs and etiquette"
      ]),
      collaborativeElements: JSON.stringify([
        "Share food preferences",
        "Practice meal-time conversations",
        "Learn cooking vocabulary together"
      ]),
      intrinsicRewards: JSON.stringify([
        "Experience cultural dining",
        "Build community through food",
        "Feel welcomed and nourished"
      ])
    },
    {
      id: "quest-7",
      title: "Family Stories",
      description: "Listen to family stories and learn to share your own experiences",
      storyNarrative: "After dinner, the family gathers to share stories. Learn how to listen, ask questions, and share your own experiences in Shona. This is where you'll truly connect with the family's history and culture.",
      category: "Family & Relationships",
      orderIndex: 7,
      requiredLevel: 4,
      learningObjectives: JSON.stringify([
        "Learn storytelling vocabulary",
        "Practice asking and answering questions",
        "Share personal experiences"
      ]),
      discoveryElements: JSON.stringify([
        "Explore family history and traditions",
        "Learn about cultural storytelling",
        "Discover personal connection methods"
      ]),
      collaborativeElements: JSON.stringify([
        "Share your own family stories",
        "Practice storytelling together",
        "Build deeper relationships"
      ]),
      intrinsicRewards: JSON.stringify([
        "Connect through shared stories",
        "Build lasting friendships",
        "Feel part of the family legacy"
      ])
    }
  ]

  // Create quests
  const questMap = new Map()
  for (const questData of questsData) {
    const createdQuest = await prisma.quest.create({
      data: questData
    })
    questMap.set(questData.id, createdQuest.id)
    console.log(`✅ Created quest: ${questData.title}`)
  }

  // Create lessons with exercises
  const lessonsData = [
    {
      id: "lesson-1",
      title: "Mhoro, Shamwari! - Hello, Friend!",
      description: "Learn basic greetings and how to introduce yourself in Shona culture",
      category: "Cultural Immersion",
      orderIndex: 1,
      questId: questMap.get("quest-1"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'mhoro' mean?",
          correctAnswer: "hello (informal)",
          options: JSON.stringify(["hello (informal)", "goodbye", "thank you", "how are you"]),
          shonaPhrase: "mhoro",
          audioText: "mm-HO-ro",
          points: 10
        },
        {
          type: "multiple_choice",
          question: "How do you say 'how are you' formally in Shona?",
          correctAnswer: "makadii",
          options: JSON.stringify(["wakadii", "makadii", "mhoro", "ndatenda"]),
          shonaPhrase: "makadii",
          audioText: "mah-kah-DEE",
          points: 10
        },
        {
          type: "translation",
          question: "Translate to English: shamwari",
          correctAnswer: "friend",
          options: JSON.stringify([]),
          shonaPhrase: "shamwari",
          englishPhrase: "friend",
          audioText: "sham-WAH-ree",
          points: 15
        }
      ]
    },
    {
      id: "lesson-2",
      title: "Ini Ndinonzi - My Name Is",
      description: "Learn to introduce yourself and exchange names in Shona",
      category: "Cultural Immersion",
      orderIndex: 2,
      questId: questMap.get("quest-1"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'zita' mean?",
          correctAnswer: "name",
          options: JSON.stringify(["name", "friend", "hello", "thank you"]),
          shonaPhrase: "zita",
          audioText: "ZEE-tah",
          points: 10
        },
        {
          type: "translation",
          question: "How do you say 'My name is' in Shona?",
          correctAnswer: "Ini ndinonzi",
          options: JSON.stringify([]),
          shonaPhrase: "Ini ndinonzi",
          englishPhrase: "My name is",
          audioText: "EE-nee n-dee-NOH-nzee",
          points: 15
        },
        {
          type: "multiple_choice",
          question: "What is 'one' in Shona?",
          correctAnswer: "potsi",
          options: JSON.stringify(["potsi", "piri", "tatu", "ina"]),
          englishPhrase: "one",
          audioText: "POH-tsee",
          points: 10
        }
      ]
    },
    {
      id: "lesson-3",
      title: "Family Members",
      description: "Learn words for family members",
      category: "Family & Relationships",
      orderIndex: 3,
      questId: questMap.get("quest-2"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'Amai' mean?",
          correctAnswer: "Mother",
          options: JSON.stringify(["Mother", "Father", "Sister", "Brother"]),
          shonaPhrase: "Amai",
          audioText: "Ah-my",
          points: 10
        },
        {
          type: "multiple_choice",
          question: "How do you say 'Father' in Shona?",
          correctAnswer: "Baba",
          options: JSON.stringify(["Amai", "Baba", "Mwana", "Mukoma"]),
          englishPhrase: "Father",
          audioText: "Bah-bah",
          points: 10
        },
        {
          type: "translation",
          question: "Translate to English: Mwana",
          correctAnswer: "Child",
          options: JSON.stringify([]),
          shonaPhrase: "Mwana",
          englishPhrase: "Child",
          audioText: "Mwah-nah",
          points: 15
        }
      ]
    },
    {
      id: "lesson-4",
      title: "Extended Family",
      description: "Learn about extended family relationships",
      category: "Family & Relationships",
      orderIndex: 4,
      questId: questMap.get("quest-2"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What is 'Sister' in Shona?",
          correctAnswer: "Hanzvadzi",
          options: JSON.stringify(["Mukoma", "Hanzvadzi", "Mwana", "Amai"]),
          englishPhrase: "Sister",
          audioText: "Hahn-zvah-dzee",
          points: 10
        },
        {
          type: "translation",
          question: "Translate to Shona: Brother",
          correctAnswer: "Mukoma",
          options: JSON.stringify([]),
          englishPhrase: "Brother",
          shonaPhrase: "Mukoma",
          audioText: "Moo-koh-mah",
          points: 15
        },
        {
          type: "multiple_choice",
          question: "What does 'Sekuru' mean?",
          correctAnswer: "Grandfather",
          options: JSON.stringify(["Grandfather", "Grandmother", "Uncle", "Aunt"]),
          shonaPhrase: "Sekuru",
          audioText: "Seh-koo-roo",
          points: 10
        }
      ]
    },
    {
      id: "lesson-5",
      title: "Colors",
      description: "Learn basic colors in Shona",
      category: "Vocabulary",
      orderIndex: 5,
      questId: questMap.get("quest-3"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What color is 'Chena'?",
          correctAnswer: "White",
          options: JSON.stringify(["White", "Black", "Red", "Blue"]),
          shonaPhrase: "Chena",
          audioText: "Cheh-nah",
          points: 10
        },
        {
          type: "translation",
          question: "Translate to English: Dema",
          correctAnswer: "Black",
          options: JSON.stringify([]),
          shonaPhrase: "Dema",
          englishPhrase: "Black",
          audioText: "Deh-mah",
          points: 15
        },
        {
          type: "multiple_choice",
          question: "How do you say 'Red' in Shona?",
          correctAnswer: "Tsvuku",
          options: JSON.stringify(["Tsvuku", "Chena", "Dema", "Girinhi"]),
          englishPhrase: "Red",
          audioText: "Tsvoo-koo",
          points: 10
        }
      ]
    },
    {
      id: "lesson-6",
      title: "Pronunciation Basics",
      description: "Master Shona sounds",
      category: "Pronunciation",
      orderIndex: 6,
      questId: questMap.get("quest-4"),
      exercises: [
        {
          type: "voice",
          voiceType: "pronunciation",
          question: "Practice pronouncing these greetings",
          voiceContent: JSON.stringify({
            words: [
              {
                shona: "Mangwanani",
                english: "Good morning",
                phonetic: "mah-ngwah-NAH-nee",
                tonePattern: "LLHL"
              },
              {
                shona: "Masikati",
                english: "Good afternoon",
                phonetic: "mah-see-KAH-tee",
                tonePattern: "LLHL"
              },
              {
                shona: "Manheru",
                english: "Good evening",
                phonetic: "mah-NEH-roo",
                tonePattern: "LHL"
              }
            ]
          }),
          points: 10
        }
      ]
    },
    {
      id: "lesson-7",
      title: "Tone Practice",
      description: "Master Shona tones",
      category: "Pronunciation",
      orderIndex: 7,
      questId: questMap.get("quest-4"),
      exercises: [
        {
          type: "voice",
          voiceType: "pronunciation",
          question: "Practice these tone pairs",
          voiceContent: JSON.stringify({
            words: [
              {
                shona: "sara",
                english: "remain (low tones)",
                phonetic: "SAH-rah",
                tonePattern: "LL"
              },
              {
                shona: "sára",
                english: "be satisfied (high-low)",
                phonetic: "SÁH-rah",
                tonePattern: "HL"
              }
            ]
          }),
          points: 15
        }
      ]
    },
    {
      id: "lesson-8",
      title: "Prenasalized Consonants",
      description: "Learn mb, nd, ng sounds",
      category: "Pronunciation",
      orderIndex: 8,
      questId: questMap.get("quest-4"),
      exercises: [
        {
          type: "voice",
          voiceType: "pronunciation",
          question: "Practice prenasalized consonants",
          voiceContent: JSON.stringify({
            words: [
              {
                shona: "mbira",
                english: "thumb piano",
                phonetic: "MBEE-rah",
                tonePattern: "HL"
              },
              {
                shona: "ndimi",
                english: "you (plural)",
                phonetic: "NDEE-mee",
                tonePattern: "HL"
              },
              {
                shona: "ngoma",
                english: "drum",
                phonetic: "NGOH-mah",
                tonePattern: "HL"
              }
            ]
          }),
          points: 12
        }
      ]
    },
    {
      id: "lesson-9",
      title: "Family Greetings",
      description: "Learn to greet family members properly",
      category: "Family & Relationships",
      orderIndex: 9,
      questId: questMap.get("quest-5"),
      exercises: [
        {
          type: "multiple_choice",
          question: "How do you greet your grandfather?",
          correctAnswer: "Mangwanani, Sekuru",
          options: JSON.stringify(["Mangwanani, Sekuru", "Mhoro, Baba", "Masikati, Amai", "Manheru, Mukoma"]),
          shonaPhrase: "Mangwanani, Sekuru",
          audioText: "Mah-ngwah-nah-nee, Seh-koo-roo",
          points: 15
        },
        {
          type: "translation",
          question: "Translate: Good morning, Grandmother",
          correctAnswer: "Mangwanani, Ambuya",
          options: JSON.stringify([]),
          englishPhrase: "Good morning, Grandmother",
          shonaPhrase: "Mangwanani, Ambuya",
          audioText: "Mah-ngwah-nah-nee, Ahm-boo-yah",
          points: 15
        }
      ]
    },
    {
      id: "lesson-10",
      title: "Family Hierarchy",
      description: "Understand Shona family structure and respect",
      category: "Family & Relationships",
      orderIndex: 10,
      questId: questMap.get("quest-5"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What is the most respectful way to address an elder?",
          correctAnswer: "Use their title with proper greeting",
          options: JSON.stringify(["Use their title with proper greeting", "Use their first name", "Just say hello", "Wave and smile"]),
          points: 15
        },
        {
          type: "cultural_context",
          question: "Why is respect important in Shona family culture?",
          correctAnswer: "It shows good upbringing and maintains harmony",
          options: JSON.stringify(["It shows good upbringing and maintains harmony", "It's just tradition", "It's required by law", "It makes you look good"]),
          points: 12
        }
      ]
    },
    {
      id: "lesson-11",
      title: "Food Vocabulary",
      description: "Learn names of traditional Shona foods",
      category: "Family & Relationships",
      orderIndex: 11,
      questId: questMap.get("quest-6"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What is 'sadza'?",
          correctAnswer: "Traditional maize porridge",
          options: JSON.stringify(["Traditional maize porridge", "Meat stew", "Vegetable soup", "Rice dish"]),
          shonaPhrase: "sadza",
          audioText: "SAH-dzah",
          points: 10
        },
        {
          type: "translation",
          question: "Translate: Thank you for the food",
          correctAnswer: "Ndatenda nekudya",
          options: JSON.stringify([]),
          englishPhrase: "Thank you for the food",
          shonaPhrase: "Ndatenda nekudya",
          audioText: "N-dah-ten-dah neh-koo-dyah",
          points: 15
        }
      ]
    },
    {
      id: "lesson-12",
      title: "Meal Customs",
      description: "Learn about Shona dining customs and etiquette",
      category: "Family & Relationships",
      orderIndex: 12,
      questId: questMap.get("quest-6"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What should you do before eating in a Shona home?",
          correctAnswer: "Wash your hands and say grace",
          options: JSON.stringify(["Wash your hands and say grace", "Start eating immediately", "Wait for everyone to sit", "Ask for a fork"]),
          points: 10
        },
        {
          type: "cultural_context",
          question: "Why is sharing food important in Shona culture?",
          correctAnswer: "It builds community and shows hospitality",
          options: JSON.stringify(["It builds community and shows hospitality", "It saves money", "It's required by tradition", "It makes food taste better"]),
          points: 12
        }
      ]
    },
    {
      id: "lesson-13",
      title: "Storytelling Vocabulary",
      description: "Learn words for sharing stories and experiences",
      category: "Family & Relationships",
      orderIndex: 13,
      questId: questMap.get("quest-7"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'nyaya' mean?",
          correctAnswer: "Story",
          options: JSON.stringify(["Story", "Question", "Answer", "Word"]),
          shonaPhrase: "nyaya",
          audioText: "NYAH-yah",
          points: 10
        },
        {
          type: "translation",
          question: "Translate: Tell me a story",
          correctAnswer: "Ndiudze nyaya",
          options: JSON.stringify([]),
          englishPhrase: "Tell me a story",
          shonaPhrase: "Ndiudze nyaya",
          audioText: "N-dee-OO-dzeh NYAH-yah",
          points: 15
        }
      ]
    },
    {
      id: "lesson-14",
      title: "Sharing Experiences",
      description: "Learn to share your own experiences in Shona",
      category: "Family & Relationships",
      orderIndex: 14,
      questId: questMap.get("quest-7"),
      exercises: [
        {
          type: "multiple_choice",
          question: "How do you say 'I want to share' in Shona?",
          correctAnswer: "Ndinoda kugovera",
          options: JSON.stringify(["Ndinoda kugovera", "Ndinoda kutaura", "Ndinoda kuona", "Ndinoda kunzwa"]),
          shonaPhrase: "Ndinoda kugovera",
          audioText: "N-dee-NOH-dah koo-goh-VEH-rah",
          points: 15
        },
        {
          type: "cultural_context",
          question: "Why is storytelling important in Shona culture?",
          correctAnswer: "It preserves history and builds connections",
          options: JSON.stringify(["It preserves history and builds connections", "It's just entertainment", "It passes time", "It's required by elders"]),
          points: 12
        }
      ]
    }
  ]

  for (const lessonData of lessonsData) {
    const { exercises, ...lesson } = lessonData
    
    const createdLesson = await prisma.lesson.create({
      data: lesson
    })
    
    for (const exercise of exercises) {
      await prisma.exercise.create({
        data: {
          ...exercise,
          lessonId: createdLesson.id
        }
      })
    }
    
    console.log(`✅ Created lesson: ${lesson.title} with ${exercises.length} exercises`)
  }
  
  console.log('🎉 Database seeded successfully!')
  console.log(`📚 Created ${lessonsData.length} lessons`)
  console.log(`🗺️  Created ${questsData.length} quests`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
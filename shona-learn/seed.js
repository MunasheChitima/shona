const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.exercise.deleteMany()
  await prisma.lesson.deleteMany()
  
  // Create lessons with exercises
  const lessonsData = [
    {
      title: "Greetings & Basics",
      description: "Learn essential Shona greetings",
      category: "Basics",
      orderIndex: 1,
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'Mangwanani' mean?",
          correctAnswer: "Good morning",
          options: JSON.stringify(["Good morning", "Good evening", "Thank you", "Hello"]),
          shonaPhrase: "Mangwanani",
          audioText: "Mah-ngwah-nah-nee"
        },
        {
          type: "multiple_choice",
          question: "How do you say 'Good afternoon' in Shona?",
          correctAnswer: "Masikati",
          options: JSON.stringify(["Manheru", "Masikati", "Mangwanani", "Ndatenda"]),
          englishPhrase: "Good afternoon",
          audioText: "Mah-see-kah-tee"
        },
        {
          type: "translation",
          question: "Translate to English: Manheru",
          correctAnswer: "Good evening",
          options: JSON.stringify([]),
          shonaPhrase: "Manheru",
          englishPhrase: "Good evening",
          audioText: "Mah-neh-roo"
        },
        {
          type: "multiple_choice",
          question: "What is the correct response to 'Makadii?' (How are you?)",
          correctAnswer: "Ndiripo",
          options: JSON.stringify(["Ndiripo", "Mangwanani", "Ndatenda", "Masikati"]),
          shonaPhrase: "Makadii?",
          audioText: "Mah-kah-dee"
        },
        {
          type: "translation",
          question: "Translate to Shona: Thank you",
          correctAnswer: "Ndatenda",
          options: JSON.stringify([]),
          englishPhrase: "Thank you",
          shonaPhrase: "Ndatenda",
          audioText: "N-dah-ten-dah"
        }
      ]
    },
    {
      title: "Numbers 1-10",
      description: "Count from 1 to 10 in Shona",
      category: "Numbers",
      orderIndex: 2,
      exercises: [
        {
          type: "multiple_choice",
          question: "What is 'one' in Shona?",
          correctAnswer: "Potsi",
          options: JSON.stringify(["Potsi", "Piri", "Tatu", "Ina"]),
          englishPhrase: "One",
          audioText: "Poh-tsee"
        },
        {
          type: "matching",
          question: "Match the numbers",
          correctAnswer: "2-Piri",
          options: JSON.stringify(["1-Potsi", "2-Piri", "3-Tatu", "4-Ina"]),
          shonaPhrase: "Piri",
          audioText: "Pee-ree"
        },
        {
          type: "multiple_choice",
          question: "What number is 'Tatu'?",
          correctAnswer: "Three",
          options: JSON.stringify(["One", "Two", "Three", "Four"]),
          shonaPhrase: "Tatu",
          audioText: "Tah-too"
        },
        {
          type: "translation",
          question: "Translate to Shona: Five",
          correctAnswer: "Shanu",
          options: JSON.stringify([]),
          englishPhrase: "Five",
          shonaPhrase: "Shanu",
          audioText: "Shah-noo"
        },
        {
          type: "multiple_choice",
          question: "What is 'Gumi' in English?",
          correctAnswer: "Ten",
          options: JSON.stringify(["Eight", "Nine", "Ten", "Seven"]),
          shonaPhrase: "Gumi",
          audioText: "Goo-mee"
        }
      ]
    },
    {
      title: "Family Members",
      description: "Learn words for family members",
      category: "Family",
      orderIndex: 3,
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'Amai' mean?",
          correctAnswer: "Mother",
          options: JSON.stringify(["Mother", "Father", "Sister", "Brother"]),
          shonaPhrase: "Amai",
          audioText: "Ah-my"
        },
        {
          type: "multiple_choice",
          question: "How do you say 'Father' in Shona?",
          correctAnswer: "Baba",
          options: JSON.stringify(["Amai", "Baba", "Mwana", "Mukoma"]),
          englishPhrase: "Father",
          audioText: "Bah-bah"
        },
        {
          type: "translation",
          question: "Translate to English: Mwana",
          correctAnswer: "Child",
          options: JSON.stringify([]),
          shonaPhrase: "Mwana",
          englishPhrase: "Child",
          audioText: "Mwah-nah"
        },
        {
          type: "multiple_choice",
          question: "What is 'Sister' in Shona?",
          correctAnswer: "Hanzvadzi",
          options: JSON.stringify(["Mukoma", "Hanzvadzi", "Mwana", "Amai"]),
          englishPhrase: "Sister",
          audioText: "Hahn-zvah-dzee"
        },
        {
          type: "translation",
          question: "Translate to Shona: Brother",
          correctAnswer: "Mukoma",
          options: JSON.stringify([]),
          englishPhrase: "Brother",
          shonaPhrase: "Mukoma",
          audioText: "Moo-koh-mah"
        }
      ]
    },
    {
      title: "Common Verbs",
      description: "Essential action words",
      category: "Verbs",
      orderIndex: 4,
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'Kuda' mean?",
          correctAnswer: "To want/like",
          options: JSON.stringify(["To want/like", "To go", "To eat", "To sleep"]),
          shonaPhrase: "Kuda",
          audioText: "Koo-dah"
        },
        {
          type: "translation",
          question: "Translate to English: Kuenda",
          correctAnswer: "To go",
          options: JSON.stringify([]),
          shonaPhrase: "Kuenda",
          englishPhrase: "To go",
          audioText: "Koo-en-dah"
        },
        {
          type: "multiple_choice",
          question: "How do you say 'To eat' in Shona?",
          correctAnswer: "Kudya",
          options: JSON.stringify(["Kurara", "Kudya", "Kumira", "Kutaura"]),
          englishPhrase: "To eat",
          audioText: "Koo-dyah"
        },
        {
          type: "translation",
          question: "Translate: Kurara",
          correctAnswer: "To sleep",
          options: JSON.stringify([]),
          shonaPhrase: "Kurara",
          englishPhrase: "To sleep",
          audioText: "Koo-rah-rah"
        },
        {
          type: "multiple_choice",
          question: "What is 'To speak' in Shona?",
          correctAnswer: "Kutaura",
          options: JSON.stringify(["Kutaura", "Kuona", "Kunzwa", "Kubata"]),
          englishPhrase: "To speak",
          audioText: "Koo-tow-rah"
        }
      ]
    },
    {
      title: "Colors",
      description: "Learn basic colors in Shona",
      category: "Vocabulary",
      orderIndex: 5,
      exercises: [
        {
          type: "multiple_choice",
          question: "What color is 'Chena'?",
          correctAnswer: "White",
          options: JSON.stringify(["White", "Black", "Red", "Blue"]),
          shonaPhrase: "Chena",
          audioText: "Cheh-nah"
        },
        {
          type: "translation",
          question: "Translate to English: Dema",
          correctAnswer: "Black",
          options: JSON.stringify([]),
          shonaPhrase: "Dema",
          englishPhrase: "Black",
          audioText: "Deh-mah"
        },
        {
          type: "multiple_choice",
          question: "How do you say 'Red' in Shona?",
          correctAnswer: "Tsvuku",
          options: JSON.stringify(["Tsvuku", "Chena", "Dema", "Girinhi"]),
          englishPhrase: "Red",
          audioText: "Tsvoo-koo"
        },
        {
          type: "translation",
          question: "Translate: Bhuruu",
          correctAnswer: "Blue",
          options: JSON.stringify([]),
          shonaPhrase: "Bhuruu",
          englishPhrase: "Blue",
          audioText: "Bhoo-roo"
        },
        {
          type: "multiple_choice",
          question: "What is 'Green' in Shona?",
          correctAnswer: "Girinhi",
          options: JSON.stringify(["Yero", "Girinhi", "Tsvuku", "Bhuruu"]),
          englishPhrase: "Green",
          audioText: "Gee-reen-hee"
        }
      ]
    },
    {
      title: "Pronunciation Basics",
      description: "Master Shona sounds",
      category: "Pronunciation",
      orderIndex: 6,
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
      title: "Tone Practice",
      description: "Master Shona tones",
      category: "Pronunciation",
      orderIndex: 7,
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
      title: "Prenasalized Consonants",
      description: "Learn mb, nd, ng sounds",
      category: "Pronunciation",
      orderIndex: 8,
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
  }
  
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
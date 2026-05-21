export const voiceLessons = [
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
  },
  {
    title: "Whistling Sounds",
    description: "Master sv, zv, ts sounds",
    category: "Pronunciation",
    orderIndex: 9,
    exercises: [
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice whistling fricatives",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "svika",
              english: "arrive",
              phonetic: "SVEE-kah",
              tonePattern: "HL"
            },
            {
              shona: "zvino",
              english: "now",
              phonetic: "ZVEE-noh",
              tonePattern: "HL"
            },
            {
              shona: "tsva",
              english: "new",
              phonetic: "TSVAH",
              tonePattern: "H"
            }
          ]
        }),
        points: 15
      }
    ]
  },
  {
    title: "Essential Phrases",
    description: "Common expressions",
    category: "Conversation",
    orderIndex: 10,
    exercises: [
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice essential phrases",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Ndatenda zvikuru",
              english: "Thank you very much",
              phonetic: "ndah-TEN-dah zvee-KOO-roo",
              tonePattern: "LHLHL"
            },
            {
              shona: "Zita rangu ndi",
              english: "My name is",
              phonetic: "ZEE-tah RAH-ngoo ndee",
              tonePattern: "HLHLH"
            }
          ]
        }),
        points: 20
      }
    ]
  }
]

export const pronunciationExercises = [
  // Prenasalized consonants
  {
    category: "Prenasalized Consonants",
    words: [
      { shona: "mbira", english: "thumb piano", phonetic: "MBEE-rah", tonePattern: "HL" },
      { shona: "ndimi", english: "you (plural)", phonetic: "NDEE-mee", tonePattern: "HL" },
      { shona: "ngoma", english: "drum", phonetic: "NGOH-mah", tonePattern: "HL" }
    ]
  },
  // Whistling fricatives
  {
    category: "Whistling Sounds",
    words: [
      { shona: "svika", english: "arrive", phonetic: "SVEE-kah", tonePattern: "HL" },
      { shona: "zvino", english: "now", phonetic: "ZVEE-noh", tonePattern: "HL" },
      { shona: "tsva", english: "new", phonetic: "TSVAH", tonePattern: "H" }
    ]
  },
  // Common phrases
  {
    category: "Essential Phrases",
    words: [
      { shona: "Ndatenda zvikuru", english: "Thank you very much", phonetic: "ndah-TEN-dah zvee-KOO-roo", tonePattern: "LHLHL" },
      { shona: "Zita rangu ndi", english: "My name is", phonetic: "ZEE-tah RAH-ngoo ndee", tonePattern: "HLHLH" }
    ]
  }
] 
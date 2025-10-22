// Advanced Level Lesson Plans (Lessons 41-50)
// These lessons focus on literature, media, and specialized topics

export const literatureMediaLessons = [
  {
    title: "Reading Shona Literature",
    description: "Explore classic and contemporary Shona literature",
    category: "Literature",
    orderIndex: 41,
    culturalContext: "Shona literature reflects the rich oral and written traditions of Zimbabwe",
    exercises: [
      {
        type: "multiple_choice",
        question: "Who wrote 'Feso' - a classic Shona novel?",
        correctAnswer: "Solomon Mutswairo",
        options: JSON.stringify(["Solomon Mutswairo", "Charles Mungoshi", "Ignatius Mabasa", "Wilson Katiyo"]),
        culturalNote: "Solomon Mutswairo is considered the father of Shona literature"
      },
      {
        type: "translation",
        question: "Translate this literary phrase: 'Rudo rwakandisiya ndiri nhava'",
        correctAnswer: "Love has left me poor/empty",
        options: JSON.stringify([]),
        shonaPhrase: "Rudo rwakandisiya ndiri nhava",
        englishPhrase: "Love has left me poor/empty",
        audioText: "Roo-doh rwah-kahn-dee-see-yah ndee-ree n-hah-vah",
        culturalNote: "Common theme in Shona poetry about lost love"
      },
      {
        type: "voice",
        voiceType: "literary",
        question: "Practice reading Shona poetry",
        voiceContent: JSON.stringify({
          poem: {
            shona: "Gomo guru richachema, nokuti mwana waro afira kure",
            english: "The great mountain will cry, because its child died far away",
            phonetic: "goh-moh goo-roo ree-chah-cheh-mah noh-koo-tee mwah-nah wah-roh ah-fee-rah koo-reh",
            context: "Traditional praise poetry style"
          }
        }),
        points: 35
      }
    ]
  },
  {
    title: "News & Current Events",
    description: "Understand news language and current affairs",
    category: "Media",
    orderIndex: 42,
    culturalContext: "Understanding news helps with contemporary Shona and current issues",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is 'government' in Shona?",
        correctAnswer: "Hurumende",
        options: JSON.stringify(["Hurumende", "Mutungamiri", "Sangano", "Bato"]),
        englishPhrase: "Government",
        audioText: "Hoo-roo-men-deh"
      },
      {
        type: "translation",
        question: "Translate: The economy is improving",
        correctAnswer: "Upfumi hwenyika huri kunatsiridzika",
        options: JSON.stringify([]),
        englishPhrase: "The economy is improving",
        shonaPhrase: "Upfumi hwenyika huri kunatsiridzika",
        audioText: "Oo-pfoo-mee hwen-yee-kah hoo-ree koo-nah-tsee-ree-dzee-kah"
      },
      {
        type: "voice",
        voiceType: "news",
        question: "Practice news vocabulary",
        voiceContent: JSON.stringify({
          news: [
            {
              shona: "Mutungamiri wenyika",
              english: "President of the country",
              phonetic: "moo-toon-gah-mee-ree wen-yee-kah"
            },
            {
              shona: "Nhaurirano dzemahofisi",
              english: "Government meetings",
              phonetic: "n-how-ree-rah-noh dzeh-mah-hoh-fee-see"
            }
          ]
        }),
        points: 30
      }
    ]
  },
  {
    title: "Poetry & Songs",
    description: "Appreciate Shona poetry and traditional songs",
    category: "Literature",
    orderIndex: 43,
    culturalContext: "Poetry and songs are integral to Shona cultural expression",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is the traditional Shona praise poetry called?",
        correctAnswer: "Nhetembo dzerukudzo",
        options: JSON.stringify(["Nhetembo dzerukudzo", "Rwiyo rwechinyakare", "Mashoko echikoro", "Tsumo dzechishona"]),
        englishPhrase: "Praise poetry",
        audioText: "n-heh-tem-boh dzeh-roo-koo-dzoh"
      },
      {
        type: "translation",
        question: "Translate this song line: 'Naizvozvo takambotaura'",
        correctAnswer: "That's why we spoke/said",
        options: JSON.stringify([]),
        shonaPhrase: "Naizvozvo takambotaura",
        englishPhrase: "That's why we spoke/said",
        audioText: "Nah-ee-zvoh-zvoh tah-kahm-boh-tow-rah"
      }
    ]
  }
];

export const specializedTopicsLessons = [
  {
    title: "Business & Commerce",
    description: "Professional business communication in Shona",
    category: "Business",
    orderIndex: 46,
    culturalContext: "Business relationships in Shona culture emphasize trust and personal connections",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is 'profit' in Shona business terms?",
        correctAnswer: "Purofiti",
        options: JSON.stringify(["Purofiti", "Mukana", "Mutengesi", "Chirevo"]),
        englishPhrase: "Profit",
        audioText: "Poo-roh-fee-tee"
      },
      {
        type: "translation",
        question: "Translate: We need to discuss the contract",
        correctAnswer: "Tinofanira kutaura nezve chibvumirano",
        options: JSON.stringify([]),
        englishPhrase: "We need to discuss the contract",
        shonaPhrase: "Tinofanira kutaura nezve chibvumirano",
        audioText: "Tee-noh-fah-nee-rah koo-tow-rah nez-veh chee-bvoo-mee-rah-noh"
      },
      {
        type: "voice",
        voiceType: "business",
        question: "Practice business meeting dialogue",
        voiceContent: JSON.stringify({
          meeting: [
            {
              speaker: "Manager",
              shona: "Tinofanira kuwedzera mibairo yevashandi",
              english: "We need to increase employee salaries",
              phonetic: "tee-noh-fah-nee-rah koo-weh-dzeh-rah mee-bah-ee-roh yeh-vah-shahn-dee"
            },
            {
              speaker: "Employee",
              shona: "Tinotenda henyu nekufunga kwedu",
              english: "We thank you for thinking of us",
              phonetic: "tee-noh-ten-dah hen-yoo neh-koo-foon-gah kweh-doo"
            }
          ]
        }),
        points: 40
      }
    ]
  },
  {
    title: "Academic & Scientific Terms",
    description: "Advanced academic and scientific vocabulary",
    category: "Academic",
    orderIndex: 47,
    culturalContext: "Academic discourse in Shona bridges traditional knowledge and modern science",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is 'research' in Shona?",
        correctAnswer: "Tsvagiridzo",
        options: JSON.stringify(["Tsvagiridzo", "Kudzidza", "Kuronga", "Kufungidzira"]),
        englishPhrase: "Research",
        audioText: "Tsvah-gee-ree-dzoh"
      },
      {
        type: "translation",
        question: "Translate: The hypothesis was proven correct",
        correctAnswer: "Fungidziro yakaratidza kuti yaive chokwadi",
        options: JSON.stringify([]),
        englishPhrase: "The hypothesis was proven correct",
        shonaPhrase: "Fungidziro yakaratidza kuti yaive chokwadi",
        audioText: "Foon-gee-dzee-roh yah-kah-rah-tee-dzah koo-tee yah-ee-veh choh-kwah-dee"
      }
    ]
  },
  {
    title: "Agriculture & Rural Life",
    description: "Traditional and modern agricultural practices",
    category: "Agriculture",
    orderIndex: 49,
    culturalContext: "Agriculture is central to Shona life and connects to traditional ecological knowledge",
    exercises: [
      {
        type: "multiple_choice",
        question: "What is 'plowing season' in Shona?",
        correctAnswer: "Nguva yokurima",
        options: JSON.stringify(["Nguva yokurima", "Nguva yokukohwa", "Nguva yokudyara", "Nguva yokusarudza"]),
        englishPhrase: "Plowing season",
        audioText: "Ngoo-vah yoh-koo-ree-mah"
      },
      {
        type: "translation",
        question: "Translate: The crops are ready for harvest",
        correctAnswer: "Zvirimwa zvakaibva kukohwa",
        options: JSON.stringify([]),
        englishPhrase: "The crops are ready for harvest",
        shonaPhrase: "Zvirimwa zvakaibva kukohwa",
        audioText: "Zvee-reem-wah zvah-kah-ee-bvah koo-koh-wah"
      },
      {
        type: "voice",
        voiceType: "agricultural",
        question: "Practice farming vocabulary",
        voiceContent: JSON.stringify({
          farming: [
            {
              shona: "Kurima",
              english: "To plow/farm",
              phonetic: "koo-REE-mah"
            },
            {
              shona: "Kukohwa",
              english: "To harvest",
              phonetic: "koo-KOH-wah"
            },
            {
              shona: "Mbeu",
              english: "Seeds",
              phonetic: "m-BEH-oo"
            }
          ]
        }),
        points: 25
      }
    ]
  },
  {
    title: "Tourism & Travel",
    description: "Travel and tourism in Zimbabwe",
    category: "Tourism",
    orderIndex: 50,
    culturalContext: "Zimbabwe's tourism showcases both natural beauty and cultural heritage",
    exercises: [
      {
        type: "multiple_choice",
        question: "What are the Victoria Falls called in Shona?",
        correctAnswer: "Mosi-oa-tunya",
        options: JSON.stringify(["Mosi-oa-tunya", "Chipinge", "Mazowe", "Mukuvisi"]),
        englishPhrase: "Victoria Falls",
        audioText: "Moh-see-oh-ah-toon-yah",
        culturalNote: "Means 'the smoke that thunders' in local language"
      },
      {
        type: "translation",
        question: "Translate: The tourist wants to visit the ruins",
        correctAnswer: "Mushandi wekusasa anoda kushanyira matongo",
        options: JSON.stringify([]),
        englishPhrase: "The tourist wants to visit the ruins",
        shonaPhrase: "Mushandi wekusasa anoda kushanyira matongo",
        audioText: "Moo-shahn-dee weh-koo-sah-sah ah-noh-dah koo-shah-nyee-rah mah-tohn-goh"
      },
      {
        type: "voice",
        voiceType: "tourism",
        question: "Practice tourism dialogue",
        voiceContent: JSON.stringify({
          tourism: [
            {
              speaker: "Guide",
              shona: "Matongo eGreat Zimbabwe akavakwa kare",
              english: "The Great Zimbabwe ruins were built long ago",
              phonetic: "mah-tohn-goh eh-great zim-bah-bweh ah-kah-vah-kwah kah-reh"
            },
            {
              speaker: "Tourist",
              shona: "Zvakavakwa nei kare?",
              english: "Why were they built long ago?",
              phonetic: "zvah-kah-vah-kwah nay kah-reh"
            }
          ]
        }),
        points: 35
      }
    ]
  }
];

export const allAdvancedLessons = [
  ...literatureMediaLessons,
  ...specializedTopicsLessons
];
// Fluent & Conversational Level Lesson Plans (Lessons 51-100+)
// These lessons build upon foundation, intermediate, and advanced levels for true fluency

export const fluentConversationalLessons = [
  // Advanced Grammar Lessons (51-60)
  {
    title: "Complex Verb Tenses & Aspects",
    description: "Master advanced tense-aspect combinations for nuanced expression",
    category: "Grammar",
    orderIndex: 51,
    culturalContext: "Understanding subtle temporal distinctions is crucial for native-like fluency",
    exercises: [
      {
        type: "multiple_choice",
        question: "How do you express 'I will have been working' in Shona?",
        correctAnswer: "Ndichave ndichishanda",
        options: JSON.stringify([
          "Ndichave ndichishanda",
          "Ndaishanda", 
          "Ndinoshanda",
          "Ndichashanda"
        ]),
        englishPhrase: "I will have been working",
        audioText: "Ndee-chah-veh ndee-chee-shahn-dah",
        culturalNote: "Future perfect progressive - shows ongoing action that will be completed"
      },
      {
        type: "translation",
        question: "Translate: By the time you arrive, I will have finished",
        correctAnswer: "Panguva yaunosvika, ndichave ndapedza",
        options: JSON.stringify([]),
        englishPhrase: "By the time you arrive, I will have finished",
        shonaPhrase: "Panguva yaunosvika, ndichave ndapedza",
        audioText: "Pah-ngoo-vah yow-noh-svee-kah, ndee-chah-veh ndah-peh-dzah"
      },
      {
        type: "voice",
        voiceType: "grammar",
        question: "Practice complex tense formations",
        voiceContent: JSON.stringify({
          constructions: [
            {
              pattern: "Ndanga ndichishanda",
              meaning: "I was working (past progressive)",
              usage: "Ongoing action in the past"
            },
            {
              pattern: "Ndichave ndapedza",
              meaning: "I will have finished (future perfect)",
              usage: "Completed action by future time"
            },
            {
              pattern: "Ndaiva ndichishanda",
              meaning: "I had been working (past perfect progressive)",
              usage: "Ongoing action before past event"
            }
          ]
        }),
        points: 20
      },
      {
        type: "matching",
        question: "Match the tense-aspect combinations with their meanings",
        correctAnswer: "Past-Progressive=Was doing",
        options: JSON.stringify([
          "Ndanga ndichi- = Past Progressive",
          "Ndichave nda- = Future Perfect",
          "Ndaiva ndichi- = Past Perfect Progressive",
          "Ndinenge ndichi- = Future Progressive"
        ])
      }
    ]
  },
  {
    title: "Subjunctive Mood & Hypotheticals",
    description: "Express wishes, possibilities, and contrary-to-fact situations",
    category: "Grammar",
    orderIndex: 52,
    culturalContext: "The subjunctive is essential for polite requests and hypothetical discussions",
    exercises: [
      {
        type: "multiple_choice",
        question: "How do you say 'If I were rich, I would buy a house'?",
        correctAnswer: "Dai ndaiva nepfuma, ndaitenga imba",
        options: JSON.stringify([
          "Dai ndaiva nepfuma, ndaitenga imba",
          "Kana ndine pfuma, ndinotenga imba",
          "Ndine pfuma, ndotenga imba",
          "Ndaiva nepfuma, ndatenga imba"
        ]),
        culturalNote: "The 'dai' construction indicates contrary-to-fact conditional"
      },
      {
        type: "translation",
        question: "Translate: I wish you could come",
        correctAnswer: "Ndinoshuva kuti dai wauya",
        options: JSON.stringify([]),
        englishPhrase: "I wish you could come",
        shonaPhrase: "Ndinoshuva kuti dai wauya",
        audioText: "Ndee-noh-shoo-vah koo-tee dah-ee wow-yah"
      },
      {
        type: "voice",
        voiceType: "grammar",
        question: "Practice subjunctive constructions",
        voiceContent: JSON.stringify({
          patterns: [
            {
              shona: "Dai ndaiva...",
              english: "If I were...",
              usage: "Contrary-to-fact condition"
            },
            {
              shona: "Ndinoshuva kuti dai...",
              english: "I wish that...",
              usage: "Expressing wishes"
            },
            {
              shona: "Zvingava zvakanaka kuti...",
              english: "It would be good if...",
              usage: "Polite suggestion"
            }
          ]
        }),
        points: 15
      }
    ]
  },
  {
    title: "Passive Voice Mastery",
    description: "Advanced passive constructions and when to use them",
    category: "Grammar",
    orderIndex: 53,
    culturalContext: "Passive voice is often used to show respect or avoid direct blame",
    exercises: [
      {
        type: "multiple_choice",
        question: "How is 'The food is being cooked' expressed in passive?",
        correctAnswer: "Kudya kuri kubikwa",
        options: JSON.stringify([
          "Kudya kuri kubikwa",
          "Vanobika kudya",
          "Kudya kunobikwa",
          "Kubika kudya"
        ]),
        englishPhrase: "The food is being cooked",
        audioText: "Koo-dyah koo-ree koo-beek-wah"
      },
      {
        type: "translation",
        question: "Translate to passive: They built the house last year",
        correctAnswer: "Imba yakavakwa gore rapera",
        options: JSON.stringify([]),
        englishPhrase: "The house was built last year (passive)",
        shonaPhrase: "Imba yakavakwa gore rapera",
        audioText: "Eem-bah yah-kah-vah-kwah goh-reh rah-peh-rah"
      },
      {
        type: "voice",
        voiceType: "grammar",
        question: "Practice active to passive transformations",
        voiceContent: JSON.stringify({
          transformations: [
            {
              active: "Vanodyisa vana",
              passive: "Vana vanodyiswa",
              english: "They feed children → Children are fed"
            },
            {
              active: "Akanyora tsamba",
              passive: "Tsamba yakanyorwa",
              english: "He wrote a letter → A letter was written"
            }
          ]
        }),
        points: 18
      }
    ]
  },
  {
    title: "Causative Constructions",
    description: "Express making someone do something or having something done",
    category: "Grammar",
    orderIndex: 54,
    culturalContext: "Causatives are important in hierarchical relationships and delegation",
    exercises: [
      {
        type: "multiple_choice",
        question: "How do you say 'I made him laugh'?",
        correctAnswer: "Ndakamusekesa",
        options: JSON.stringify([
          "Ndakamusekesa",
          "Akaseka",
          "Ndinoseka",
          "Tanosekana"
        ]),
        culturalNote: "The causative suffix '-esa' means 'to cause to'"
      },
      {
        type: "translation",
        question: "Translate: She is having her hair done",
        correctAnswer: "Ari kuitiswa bvudzi",
        options: JSON.stringify([]),
        englishPhrase: "She is having her hair done",
        shonaPhrase: "Ari kuitiswa bvudzi",
        audioText: "Ah-ree koo-ee-tees-wah bvoo-dzee"
      },
      {
        type: "matching",
        question: "Match causative verbs with their meanings",
        correctAnswer: "kudyisa=to feed (cause to eat)",
        options: JSON.stringify([
          "kudya → kudyisa = to eat → to feed",
          "kuseka → kusekesa = to laugh → to make laugh",
          "kurara → kurarisa = to sleep → to put to sleep",
          "kunwa → kunwisa = to drink → to give drink"
        ])
      }
    ]
  },
  {
    title: "Serial Verb Constructions",
    description: "Combine multiple verbs for complex meanings",
    category: "Grammar", 
    orderIndex: 55,
    culturalContext: "Serial verbs allow expression of complex actions common in Shona narrative",
    exercises: [
      {
        type: "multiple_choice",
        question: "What does 'Akamuka akaenda' mean?",
        correctAnswer: "He woke up and went",
        options: JSON.stringify([
          "He woke up and went",
          "He will wake up",
          "He is going to wake up",
          "He went to wake up"
        ]),
        culturalNote: "Serial verbs show sequential actions"
      },
      {
        type: "voice",
        voiceType: "grammar",
        question: "Practice serial verb constructions",
        voiceContent: JSON.stringify({
          sequences: [
            {
              shona: "Akauya akatanga kushanda",
              english: "He came and started working",
              pattern: "Past + Past for sequence"
            },
            {
              shona: "Enda unotenga",
              english: "Go and buy",
              pattern: "Imperative + Subjunctive for purpose"
            }
          ]
        }),
        points: 16
      }
    ]
  },
  
  // Advanced Conversational Skills (61-75)
  {
    title: "Professional Presentations",
    description: "Learn to give presentations and speeches in formal Shona",
    category: "Professional",
    orderIndex: 61,
    culturalContext: "Professional presentations blend traditional oratory with modern business needs",
    exercises: [
      {
        type: "voice",
        voiceType: "presentation",
        question: "Practice presentation openings",
        voiceContent: JSON.stringify({
          phrases: [
            {
              shona: "Mangwanani mose, ndinofara kuva pano nhasi",
              english: "Good morning everyone, I'm happy to be here today",
              context: "Formal opening"
            },
            {
              shona: "Nhasi ndinoda kukurukurai nezvekuvandudza bhizinesi redu",
              english: "Today I want to discuss improving our business",
              context: "Stating purpose"
            },
            {
              shona: "Sekutanga, regai nditaure nezve...",
              english: "First, let me talk about...",
              context: "Structuring presentation"
            }
          ]
        }),
        points: 20
      },
      {
        type: "multiple_choice",
        question: "How do you say 'In conclusion' formally?",
        correctAnswer: "Mukupedzisa",
        options: JSON.stringify([
          "Mukupedzisa",
          "Pakupera",
          "Zvekupedzisira",
          "Ndopera"
        ]),
        englishPhrase: "In conclusion",
        audioText: "Moo-koo-peh-dzee-sah"
      },
      {
        type: "conversation",
        question: "Practice Q&A session phrases",
        conversationType: "presentation_qa",
        voiceContent: JSON.stringify({
          exchanges: [
            {
              presenter: "Pane mibvunzo here?",
              english: "Are there any questions?",
              response: "Hongu, ndinoda kuziva kuti...",
              responseEnglish: "Yes, I would like to know..."
            }
          ]
        }),
        points: 15
      }
    ]
  },
  {
    title: "Business Negotiations",
    description: "Master the language of business deals and negotiations",
    category: "Professional",
    orderIndex: 62,
    culturalContext: "Business negotiations require balancing directness with cultural respect",
    exercises: [
      {
        type: "conversation",
        question: "Practice negotiation dialogue",
        conversationType: "business_negotiation",
        voiceContent: JSON.stringify({
          dialogue: [
            {
              speaker: "Buyer",
              shona: "Mutengo wenyu wakakwira zvakanyanya",
              english: "Your price is too high",
              tone: "Polite disagreement"
            },
            {
              speaker: "Seller", 
              shona: "Tingagona kudzikisa zvishoma asi...",
              english: "We can reduce it slightly but...",
              tone: "Compromise"
            }
          ]
        }),
        points: 20
      },
      {
        type: "multiple_choice",
        question: "What's a polite way to reject an offer?",
        correctAnswer: "Ndinotenda asi handikwanisi kubvuma",
        options: JSON.stringify([
          "Ndinotenda asi handikwanisi kubvuma",
          "Kwete, hazvina kunaka",
          "Handidi",
          "Hazvishande"
        ]),
        culturalNote: "Always acknowledge the offer before declining"
      }
    ]
  },
  {
    title: "Conflict Resolution Language",
    description: "Navigate disagreements and resolve conflicts diplomatically",
    category: "Communication",
    orderIndex: 63,
    culturalContext: "Conflict resolution emphasizes maintaining relationships and finding common ground",
    exercises: [
      {
        type: "conversation",
        question: "Practice mediation language",
        conversationType: "conflict_resolution",
        voiceContent: JSON.stringify({
          phrases: [
            {
              mediator: "Ndinzwei mativi ose",
              english: "Let me hear both sides",
              purpose: "Showing impartiality"
            },
            {
              mediator: "Ndinonzwisisa kushushikana kwenyu",
              english: "I understand your frustration",
              purpose: "Showing empathy"
            }
          ]
        }),
        points: 18
      },
      {
        type: "multiple_choice",
        question: "How do you say 'Let's find a solution together'?",
        correctAnswer: "Ngatitsvagei mhinduro pamwechete",
        options: JSON.stringify([
          "Ngatitsvagei mhinduro pamwechete",
          "Ndipe mhinduro",
          "Zvakapera",
          "Handina mhinduro"
        ]),
        englishPhrase: "Let's find a solution together",
        audioText: "Ngah-tee-tsvah-geh-ee mheen-doo-roh pah-mweh-cheh-teh"
      }
    ]
  },
  {
    title: "Academic Discourse",
    description: "Engage in scholarly discussions and academic writing",
    category: "Academic",
    orderIndex: 64,
    culturalContext: "Academic Shona blends traditional wisdom with modern scholarly approaches",
    exercises: [
      {
        type: "translation",
        question: "Translate: According to research...",
        correctAnswer: "Maererano netsvakurudzo...",
        options: JSON.stringify([]),
        englishPhrase: "According to research...",
        shonaPhrase: "Maererano netsvakurudzo...",
        audioText: "Mah-eh-reh-rah-noh neh-tsvah-koo-roo-dzoh"
      },
      {
        type: "voice",
        voiceType: "academic",
        question: "Practice academic vocabulary",
        voiceContent: JSON.stringify({
          terms: [
            {
              shona: "ongororo",
              english: "analysis",
              usage: "Ongororo inoratidza kuti..."
            },
            {
              shona: "dzidziso",
              english: "theory",
              usage: "Dzidziso iyi inoti..."
            },
            {
              shona: "humbowo",
              english: "evidence",
              usage: "Humbowo hunotsigira..."
            }
          ]
        }),
        points: 20
      }
    ]
  },
  {
    title: "Media & Journalism Language",
    description: "Report news and conduct interviews professionally",
    category: "Professional",
    orderIndex: 65,
    culturalContext: "Media language balances formality with accessibility",
    exercises: [
      {
        type: "conversation",
        question: "Practice news reporting",
        conversationType: "news_report",
        voiceContent: JSON.stringify({
          report: {
            opening: "Nhau dzanhasi dzinotanga ne...",
            english: "Today's news begins with...",
            structure: "Lead story → Details → Context"
          }
        }),
        points: 15
      },
      {
        type: "multiple_choice",
        question: "How do you say 'Breaking news'?",
        correctAnswer: "Nhau dzichiri kupisa",
        options: JSON.stringify([
          "Nhau dzichiri kupisa",
          "Nhau dzekare",
          "Nhau dzacho",
          "Nhau here"
        ]),
        culturalNote: "Literally 'news still hot'"
      }
    ]
  },
  {
    title: "Cultural Ceremonies & Protocols",
    description: "Navigate traditional ceremonies with appropriate language",
    category: "Cultural",
    orderIndex: 66,
    culturalContext: "Ceremonial language requires deep cultural knowledge and respect",
    exercises: [
      {
        type: "voice",
        voiceType: "ceremonial",
        question: "Practice wedding ceremony phrases",
        voiceContent: JSON.stringify({
          occasions: [
            {
              context: "Roora (Bride price)",
              phrase: "Tauya kuzokumbira mbereko yenyu",
              english: "We have come to ask for your daughter",
              protocol: "Formal, respectful approach"
            },
            {
              context: "Blessing",
              phrase: "Mwari vakuropafadzei",
              english: "May God bless you",
              protocol: "Elder's blessing"
            }
          ]
        }),
        points: 25
      },
      {
        type: "multiple_choice",
        question: "What is the proper greeting for in-laws?",
        correctAnswer: "Makadii vahukuwa",
        options: JSON.stringify([
          "Makadii vahukuwa",
          "Hesi shamwari",
          "Mangwanani",
          "Mhoroi"
        ]),
        culturalNote: "Special respect terms for in-law relationships"
      }
    ]
  },
  {
    title: "Humor & Wordplay",
    description: "Understand and create jokes, puns, and humorous expressions",
    category: "Cultural",
    orderIndex: 67,
    culturalContext: "Shona humor often involves wordplay, proverbs, and cultural references",
    exercises: [
      {
        type: "explanation",
        question: "Explain this Shona joke",
        content: "Murume: 'Ndakarasikirwa nemari!' Mukadzi: 'Yaenda kupi?' Murume: 'Kuchitoro!'",
        correctAnswer: "The humor is in the literal vs intended meaning - losing money by spending it",
        culturalNote: "Shona jokes often play with multiple meanings"
      },
      {
        type: "voice",
        voiceType: "humor",
        question: "Practice tongue twisters",
        voiceContent: JSON.stringify({
          twisters: [
            {
              shona: "Kamba kakara kekakara kakakambaira",
              challenge: "Say it three times fast!",
              meaning: "Old turtle crawled slowly"
            }
          ]
        }),
        points: 10
      }
    ]
  },
  {
    title: "Telephone & Video Call Etiquette",
    description: "Professional communication in remote settings",
    category: "Professional",
    orderIndex: 68,
    culturalContext: "Phone etiquette adapts traditional greetings to modern technology",
    exercises: [
      {
        type: "conversation",
        question: "Practice phone call opening",
        conversationType: "phone_call",
        voiceContent: JSON.stringify({
          scenario: [
            {
              caller: "Ndiani wandinotaura naye?",
              english: "Who am I speaking with?",
              response: "Ndini [name], ndiri kutsvaga..."
            }
          ]
        }),
        points: 12
      },
      {
        type: "multiple_choice",
        question: "How do you say 'Can you hear me clearly?'",
        correctAnswer: "Munondinzwa zvakanaka here?",
        options: JSON.stringify([
          "Munondinzwa zvakanaka here?",
          "Ndiri kufonera",
          "Fonai mangwana",
          "Ndinzwei"
        ]),
        englishPhrase: "Can you hear me clearly?",
        audioText: "Moo-noh-ndeen-zwah zvah-kah-nah-kah heh-reh"
      }
    ]
  },
  {
    title: "Social Media Communication",
    description: "Navigate online communication in Shona",
    category: "Digital",
    orderIndex: 69,
    culturalContext: "Digital communication blends traditional Shona with modern internet culture",
    exercises: [
      {
        type: "translation",
        question: "Translate this social media post: 'Just posted a new pic! #Harare'",
        correctAnswer: "Ndaisa pic itsva! #Harare",
        options: JSON.stringify([]),
        culturalNote: "Social media Shona often mixes languages"
      },
      {
        type: "voice",
        voiceType: "digital",
        question: "Practice social media vocabulary",
        voiceContent: JSON.stringify({
          terms: [
            {
              action: "kulaika",
              english: "to like",
              example: "Ndalaika post yako"
            },
            {
              action: "kushera", 
              english: "to share",
              example: "Share kana uchida"
            }
          ]
        }),
        points: 10
      }
    ]
  },
  {
    title: "Interview Skills",
    description: "Excel in job interviews and professional assessments",
    category: "Professional",
    orderIndex: 70,
    culturalContext: "Interviews require balancing confidence with cultural humility",
    exercises: [
      {
        type: "conversation",
        question: "Practice interview responses",
        conversationType: "job_interview",
        voiceContent: JSON.stringify({
          questions: [
            {
              interviewer: "Ndiudzei nezvenyu",
              english: "Tell me about yourself",
              response: "Zita rangu ndi... Ndine ruzivo mu..."
            },
            {
              interviewer: "Sei muchida kushanda pano?",
              english: "Why do you want to work here?",
              response: "Ndinoda kushanda pano nekuti..."
            }
          ]
        }),
        points: 20
      }
    ]
  },
  
  // Cultural Immersion & Pragmatics (76-85)
  {
    title: "Traditional Wisdom & Proverb Application",
    description: "Use proverbs appropriately in context",
    category: "Cultural",
    orderIndex: 76,
    culturalContext: "Proverbs carry deep wisdom and must be used at the right moment",
    exercises: [
      {
        type: "scenario",
        question: "When would you use 'Chara chimwe hachitswanyi inda'?",
        scenario: "A friend insists on doing everything alone and is struggling",
        correctAnswer: "When encouraging teamwork or seeking help",
        options: JSON.stringify([
          "When encouraging teamwork",
          "When someone is late",
          "When refusing help",
          "When celebrating"
        ]),
        culturalNote: "One finger cannot crush a louse - teamwork is essential"
      },
      {
        type: "voice",
        voiceType: "proverbs",
        question: "Practice proverb delivery with proper intonation",
        voiceContent: JSON.stringify({
          proverbs: [
            {
              shona: "Rambakuudzwa anosara nemhanza",
              english: "One who refuses advice remains with scars",
              usage: "When someone ignores good counsel",
              delivery: "Slow, thoughtful pace"
            }
          ]
        }),
        points: 15
      }
    ]
  },
  {
    title: "Regional Variations - Karanga Dialect",
    description: "Understand and communicate in the Karanga dialect",
    category: "Dialects",
    orderIndex: 77,
    culturalContext: "Karanga is spoken in Masvingo and southern Zimbabwe",
    exercises: [
      {
        type: "comparison",
        question: "Compare Standard vs Karanga",
        content: JSON.stringify({
          comparisons: [
            {
              standard: "Ndiri kunzwa",
              karanga: "Ndiri kunzwisisa",
              english: "I understand",
              note: "Karanga often extends verbs"
            },
            {
              standard: "Waenda kupi?",
              karanga: "Wafamba kupi?",
              english: "Where did you go?",
              note: "Vocabulary differences"
            }
          ]
        })
      },
      {
        type: "voice",
        voiceType: "dialect",
        question: "Practice Karanga pronunciation",
        voiceContent: JSON.stringify({
          words: [
            {
              karanga: "zvino",
              pronunciation: "zvee-noh",
              standardPronunciation: "zvee-noh",
              meaning: "now",
              dialectalNote: "Slight tonal difference"
            }
          ]
        }),
        points: 12
      }
    ]
  },
  {
    title: "Urban Shona & Code-Switching",
    description: "Navigate between languages in urban contexts",
    category: "Sociolinguistics",
    orderIndex: 78,
    culturalContext: "Urban speakers often mix Shona with English seamlessly",
    exercises: [
      {
        type: "translation",
        question: "Translate this urban expression: 'Ndiri busy ne-assignments'",
        correctAnswer: "I'm busy with assignments",
        options: JSON.stringify([]),
        culturalNote: "Common code-mixing pattern in universities"
      },
      {
        type: "conversation",
        question: "Practice urban youth conversation",
        conversationType: "urban_youth",
        voiceContent: JSON.stringify({
          dialogue: [
            {
              speaker: "A",
              utterance: "Wah bro, urikupi?",
              english: "Hey bro, where are you?",
              register: "Very informal"
            },
            {
              speaker: "B",
              utterance: "Ndiri kutown, ndiri kuuya just now",
              english: "I'm in town, I'm coming just now",
              register: "Urban informal"
            }
          ]
        }),
        points: 10
      }
    ]
  },
  {
    title: "Gender & Power in Language",
    description: "Understand how gender and power dynamics affect language use",
    category: "Sociolinguistics",
    orderIndex: 79,
    culturalContext: "Language use reflects and reinforces social hierarchies",
    exercises: [
      {
        type: "analysis",
        question: "Analyze power dynamics in these greetings",
        content: JSON.stringify({
          examples: [
            {
              youngerToElder: "Makadii sekuru?",
              elderToYounger: "Wakadii mwanangu?",
              analysis: "Age hierarchy shown through terms of address"
            },
            {
              wifeToHusband: "Makadii baba va[child]?",
              husbandToWife: "Wakadii mai va[child]?",
              analysis: "Teknonymy shows respect in marriage"
            }
          ]
        })
      }
    ]
  },
  {
    title: "Traditional Storytelling Techniques",
    description: "Master the art of Shona narrative and storytelling",
    category: "Cultural",
    orderIndex: 80,
    culturalContext: "Storytelling is a revered art form with specific conventions",
    exercises: [
      {
        type: "voice",
        voiceType: "storytelling",
        question: "Practice story opening formulas",
        voiceContent: JSON.stringify({
          formulas: [
            {
              opening: "Paivapo...",
              english: "Once upon a time...",
              response: "Dzepfunde!",
              responseEnglish: "We're listening!",
              note: "Traditional call and response"
            }
          ]
        }),
        points: 15
      },
      {
        type: "creative",
        question: "Create a short story using traditional elements",
        elements: ["Tsuro (Hare)", "Moral lesson", "Repetition", "Song"],
        culturalNote: "Stories often feature clever animals teaching life lessons"
      }
    ]
  },
  
  // Specialized Domains (86-95)
  {
    title: "Medical Consultations",
    description: "Communicate effectively in healthcare settings",
    category: "Healthcare",
    orderIndex: 86,
    culturalContext: "Medical consultations require sensitivity to both modern and traditional health concepts",
    exercises: [
      {
        type: "conversation",
        question: "Practice doctor-patient dialogue",
        conversationType: "medical_consultation",
        voiceContent: JSON.stringify({
          dialogue: [
            {
              doctor: "Munonzwa sei nhasi?",
              english: "How are you feeling today?",
              patient: "Ndiri kunzwa kurwadziwa pamusoro",
              patientEnglish: "I'm feeling pain in my head"
            }
          ]
        }),
        points: 18
      },
      {
        type: "vocabulary",
        question: "Learn specialized medical terms",
        terms: JSON.stringify([
          {
            shona: "chirwere chepfungwa",
            english: "mental illness",
            usage: "Addressing mental health sensitively"
          },
          {
            shona: "kubaya jekiseni",
            english: "to give an injection",
            usage: "Common medical procedure"
          }
        ])
      }
    ]
  },
  {
    title: "Legal Language & Court Proceedings",
    description: "Understand legal terminology and court language",
    category: "Legal",
    orderIndex: 87,
    culturalContext: "Legal language combines traditional justice concepts with modern law",
    exercises: [
      {
        type: "translation",
        question: "Translate: The accused has the right to remain silent",
        correctAnswer: "Mupomerwi ane kodzero yekuramba kutaura",
        options: JSON.stringify([]),
        englishPhrase: "The accused has the right to remain silent",
        shonaPhrase: "Mupomerwi ane kodzero yekuramba kutaura",
        audioText: "Moo-poh-mehr-wee ah-neh koh-dzeh-roh yeh-koo-rahm-bah koo-tow-rah"
      }
    ]
  },
  {
    title: "Agricultural & Environmental Communication", 
    description: "Discuss farming, climate, and environmental issues",
    category: "Agriculture",
    orderIndex: 88,
    culturalContext: "Agriculture remains central to Zimbabwean life and language",
    exercises: [
      {
        type: "voice",
        voiceType: "technical",
        question: "Practice agricultural extension language",
        voiceContent: JSON.stringify({
          advice: [
            {
              topic: "Planting",
              shona: "Dyarai mbeu pakudziya kwemvura",
              english: "Plant seeds when the soil is moist",
              technical: "Timing and soil conditions"
            }
          ]
        }),
        points: 15
      }
    ]
  },
  {
    title: "Tourism & Hospitality Language",
    description: "Guide tourists and provide hospitality services",
    category: "Tourism",
    orderIndex: 89,
    culturalContext: "Tourism language balances cultural education with service",
    exercises: [
      {
        type: "conversation",
        question: "Practice tour guide presentation",
        conversationType: "tour_guide",
        voiceContent: JSON.stringify({
          script: {
            welcome: "Titambirei kuZimbabwe!",
            english: "Welcome to Zimbabwe!",
            siteIntro: "Iri inzvimbo ine nhoroondo yakakosha..."
          }
        }),
        points: 20
      }
    ]
  },
  {
    title: "Technology & Innovation Discourse",
    description: "Discuss modern technology and innovation in Shona",
    category: "Technology",
    orderIndex: 90,
    culturalContext: "Technology discourse shows how Shona adapts to new concepts",
    exercises: [
      {
        type: "vocabulary",
        question: "Learn tech terminology",
        terms: JSON.stringify([
          {
            concept: "Artificial Intelligence",
            shona: "Hungwaru hwekugadzira",
            adaptation: "Literal: 'manufactured intelligence'"
          },
          {
            concept: "Download",
            shona: "Kudhawurodha/Kuburutsa",
            adaptation: "Borrowed and native options"
          }
        ])
      }
    ]
  },
  
  // Advanced Cultural Competence (96-100+)
  {
    title: "Non-Verbal Communication Mastery",
    description: "Understand gestures, silence, and body language in Shona culture",
    category: "Cultural",
    orderIndex: 96,
    culturalContext: "Non-verbal communication carries significant meaning in Shona culture",
    exercises: [
      {
        type: "scenario",
        question: "What does prolonged silence indicate in this context?",
        scenario: "After proposing marriage, the family remains silent for a minute",
        correctAnswer: "They are seriously considering the proposal",
        options: JSON.stringify([
          "They are seriously considering the proposal",
          "They are rejecting the proposal",
          "They didn't hear you",
          "They are angry"
        ]),
        culturalNote: "Silence often indicates deep thought, not rejection"
      }
    ]
  },
  {
    title: "Indirect Communication & Face-Saving",
    description: "Master indirect communication strategies",
    category: "Cultural",
    orderIndex: 97,
    culturalContext: "Indirect communication preserves relationships and dignity",
    exercises: [
      {
        type: "interpretation",
        question: "What does 'Ndicharonga' really mean in this context?",
        context: "When asked to lend money you don't have",
        correctAnswer: "A polite way of saying no without direct refusal",
        culturalNote: "'I will plan' often means 'probably not'"
      }
    ]
  },
  {
    title: "Cross-Cultural Business Communication",
    description: "Navigate between Shona and Western business practices",
    category: "Professional",
    orderIndex: 98,
    culturalContext: "Success requires balancing cultural authenticity with international standards",
    exercises: [
      {
        type: "case_study",
        question: "How do you handle this situation?",
        scenario: "International partners want immediate decisions, but your team needs consensus",
        approach: "Explain cultural decision-making process while showing respect for urgency"
      }
    ]
  },
  {
    title: "Advanced Idiomatic Expressions",
    description: "Master complex idioms and metaphorical language",
    category: "Advanced",
    orderIndex: 99,
    culturalContext: "Idioms reveal deep cultural values and worldview",
    exercises: [
      {
        type: "voice",
        voiceType: "idioms",
        question: "Practice complex idiomatic expressions",
        voiceContent: JSON.stringify({
          idioms: [
            {
              shona: "Kudzura imbwa nehanda",
              literal: "To kick a dog with the thigh",
              meaning: "To do something half-heartedly",
              usage: "When criticizing lack of commitment"
            }
          ]
        }),
        points: 20
      }
    ]
  },
  {
    title: "Native-Level Fluency Assessment",
    description: "Comprehensive evaluation of all language skills",
    category: "Assessment",
    orderIndex: 100,
    culturalContext: "True fluency encompasses linguistic, cultural, and pragmatic competence",
    exercises: [
      {
        type: "comprehensive_assessment",
        question: "Complete fluency evaluation",
        components: [
          "Spontaneous conversation",
          "Cultural scenario navigation",
          "Formal presentation",
          "Humor comprehension",
          "Regional dialect recognition",
          "Written composition"
        ],
        points: 100
      }
    ]
  }
]

// Export the lessons
export const allFluentConversationalLessons = fluentConversationalLessons

// Helper function to get lessons by category
export function getFluentLessonsByCategory(category) {
  return fluentConversationalLessons.filter(lesson => lesson.category === category)
}

// Helper function to get lessons by order range
export function getFluentLessonsByRange(start, end) {
  return fluentConversationalLessons.filter(
    lesson => lesson.orderIndex >= start && lesson.orderIndex <= end
  )
}

// Statistics about the lessons
export const fluentLessonsStats = {
  totalLessons: fluentConversationalLessons.length,
  categories: [...new Set(fluentConversationalLessons.map(l => l.category))],
  grammarLessons: fluentConversationalLessons.filter(l => l.category === "Grammar").length,
  professionalLessons: fluentConversationalLessons.filter(l => l.category === "Professional").length,
  culturalLessons: fluentConversationalLessons.filter(l => l.category === "Cultural").length,
  totalExercises: fluentConversationalLessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0)
}
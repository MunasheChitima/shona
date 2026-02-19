import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '@/lib/auth-server'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const vocabulary = await prisma.vocabularyItem.findMany({
      orderBy: { category: 'asc' }
    })
    
    // Transform to flashcard format
    const flashcards = vocabulary.map(item => ({
      id: item.id,
      shona: item.shona,
      english: item.english,
      pronunciation: item.pronunciation || '',
      ipa: `/${item.shona}/`,
      tones: item.tones || 'HL',
      category: item.category,
      audioFile: item.audioFile,
      example: item.examples ? JSON.parse(item.examples)[0] || `${item.shona} ndizvo` : `${item.shona} ndizvo`,
      translation: item.examples ? JSON.parse(item.examples)[1] || `This is ${item.english}` : `This is ${item.english}`,
      grammarNotes: getGrammarNotes(item.shona, item.category),
      culturalContext: getCulturalContext(item.shona, item.category),
      usageNotes: getUsageNotes(item.shona, item.category)
    }))
    
    return NextResponse.json(flashcards)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch vocabulary' }, { status: 500 })
  }
}

function getGrammarNotes(word: string, category: string): string {
  const notes: { [key: string]: string } = {
    'hongu': 'This is a simple affirmative response. Used in formal and informal contexts.',
    'kwete': 'This is a simple negative response. Used in formal and informal contexts.',
    'mhoro': 'This is a casual greeting, similar to "hello" in English. Used among friends and family.',
    'family': 'Family terms in Shona often reflect the importance of extended family in Zimbabwean culture.',
    'colors': 'Color words in Shona are descriptive and often relate to natural elements.',
    'body': 'Body part terms are fundamental for describing health and physical states.',
    'greetings': 'Greetings in Shona are very important and show respect for the person you are meeting.',
    'food': 'Food vocabulary reflects the rich agricultural traditions of Zimbabwe.',
    'basic': 'Basic words are essential for everyday communication in Shona.',
    'communication': 'Communication words help you express yourself clearly in Shona.'
  }
  return notes[word] || notes[category] || 'This word is commonly used in everyday Shona conversation.'
}

function getCulturalContext(word: string, category: string): string {
  const contexts: { [key: string]: string } = {
    'mhoro': 'In Zimbabwean culture, greetings are essential and show respect. Always greet elders first.',
    'family': 'Family is central to Shona culture. Extended family relationships are very important.',
    'food': 'Food in Zimbabwean culture is often shared communally and prepared with care.',
    'greetings': 'Greetings vary by time of day and the relationship between speakers.',
    'colors': 'Colors often have cultural significance in traditional ceremonies and clothing.',
    'body': 'Body parts are mentioned in traditional healing and cultural practices.',
    'basic': 'Basic words reflect the fundamental values and communication patterns of Shona culture.',
    'communication': 'Communication in Shona culture emphasizes respect, politeness, and community connection.'
  }
  return contexts[word] || contexts[category] || 'This word reflects the rich cultural heritage of the Shona people.'
}

function getUsageNotes(word: string, category: string): string {
  const usage: { [key: string]: string } = {
    'hongu': 'Use "hongu" to agree or say yes. It\'s polite and can be used in any situation.',
    'kwete': 'Use "kwete" to disagree or say no. It\'s polite and can be used in any situation.',
    'mhoro': 'Use "mhoro" as a casual greeting. For more formal situations, use "mangwanani" (good morning).',
    'family': 'Family terms show respect. Use appropriate terms for different family members.',
    'colors': 'Color words can be used to describe objects, clothing, and natural surroundings.',
    'body': 'Body part terms are useful for describing health issues or physical activities.',
    'basic': 'Basic words are your foundation for building more complex sentences in Shona.',
    'communication': 'Communication words help you express thoughts, feelings, and ideas clearly.'
  }
  return usage[word] || usage[category] || 'This word is used in everyday conversation and is essential for basic communication.'
} 
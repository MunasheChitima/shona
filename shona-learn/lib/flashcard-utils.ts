// Flashcard utility functions extracted from FlashcardDeck component

export const createPhoneticPronunciation = (word: string, pronunciation: string) => {
  // Convert complex pronunciation to simple phonetic spelling
  const phoneticMap: { [key: string]: string } = {
    'hongu': 'HON-goo',
    'kwete': 'KWAY-tay',
    'manzino': 'man-ZEE-no',
    'maoko': 'mah-OH-ko',
    'maziso': 'mah-ZEE-so',
    'dumbu': 'DOOM-boo',
    'muromo': 'moo-ROH-mo',
    'baba': 'BAH-bah',
    'mai': 'MY',
    'mbuya': 'mm-BOO-yah',
    'sekuru': 'say-KOO-roo',
    'mhoro': 'mm-HOH-ro',
    'babamukuru': 'bah-bah-moo-KOO-roo'
  }
  
  return phoneticMap[word.toLowerCase()] || pronunciation.replace(/[/]/g, '').toUpperCase()
}

export const getGrammarNotes = (word: string, category: string) => {
  const grammarMap: { [key: string]: string } = {
    'hongu': 'Affirmative response particle. Used to confirm statements.',
    'kwete': 'Negative response particle. Used to deny or refuse.',
    'manzino': 'Plural noun (ma- prefix). Singular would be zino.',
    'maoko': 'Plural noun (ma- prefix). Singular would be ruoko.',
    'maziso': 'Plural noun (ma- prefix). Singular would be ziso.',
    'dumbu': 'Singular noun. Part of body vocabulary.',
    'muromo': 'Singular noun with mu- prefix. Part of body vocabulary.'
  }
  return grammarMap[word.toLowerCase()] || `${category} vocabulary word following Shona grammar patterns.`
}

export const getCulturalContext = (word: string, category: string) => {
  const culturalMap: { [key: string]: string } = {
    'hongu': 'In Shona culture, direct "yes" responses show respect and agreement.',
    'kwete': 'Polite way to decline. Often accompanied by explanations to maintain harmony.',
    'manzino': 'Dental health is important in Shona culture. Traditional methods included chewing sticks.',
    'maoko': 'Hands are significant in Shona culture - used for greetings, work, and artistic expression.',
    'maziso': 'Eyes are considered windows to the soul in Shona culture. Respect is shown through eye contact.',
    'dumbu': 'Stomach represents health and well-being in traditional Shona medicine.',
    'muromo': 'The mouth is sacred in Shona culture - used for speaking wisdom and singing.'
  }
  return culturalMap[word.toLowerCase()] || `This ${category} word has cultural significance in Shona tradition.`
}

export const getUsageNotes = (word: string, category: string) => {
  const usageMap: { [key: string]: string } = {
    'hongu': 'Used in formal and informal settings. Can be emphasized for stronger agreement.',
    'kwete': 'More polite than "aiwa" (no). Used when declining offers or requests.',
    'manzino': 'Always used in plural form when referring to teeth collectively.',
    'maoko': 'Can refer to both hands or arms depending on context.',
    'maziso': 'Used both literally (physical eyes) and metaphorically (seeing/understanding).',
    'dumbu': 'Common in health-related conversations and when discussing hunger.',
    'muromo': 'Used in contexts of speaking, eating, or kissing.'
  }
  return usageMap[word.toLowerCase()] || `Commonly used in ${category} contexts and everyday conversation.`
}

export const enhanceFlashcard = (card: any, index: number) => ({
  ...card,
  id: card.id || `${card.shona || 'card'}_${index}`,
  // Fix capitalization - capitalize first letter of Shona word
  shona: card.shona.charAt(0).toUpperCase() + card.shona.slice(1).toLowerCase(),
  // Create phonetic pronunciation instead of IPA
  phoneticPronunciation: createPhoneticPronunciation(card.shona, card.pronunciation),
  grammarNotes: getGrammarNotes(card.shona, card.category),
  culturalContext: getCulturalContext(card.shona, card.category),
  usageNotes: getUsageNotes(card.shona, card.category)
}) 
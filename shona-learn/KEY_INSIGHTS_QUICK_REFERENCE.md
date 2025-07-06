# Key Insights Quick Reference Guide

## 🎯 Critical Success Factors

### From Pedagogical Blueprint
1. **Two-Tone System is Crucial**: Shona uses High/Low tones to distinguish meaning (e.g., hama vs. hàma)
   - **Action**: Every word must have audio + visual tone indication

2. **Noun Class System (Mupanda)**: 21 classes determine all sentence agreement
   - **Action**: Color-code concordance chains in examples

3. **Cultural Principle of Unhu/Ubuntu**: Respect markers are grammatically mandatory
   - **Action**: Teach plural forms for elders from day one

### From Acquisition Science Blueprint
1. **Comprehensible Input (i+1)**: Learning happens through understanding messages slightly above current level
   - **Action**: 70-90% comprehension target for all content

2. **Affective Filter**: Anxiety blocks acquisition
   - **Action**: Low-stakes practice environments, celebrate errors

3. **Spaced Repetition + Active Recall**: Combat forgetting curve
   - **Action**: Review just before forgetting, force effortful retrieval

### From Voice Features Design
1. **Shadowing Technique**: Best method for pronunciation mastery
   - **Action**: Daily 5-10 minute shadowing exercises

2. **Multiple Speed Options**: Different learners need different paces
   - **Action**: 0.5x, 0.75x, 1x speed for all audio

## 📋 Implementation Priorities

### Week 1: Audio Foundation
```javascript
// Every vocabulary item needs:
{
  word: "mangwanani",
  audio: "mangwanani.mp3",
  audioSlow: "mangwanani_slow.mp3", 
  tonePattern: "HLL",
  phoneticText: "ma-ngwa-NA-ni"
}
```

### Week 2: Dual Pathways
```javascript
// Age-based routing
if (userAge <= 12) {
  return <SaruraKidsInterface /> // Colorful, game-like
} else {
  return <ShonaProInterface />    // Professional, text-rich
}
```

### Week 3: Cultural Integration
```javascript
// Respect system example
function getGreeting(context) {
  if (context.addressingElder) {
    return "Makadii?" // Plural form
  }
  return "Wakadii?"   // Singular form
}
```

## 🚀 Quick Wins

### 1. Pronunciation Visualization
```
Word: baba (father)
Tones: H-H (High-High)
Visual: ⬆️⬆️
Audio: [Play button]
```

### 2. Noun Class Quick Reference
```
Class 1/2: mu-/va- (people)
Class 3/4: mu-/mi- (trees, spirits)
Class 5/6: ø/ma- (fruits, body parts)
Class 7/8: chi-/zvi- (things, languages)
Class 9/10: N-/dziN- (animals, objects)
```

### 3. Essential Respect Markers
- Add `-i` to greetings for respect: mhoro → mhoroi
- Use plural pronouns for elders: imi not iwe
- Support right arm when giving/receiving

## 💡 Pedagogical Hacks

### For Beginners
1. Start with greetings + family (high frequency, cultural importance)
2. Use visual noun class groupings (not abstract rules)
3. Songs for phonology practice (memorable, fun)

### For Intermediate
1. Task-based scenarios (real-world application)
2. Mine vocabulary from favorite shows (personal relevance)
3. Dialect awareness through media exposure

### For Advanced
1. Proverbs for cultural fluency
2. Professional domain vocabulary
3. Regional variation practice

## 🔥 Common Pitfalls to Avoid

1. **Don't ignore tones** - They change meaning completely
2. **Don't teach grammar in isolation** - Always in context
3. **Don't mix dialects early** - Establish standard first
4. **Don't rush speaking** - Input before output
5. **Don't skip cultural context** - Language = culture

## 📱 App Architecture Essentials

### Core Modules Priority Order
1. Input Engine (content delivery)
2. Memory Engine (SRS system)
3. Audio Engine (pronunciation)
4. Output Engine (practice)
5. Social Engine (community)

### Database Schema Must-Haves
```prisma
model Word {
  id            String
  shona         String
  english       String
  tonePattern   String
  nounClass     Int?
  audioUrl      String
  phoneticText  String
  culturalNote  String?
}
```

## 🎮 Gamification That Works

### Effective Elements
- ✅ XP for completed lessons
- ✅ Streaks for daily practice
- ✅ Badges for milestones
- ✅ Journey map across Zimbabwe

### Avoid
- ❌ Competitive pressure for beginners
- ❌ Time limits on exercises
- ❌ Penalties for mistakes
- ❌ Complex point systems

## 📊 Success Metrics

### Weekly Targets
- 50-100 new words learned
- 30 minutes daily engagement
- 80%+ pronunciation accuracy
- 1 conversation practice

### Monthly Milestones
- Complete 10 lessons
- 500+ word vocabulary
- Basic conversation ability
- Cultural competency growth

## 🌟 The Golden Rules

1. **Audio is King**: No text without sound
2. **Culture is Grammar**: Respect = correctness
3. **Compelling Content**: Interest drives acquisition
4. **Low Anxiety**: Safe spaces for practice
5. **Consistent Progress**: Small daily wins

---

## Emergency Reference

### If learners struggle with...

**Pronunciation**: 
→ More shadowing, slower audio, visual tone marks

**Grammar**: 
→ Pattern recognition games, not rules

**Vocabulary**: 
→ Personal relevance, visual associations

**Speaking**: 
→ Lower stakes, prepared scenarios first

**Motivation**: 
→ Smaller goals, celebrate progress, community support
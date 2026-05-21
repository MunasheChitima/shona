# Pronunciation Guide for Shona Learn

## Overview
The Shona Learn application displays pronunciation guides for Shona words to help learners understand how to pronounce words correctly.

## How Pronunciation Works

### 1. Data Storage
- Pronunciation is stored in the `audioText` field of the Exercise model
- Format: Simplified phonetic spelling (e.g., "mah-ngwah-NAH-nee" for "Mangwanani")
- Capital letters indicate stressed syllables

### 2. Display Logic
The pronunciation is displayed in the ExerciseModal component when:
- The exercise has a `shonaPhrase`
- The `audioText` field is not null or the string "null"
- The pronunciation appears below the Shona word in a monospace font

### 3. Pronunciation Format Guidelines

#### Basic Rules:
- Use hyphens to separate syllables
- Capitalize stressed syllables
- Use familiar English letter combinations

#### Common Shona Sounds:
- **ng** - as in "sing" (not "finger")
- **ny** - similar to Spanish "ñ"
- **zh** - like "s" in "pleasure"
- **sh** - as in "shop"
- **ch** - as in "church"
- **mb/nd/nz** - prenasalized consonants (brief nasal before consonant)
- **sv/zv/tsv** - whistling fricatives (unique to Shona)

#### Examples:
- Mangwanani → "mah-ngwah-NAH-nee" (Good morning)
- Ndatenda → "ndah-TEN-dah" (Thank you)
- Masikati → "mah-see-KAH-tee" (Good afternoon)

### 4. Updating Pronunciation

To update pronunciation for exercises:

1. **For new exercises**: Include the `audioText` field when creating exercises
2. **For existing exercises**: Run `node scripts/update-exercise-pronunciation.js`

### 5. Vocabulary Integration

When creating exercises from vocabulary modules:
- The `ipa` field from vocabulary is converted to simplified pronunciation
- IPA symbols are replaced with readable equivalents
- If no IPA is available, the field is left null (not displayed)

### 6. UI Behavior

- Pronunciation only shows when hovering over or viewing exercise details
- If audioText is null or "null", no pronunciation is displayed
- The text appears in a blue monospace font for clarity

## Troubleshooting

**Issue**: Pronunciation shows as "null"
**Solution**: The audioText field contains the string "null". Run the update script or manually update the exercise.

**Issue**: No pronunciation shown for a word
**Solution**: The exercise might not have an audioText value. Add pronunciation data to the exercise.

**Issue**: Pronunciation looks like IPA symbols
**Solution**: The IPA needs to be converted to simplified format. Update the conversion logic in the seed scripts.
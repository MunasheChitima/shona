# Adaptive Spaced Repetition System (SRS) Documentation

## Overview

The Adaptive Spaced Repetition System is a sophisticated algorithm designed to optimize language learning by scheduling flashcard reviews at optimal intervals based on individual performance. This system implements the SuperMemo algorithm with adaptive enhancements specifically tailored for the Shona language learning application.

## Features

### Core Algorithm Features
- **Adaptive Scheduling**: Dynamic intervals based on user performance
- **Difficulty Adjustment**: Cards adapt to user skill level
- **Response Time Analysis**: Faster responses indicate better retention
- **Streak Tracking**: Consecutive correct/incorrect answers influence scheduling
- **Confidence Scoring**: Measures user's confidence in their knowledge

### Platform Support
- **Web Application**: Full-featured flashcard interface
- **iOS Native App**: SwiftUI implementation with local data storage
- **Apple Watch**: Synchronized notifications and basic review functionality
- **Push Notifications**: Cross-platform notification system

## Architecture

### Database Schema

#### Flashcard Model
```typescript
interface Flashcard {
  id: string
  userId: string
  lessonId?: string
  shonaText: string
  englishText: string
  audioText?: string
  pronunciation?: string
  difficulty: number (0.0-1.0)
  tags: string[] // Stored as JSON string in SQLite
  context?: string
  createdAt: Date
  lastReviewed?: Date
}
```

#### SRS Progress Model
```typescript
interface SRSProgress {
  id: string
  userId: string
  flashcardId: string
  easeFactor: number // 1.3-4.0
  interval: number // Days until next review
  repetitions: number
  lastReview: Date
  nextReview: Date
  quality: number // 0-5 scale
  totalReviews: number
  correctStreak: number
  wrongStreak: number
  averageTime: number // Seconds
}
```

#### Notification Preferences Model
```typescript
interface NotificationPreference {
  id: string
  userId: string
  enabledDays: string[] // JSON array
  startTime: string // "HH:MM"
  endTime: string // "HH:MM"
  maxDailyNotifications: number
  intervalMinutes: number
  enabledTypes: string[] // JSON array
  timezone: string
  deviceTokens: string[] // JSON array
}
```

### Algorithm Implementation

#### SuperMemo Algorithm with Adaptive Features

The core algorithm uses the SuperMemo formula with enhancements:

```typescript
// Base SuperMemo calculation
easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

// Adaptive adjustments
easeFactor += timeAdjustment + difficultyAdjustment + streakAdjustment
```

#### Interval Calculation
```typescript
if (quality < 3) {
  interval = 1 // Reset on failure
  repetitions = 0
} else if (repetitions === 1) {
  interval = 1
} else if (repetitions === 2) {
  interval = 6
} else {
  interval = Math.round(previousInterval * easeFactor)
}
```

#### Difficulty Adjustment
Cards automatically adjust difficulty based on:
- User response time
- Success/failure patterns
- Historical performance

## API Endpoints

### Flashcard Management

#### Get Due Cards
```
GET /api/flashcards?userId={userId}&action=due&limit={limit}
```

#### Review Card
```
POST /api/flashcards
{
  "userId": "user_id",
  "action": "review",
  "flashcardId": "card_id",
  "quality": 3,
  "responseTime": 5.2,
  "wasCorrect": true
}
```

#### Get Statistics
```
GET /api/flashcards?userId={userId}&action=stats
```

#### Search Flashcards
```
GET /api/flashcards?userId={userId}&action=search&q={query}&tags={tags}&lessonId={lessonId}
```

### Notification Management

#### Update Notification Preferences
```
POST /api/notifications/preferences
{
  "userId": "user_id",
  "enabledDays": ["monday", "tuesday", "wednesday"],
  "startTime": "09:00",
  "endTime": "21:00",
  "maxDailyNotifications": 5,
  "intervalMinutes": 240,
  "enabledTypes": ["review_due", "streak_reminder"]
}
```

#### Register Device Token
```
POST /api/notifications/register
{
  "userId": "user_id",
  "deviceToken": "expo_push_token"
}
```

## iOS Implementation

### SwiftData Models

The iOS app uses SwiftData for local storage with models that mirror the web app:

```swift
@Model
final class Flashcard {
    var id: String
    var userId: String
    var shonaText: String
    var englishText: String
    var difficulty: Double
    var srsProgress: SRSProgress?
    
    // ... initialization
}

@Model
final class SRSProgress {
    var easeFactor: Double
    var interval: Int
    var nextReview: Date
    
    // ... other properties
}
```

### Local Notifications

The iOS app schedules local notifications for flashcard reviews:

```swift
private func scheduleReviewNotifications() {
    let center = UNUserNotificationCenter.current()
    
    // Schedule notifications for the next 7 days
    for i in 1...7 {
        let date = Calendar.current.date(byAdding: .day, value: i, to: Date())
        let cardsForDay = flashcards.filter { card in
            guard let nextReview = card.srsProgress?.nextReview else { return false }
            return Calendar.current.isDate(nextReview, inSameDayAs: date)
        }
        
        if !cardsForDay.isEmpty {
            let content = UNMutableNotificationContent()
            content.title = "Time to review Shona! 📚"
            content.body = "You have \(cardsForDay.count) cards ready for review"
            
            // Schedule notification
            let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: false)
            let request = UNNotificationRequest(identifier: "flashcard-review-\(i)", content: content, trigger: trigger)
            center.add(request)
        }
    }
}
```

## Usage Guide

### Creating Flashcards

#### From Lessons
```typescript
// Import flashcards from a lesson
const flashcards = await FlashcardService.importFromLesson(userId, lessonId)
```

#### Manual Creation
```typescript
// Create a custom flashcard
const flashcard = await FlashcardService.createFlashcard(userId, {
  shonaText: "Mangwanani",
  englishText: "Good morning",
  pronunciation: "mahn-gwah-nah-nee",
  context: "A common greeting used in the morning",
  tags: ["greetings", "basic"]
})
```

### Study Sessions

#### Web App
1. Navigate to `/flashcards`
2. Click "Start Studying" if cards are due
3. Review cards using the 4-point quality scale:
   - **Again (1)**: Complete failure to recall
   - **Hard (2)**: Recalled with significant difficulty
   - **Good (3)**: Recalled with some effort
   - **Easy (4)**: Recalled effortlessly

#### iOS App
1. Open the app and navigate to the Flashcards tab
2. Tap "Review Due Cards"
3. Study cards using the same 4-point scale
4. End session or let it complete automatically

### Notification Setup

#### Web App
Configure notifications through the user settings:
```typescript
await NotificationService.updateNotificationPreferences(userId, {
  enabledDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  startTime: "09:00",
  endTime: "21:00",
  maxDailyNotifications: 5,
  intervalMinutes: 240,
  enabledTypes: ["review_due", "streak_reminder", "achievement"]
})
```

#### iOS App
Notifications are automatically requested when starting the first study session. Users can manage notification preferences in the iOS Settings app.

## Performance Optimizations

### Algorithm Efficiency
- Cards are sorted by priority (overdue first, then by difficulty)
- Session limits prevent overwhelming users
- Batch operations for database updates

### Memory Management
- Lazy loading of flashcard content
- Efficient queries with proper indexing
- Pagination for large datasets

### Offline Support
- iOS app works fully offline
- Synchronization when connection is restored
- Local notification scheduling

## Analytics and Insights

### User Performance Metrics
- **Accuracy**: Overall correctness percentage
- **Response Time**: Average time per card
- **Streak Days**: Consecutive days with correct answers
- **Mastery Level**: Cards with intervals ≥ 30 days

### Learning Insights
- **Difficult Cards**: Cards with low ease factors
- **Review Load**: Predicted future review requirements
- **Progress Tracking**: XP and level progression

### Adaptive Adjustments
- **Difficulty Scaling**: Automatic adjustment based on performance
- **Time Penalties**: Slower responses result in shorter intervals
- **Streak Bonuses**: Consecutive correct answers increase ease factors

## Best Practices

### For Users
1. **Consistent Review**: Study daily for optimal retention
2. **Honest Assessment**: Use the quality scale accurately
3. **Context Learning**: Pay attention to example sentences
4. **Audio Practice**: Listen to pronunciation when available

### For Developers
1. **Data Validation**: Ensure quality scores are within valid ranges
2. **Error Handling**: Graceful degradation for offline scenarios
3. **Performance Monitoring**: Track algorithm effectiveness
4. **User Feedback**: Collect data on user satisfaction

## Troubleshooting

### Common Issues

#### Cards Not Appearing
- Check if user has due cards: `FlashcardService.getDueCards(userId)`
- Verify SRS progress is properly initialized
- Ensure nextReview dates are calculated correctly

#### Notifications Not Working
- Verify notification permissions are granted
- Check device token registration
- Confirm notification preferences are set

#### Sync Issues (iOS)
- Implement proper error handling for network requests
- Use background app refresh for updates
- Store pending changes locally when offline

### Debugging Tools

#### Web App
- Browser dev tools for API debugging
- Console logs for algorithm tracing
- Network tab for request monitoring

#### iOS App
- Xcode debugger for SwiftData queries
- Console app for notification debugging
- Instruments for performance profiling

## Future Enhancements

### Planned Features
1. **Spaced Repetition Visualization**: Charts showing review intervals
2. **Collaborative Learning**: Shared flashcard decks
3. **Voice Recognition**: Pronunciation practice integration
4. **Machine Learning**: Personalized difficulty prediction
5. **Apple Watch App**: Native watch experience

### Algorithm Improvements
1. **Forgetting Curve Integration**: More sophisticated retention modeling
2. **Contextual Factors**: Time of day, device, location considerations
3. **Personalization**: Individual learning style adaptation
4. **Predictive Analytics**: Forecasting optimal study times

## Security Considerations

### Data Privacy
- User data is encrypted at rest
- API endpoints require authentication
- Personal information is anonymized in analytics

### Notification Security
- Device tokens are securely stored
- Notification content is sanitized
- Rate limiting prevents spam

## Conclusion

The Adaptive Spaced Repetition System provides a robust, scientifically-based approach to language learning that adapts to individual user needs. By combining the proven SuperMemo algorithm with modern adaptive techniques, it maximizes retention while minimizing study time.

The system's cross-platform implementation ensures users can study seamlessly across web and mobile devices, with intelligent notifications keeping them engaged in their language learning journey.

For additional support or feature requests, please refer to the project's GitHub repository or contact the development team.
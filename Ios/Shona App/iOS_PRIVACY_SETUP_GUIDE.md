# iOS Privacy Setup Guide

## Overview

This guide explains how to properly configure the iOS Shona App to handle privacy-sensitive features like microphone access and speech recognition.

## Privacy Permissions Fixed

The app was crashing because it was trying to access privacy-sensitive data without proper usage descriptions. I've added the following permissions to the `Info.plist` file:

### Required Privacy Keys

1. **NSMicrophoneUsageDescription**
   - **Purpose**: For pronunciation practice features
   - **Description**: "This app uses the microphone to help you practice Shona pronunciation. You can record your voice and compare it to native pronunciation for better language learning."

2. **NSSpeechRecognitionUsageDescription**
   - **Purpose**: For speech recognition during pronunciation exercises
   - **Description**: "This app uses speech recognition to evaluate your Shona pronunciation and provide feedback on your speaking accuracy. This helps improve your language learning experience."

3. **NSUserNotificationsUsageDescription**
   - **Purpose**: For flashcard review reminders
   - **Description**: "This app sends notifications to remind you when it's time to review your flashcards and continue your Shona learning journey."

## Project Configuration Changes

### 1. Custom Info.plist File
- Created a custom `Info.plist` file in `Shona App/Info.plist`
- Modified the Xcode project to use this custom file instead of auto-generation
- Changed `GENERATE_INFOPLIST_FILE = NO` in project settings
- Added `INFOPLIST_FILE = "Shona App/Info.plist"` to point to our custom file

### 2. Background Capabilities
Added background modes for:
- `background-processing`: For scheduling notifications
- `remote-notification`: For push notifications

### 3. URL Schemes
Added support for deep linking with scheme: `shonaapp://`

## Features Enabled

### Pronunciation Practice
The app includes pronunciation practice features that use:
- **Microphone**: To record user pronunciation
- **Speech Recognition**: To analyze pronunciation accuracy
- **Text-to-Speech**: To provide native pronunciation examples

### Notification System
The app can send notifications for:
- **Review Reminders**: When flashcards are due for review
- **Streak Alerts**: To maintain learning streaks
- **Achievement Notifications**: When learning milestones are reached

### Flashcard System
Integrated with the Adaptive Spaced Repetition System:
- Local notifications for review reminders
- Background processing for scheduling
- Cross-platform sync with web app

## Setup Instructions

### 1. Open in Xcode
```bash
cd "Ios/Shona App"
open "Shona App.xcodeproj"
```

### 2. Verify Info.plist Configuration
- Ensure the project is set to use the custom Info.plist
- Check that all privacy keys are present
- Verify the app bundle identifier matches your needs

### 3. Test Privacy Permissions
1. Build and run the app
2. Navigate to the Flashcards tab
3. Try to start a study session
4. Verify that notification permissions are requested
5. Check that no crashes occur

### 4. Configure Notifications
The app will automatically:
- Request notification permissions on first study session
- Schedule local notifications for due flashcards
- Handle notification scheduling in background

## Troubleshooting

### Common Issues

#### App Still Crashes on Privacy Access
1. **Clean and rebuild** the project
2. **Delete the app** from simulator/device and reinstall
3. **Check Xcode console** for specific permission errors
4. **Verify Info.plist** is correctly referenced in project settings

#### Notifications Not Working
1. **Check device settings** - ensure notifications are enabled for the app
2. **Verify permission grant** - the app should prompt for notification access
3. **Check notification scheduling** - use Xcode debugger to verify scheduling code

#### Speech Recognition Not Working
1. **Test on physical device** - speech recognition may not work in simulator
2. **Check microphone permissions** - ensure the permission dialog appeared
3. **Verify internet connection** - speech recognition requires network access

### Debug Commands

#### Reset Privacy Permissions
```bash
# Reset all privacy permissions for the app
xcrun simctl privacy booted reset all com.yourcompany.shona-app
```

#### Check Current Permissions
```bash
# Check what permissions the app has
xcrun simctl privacy booted grant microphone com.yourcompany.shona-app
xcrun simctl privacy booted grant speech-recognition com.yourcompany.shona-app
```

## Development Notes

### Adding New Privacy Features
When adding features that access privacy-sensitive data:

1. **Add usage description** to Info.plist
2. **Request permission** before accessing the feature
3. **Handle permission denial** gracefully
4. **Test on real device** for accurate permission behavior

### Example Permission Request Code
```swift
import UserNotifications

// Request notification permissions
UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
    if granted {
        // Schedule notifications
    } else {
        // Handle denial
    }
}
```

### Best Practices
1. **Request permissions contextually** - when the user tries to use the feature
2. **Explain benefits** - use clear, user-friendly descriptions
3. **Provide alternatives** - allow app to function without optional permissions
4. **Test thoroughly** - on both simulator and real devices

## File Structure
```
Ios/Shona App/
├── Shona App/
│   ├── Info.plist                 # Custom Info.plist with privacy keys
│   ├── FlashcardView.swift        # Flashcard UI with notifications
│   ├── Models.swift               # Data models including SRS
│   └── MainTabView.swift          # Main app navigation
├── Shona App.xcodeproj/           # Xcode project file
└── iOS_PRIVACY_SETUP_GUIDE.md    # This guide
```

## Related Documentation
- [Adaptive SRS Documentation](../../shona-learn/ADAPTIVE_SRS_DOCUMENTATION.md)
- [Apple Privacy Guidelines](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- [iOS Notification Programming Guide](https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/)

## Support
If you encounter issues with privacy permissions or app functionality, check:
1. Xcode console for detailed error messages
2. iOS Settings > Privacy for permission status
3. Device logs for system-level permission errors
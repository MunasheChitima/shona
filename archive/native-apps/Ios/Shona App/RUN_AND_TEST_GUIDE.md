# How to Run and Test the Shona iOS App

## Prerequisites
- macOS with Xcode 15.0 or later installed
- iOS Simulator or physical iOS device (iOS 17.0+)

## Step 1: Open the Project
1. Open Terminal and navigate to the project:
   ```bash
   cd "/workspace/Ios/Shona App"
   open "Shona App.xcodeproj"
   ```

## Step 2: Configure Xcode
1. **Add Content Folder Reference**:
   - In Xcode, right-click on "Shona App" folder in navigator
   - Choose "Add Files to 'Shona App'"
   - Navigate to the `Content` folder
   - **IMPORTANT**: Select "Create folder references" (not groups)
   - The folder should appear blue in Xcode

2. **Add Build Script**:
   - Select your project in navigator
   - Select "Shona App" target
   - Go to "Build Phases" tab
   - Click "+" → "New Run Script Phase"
   - Add this script:
   ```bash
   "${SRCROOT}/copy-content-resources.sh"
   ```

## Step 3: Select Target Device
- In Xcode toolbar, select either:
  - iPhone 15 Pro (Simulator)
  - Your connected iPhone
- Ensure iOS 17.0+ is selected

## Step 4: Build and Run
1. Press `Cmd + B` to build
2. Press `Cmd + R` to run

## Expected App Flow

### 1. First Launch - Onboarding
- **Welcome Screen**: "Mauya - Welcome!" with globe icon
- **Name Input**: "Zita rako ndiani?" (What is your name?)
- **Features Overview**: Shows app capabilities
- **Content Loading**: Progress bar while loading JSON content

### 2. Main App
After onboarding, you'll see:
- **Home Tab**: Dashboard with progress stats
- **Learn Tab**: 12 lessons with vocabulary and exercises
- **Pronunciation Tab**: Practice Shona sounds
- **Profile Tab**: Your learning statistics

## Testing Checklist

### Onboarding Tests
- [ ] App launches without crashes
- [ ] Can enter name and proceed
- [ ] Content loads successfully (watch progress bar)
- [ ] No error messages appear

### Content Tests
- [ ] Lessons display with titles and descriptions
- [ ] Vocabulary items show Shona/English pairs
- [ ] Exercises are interactive (try multiple choice)
- [ ] Cultural notes appear in lessons

### Pronunciation Tests
- [ ] Microphone permission request appears
- [ ] Can view pronunciation exercises
- [ ] Special sounds (mb, nd, ng) are highlighted
- [ ] Audio playback works (if implemented)

### Navigation Tests
- [ ] All tabs are accessible
- [ ] Can navigate between lessons
- [ ] Back buttons work correctly
- [ ] No navigation crashes

## Common Issues & Solutions

### Issue: "Content not found" error
**Solution**: Ensure Content folder is added as folder reference (blue folder)

### Issue: Microphone permission crash
**Solution**: Already fixed in Info.plist, but reset simulator if needed

### Issue: Build errors
**Solution**: Clean build folder (Cmd + Shift + K) and rebuild

### Issue: Content not loading
**Solution**: Check that copy-content-resources.sh has execute permissions

## Debug Tips
1. **Check Console**: View → Debug Area → Show Debug Area
2. **Monitor Network**: Useful if implementing API calls
3. **Memory Graph**: Debug → Memory Graph (check for leaks)

## Quick Commands
```bash
# Make build script executable
chmod +x copy-content-resources.sh

# Verify JSON files
ls -la "Shona App/Content/"

# Check file counts
find "Shona App/Content" -name "*.json" | wc -l
# Should show: 6 files
```

## Expected Results
✅ Smooth onboarding experience  
✅ Rich content displays properly  
✅ No crashes or errors  
✅ Professional UI/UX  
✅ All features accessible  

## Next Steps After Testing
1. Test on real device for full pronunciation features
2. Check performance on older devices
3. Verify offline functionality
4. Test accessibility features

---

**Ready to see your beautiful Shona learning app in action! 🚀**
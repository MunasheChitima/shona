# 🚀 Quick Start Guide - Shona Learn

Get your Shona Learn app deployed in minutes!

## 📱 What You'll Deploy

- **Android App**: Native Android app for phones and tablets
- **iOS App**: Native iOS app for iPhone and iPad  
- **Web App**: Progressive web app accessible from any browser

---

## 🎯 Choose Your Platform

### [1] Deploy Web App (Fastest - 5 minutes)

```bash
cd shona-learn

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Deploy to Vercel (free tier available)
npm install -g vercel
vercel --prod
```

**✅ Done!** Your web app is live.

[Full Web Deployment Guide →](DEPLOYMENT_GUIDE.md#web-deployment)

---

### [2] Build Android App (10 minutes)

```bash
cd android

# Create release keystore (one-time setup)
./create-keystore.sh

# Build release APK
./build-release.sh apk

# Output: app/build/outputs/apk/release/app-release.apk
```

**Next Steps:**
- Test APK on device
- Upload to Google Play Console
- Submit for review

[Full Android Deployment Guide →](DEPLOYMENT_GUIDE.md#android-deployment)

---

### [3] Build iOS App (macOS required)

```bash
cd "Ios/Shona App"

# Build archive and export IPA
./build-release.sh app-store

# Output: build/export/Shona App.ipa
```

**Next Steps:**
- Upload to App Store Connect
- Complete app listing
- Submit for review

[Full iOS Deployment Guide →](DEPLOYMENT_GUIDE.md#ios-deployment)

---

## 🤖 Automated Deployment (CI/CD)

### Setup GitHub Actions (One-time)

1. **Add Secrets** to GitHub repo (Settings → Secrets):

   **For Android:**
   - `ANDROID_KEYSTORE_BASE64`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`

   **For iOS:**
   - `IOS_CERTIFICATE_BASE64`
   - `IOS_PROVISIONING_PROFILE_BASE64`
   - `APPLE_ID`
   - `APPLE_APP_SPECIFIC_PASSWORD`

   **For Web:**
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `DATABASE_URL`

2. **Trigger Deployment:**

   ```bash
   # Deploy web app
   git push origin main
   
   # Deploy Android
   git tag android-v1.0.0 && git push --tags
   
   # Deploy iOS
   git tag ios-v1.0.0 && git push --tags
   ```

[Full CI/CD Setup Guide →](DEPLOYMENT_GUIDE.md#cicd-setup)

---

## 🆘 Need Help?

### Common Issues

**"Keystore not found"** (Android)
```bash
cd android
./create-keystore.sh
```

**"Code signing failed"** (iOS)
- Open Xcode project
- Enable "Automatically manage signing"
- Select your team

**"Database connection error"** (Web)
- Update `DATABASE_URL` in `.env`
- Run `npx prisma migrate deploy`

### Get Support

- 📖 [Full Deployment Guide](DEPLOYMENT_GUIDE.md)
- 🐛 [Report Issues](https://github.com/your-org/shona-learn/issues)
- 💬 [Community Chat](https://discord.gg/your-invite)

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `android/build-release.sh` | Build Android release |
| `Ios/Shona App/build-release.sh` | Build iOS release |
| `shona-learn/deploy.sh` | Deploy web app |
| `DEPLOYMENT_GUIDE.md` | Complete deployment documentation |
| `.github/workflows/` | CI/CD automation |

---

## ✅ Pre-Flight Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Secrets stored securely (never in code!)
- [ ] App tested on real devices
- [ ] Store listings prepared (screenshots, description)
- [ ] Analytics/monitoring configured
- [ ] Backup plan in place

---

## 🎉 Success!

Once deployed, you'll have:

- ✅ Android app on Google Play Store
- ✅ iOS app on Apple App Store  
- ✅ Web app accessible worldwide
- ✅ Automated deployments via GitHub Actions

**Next Steps:**
1. Test your deployed apps
2. Gather user feedback
3. Iterate and improve
4. Promote your app!

---

**Questions?** Check the [Full Deployment Guide](DEPLOYMENT_GUIDE.md) or open an issue.

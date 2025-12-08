# 🚀 Shona Learn - Complete Deployment Guide

This comprehensive guide covers deploying the Shona Learn app across all platforms: Android, iOS, and Web.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Android Deployment](#android-deployment)
- [iOS Deployment](#ios-deployment)
- [Web Deployment](#web-deployment)
- [CI/CD Setup](#cicd-setup)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### General Requirements
- Git installed and configured
- Access to the repository
- Domain name (for web deployment)
- App store developer accounts (Android/iOS)

### Platform-Specific Requirements

**Android:**
- Android Studio (latest stable)
- JDK 17 or higher
- Android SDK (API 24-34)
- Google Play Console account

**iOS:**
- macOS with Xcode 15.2+
- Apple Developer account ($99/year)
- CocoaPods or Swift Package Manager
- Valid code signing certificates

**Web:**
- Node.js 20+ and npm
- PostgreSQL database
- Hosting account (Vercel/Netlify/Docker)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/shona-learn.git
cd shona-learn
```

### 2. Set Up Environment Variables

**For Web App:**

```bash
cd shona-learn
cp .env.example .env
# Edit .env with your actual values
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your app URL
- `GOOGLE_AI_API_KEY`: Google AI API key

---

## Android Deployment

### Step 1: Create Release Keystore

```bash
cd android
./create-keystore.sh
```

Follow the prompts to:
- Set keystore password
- Set key password
- Enter certificate details (name, organization, etc.)

**⚠️ CRITICAL:** Backup your keystore and passwords securely! Store them in a password manager. You cannot recover them if lost.

### Step 2: Update gradle.properties

Add to `android/gradle.properties` (DO NOT commit):

```properties
SHONA_RELEASE_STORE_FILE=shona-release-key.jks
SHONA_RELEASE_STORE_PASSWORD=your_store_password
SHONA_RELEASE_KEY_ALIAS=shona-release
SHONA_RELEASE_KEY_PASSWORD=your_key_password
```

### Step 3: Build Release APK/AAB

**For APK (testing):**
```bash
./build-release.sh apk
```

**For AAB (Play Store):**
```bash
./build-release.sh aab
```

Output locations:
- APK: `app/build/outputs/apk/release/app-release.apk`
- AAB: `app/build/outputs/bundle/release/app-release.aab`

### Step 4: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app or select existing
3. Navigate to Release → Production → Create new release
4. Upload the AAB file
5. Fill in release notes
6. Review and rollout

**First-time setup:**
- Complete store listing
- Add screenshots (1080x1920)
- Set content rating
- Set pricing & distribution
- Submit for review

### Testing Before Release

1. Test APK on physical devices
2. Use internal testing track in Play Console
3. Run through all app features
4. Test on different Android versions

---

## iOS Deployment

### Step 1: Configure Xcode Project

1. Open `Ios/Shona App/Shona App.xcodeproj` in Xcode
2. Select the project in navigator
3. Update the following:
   - **General → Identity:** Bundle Identifier (e.g., `com.shonalearn.app`)
   - **General → Version:** App version (e.g., `1.0.0`)
   - **General → Build:** Build number (e.g., `1`)
   - **Signing & Capabilities:** Select your team

### Step 2: Configure Provisioning

**Option A: Automatic Signing (Recommended)**
1. In Xcode, enable "Automatically manage signing"
2. Select your development team
3. Xcode will create profiles automatically

**Option B: Manual Signing**
1. Create App ID in [Apple Developer Portal](https://developer.apple.com)
2. Create provisioning profiles:
   - Development
   - Ad Hoc (for testing)
   - App Store Distribution
3. Download and install profiles
4. Select profiles in Xcode

### Step 3: Update Export Options

Edit `Ios/Shona App/ExportOptions.plist`:

```xml
<key>teamID</key>
<string>YOUR_TEAM_ID</string>
<key>provisioningProfiles</key>
<dict>
    <key>com.shonalearn.app</key>
    <string>YOUR_PROVISIONING_PROFILE_NAME</string>
</dict>
```

### Step 4: Build Release IPA

**Using Build Script:**
```bash
cd "Ios/Shona App"
./build-release.sh app-store
```

**Or Using Xcode:**
1. Select "Any iOS Device" as destination
2. Product → Archive
3. Wait for archive to complete
4. Window → Organizer → Archives
5. Select archive → Distribute App
6. Choose "App Store Connect"
7. Follow the wizard

### Step 5: Upload to App Store Connect

**Option A: Using Xcode Organizer**
1. In Organizer, select archive
2. Click "Distribute App"
3. Choose "Upload"
4. Follow prompts

**Option B: Using Command Line**
```bash
xcrun altool --upload-app \
  -f "build/export/Shona App.ipa" \
  -t ios \
  -u YOUR_APPLE_ID \
  -p YOUR_APP_SPECIFIC_PASSWORD
```

**Option C: Using Transporter App**
1. Download Transporter from Mac App Store
2. Sign in with Apple ID
3. Drag and drop IPA file
4. Click "Deliver"

### Step 6: Submit for Review

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Complete the following:
   - App Information
   - Pricing and Availability
   - App Privacy details
   - Screenshots (all required sizes)
   - App description and keywords
4. Select the build you uploaded
5. Submit for review

**Screenshot Sizes Required:**
- 6.7" Display (1290 x 2796)
- 6.5" Display (1284 x 2778)
- 5.5" Display (1242 x 2208)
- iPad Pro (2048 x 2732)

### Using Fastlane (Advanced)

Install Fastlane:
```bash
gem install fastlane
```

Commands:
```bash
# Build for testing
fastlane adhoc

# Upload to TestFlight
fastlane beta

# Full release
fastlane release
```

---

## Web Deployment

### Option 1: Deploy to Vercel (Recommended)

**One-time Setup:**
```bash
npm install -g vercel
vercel login
```

**Deploy:**
```bash
cd shona-learn
./deploy.sh vercel
```

**Or manually:**
```bash
vercel --prod
```

**Configure Environment Variables in Vercel Dashboard:**
1. Go to project settings
2. Environment Variables section
3. Add all variables from `.env.example`

**Set up Database:**
```bash
# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed
```

### Option 2: Deploy to Netlify

**One-time Setup:**
```bash
npm install -g netlify-cli
netlify login
```

**Deploy:**
```bash
cd shona-learn
./deploy.sh netlify
```

**Configure in Netlify Dashboard:**
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables

### Option 3: Docker Deployment

**Build and Run:**
```bash
cd shona-learn
./deploy.sh docker
```

**Or manually:**
```bash
# Build image
docker build -t shona-learn .

# Run with docker-compose
docker-compose up -d
```

**Environment Setup:**
1. Copy `.env.example` to `.env`
2. Update all values
3. Ensure PostgreSQL is running

**Access:**
- App: http://localhost:3000
- Database: localhost:5432

**Useful Commands:**
```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild
docker-compose up -d --build
```

### Option 4: VPS/Server Deployment

**Requirements:**
- Ubuntu 20.04+ or similar
- Node.js 20+
- PostgreSQL 14+
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt)

**Setup Process:**

1. **Install Dependencies:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

2. **Setup Database:**
```bash
sudo -u postgres psql
CREATE DATABASE shonalearn;
CREATE USER shonalearn WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE shonalearn TO shonalearn;
\q
```

3. **Deploy Application:**
```bash
# Clone repository
git clone https://github.com/your-org/shona-learn.git
cd shona-learn/shona-learn

# Install dependencies
npm ci

# Setup environment
cp .env.example .env
nano .env  # Edit values

# Run migrations
npx prisma migrate deploy

# Build
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start app
pm2 start npm --name "shona-learn" -- start
pm2 save
pm2 startup
```

4. **Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/shona-learn
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/shona-learn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **Setup SSL:**
```bash
sudo certbot --nginx -d your-domain.com
```

---

## CI/CD Setup

### GitHub Secrets Configuration

Navigate to **Settings → Secrets and Variables → Actions** in your GitHub repository.

**Android Secrets:**
- `ANDROID_KEYSTORE_BASE64`: Base64 encoded keystore file
  ```bash
  base64 -i shona-release-key.jks | pbcopy
  ```
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_ALIAS`: Key alias (e.g., `shona-release`)
- `ANDROID_KEY_PASSWORD`: Key password
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: Service account JSON for Play Store uploads

**iOS Secrets:**
- `IOS_CERTIFICATE_BASE64`: Base64 encoded .p12 certificate
- `IOS_CERTIFICATE_PASSWORD`: Certificate password
- `IOS_PROVISIONING_PROFILE_BASE64`: Base64 encoded provisioning profile
- `APPLE_TEAM_ID`: Apple Developer Team ID
- `APPLE_ID`: Your Apple ID email
- `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password
- `KEYCHAIN_PASSWORD`: Random password for CI keychain

**Web Secrets:**
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `DATABASE_URL`: Production database URL
- `NEXTAUTH_SECRET`: NextAuth secret
- `NEXTAUTH_URL`: Production app URL
- `GOOGLE_AI_API_KEY`: Google AI API key

**Optional:**
- `SLACK_WEBHOOK_URL`: For deployment notifications
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password
- `NETLIFY_AUTH_TOKEN`: Netlify authentication token
- `NETLIFY_SITE_ID`: Netlify site ID

### Workflow Triggers

**Automatic Deployments:**
- Push to `main`: Deploys web to production
- Tag `android-v*`: Builds and uploads Android to Play Store
- Tag `ios-v*`: Builds and uploads iOS to App Store

**Manual Deployments:**
- Go to Actions → Select workflow → Run workflow

### Creating Service Accounts

**Google Play:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create service account
3. Download JSON key
4. Grant access in Play Console

**Apple App Store:**
1. Create app-specific password at appleid.apple.com
2. Use for automated uploads

---

## Post-Deployment

### Monitoring Setup

**Error Tracking:**
- Sentry: https://sentry.io
- Bugsnag: https://bugsnag.com

**Analytics:**
- Google Analytics
- Mixpanel
- Firebase Analytics

**Performance:**
- Vercel Analytics (web)
- Firebase Performance (mobile)

### Maintenance Tasks

**Regular Updates:**
- Monitor dependency updates (Dependabot)
- Security patches
- OS version updates

**Database Backups:**
```bash
# Automated backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

**App Updates:**
1. Increment version numbers
2. Update changelogs
3. Test thoroughly
4. Deploy through CI/CD
5. Monitor for issues

### Version Management

**Semantic Versioning:** `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes
- **MINOR**: New features
- **PATCH**: Bug fixes

**Build Numbers:**
- Android: `versionCode` (increment each release)
- iOS: Build number (increment each upload)

---

## Troubleshooting

### Android Issues

**Build fails with signing error:**
- Verify keystore path and passwords
- Check `gradle.properties` configuration
- Ensure keystore file exists

**ProGuard errors:**
- Check `proguard-rules.pro`
- Add keep rules for problematic classes
- Test release build thoroughly

**App crashes on release:**
- Enable ProGuard mapping file upload
- Check for missing keep rules
- Test on multiple devices

### iOS Issues

**Code signing failed:**
- Verify certificate is valid
- Check provisioning profile matches bundle ID
- Ensure device/simulator is registered

**Upload to App Store failed:**
- Check app version and build number
- Verify provisioning profile type
- Use Xcode Organizer for detailed errors

**Archive validation errors:**
- Update to latest Xcode
- Clean build folder (Cmd+Shift+K)
- Check for framework/library issues

### Web Issues

**Build fails:**
- Clear `.next` folder
- Delete `node_modules` and reinstall
- Check Node.js version compatibility

**Database connection errors:**
- Verify `DATABASE_URL` is correct
- Run migrations: `npx prisma migrate deploy`
- Check database is accessible

**Environment variables not working:**
- Prefix public variables with `NEXT_PUBLIC_`
- Rebuild after changing variables
- Check Vercel/Netlify dashboard

**Deployment succeeds but app doesn't work:**
- Check browser console for errors
- Verify API routes are working
- Check server logs

### CI/CD Issues

**GitHub Actions failing:**
- Check secrets are configured correctly
- Verify workflow file syntax
- Check runner OS compatibility

**Secrets not working:**
- Ensure no extra whitespace
- Base64 encode binary files correctly
- Use proper secret names

---

## Security Best Practices

### Secrets Management
- Never commit secrets to git
- Use environment variables
- Rotate keys regularly
- Use secret managers (AWS Secrets Manager, etc.)

### Code Protection
- Enable ProGuard/R8 (Android)
- Use code obfuscation
- Implement certificate pinning
- Add root detection

### API Security
- Use HTTPS only
- Implement rate limiting
- Add authentication tokens
- Validate all inputs

---

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Android Developer Guide](https://developer.android.com)
- [iOS Developer Guide](https://developer.apple.com)

### Community
- GitHub Issues: Report bugs and request features
- Discord/Slack: Community support

### Professional Support
- For deployment assistance
- Custom configuration help
- Training and workshops

---

## Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Secrets stored securely
- [ ] Database migrations tested
- [ ] Error tracking configured

### Android
- [ ] Keystore created and backed up
- [ ] ProGuard rules tested
- [ ] Release build tested on devices
- [ ] Play Console listing complete
- [ ] Screenshots uploaded

### iOS
- [ ] Code signing certificates valid
- [ ] Provisioning profiles configured
- [ ] Archive builds successfully
- [ ] App Store listing complete
- [ ] Screenshots in all sizes

### Web
- [ ] Build succeeds locally
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] SSL certificate configured
- [ ] Domain DNS configured

### Post-Deployment
- [ ] Test deployed app
- [ ] Monitor error logs
- [ ] Set up analytics
- [ ] Configure backups
- [ ] Document any issues

---

**Last Updated:** December 2025

**Version:** 1.0.0

For questions or issues, please open a GitHub issue or contact the development team.

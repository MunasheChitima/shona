# Vercel Environment Variables Setup Guide

## Quick Setup Steps

### 1. Access Vercel Project Settings

1. Go to [vercel.com](https://vercel.com) and log in
2. Navigate to your project (or create a new one if you haven't already)
3. Click on your project name
4. Go to **Settings** (in the top navigation)
5. Click on **Environment Variables** (in the left sidebar)

### 2. Add Environment Variables

You need to add **TWO** environment variables:

#### Variable 1: `JWT_SECRET`

1. Click **"Add New"** button
2. **Name**: `JWT_SECRET`
3. **Value**: Use the generated secret below (or generate a new one)
4. **Environment**: Select **Production**, **Preview**, and **Development** (all three)
5. Click **Save**

**Generated JWT_SECRET** (use this one):
```
9c155284fe8cb6258cb726c3a09325e5e7d3eeea0767e4404d5d31700d4d034a0ab11a2c79931c596ff37b6f98af20cc2e540a16b29c144f0c8b5e18946dfb87
```

#### Variable 2: `DATABASE_URL`

1. Click **"Add New"** button again
2. **Name**: `DATABASE_URL`
3. **Value**: Your PostgreSQL connection string (see format below)
4. **Environment**: Select **Production**, **Preview**, and **Development** (all three)
5. Click **Save**

**DATABASE_URL Format**:
```
postgresql://username:password@host:port/database?sslmode=require
```

### 3. Database Options

You need a PostgreSQL database. Here are recommended providers:

#### Option A: Vercel Postgres (Easiest)
1. In your Vercel project, go to **Storage** tab
2. Click **"Create Database"**
3. Select **Postgres**
4. Choose a plan (Hobby is free)
5. Once created, Vercel will automatically add the `DATABASE_URL` environment variable

#### Option B: Neon (Recommended for Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project
4. Copy the connection string from the dashboard
5. Use it as your `DATABASE_URL` in Vercel

#### Option C: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the connection string
5. Use it as your `DATABASE_URL` in Vercel

#### Option D: Render
1. Go to [render.com](https://render.com)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Use it as your `DATABASE_URL` in Vercel

### 4. Run Database Migrations

After setting up the database, you need to run Prisma migrations:

**Option 1: Using Vercel Build Command (Recommended)**
Add this to your `package.json` scripts:
```json
"vercel-build": "prisma generate && prisma migrate deploy && next build"
```

Then update `vercel.json`:
```json
{
  "buildCommand": "npm run vercel-build",
  "regions": ["iad1"]
}
```

**Option 2: Manual Migration**
Run this locally after connecting to your production database:
```bash
npx prisma migrate deploy
```

### 5. Verify Setup

1. Go back to your Vercel project dashboard
2. Click **"Deployments"**
3. Trigger a new deployment (or push to your connected branch)
4. Check the build logs to ensure:
   - Environment variables are loaded
   - Prisma client generates successfully
   - Database connection works
   - Build completes successfully

### 6. Test the Deployment

Once deployed:
1. Visit your Vercel URL
2. Try to register a new user
3. Check that authentication works
4. Verify database operations (lessons, progress, etc.)

## Troubleshooting

### Environment Variables Not Working?
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names are exact: `JWT_SECRET` and `DATABASE_URL` (case-sensitive)

### Database Connection Issues?
- Verify your `DATABASE_URL` format is correct
- Check if SSL is required (add `?sslmode=require` if needed)
- Ensure your database allows connections from Vercel's IPs
- Check database credentials are correct

### Prisma Errors?
- Make sure `postinstall` script runs: `"postinstall": "prisma generate"`
- Verify Prisma schema is correct
- Check that migrations are up to date

## Security Notes

⚠️ **Important**:
- Never commit `JWT_SECRET` or `DATABASE_URL` to Git
- Keep your JWT_SECRET secure and don't share it
- Use different secrets for production and development if possible
- Regularly rotate your secrets

## Quick Reference

**Required Environment Variables:**
- `JWT_SECRET` - Secret key for JWT token signing
- `DATABASE_URL` - PostgreSQL connection string

**Optional (if needed):**
- `NODE_ENV` - Set to `production` (Vercel sets this automatically)
- `ELEVENLABS_API_KEY` - If using ElevenLabs for audio
- `ELEVENLABS_VOICE_ID` - If using ElevenLabs for audio


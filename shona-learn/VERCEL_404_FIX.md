# Fixing Vercel 404 Error

## Problem
You're seeing: `404: NOT_FOUND` when accessing `https://learnshona.vercel.app`

## Most Common Causes

### 1. Root Directory Not Set (Most Likely)
If your repository root is NOT `shona-learn`, Vercel needs to know where your app is.

**Fix in Vercel Dashboard:**
1. Go to your Vercel project
2. Click **Settings** → **General**
3. Scroll to **Root Directory**
4. Set it to: `shona-learn`
5. Click **Save**
6. **Redeploy** your project

### 2. Build Failed
Check if your build succeeded:
1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Check the build logs for errors

**Common Build Errors:**
- Missing environment variables (`DATABASE_URL`, `JWT_SECRET`)
- Prisma migration failures
- TypeScript errors
- Missing dependencies

### 3. Deployment Not Completed
The deployment might still be in progress:
1. Check **Deployments** tab
2. Wait for deployment to finish (status should be "Ready")
3. If it failed, check the error logs

### 4. Wrong Branch Deployed
Make sure the correct branch is deployed:
1. Go to **Settings** → **Git**
2. Check which branch is set for Production
3. Ensure that branch has your latest code

## Step-by-Step Fix

### Step 1: Verify Root Directory
1. Open Vercel Dashboard
2. Select your project
3. Go to **Settings** → **General**
4. Find **Root Directory** section
5. If empty or wrong, set to: `shona-learn`
6. Save

### Step 2: Check Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Verify you have:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `JWT_SECRET` (secure random string)
3. Make sure they're set for **Production**, **Preview**, and **Development**

### Step 3: Check Build Logs
1. Go to **Deployments**
2. Click on the latest deployment
3. Check the build output
4. Look for errors like:
   - "Module not found"
   - "Type error"
   - "Prisma error"
   - "Environment variable missing"

### Step 4: Trigger New Deployment
After fixing settings:
1. Go to **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger deployment

## Quick Checklist

- [ ] Root Directory set to `shona-learn` in Vercel Settings
- [ ] `DATABASE_URL` environment variable is set
- [ ] `JWT_SECRET` environment variable is set
- [ ] Latest deployment shows "Ready" status
- [ ] Build logs show no errors
- [ ] Correct branch is deployed to Production

## If Still Not Working

### Check Deployment Status
```bash
# In Vercel Dashboard → Deployments
# Look for:
- Status: Ready ✅
- Build: Success ✅
- Runtime: No errors ✅
```

### Verify Project Structure
Your project should have this structure:
```
shona-learn/
  ├── app/
  │   ├── page.tsx        ← Home page (must exist)
  │   ├── layout.tsx      ← Root layout (must exist)
  │   └── ...
  ├── package.json
  ├── vercel.json
  └── ...
```

### Test Build Locally
Run this to verify your build works:
```bash
cd shona-learn
npm run build
```

If local build fails, fix those errors first.

## Still Getting 404?

1. **Check Vercel Project Settings:**
   - Framework: Should auto-detect as "Next.js"
   - Build Command: Should be `npm run vercel-build` (or auto-detected)
   - Output Directory: Should be `.next` (or auto-detected)

2. **Verify Domain:**
   - Make sure you're accessing the correct URL
   - Check if custom domain is configured correctly

3. **Contact Support:**
   - If everything looks correct but still 404
   - Check Vercel status page
   - Contact Vercel support with deployment ID

## Expected Result

After fixing, you should see:
- ✅ Homepage loads at `https://learnshona.vercel.app`
- ✅ Navigation works
- ✅ No 404 errors
- ✅ Build succeeds in Vercel dashboard


# Deployment Guide for Shona Learn

## Deploying to Vercel

This Next.js application is configured to deploy to Vercel. Follow these steps:

### Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A PostgreSQL database (recommended providers):
   - **Vercel Postgres** (easiest integration)
   - **Supabase** (free tier available)
   - **Neon** (serverless PostgreSQL)
   - **Railway** or **PlanetScale**

### Step 1: Set Up Database

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the `DATABASE_URL` connection string
4. Vercel will automatically add this to your environment variables

#### Option B: External Database Provider
1. Sign up for a PostgreSQL provider (Supabase, Neon, etc.)
2. Create a new PostgreSQL database
3. Copy the connection string (should look like: `postgresql://user:password@host:5432/database`)

### Step 2: Deploy to Vercel

#### Via Vercel Dashboard:
1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect Next.js
4. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A secure random string for authentication
   - `GOOGLE_AI_API_KEY` - (Optional) For AI features

5. Click "Deploy"

#### Via Vercel CLI:
```bash
npm i -g vercel
vercel
```

### Step 3: Run Database Migrations

After deployment, you need to set up the database schema:

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Pull environment variables: `vercel env pull`
4. Run migrations:
```bash
npx prisma migrate deploy
```

Or use Vercel's dashboard to run commands:
1. Go to your project → Settings → Functions
2. Add a one-time deployment command to run migrations

### Step 4: Seed Database (Optional)

To populate initial data:
```bash
npm run seed
```

## Environment Variables

Required environment variables (add these in Vercel dashboard under Settings → Environment Variables):

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key-change-me` |
| `GOOGLE_AI_API_KEY` | Google AI API key (optional) | `AIza...` |

## Troubleshooting

### Build Fails with Prisma Error
- Ensure `DATABASE_URL` is set in environment variables
- Make sure the database is accessible from Vercel
- Check that connection string format is correct

### Database Connection Issues
- Verify your database allows connections from Vercel's IP ranges
- For Supabase: Use the "connection pooling" URL
- For Neon: Enable "pooled connection" mode

### Missing Environment Variables
- Double-check all required variables are set in Vercel dashboard
- Remember to redeploy after adding new environment variables

## Local Development

For local development, you can use SQLite:

1. Create a `.env` file:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="local-dev-secret"
```

2. Update `prisma/schema.prisma` datasource to:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:
```bash
npx prisma migrate dev
npm run seed
npm run dev
```

## Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

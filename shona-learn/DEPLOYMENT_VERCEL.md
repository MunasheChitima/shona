## Vercel Deployment Guide (shona-learn)

### 1) Prerequisites
- Node 18+ locally
- Postgres database (Neon/Render/Railway)

### 2) Environment Variables (Vercel → Project Settings)
- DATABASE_URL: Postgres connection string (SSL if required)
- JWT_SECRET: strong random value

### 3) Prisma & DB
- Provider: Postgres via `DATABASE_URL`.
- Local once: `npm install` → `npx prisma migrate deploy` → optional `npm run seed`.

### 4) Build & Runtime
- Next.js auto-detected.
- `postinstall`: `prisma generate` is configured.
- Keep API routes on Node runtime (default). Avoid Edge for `bcryptjs`.

### 5) Static Assets / Audio
- If large audio files exist, host on Blob/S3/R2 and reference by URL.

### 6) Deploy Steps
- Link repo, set root to `shona-learn`.
- Set env vars for Preview & Production.
- Push branch → verify Preview → promote to Production.

### 7) Quality Checks
- `npm run build` locally.
- Lighthouse > 90, mobile + desktop, auth/lessons/audio/profile flows.

### Troubleshooting
- DB errors: check `DATABASE_URL`, SSL params, network.
- Prisma client: ensure install step runs and versions match.

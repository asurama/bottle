# Vercel Deployment Guide

To deploy 'Bottle Share' to Vercel, follow these steps:

## 1. Environment Variables
You must set the following environment variables in the Vercel Project Settings (Settings > Environment Variables):

| Variable | Value (Based on current .env) | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.klmpkttshseqnvzndfkf:...@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres` | Supabase Connection String (Transaction pooler) |
| `DIRECT_URL` | `postgresql://postgres.klmpkttshseqnvzndfkf:...@db.klmpkttshseqnvzndfkf.supabase.co:5432/postgres` | Supabase Direct Connection String (Port 5432) |
| `AUTH_SECRET` | `CaOLCs05e6f1HKbdzwOgXS+tFYkfhC7SMKzLBPuflsE=` | Generated random key for NextAuth |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |
| `EMAIL_SERVER_HOST` | `smtp.example.com` | SMTP server host |
| `EMAIL_SERVER_PORT` | `587` | SMTP server port |
| `EMAIL_SERVER_USER` | `test@example.com` | SMTP server username |
| `EMAIL_SERVER_PASSWORD` | `password` | SMTP server password |
| `EMAIL_FROM` | `noreply@bottleshare.com` | Sending email address |

> [!TIP]
> `DIRECT_URL`은 Supabase Settings > Database > Connection string > Node.js (Direct connection)에서 확인하실 수 있습니다. `DATABASE_URL`과 암호는 동일하며 호스트명만 주시해 주세요.

> [!IMPORTANT]
> Since this project uses NextAuth v5 (Auth.js), make sure `AUTH_SECRET` is set correctly.

## 2. Prisma Setup
The `package.json` has been updated with a `postinstall` script:
```json
"postinstall": "prisma generate"
```
This ensures the Prisma client is generated automatically during Vercel's build process.

## 3. Database Migration
Before the first deployment, or if you change the schema, run:
```bash
npx prisma db push
```
This will sync your local `schema.prisma` with the Supabase PostgreSQL database.

## 4. Deploy Steps
1. Push your code to a GitHub repository.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New" > "Project"**.
3. Import your repository.
4. Add the **Environment Variables** listed above.
5. Click **Deploy**.

---
*If you encounter a 500 error after deployment, check the Vercel Logs for Prisma or Auth.js related errors.*

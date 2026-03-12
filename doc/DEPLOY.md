# Vercel Deployment Guide

To deploy 'Bottle Share' to Vercel, follow these steps:

## 1. Environment Variables
You must set the following environment variables in the Vercel Project Settings (Settings > Environment Variables):

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase Connection String (Transaction pooler recommended) |
| `DIRECT_URL` | Supabase Direct Connection String (for migrations) |
| `AUTH_SECRET` | Random string for NextAuth. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your deployment URL (e.g., `https://your-app.vercel.app`) |
| `EMAIL_SERVER_HOST` | SMTP server host (e.g., `smtp.gmail.com`) |
| `EMAIL_SERVER_PORT` | SMTP server port (usually `587` or `465`) |
| `EMAIL_SERVER_USER` | SMTP server username |
| `EMAIL_SERVER_PASSWORD` | SMTP server password / App password |
| `EMAIL_FROM` | The email address to send magic links from |

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

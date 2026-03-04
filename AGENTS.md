# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

Bottle Share (보틀 쉐어) — a Korean-language whisky bottle-sharing platform built with Next.js 16 (App Router), Prisma, PostgreSQL (Supabase), and NextAuth v5 (email magic-link auth).

### Running Services

- **Dev server**: `npm run dev` (port 3000)
- **Lint**: `npm run lint` — pre-existing lint errors exist (`@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unused-vars`)
- **Build**: `npm run build`

### Key Caveats

- **npm install requires `--legacy-peer-deps`**: `nodemailer@8` conflicts with `next-auth@5.0.0-beta.30` which expects `nodemailer@^7`. Always use `npm install --legacy-peer-deps`.
- **Prisma client generation**: After dependency install, run `npx prisma generate` to generate the Prisma client. The schema is at `prisma/schema.prisma`.
- **Environment variables**: All required env vars (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `EMAIL_SERVER_*`, `EMAIL_FROM`) are injected as secrets. The app also reads from `.env` via `dotenv/config` in `prisma.config.ts`, but injected env vars take precedence.
- **Database**: Supabase-hosted PostgreSQL. Schema sync via `npx prisma db push`.
- **Authentication**: NextAuth v5 email provider (magic links). Creating shares, joining shares, and commenting all require authentication.
- **No test suite**: The project has no automated test framework or test files configured.

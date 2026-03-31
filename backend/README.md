# Backend — NEMOS API

Express + TypeScript backend untuk platform NEMOS.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express 5
- **Language**: TypeScript 6
- **ORM**: Prisma 6 + PostgreSQL (Neon)
- **Queue**: BullMQ + Redis (Upstash)
- **Payment**: Xendit (QRIS)
- **Auth**: JWT + bcrypt

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy dan isi environment variables
cp .env.example .env
# Edit .env dengan credentials asli

# 3. Push schema ke database
npx prisma db push
npx prisma generate

# 4. Start development server
npm run dev
```

## Available Scripts

| Command | Deskripsi |
|---|---|
| `npm run dev` | Start dev server (hot reload via tsx) |
| `npm run build` | Build TypeScript ke dist/ |
| `npm start` | Run production build |
| `npm run db:push` | Push Prisma schema ke PostgreSQL |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Buka Prisma Studio (GUI) |

## Database Schema

```
User ──────┐
  │        │
  ▼        ▼
Investment  UMKM
  │
  ├── Transaction (xenditId = idempotency key)
  └── Tranche (AI-verified disbursements)
```

## Environment Variables

Lihat `.env.example` untuk daftar lengkap. Variables kritis:

| Variable | Required | Deskripsi |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `REDIS_URL` | ✅ | Upstash Redis URL |
| `JWT_SECRET` | ✅ | Secret key untuk JWT (min 32 chars) |
| `XENDIT_SECRET_KEY` | ✅ | Xendit API key |
| `NEMOS_CONTRACT_ADDRESS` | ✅ | Smart contract address di Polygon |

## API Reference

### Auth
- `POST /api/auth/register` — `{ email, password, name, role }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — Requires `Authorization: Bearer <token>`

### Investment
- `POST /api/invest` — Requires auth + learningProgress = 100

### Webhook
- `POST /api/webhooks/xendit` — Xendit callback (automatic)

### Health
- `GET /api/health` — Server status check

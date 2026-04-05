# Insurance Clarity — AI Policy Scanner 🛡️

<div align="center">

**India's first AI-powered insurance policy scanner.**  
Upload any insurance PDF → get hidden clauses, claim risks, a smart score, and actionable suggestions in under 30 seconds.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?logo=prisma)](https://www.prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Policy Scan** | GPT-4.1 analyzes your PDF with IRDAI-specific context |
| 🎯 **Smart Score (0–100)** | Transparency and consumer-friendliness rating |
| ⚠️ **Risk Detection** | HIGH / MEDIUM / LOW severity risk flagging |
| 🚫 **Exclusion Mapper** | Every exclusion clause decoded into plain language |
| 🕵️ **Hidden Clause Finder** | Fine-print traps surfaced and explained |
| 💡 **Actionable Suggestions** | Prioritized steps to improve your coverage |
| 💳 **Razorpay Paywall** | Free partial results → ₹199 for full report |
| 🔒 **HMAC Verification** | Cryptographically secure payment validation |
| ♻️ **Deduplication** | SHA-256 file hash prevents re-processing same PDF |
| 🌐 **Multi-language Ready** | i18n architecture (English + Hindi locales) |

---

## 🏗️ Architecture

```
Browser (Next.js 16)
    │
    ├── /scan            ← Upload page (DropZone + trust signals)
    └── /scan/result/[id] ← Polling result page (free → paywall → paid)
         │
API Layer (Next.js Route Handlers)
    ├── POST /api/upload           ← PDF validate → Cloudinary → Scan record → BullMQ
    ├── GET  /api/result/[id]      ← Paywall-gated report delivery
    ├── POST /api/payment/create-order  ← Razorpay order creation
    └── POST /api/payment/verify        ← HMAC verify → unlock report
         │
Service Layer
    ├── pdf.service.ts     ← Extract text + SHA-256 hash
    ├── report.service.ts  ← Scan CRUD + paywall logic
    └── embedding.service.ts ← Vector embeddings (Pinecone)
         │
Worker Process (BullMQ)
    └── scan.worker.ts     ← OpenAI GPT-4.1 → Report → DB → Cache invalidation
         │
Infrastructure
    ├── Neon PostgreSQL (Prisma ORM)
    ├── Upstash Redis (caching + rate limiting)
    ├── Redis / Upstash QStash (BullMQ queue)
    ├── Cloudinary (PDF storage)
    └── Vercel (deployment, bom1 Mumbai region)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL database (Neon recommended)
- Redis (Upstash or local for dev)
- Cloudinary account
- OpenAI API key
- Razorpay account (Test mode for dev)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd nextjs-app
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in all required variables (see [Environment Variables](#-environment-variables) below).

### 3. Set Up Database

```bash
# Generate Prisma client + run migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Start Development

```bash
# Terminal 1 — Next.js dev server
npm run dev

# Terminal 2 — BullMQ scan worker
npx tsx src/workers/scan.worker.ts
```

Visit [http://localhost:3000/scan](http://localhost:3000/scan) to test the scanner.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and set:

### Core (Required)

```env
DATABASE_URL="postgresql://..."    # Neon pooled connection string
DIRECT_URL="postgresql://..."      # Neon direct connection (for migrations)
NEXTAUTH_SECRET="..."              # 32+ char random string
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### AI (Required for Scanner)

```env
OPENAI_API_KEY="sk-..."
```

### Payments (Required for full report unlock)

```env
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
```

> ⚠️ Use `rzp_test_*` keys in development. Switch to `rzp_live_*` for production.

### Storage (Required for PDF upload)

```env
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### Cache & Queue

```env
UPSTASH_REDIS_REST_URL="https://..."    # For API caching
UPSTASH_REDIS_REST_TOKEN="..."
REDIS_URL="redis://localhost:6379"       # For BullMQ worker
```

### Auth Providers (Optional)

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## 📦 Key Scripts

```bash
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run lint             # ESLint check
npm run test             # Vitest unit tests
npm run test:e2e         # Playwright E2E tests
npm run db:studio        # Prisma Studio (DB GUI)
npx prisma migrate dev   # Run DB migrations
npx tsx src/workers/scan.worker.ts  # Start BullMQ worker
```

---

## 🗄️ Database Schema (MVP Models)

```
Scan ──── Report (1:1)
  │
  └──── Payment (1:1)
  │
  └──── User (many:1, optional)
```

| Model | Purpose |
|---|---|
| `Scan` | PDF upload record — tracks status, hash, isPaid |
| `Report` | AI analysis results — score, risks, exclusions, suggestions |
| `Payment` | Razorpay order + verification record |
| `User` | Optional auth — anonymous scans supported |

---

## 🔒 Security

- **HMAC SHA-256** payment signature verification (`crypto.timingSafeEqual`)
- **Client-side PDF validation** (type + magic bytes) before upload
- **Rate limiting** via Upstash Ratelimit on upload and payment routes
- **CSP headers** configured in `next.config.js`
- **HSTS** + security headers on all routes
- **Input sanitization** — no raw SQL, all queries via Prisma ORM

See [SECURITY.md](SECURITY.md) for the full security policy.

---

## 🚢 Deployment (Vercel)

### One-Command Deploy

```bash
npx vercel --prod
```

### Required Vercel Environment Variables

Set all variables from `.env.example` in your Vercel project dashboard:

**Settings → Environment Variables**

Critical ones to set first:

```
DATABASE_URL
DIRECT_URL
NEXTAUTH_SECRET
NEXTAUTH_URL              ← set to your production domain
NEXT_PUBLIC_APP_URL       ← set to your production domain
OPENAI_API_KEY
RAZORPAY_KEY_ID           ← use live keys for production
RAZORPAY_KEY_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

### Worker Deployment

The BullMQ worker **cannot run on Vercel** (serverless). Deploy it separately:

| Option | Command |
|---|---|
| **Railway** | `railway up` (add `REDIS_URL` env var) |
| **Render** | Background worker service |
| **Docker** | `docker-compose up worker` |
| **VPS** | `pm2 start npx --name worker -- tsx src/workers/scan.worker.ts` |

> **Tip:** Use [Upstash QStash](https://upstash.com/docs/qstash/overall/getstarted) as a Vercel-compatible alternative to avoid a separate worker process.

### Post-Deploy Checklist

- [ ] Run `npx prisma migrate deploy` (prod migration)
- [ ] Set `NEXTAUTH_URL` to your live domain
- [ ] Switch Razorpay keys to `rzp_live_*`
- [ ] Create Cloudinary upload preset `insurance_scans` (unsigned)
- [ ] Test upload → scan → pay flow end-to-end
- [ ] Set up Sentry DSN for error tracking

---

## 🧪 Testing

```bash
# Unit tests (Vitest)
npm run test

# With coverage
npm run test:coverage

# E2E (Playwright — requires running server)
npm run test:e2e
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts           ← PDF upload endpoint
│   │   ├── result/[id]/route.ts      ← Report delivery
│   │   ├── payment/
│   │   │   ├── create-order/route.ts ← Razorpay order
│   │   │   └── verify/route.ts       ← Payment webhook
│   │   └── auth/[...nextauth]/       ← NextAuth handler
│   ├── scan/
│   │   ├── page.tsx                  ← Upload page
│   │   ├── layout.tsx                ← Imports scan.css
│   │   ├── scan.css                  ← All scanner styles
│   │   └── result/[id]/page.tsx      ← Result + paywall page
│   └── page.tsx                      ← Landing page
├── components/
│   ├── upload/DropZone.tsx           ← Drag & drop upload
│   └── report/
│       ├── ScoreRing.tsx             ← SVG score gauge
│       ├── RiskCard.tsx              ← Risk/Exclusion/Suggestion cards
│       └── PaywallGate.tsx           ← Razorpay checkout flow
├── lib/
│   ├── openai.ts                     ← OpenAI singleton
│   ├── prisma.ts                     ← Prisma singleton
│   ├── queue/scan-queue.ts           ← BullMQ queue client
│   └── cache/redis.ts                ← Upstash Redis wrapper
├── services/
│   ├── pdf.service.ts                ← PDF extraction + hashing
│   ├── report.service.ts             ← Scan CRUD + paywall
│   └── embedding.service.ts          ← Vector embeddings
├── store/scan.store.ts               ← Zustand scan state
├── types/report.types.ts             ← Shared TypeScript types
└── workers/scan.worker.ts            ← BullMQ worker (standalone)
```

---

## 📋 Roadmap

- [ ] **v1.1** — WhatsApp report delivery (Twilio / Meta WABA)
- [ ] **v1.2** — Policy comparison (2 PDFs side-by-side)
- [ ] **v1.3** — Hindi language report output
- [ ] **v2.0** — Agent API for insurance brokers
- [ ] **v2.1** — Claim risk predictor (ML model)

---

## ⚖️ Legal

InsuranceClarity is an **educational platform**. It is not an IRDAI-registered insurance intermediary and does not sell, underwrite, or endorse any insurance product. AI analysis is for informational purposes only — always consult a licensed advisor before making coverage decisions.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Run quality checks: `npm run lint && npm run test`
4. Submit a pull request to `develop`

---

<div align="center">

Built with ❤️ for Indian insurance consumers

</div>

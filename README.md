# InsuranceClarity India 🛡️

> India's Most Transparent Insurance Platform - Compare policies, uncover hidden exclusions, and make informed decisions.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal)
![Tests](https://img.shields.io/badge/Tests-43%20passing-green)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd nextjs-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── insurance/         # Insurance category pages
│   ├── tools/             # Tool pages (calculator, compare, etc.)
│   └── globals.css        # Design tokens & global styles
├── components/
│   ├── premium/           # Premium animated components
│   │   ├── buttons/       # MagicButton, GlowButton
│   │   ├── cards/         # GlassCard, TiltCard
│   │   ├── effects/       # AnimatedBlob, FloatingElement
│   │   ├── motion/        # RevealOnScroll, Parallax
│   │   └── text/          # AnimatedHeading, TextRoll
│   └── ui/                # Base UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & services
│   ├── analytics.ts       # Event tracking
│   ├── logger.ts          # Structured logging (Pino)
│   ├── pii-mask.ts        # PII data masking
│   └── utils.ts           # Helper functions
└── tests/                 # Test setup
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E with UI
npm run test:e2e:ui
```

**Test Coverage:**

- 43 unit tests across 5 test files
- E2E tests for homepage and tool pages

## 🔒 Security

- **PII Masking**: All sensitive data (Aadhaar, PAN, Email, Phone) is masked in logs
- **CSP Headers**: Content Security Policy via middleware
- **HSTS**: Strict Transport Security enabled
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.

## 📊 Monitoring

- **Sentry**: Error tracking and performance monitoring
- **Web Vitals**: Core Web Vitals (LCP, FID, CLS) tracking
- **Structured Logging**: Pino logger with JSON output

## 🎨 Design System

The app uses a premium glassmorphism design with:

- **Light Mode**: Green accent (#4CAF50)
- **Dark Mode**: Blue accent (#3B82F6)
- **Animations**: Framer Motion throughout
- **Typography**: Inter + Outfit fonts

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run db:studio` | Open Prisma Studio |

## 🔧 Environment Variables

See `.env.example` for all available options:

- `DATABASE_URL` - PostgreSQL connection
- `SENTRY_DSN` - Sentry error tracking
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics

## 📄 License

MIT © InsuranceClarity India

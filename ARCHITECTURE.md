# Architecture Documentation

## Overview

InsuranceClarity is a Next.js 14 application using the App Router with a focus on premium UI/UX and insurance-specific functionality.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   React 18  │  │   Framer    │  │    TailwindCSS      │  │
│  │ Components  │  │   Motion    │  │    + Glassmorphism  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 14 App Router                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │  Middleware │  │     API Routes      │  │
│  │  (SSR/SSG)  │  │  (Security) │  │   (/app/api/*)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data & Services                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Prisma    │  │   Sentry    │  │      Pino           │  │
│  │    ORM      │  │  (Errors)   │  │    (Logging)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Premium Component Library

```
components/premium/
├── buttons/          # Interactive buttons with animations
│   └── magic-button  # Spring animations, glow effects
├── cards/            # Glass cards with depth
│   ├── glass-card    # Glassmorphism container
│   └── tilt-card     # 3D tilt on hover
├── effects/          # Visual effects
│   ├── animated-blob # Morphing background shapes
│   └── floating      # Float animation wrapper
├── motion/           # Scroll-based animations
│   ├── reveal        # Fade-in on scroll
│   ├── stagger       # Staggered children animations
│   └── parallax      # Parallax scrolling
└── text/             # Typography animations
    ├── heading       # Word-by-word reveal
    ├── gradient      # Gradient text
    └── text-roll     # Rotating text carousel
```

### Design Token System

```css
/* Defined in globals.css */
:root {
  /* Colors adapt to theme */
  --color-accent: 76 175 80;      /* Green (light) */
  --color-bg-primary: 255 255 255;
  
  /* Motion tokens */
  --motion-fast: 200ms;
  --motion-slow: 800ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

.dark {
  --color-accent: 59 130 246;     /* Blue (dark) */
  --color-bg-primary: 10 15 26;
}
```

## Data Flow

### Client-Side

1. **Page Load** → SSR/SSG renders initial HTML
2. **Hydration** → React takes over, animations initialize
3. **User Interaction** → Events tracked via `analytics.ts`
4. **Errors** → Captured by Sentry client

### Server-Side

1. **Request** → Middleware adds security headers
2. **API Route** → Handles data operations
3. **Database** → Prisma queries PostgreSQL
4. **Logging** → Pino logs with PII masking
5. **Errors** → Sentry server captures exceptions

## Security Architecture

```
Request → Middleware → Page/API
             │
             ├── CSP Headers
             ├── X-Frame-Options: DENY
             ├── X-XSS-Protection
             └── Referrer-Policy
```

**PII Protection:**

- All logging uses `pii-mask.ts` utilities
- Aadhaar, PAN, Email, Phone auto-masked
- No sensitive data in client-side analytics

## Testing Strategy

```
         E2E (Playwright)
              ▲
              │
    Integration (API Routes)
              ▲
              │
      Unit (Vitest + RTL)
```

- **Unit**: 43 tests (utils, hooks, components)
- **E2E**: Homepage, navigation, tools
- **CI**: GitHub Actions on push/PR

## Deployment

Recommended: **Vercel** (optimal for Next.js)

```bash
# Production build
npm run build

# Start production server
npm start
```

Environment variables required in production:

- `DATABASE_URL`
- `SENTRY_DSN`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

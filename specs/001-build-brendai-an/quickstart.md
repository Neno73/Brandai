# BrendAI Quickstart Guide

**Feature**: Automated Brand Merchandise Design System
**Last Updated**: 2025-10-12

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js**: 18.17.0+ (LTS recommended)
- **npm**: 9.6.0+ or **pnpm**: 8.0.0+ (pnpm recommended for faster installs)
- **Git**: 2.40.0+
- **Vercel CLI**: `npm i -g vercel@latest` (for local database and deployment)
- **API Keys & Secrets**: You'll need accounts for:
  - Brandfetch (https://brandfetch.com) - Brand data extraction
  - Firecrawl (https://firecrawl.dev) - Web scraping
  - Google AI Studio (https://ai.google.dev) - Gemini 2.5 Flash (text) & Nanobana (images)
  - Resend (https://resend.com) - Email delivery
  - Vercel Blob Storage (via Vercel Dashboard) - Image asset storage
  - Magic Link Secret (generate locally) - Session authentication
  - Admin Credentials (generate locally) - Admin panel access

## Initial Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd Brandai

# Install dependencies (pnpm recommended)
pnpm install
# or
npm install

# Checkout feature branch
git checkout 001-build-brendai-an
```

### 2. Project Structure Overview

```
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Landing page
│   ├── session/[id]/      # Session pages (magic link)
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── actions/           # Server Actions
├── lib/                   # Shared utilities
│   ├── db/               # Database queries
│   ├── services/         # External API clients
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
├── components/           # React components
├── public/              # Static assets
└── specs/               # Feature specifications
```

## Database Setup

### Local Development with Neon Postgres

**Option 1: Via Vercel Integration (Recommended)**

```bash
# Login to Vercel
vercel login

# Link project to Vercel
vercel link

# Add Neon integration in Vercel dashboard:
# 1. Go to Vercel Dashboard → Integrations → Neon
# 2. Install and connect to your project
# 3. Create database

# Pull environment variables (includes DATABASE_URL from Neon)
vercel env pull .env.local

# Run database migration
psql $DATABASE_URL -f lib/db/migrations.sql
```

**Option 2: Direct Neon Setup**

```bash
# Install Neon CLI
npm install -g neonctl

# Login to Neon
neonctl auth

# Create project
neonctl projects create --name brendai

# Create database
neonctl databases create --project-id <project-id> --name main

# Get connection string
neonctl connection-string <branch-id>

# Add to .env.local as DATABASE_URL
# Run migration
psql $DATABASE_URL -f lib/db/migrations.sql
```

### Verify Database Setup

```bash
# Check tables exist
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"

# Should output: sessions, products

# Check seed data
psql $DATABASE_URL -c "SELECT name FROM products;"

# Should output: T-Shirt, Hoodie, Mug, USB Stick, Socks
```

### Database Branching (Optional)

Neon supports database branching for isolated development:

```bash
# Create branch for feature development
neonctl branches create --name 001-build-brendai-an

# Get branch connection string
neonctl connection-string 001-build-brendai-an

# Use this connection string in .env.local for isolated testing
```

## shadcn/ui Setup

### Initialize shadcn/ui

```bash
# Initialize shadcn/ui (creates components/ui directory and config)
npx shadcn-ui@latest init

# Follow prompts:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - Tailwind config: tailwind.config.ts
# - Components: @/components
# - Utils: @/lib/utils
```

### Add Required Components

```bash
# Add all components needed for BrendAI
npx shadcn-ui@latest add button card input badge dialog table progress alert skeleton separator

# Or add individually as needed during development
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
# ... etc
```

This creates:
- `components/ui/` directory with all components
- `lib/utils/cn.ts` utility for classnames
- Updated `tailwind.config.ts` with theme tokens
- Updated `app/globals.css` with CSS variables

## Environment Configuration

### 1. Create `.env.local`

```bash
cp .env.example .env.local
```

### 2. Fill in API Keys

```env
# Database (from Neon via Vercel or direct)
DATABASE_URL=postgres://...

# External APIs
BRANDFETCH_API_KEY=your_brandfetch_key_here
FIRECRAWL_API_KEY=your_firecrawl_key_here
GEMINI_API_KEY=your_google_ai_key_here
RESEND_API_KEY=your_resend_key_here

# Vercel Blob Storage (from Vercel dashboard)
BLOB_READ_WRITE_TOKEN=your_blob_token_here

# Authentication
MAGIC_LINK_SECRET=generate_random_256_bit_hex
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=generate_bcrypt_hash

# App Config
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Generate Secrets

```bash
# Generate magic link secret (256-bit hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate admin password hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_password', 10))"
```

### 4. Get API Keys

**Brandfetch**:
1. Sign up at https://brandfetch.com
2. Go to Dashboard → API Keys
3. Copy API key

**Firecrawl**:
1. Sign up at https://firecrawl.dev
2. Navigate to Settings → API Keys
3. Copy API key (free tier: 500 credits/month)

**Google Gemini**:
1. Go to https://ai.google.dev/tutorials/setup
2. Click "Get API Key"
3. Create project, enable Generative AI API
4. Copy API key

**Resend**:
1. Sign up at https://resend.com
2. Go to API Keys
3. Create key (free tier: 100 emails/day)

**Vercel Blob**:
1. Vercel Dashboard → Storage → Create Store → Blob
2. Copy `BLOB_READ_WRITE_TOKEN` from environment variables

## Development Workflow

### 1. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

Open http://localhost:3000 in browser.

### 2. Hot Reload

Next.js automatically reloads on file changes:
- **Server Components**: Full page reload
- **Client Components**: Fast refresh (preserves state)
- **API Routes**: Restart required (automatic)

### 3. Type Checking

```bash
# Run TypeScript compiler
pnpm typecheck
# or
npm run typecheck
```

### 4. Linting

```bash
# Run ESLint
pnpm lint
# or
npm run lint

# Auto-fix issues
pnpm lint --fix
```

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test
# or
npm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

**Example test file**: `tests/unit/services/gemini-text.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { generateConcept } from '@/lib/services/gemini-text'

describe('generateConcept', () => {
  it('generates concept from scraped data', async () => {
    const scrapedData = {
      title: 'EcoTech Solutions',
      colors: ['#1E3A8A', '#10B981'],
      content: 'Sustainable software...'
    }

    const result = await generateConcept(scrapedData)
    expect(result).toContain('sustainable')
    expect(result.length).toBeGreaterThan(100)
  })
})
```

### Integration Tests

```bash
# Run integration tests
pnpm test:integration

# Test database queries
pnpm test:db
```

### E2E Tests (Playwright via MCP)

```bash
# Run end-to-end tests
pnpm test:e2e

# Open Playwright UI
pnpm test:e2e:ui
```

**Example E2E test**: `tests/e2e/user-flows.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test('complete brand kit generation flow', async ({ page }) => {
  await page.goto('http://localhost:3000')

  // Fill form
  await page.fill('input[name="url"]', 'https://example.com')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')

  // Wait for scraping
  await expect(page.locator('text=Analyzing website...')).toBeVisible()

  // Verify concept stage
  await page.waitForURL(/\/session\/.*/)
  await expect(page.locator('h2:has-text("Creative Concept")')).toBeVisible()
})
```

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Deploy preview (automatic on PR)
git push origin 001-build-brendai-an

# Deploy production
vercel --prod
```

**Or via Vercel Dashboard**:
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push to `main`

### Environment Variables Setup

In Vercel Dashboard → Settings → Environment Variables, add:

- `BRANDFETCH_API_KEY`
- `FIRECRAWL_API_KEY`
- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `MAGIC_LINK_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `NEXT_PUBLIC_BASE_URL` (set to production domain)

`DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` are automatically set by Vercel Storage.

### Function Timeouts

Configure in `vercel.json`:

```json
{
  "functions": {
    "app/api/generate-products/route.ts": {
      "maxDuration": 300
    },
    "app/api/scrape/route.ts": {
      "maxDuration": 90
    }
  }
}
```

## Common Tasks

### Add a New Product Template

**Via UI** (recommended):
1. Login to `/admin`
2. Navigate to Products
3. Click "Add Product"
4. Upload base image, configure print zones
5. Save

**Via SQL**:
```sql
INSERT INTO products (name, base_image_url, print_zones, constraints, max_colors)
VALUES (
  'Tote Bag',
  '/assets/product-mockups/tote.png',
  '["front", "back"]'::jsonb,
  'Canvas material, max print size 12x12 inches',
  8
);
```

### Test Email Sending Locally

```typescript
// Create test script: scripts/test-email.ts
import { sendBrandKitEmail } from '@/lib/services/email'

const mockSession = {
  id: 'test-123',
  email: 'your-email@example.com',
  scraped_data: { title: 'Test Company' }
}

const pdfBuffer = Buffer.from('fake pdf data')

await sendBrandKitEmail(mockSession, pdfBuffer)
console.log('Email sent! Check your inbox.')
```

Run: `tsx scripts/test-email.ts`

### Debug AI Generation

Enable verbose logging:

```typescript
// lib/services/gemini-image.ts
const DEBUG = process.env.DEBUG_AI === 'true'

if (DEBUG) {
  console.log('Prompt:', prompt)
  console.log('Image input:', logoBase64.slice(0, 100) + '...')
}
```

Set `DEBUG_AI=true` in `.env.local` and check server logs.

### Regenerate Database Schema

After modifying `lib/db/migrations.sql`:

```bash
# Backup existing data
pg_dump $POSTGRES_URL > backup.sql

# Drop and recreate (WARNING: deletes all data)
psql $POSTGRES_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $POSTGRES_URL -f lib/db/migrations.sql

# Restore data
psql $POSTGRES_URL < backup.sql
```

## Troubleshooting

### Issue: "Cannot find module '@/lib/...'"

**Solution**: Check `tsconfig.json` paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: "ECONNREFUSED" when connecting to Postgres

**Solution**:
1. Verify `POSTGRES_URL` in `.env.local`
2. Check Vercel Postgres is running: `vercel postgres ls`
3. Test connection: `psql $POSTGRES_URL -c "SELECT 1;"`

### Issue: "API quota exceeded" for Gemini

**Solution**:
1. Check quota in Google AI Studio dashboard
2. Implement caching for concept/motif regeneration
3. Add exponential backoff retry logic

### Issue: Images not uploading to Vercel Blob

**Solution**:
1. Verify `BLOB_READ_WRITE_TOKEN` is correct
2. Check Vercel Blob storage exists in dashboard
3. Test upload manually:
```bash
curl -X PUT "https://blob.vercel-storage.com/test.png" \
  -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN" \
  --data-binary @test.png
```

### Issue: Email not sending

**Solution**:
1. Check Resend API key is valid
2. Verify sender domain is verified in Resend dashboard
3. Check email logs: `resend.com/logs`
4. For development, use Resend's sandbox domain

### Issue: Slow AI generation

**Optimization**:
- Use `gemini-1.5-flash` (faster than `pro`)
- Reduce image resolution before sending to Gemini Image
- Implement result caching for identical prompts
- Consider parallel generation (requires API quota increase)

### Issue: Session stuck in "scraping" status

**Debug**:
```bash
# Check session status
psql $POSTGRES_URL -c "SELECT id, status, updated_at FROM sessions WHERE id='<session-id>';"

# Manually update status
psql $POSTGRES_URL -c "UPDATE sessions SET status='failed' WHERE id='<session-id>';"
```

## Additional Resources

- **Next.js 14 Docs**: https://nextjs.org/docs
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Gemini API**: https://ai.google.dev/gemini-api/docs
- **Resend Docs**: https://resend.com/docs
- **React PDF**: https://react-pdf.org/

## Getting Help

- **Feature Spec**: `/specs/001-build-brendai-an/spec.md`
- **Implementation Plan**: `/specs/001-build-brendai-an/plan.md`
- **API Contracts**: `/specs/001-build-brendai-an/contracts/`
- **Data Model**: `/specs/001-build-brendai-an/data-model.md`

For questions or issues, refer to the feature specification or reach out to the team.

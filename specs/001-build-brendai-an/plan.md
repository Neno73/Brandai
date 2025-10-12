# Implementation Plan: BrendAI - Automated Brand Merchandise Design System

**Branch**: `001-build-brendai-an` | **Date**: 2025-10-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-build-brendai-an/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

BrendAI is an automated lead generation system that transforms company websites into custom branded merchandise designs. The system scrapes brand data (logo, colors, fonts, content), uses AI to generate creative concepts and design motifs, applies those designs to 5 merchandise products (t-shirt, hoodie, mug, USB, socks), and delivers a professional PDF presentation via email within 8 minutes. Built on Next.js 14+ with Neon Postgres (accessed via Vercel), integrating Brandfetch for brand extraction, Firecrawl for content scraping, Google Gemini for concept/image generation, and Resend for email delivery. UI built with shadcn/ui components and Tailwind CSS. Supports regeneration of concepts/motifs, magic link session resumption, and admin product template management.

## Technical Context

**Language/Version**: JavaScript/TypeScript (Node.js 18+, Next.js 14+ App Router)
**Primary Dependencies**:
- Next.js 14+ (App Router with Server Actions)
- React 18+ (for UI components and React PDF renderer)
- Neon Postgres (serverless SQL database via @neondatabase/serverless)
- shadcn/ui (pre-built, accessible React components)
- Tailwind CSS (utility-first styling)
- Radix UI (headless component primitives, used by shadcn/ui)
- Brandfetch API SDK (brand data extraction)
- Firecrawl SDK (web scraping)
- Google Generative AI SDK (@google/generative-ai) for Gemini 2.5 Flash (text generation) and Nanobana (image generation)
- Resend SDK (email delivery)
- React PDF renderer (@react-pdf/renderer)
- Zod (validation)
- class-variance-authority (CVA) & clsx (utility for conditional classnames)
- tailwind-merge (merge Tailwind classes)

**Storage**: Neon Postgres (serverless, accessed via Vercel) with single `sessions` table storing JSONB for scraped data and product images. Image assets stored in Vercel Blob Storage.

**Testing**: Vitest for unit tests, Playwright for E2E tests via MCP integration, React Testing Library for component tests

**Target Platform**: Vercel serverless deployment (Edge Functions + Node.js serverless functions)

**Project Type**: Web application (Next.js full-stack with API routes and server actions)

**Performance Goals**:
- End-to-end workflow completion: <8 minutes (95% of sessions)
- Concept generation: <20 seconds
- Motif generation: <60 seconds
- Product mockup generation: <5 minutes (5 sequential AI calls)
- PDF generation: <20 seconds
- Support 50 concurrent sessions

**Constraints**:
- Brandfetch API rate limits (free tier: TBD requests/day)
- Firecrawl API rate limits (free tier: TBD credits/month)
- Google Gemini API quotas (Flash/Pro text, Flash Image generation)
- Resend free tier: 100 emails/day
- Neon Postgres: Automatic connection pooling for serverless via @neondatabase/serverless
- Neon Free Tier: 512 MB storage, 1 compute unit, unlimited projects
- Vercel Blob Storage: Asset size limits
- Client-side 3-minute countdown timers must persist across navigation

**Scale/Scope**:
- MVP: 10-50 sessions/day expected
- Single admin user (hardcoded credentials)
- 5 pre-configured products (expandable via admin panel)
- Session data persists indefinitely (no cleanup logic in MVP)
- Magic link tokens: no expiration in MVP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: Constitution file is a template placeholder. No specific project constitution exists yet.

**Evaluation**:
- No established principles to validate against
- Proceeding with standard web application best practices:
  - Component-based architecture (React)
  - Server-first data fetching (Next.js Server Actions)
  - Type safety (TypeScript)
  - Separation of concerns (API routes, server actions, components)
  - Error boundaries and graceful degradation
  - Test coverage for critical paths

**Post-Design Re-evaluation**: Will validate the following after Phase 1:
- Database schema normalization vs denormalization (JSONB usage)
- API contract clarity and versioning
- Error handling patterns across external APIs
- Session state management approach
- Image asset storage strategy

## Project Structure

### Documentation (this feature)

```
specs/001-build-brendai-an/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-routes.yaml  # OpenAPI spec for REST endpoints
│   └── server-actions.ts # TypeScript interfaces for Server Actions
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
app/
├── page.tsx                    # Landing page with URL/email form
├── layout.tsx                  # Root layout with providers
├── session/
│   └── [sessionId]/
│       └── page.tsx            # Magic link session page
├── admin/
│   ├── page.tsx                # Admin dashboard
│   ├── login/
│   │   └── page.tsx            # Admin login
│   └── products/
│       └── page.tsx            # Product template management
└── api/
    ├── scrape/
    │   └── route.ts            # POST: Brandfetch + Firecrawl orchestration
    ├── generate-concept/
    │   └── route.ts            # POST: Gemini text generation
    ├── generate-motif/
    │   └── route.ts            # POST: Gemini Image generation (6 elements)
    ├── generate-products/
    │   └── route.ts            # POST: 5x Gemini Image calls for mockups
    ├── create-presentation/
    │   └── route.ts            # POST: React PDF generation
    └── send-email/
        └── route.ts            # POST: Resend email with PDF + magic link

lib/
├── db/
│   ├── schema.ts               # Neon Postgres schema definitions
│   ├── queries.ts              # Database query functions
│   └── migrations.sql          # SQL migration scripts
├── services/
│   ├── brandfetch.ts           # Brandfetch API client wrapper
│   ├── firecrawl.ts            # Firecrawl scraping logic
│   ├── gemini-text.ts          # Gemini concept generation
│   ├── gemini-image.ts         # Gemini motif/product generation
│   ├── pdf-generator.ts        # React PDF document creation
│   └── email.ts                # Resend email service
├── types/
│   ├── session.ts              # Session and entity types
│   ├── scraped-data.ts         # Brand data types
│   └── product.ts              # Product template types
├── utils/
│   ├── validation.ts           # Zod schemas for input validation
│   ├── magic-link.ts           # Token generation/validation
│   ├── image-processing.ts     # Logo format conversion, quality checks
│   └── cn.ts                   # Tailwind utility (clsx + tailwind-merge)
└── constants/
    └── product-constraints.ts  # Default product configurations

components/
├── ui/                         # shadcn/ui components (installed via CLI)
│   ├── button.tsx              # Button variants
│   ├── input.tsx               # Form inputs
│   ├── card.tsx                # Card container
│   ├── badge.tsx               # Status badges
│   ├── dialog.tsx              # Modal dialogs
│   ├── dropdown-menu.tsx       # Dropdown menus
│   ├── table.tsx               # Data tables
│   ├── progress.tsx            # Progress bars
│   ├── alert.tsx               # Alert messages
│   ├── skeleton.tsx            # Loading skeletons
│   ├── separator.tsx           # Visual dividers
│   └── ...                     # Other shadcn components as needed
├── landing/
│   ├── hero.tsx                # Landing page hero section
│   └── input-form.tsx          # URL + Email form
├── session/
│   ├── brand-analysis.tsx      # Display scraped data
│   ├── concept-display.tsx     # Show generated concept
│   ├── motif-display.tsx       # Show 6 design elements
│   ├── product-gallery.tsx     # Display 5 mockups
│   ├── color-picker.tsx        # Edit brand colors
│   └── countdown-timer.tsx     # 3-minute auto-proceed timer
├── admin/
│   ├── session-table.tsx       # All sessions list
│   ├── session-detail.tsx      # Single session view
│   └── product-form.tsx        # Create/edit product templates
└── shared/
    ├── loading-spinner.tsx     # Progress indicators
    └── error-message.tsx       # Error display component

public/
└── assets/
    ├── product-mockups/        # Default product template images
    └── branding/               # BrendAI logo and assets

tests/
├── unit/
│   ├── services/               # Service layer tests
│   ├── utils/                  # Utility function tests
│   └── components/             # Component tests
├── integration/
│   ├── api/                    # API route integration tests
│   └── workflows/              # Multi-step workflow tests
└── e2e/
    └── user-flows.spec.ts      # Playwright E2E tests
```

**Structure Decision**: Selected web application structure (frontend + backend unified in Next.js App Router). All server-side logic (API routes, database queries, external API calls) lives in `/app/api/` and `/lib/`. Client components in `/components/` are organized by feature area (landing, session, admin, shared). This structure leverages Next.js 14's App Router conventions with server-first data fetching via Server Actions where appropriate, and REST API routes for complex workflows.

## Complexity Tracking

*No Constitution violations identified. Standard web application architecture.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

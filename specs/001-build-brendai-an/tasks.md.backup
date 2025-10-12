# Tasks: BrendAI - Automated Brand Merchandise Design System

**Input**: Design documents from `/specs/001-build-brendai-an/`
**Feature Branch**: `001-build-brendai-an`
**Tech Stack**: Next.js 14+ App Router, Neon Postgres, shadcn/ui, Tailwind CSS, Google Gemini AI, Brandfetch, Firecrawl, Resend

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1-US6) for traceability
- File paths are absolute from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Next.js structure

- [ ] T001 [P] Initialize Next.js 14+ project with TypeScript in repository root using `npx create-next-app@latest . --typescript --app --tailwind --no-src-dir`
- [ ] T002 [P] Configure shadcn/ui by running `npx shadcn-ui@latest init` with TypeScript, default style, slate base color, and CSS variables
- [ ] T003 [P] Install core dependencies in `package.json`: `@neondatabase/serverless`, `brandfetch`, `@mendable/firecrawl-js`, `@google/generative-ai`, `resend`, `@react-pdf/renderer`, `zod`, `bcryptjs`, `class-variance-authority`, `clsx`, `tailwind-merge`
- [ ] T004 [P] Create `.env.local` file with required environment variables: `DATABASE_URL`, `BRANDFETCH_API_KEY`, `FIRECRAWL_API_KEY`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `MAGIC_LINK_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXT_PUBLIC_BASE_URL`
- [ ] T005 [P] Configure TypeScript paths in `tsconfig.json` to support `@/` imports mapping to repository root
- [ ] T006 [P] Add required shadcn/ui components: `npx shadcn-ui@latest add button card input badge dialog table progress alert skeleton separator dropdown-menu`
- [ ] T007 [P] Create project directory structure: `lib/db/`, `lib/services/`, `lib/types/`, `lib/utils/`, `lib/constants/`, `components/ui/`, `components/landing/`, `components/session/`, `components/admin/`, `components/shared/`
- [ ] T008 [P] Configure ESLint and Prettier in `.eslintrc.json` and `.prettierrc` with Next.js and TypeScript rules
- [ ] T009 [P] Create `lib/utils/cn.ts` with clsx and tailwind-merge utility function for className merging

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Create database schema in `lib/db/migrations.sql` with sessions table (id, email, url, status, scraped_data, concept, motif_image_url, product_images, created_at, updated_at) and products table (id, name, base_image_url, print_zones, constraints, max_colors, recommended_elements, is_archived, created_at)
- [ ] T011 [P] Create TypeScript types in `lib/types/session.ts` for Session, SessionStatus, ScrapedData, ProductImage entities matching database schema
- [ ] T012 [P] Create TypeScript types in `lib/types/product.ts` for Product, ProductInput, PrintZone, ElementType entities
- [ ] T013 Create Neon database client in `lib/db/client.ts` using `@neondatabase/serverless` with connection pooling
- [ ] T014 Create database query functions in `lib/db/queries.ts` for: `createSession()`, `getSession()`, `updateSession()`, `getProducts()`, `createProduct()`, `updateProduct()`, `archiveProduct()`
- [ ] T015 [P] Seed database with 5 default products in `lib/db/seed.sql`: T-Shirt (front/back), Hoodie (front/back/sleeves), Mug (wrap), USB Stick (all-over), Socks (ankle)
- [ ] T016 [P] Create validation schemas in `lib/utils/validation.ts` using Zod for: URL validation, email validation, color hex code validation, session creation input, API request bodies
- [ ] T017 [P] Create magic link utilities in `lib/utils/magic-link.ts` for: `generateMagicLink()`, `validateMagicLink()` using HMAC signing with `MAGIC_LINK_SECRET`
- [ ] T018 [P] Create image processing utilities in `lib/utils/image-processing.ts` for: logo format conversion (to PNG), quality validation (minimum 500x500px), base64 encoding
- [ ] T019 [P] Create error handling utilities in `lib/utils/error-handler.ts` for: API error responses, error logging, retry logic wrapper
- [ ] T020 [P] Create product constraints constants in `lib/constants/product-constraints.ts` with default constraints for all 5 products (print zones, color limits, size restrictions)
- [ ] T021 Configure Vercel Blob Storage integration for image uploads in `lib/services/blob-storage.ts` using `@vercel/blob` SDK
- [ ] T022 Create root layout in `app/layout.tsx` with Next.js metadata, Tailwind CSS globals import, and proper HTML structure
- [ ] T023 [P] Create loading spinner component in `components/shared/loading-spinner.tsx` using shadcn/ui Skeleton
- [ ] T024 [P] Create error message component in `components/shared/error-message.tsx` using shadcn/ui Alert

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Lead Capture Through Brand Kit Generation (Priority: P1) 🎯 MVP

**Goal**: Enable users to submit website URL and email, automatically scrape brand data, generate creative concept and design motifs, apply to 5 products, and receive PDF via email within 8 minutes

**Independent Test**: Submit a website URL (e.g., https://stripe.com) and email address, verify scraping completes, concept generates, motif displays 6 elements, 5 product mockups are created, and PDF is delivered via email with magic link within 8 minutes

### Stage 1: Brand Scraping & Data Extraction [US1]

- [ ] T025 [P] [US1] Create Brandfetch API client in `lib/services/brandfetch.ts` with functions: `extractLogo()`, `extractColors()`, `extractFonts()`
- [ ] T026 [P] [US1] Create Firecrawl scraping service in `lib/services/firecrawl.ts` with function `scrapeWebsiteContent()` to extract title, description, headings, and ~500 tokens of text
- [ ] T027 [US1] Create scraping orchestration API route in `app/api/scrape/route.ts` (POST) that: validates input, creates session, calls Brandfetch + Firecrawl in parallel, analyzes text for tone/themes/sentiment, stores scraped_data in database, returns session_id (depends on T025, T026)
- [ ] T028 [US1] Create scraping status API route in `app/api/scrape/status/[sessionId]/route.ts` (GET) that returns session status and scraped_data for polling
- [ ] T029 [P] [US1] Create landing page hero component in `components/landing/hero.tsx` with BrendAI branding, value proposition copy, and visual assets
- [ ] T030 [P] [US1] Create input form component in `components/landing/input-form.tsx` with URL input, email input, submit button, and client-side validation using shadcn/ui Input and Button
- [ ] T031 [US1] Create landing page in `app/page.tsx` that renders hero and input form, calls `/api/scrape` on submit, redirects to `/session/[sessionId]` on success
- [ ] T032 [P] [US1] Create brand analysis display component in `components/session/brand-analysis.tsx` showing logo, color swatches, fonts, tone, themes, audience with shadcn/ui Card

### Stage 2: Creative Concept Generation [US1]

- [ ] T033 [US1] Create Gemini text generation service in `lib/services/gemini-text.ts` with function `generateConcept(scrapedData)` that analyzes brand data and produces 2-3 paragraph concept with prominent theme
- [ ] T034 [US1] Create concept generation API route in `app/api/generate-concept/route.ts` (POST) that: validates session_id, retrieves scraped_data, calls Gemini, stores concept in database, returns concept and prominent_theme
- [ ] T035 [P] [US1] Create concept display component in `components/session/concept-display.tsx` showing generated concept text in read-only format with prominent theme badge using shadcn/ui Card and Badge
- [ ] T036 [P] [US1] Create countdown timer component in `components/session/countdown-timer.tsx` with 3-minute countdown, warning at 30 seconds, auto-proceed callback using React state and useEffect

### Stage 3: Design Motif Generation [US1]

- [ ] T037 [US1] Create Gemini image generation service in `lib/services/gemini-image.ts` with function `generateMotif(logo, colors, concept)` that creates single image with 6 cohesive design elements using brand colors
- [ ] T038 [US1] Create motif generation API route in `app/api/generate-motif/route.ts` (POST) that: validates session_id, retrieves session data, calls Gemini Image, uploads motif to Vercel Blob, stores motif_image_url in database, returns motif URL and storytelling text
- [ ] T039 [P] [US1] Create motif display component in `components/session/motif-display.tsx` showing 6 design elements image and storytelling explanation with shadcn/ui Card

### Stage 4: Product Mockup Generation [US1]

- [ ] T040 [US1] Extend `lib/services/gemini-image.ts` with function `generateProductMockup(motif, logo, colors, product, constraints)` that selects appropriate elements and creates product-specific mockup
- [ ] T041 [US1] Create product generation API route in `app/api/generate-products/route.ts` (POST) that: validates session_id, retrieves session and products, makes 5 sequential Gemini Image calls (one per product), uploads each mockup to Vercel Blob, stores product_images array in database, uses streaming response for progress updates
- [ ] T042 [P] [US1] Create product gallery component in `components/session/product-gallery.tsx` displaying all 5 mockups in grid layout with product names using shadcn/ui Card

### Stage 5: PDF Presentation & Email Delivery [US1]

- [ ] T043 [US1] Create PDF generator service in `lib/services/pdf-generator.ts` using `@react-pdf/renderer` with 7 sections: cover page, brand analysis, creative concept, motif showcase, merchandise applications, brand guidelines, next steps
- [ ] T044 [US1] Create presentation generation API route in `app/api/create-presentation/route.ts` (POST) that: validates session_id, retrieves complete session, generates PDF with React PDF, uploads PDF to Vercel Blob, returns pdf_url
- [ ] T045 [US1] Create email service in `lib/services/email.ts` using Resend SDK with function `sendBrandKitEmail(session, pdfUrl, magicLink)` that sends email with PDF attachment and magic link
- [ ] T046 [US1] Create email sending API route in `app/api/send-email/route.ts` (POST) that: validates session_id, generates magic link, calls email service, handles retry logic for failures, returns email_id and magic_link
- [ ] T047 [US1] Create session page in `app/session/[sessionId]/page.tsx` that: retrieves session data via server component, displays current stage (scraping/concept/motif/products/complete), orchestrates automatic progression through all 5 stages, shows countdown timers at stages 2 and 3, displays final success message with download link

### Integration & Workflow [US1]

- [ ] T048 [US1] Implement automatic workflow progression in `app/session/[sessionId]/page.tsx`: scraping → concept (auto-call after scrape completes) → motif (auto-call after 3min or user proceeds) → products (auto-call after 3min or user proceeds) → PDF → email
- [ ] T049 [US1] Add error handling for each workflow stage with retry buttons and manual fallback options in session page
- [ ] T050 [US1] Add progress indicator to session page showing "Step X of 5" with visual progress bar using shadcn/ui Progress

**Checkpoint**: User Story 1 COMPLETE - Full end-to-end brand kit generation working, independently testable by submitting URL and receiving PDF

---

## Phase 4: User Story 2 - Review and Regenerate Creative Concepts (Priority: P2)

**Goal**: Allow users to regenerate creative concepts while preserving scraped data and manual edits

**Independent Test**: Complete a session to Stage 2, click "Regenerate Concept" button, verify new concept is generated within 20 seconds using same scraped data, and any color/logo edits are preserved

### Implementation for User Story 2

- [ ] T051 [P] [US2] Add `regenerate` boolean parameter support to `generateConcept()` function in `lib/services/gemini-text.ts` to force creative variation
- [ ] T052 [US2] Update concept generation API route in `app/api/generate-concept/route.ts` to handle `regenerate: true` parameter and maintain edit history
- [ ] T053 [P] [US2] Add "Regenerate Concept" button to concept display component in `components/session/concept-display.tsx` with loading state during regeneration
- [ ] T054 [P] [US2] Create color picker component in `components/session/color-picker.tsx` using shadcn/ui Dropdown Menu for editing hex codes
- [ ] T055 [US2] Add color editing capability to session page in `app/session/[sessionId]/page.tsx` that updates scraped_data.colors in database via PATCH request
- [ ] T056 [US2] Add logo replacement upload in session page with file validation and Vercel Blob upload
- [ ] T057 [US2] Implement timer persistence across concept regeneration in session page (reset countdown on regenerate)
- [ ] T058 [US2] Add auto-proceed logic in session page that preserves user edits (colors, logo) when 3-minute timer expires

**Checkpoint**: User Story 2 COMPLETE - Concept regeneration working with edits preserved, independently testable

---

## Phase 5: User Story 3 - Manual Brand Element Correction (Priority: P2)

**Goal**: Handle scraping failures gracefully by requiring manual logo and color input when automatic extraction fails

**Independent Test**: Submit a website URL with no detectable logo (e.g., a minimal site), verify system blocks progression and displays upload prompt, upload logo manually, verify system proceeds to concept generation

### Implementation for User Story 3

- [ ] T059 [US3] Add missing data detection logic to scraping orchestration in `app/api/scrape/route.ts` that sets `requires_manual_input: true` flag when logo missing or fewer than 2 colors
- [ ] T060 [US3] Update session status endpoint in `app/api/scrape/status/[sessionId]/route.ts` to include `missing_fields` array
- [ ] T061 [P] [US3] Create logo upload component in `components/session/logo-upload.tsx` with file input, preview, and quality validation (500x500px minimum) using shadcn/ui Dialog
- [ ] T062 [P] [US3] Create color selection component in `components/session/color-picker.tsx` requiring minimum 2 colors with hex code input
- [ ] T063 [US3] Create session update API route in `app/api/sessions/[sessionId]/route.ts` (PATCH) that updates scraped_data with manual inputs and validates completeness
- [ ] T064 [US3] Add manual input flow to session page in `app/session/[sessionId]/page.tsx` that: detects missing data, displays error message, blocks progression, shows upload/selection UI, validates inputs, proceeds when complete
- [ ] T065 [US3] Add fallback manual input form in session page for complete scraping failure showing all fields (logo, colors, optional text guidance)

**Checkpoint**: User Story 3 COMPLETE - Manual input fallback working, independently testable with minimal websites

---

## Phase 6: User Story 4 - Regenerate Design Motifs (Priority: P3)

**Goal**: Allow users to regenerate design motifs while maintaining color palette and concept

**Independent Test**: Complete a session to Stage 3, click "Regenerate Motif" button, verify new set of 6 design elements is generated within 60 seconds with same colors but different creative interpretation

### Implementation for User Story 4

- [ ] T066 [P] [US4] Add `regenerate` boolean parameter support to `generateMotif()` function in `lib/services/gemini-image.ts` to force new element set with same constraints
- [ ] T067 [US4] Update motif generation API route in `app/api/generate-motif/route.ts` to handle `regenerate: true` parameter and maintain family consistency across elements
- [ ] T068 [P] [US4] Add "Regenerate Motif" button to motif display component in `components/session/motif-display.tsx` with loading state and progress indicator
- [ ] T069 [US4] Update product generation logic in `app/api/generate-products/route.ts` to use most recent motif_image_url from database (supporting regenerated motifs)
- [ ] T070 [US4] Add timer reset logic to session page in `app/session/[sessionId]/page.tsx` when motif is regenerated (restart 3-minute countdown)

**Checkpoint**: User Story 4 COMPLETE - Motif regeneration working, independently testable

---

## Phase 7: User Story 5 - Resume Session via Magic Link (Priority: P3)

**Goal**: Enable users to return to their session via email magic link without re-authentication

**Independent Test**: Complete a session, receive email, click magic link, verify session page loads with all generated content, make edits (color changes), regenerate concept, request new PDF download, verify all works without authentication

### Implementation for User Story 5

- [ ] T071 [P] [US5] Create session retrieval Server Action in `app/actions/get-session.ts` that validates magic link token and returns full session data
- [ ] T072 [US5] Update session page in `app/session/[sessionId]/page.tsx` to support magic link URL parameter validation and session loading without authentication
- [ ] T073 [P] [US5] Add "Download PDF" button to session page completion stage that triggers `/api/create-presentation` and downloads latest PDF
- [ ] T074 [P] [US5] Add edit mode toggle to session page allowing color changes and concept/motif regeneration after initial completion
- [ ] T075 [US5] Create duplicate session detection in scraping API route `app/api/scrape/route.ts` that checks for existing sessions with same URL+email and prompts user with resume or start new options
- [ ] T076 [P] [US5] Create abandoned session recovery cron job in `app/api/cron/recovery-email/route.ts` that: identifies sessions abandoned >24 hours in concept/motif stages, sends recovery email with magic link, uses Vercel Cron configuration
- [ ] T077 [US5] Add recovery email template to email service in `lib/services/email.ts` with subject "Your brand kit is 60% complete - finish designing →"

**Checkpoint**: User Story 5 COMPLETE - Magic link session resumption working, independently testable

---

## Phase 8: User Story 6 - Admin Product Configuration (Priority: P3)

**Goal**: Enable admin to configure new product templates without code changes

**Independent Test**: Login to admin panel with credentials, navigate to product management, upload tote bag mockup image, define print zones (front/back), set constraints (8-color max), save template, run brand kit generation, verify tote bag appears in mockups

### Implementation for User Story 6

- [ ] T078 [P] [US6] Create admin authentication utilities in `lib/utils/admin-auth.ts` with functions: `validateCredentials(email, password)`, `setAuthCookie()`, `validateAuthCookie()` using bcryptjs for password hashing
- [ ] T079 [US6] Create admin login API route in `app/api/admin/login/route.ts` (POST) that validates credentials against `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` environment variables and sets HTTP-only session cookie
- [ ] T080 [P] [US6] Create admin middleware in `middleware.ts` that protects `/admin/*` routes by validating auth cookie and redirecting to login if missing
- [ ] T081 [P] [US6] Create admin login page in `app/admin/login/page.tsx` with email/password form using shadcn/ui Input and Button
- [ ] T082 [P] [US6] Create session table component in `components/admin/session-table.tsx` displaying all sessions with columns: email, URL, status, created date using shadcn/ui Table with pagination
- [ ] T083 [P] [US6] Create session detail component in `components/admin/session-detail.tsx` showing complete session data: scraped_data, concept, motif, product images, timestamps
- [ ] T084 [US6] Create admin dashboard page in `app/admin/page.tsx` that fetches and displays session table with filters for status
- [ ] T085 [US6] Create sessions list API route in `app/api/admin/sessions/route.ts` (GET) with pagination (limit/offset) and status filtering
- [ ] T086 [P] [US6] Create product form component in `components/admin/product-form.tsx` with fields: name, base image upload, print zones (multi-select checkboxes), constraints textarea, max colors number input, recommended elements (multi-select) using shadcn/ui Form
- [ ] T087 [US6] Create product management page in `app/admin/products/page.tsx` showing list of all products with archive/edit actions and "Add Product" button
- [ ] T088 [US6] Create products API routes in `app/api/admin/products/route.ts` (GET/POST) for listing and creating products with image upload to Vercel Blob
- [ ] T089 [US6] Create product update/archive API route in `app/api/admin/products/[productId]/route.ts` (PATCH/DELETE) with validation preventing deletion of products in use
- [ ] T090 [US6] Add active sessions check to product archive endpoint that counts sessions using product and prevents deletion with error response

**Checkpoint**: User Story 6 COMPLETE - Admin product management working, independently testable

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T091 [P] Add comprehensive error logging to all API routes using structured logging library (Winston or Pino) in `lib/utils/logger.ts`
- [ ] T092 [P] Implement rate limiting middleware in `middleware.ts` for `/api/scrape` endpoint to prevent abuse (10 requests per IP per hour)
- [ ] T093 [P] Add request ID generation to all API routes for tracing errors across workflow stages
- [ ] T094 [P] Create email delivery retry logic in `lib/services/email.ts` with exponential backoff (5 minute delay, then 15 minute delay)
- [ ] T095 [P] Add image quality validation to logo upload that detects low-resolution (<500x500px) or corrupted files
- [ ] T096 [P] Implement color extraction logic that selects 5 most dominant colors from logo+website when >5 colors found
- [ ] T097 [P] Add PDF generation timeout handling in `app/api/create-presentation/route.ts` (60 second max) with fallback to magic-link-only delivery
- [ ] T098 [P] Create automated tests for critical API routes in `tests/api/` using Vitest: scrape endpoint, concept generation, email sending
- [ ] T099 [P] Add Playwright E2E test in `tests/e2e/full-workflow.spec.ts` for complete user journey from landing page to PDF receipt
- [ ] T100 [P] Optimize database queries in `lib/db/queries.ts` with proper indexing on sessions(email, status) and products(is_archived)
- [ ] T101 [P] Add loading states to all interactive components using shadcn/ui Skeleton for better UX
- [ ] T102 [P] Implement responsive design for all pages using Tailwind breakpoints (mobile-first)
- [ ] T103 [P] Add accessibility improvements: ARIA labels, keyboard navigation, focus management using Radix UI primitives
- [ ] T104 [P] Create `README.md` in repository root with project overview, tech stack, and quickstart link
- [ ] T105 Configure Vercel deployment in `vercel.json` with function timeouts: `/api/generate-products` (300s), `/api/scrape` (90s)
- [ ] T106 Add environment variable validation at app startup in `app/layout.tsx` to fail fast if required keys missing
- [ ] T107 Run complete workflow validation per `quickstart.md` instructions to verify end-to-end functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T009) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion (T010-T024) - Core MVP
- **User Story 2 (Phase 4)**: Depends on Foundational completion - Can run in parallel with US1 if staffed
- **User Story 3 (Phase 5)**: Depends on Foundational completion - Can run in parallel with US1/US2
- **User Story 4 (Phase 6)**: Depends on US1 Stage 3 completion (T038) - Requires motif generation
- **User Story 5 (Phase 7)**: Depends on US1 completion (T048) - Requires full workflow
- **User Story 6 (Phase 8)**: Depends on Foundational completion - Can run in parallel with US1-US3
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (T010-T024) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Integrates with US1 Stage 2 but independently testable
- **User Story 3 (P2)**: Can start after Foundational - Extends US1 error handling but independently testable
- **User Story 4 (P3)**: Depends on US1 Stage 3 (motif generation) - Extends regeneration capability
- **User Story 5 (P3)**: Depends on US1 completion - Requires full workflow and magic links
- **User Story 6 (P3)**: Can start after Foundational - Independent admin functionality

### Critical Path for MVP (User Story 1 Only)

1. Setup (T001-T009) → ~2 hours
2. Foundational (T010-T024) → ~8 hours
3. US1 Stage 1: Scraping (T025-T032) → ~6 hours
4. US1 Stage 2: Concept (T033-T036) → ~4 hours
5. US1 Stage 3: Motif (T037-T039) → ~4 hours
6. US1 Stage 4: Products (T040-T042) → ~6 hours
7. US1 Stage 5: PDF & Email (T043-T047) → ~6 hours
8. US1 Integration (T048-T050) → ~4 hours

**Total MVP Estimate**: ~40 hours for single developer

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks T001-T009 can run in parallel (different config files)

**Phase 2 (Foundational)**: Can parallelize:
- Database tasks (T010, T013-T015)
- TypeScript types (T011-T012, T016-T020)
- Utility functions (T017-T019, T021-T024)

**Phase 3 (User Story 1)**: Within each stage, can parallelize:
- Stage 1: T025+T026 (API clients), T029+T030 (UI components)
- Stage 2: T035+T036 (UI components can be built while service is in progress)
- Stage 4: T042 (gallery component) can be built while T040-T041 in progress

**Phase 4-8 (User Stories 2-6)**: All can run in parallel by different developers after Foundational completion, except:
- US4 requires US1 Stage 3 completion
- US5 requires US1 full completion

---

## Parallel Example: Foundational Phase

```bash
# Launch database setup tasks together:
Task: "T010 - Create database schema in lib/db/migrations.sql"
Task: "T011 [P] - Create TypeScript types in lib/types/session.ts"
Task: "T012 [P] - Create TypeScript types in lib/types/product.ts"

# Then launch utility tasks together:
Task: "T016 [P] - Create validation schemas in lib/utils/validation.ts"
Task: "T017 [P] - Create magic link utilities in lib/utils/magic-link.ts"
Task: "T018 [P] - Create image processing utilities in lib/utils/image-processing.ts"
```

---

## Parallel Example: User Story 1 Stage 1

```bash
# Launch API client creation together:
Task: "T025 [P] [US1] - Create Brandfetch API client in lib/services/brandfetch.ts"
Task: "T026 [P] [US1] - Create Firecrawl scraping service in lib/services/firecrawl.ts"

# Launch UI components together (while API clients are being built):
Task: "T029 [P] [US1] - Create landing page hero component in components/landing/hero.tsx"
Task: "T030 [P] [US1] - Create input form component in components/landing/input-form.tsx"
Task: "T032 [P] [US1] - Create brand analysis display component in components/session/brand-analysis.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED

**Goal**: Ship working product in ~1 week

1. Complete Phase 1: Setup (T001-T009) → Day 1
2. Complete Phase 2: Foundational (T010-T024) → Day 1-2
3. Complete US1 Stages 1-2: Scraping + Concept (T025-T036) → Day 2-3
4. Complete US1 Stages 3-4: Motif + Products (T037-T042) → Day 3-4
5. Complete US1 Stage 5: PDF + Email (T043-T047) → Day 5
6. Complete US1 Integration (T048-T050) → Day 5
7. **STOP and VALIDATE**: Test full workflow end-to-end → Day 6
8. Deploy to Vercel and demo → Day 6-7

**Deliverable**: Working lead generation system that captures emails and delivers branded merchandise PDFs

### Incremental Delivery (All User Stories)

**Goal**: Ship value incrementally over ~3 weeks

**Week 1: MVP (US1)**
- Days 1-2: Setup + Foundational → Foundation ready
- Days 3-6: User Story 1 → Test independently → Deploy/Demo (MVP!)
- Day 7: Buffer for fixes

**Week 2: Enhancements (US2, US3, US6)**
- Days 1-2: User Story 2 (Regeneration) → Test independently → Deploy
- Days 2-3: User Story 3 (Manual input) → Test independently → Deploy
- Days 4-5: User Story 6 (Admin panel) → Test independently → Deploy
- Days 6-7: Buffer for integration testing

**Week 3: Advanced Features (US4, US5, Polish)**
- Days 1-2: User Story 4 (Motif regeneration) → Deploy
- Days 3-4: User Story 5 (Magic links) → Deploy
- Days 5-7: Phase 9 (Polish, testing, optimization)

### Parallel Team Strategy

With 3 developers after Foundational completion:

**Developer A**: User Story 1 (Core workflow)
**Developer B**: User Story 6 (Admin panel) → US2 (Regeneration)
**Developer C**: User Story 3 (Error handling) → US4 (Motif regen)

After US1 completes:
**All Developers**: User Story 5 (Magic links) → Polish

---

## Testing Strategy

### Unit Tests (Optional - not in tasks)

If testing is required, add tests for:
- `lib/services/gemini-text.ts` - Concept generation
- `lib/services/gemini-image.ts` - Motif and product generation
- `lib/utils/magic-link.ts` - Token generation and validation
- `lib/utils/validation.ts` - Zod schema validation

### Integration Tests (Included in T098)

Critical API routes to test:
- POST `/api/scrape` - Full scraping orchestration
- POST `/api/generate-concept` - Concept generation with retries
- POST `/api/send-email` - Email delivery with Resend

### E2E Tests (Included in T099)

Complete user journey:
1. Land on homepage
2. Submit URL and email
3. Wait for scraping
4. View brand analysis
5. Proceed through concept
6. Proceed through motif
7. Wait for product generation
8. Receive completion message
9. Verify email sent

---

## Notes

- [P] tasks can run in parallel (different files, no dependencies)
- [Story] label maps task to specific user story (US1-US6) for traceability
- Each user story is independently completable and testable
- MVP scope is User Story 1 only (T001-T050) = ~40 hours single developer
- Stop at any checkpoint to validate story independently before proceeding
- All file paths are absolute from repository root
- External API keys must be configured before testing (see quickstart.md)
- Neon Postgres database must be created and migrated before running app
- Vercel Blob Storage must be configured for image uploads
- Tests (Phase 9: T098-T099) are included but optional based on project requirements

---

## Success Validation

After completing MVP (User Story 1), verify:

✅ User can submit website URL and email on landing page
✅ System successfully scrapes brand data (logo, colors, text) from 80%+ of websites
✅ Creative concept generates within 20 seconds
✅ Design motif displays 6 cohesive elements within 60 seconds
✅ All 5 product mockups generate within 5 minutes
✅ PDF presentation is created with all 7 sections
✅ Email is delivered with PDF attachment and magic link
✅ Total workflow completes in under 8 minutes
✅ Magic link allows session access without authentication

After completing all user stories, additionally verify:

✅ "Regenerate Concept" produces creative variations
✅ "Regenerate Motif" produces new element sets
✅ Manual logo upload and color selection works when scraping fails
✅ Admin can add new product templates
✅ Abandoned sessions receive recovery emails after 24 hours
✅ System handles 50 concurrent sessions without degradation

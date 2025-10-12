<!--
SYNC IMPACT REPORT
==================
Version Change: [INITIAL] → 1.0.0
Created: 2025-10-08
Constitution Type: Initial ratification

Core Principles Established (7):
1. AI-First Architecture
2. Performance & Reliability
3. Observability by Design
4. Brand Consistency
5. Scalable Architecture
6. Test-First Development
7. Vercel-Native Optimization

Additional Sections:
- Technology Stack
- Development Workflow
- Governance

Templates Status:
✅ plan-template.md - Compatible (Constitution Check section aligns)
✅ spec-template.md - Compatible (Requirements and testing sections align)
✅ tasks-template.md - Compatible (Test-first and parallel execution align)

Follow-up TODOs: None
-->

# BRENDAI Constitution

## Core Principles

### I. AI-First Architecture

Every feature and workflow MUST be designed around Google Gemini AI capabilities. The AI is not an add-on but the core intelligence of the system. All data pipelines, processing steps, and user interactions MUST be optimized for AI consumption and generation.

**Rationale**: BRENDAI's value proposition is AI-driven brand analysis and merchandise design. Without AI-first thinking, we risk building features that don't leverage our core strength.

### II. Performance & Reliability

The system MUST use proven, production-tested technologies and patterns. Every feature MUST be comprehensively tested before deployment. Performance benchmarks MUST be established and monitored.

**Requirements**:
- Load time < 3s for initial page load
- AI response time < 10s for style guide generation
- 99.9% uptime for production environment
- Zero data loss guarantee for user sessions and generated content

**Rationale**: Users expect professional, reliable tools. Slow or unreliable AI processing undermines trust in the generated designs.

### III. Observability by Design

Every process step MUST be visible, traceable, and adjustable through the admin dashboard. No black-box operations allowed. All AI prompts, responses, and intermediate states MUST be logged and accessible.

**Requirements**:
- Admin dashboard showing real-time pipeline progress
- Step-by-step visualization of: scraping → analysis → style guide → motif → design
- Prompt history and editing capability
- Error tracking with full context for debugging

**Rationale**: AI systems are complex and require continuous refinement. Without observability, we cannot improve prompts or debug issues effectively.

### IV. Brand Consistency

The style guide MUST be the single source of truth for all merchandise designs. Every generated design MUST reference and comply with the style guide. No ad-hoc styling or off-brand outputs allowed.

**Requirements**:
- Immutable style guide once approved for a session
- All designs must trace back to specific style guide elements
- Consistency validation before design finalization
- Version tracking for style guide iterations

**Rationale**: The core promise is consistent, on-brand merchandise. Breaking consistency breaks the product's fundamental value.

### V. Scalable Architecture

The system MUST support guest sessions with tracking NOW and user management architecture LATER without major refactoring. Design all data models and APIs with multi-tenancy in mind.

**Requirements**:
- Session-based architecture with unique identifiers
- Data models ready for user association (nullable user_id fields)
- Authentication hooks in place (currently bypassed for guests)
- Clear migration path from sessions to user accounts

**Rationale**: Building for guests only would require painful rewrites. Planning for users from day one ensures smooth growth.

### VI. Test-First Development

Tests MUST be written and approved BEFORE implementation begins. All features MUST follow the Red-Green-Refactor cycle. No code merge without passing tests and coverage requirements.

**Requirements**:
- Contract tests for all AI integrations and APIs
- Integration tests for multi-step workflows (scrape → analyze → generate)
- Unit tests for business logic
- Minimum 80% code coverage

**Rationale**: AI-driven features are complex and error-prone. Testing ensures reliability and prevents regression as prompts and models evolve.

### VII. Vercel-Native Optimization

The application MUST leverage Vercel platform capabilities: Edge Functions for performance, Serverless Functions for API routes, and optimal deployment patterns for Next.js.

**Requirements**:
- Edge Functions for static content and fast responses
- Serverless Functions for AI processing and heavy operations
- ISR (Incremental Static Regeneration) where applicable
- Optimal bundle splitting and code organization

**Rationale**: Vercel is our deployment platform. Not using its strengths means paying for capabilities we don't use and missing performance optimizations.

## Technology Stack

**Frontend**: Next.js 14+ (App Router), React 18+, TypeScript, Tailwind CSS
**Backend**: Next.js API Routes (Serverless), Vercel Edge Functions
**AI**: Google Gemini AI (primary), with fallback strategies for rate limits
**Data Storage**: Vercel KV (sessions), Vercel Postgres (user data, style guides)
**Hosting**: Vercel (production & preview deployments)
**Monitoring**: Vercel Analytics, custom observability dashboard
**Testing**: Vitest (unit), Playwright (E2E), custom AI response validation

**Constraints**:
- No non-Vercel hosting for core application
- No AI providers other than Google Gemini without architecture review
- TypeScript MUST be used throughout (no JavaScript)
- All external services MUST have error handling and fallbacks

## Development Workflow

**Branch Strategy**: Feature branches from `main`, PR-based merging
**Review Process**: All PRs require passing CI/CD and constitution compliance check
**Testing Gates**:
1. Tests written and reviewed
2. Tests fail (Red phase)
3. Implementation makes tests pass (Green phase)
4. Code refactored for quality (Refactor phase)
5. Admin dashboard verified (if applicable)

**Deployment**: Automatic preview deployments on PR, manual production deployment after approval
**Prompt Management**: All AI prompts versioned in codebase, changes tracked via PR
**Performance Budgets**: Lighthouse score > 90, bundle size < 500KB (initial), API response < 3s

## Governance

This constitution supersedes all other development practices and guidelines. Any violation MUST be explicitly justified in the implementation plan under "Complexity Tracking" with rationale and alternatives considered.

**Amendment Process**:
1. Proposed change documented with rationale
2. Impact analysis on existing features
3. Team approval required for any principle modification
4. Migration plan for affected code
5. Version bump following semantic versioning rules

**Compliance Review**: Every PR MUST include a constitution check in the plan phase. Reviewers MUST verify compliance or approve documented exceptions.

**Version**: 1.0.0 | **Ratified**: 2025-10-08 | **Last Amended**: 2025-10-08

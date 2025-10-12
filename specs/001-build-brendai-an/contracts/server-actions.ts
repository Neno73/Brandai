/**
 * BrendAI Server Actions Type Contracts
 *
 * This file defines TypeScript interfaces for Next.js Server Actions.
 * Server Actions provide type-safe RPC-style mutations without explicit API routes.
 *
 * Convention: All actions return { success: boolean, data?: T, error?: string }
 */

// ============================================================================
// Common Types
// ============================================================================

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export type SessionStatus = 'scraping' | 'concept' | 'motif' | 'products' | 'complete' | 'failed'

// ============================================================================
// Scraping Actions
// ============================================================================

export interface ScrapeBrandInput {
  url: string
  email: string
}

export interface ScrapeBrandResult {
  session_id: string
  status: 'scraping'
}

/**
 * Server Action: Initiate brand data scraping
 * File: app/actions/scrape.ts
 * Usage: Called from landing page form submission
 */
export declare function scrapeBrand(
  input: ScrapeBrandInput
): Promise<ActionResult<ScrapeBrandResult>>

// ============================================================================
// Manual Input Actions (Fallback when scraping fails)
// ============================================================================

export interface UploadLogoInput {
  session_id: string
  logo_file: File | string // File object or base64 string
}

export interface UploadLogoResult {
  stored_url: string
  width: number
  height: number
}

/**
 * Server Action: Upload logo manually
 * File: app/actions/upload-logo.ts
 * Usage: Called from manual input form when scraping fails to find logo
 */
export declare function uploadLogo(
  input: UploadLogoInput
): Promise<ActionResult<UploadLogoResult>>

export interface UpdateColorsInput {
  session_id: string
  colors: string[] // Array of hex codes
}

/**
 * Server Action: Update brand colors manually
 * File: app/actions/update-colors.ts
 * Usage: Called from color picker when user edits scraped colors
 */
export declare function updateColors(
  input: UpdateColorsInput
): Promise<ActionResult<void>>

// ============================================================================
// Concept Generation Actions
// ============================================================================

export interface GenerateConceptInput {
  session_id: string
  regenerate?: boolean
}

export interface GenerateConceptResult {
  concept: string
  prominent_theme: string
}

/**
 * Server Action: Generate creative concept
 * File: app/actions/generate-concept.ts
 * Usage: Called from Stage 2 (concept review) page
 */
export declare function generateConcept(
  input: GenerateConceptInput
): Promise<ActionResult<GenerateConceptResult>>

// ============================================================================
// Motif Generation Actions
// ============================================================================

export interface GenerateMotifInput {
  session_id: string
  regenerate?: boolean
}

export interface GenerateMotifResult {
  motif_image_url: string
  storytelling: string
}

/**
 * Server Action: Generate design motif
 * File: app/actions/generate-motif.ts
 * Usage: Called from Stage 3 (motif review) page
 */
export declare function generateMotif(
  input: GenerateMotifInput
): Promise<ActionResult<GenerateMotifResult>>

// ============================================================================
// Product Generation Actions
// ============================================================================

export interface GenerateProductsInput {
  session_id: string
}

export interface ProductGenerationProgress {
  product_name: string
  progress: number // 1-5
  image_url?: string
  success: boolean
}

export interface GenerateProductsResult {
  product_images: Array<{
    product_id: string
    product_name: string
    image_url: string
    success: boolean
  }>
}

/**
 * Server Action: Generate product mockups
 * File: app/actions/generate-products.ts
 * Usage: Called from Stage 4 (product generation) page
 * Note: Uses streaming updates via React Server Components streaming
 */
export declare function generateProducts(
  input: GenerateProductsInput
): Promise<ActionResult<GenerateProductsResult>>

// ============================================================================
// Presentation & Email Actions
// ============================================================================

export interface CreatePresentationInput {
  session_id: string
}

export interface CreatePresentationResult {
  pdf_url: string
  pdf_size_bytes: number
}

/**
 * Server Action: Generate PDF presentation
 * File: app/actions/create-presentation.ts
 * Usage: Called from Stage 5 (completion) page
 */
export declare function createPresentation(
  input: CreatePresentationInput
): Promise<ActionResult<CreatePresentationResult>>

export interface SendEmailInput {
  session_id: string
  email_type: 'completion' | 'recovery'
}

export interface SendEmailResult {
  email_id: string
  magic_link: string
}

/**
 * Server Action: Send email with PDF and magic link
 * File: app/actions/send-email.ts
 * Usage: Called automatically after PDF generation or manually for recovery email
 */
export declare function sendEmail(
  input: SendEmailInput
): Promise<ActionResult<SendEmailResult>>

// ============================================================================
// Session Management Actions
// ============================================================================

export interface GetSessionInput {
  session_id: string
}

export interface Session {
  id: string
  email: string
  url: string
  status: SessionStatus
  scraped_data: ScrapedData
  concept: string | null
  motif_image_url: string | null
  product_images: ProductImage[]
  created_at: string
  updated_at: string
}

export interface ScrapedData {
  logo: {
    original_url?: string
    stored_url: string
    format: 'png'
    width: number
    height: number
  }
  colors: string[]
  fonts?: string[]
  title: string
  description: string
  headings: string[]
  content: string
  tagline: string | null
  tone: string
  themes: string[]
  audience: string
  industry: string
  sentiment: string
}

export interface ProductImage {
  product_id: string
  product_name: string
  image_url: string
  generated_at: string
  generation_duration_ms: number
  success: boolean
}

/**
 * Server Action: Get session data
 * File: app/actions/get-session.ts
 * Usage: Called from session page (magic link) to load all data
 */
export declare function getSession(
  input: GetSessionInput
): Promise<ActionResult<Session>>

export interface CheckDuplicateSessionInput {
  url: string
  email: string
}

export interface CheckDuplicateSessionResult {
  exists: boolean
  session_id?: string
  created_at?: string
}

/**
 * Server Action: Check for existing session
 * File: app/actions/check-duplicate.ts
 * Usage: Called before creating new session to prompt user about resume vs new
 */
export declare function checkDuplicateSession(
  input: CheckDuplicateSessionInput
): Promise<ActionResult<CheckDuplicateSessionResult>>

// ============================================================================
// Admin Actions
// ============================================================================

export interface AdminLoginInput {
  email: string
  password: string
}

/**
 * Server Action: Admin authentication
 * File: app/actions/admin-login.ts
 * Usage: Called from admin login page
 */
export declare function adminLogin(
  input: AdminLoginInput
): Promise<ActionResult<void>>

export interface CreateProductInput {
  name: string
  base_image_url: string
  print_zones: Array<'front' | 'back' | 'sleeves' | 'wrap' | 'ankle' | 'pocket' | 'all-over'>
  constraints?: string
  max_colors?: number
  recommended_elements?: Array<'icon' | 'pattern' | 'graphic' | 'typography'>
}

export interface Product {
  id: string
  name: string
  base_image_url: string
  print_zones: string[]
  constraints: string | null
  max_colors: number
  recommended_elements: string[] | null
  is_archived: boolean
  created_at: string
}

/**
 * Server Action: Create product template
 * File: app/actions/create-product.ts
 * Usage: Called from admin product management page
 */
export declare function createProduct(
  input: CreateProductInput
): Promise<ActionResult<Product>>

export interface UpdateProductInput {
  product_id: string
  name?: string
  base_image_url?: string
  print_zones?: string[]
  constraints?: string
  max_colors?: number
  recommended_elements?: string[]
}

/**
 * Server Action: Update product template
 * File: app/actions/update-product.ts
 * Usage: Called from admin product edit form
 */
export declare function updateProduct(
  input: UpdateProductInput
): Promise<ActionResult<Product>>

export interface ArchiveProductInput {
  product_id: string
}

/**
 * Server Action: Archive product template
 * File: app/actions/archive-product.ts
 * Usage: Called from admin product management page
 */
export declare function archiveProduct(
  input: ArchiveProductInput
): Promise<ActionResult<void>>

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type guard for ActionResult success case
 */
export function isSuccess<T>(result: ActionResult<T>): result is { success: true; data: T } {
  return result.success === true
}

/**
 * Type guard for ActionResult error case
 */
export function isError<T>(result: ActionResult<T>): result is { success: false; error: string } {
  return result.success === false
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example: Landing page form submission
 *
 * ```tsx
 * 'use client'
 * import { scrapeBrand } from '@/app/actions/scrape'
 *
 * export function LandingForm() {
 *   async function handleSubmit(formData: FormData) {
 *     const result = await scrapeBrand({
 *       url: formData.get('url') as string,
 *       email: formData.get('email') as string
 *     })
 *
 *     if (isSuccess(result)) {
 *       router.push(`/session/${result.data.session_id}`)
 *     } else {
 *       setError(result.error)
 *     }
 *   }
 *
 *   return <form action={handleSubmit}>...</form>
 * }
 * ```
 *
 * Example: Regenerate concept button
 *
 * ```tsx
 * 'use client'
 * import { generateConcept } from '@/app/actions/generate-concept'
 *
 * export function RegenerateButton({ sessionId }: { sessionId: string }) {
 *   const [loading, setLoading] = useState(false)
 *
 *   async function handleRegenerate() {
 *     setLoading(true)
 *     const result = await generateConcept({
 *       session_id: sessionId,
 *       regenerate: true
 *     })
 *
 *     if (isSuccess(result)) {
 *       setConcept(result.data.concept)
 *     } else {
 *       alert(result.error)
 *     }
 *     setLoading(false)
 *   }
 *
 *   return <button onClick={handleRegenerate} disabled={loading}>
 *     {loading ? 'Regenerating...' : 'Regenerate Concept'}
 *   </button>
 * }
 * ```
 */

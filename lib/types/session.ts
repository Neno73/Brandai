export type SessionStatus =
  | 'scraping'
  | 'awaiting_approval'
  | 'concept'
  | 'motif'
  | 'products'
  | 'complete'
  | 'failed'

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
  // Core Brand Identity
  logo?: string | {
    original_url: string
    stored_url: string
    format: 'png'
    width: number
    height: number
  }
  colors: string[] // hex codes
  fonts?: string[]
  title: string
  description: string
  tagline?: string | null

  // Visual Style
  style?: string // Modern, Minimalist, Bold, etc.
  imagery_style?: string // Minimalist vector, Photorealistic, etc.
  iconography_style?: string // Line art, Solid fill, etc.
  logo_description?: string

  // Brand Voice & Messaging
  tone?: string // Friendly, Professional, Casual, etc.
  sentiment?: string // Positive, Optimistic, Serious, etc.
  themes?: string[] // Key themes/topics
  brand_keywords?: string[] // Brand essence keywords
  seo_keywords?: string[] // SEO keywords

  // Audience & Market
  target_audience?: string
  industry?: string
  cta_examples?: string[] // Call-to-action examples
  social_platforms?: string[] // Social media platforms

  // Company Story
  company_story?: string
  headings: string[]
  content: string

  // Workflow Flags
  requires_manual_input?: boolean
  missing_fields?: string[]

  // Legacy field (deprecated, kept for backward compatibility)
  audience?: string
}

export interface ProductImage {
  product_id: string
  product_name: string
  image_url: string
  print_zones: string[]
  design_notes: string
}

export interface SessionCreateInput {
  url: string
  email: string
}

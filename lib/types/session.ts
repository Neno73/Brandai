export type SessionStatus = 'scraping' | 'concept' | 'motif' | 'products' | 'complete' | 'failed'

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
  logo?: {
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
  headings: string[]
  content: string
  tagline?: string | null
  tone?: string
  themes?: string[]
  audience?: string
  industry?: string
  sentiment?: string
}

export interface ProductImage {
  product_id: string
  product_name: string
  image_url: string
  generated_at: string
  generation_duration_ms: number
  success: boolean
}

export interface SessionCreateInput {
  url: string
  email: string
}

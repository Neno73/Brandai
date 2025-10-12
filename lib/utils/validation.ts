import { z } from 'zod'

// Session creation validation
export const SessionCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  url: z.string().url('Invalid URL').max(2048, 'URL too long'),
})

// Scraped data validation
export const ScrapedDataSchema = z.object({
  logo: z
    .object({
      original_url: z.string().url(),
      stored_url: z.string().url(),
      format: z.literal('png'),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
  colors: z.array(z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color')).min(2).max(5),
  fonts: z.array(z.string()).optional(),
  title: z.string().min(1),
  description: z.string(),
  headings: z.array(z.string()),
  content: z.string().max(2000),
  tagline: z.string().nullable().optional(),
  tone: z.string().optional(),
  themes: z.array(z.string()).optional(),
  audience: z.string().optional(),
  industry: z.string().optional(),
  sentiment: z.string().optional(),
})

// Product validation
export const ProductSchema = z.object({
  name: z.string().min(1).max(50),
  base_image_url: z.string().url(),
  print_zones: z
    .array(z.enum(['front', 'back', 'sleeves', 'wrap', 'ankle', 'pocket', 'all-over']))
    .min(1),
  constraints: z.string().optional(),
  max_colors: z.number().int().min(1).max(999).default(8),
  recommended_elements: z
    .array(z.enum(['icon', 'pattern', 'graphic', 'typography']))
    .optional(),
})

// Color hex code validation
export function validateHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color)
}

// URL validation
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

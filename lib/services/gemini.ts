import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ScrapedData } from '@/lib/types/session'
import type { Product } from '@/lib/types/product'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required')
}

const genAI = new GoogleGenerativeAI(apiKey)

/**
 * Generate a brand merchandise concept based on scraped website data
 */
export async function generateConcept(scrapedData: ScrapedData): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are a creative brand merchandise designer. Based on the following brand information, create a compelling merchandise concept that captures the brand's essence.

Brand Information:
- Brand Name: ${scrapedData.title || 'Unknown'}
- Description: ${scrapedData.description || 'N/A'}
- Primary Colors: ${scrapedData.colors?.join(', ') || 'N/A'}
- Typography Style: ${scrapedData.fonts?.join(', ') || 'N/A'}
- Key Content Themes: ${scrapedData.headings?.slice(0, 5).join(', ') || 'N/A'}

Create a short, focused merchandise concept (2-3 sentences) that:
1. Reflects the brand's visual identity and messaging
2. Works well across multiple product types (t-shirts, hoodies, mugs, etc.)
3. Is simple enough to be printed/embroidered
4. Has broad appeal to the target audience

Be specific about visual elements, color usage, and composition style.`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  if (!text || text.trim().length === 0) {
    throw new Error('Failed to generate concept - empty response')
  }

  return text.trim()
}

/**
 * Generate a detailed motif prompt for image generation
 */
export async function generateMotifPrompt(
  concept: string,
  scrapedData: ScrapedData,
  product: Product
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are a graphic designer creating a print-ready motif for merchandise. Based on the concept below, generate a detailed image generation prompt.

Merchandise Concept:
${concept}

Brand Colors: ${scrapedData.colors?.join(', ') || 'vibrant, balanced palette'}
Product Type: ${product.name}
Print Zones: ${product.print_zones.join(', ')}
Max Colors: ${product.max_colors}
Constraints: ${product.constraints || 'None'}

Create a detailed image generation prompt (1-2 sentences) that:
1. Describes the visual motif clearly and specifically
2. Specifies composition, style, and visual elements
3. Respects the color and print zone constraints
4. Avoids text/typography (unless explicitly part of the concept)
5. Is suitable for ${product.name} merchandise

Return ONLY the image generation prompt, nothing else.`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  if (!text || text.trim().length === 0) {
    throw new Error('Failed to generate motif prompt - empty response')
  }

  return text.trim()
}

/**
 * Generate a motif image using Gemini's image generation
 */
export async function generateMotifImage(
  motifPrompt: string,
  aspectRatio: '1:1' | '16:9' | '9:16' = '1:1'
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  // Enhanced prompt for better image generation
  const enhancedPrompt = `${motifPrompt}

Style requirements:
- High resolution, print-ready quality
- Clean, professional design
- Transparent background preferred
- Bold, clear visual elements
- Suitable for merchandise printing
- Aspect ratio: ${aspectRatio}`

  const result = await model.generateContent(enhancedPrompt)
  const response = result.response

  // Note: As of January 2025, Gemini API doesn't directly support image generation
  // This is a placeholder for when the feature becomes available
  // For MVP, we'll return a placeholder or use the text description

  const imageDescription = response.text()

  // TODO: Once Gemini supports image generation, update this to return actual image data
  // For now, return the description that can be used with other image generation services
  return imageDescription
}

/**
 * Generate product-specific variations of the motif
 */
export async function generateProductVariation(
  baseConcept: string,
  product: Product,
  scrapedData: ScrapedData
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Adapt this merchandise concept for a specific product:

Base Concept: ${baseConcept}

Product Details:
- Name: ${product.name}
- Print Zones: ${product.print_zones.join(', ')}
- Max Colors: ${product.max_colors}
- Constraints: ${product.constraints || 'None'}
- Recommended Elements: ${product.recommended_elements?.join(', ') || 'Any'}

Brand Colors: ${scrapedData.colors?.join(', ') || 'N/A'}

Provide specific guidance (2-3 sentences) on how to adapt the concept for this product, considering:
1. Print zone placement and sizing
2. Color usage within limits
3. Design elements that work best for this product type
4. Any product-specific constraints

Be concise and actionable.`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  if (!text || text.trim().length === 0) {
    throw new Error('Failed to generate product variation - empty response')
  }

  return text.trim()
}

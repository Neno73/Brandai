import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ScrapedData } from '@/lib/types/session'
import type { Product } from '@/lib/types/product'
import { getPrompt } from '@/lib/db/queries/prompts'

let genAI: GoogleGenerativeAI | null = null

/**
 * Lazy initialization of the Gemini API client
 * Only checks for API key when actually needed at runtime
 */
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required')
    }
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

/**
 * Replace template variables with actual values
 * @param template - Template string with {{variable}} placeholders
 * @param variables - Object with variable values
 * @returns Template with variables replaced
 */
function applyTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }
  return result
}

/**
 * Generate a brand merchandise concept based on scraped website data
 * @param scrapedData - Brand data extracted from website
 * @param regenerate - If true, forces creative variation for concept regeneration
 */
export async function generateConcept(
  scrapedData: ScrapedData,
  regenerate: boolean = false
): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-flash-latest' })

  // Fetch prompt template from database
  const promptData = await getPrompt('concept_generation')

  const regenerateInstruction = regenerate
    ? '\n\nIMPORTANT: Generate a DIFFERENT creative concept than you would normally create. Explore alternative angles, themes, or visual directions while still capturing the brand essence. Avoid obvious or common interpretations.'
    : ''

  // Prepare template variables
  const variables = {
    brandName: scrapedData.title || 'Unknown',
    description: scrapedData.description || 'N/A',
    colors: scrapedData.colors?.join(', ') || 'N/A',
    fonts: scrapedData.fonts?.join(', ') || 'N/A',
    headings: scrapedData.headings?.slice(0, 5).join(', ') || 'N/A',
    regenerateInstruction,
  }

  // Apply template or use fallback
  const prompt = promptData
    ? applyTemplateVariables(promptData.template, variables)
    : `You are a creative brand merchandise designer. Based on the following brand information, create a compelling merchandise concept that captures the brand's essence.

Brand Information:
- Brand Name: ${variables.brandName}
- Description: ${variables.description}
- Primary Colors: ${variables.colors}
- Typography Style: ${variables.fonts}
- Key Content Themes: ${variables.headings}

Create a short, focused merchandise concept (2-3 sentences) that:
1. Reflects the brand's visual identity and messaging
2. Works well across multiple product types (t-shirts, hoodies, mugs, etc.)
3. Is simple enough to be printed/embroidered
4. Has broad appeal to the target audience

Be specific about visual elements, color usage, and composition style.${variables.regenerateInstruction}`

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
 * @param regenerate - If true, forces creative variation for motif regeneration
 */
export async function generateMotifPrompt(
  concept: string,
  scrapedData: ScrapedData,
  product: Product,
  regenerate: boolean = false
): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-flash-latest' })

  // Fetch prompt template from database
  const promptData = await getPrompt('motif_prompt_generation')

  const regenerateInstruction = regenerate
    ? '\n\nIMPORTANT: Generate a DIFFERENT visual interpretation than you would normally create. Explore alternative design elements, compositions, or artistic styles while maintaining the core concept and brand colors. Create a fresh, unique motif that feels distinctly different from a typical interpretation.'
    : ''

  // Prepare template variables
  const variables = {
    concept,
    colors: scrapedData.colors?.join(', ') || 'vibrant, balanced palette',
    productName: product.name,
    printZones: product.print_zones.join(', '),
    maxColors: product.max_colors.toString(),
    constraints: product.constraints || 'None',
    regenerateInstruction,
  }

  // Apply template or use fallback
  const prompt = promptData
    ? applyTemplateVariables(promptData.template, variables)
    : `You are a graphic designer creating a print-ready motif for merchandise. Based on the concept below, generate a detailed image generation prompt.

Merchandise Concept:
${variables.concept}

Brand Colors: ${variables.colors}
Product Type: ${variables.productName}
Print Zones: ${variables.printZones}
Max Colors: ${variables.maxColors}
Constraints: ${variables.constraints}

Create a detailed image generation prompt (1-2 sentences) that:
1. Describes the visual motif clearly and specifically
2. Specifies composition, style, and visual elements
3. Respects the color and print zone constraints
4. Avoids text/typography (unless explicitly part of the concept)
5. Is suitable for ${variables.productName} merchandise

Return ONLY the image generation prompt, nothing else.${variables.regenerateInstruction}`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  if (!text || text.trim().length === 0) {
    throw new Error('Failed to generate motif prompt - empty response')
  }

  return text.trim()
}

/**
 * Complete motif generation workflow
 * Generates a motif for merchandise based on concept and brand data
 * @param concept - The creative concept for the merchandise
 * @param scrapedData - Brand data including colors, fonts, etc.
 * @param product - Primary product for motif generation (typically T-Shirt)
 * @param regenerate - If true, forces creative variation
 */
export async function generateMotif(
  concept: string,
  scrapedData: ScrapedData,
  product: Product,
  regenerate: boolean = false
): Promise<string> {
  // Generate the motif prompt with optional regeneration
  const motifPrompt = await generateMotifPrompt(concept, scrapedData, product, regenerate)

  // In a full implementation, this would call an image generation service
  // For now, we return the prompt description which can be used for placeholder images
  // or with external image generation services
  return motifPrompt
}

/**
 * Generate a motif image using Gemini's image generation
 */
export async function generateMotifImage(
  motifPrompt: string,
  aspectRatio: '1:1' | '16:9' | '9:16' = '1:1'
): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-flash-latest' })

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
  const model = getGenAI().getGenerativeModel({ model: 'gemini-flash-latest' })

  // Fetch prompt template from database
  const promptData = await getPrompt('product_variation')

  // Prepare template variables
  const variables = {
    concept: baseConcept,
    productName: product.name,
    printZones: product.print_zones.join(', '),
    maxColors: product.max_colors.toString(),
    constraints: product.constraints || 'None',
    recommendedElements: product.recommended_elements?.join(', ') || 'Any',
    colors: scrapedData.colors?.join(', ') || 'N/A',
  }

  // Apply template or use fallback
  const prompt = promptData
    ? applyTemplateVariables(promptData.template, variables)
    : `Adapt this merchandise concept for a specific product:

Base Concept: ${variables.concept}

Product Details:
- Name: ${variables.productName}
- Print Zones: ${variables.printZones}
- Max Colors: ${variables.maxColors}
- Constraints: ${variables.constraints}
- Recommended Elements: ${variables.recommendedElements}

Brand Colors: ${variables.colors}

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

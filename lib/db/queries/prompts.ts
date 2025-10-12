import { sql } from '../client'

export interface Prompt {
  id: string
  key: string
  name: string
  description: string
  template: string
  variables: string[]
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// In-memory cache for prompts (5 minute TTL)
const promptCache: Map<string, { prompt: Prompt; timestamp: number }> = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get all active prompts
 */
export async function getAllPrompts(): Promise<Prompt[]> {
  const result = await sql`
    SELECT
      id, key, name, description, template,
      variables, category, is_active,
      created_at, updated_at
    FROM prompts
    WHERE is_active = TRUE
    ORDER BY category, name
  `

  return result as Prompt[]
}

/**
 * Get a prompt by key with caching
 */
export async function getPrompt(key: string): Promise<Prompt | null> {
  // Check cache first
  const cached = promptCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.prompt
  }

  // Fetch from database
  const result = await sql`
    SELECT
      id, key, name, description, template,
      variables, category, is_active,
      created_at, updated_at
    FROM prompts
    WHERE key = ${key} AND is_active = TRUE
    LIMIT 1
  `

  if (!result || result.length === 0) {
    return null
  }

  const prompt = result[0] as Prompt

  // Update cache
  promptCache.set(key, {
    prompt,
    timestamp: Date.now(),
  })

  return prompt
}

/**
 * Update a prompt template
 */
export async function updatePrompt(
  key: string,
  template: string
): Promise<Prompt | null> {
  const result = await sql`
    UPDATE prompts
    SET
      template = ${template},
      updated_at = NOW()
    WHERE key = ${key}
    RETURNING
      id, key, name, description, template,
      variables, category, is_active,
      created_at, updated_at
  `

  if (!result || result.length === 0) {
    return null
  }

  // Clear cache for this prompt
  promptCache.delete(key)

  return result[0] as Prompt
}

/**
 * Reset a prompt to its default template
 * This requires fetching the default from the migrations file
 */
export async function resetPrompt(key: string): Promise<Prompt | null> {
  // Map of default prompts from migrations
  const defaults: Record<string, string> = {
    concept_generation: `You are a creative brand merchandise designer. Based on the following brand information, create a compelling merchandise concept that captures the brand's essence.

Brand Information:
- Brand Name: {{brandName}}
- Description: {{description}}
- Primary Colors: {{colors}}
- Typography Style: {{fonts}}
- Key Content Themes: {{headings}}

Create a short, focused merchandise concept (2-3 sentences) that:
1. Reflects the brand's visual identity and messaging
2. Works well across multiple product types (t-shirts, hoodies, mugs, etc.)
3. Is simple enough to be printed/embroidered
4. Has broad appeal to the target audience

Be specific about visual elements, color usage, and composition style.{{regenerateInstruction}}`,

    motif_prompt_generation: `You are a graphic designer creating a print-ready motif for merchandise. Based on the concept below, generate a detailed image generation prompt.

Merchandise Concept:
{{concept}}

Brand Colors: {{colors}}
Product Type: {{productName}}
Print Zones: {{printZones}}
Max Colors: {{maxColors}}
Constraints: {{constraints}}

Create a detailed image generation prompt (1-2 sentences) that:
1. Describes the visual motif clearly and specifically
2. Specifies composition, style, and visual elements
3. Respects the color and print zone constraints
4. Avoids text/typography (unless explicitly part of the concept)
5. Is suitable for {{productName}} merchandise

Return ONLY the image generation prompt, nothing else.{{regenerateInstruction}}`,

    product_variation: `Adapt this merchandise concept for a specific product:

Base Concept: {{concept}}

Product Details:
- Name: {{productName}}
- Print Zones: {{printZones}}
- Max Colors: {{maxColors}}
- Constraints: {{constraints}}
- Recommended Elements: {{recommendedElements}}

Brand Colors: {{colors}}

Provide specific guidance (2-3 sentences) on how to adapt the concept for this product, considering:
1. Print zone placement and sizing
2. Color usage within limits
3. Design elements that work best for this product type
4. Any product-specific constraints

Be concise and actionable.`,
  }

  const defaultTemplate = defaults[key]
  if (!defaultTemplate) {
    throw new Error(`No default template found for prompt: ${key}`)
  }

  return updatePrompt(key, defaultTemplate)
}

/**
 * Clear the prompt cache (useful for testing)
 */
export function clearPromptCache(): void {
  promptCache.clear()
}

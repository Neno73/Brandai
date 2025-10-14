/**
 * Brand Analyzer Service
 *
 * Uses Gemini AI to analyze scraped website content and extract comprehensive brand information
 * including style, tone, keywords, target audience, and other brand attributes
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ScrapedData } from '@/lib/types/session'

let genAI: GoogleGenerativeAI | null = null

/**
 * Lazy initialization of the Gemini API client
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

interface BrandAnalysisResult {
  tagline?: string
  style?: string
  tone?: string
  imagery_style?: string
  brand_keywords?: string[]
  seo_keywords?: string[]
  iconography_style?: string
  logo_description?: string
  target_audience?: string
  cta_examples?: string[]
  social_platforms?: string[]
  company_story?: string
  sentiment?: string
  themes?: string[]
  industry?: string
}

/**
 * Analyze brand data from scraped website content
 * Extracts comprehensive brand attributes using AI
 */
export async function analyzeBrandData(
  content: string,
  title: string,
  description: string,
  headings: string[]
): Promise<BrandAnalysisResult> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-flash-latest' })

  const prompt = `You are a professional brand strategist analyzing a company website to extract key brand attributes.

Website Information:
- Title: ${title}
- Description: ${description}
- Key Headings: ${headings.slice(0, 5).join(', ')}
- Content Sample: ${content.substring(0, 2000)}

Please analyze this website and extract the following brand attributes. Return ONLY a valid JSON object with these exact keys:

{
  "tagline": "The company's tagline or slogan (if found, otherwise create a fitting one based on their messaging)",
  "style": "Visual/Design style (Modern, Minimalist, Bold, Classic, Playful, Elegant, Industrial, Organic, etc.)",
  "tone": "Brand voice tone (Friendly, Professional, Casual, Authoritative, Inspirational, Humorous, Empathetic, etc.)",
  "imagery_style": "Preferred imagery style (Minimalist vector, Photorealistic, Hand-drawn, Abstract, Geometric, Lifestyle, Product-focused, etc.)",
  "brand_keywords": ["3-5 keywords that describe the brand essence"],
  "seo_keywords": ["5-7 SEO keywords relevant to their business"],
  "iconography_style": "Icon style preference (Line art, Solid fill, Outline, Duotone, Flat, Material, etc.)",
  "logo_description": "Brief description of what the logo might represent or what style it likely has based on brand",
  "target_audience": "Primary target audience description",
  "cta_examples": ["2-3 call-to-action examples found or appropriate for this brand"],
  "social_platforms": ["Social media platforms they use or should use"],
  "company_story": "Brief 2-3 sentence company story or mission statement",
  "sentiment": "Overall brand sentiment (Positive, Optimistic, Serious, Innovative, Traditional, Disruptive, etc.)",
  "themes": ["2-4 key themes or topics the brand focuses on"],
  "industry": "Industry or business category"
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.`

  try {
    console.log('[BrandAnalyzer] Starting AI brand analysis...')

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    console.log('[BrandAnalyzer] Raw AI response:', text.substring(0, 200) + '...')

    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    // Parse JSON response
    const analysis: BrandAnalysisResult = JSON.parse(cleanedText)

    console.log('[BrandAnalyzer] Analysis complete:', {
      tagline: analysis.tagline?.substring(0, 50),
      style: analysis.style,
      tone: analysis.tone,
      target_audience: analysis.target_audience?.substring(0, 50),
    })

    return analysis
  } catch (error) {
    console.error('[BrandAnalyzer] Analysis failed:', error)

    // Return partial data with fallbacks
    return {
      tagline: undefined,
      style: 'Modern',
      tone: 'Professional',
      imagery_style: 'Minimalist vector',
      brand_keywords: [],
      seo_keywords: [],
      iconography_style: 'Line art',
      logo_description: undefined,
      target_audience: 'General audience',
      cta_examples: ['Learn More', 'Get Started', 'Contact Us'],
      social_platforms: ['LinkedIn', 'Twitter', 'Facebook'],
      company_story: undefined,
      sentiment: 'Positive',
      themes: [],
      industry: 'Unknown',
    }
  }
}

/**
 * Enhance scraped data with AI-powered brand analysis
 * Combines existing scraped data with comprehensive brand attributes
 */
export async function enhanceScrapedData(
  scrapedData: Partial<ScrapedData>
): Promise<Partial<ScrapedData>> {
  try {
    const analysis = await analyzeBrandData(
      scrapedData.content || '',
      scrapedData.title || '',
      scrapedData.description || '',
      scrapedData.headings || []
    )

    // Merge analysis results with existing scraped data
    return {
      ...scrapedData,
      tagline: analysis.tagline,
      style: analysis.style,
      tone: analysis.tone,
      imagery_style: analysis.imagery_style,
      brand_keywords: analysis.brand_keywords,
      seo_keywords: analysis.seo_keywords,
      iconography_style: analysis.iconography_style,
      logo_description: analysis.logo_description,
      target_audience: analysis.target_audience,
      cta_examples: analysis.cta_examples,
      social_platforms: analysis.social_platforms,
      company_story: analysis.company_story,
      sentiment: analysis.sentiment,
      themes: analysis.themes,
      industry: analysis.industry,
    }
  } catch (error) {
    console.error('[BrandAnalyzer] Enhancement failed:', error)
    // Return original data if enhancement fails
    return scrapedData
  }
}

import type { ScrapedData } from '@/lib/types/session'

const API_KEY = process.env.BRANDFETCH_API_KEY
const BASE_URL = 'https://api.brandfetch.io/v2'

interface BrandfetchBrand {
  logos?: Array<{
    formats?: Array<{
      src: string
      format: string
      width?: number
      height?: number
    }>
  }>
  colors?: Array<{
    hex: string
    type?: string
  }>
  fonts?: Array<{
    name: string
    type?: string
  }>
}

/**
 * Extract logo URL from Brandfetch API
 */
export async function extractLogo(domain: string): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/brands/${domain}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) {
      console.error('Brandfetch API error:', response.statusText)
      return null
    }

    const data: BrandfetchBrand = await response.json()

    // Find PNG logo format
    const logo = data.logos?.[0]
    const pngFormat = logo?.formats?.find(f => f.format === 'png')
    const anyFormat = logo?.formats?.[0]

    return pngFormat?.src || anyFormat?.src || null
  } catch (error) {
    console.error('Brandfetch logo extraction error:', error)
    return null
  }
}

/**
 * Extract brand colors from Brandfetch API
 */
export async function extractColors(domain: string): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/brands/${domain}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) {
      console.error('Brandfetch API error:', response.statusText)
      return []
    }

    const data: BrandfetchBrand = await response.json()

    // Extract primary colors
    const colors =
      data.colors
        ?.filter(c => c.hex && c.hex.match(/^#[0-9A-F]{6}$/i))
        .map(c => c.hex.toUpperCase())
        .slice(0, 5) || []

    return colors
  } catch (error) {
    console.error('Brandfetch color extraction error:', error)
    return []
  }
}

/**
 * Extract brand fonts from Brandfetch API
 */
export async function extractFonts(domain: string): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/brands/${domain}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) {
      console.error('Brandfetch API error:', response.statusText)
      return []
    }

    const data: BrandfetchBrand = await response.json()

    return data.fonts?.map(f => f.name) || []
  } catch (error) {
    console.error('Brandfetch font extraction error:', error)
    return []
  }
}

/**
 * Extract all brand data from Brandfetch API
 */
export async function fetchBrandData(url: string): Promise<Partial<ScrapedData>> {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    console.log(`[Brandfetch] Starting data extraction for domain: ${domain}`)

    const [logo, colors, fonts] = await Promise.all([
      extractLogo(domain),
      extractColors(domain),
      extractFonts(domain),
    ])

    console.log(`[Brandfetch] Extraction complete for ${domain}: logo=${!!logo}, colors=${colors.length}, fonts=${fonts.length}`)

    return {
      logo: logo
        ? {
            original_url: logo,
            stored_url: '', // Will be set after uploading to Vercel Blob
            format: 'png',
            width: 0, // Will be determined after processing
            height: 0,
          }
        : undefined,
      colors: colors.length >= 2 ? colors : [],
      fonts,
    }
  } catch (error) {
    console.error('Brandfetch brand data extraction error:', error)
    return {
      colors: [],
      fonts: [],
    }
  }
}

import type { ScrapedData } from '@/lib/types/session'
import { getCachedBrandData, setCachedBrandData } from '@/lib/db/queries'
import { put } from '@vercel/blob'
import sharp from 'sharp'

const API_KEY = process.env.BRANDFETCH_API_KEY
const BASE_URL = 'https://api.brandfetch.io/v2'

interface BrandfetchBrand {
  name?: string
  description?: string
  longDescription?: string

  // Enhanced Logo Data
  logos?: Array<{
    theme?: 'dark' | 'light'
    type?: 'icon' | 'logo' | 'symbol' | 'other'
    formats?: Array<{
      src: string
      format: string
      width?: number
      height?: number
    }>
  }>

  // Enhanced Color Data
  colors?: Array<{
    hex: string
    type?: 'brand' | 'accent' | 'dark' | 'light'
    brightness?: number
  }>

  // Enhanced Font Data
  fonts?: Array<{
    name: string
    type?: 'title' | 'body'
    origin?: 'Google' | 'custom' | 'system'
    originId?: string
    weights?: number[]
  }>

  // Company Data
  company?: {
    industries?: string[]
    foundedYear?: number
    location?: {
      city?: string
      country?: string
      countryCode?: string
    }
  }

  // Social Links
  links?: Array<{
    name: string
    url: string
  }>
}

/**
 * Fetch brand data from Brandfetch API (single API call)
 * Extracts logo URL, colors, fonts, and enhanced metadata from one response
 */
async function fetchBrandfetchData(domain: string): Promise<{
  logoUrl: string | null
  logoVariants: {
    icon_dark?: string
    icon_light?: string
    full_dark?: string
    full_light?: string
  }
  colors: string[]
  colorsEnhanced: Array<{ hex: string; type: 'brand' | 'accent' | 'dark' | 'light' | 'unknown'; brightness?: number }>
  fonts: string[]
  fontsEnhanced: Array<{ name: string; type: 'title' | 'body' | 'unknown'; origin?: 'Google' | 'custom' | 'system'; weights?: number[] }>
  industries?: string[]
  foundedYear?: number
  location?: { city?: string; country?: string; countryCode?: string }
  socialLinks?: Array<{ name: string; url: string }>
}> {
  try {
    console.log(`[Brandfetch] Fetching brand data for domain: ${domain}`)

    const response = await fetch(`${BASE_URL}/brands/${domain}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) {
      console.error(`[Brandfetch] API error (${response.status}):`, response.statusText)
      return {
        logoUrl: null,
        logoVariants: {},
        colors: [],
        colorsEnhanced: [],
        fonts: [],
        fontsEnhanced: [],
      }
    }

    const data: BrandfetchBrand = await response.json()

    // Extract primary logo URL (backward compatibility)
    let logoUrl: string | null = null
    const logo = data.logos?.[0]
    if (logo) {
      const pngFormat = logo.formats?.find(f => f.format === 'png')
      const anyFormat = logo.formats?.[0]
      logoUrl = pngFormat?.src || anyFormat?.src || null
    }

    // ENHANCED: Extract logo variants by type and theme
    const logoVariants: any = {}
    data.logos?.forEach(logo => {
      const type = logo.type || 'logo'
      const theme = logo.theme || 'dark'
      const pngFormat = logo.formats?.find(f => f.format === 'png')
      const url = pngFormat?.src || logo.formats?.[0]?.src

      if (url) {
        const key = `${type === 'icon' ? 'icon' : 'full'}_${theme}`
        if (!logoVariants[key]) {
          logoVariants[key] = url
        }
      }
    })

    // ENHANCED: Extract colors with type and brightness
    const colorsEnhanced: Array<{ hex: string; type: 'brand' | 'accent' | 'dark' | 'light' | 'unknown'; brightness?: number }> = data.colors?.map(c => ({
      hex: c.hex.toUpperCase(),
      type: (c.type || 'unknown') as 'brand' | 'accent' | 'dark' | 'light' | 'unknown',
      brightness: c.brightness,
    })) || []

    // Backward compatible: simple hex array
    const colors = colorsEnhanced
      .filter(c => c.hex.match(/^#[0-9A-F]{6}$/i))
      .map(c => c.hex)
      .slice(0, 5)

    // ENHANCED: Extract fonts with type and weights
    const fontsEnhanced: Array<{ name: string; type: 'title' | 'body' | 'unknown'; origin?: 'Google' | 'custom' | 'system'; weights?: number[] }> = data.fonts?.map(f => ({
      name: f.name,
      type: (f.type || 'unknown') as 'title' | 'body' | 'unknown',
      origin: f.origin as 'Google' | 'custom' | 'system' | undefined,
      weights: f.weights,
    })) || []

    // Backward compatible: simple name array
    const fonts = fontsEnhanced.map(f => f.name)

    // ENHANCED: Extract company data
    const industries = data.company?.industries
    const foundedYear = data.company?.foundedYear
    const location = data.company?.location
    const socialLinks = data.links

    console.log(`[Brandfetch] Extracted: logo=${!!logoUrl}, variants=${Object.keys(logoVariants).length}, colors=${colors.length} (${colorsEnhanced.length} enhanced), fonts=${fonts.length} (${fontsEnhanced.length} enhanced)`)
    if (industries) console.log(`[Brandfetch] Industries:`, industries)

    return {
      logoUrl,
      logoVariants,
      colors,
      colorsEnhanced,
      fonts,
      fontsEnhanced,
      industries,
      foundedYear,
      location,
      socialLinks,
    }
  } catch (error) {
    console.error('[Brandfetch] Data extraction error:', error)
    return {
      logoUrl: null,
      logoVariants: {},
      colors: [],
      colorsEnhanced: [],
      fonts: [],
      fontsEnhanced: [],
    }
  }
}

/**
 * Download logo from URL and upload to Vercel Blob
 * Returns the uploaded logo URL and metadata
 * Always converts logos to PNG format for consistency
 */
async function downloadAndUploadLogo(logoUrl: string, domain: string): Promise<{
  stored_url: string
  format: 'png'
  width: number
  height: number
} | null> {
  try {
    console.log(`[Brandfetch] Downloading logo from: ${logoUrl}`)

    // Download logo
    const response = await fetch(logoUrl)
    if (!response.ok) {
      console.error(`[Brandfetch] Failed to download logo: ${response.statusText}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process image with sharp - always convert to PNG for consistency
    const image = sharp(buffer)
    const metadata = await image.metadata()

    console.log(`[Brandfetch] Processing logo: ${metadata.format} ${metadata.width}x${metadata.height}`)

    // Resize if too large and convert to PNG
    let processedBuffer: Buffer
    if (metadata.width && metadata.width > 2000 || metadata.height && metadata.height > 2000) {
      console.log(`[Brandfetch] Resizing large logo (${metadata.width}x${metadata.height})`)
      processedBuffer = await image
        .resize(2000, 2000, {
          fit: 'inside',
          withoutEnlargement: false,
        })
        .png({ quality: 100 })
        .toBuffer() as Buffer
    } else {
      // Convert to PNG
      processedBuffer = await image.png({ quality: 100 }).toBuffer() as Buffer
    }

    // Get final dimensions
    const finalImage = sharp(processedBuffer)
    const finalMetadata = await finalImage.metadata()

    // Upload to Vercel Blob
    const timestamp = Date.now()
    const blob = await put(
      `logos/${domain}-${timestamp}.png`,
      processedBuffer,
      {
        access: 'public',
        contentType: 'image/png',
        addRandomSuffix: true,
      }
    )

    console.log(`[Brandfetch] Logo uploaded to: ${blob.url}`)

    return {
      stored_url: blob.url,
      format: 'png',
      width: finalMetadata.width || 0,
      height: finalMetadata.height || 0,
    }
  } catch (error) {
    console.error('[Brandfetch] Logo download/upload error:', error)
    return null
  }
}

/**
 * Extract all brand data from Brandfetch API with 30-day caching
 * Optimized to make only ONE API call instead of three
 * Checks cache first to avoid redundant API calls for the same domain
 */
export async function fetchBrandData(url: string): Promise<Partial<ScrapedData>> {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    console.log(`[Brandfetch] Starting data extraction for domain: ${domain}`)

    // Check cache first
    const cachedData = await getCachedBrandData(domain)
    if (cachedData) {
      console.log(`[Brandfetch] ✓ Cache HIT for ${domain} - using cached data (no API call)`)
      return cachedData
    }

    console.log(`[Brandfetch] Cache MISS for ${domain} - fetching from API`)

    // Single API call to fetch all data (logo, colors, fonts, enhanced metadata)
    const {
      logoUrl,
      // logoVariants, // TODO: Use when implementing logo variant downloads
      colors,
      colorsEnhanced,
      fonts,
      fontsEnhanced,
      industries,
      foundedYear,
      location,
      socialLinks,
    } = await fetchBrandfetchData(domain)

    console.log(`[Brandfetch] Extraction complete for ${domain}: logo=${!!logoUrl}, colors=${colors.length}, fonts=${fonts.length}`)

    // Download and upload logo to Vercel Blob if found
    let logoData: { original_url: string; stored_url: string; format: 'png'; width: number; height: number } | undefined = undefined
    if (logoUrl) {
      const uploadedLogo = await downloadAndUploadLogo(logoUrl, domain)
      if (uploadedLogo) {
        logoData = {
          original_url: logoUrl,
          stored_url: uploadedLogo.stored_url,
          format: 'png' as const,
          width: uploadedLogo.width,
          height: uploadedLogo.height,
        }
      } else {
        // Fallback: keep original URL if upload fails
        console.warn(`[Brandfetch] Logo upload failed, keeping original URL`)
        logoData = {
          original_url: logoUrl,
          stored_url: '', // Upload failed
          format: 'png' as const,
          width: 0,
          height: 0,
        }
      }
    }

    const brandData = {
      logo: logoData,
      // TODO: Download and upload logo variants
      // logo_variants: logoVariants,
      colors: colors.length >= 2 ? colors : [],
      colors_enhanced: colorsEnhanced,
      fonts,
      fonts_enhanced: fontsEnhanced,
      industries,
      founded_year: foundedYear,
      location,
      social_links: socialLinks,
    }

    // Cache the result for 30 days
    try {
      await setCachedBrandData(domain, brandData)
      console.log(`[Brandfetch] ✓ Cached data for ${domain} (30 days)`)
    } catch (cacheError) {
      console.warn(`[Brandfetch] Failed to cache data (non-fatal):`, cacheError)
      // Don't fail if caching fails - just log and continue
    }

    return brandData
  } catch (error) {
    console.error('Brandfetch brand data extraction error:', error)
    return {
      colors: [],
      fonts: [],
    }
  }
}

import type { ScrapedData } from '@/lib/types/session'
import { put } from '@vercel/blob'
import sharp from 'sharp'

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
 * Extract all brand data from Brandfetch API
 */
export async function fetchBrandData(url: string): Promise<Partial<ScrapedData>> {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    console.log(`[Brandfetch] Starting data extraction for domain: ${domain}`)

    const [logoUrl, colors, fonts] = await Promise.all([
      extractLogo(domain),
      extractColors(domain),
      extractFonts(domain),
    ])

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

    return {
      logo: logoData,
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

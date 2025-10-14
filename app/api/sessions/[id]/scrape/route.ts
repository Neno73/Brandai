import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSession } from '@/lib/db/queries'
import { fetchBrandData } from '@/lib/services/brandfetch'
import { scrapeWebsiteContent } from '@/lib/services/firecrawl'
import { enhanceScrapedData } from '@/lib/services/brand-analyzer'
import { retryWithBackoff } from '@/lib/utils/error-handling'
import type { ScrapedData } from '@/lib/types/session'

export const maxDuration = 300 // 5 minutes max for scraping

/**
 * POST /api/sessions/[id]/scrape
 *
 * Stage 1: Scraping & Brand Data Extraction
 * - Fetches brand data from Brandfetch API
 * - Scrapes website content with Firecrawl
 * - Uses AI to analyze and extract comprehensive brand attributes
 * - Updates session with extracted data
 * - Sets status to 'awaiting_approval' for user review
 *
 * DOES NOT proceed to concept/motif/product generation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id

  try {
    // Get session
    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    console.log(`[${sessionId}] Starting Stage 1: Brand Data Extraction...`)

    // Update status to scraping
    await updateSession(sessionId, { status: 'scraping' })

    // Step 1: Parallel scraping with Brandfetch + Firecrawl
    console.log(`[${sessionId}] Fetching brand data and scraping content...`)

    let brandData, contentData
    try {
      ;[brandData, contentData] = await Promise.all([
        retryWithBackoff(() => fetchBrandData(session.url), 3, 1000),
        retryWithBackoff(() => scrapeWebsiteContent(session.url), 3, 1000),
      ])
      console.log(
        `[${sessionId}] Scraping completed. Brand: ${brandData.title || contentData.title}, Content length: ${contentData.content?.length || 0}`
      )
    } catch (scrapingError) {
      console.error(`[${sessionId}] Scraping failed:`, scrapingError)
      await updateSession(sessionId, { status: 'failed' })
      throw scrapingError
    }

    // Merge scraped data
    const basicScrapedData: Partial<ScrapedData> = {
      title: brandData.title || contentData.title || 'Unknown Brand',
      description: brandData.description || contentData.description || '',
      logo: brandData.logo,
      colors: brandData.colors || [],
      fonts: brandData.fonts,
      headings: contentData.headings || [],
      content: contentData.content || '',
    }

    // Step 2: AI-powered brand analysis
    console.log(`[${sessionId}] Analyzing brand attributes with AI...`)

    let enhancedData: Partial<ScrapedData>
    try {
      enhancedData = await retryWithBackoff(
        () => enhanceScrapedData(basicScrapedData),
        2,
        1500
      )
      console.log(
        `[${sessionId}] Brand analysis complete. Extracted: ${Object.keys(enhancedData).length} attributes`
      )
    } catch (analysisError) {
      console.warn(
        `[${sessionId}] Brand analysis failed, using basic data:`,
        analysisError
      )
      enhancedData = basicScrapedData
    }

    // Step 3: Validate required fields
    const missingFields: string[] = []
    let requiresManualInput = false

    if (!enhancedData.logo) {
      missingFields.push('logo')
      requiresManualInput = true
    }

    if (!enhancedData.colors || enhancedData.colors.length < 2) {
      missingFields.push('colors')
      requiresManualInput = true
    }

    // Build final scraped data object
    const scrapedData: ScrapedData = {
      ...enhancedData,
      requires_manual_input: requiresManualInput,
      missing_fields: missingFields,
    } as ScrapedData

    // Step 4: Update session with extracted data
    console.log(
      `[${sessionId}] ${requiresManualInput ? 'Missing required data, awaiting manual input' : 'All data extracted, ready for approval'}`
    )

    await updateSession(sessionId, {
      status: 'awaiting_approval',
      scraped_data: scrapedData,
    })

    return NextResponse.json({
      success: true,
      message: requiresManualInput
        ? 'Manual input required to proceed'
        : 'Brand data extracted successfully',
      requires_manual_input: requiresManualInput,
      missing_fields: missingFields,
      scraped_data: scrapedData,
      sessionId,
    })
  } catch (error) {
    console.error(`[${sessionId}] Stage 1 failed:`, error)

    // Update session to failed status
    try {
      await updateSession(sessionId, { status: 'failed' })
    } catch (updateError) {
      console.error(
        `[${sessionId}] Failed to update session status:`,
        updateError
      )
    }

    return NextResponse.json(
      {
        error: 'Brand data extraction failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

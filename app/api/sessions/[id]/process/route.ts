import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSession, getProducts } from '@/lib/db/queries'
import { fetchBrandData } from '@/lib/services/brandfetch'
import { scrapeWebsiteContent } from '@/lib/services/firecrawl'
import { generateConcept, generateMotifPrompt } from '@/lib/services/gemini'
import { sendMerchandiseEmail } from '@/lib/services/email'
import { retryWithBackoff } from '@/lib/utils/error-handling'
import type { ScrapedData, ProductImage } from '@/lib/types/session'

export const maxDuration = 300 // 5 minutes max for this endpoint

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

    console.log(`[${sessionId}] Starting processing pipeline...`)

    // Step 1: Scraping
    console.log(`[${sessionId}] Step 1: Scraping website...`)
    await updateSession(sessionId, { status: 'scraping' })

    const [brandData, contentData] = await Promise.all([
      retryWithBackoff(() => fetchBrandData(session.url), 3, 1000),
      retryWithBackoff(() => scrapeWebsiteContent(session.url), 3, 1000),
    ])

    const scrapedData: ScrapedData = {
      title: brandData.title || contentData.title || 'Unknown Brand',
      description: brandData.description || contentData.description || '',
      logo: brandData.logo,
      colors: brandData.colors || [],
      fonts: brandData.fonts,
      headings: contentData.headings || [],
      content: contentData.content || '',
    }

    await updateSession(sessionId, {
      status: 'concept',
      scraped_data: scrapedData,
    })

    // Step 2: Generate Concept
    console.log(`[${sessionId}] Step 2: Generating concept...`)
    const concept = await retryWithBackoff(
      () => generateConcept(scrapedData),
      3,
      1000
    )

    await updateSession(sessionId, {
      status: 'motif',
      concept,
    })

    // Step 3: Generate Motif (for now, just store the prompt)
    console.log(`[${sessionId}] Step 3: Generating motif...`)
    const products = await getProducts()
    if (products.length === 0) {
      throw new Error('No products available')
    }

    // Generate motif based on the first product (T-Shirt typically)
    const primaryProduct = products[0]
    const motifPrompt = await retryWithBackoff(
      () => generateMotifPrompt(concept, scrapedData, primaryProduct),
      3,
      1000
    )

    // For MVP, we'll use a placeholder image URL
    // In production, this would call an image generation service
    const motifImageUrl = `https://via.placeholder.com/800x800.png?text=${encodeURIComponent(
      'Motif: ' + scrapedData.title
    )}`

    await updateSession(sessionId, {
      status: 'products',
      motif_image_url: motifImageUrl,
    })

    // Step 4: Generate Product Mockups
    console.log(`[${sessionId}] Step 4: Generating product mockups...`)
    const productImages: ProductImage[] = products.map((product) => ({
      product_id: product.id,
      product_name: product.name,
      image_url: `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(
        product.name + ' Mockup'
      )}`,
      print_zones: product.print_zones,
      design_notes: `${concept} - Applied to ${product.name}`,
    }))

    await updateSession(sessionId, {
      status: 'complete',
      product_images: productImages,
    })

    // Step 5: Generate PDF and Send Email
    console.log(`[${sessionId}] Step 5: Sending email with results...`)

    // For MVP, we'll use a placeholder PDF URL
    // In production, this would generate an actual PDF and upload to Blob storage
    const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions/${sessionId}/pdf`

    const previewUrls = productImages.map((p) => p.image_url)

    await retryWithBackoff(
      () =>
        sendMerchandiseEmail({
          to: session.email,
          sessionId: session.id,
          brandName: scrapedData.title || 'Your Brand',
          concept,
          pdfUrl,
          previewImages: previewUrls,
        }),
      3,
      2000
    )

    console.log(`[${sessionId}] Processing complete!`)

    return NextResponse.json({
      success: true,
      message: 'Processing complete',
      sessionId,
    })
  } catch (error) {
    console.error(`[${sessionId}] Processing failed:`, error)

    // Update session to failed status
    try {
      await updateSession(sessionId, { status: 'failed' })
    } catch (updateError) {
      console.error(`[${sessionId}] Failed to update session status:`, updateError)
    }

    return NextResponse.json(
      {
        error: 'Processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

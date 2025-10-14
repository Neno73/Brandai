import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSession, getProducts } from '@/lib/db/queries'
import { sendMerchandiseEmail } from '@/lib/services/email'
import { retryWithBackoff } from '@/lib/utils/error-handling'
import type { ProductImage } from '@/lib/types/session'

export const maxDuration = 120 // 2 minutes max for product generation

/**
 * POST /api/sessions/[id]/products
 *
 * Stage 3: Product Mockup Generation
 * - Generates product mockups using existing motif
 * - Sends email with results
 * - Updates session status to 'complete'
 *
 * Prerequisites:
 * - Session must have scraped_data
 * - Session must have concept
 * - Session must have motif_image_url
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

    // Validate prerequisites
    if (!session.scraped_data) {
      return NextResponse.json(
        { error: 'Session has no scraped data. Run scraping first.' },
        { status: 400 }
      )
    }

    if (!session.concept) {
      return NextResponse.json(
        { error: 'Session has no concept. Generate concept first.' },
        { status: 400 }
      )
    }

    if (!session.motif_image_url) {
      return NextResponse.json(
        { error: 'Session has no motif. Generate motif first.' },
        { status: 400 }
      )
    }

    console.log(`[${sessionId}] Starting Stage 3: Product Mockup Generation...`)

    // Update status to products
    await updateSession(sessionId, { status: 'products' })

    // Step 1: Generate Product Mockups
    console.log(`[${sessionId}] Generating product mockups...`)

    const products = await getProducts()
    if (products.length === 0) {
      throw new Error('No products available')
    }

    // Generate mockup URLs
    // In future, this could call a mockup generation service (e.g., Printful, Placeit)
    // For now, we'll use placeholder mockups
    const productImages: ProductImage[] = products.map((product) => ({
      product_id: product.id,
      product_name: product.name,
      image_url: `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(
        product.name + ' Mockup'
      )}`,
      print_zones: product.print_zones,
      design_notes: `${session.concept} - Applied to ${product.name}`,
    }))

    console.log(
      `[${sessionId}] Generated ${productImages.length} product mockups`
    )

    // Step 2: Update session with products and mark as complete
    await updateSession(sessionId, {
      status: 'complete',
      product_images: productImages,
    })

    // Step 3: Send email with results
    console.log(`[${sessionId}] Sending email notification...`)

    const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions/${sessionId}/pdf`
    const previewUrls = productImages.map((p) => p.image_url)

    try {
      await retryWithBackoff(
        () =>
          sendMerchandiseEmail({
            to: session.email,
            sessionId: session.id,
            brandName: session.scraped_data.title || 'Your Brand',
            concept: session.concept!,
            pdfUrl,
            previewImages: previewUrls,
          }),
        3,
        2000
      )
      console.log(`[${sessionId}] Email sent successfully`)
    } catch (emailError) {
      console.error(
        `[${sessionId}] Failed to send email (non-fatal):`,
        emailError
      )
      // Don't fail the entire request if email fails
    }

    console.log(`[${sessionId}] Stage 3 complete!`)

    return NextResponse.json({
      success: true,
      message: 'Product mockups generated successfully',
      product_images: productImages,
      sessionId,
    })
  } catch (error) {
    console.error(`[${sessionId}] Stage 3 failed:`, error)

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
        error: 'Product generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

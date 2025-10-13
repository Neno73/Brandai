import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSession, getProducts } from '@/lib/db/queries'
import { generateMotif } from '@/lib/services/gemini'
import { generateMotifImage, generatePlaceholderMotif } from '@/lib/services/imagen'
import { retryWithBackoff } from '@/lib/utils/error-handling'

export const maxDuration = 120 // 2 minutes max for motif generation

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id

  try {
    // Parse request body
    const body = await request.json()
    const { regenerate = false } = body

    // Get session
    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify concept exists
    if (!session.concept) {
      return NextResponse.json(
        { error: 'Session has no concept. Generate concept first.' },
        { status: 400 }
      )
    }

    // Verify scraped data exists
    if (!session.scraped_data) {
      return NextResponse.json(
        { error: 'Session has no scraped data.' },
        { status: 400 }
      )
    }

    console.log(
      `[${sessionId}] Generating motif (regenerate: ${regenerate})...`
    )

    // Get products to determine primary product for motif generation
    const products = await getProducts()
    if (products.length === 0) {
      throw new Error('No products available')
    }

    // Use first product (typically T-Shirt) as base for motif generation
    const primaryProduct = products[0]

    // Generate motif prompt with retry logic
    const motifPrompt = await retryWithBackoff(
      () => generateMotif(session.concept!, session.scraped_data, primaryProduct, regenerate),
      3,
      1000
    )

    console.log(`[${sessionId}] Motif prompt generated, calling Imagen API...`)

    // Generate actual motif image using Imagen 3 (Nanobana)
    let motifImageUrl: string

    try {
      const imagenResponse = await retryWithBackoff(
        () => generateMotifImage(
          motifPrompt,
          session.scraped_data.colors || [],
          '1:1'
        ),
        2,
        2000
      )

      motifImageUrl = imagenResponse.imageUrl
      console.log(`[${sessionId}] Motif image generated successfully: ${motifImageUrl}`)
    } catch (imagenError) {
      console.error(`[${sessionId}] Imagen generation failed, using placeholder:`, imagenError)
      // Fallback to placeholder if Imagen fails
      motifImageUrl = generatePlaceholderMotif(
        session.scraped_data.title,
        session.scraped_data.colors || []
      )
    }

    // Update session with new motif
    const updatedData = {
      motif_image_url: motifImageUrl,
      status: session.status === 'concept' ? 'motif' : session.status, // Only update status if still in concept phase
    }

    await updateSession(sessionId, updatedData)

    console.log(`[${sessionId}] Motif generation complete`)

    return NextResponse.json({
      success: true,
      motif_image_url: motifImageUrl,
      motif_prompt: motifPrompt,
      regenerated: regenerate,
    })
  } catch (error) {
    console.error(`[${sessionId}] Motif generation failed:`, error)

    return NextResponse.json(
      {
        error: 'Failed to generate motif',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

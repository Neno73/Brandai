import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSession } from '@/lib/db/queries'
import { generateConcept } from '@/lib/services/gemini'
import { retryWithBackoff } from '@/lib/utils/error-handling'

export const maxDuration = 60 // 1 minute max for concept generation

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

    // Verify scraped data exists
    if (!session.scraped_data) {
      return NextResponse.json(
        { error: 'Session has no scraped data. Run scraping first.' },
        { status: 400 }
      )
    }

    console.log(
      `[${sessionId}] Generating concept (regenerate: ${regenerate})...`
    )

    // Log data being passed to concept generation
    console.log(`[${sessionId}] Concept generation with scraped_data:`, {
      hasScrapedData: !!session.scraped_data,
      hasLogo: !!session.scraped_data?.logo,
      colorsCount: session.scraped_data?.colors?.length || 0,
      fontsCount: session.scraped_data?.fonts?.length || 0,
      hasTitle: !!session.scraped_data?.title,
      hasDescription: !!session.scraped_data?.description,
    })

    // Generate concept with retry logic
    const concept = await retryWithBackoff(
      () => generateConcept(session.scraped_data, regenerate),
      3,
      1000
    )

    // Update session with new concept
    // Note: We maintain edit history by storing previous concepts in metadata
    const updatedData = {
      concept,
      status: (session.status === 'scraping' || session.status === 'awaiting_approval') ? 'concept' : session.status, // Update status from scraping or awaiting_approval
    }

    await updateSession(sessionId, updatedData)

    console.log(`[${sessionId}] Concept generation complete`)

    return NextResponse.json({
      success: true,
      concept,
      regenerated: regenerate,
    })
  } catch (error) {
    console.error(`[${sessionId}] Concept generation failed:`, error)

    return NextResponse.json(
      {
        error: 'Failed to generate concept',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

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
      status: session.status === 'scraping' ? 'concept' : session.status, // Only update status if still in scraping phase
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

import { NextRequest, NextResponse } from 'next/server'
import { createSession, findExistingSession } from '@/lib/db/queries'
import { SessionCreateSchema } from '@/lib/utils/validation'
import { generateMagicLinkToken } from '@/lib/utils/magic-link'
import { sendMagicLink } from '@/lib/services/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = SessionCreateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { email, url } = validationResult.data

    // Check for existing session with same email and URL
    const existingSession = await findExistingSession(email, url)

    if (existingSession) {
      // Generate magic link for existing session
      const magicLinkToken = generateMagicLinkToken(existingSession.id, email)
      const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/session/${existingSession.id}?token=${magicLinkToken}`

      // Send magic link email only if real email provided (not temp email)
      if (!email.startsWith('temp-')) {
        await sendMagicLink(email, magicLink)
      }

      // Return existing session info for client to decide
      return NextResponse.json({
        duplicate: true,
        sessionId: existingSession.id,
        existingSession: {
          id: existingSession.id,
          status: existingSession.status,
          created_at: existingSession.created_at,
          magicLink,
        },
        message: 'A session already exists for this URL and email',
      })
    }

    // Create session in database
    const session = await createSession(url, email)

    // Generate magic link for accessing the session
    const magicLinkToken = generateMagicLinkToken(session.id, email)
    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/session/${session.id}?token=${magicLinkToken}`

    // Send magic link email only if real email provided (not temp email)
    if (!email.startsWith('temp-')) {
      await sendMagicLink(email, magicLink)
    }

    // Trigger Stage 1: Brand data scraping & extraction (using Next.js Route Handlers)
    // In production, this should be a background job/queue
    const scrapeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions/${session.id}/scrape`
    console.log(`[Session:${session.id}] Triggering Stage 1 (scraping) at: ${scrapeUrl}`)

    fetch(scrapeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) {
          console.error(`[Session:${session.id}] Stage 1 (scraping) failed with status: ${response.status}`)
          return response.text().then(text => {
            console.error(`[Session:${session.id}] Error response:`, text)
          })
        } else {
          console.log(`[Session:${session.id}] Stage 1 (scraping) triggered successfully`)
        }
      })
      .catch((err) => {
        console.error(`[Session:${session.id}] Failed to trigger Stage 1 (scraping):`, err)
      })

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      message: email.startsWith('temp-')
        ? 'Session created successfully!'
        : 'Session created successfully. Check your email for the magic link!',
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/db/queries'
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

    // Create session in database
    const session = await createSession(url, email)

    // Generate magic link for accessing the session
    const magicLinkToken = generateMagicLinkToken(session.id, email)
    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/session/${session.id}?token=${magicLinkToken}`

    // Send magic link email
    await sendMagicLink(email, magicLink)

    // Trigger background processing (using Next.js Route Handlers)
    // In production, this should be a background job/queue
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions/${session.id}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch((err) => {
      console.error('Failed to trigger background processing:', err)
    })

    return NextResponse.json({
      id: session.id,
      status: session.status,
      message: 'Session created successfully. Check your email for the magic link!',
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

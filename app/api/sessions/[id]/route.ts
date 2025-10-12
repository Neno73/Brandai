import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/db/queries'
import { verifyMagicLinkToken } from '@/lib/utils/magic-link'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const token = request.nextUrl.searchParams.get('token')

    // Get session
    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify token if provided
    if (token) {
      const payload = verifyMagicLinkToken(token)
      if (!payload || payload.sessionId !== sessionId) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
      }
    }

    // Return session data
    return NextResponse.json({
      id: session.id,
      email: session.email,
      url: session.url,
      status: session.status,
      scraped_data: session.scraped_data,
      concept: session.concept,
      motif_image_url: session.motif_image_url,
      product_images: session.product_images,
      created_at: session.created_at,
      updated_at: session.updated_at,
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

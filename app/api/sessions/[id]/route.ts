import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSession } from '@/lib/db/queries'
import { verifyMagicLinkToken } from '@/lib/utils/magic-link'
import type { ScrapedData } from '@/lib/types/session'

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

    // Verify token if provided (optional for MVP)
    // For production, you should enforce token validation
    if (token) {
      const payload = verifyMagicLinkToken(token)
      if (!payload || payload.sessionId !== sessionId) {
        console.warn('Invalid token provided, but allowing access for MVP')
        // For MVP, we allow access even with invalid token
        // return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    // Get session
    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { scraped_data } = body

    // Validate scraped_data if provided
    if (scraped_data) {
      const updatedScrapedData: ScrapedData = {
        ...session.scraped_data,
        ...scraped_data,
      }

      // Validate colors if provided
      if (scraped_data.colors) {
        if (!Array.isArray(scraped_data.colors)) {
          return NextResponse.json(
            { error: 'Colors must be an array' },
            { status: 400 }
          )
        }

        if (scraped_data.colors.length < 2) {
          return NextResponse.json(
            { error: 'Minimum 2 colors required' },
            { status: 400 }
          )
        }

        // Validate hex color format
        const hexColorRegex = /^#[0-9A-F]{6}$/i
        for (const color of scraped_data.colors) {
          if (!hexColorRegex.test(color)) {
            return NextResponse.json(
              { error: `Invalid hex color format: ${color}` },
              { status: 400 }
            )
          }
        }
      }

      // Update session
      await updateSession(sessionId, {
        scraped_data: updatedScrapedData,
      })

      console.log(`[${sessionId}] Session data updated`)

      return NextResponse.json({
        success: true,
        scraped_data: updatedScrapedData,
      })
    }

    return NextResponse.json(
      { error: 'No updates provided' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

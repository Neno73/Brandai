import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db/client'
import type { Session } from '@/lib/types/session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Parse status filter
    const status = searchParams.get('status')

    // Build query with optional status filter
    let query
    let countQuery

    if (status) {
      query = sql`
        SELECT * FROM sessions
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countQuery = sql`
        SELECT COUNT(*) as total FROM sessions
        WHERE status = ${status}
      `
    } else {
      query = sql`
        SELECT * FROM sessions
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countQuery = sql`
        SELECT COUNT(*) as total FROM sessions
      `
    }

    const [sessions, countResult] = await Promise.all([query, countQuery])

    const total = parseInt((countResult[0] as any).total)
    const pageCount = Math.ceil(total / limit)

    return NextResponse.json({
      sessions: sessions as Session[],
      pagination: {
        total,
        limit,
        offset,
        pageCount,
        currentPage: Math.floor(offset / limit) + 1,
      },
    })
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

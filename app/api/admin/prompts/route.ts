import { NextRequest, NextResponse } from 'next/server'
import { getAllPrompts } from '@/lib/db/queries/prompts'

export async function GET(request: NextRequest) {
  try {
    const prompts = await getAllPrompts()

    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { resetPrompt } from '@/lib/db/queries/prompts'

export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const prompt = await resetPrompt(params.key)

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ prompt, message: 'Prompt reset to default successfully' })
  } catch (error) {
    console.error('Error resetting prompt:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset prompt' },
      { status: 500 }
    )
  }
}

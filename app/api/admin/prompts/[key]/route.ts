import { NextRequest, NextResponse } from 'next/server'
import { getPrompt, updatePrompt } from '@/lib/db/queries/prompts'

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const prompt = await getPrompt(params.key)

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const body = await request.json()
    const { template } = body

    if (!template || typeof template !== 'string') {
      return NextResponse.json(
        { error: 'Invalid template' },
        { status: 400 }
      )
    }

    const prompt = await updatePrompt(params.key, template)

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ prompt, message: 'Prompt updated successfully' })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}

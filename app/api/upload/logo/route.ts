import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`logos/${Date.now()}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload logo',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

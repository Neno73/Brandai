import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'

export const runtime = 'nodejs' // sharp requires nodejs runtime

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get file extension
    const fileName = file.name.toLowerCase()
    const isSVG = fileName.endsWith('.svg')
    const isVector = isSVG || fileName.endsWith('.ai') || fileName.endsWith('.eps')

    if (!isVector) {
      return NextResponse.json(
        { error: 'File must be a vector format (SVG, AI, or EPS)' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB for vectors)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    let pngBuffer: Buffer

    if (isSVG) {
      // Convert SVG to PNG using sharp
      try {
        pngBuffer = await sharp(fileBuffer)
          .resize(2000, 2000, {
            fit: 'inside',
            withoutEnlargement: false,
            background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
          })
          .png({
            quality: 100,
            compressionLevel: 6,
          })
          .toBuffer()
      } catch (error) {
        console.error('SVG conversion error:', error)
        return NextResponse.json(
          {
            error: 'Failed to convert SVG to PNG',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        )
      }
    } else {
      // AI/EPS files not directly supported by sharp
      // User should export these as SVG or PNG first
      return NextResponse.json(
        {
          error: 'AI and EPS files are not directly supported',
          message:
            'Please export your vector file as SVG or PNG from your design software (Adobe Illustrator, Inkscape, etc.) and upload again.',
        },
        { status: 400 }
      )
    }

    // Upload converted PNG to Vercel Blob
    const baseName = file.name.replace(/\.(svg|ai|eps)$/i, '')
    const blob = await put(
      `logos/${Date.now()}-${baseName}.png`,
      pngBuffer,
      {
        access: 'public',
        addRandomSuffix: true,
        contentType: 'image/png',
      }
    )

    return NextResponse.json({
      success: true,
      url: blob.url,
      original_format: fileName.split('.').pop()?.toUpperCase(),
      converted_format: 'PNG',
    })
  } catch (error) {
    console.error('Error converting logo:', error)
    return NextResponse.json(
      {
        error: 'Failed to convert logo',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

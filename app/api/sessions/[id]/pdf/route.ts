import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/db/queries'

export async function GET(
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

    if (session.status !== 'complete') {
      return NextResponse.json(
        { error: 'Session not yet complete' },
        { status: 400 }
      )
    }

    // TODO: Generate actual PDF using @react-pdf/renderer
    // For MVP, return a placeholder response
    const pdfContent = `
      BrendAI - Merchandise Design Report
      =====================================

      Brand: ${session.scraped_data?.title || 'Unknown'}
      URL: ${session.url}
      Session ID: ${session.id}

      Concept:
      ${session.concept || 'N/A'}

      Products:
      ${session.product_images?.map((p) => `- ${p.product_name}`).join('\n') || 'None'}

      Generated: ${new Date().toISOString()}
    `

    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="brendai-${sessionId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

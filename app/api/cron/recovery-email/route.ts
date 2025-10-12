import { NextRequest, NextResponse } from 'next/server'
import { findAbandonedSessions } from '@/lib/db/queries'
import { sendRecoveryEmail } from '@/lib/services/email'
import { generateMagicLink } from '@/lib/utils/magic-link'

// This endpoint should be called by Vercel Cron or another scheduler
// Configure in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/recovery-email",
//     "schedule": "0 */6 * * *"
//   }]
// }

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Recovery Cron] Finding abandoned sessions...')

    // Find sessions abandoned in concept or motif stages for >24 hours
    const abandonedSessions = await findAbandonedSessions()

    console.log(`[Recovery Cron] Found ${abandonedSessions.length} abandoned sessions`)

    let successCount = 0
    let failureCount = 0

    // Send recovery emails
    for (const session of abandonedSessions) {
      try {
        const brandName = session.scraped_data?.title || 'Your Brand'

        // Calculate progress based on status
        let progress = 0
        if (session.status === 'concept') {
          progress = 60 // Completed scraping and concept
        } else if (session.status === 'motif') {
          progress = 75 // Completed through motif
        }

        // Generate magic link
        const magicLink = generateMagicLink(session.id, session.email)

        // Send recovery email
        await sendRecoveryEmail(
          session.email,
          session.id,
          brandName,
          magicLink,
          progress
        )

        console.log(`[Recovery Cron] Sent recovery email to ${session.email} for session ${session.id}`)
        successCount++
      } catch (error) {
        console.error(
          `[Recovery Cron] Failed to send recovery email for session ${session.id}:`,
          error
        )
        failureCount++
      }
    }

    return NextResponse.json({
      success: true,
      found: abandonedSessions.length,
      sent: successCount,
      failed: failureCount,
      message: `Sent ${successCount} recovery emails`,
    })
  } catch (error) {
    console.error('[Recovery Cron] Failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to process recovery emails',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

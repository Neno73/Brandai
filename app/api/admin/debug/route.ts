import { NextResponse } from 'next/server'

export async function GET() {
  // Only expose in non-production or with a debug flag
  if (process.env.NODE_ENV === 'production' && !process.env.DEBUG_MODE) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  return NextResponse.json({
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    adminEmail: process.env.ADMIN_EMAIL,
    hasPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
    passwordHashLength: process.env.ADMIN_PASSWORD_HASH?.length || 0,
    passwordHashPrefix: process.env.ADMIN_PASSWORD_HASH?.substring(0, 10),
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
  })
}

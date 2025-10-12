import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    hasAdminPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
    adminEmailLength: process.env.ADMIN_EMAIL?.length || 0,
    adminPasswordHashLength: process.env.ADMIN_PASSWORD_HASH?.length || 0,
    adminEmailFirst10: process.env.ADMIN_EMAIL?.substring(0, 10) || '',
    adminPasswordHashFirst10: process.env.ADMIN_PASSWORD_HASH?.substring(0, 10) || '',
  })
}

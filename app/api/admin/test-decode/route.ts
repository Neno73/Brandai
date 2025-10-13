import { NextResponse } from 'next/server'

export async function GET() {
  const rawHash = process.env.ADMIN_PASSWORD_HASH || ''

  try {
    const decodedHash = rawHash
      ? Buffer.from(rawHash, 'base64').toString('utf-8')
      : 'NO_HASH'

    return NextResponse.json({
      hasRawHash: !!rawHash,
      rawHashLength: rawHash.length,
      rawHashFirst20: rawHash.substring(0, 20),
      decodedHashLength: decodedHash.length,
      decodedHashFirst20: decodedHash.substring(0, 20),
      decodedHashFormat: decodedHash.startsWith('$2') ? 'bcrypt' : 'unknown',
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      hasRawHash: !!rawHash,
      rawHashLength: rawHash.length,
    })
  }
}

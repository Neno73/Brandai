import crypto from 'crypto'

const SECRET = process.env.MAGIC_LINK_SECRET || 'dev-secret-key-change-in-production'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export interface MagicLinkPayload {
  sessionId: string
  email: string
  timestamp: number
}

/**
 * Generate a signed magic link token using HMAC
 */
export function generateMagicLinkToken(sessionId: string, email: string): string {
  const payload: MagicLinkPayload = {
    sessionId,
    email,
    timestamp: Date.now(),
  }

  const payloadString = JSON.stringify(payload)
  const payloadBase64 = Buffer.from(payloadString).toString('base64url')

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payloadBase64)
    .digest('base64url')

  return `${payloadBase64}.${signature}`
}

/**
 * Validate and decode a magic link token
 */
export function validateMagicLinkToken(token: string): MagicLinkPayload | null {
  try {
    const [payloadBase64, signature] = token.split('.')
    if (!payloadBase64 || !signature) return null

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(payloadBase64)
      .digest('base64url')

    if (signature !== expectedSignature) return null

    // Decode payload
    const payloadString = Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    const payload = JSON.parse(payloadString) as MagicLinkPayload

    return payload
  } catch {
    return null
  }
}

/**
 * Generate a complete magic link URL
 */
export function generateMagicLink(sessionId: string, email: string): string {
  const token = generateMagicLinkToken(sessionId, email)
  return `${BASE_URL}/session/${sessionId}?token=${token}`
}

/**
 * Simple session URL without token (for MVP - anyone with URL can access)
 */
export function getSessionUrl(sessionId: string): string {
  return `${BASE_URL}/session/${sessionId}`
}

/**
 * Alias for validateMagicLinkToken
 */
export const verifyMagicLinkToken = validateMagicLinkToken

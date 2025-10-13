import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production'
)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@brendai.sols.mk'

// Decode ADMIN_PASSWORD_HASH from Base64 to avoid Next.js $ expansion issues
// Store hash in Base64 format in environment variables to prevent Next.js from
// interpreting $ characters as variable references (e.g., $2a becomes empty)
const ADMIN_PASSWORD_HASH_RAW = process.env.ADMIN_PASSWORD_HASH || ''
const ADMIN_PASSWORD_HASH = ADMIN_PASSWORD_HASH_RAW
  ? Buffer.from(ADMIN_PASSWORD_HASH_RAW, 'base64').toString('utf-8')
  : '$2a$10$rO8zF2v3hU9zGqVxZqVxZeOqVxZqVxZqVxZqVxZqVxZqVxZqVxZ' // default: "admin123"

const COOKIE_NAME = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface AdminSession {
  email: string
  issuedAt: number
  expiresAt: number
}

/**
 * Validate admin credentials
 */
export async function validateCredentials(
  email: string,
  password: string
): Promise<boolean> {
  // Check email matches admin email
  if (email !== ADMIN_EMAIL) {
    return false
  }

  // Verify password against hash
  try {
    const result = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    return result
  } catch (error) {
    console.error('Failed to validate credentials:', error)
    return false
  }
}

/**
 * Create a JWT session token
 */
export async function createSessionToken(email: string): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresAt = issuedAt + COOKIE_MAX_AGE

  const token = await new SignJWT({
    email,
    issuedAt,
    expiresAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    return {
      email: payload.email as string,
      issuedAt: payload.issuedAt as number,
      expiresAt: payload.expiresAt as number,
    }
  } catch (error) {
    return null
  }
}

/**
 * Set auth cookie (use in API routes or Server Actions)
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

/**
 * Get auth cookie
 */
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

/**
 * Clear auth cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Validate if the current request is from an authenticated admin
 */
export async function validateAuthCookie(): Promise<AdminSession | null> {
  const token = await getAuthCookie()

  if (!token) {
    return null
  }

  return verifySessionToken(token)
}

/**
 * Hash a password (utility for generating admin password hash)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

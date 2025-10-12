'use server'

import { getSession } from '@/lib/db/queries'
import { validateMagicLinkToken } from '@/lib/utils/magic-link'
import type { Session } from '@/lib/types/session'

export interface GetSessionResult {
  success: boolean
  session?: Session
  error?: string
}

/**
 * Server Action to retrieve session with optional magic link token validation
 * @param sessionId - The session ID to retrieve
 * @param token - Optional magic link token for validation
 */
export async function getSessionAction(
  sessionId: string,
  token?: string
): Promise<GetSessionResult> {
  try {
    // If token is provided, validate it
    if (token) {
      const payload = validateMagicLinkToken(token)

      if (!payload) {
        return {
          success: false,
          error: 'Invalid or expired magic link',
        }
      }

      // Verify the token matches this session
      if (payload.sessionId !== sessionId) {
        return {
          success: false,
          error: 'Magic link does not match this session',
        }
      }
    }

    // Retrieve the session from database
    const session = await getSession(sessionId)

    if (!session) {
      return {
        success: false,
        error: 'Session not found',
      }
    }

    // For MVP, we allow access to sessions without token
    // In production, you may want to enforce token validation
    return {
      success: true,
      session,
    }
  } catch (error) {
    console.error('[getSessionAction] Failed to retrieve session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve session',
    }
  }
}

/**
 * Validate if a token is valid for a session
 */
export async function validateSessionToken(
  sessionId: string,
  token: string
): Promise<boolean> {
  const payload = validateMagicLinkToken(token)
  return payload !== null && payload.sessionId === sessionId
}

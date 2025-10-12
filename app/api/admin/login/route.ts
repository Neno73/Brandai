import { NextRequest, NextResponse } from 'next/server'
import {
  validateCredentials,
  createSessionToken,
  setAuthCookie,
} from '@/lib/utils/admin-auth'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    console.log('[TEMP DEBUG] Login route called')
    const body = await request.json()
    console.log('[TEMP DEBUG] Body parsed')

    // Validate input
    const validationResult = LoginSchema.safeParse(body)
    if (!validationResult.success) {
      console.log('[TEMP DEBUG] Validation failed')
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    console.log('[TEMP DEBUG] Validation passed')

    const { email, password } = validationResult.data
    console.log('[TEMP DEBUG] About to validate credentials')

    // Validate credentials
    const isValid = await validateCredentials(email, password)
    console.log('[TEMP DEBUG] Validation result:', isValid)

    if (!isValid) {
      console.log('[TEMP DEBUG] Credentials invalid - returning 401')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('[TEMP DEBUG] Creating session token')
    // Create session token
    const token = await createSessionToken(email)
    console.log('[TEMP DEBUG] Token created')

    // Set HTTP-only cookie
    console.log('[TEMP DEBUG] Setting auth cookie')
    await setAuthCookie(token)
    console.log('[TEMP DEBUG] Cookie set')

    return NextResponse.json({
      success: true,
      message: 'Login successful',
    })
  } catch (error) {
    console.error('[TEMP DEBUG] Login error caught:', error)
    console.error('[TEMP DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}

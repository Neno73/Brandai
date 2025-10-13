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
    const body = await request.json()

    // Validate input
    const validationResult = LoginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Validate credentials
    const isValid = await validateCredentials(email, password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session token
    const token = await createSessionToken(email)

    // Set HTTP-only cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}

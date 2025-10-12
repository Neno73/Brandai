/**
 * Standard error response format for API routes
 */
export interface ApiError {
  error: string
  details?: string
  code?: string
}

/**
 * Create a standard error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: string
): Response {
  const error: ApiError = {
    error: message,
    details,
  }

  return Response.json(error, { status })
}

/**
 * Retry logic wrapper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      console.error(`Attempt ${attempt + 1} failed:`, error)

      if (attempt < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Retry failed')
}

/**
 * Log error with context
 */
export function logError(context: string, error: unknown) {
  console.error(`[${context}]`, error)

  if (error instanceof Error) {
    console.error('Stack:', error.stack)
  }
}

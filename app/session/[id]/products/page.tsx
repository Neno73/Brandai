'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductsDisplay } from '@/components/session/products-display'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Session } from '@/lib/types/session'

export default function ProductsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const sessionId = params.id

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const url = token
          ? `/api/sessions/${sessionId}?token=${token}`
          : `/api/sessions/${sessionId}`
        const response = await fetch(url)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to fetch session')
        }

        const data = await response.json()
        setSession(data)
        setError(null)

        // Redirect if products don't exist yet or session is not complete
        if (!data.product_images || data.product_images.length === 0) {
          router.push(`/session/${sessionId}${token ? `?token=${token}` : ''}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    // Poll for updates every 5 seconds if not complete
    const interval = setInterval(() => {
      if (session?.status !== 'complete') {
        fetchSession()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [sessionId, token, router, session?.status])

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background items-center justify-center">
        <div className="text-center">
          <h2 className="text-foreground text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-muted-foreground">Fetching your final products</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background items-center justify-center p-8">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Session not found'}</AlertDescription>
          </Alert>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProductsDisplay
      session={session}
    />
  )
}

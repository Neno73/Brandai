'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ConceptReview } from '@/components/session/concept-review'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Session } from '@/lib/types/session'

export default function ConceptPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const sessionId = params.id

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [regeneratingMotif, setRegeneratingMotif] = useState(false)
  const [proceeding, setProceeding] = useState(false)

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

        // Redirect if concept doesn't exist yet
        if (!data.concept) {
          router.push(`/session/${sessionId}${token ? `?token=${token}` : ''}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchSession()
    }, 5000)

    return () => clearInterval(interval)
  }, [sessionId, token, router])

  const handleRegenerateConcept = async () => {
    if (!session) return

    setRegenerating(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions/${sessionId}/concept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regenerate: true }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to regenerate concept')
      }

      const data = await response.json()

      // Update session with new concept
      setSession((prev) =>
        prev ? { ...prev, concept: data.concept } : prev
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to regenerate concept'
      )
    } finally {
      setRegenerating(false)
    }
  }

  const handleRegenerateMotif = async () => {
    if (!session) return

    setRegeneratingMotif(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions/${sessionId}/motif`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regenerate: true }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to regenerate motif')
      }

      const data = await response.json()

      // Update session with new motif
      setSession((prev) =>
        prev ? { ...prev, motif_image_url: data.motif_image_url } : prev
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to regenerate motif'
      )
    } finally {
      setRegeneratingMotif(false)
    }
  }

  const handleNext = async () => {
    if (!session) return

    setProceeding(true)
    setError(null)

    try {
      // Stage 3: Generate product mockups
      const response = await fetch(`/api/sessions/${sessionId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate products')
      }

      // Navigate to products page to see final results
      router.push(`/session/${sessionId}/products${token ? `?token=${token}` : ''}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to proceed'
      )
      setProceeding(false)
    }
  }

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background items-center justify-center">
        <div className="text-center">
          <h2 className="text-foreground text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-muted-foreground">Fetching your creative concept</p>
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
    <ConceptReview
      session={session}
      onRegenerateConcept={handleRegenerateConcept}
      onRegenerateMotif={handleRegenerateMotif}
      onNext={handleNext}
      regenerating={regenerating}
      regeneratingMotif={regeneratingMotif}
      proceeding={proceeding}
    />
  )
}

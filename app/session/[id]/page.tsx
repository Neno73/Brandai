'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionStatusPage } from '@/components/session-status-page'
import type { Session } from '@/lib/types/session'

export default function SessionPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const sessionId = params.id

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const url = token
          ? `/api/sessions/${sessionId}?token=${token}`
          : `/api/sessions/${sessionId}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Failed to fetch session')
        }

        const data = await response.json()
        setSession(data)
      } catch (err) {
        console.error('Error fetching session:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    // Poll for updates
    const interval = setInterval(() => {
      fetchSession()
    }, 5000)

    return () => clearInterval(interval)
  }, [sessionId, token])

  // Redirect logic based on session status
  useEffect(() => {
    if (!session || loading) return

    const tokenParam = token ? `?token=${token}` : ''

    // Redirect to concept page if concept is ready
    if (session.status === 'concept' && session.concept) {
      router.push(`/session/${sessionId}/concept${tokenParam}`)
      return
    }

    // Redirect to motif page if motif is ready
    if (session.status === 'motif' && session.motif_image_url) {
      router.push(`/session/${sessionId}/motif${tokenParam}`)
      return
    }

    // Redirect to products page if complete
    if (session.status === 'complete' && session.product_images && session.product_images.length > 0) {
      router.push(`/session/${sessionId}/products${tokenParam}`)
      return
    }
  }, [session, loading, router, sessionId, token])

  // Show SessionStatusPage for processing states (scraping, awaiting_approval, generating)
  return <SessionStatusPage sessionId={params.id} />
}

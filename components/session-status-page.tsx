'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Session, SessionStatus } from '@/lib/types/session'

interface SessionStatusPageProps {
  sessionId: string
}

const STATUS_INFO: Record<
  SessionStatus,
  { label: string; progress: number; description: string }
> = {
  scraping: {
    label: 'Analyzing Website',
    progress: 20,
    description: 'Extracting brand colors, fonts, and content...',
  },
  concept: {
    label: 'Generating Concept',
    progress: 40,
    description: 'Creating unique merchandise concept...',
  },
  motif: {
    label: 'Creating Motif',
    progress: 60,
    description: 'Generating custom design motif...',
  },
  products: {
    label: 'Building Mockups',
    progress: 80,
    description: 'Creating product mockups...',
  },
  complete: {
    label: 'Complete',
    progress: 100,
    description: 'Your designs are ready!',
  },
  failed: {
    label: 'Failed',
    progress: 0,
    description: 'Something went wrong. Please try again.',
  },
}

export function SessionStatusPage({ sessionId }: SessionStatusPageProps) {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}?token=${token}`)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to fetch session')
        }

        const data = await response.json()
        setSession(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    // Poll for updates if not complete or failed
    const interval = setInterval(() => {
      if (session && session.status !== 'complete' && session.status !== 'failed') {
        fetchSession()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [sessionId, token, session])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-4">
        <div className="container mx-auto max-w-4xl pt-16">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-4">
        <div className="container mx-auto max-w-4xl pt-16">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-4">
        <div className="container mx-auto max-w-4xl pt-16">
          <Alert>
            <AlertDescription>Session not found</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_INFO[session.status]
  const isComplete = session.status === 'complete'
  const isFailed = session.status === 'failed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-4">
      <div className="container mx-auto max-w-4xl pt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {session.scraped_data?.title || 'Your Designs'}
          </h1>
          <p className="text-purple-200">Session ID: {sessionId.slice(0, 8)}...</p>
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {statusInfo.label}
              </CardTitle>
              <Badge
                variant={
                  isComplete ? 'default' : isFailed ? 'destructive' : 'secondary'
                }
              >
                {session.status}
              </Badge>
            </div>
            <CardDescription>{statusInfo.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={statusInfo.progress} className="h-3" />
            {!isComplete && !isFailed && (
              <p className="text-sm text-gray-500 mt-2">
                This page will auto-refresh. Please don&apos;t close it.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Concept */}
        {session.concept && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>💡 Design Concept</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{session.concept}</p>
            </CardContent>
          </Card>
        )}

        {/* Product Mockups */}
        {isComplete && session.product_images && session.product_images.length > 0 && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>👕 Product Mockups</CardTitle>
                <CardDescription>
                  Your custom designs applied to {session.product_images.length} products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {session.product_images.map((product) => (
                    <div key={product.product_id} className="border rounded-lg p-4">
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold mb-1">{product.product_name}</h3>
                      <p className="text-xs text-gray-500">
                        {product.print_zones.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Download Button */}
            <div className="flex justify-center">
              <Button size="lg" asChild>
                <a
                  href={`/api/sessions/${sessionId}/pdf`}
                  download
                  className="text-lg"
                >
                  📥 Download Complete Design Package (PDF)
                </a>
              </Button>
            </div>
          </>
        )}

        {/* Failed State */}
        {isFailed && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Processing failed.</strong> Please try again or contact support if
              the issue persists.
            </AlertDescription>
          </Alert>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <Button variant="ghost" asChild>
            <a href="/" className="text-purple-200 hover:text-white">
              ← Create Another Design
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

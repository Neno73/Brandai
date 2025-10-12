'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ColorPicker } from '@/components/session/color-picker'
import { LogoUploader } from '@/components/session/logo-uploader'
import { MotifDisplay } from '@/components/session/motif-display'
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
  const [regenerating, setRegenerating] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [autoProceeding, setAutoProceeding] = useState(false)
  const [continuingProcessing, setContinuingProcessing] = useState(false)
  const [editMode, setEditMode] = useState(false)

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

  // Timer countdown effect
  useEffect(() => {
    // Only start timer when status is 'concept' and concept exists
    if (session?.status === 'concept' && session.concept) {
      // Initialize timer to 3 minutes (180 seconds) if not set
      if (timeRemaining === null) {
        setTimeRemaining(180)
      }
    }
  }, [session?.status, session?.concept, timeRemaining])

  // Countdown timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || autoProceeding) {
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, autoProceeding])

  // Auto-proceed when timer reaches 0
  useEffect(() => {
    if (timeRemaining === 0 && session?.status === 'concept' && !autoProceeding) {
      handleAutoProceed()
    }
  }, [timeRemaining, session?.status, autoProceeding])

  const handleAutoProceed = async () => {
    if (!session) return

    setAutoProceeding(true)
    setError(null)

    try {
      // Trigger background processing to continue with motif and products
      const response = await fetch(`/api/sessions/${sessionId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to proceed with processing')
      }

      // Session will update automatically via polling
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to auto-proceed'
      )
      setAutoProceeding(false)
    }
  }

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

      // Reset timer when concept is regenerated
      setTimeRemaining(180)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to regenerate concept'
      )
    } finally {
      setRegenerating(false)
    }
  }

  const handleColorChange = async (newColors: string[]) => {
    if (!session) return

    setError(null)

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scraped_data: {
            colors: newColors,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update colors')
      }

      const data = await response.json()

      // Update session with new colors
      setSession((prev) =>
        prev
          ? {
              ...prev,
              scraped_data: {
                ...prev.scraped_data,
                colors: newColors,
              },
            }
          : prev
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update colors')
    }
  }

  const handleLogoUpload = async (logoUrl: string) => {
    if (!session) return

    setError(null)

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scraped_data: {
            logo: logoUrl,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update logo')
      }

      const data = await response.json()

      // Update session with new logo
      setSession((prev) =>
        prev
          ? {
              ...prev,
              scraped_data: {
                ...prev.scraped_data,
                logo: logoUrl,
              },
            }
          : prev
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update logo')
      throw err // Re-throw so LogoUploader can handle it
    }
  }

  const handleContinueProcessing = async () => {
    if (!session) return

    setContinuingProcessing(true)
    setError(null)

    try {
      // Trigger background processing to continue with concept generation
      const response = await fetch(`/api/sessions/${sessionId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to continue processing')
      }

      // Update session to remove manual input flags
      setSession((prev) =>
        prev
          ? {
              ...prev,
              scraped_data: {
                ...prev.scraped_data,
                requires_manual_input: false,
                missing_fields: [],
              },
            }
          : prev
      )

      // Session will update automatically via polling
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to continue processing'
      )
      setContinuingProcessing(false)
    }
  }

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
  const canEdit = isComplete || editMode

  // Check if manual input is required
  const requiresManualInput = session.scraped_data?.requires_manual_input === true
  const missingFields = session.scraped_data?.missing_fields || []

  // Check if all required fields are now filled
  const hasLogo = session.scraped_data?.logo && session.scraped_data.logo !== ''
  const hasMinColors = session.scraped_data?.colors && session.scraped_data.colors.length >= 2

  const canProceed = requiresManualInput &&
    (missingFields.includes('logo') ? hasLogo : true) &&
    (missingFields.includes('colors') ? hasMinColors : true)

  // Format timer display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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

        {/* Manual Input Required Warning */}
        {requiresManualInput && (
          <Card className="mb-8 border-amber-500 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900 flex items-center gap-2">
                ⚠️ Manual Input Required
              </CardTitle>
              <CardDescription className="text-amber-800">
                We couldn't automatically extract some required information from your website. Please provide the missing details below to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm font-medium text-amber-900">
                  Missing information:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                  {missingFields.map((field) => (
                    <li key={field}>
                      {field === 'logo' && 'Brand logo (upload below)'}
                      {field === 'colors' && 'Brand colors (minimum 2 colors required)'}
                    </li>
                  ))}
                </ul>

                {canProceed && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <Button
                      onClick={handleContinueProcessing}
                      disabled={continuingProcessing}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      {continuingProcessing ? 'Processing...' : '✓ Continue with Design Generation'}
                    </Button>
                    <p className="text-xs text-amber-700 mt-2 text-center">
                      All required information has been provided. Click to continue.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brand Colors */}
        {(session.scraped_data?.colors && session.scraped_data.colors.length > 0) || requiresManualInput ? (
          <Card className={`mb-8 ${missingFields.includes('colors') ? 'border-red-500 bg-red-50' : ''}`}>
            <CardHeader>
              <CardTitle className={missingFields.includes('colors') ? 'text-red-900' : ''}>
                🎨 Brand Colors {missingFields.includes('colors') && '(Required)'}
              </CardTitle>
              <CardDescription className={missingFields.includes('colors') ? 'text-red-700' : ''}>
                {missingFields.includes('colors')
                  ? 'Add at least 2 brand colors to continue'
                  : 'Edit your brand colors to refine the design concept'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ColorPicker
                colors={session.scraped_data?.colors || []}
                onChange={handleColorChange}
                disabled={session.status === 'failed' || (session.status === 'complete' && !editMode)}
              />
            </CardContent>
          </Card>
        ) : null}

        {/* Brand Logo */}
        <Card className={`mb-8 ${missingFields.includes('logo') ? 'border-red-500 bg-red-50' : ''}`}>
          <CardHeader>
            <CardTitle className={missingFields.includes('logo') ? 'text-red-900' : ''}>
              🏢 Brand Logo {missingFields.includes('logo') && '(Required)'}
            </CardTitle>
            <CardDescription className={missingFields.includes('logo') ? 'text-red-700' : ''}>
              {missingFields.includes('logo')
                ? 'Upload your brand logo to continue (minimum 500x500px)'
                : 'Upload or replace your brand logo to customize the design'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LogoUploader
              currentLogo={typeof session.scraped_data?.logo === 'string' ? session.scraped_data.logo : session.scraped_data?.logo?.stored_url}
              onUpload={handleLogoUpload}
              disabled={session.status === 'failed' || (session.status === 'complete' && !editMode)}
            />
          </CardContent>
        </Card>

        {/* Edit Mode Toggle for Completed Sessions */}
        {isComplete && !editMode && (
          <Card className="mb-8 border-blue-500 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Want to make changes?</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Enable edit mode to regenerate concepts, motifs, or adjust colors
                  </p>
                </div>
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  className="bg-white"
                >
                  ✏️ Enable Edit Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {editMode && isComplete && (
          <Card className="mb-8 border-amber-500 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-amber-900">🔄 Edit Mode Active</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Make your changes and regenerate designs as needed
                  </p>
                </div>
                <Button
                  onClick={() => setEditMode(false)}
                  variant="outline"
                  size="sm"
                  className="bg-white"
                >
                  Exit Edit Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Concept */}
        {session.concept && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>💡 Design Concept</CardTitle>
                {session.status !== 'failed' && (session.status !== 'complete' || editMode) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateConcept}
                    disabled={regenerating}
                  >
                    {regenerating ? 'Generating...' : '🔄 Regenerate'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{session.concept}</p>

              {/* Timer Display */}
              {session.status === 'concept' && timeRemaining !== null && timeRemaining > 0 && !autoProceeding && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Review Time Remaining
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Processing will continue automatically when timer expires
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 ml-4">
                      {formatTime(timeRemaining)}
                    </div>
                  </div>
                </div>
              )}

              {/* Auto-proceeding indicator */}
              {autoProceeding && (
                <div className="mt-4">
                  <Progress value={undefined} className="h-2" />
                  <p className="text-sm text-gray-500 mt-2">
                    Proceeding to motif and product generation...
                  </p>
                </div>
              )}

              {/* Regenerating indicator */}
              {regenerating && (
                <div className="mt-4">
                  <Progress value={undefined} className="h-2" />
                  <p className="text-sm text-gray-500 mt-2">
                    Creating a new concept variation...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Design Motif */}
        {session.motif_image_url && (
          <MotifDisplay
            motifImageUrl={session.motif_image_url}
            sessionId={sessionId}
            onRegenerateComplete={async () => {
              // Refresh session data after motif regeneration
              const response = await fetch(`/api/sessions/${sessionId}?token=${token}`)
              if (response.ok) {
                const data = await response.json()
                setSession(data)
                // Reset timer when motif is regenerated
                if (data.status === 'motif') {
                  setTimeRemaining(180)
                }
              }
            }}
            disabled={session.status === 'failed' || (session.status === 'complete' && !editMode)}
          />
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

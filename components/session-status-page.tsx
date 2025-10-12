'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeToggle } from '@/components/theme-toggle'
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
  const [email, setEmail] = useState('')
  const [emailSending, setEmailSending] = useState(false)
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
    // Start timer when status is 'concept' and concept exists, or when status is 'motif' and motif exists
    if ((session?.status === 'concept' && session.concept) || (session?.status === 'motif' && session.motif_image_url)) {
      // Initialize timer to 3 minutes (180 seconds) if not set
      if (timeRemaining === null) {
        setTimeRemaining(180)
      }
    }
  }, [session?.status, session?.concept, session?.motif_image_url, timeRemaining])

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
    if (timeRemaining === 0 && (session?.status === 'concept' || session?.status === 'motif') && !autoProceeding) {
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

  const handleEmailSubmit = async () => {
    if (!email) return

    setEmailSending(true)
    setError(null)

    try {
      // Update session with email and trigger email notification
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          send_notification: true,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save email')
      }

      alert('Email saved! We will notify you when your designs are ready.')
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save email')
    } finally {
      setEmailSending(false)
    }
  }

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background">
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-border px-10 py-3">
            <div className="flex items-center gap-4 text-foreground">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">BrendAI</h2>
            </div>
          </header>
          <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
            <div className="flex flex-col max-w-[960px] flex-1">
              <h2 className="text-foreground tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Loading...</h2>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background">
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-border px-10 py-3">
            <div className="flex items-center gap-4 text-foreground">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">BrendAI</h2>
            </div>
          </header>
          <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
            <div className="flex flex-col max-w-[960px] flex-1">
              <Alert variant="destructive" className="mt-8">
                <AlertDescription>{error || 'Session not found'}</AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_INFO[session.status]
  const isComplete = session.status === 'complete'
  const isFailed = session.status === 'failed'

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
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-border px-10 py-3">
          <div className="flex items-center gap-4 text-foreground">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">BrendAI</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-foreground text-sm font-medium leading-normal" href="/">Home</a>
              <a className="text-foreground text-sm font-medium leading-normal" href="#dashboard">Dashboard</a>
              <a className="text-foreground text-sm font-medium leading-normal" href="#merchandise">Merchandise</a>
              <a className="text-foreground text-sm font-medium leading-normal" href="#orders">Orders</a>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col max-w-[960px] flex-1">
            {/* Title */}
            <h2 className="text-foreground tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              {isComplete ? 'Your designs are ready!' : isFailed ? 'Processing failed' : 'Analyzing your website...'}
            </h2>

            {/* Progress Section */}
            <div className="flex flex-col gap-3 p-4">
              <div className="flex gap-6 justify-between">
                <p className="text-foreground text-base font-medium leading-normal">{statusInfo.label}</p>
                {timeRemaining !== null && timeRemaining > 0 && (session.status === 'concept' || session.status === 'motif') && (
                  <p className="text-muted-foreground text-base font-medium leading-normal">{formatTime(timeRemaining)}</p>
                )}
              </div>
              <div className="rounded bg-border">
                <div className="h-2 rounded bg-primary transition-all duration-500" style={{ width: `${statusInfo.progress}%` }}></div>
              </div>
            </div>

            {/* Description */}
            <p className="text-foreground text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              {statusInfo.description}
            </p>

            {/* Error Alert */}
            {error && (
              <div className="px-4 py-3">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Manual Input Warning */}
            {requiresManualInput && (
              <div className="p-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h3 className="text-foreground font-bold mb-2">⚠️ Manual Input Required</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    We couldn&apos;t automatically extract some required information. Please provide:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
                    {missingFields.map((field) => (
                      <li key={field}>
                        {field === 'logo' && 'Brand logo (upload below)'}
                        {field === 'colors' && 'Brand colors (minimum 2 required)'}
                      </li>
                    ))}
                  </ul>
                  {canProceed && (
                    <Button
                      onClick={handleContinueProcessing}
                      disabled={continuingProcessing}
                      className="w-full"
                    >
                      {continuingProcessing ? 'Processing...' : 'Continue with Design Generation'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Brand Colors */}
            {(session.scraped_data?.colors && session.scraped_data.colors.length > 0) || requiresManualInput ? (
              <div className="p-4">
                <div className={`border rounded-lg p-4 ${missingFields.includes('colors') ? 'border-destructive bg-destructive/10' : 'border-border bg-card'}`}>
                  <h3 className="text-foreground font-bold mb-2">
                    🎨 Brand Colors {missingFields.includes('colors') && '(Required)'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {missingFields.includes('colors')
                      ? 'Add at least 2 brand colors to continue'
                      : 'Edit your brand colors to refine the design'}
                  </p>
                  <ColorPicker
                    colors={session.scraped_data?.colors || []}
                    onChange={handleColorChange}
                    disabled={isFailed || (isComplete && !editMode)}
                  />
                </div>
              </div>
            ) : null}

            {/* Brand Logo */}
            <div className="p-4">
              <div className={`border rounded-lg p-4 ${missingFields.includes('logo') ? 'border-destructive bg-destructive/10' : 'border-border bg-card'}`}>
                <h3 className="text-foreground font-bold mb-2">
                  🏢 Brand Logo {missingFields.includes('logo') && '(Required)'}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {missingFields.includes('logo')
                    ? 'Upload your brand logo to continue'
                    : 'Upload or replace your brand logo'}
                </p>
                <LogoUploader
                  currentLogo={typeof session.scraped_data?.logo === 'string' ? session.scraped_data.logo : session.scraped_data?.logo?.stored_url}
                  onUpload={handleLogoUpload}
                  disabled={isFailed || (isComplete && !editMode)}
                />
              </div>
            </div>

            {/* Concept - Detailed View */}
            {session.concept && (
              <div className="p-4">
                <div className="flex flex-wrap justify-between gap-3 mb-4">
                  <p className="text-foreground tracking-light text-[32px] font-bold leading-tight min-w-72">Creative Concept</p>
                </div>

                {/* Concept Description */}
                <div className="space-y-4 mb-6">
                  {session.concept.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-foreground text-base font-normal leading-normal">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Brand Assets Section */}
                <h3 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">Brand Assets</h3>

                {/* Logo Input */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-foreground text-base font-medium leading-normal pb-2">Logo</p>
                    <Input
                      className="h-14 text-base"
                      value={typeof session.scraped_data?.logo === 'string' ? session.scraped_data.logo : session.scraped_data?.logo?.stored_url || ''}
                      readOnly
                      placeholder="Logo URL"
                    />
                  </label>
                </div>

                {/* Color Swatches */}
                {session.scraped_data?.colors && session.scraped_data.colors.length > 0 && (
                  <div className="flex flex-wrap gap-5 py-4">
                    {session.scraped_data.colors.map((color, index) => (
                      <div
                        key={index}
                        className="size-10 rounded-full border-2 border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}

                {/* Font Selector (placeholder) */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-foreground text-base font-medium leading-normal pb-2">Font</p>
                    <Input
                      className="h-14 text-base"
                      value={session.scraped_data?.fonts?.[0] || 'Work Sans'}
                      readOnly
                    />
                  </label>
                </div>

                {/* Sentiment Analysis Section */}
                {(session.scraped_data?.sentiment || session.scraped_data?.tone || session.scraped_data?.audience) && (
                  <>
                    <h3 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">Brand Analysis</h3>
                    <div className="grid grid-cols-[20%_1fr] gap-x-6">
                      {session.scraped_data?.sentiment && (
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-border py-5">
                          <p className="text-muted-foreground text-sm font-normal leading-normal">Sentiment</p>
                          <p className="text-foreground text-sm font-normal leading-normal">{session.scraped_data.sentiment}</p>
                        </div>
                      )}
                      {session.scraped_data?.tone && (
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-border py-5">
                          <p className="text-muted-foreground text-sm font-normal leading-normal">Tone</p>
                          <p className="text-foreground text-sm font-normal leading-normal">{session.scraped_data.tone}</p>
                        </div>
                      )}
                      {session.scraped_data?.audience && (
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-border py-5">
                          <p className="text-muted-foreground text-sm font-normal leading-normal">Audience</p>
                          <p className="text-foreground text-sm font-normal leading-normal">{session.scraped_data.audience}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex justify-stretch pt-6">
                  <div className="flex flex-1 gap-3 flex-wrap justify-start">
                    {!isFailed && (!isComplete || editMode) && (
                      <Button
                        onClick={handleRegenerateConcept}
                        disabled={regenerating}
                        className="min-w-[84px] h-10 px-4"
                      >
                        {regenerating ? 'Generating...' : 'Regenerate Concept'}
                      </Button>
                    )}
                    {!isFailed && (!isComplete || editMode) && timeRemaining !== null && (
                      <Button
                        onClick={handleAutoProceed}
                        disabled={autoProceeding}
                        variant="secondary"
                        className="min-w-[84px] h-10 px-4"
                      >
                        {autoProceeding ? 'Processing...' : 'Next'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Regenerating indicator */}
                {regenerating && (
                  <div className="mt-4">
                    <div className="rounded bg-border">
                      <div className="h-2 rounded bg-primary animate-pulse"></div>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">Creating a new concept variation...</p>
                  </div>
                )}

                {/* Auto-proceeding indicator */}
                {autoProceeding && (
                  <div className="mt-4">
                    <div className="rounded bg-border">
                      <div className="h-2 rounded bg-primary animate-pulse"></div>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">Proceeding to motif and product generation...</p>
                  </div>
                )}
              </div>
            )}

            {/* Design Motif */}
            {session.motif_image_url && (
              <MotifDisplay
                motifImageUrl={session.motif_image_url}
                sessionId={sessionId}
                onRegenerateComplete={async () => {
                  const response = await fetch(`/api/sessions/${sessionId}?token=${token}`)
                  if (response.ok) {
                    const data = await response.json()
                    setSession(data)
                    if (data.status === 'motif') {
                      setTimeRemaining(180)
                    }
                  }
                }}
                onApplyToMerchandise={handleAutoProceed}
                disabled={isFailed || (isComplete && !editMode)}
                timeRemaining={session.status === 'motif' ? timeRemaining : null}
                autoProceeding={autoProceeding}
                regenerating={false}
              />
            )}

            {/* Product Mockups */}
            {isComplete && session.product_images && session.product_images.length > 0 && (
              <>
                <div className="flex flex-wrap justify-between gap-3 p-4">
                  <div className="flex min-w-72 flex-col gap-3">
                    <p className="text-foreground tracking-light text-[32px] font-bold leading-tight">Generated Products</p>
                    <p className="text-muted-foreground text-sm font-normal leading-normal">
                      These mockups are automatically generated based on your brand elements.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
                  {session.product_images.map((product) => (
                    <div key={product.product_id} className="flex flex-col gap-3">
                      <div
                        className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-lg"
                        style={{ backgroundImage: `url("${product.image_url}")` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <div className="flex w-full flex-1 items-stretch rounded-lg">
                      <Input
                        type="email"
                        placeholder="Enter your email address and we will notify you with a link to see your designs."
                        className="h-14 text-base rounded-r-none border-r-0 pr-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && email) {
                            handleEmailSubmit()
                          }
                        }}
                        disabled={emailSending}
                      />
                      <div className="flex border border-border bg-background items-center justify-center pr-[15px] rounded-r-lg border-l-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" className="text-muted-foreground">
                          <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z" />
                        </svg>
                      </div>
                    </div>
                  </label>
                </div>
              </>
            )}

            {/* Edit Mode Toggle */}
            {isComplete && (
              <div className="p-4">
                <Button
                  onClick={() => setEditMode(!editMode)}
                  variant={editMode ? 'secondary' : 'outline'}
                  className="w-full"
                >
                  {editMode ? 'Exit Edit Mode' : '✏️ Enable Edit Mode'}
                </Button>
              </div>
            )}

            {/* Email Input */}
            {!isComplete && (
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3 mx-auto w-full">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-foreground text-base font-medium leading-normal pb-2">Email Address</p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Get notified when designs are ready"
                      className="h-14 text-base"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={emailSending}
                    />
                    <Button
                      onClick={handleEmailSubmit}
                      disabled={emailSending || !email}
                      className="h-14 px-6"
                    >
                      {emailSending ? 'Saving...' : 'Notify Me'}
                    </Button>
                  </div>
                </label>
              </div>
            )}

            {/* Footer Link */}
            <div className="text-center mt-8">
              <Button variant="ghost" asChild>
                <a href="/" className="text-muted-foreground hover:text-foreground">
                  ← Create Another Design
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeToggle } from '@/components/theme-toggle'
import { ColorPicker } from '@/components/session/color-picker'
import { LogoUploader } from '@/components/session/logo-uploader'
import { BrandDataReview } from '@/components/session/brand-data-review'
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
  awaiting_approval: {
    label: 'Review Brand Data',
    progress: 25,
    description: 'Please review and approve the extracted brand information',
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
  const [continuingProcessing, setContinuingProcessing] = useState(false)
  const [proceedingToConceptGen, setProceedingToConceptGen] = useState(false)

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    // Poll for updates if not complete or failed
    const interval = setInterval(() => {
      fetchSession()
    }, 5000)

    return () => clearInterval(interval)
  }, [sessionId, token])

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

  // Handler for updating individual brand data fields
  const handleBrandDataUpdate = async (field: string, value: any) => {
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
            [field]: value,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to update ${field}`)
      }

      // Update local session state
      setSession((prev) =>
        prev
          ? {
              ...prev,
              scraped_data: {
                ...prev.scraped_data,
                [field]: value,
              },
            }
          : prev
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update ${field}`)
      throw err
    }
  }

  // Handler for proceeding from brand data review to concept generation
  const handleProceedToConcept = async () => {
    if (!session) return

    setProceedingToConceptGen(true)
    setError(null)

    try {
      // Call concept generation endpoint
      const conceptResponse = await fetch(`/api/sessions/${sessionId}/concept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regenerate: false }),
      })

      if (!conceptResponse.ok) {
        const data = await conceptResponse.json()
        throw new Error(data.error || 'Failed to generate concept')
      }

      // Call motif generation endpoint
      const motifResponse = await fetch(`/api/sessions/${sessionId}/motif`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regenerate: false }),
      })

      if (!motifResponse.ok) {
        const data = await motifResponse.json()
        throw new Error(data.error || 'Failed to generate motif')
      }

      // Session will update automatically via polling
      // Frontend will navigate to concept page when status changes
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to proceed to concept generation'
      )
      setProceedingToConceptGen(false)
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
  const isAwaitingApproval = session.status === 'awaiting_approval'

  // Check if manual input is required
  const requiresManualInput = session.scraped_data?.requires_manual_input === true
  const missingFields = session.scraped_data?.missing_fields || []

  // Check if all required fields are now filled
  const hasLogo = session.scraped_data?.logo && session.scraped_data.logo !== ''
  const hasMinColors = session.scraped_data?.colors && session.scraped_data.colors.length >= 2

  const canProceed = requiresManualInput &&
    (missingFields.includes('logo') ? hasLogo : true) &&
    (missingFields.includes('colors') ? hasMinColors : true)

  // Show brand data review page when status is awaiting_approval
  if (isAwaitingApproval && session.scraped_data) {
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
              <ThemeToggle />
            </div>
          </header>

          {/* Main Content - Brand Data Review */}
          <BrandDataReview
            session={session}
            onNext={handleProceedToConcept}
            onUpdate={handleBrandDataUpdate}
            nextLoading={proceedingToConceptGen}
          />
        </div>
      </div>
    )
  }

  // SessionStatusPage should only show processing states
  // Dedicated pages handle concept, motif, and products display
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
                    disabled={isFailed}
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
                  disabled={isFailed}
                />
              </div>
            </div>

            {/* Email Notification Input */}
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

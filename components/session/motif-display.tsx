'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

interface MotifDisplayProps {
  motifImageUrl?: string
  motifPrompt?: string
  sessionId: string
  onRegenerateComplete?: () => void
  onApplyToMerchandise?: () => void
  disabled?: boolean
  timeRemaining?: number | null
  autoProceeding?: boolean
  regenerating?: boolean
}

export function MotifDisplay({
  motifImageUrl,
  motifPrompt,
  sessionId,
  onRegenerateComplete,
  onApplyToMerchandise,
  disabled = false,
  timeRemaining = null,
  autoProceeding = false,
  regenerating = false,
}: MotifDisplayProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailSending, setEmailSending] = useState(false)

  const handleRegenerateMotif = async () => {
    setIsRegenerating(true)
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

      // Notify parent component to refresh session data
      if (onRegenerateComplete) {
        onRegenerateComplete()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate motif')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleApplyToMerchandise = () => {
    if (onApplyToMerchandise) {
      onApplyToMerchandise()
    }
  }

  const handleEmailSubmit = async () => {
    if (!email) return

    setEmailSending(true)
    setError(null)

    try {
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

  // Format timer display (MM:SS)
  const formatTime = (seconds: number): { minutes: string; seconds: string } => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return {
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    }
  }

  if (!motifImageUrl && !motifPrompt) {
    return null
  }

  const timer = timeRemaining !== null && timeRemaining > 0 ? formatTime(timeRemaining) : null

  const isActuallyRegenerating = regenerating || isRegenerating

  return (
    <>
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-foreground tracking-light text-[32px] font-bold leading-tight">Visual Motif</p>
          <p className="text-muted-foreground text-sm font-normal leading-normal">
            This cohesive visual motif captures the essence of your brand, ready to be applied to merchandise designs.
          </p>
        </div>
      </div>

      {/* Motif Image */}
      {motifImageUrl && (
        <div className="flex w-full grow bg-background p-4">
          <div className="w-full gap-1 overflow-hidden bg-background aspect-[3/2] rounded-lg flex">
            <div className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1 relative">
              <Image
                src={motifImageUrl}
                alt="Visual Motif"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-foreground text-base font-normal leading-normal pb-3 pt-1 px-4">
        Our design system has analyzed your website and identified key visual elements that resonate with your brand identity. These elements, including color palettes,
        typography, and graphic styles, have been harmonized to create a cohesive motif. This motif will ensure that all your branded merchandise maintains a consistent and
        recognizable aesthetic, reinforcing your brand&apos;s presence and message.
      </p>

      {/* Action Buttons */}
      <div className="flex justify-stretch">
        <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
          {!disabled && (
            <Button
              onClick={handleRegenerateMotif}
              disabled={isActuallyRegenerating}
              className="min-w-[84px] h-10 px-4"
            >
              {isActuallyRegenerating ? 'Generating...' : 'Regenerate Motif'}
            </Button>
          )}
          {!disabled && timer && (
            <Button
              onClick={handleApplyToMerchandise}
              disabled={autoProceeding}
              variant="secondary"
              className="min-w-[84px] h-10 px-4"
            >
              {autoProceeding ? 'Processing...' : 'Apply to Merchandise'}
            </Button>
          )}
        </div>
      </div>

      {/* Countdown Timer */}
      {timer && (
        <div className="flex gap-4 py-6 px-4">
          <div className="flex grow basis-0 flex-col items-stretch gap-4">
            <div className="flex h-14 grow items-center justify-center rounded-lg px-3 bg-secondary">
              <p className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">{timer.minutes}</p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-foreground text-sm font-normal leading-normal">Minutes</p>
            </div>
          </div>
          <div className="flex grow basis-0 flex-col items-stretch gap-4">
            <div className="flex h-14 grow items-center justify-center rounded-lg px-3 bg-secondary">
              <p className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">{timer.seconds}</p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-foreground text-sm font-normal leading-normal">Seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Email Input */}
      {!disabled && (
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-foreground text-base font-medium leading-normal pb-2">Email</p>
            <Input
              type="email"
              placeholder="Enter your email address and we will notify you with a link to see your designs."
              className="h-14 text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && email) {
                  handleEmailSubmit()
                }
              }}
              disabled={emailSending}
            />
          </label>
        </div>
      )}

      {/* Regenerating indicator */}
      {isActuallyRegenerating && (
        <div className="px-4 py-3">
          <div className="rounded bg-border">
            <div className="h-2 rounded bg-primary animate-pulse"></div>
          </div>
          <p className="text-muted-foreground text-sm mt-2">Creating a new motif variation...</p>
        </div>
      )}

      {/* Auto-proceeding indicator */}
      {autoProceeding && (
        <div className="px-4 py-3">
          <div className="rounded bg-border">
            <div className="h-2 rounded bg-primary animate-pulse"></div>
          </div>
          <p className="text-muted-foreground text-sm mt-2">Proceeding to product generation...</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-4 py-3">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}
    </>
  )
}

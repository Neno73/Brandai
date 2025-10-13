'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Session } from '@/lib/types/session'

interface ConceptReviewProps {
  session: Session
  onRegenerateConcept: () => Promise<void>
  onNext: () => Promise<void>
  regenerating: boolean
  proceeding: boolean
}

export function ConceptReview({
  session,
  onRegenerateConcept,
  onNext,
  regenerating,
  proceeding,
}: ConceptReviewProps) {
  const [email, setEmail] = useState(session.email || '')
  const [emailSaving, setEmailSaving] = useState(false)

  const handleEmailSave = async () => {
    if (!email) return

    setEmailSaving(true)
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to save email')
      }

      alert('Email saved! We will notify you when your designs are ready.')
    } catch (error) {
      console.error('Failed to save email:', error)
      alert('Failed to save email. Please try again.')
    } finally {
      setEmailSaving(false)
    }
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
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col max-w-[960px] flex-1">
            {/* Title */}
            <h1 className="text-foreground text-[32px] font-bold leading-tight px-4 pt-8 pb-6">
              Creative Concept
            </h1>

            {/* Concept Description */}
            <div className="px-4 pb-8">
              <div className="space-y-4">
                {session.concept?.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-foreground text-base font-normal leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Brand Assets Section */}
            <div className="px-4 pb-8">
              <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] pb-4">
                Brand Assets
              </h2>

              {/* Logo */}
              <div className="pb-6">
                <label className="flex flex-col gap-2 max-w-[480px]">
                  <p className="text-foreground text-base font-medium leading-normal">Logo</p>
                  <Input
                    className="h-14 text-base bg-secondary"
                    value={
                      typeof session.scraped_data?.logo === 'string'
                        ? session.scraped_data.logo
                        : session.scraped_data?.logo?.stored_url || 'No logo uploaded'
                    }
                    readOnly
                    placeholder="Logo URL"
                  />
                </label>
              </div>

              {/* Colors */}
              {session.scraped_data?.colors && session.scraped_data.colors.length > 0 && (
                <div className="flex items-center gap-4 pb-4">
                  <p className="text-foreground text-base font-medium leading-normal min-w-[100px]">Colors</p>
                  <div className="flex gap-3">
                    {session.scraped_data.colors.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className="size-10 rounded-full border-2 border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Font */}
              {session.scraped_data?.fonts && session.scraped_data.fonts.length > 0 && (
                <div className="pt-4">
                  <label className="flex flex-col gap-2 max-w-[480px]">
                    <p className="text-foreground text-base font-medium leading-normal">Font</p>
                    <Input
                      className="h-14 text-base bg-secondary"
                      value={session.scraped_data.fonts[0]}
                      readOnly
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Sentiment Analysis Section */}
            {(session.scraped_data?.sentiment ||
              session.scraped_data?.tone ||
              session.scraped_data?.audience) && (
              <div className="px-4 pb-8">
                <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] pb-4">
                  Sentiment Analysis
                </h2>

                <div className="grid grid-cols-[20%_1fr] gap-x-6 max-w-[600px]">
                  {session.scraped_data.sentiment && (
                    <div className="col-span-2 grid grid-cols-subgrid border-t border-border py-5">
                      <p className="text-muted-foreground text-sm font-normal leading-normal">Sentiment</p>
                      <p className="text-foreground text-sm font-normal leading-normal">
                        {session.scraped_data.sentiment}
                      </p>
                    </div>
                  )}
                  {session.scraped_data.tone && (
                    <div className="col-span-2 grid grid-cols-subgrid border-t border-border py-5">
                      <p className="text-muted-foreground text-sm font-normal leading-normal">Tone</p>
                      <p className="text-foreground text-sm font-normal leading-normal">
                        {session.scraped_data.tone}
                      </p>
                    </div>
                  )}
                  {session.scraped_data.audience && (
                    <div className="col-span-2 grid grid-cols-subgrid border-t border-border py-5">
                      <p className="text-muted-foreground text-sm font-normal leading-normal">Audience</p>
                      <p className="text-foreground text-sm font-normal leading-normal">
                        {session.scraped_data.audience}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 px-4 pb-8">
              <Button
                onClick={onRegenerateConcept}
                disabled={regenerating || proceeding}
                variant="destructive"
                className="h-10 px-4"
              >
                {regenerating ? 'Regenerating...' : 'Regenerate Concept'}
              </Button>
              <Button
                onClick={onNext}
                disabled={regenerating || proceeding}
                variant="outline"
                className="h-10 px-4"
              >
                {proceeding ? 'Processing...' : 'Next'}
              </Button>
            </div>

            {/* Progress Indicator */}
            {(regenerating || proceeding) && (
              <div className="px-4 pb-8">
                <div className="rounded bg-border">
                  <div className="h-2 rounded bg-primary animate-pulse"></div>
                </div>
                <p className="text-muted-foreground text-sm mt-2">
                  {regenerating ? 'Creating a new concept variation...' : 'Proceeding to motif generation...'}
                </p>
              </div>
            )}

            {/* Email Input */}
            <div className="px-4 pb-8">
              <label className="flex flex-col gap-2 max-w-[480px]">
                <p className="text-foreground text-base font-medium leading-normal">
                  Enter your email address and we will notify you with a link to see your designs.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="h-14 text-base flex-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={emailSaving}
                  />
                  {email && email !== session.email && (
                    <Button
                      onClick={handleEmailSave}
                      disabled={emailSaving}
                      className="h-14 px-6"
                    >
                      {emailSaving ? 'Saving...' : 'Save'}
                    </Button>
                  )}
                </div>
              </label>
            </div>

            {/* Footer Links */}
            <div className="flex justify-center gap-8 px-4 py-8 border-t border-border">
              <a href="#terms" className="text-muted-foreground hover:text-foreground text-sm">
                Terms of Service
              </a>
              <a href="#privacy" className="text-muted-foreground hover:text-foreground text-sm">
                Privacy Policy
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground text-sm">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

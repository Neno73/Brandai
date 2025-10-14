'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Envelope } from '@phosphor-icons/react'
import { ThemeToggle } from '@/components/theme-toggle'

export function LandingPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailOption, setShowEmailOption] = useState(false)

  const handleCreateBrandKit = async () => {
    if (!url) {
      setError('Please enter a website URL')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email: email || `temp-${Date.now()}@brendai.com` }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session')
      }

      // If email provided, show success message
      // Otherwise, redirect to session page to watch progress
      if (email) {
        setShowEmailOption(false)
        alert('Check your email! We\'ll send you a magic link to view your designs.')
        setUrl('')
        setEmail('')
      } else {
        // Redirect to session page to watch in real-time
        router.push(`/session/${data.sessionId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
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
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-foreground text-sm font-medium leading-normal" href="/admin">Dashboard</a>
              <a className="text-foreground text-sm font-medium leading-normal" href="#product">Product</a>
              <a className="text-foreground text-sm font-medium leading-normal" href="#pricing">Pricing</a>
              <a className="text-foreground text-sm font-medium leading-normal" href="#blog">Blog</a>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="secondary"
                className="min-w-[84px] h-10 px-4 text-sm font-bold"
                onClick={() => router.push('/admin/login')}
              >
                Log in
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col max-w-[960px] flex-1">
            <h2 className="text-foreground tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              Turn Any Website Into Branded Merchandise
            </h2>
            <p className="text-foreground text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              See what your brand could look like on merchandise
            </p>

            {/* Error Alert */}
            {error && (
              <div className="px-4 py-3">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* URL Input */}
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3 mx-auto w-full">
              <label className="flex flex-col min-w-40 flex-1">
                <Input
                  placeholder="Website URL"
                  className="h-14 bg-secondary border-none text-base placeholder:text-muted-foreground"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateBrandKit()
                    }
                  }}
                />
              </label>
            </div>

            {/* CTA Button */}
            <div className="flex px-4 py-3 justify-center">
              <Button
                onClick={handleCreateBrandKit}
                disabled={loading}
                className="h-12 px-5 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold"
              >
                <span className="truncate">
                  {loading ? 'Creating...' : 'Create My Brand Kit →'}
                </span>
              </Button>
            </div>

            <p className="text-muted-foreground text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
              {showEmailOption
                ? "Enter your email below to receive a PDF and magic link"
                : "Or enter your email below to receive results via email"}
            </p>

            {/* How It Works Steps */}
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-lg">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-foreground text-base font-bold leading-tight">Step 1: Enter Website URL</p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    Provide the URL of your website to begin the merchandise design process.
                  </p>
                </div>
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop")'
                  }}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-lg">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-foreground text-base font-bold leading-tight">Step 2: See our suggestion for the styled merchandise</p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    Tailor the merchandise designs to match your brand&apos;s aesthetic and preferences.
                  </p>
                </div>
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=225&fit=crop")'
                  }}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-lg">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-foreground text-base font-bold leading-tight">Step 3: Receive Brand Kit</p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    Get a PDF of your custom designs and a link to further edit them.
                  </p>
                </div>
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=225&fit=crop")'
                  }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3 mx-auto w-full">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-foreground text-base font-medium leading-normal pb-2">Email</p>
                <div className="flex w-full flex-1 items-stretch rounded-lg">
                  <Input
                    type="email"
                    placeholder="Enter your email address and we will notify you with a link to see your designs."
                    className="h-14 rounded-r-none border-r-0 text-base placeholder:text-muted-foreground"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <div className="text-muted-foreground flex border border-input bg-background items-center justify-center pr-[15px] rounded-r-lg border-l-0">
                    <Envelope size={24} weight="regular" />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

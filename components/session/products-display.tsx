'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Session } from '@/lib/types/session'

interface ProductsDisplayProps {
  session: Session
}

/**
 * Products Display Component
 *
 * Final page showing all generated product mockups
 * Includes email input, download options, and footer links
 */
export function ProductsDisplay({ session }: ProductsDisplayProps) {
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

      alert('Email saved! We will notify you with updates.')
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
        <div className="px-4 md:px-40 flex flex-1 justify-center py-8">
          <div className="flex flex-col max-w-[1200px] flex-1">
            {/* Success Message */}
            <div className="text-center pb-8">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  className="text-primary"
                >
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z" />
                </svg>
              </div>
              <h1 className="text-foreground text-[32px] font-bold leading-tight mb-2">
                Your Designs Are Ready!
              </h1>
              <p className="text-muted-foreground text-base">
                We&apos;ve created custom merchandise designs based on your brand identity
              </p>
            </div>

            {/* Product Mockups Grid */}
            <div className="pb-8">
              <h2 className="text-foreground text-2xl font-bold leading-tight mb-6 px-4">
                Generated Products
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                {session.product_images && session.product_images.length > 0 ? (
                  session.product_images.map((product) => (
                    <div
                      key={product.product_id}
                      className="flex flex-col gap-3 bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Product Image */}
                      <div
                        className="w-full aspect-[3/4] bg-secondary bg-cover bg-center"
                        style={{ backgroundImage: `url("${product.image_url}")` }}
                      />

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="text-foreground text-lg font-semibold mb-2">
                          {product.product_name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {product.design_notes || 'Custom merchandise design'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No products available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Brand Summary */}
            {session.scraped_data && (
              <div className="px-4 pb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-foreground text-lg font-bold mb-4">
                    Your Brand
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Brand Name */}
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Brand Name</p>
                      <p className="text-foreground font-medium">{session.scraped_data.title}</p>
                    </div>

                    {/* Colors */}
                    {session.scraped_data.colors && session.scraped_data.colors.length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Brand Colors</p>
                        <div className="flex gap-2">
                          {session.scraped_data.colors.slice(0, 5).map((color, index) => (
                            <div
                              key={index}
                              className="size-8 rounded-full border-2 border-border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Style */}
                    {session.scraped_data.style && (
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">Style</p>
                        <p className="text-foreground font-medium">{session.scraped_data.style}</p>
                      </div>
                    )}

                    {/* Tone */}
                    {session.scraped_data.tone && (
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">Tone</p>
                        <p className="text-foreground font-medium">{session.scraped_data.tone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="px-4 pb-8">
              <div className="max-w-[600px] mx-auto">
                <label className="flex flex-col gap-2">
                  <p className="text-foreground text-base font-medium leading-normal text-center">
                    Get notified about your designs
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
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
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 px-4 pb-8">
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                size="lg"
              >
                Create Another Design
              </Button>
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

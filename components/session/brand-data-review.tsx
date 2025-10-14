'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ColorPicker } from '@/components/session/color-picker'
import { LogoUploader } from '@/components/session/logo-uploader'
import type { Session } from '@/lib/types/session'

interface BrandDataReviewProps {
  session: Session
  onNext: () => void
  onUpdate: (field: string, value: any) => Promise<void>
  nextLoading: boolean
}

/**
 * Brand Data Review Component
 *
 * Displays all extracted brand attributes for user review and editing
 * Organized into logical sections:
 * - Company Information
 * - Visual Identity
 * - Brand Voice
 * - Audience & Market
 * - Company Story
 */
export function BrandDataReview({
  session,
  onNext,
  onUpdate,
  nextLoading,
}: BrandDataReviewProps) {
  const [errors, setErrors] = useState<string[]>([])

  const { scraped_data } = session

  // Check if required fields are filled
  const hasLogo = scraped_data?.logo && scraped_data.logo !== ''
  const hasMinColors =
    scraped_data?.colors && scraped_data.colors.length >= 2
  const canProceed = hasLogo && hasMinColors

  const missingFields = scraped_data?.missing_fields || []

  const handleNext = () => {
    const newErrors: string[] = []

    if (!hasLogo) {
      newErrors.push('Logo is required')
    }
    if (!hasMinColors) {
      newErrors.push('At least 2 brand colors are required')
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors([])
    onNext()
  }

  return (
    <div className="flex flex-col max-w-[960px] w-full mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground text-[32px] font-bold leading-tight mb-2">
          Brand Information Review
        </h1>
        <p className="text-muted-foreground text-base">
          We&apos;ve analyzed your website and extracted key brand attributes.
          Please review and edit as needed before proceeding.
        </p>
      </div>

      {/* Error Alert */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Missing Fields Warning */}
      {missingFields.length > 0 && (
        <Alert className="mb-6 border-destructive bg-destructive/10">
          <AlertDescription>
            <strong>⚠️ Required fields missing:</strong>
            <ul className="list-disc list-inside mt-2">
              {missingFields.map((field) => (
                <li key={field}>
                  {field === 'logo' && 'Brand logo'}
                  {field === 'colors' && 'Brand colors (minimum 2)'}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Section 1: Company Information */}
      <div className="mb-8">
        <h2 className="text-foreground text-2xl font-bold mb-4">
          Company Information
        </h2>

        <div className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Company Name *
            </label>
            <Input
              value={scraped_data?.title || ''}
              onChange={(e) => onUpdate('title', e.target.value)}
              className="h-12"
              required
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Website URL
            </label>
            <Input
              value={session.url}
              readOnly
              className="h-12 bg-muted"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Tagline / Slogan
            </label>
            <Input
              value={scraped_data?.tagline || ''}
              onChange={(e) => onUpdate('tagline', e.target.value)}
              placeholder="e.g., The future of design"
              className="h-12"
            />
            <p className="text-muted-foreground text-xs mt-1">
              Optional: A short, memorable phrase that captures your brand
              essence
            </p>
          </div>

          {/* Logo */}
          <div
            className={`border rounded-lg p-4 ${missingFields.includes('logo') ? 'border-destructive bg-destructive/10' : 'border-border'}`}
          >
            <label className="text-foreground text-sm font-medium mb-2 block">
              Company Logo *
            </label>
            <LogoUploader
              currentLogo={
                typeof scraped_data?.logo === 'string'
                  ? scraped_data.logo
                  : scraped_data?.logo?.stored_url
              }
              onUpload={(url) => onUpdate('logo', url)}
            />
            <p className="text-muted-foreground text-xs mt-2">
              PNG, JPG, SVG, AI, or EPS. Vector files will be converted to PNG.
              Max 10MB.
            </p>
          </div>

          {/* Industry */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Industry
            </label>
            <Input
              value={scraped_data?.industry || ''}
              onChange={(e) => onUpdate('industry', e.target.value)}
              placeholder="e.g., Technology, Healthcare, Retail"
              className="h-12"
            />
          </div>

          {/* Enhanced: Industries (from Brandfetch) */}
          {scraped_data?.industries && scraped_data.industries.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <label className="text-foreground text-sm font-medium mb-2 block">
                Industries (from Brandfetch)
              </label>
              <div className="flex flex-wrap gap-2">
                {scraped_data.industries.map((industry, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced: Founded Year */}
          {scraped_data?.founded_year && (
            <div className="bg-muted/50 rounded-lg p-4">
              <label className="text-foreground text-sm font-medium mb-2 block">
                Founded Year
              </label>
              <p className="text-foreground">{scraped_data.founded_year}</p>
            </div>
          )}

          {/* Enhanced: Location */}
          {scraped_data?.location && (
            <div className="bg-muted/50 rounded-lg p-4">
              <label className="text-foreground text-sm font-medium mb-2 block">
                Location
              </label>
              <p className="text-foreground">
                {[
                  scraped_data.location.city,
                  scraped_data.location.country,
                ].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          {/* Enhanced: Social Links */}
          {scraped_data?.social_links && scraped_data.social_links.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <label className="text-foreground text-sm font-medium mb-2 block">
                Social Media Links
              </label>
              <div className="space-y-1">
                {scraped_data.social_links.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
                      {link.name}:
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {link.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Visual Identity */}
      <div className="mb-8">
        <h2 className="text-foreground text-2xl font-bold mb-4">
          Visual Identity
        </h2>

        <div className="space-y-4">
          {/* Color Palette */}
          <div
            className={`border rounded-lg p-4 ${missingFields.includes('colors') ? 'border-destructive bg-destructive/10' : 'border-border'}`}
          >
            <label className="text-foreground text-sm font-medium mb-2 block">
              Color Palette * (minimum 2 colors)
            </label>
            <ColorPicker
              colors={scraped_data?.colors || []}
              onChange={(colors) => onUpdate('colors', colors)}
            />
            <p className="text-muted-foreground text-xs mt-2">
              Add or edit your brand colors (comma-separated hex codes)
            </p>
          </div>

          {/* Enhanced: Color Types */}
          {scraped_data?.colors_enhanced && scraped_data.colors_enhanced.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <label className="text-foreground text-sm font-medium mb-2 block">
                Color Details (from Brandfetch)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {scraped_data.colors_enhanced.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {color.hex}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {color.type}
                        {color.brightness !== undefined && ` • ${color.brightness}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Style */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Style
            </label>
            <Input
              value={scraped_data?.style || ''}
              onChange={(e) => onUpdate('style', e.target.value)}
              placeholder="e.g., Modern, Minimalist, Bold"
              className="h-12"
            />
          </div>

          {/* Typography */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Typography
            </label>
            <Input
              value={scraped_data?.fonts?.[0] || ''}
              onChange={(e) => {
                const newFonts = e.target.value
                  ? [e.target.value]
                  : []
                onUpdate('fonts', newFonts)
              }}
              placeholder="e.g., Heading: Montserrat Bold, Body: Lato Regular"
              className="h-12"
            />
            <p className="text-muted-foreground text-xs mt-1">
              Primary font family used on your website
            </p>
          </div>

          {/* Enhanced: Font Details */}
          {scraped_data?.fonts_enhanced && scraped_data.fonts_enhanced.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <label className="text-foreground text-sm font-medium mb-2 block">
                Font Details (from Brandfetch)
              </label>
              <div className="space-y-3">
                {scraped_data.fonts_enhanced.map((font, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {font.name}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                          {font.type}
                        </span>
                        {font.origin && (
                          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                            {font.origin}
                          </span>
                        )}
                        {font.weights && font.weights.length > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                            Weights: {font.weights.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Imagery Style */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Imagery Style
            </label>
            <Input
              value={scraped_data?.imagery_style || ''}
              onChange={(e) => onUpdate('imagery_style', e.target.value)}
              placeholder="e.g., Minimalist vector, Photorealistic"
              className="h-12"
            />
          </div>

          {/* Iconography Style */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Iconography Style
            </label>
            <Input
              value={scraped_data?.iconography_style || ''}
              onChange={(e) => onUpdate('iconography_style', e.target.value)}
              placeholder="e.g., Line art, Solid fill"
              className="h-12"
            />
          </div>

          {/* Logo Description */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Logo Description
            </label>
            <Textarea
              value={scraped_data?.logo_description || ''}
              onChange={(e) => onUpdate('logo_description', e.target.value)}
              placeholder="Brief description of your logo design and what it represents"
              className="min-h-[80px]"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Brand Voice & Messaging */}
      <div className="mb-8">
        <h2 className="text-foreground text-2xl font-bold mb-4">
          Brand Voice & Messaging
        </h2>

        <div className="space-y-4">
          {/* Tone */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Tone
            </label>
            <Input
              value={scraped_data?.tone || ''}
              onChange={(e) => onUpdate('tone', e.target.value)}
              placeholder="e.g., Friendly, Professional, Casual"
              className="h-12"
            />
          </div>

          {/* Sentiment */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Sentiment
            </label>
            <Input
              value={scraped_data?.sentiment || ''}
              onChange={(e) => onUpdate('sentiment', e.target.value)}
              placeholder="e.g., Optimistic, Innovative, Traditional"
              className="h-12"
            />
          </div>

          {/* Brand Keywords */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Brand Keywords
            </label>
            <Input
              value={scraped_data?.brand_keywords?.join(', ') || ''}
              onChange={(e) => {
                const keywords = e.target.value
                  .split(',')
                  .map((k) => k.trim())
                  .filter(Boolean)
                onUpdate('brand_keywords', keywords)
              }}
              placeholder="e.g., Innovative, Bold, Friendly"
              className="h-12"
            />
            <p className="text-muted-foreground text-xs mt-1">
              Comma-separated keywords that describe your brand
            </p>
          </div>

          {/* SEO Keywords */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              SEO Keywords
            </label>
            <Input
              value={scraped_data?.seo_keywords?.join(', ') || ''}
              onChange={(e) => {
                const keywords = e.target.value
                  .split(',')
                  .map((k) => k.trim())
                  .filter(Boolean)
                onUpdate('seo_keywords', keywords)
              }}
              placeholder="e.g., AI design, custom merchandise"
              className="h-12"
            />
            <p className="text-muted-foreground text-xs mt-1">
              Comma-separated SEO keywords for your business
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Audience & Market */}
      <div className="mb-8">
        <h2 className="text-foreground text-2xl font-bold mb-4">
          Audience & Market
        </h2>

        <div className="space-y-4">
          {/* Target Audience */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Target Audience
            </label>
            <Textarea
              value={scraped_data?.target_audience || ''}
              onChange={(e) => onUpdate('target_audience', e.target.value)}
              placeholder="e.g., Young professionals aged 25-40, tech enthusiasts"
              className="min-h-[80px]"
            />
          </div>

          {/* Call-to-Action Examples */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Key Call-to-Action Examples
            </label>
            <Input
              value={scraped_data?.cta_examples?.join(', ') || ''}
              onChange={(e) => {
                const ctas = e.target.value
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean)
                onUpdate('cta_examples', ctas)
              }}
              placeholder="e.g., Get Started, Join Now, Learn More"
              className="h-12"
            />
            <p className="text-muted-foreground text-xs mt-1">
              Comma-separated call-to-action phrases
            </p>
          </div>

          {/* Social Media Platforms */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Social Media Platforms
            </label>
            <Input
              value={scraped_data?.social_platforms?.join(', ') || ''}
              onChange={(e) => {
                const platforms = e.target.value
                  .split(',')
                  .map((p) => p.trim())
                  .filter(Boolean)
                onUpdate('social_platforms', platforms)
              }}
              placeholder="e.g., Twitter, Instagram, LinkedIn"
              className="h-12"
            />
            <p className="text-muted-foreground text-xs mt-1">
              Comma-separated social media platforms
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Company Story */}
      <div className="mb-8">
        <h2 className="text-foreground text-2xl font-bold mb-4">
          Company Story
        </h2>

        <div className="space-y-4">
          {/* Company Description */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Description
            </label>
            <Textarea
              value={scraped_data?.description || ''}
              onChange={(e) => onUpdate('description', e.target.value)}
              placeholder="Brief description of your company"
              className="min-h-[100px]"
            />
          </div>

          {/* Company Story / Milestones */}
          <div>
            <label className="text-foreground text-sm font-medium mb-2 block">
              Company Story / Milestones
            </label>
            <Textarea
              value={scraped_data?.company_story || ''}
              onChange={(e) => onUpdate('company_story', e.target.value)}
              placeholder="Tell us about your company's journey, mission, or key milestones"
              className="min-h-[120px]"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-border">
        <p className="text-muted-foreground text-sm">
          * Required fields
        </p>
        <Button
          onClick={handleNext}
          disabled={!canProceed || nextLoading}
          size="lg"
          className="min-w-[120px]"
        >
          {nextLoading ? 'Processing...' : 'Next'}
        </Button>
      </div>
    </div>
  )
}

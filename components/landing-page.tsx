'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export function LandingPage() {
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session')
      }

      setSuccess(true)
      setUrl('')
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            🎨 BrendAI
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8">
            Automated Brand Merchandise Design
          </p>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Turn any website into custom merchandise designs in minutes.
            AI-powered concept generation, motif creation, and product mockups.
          </p>
        </div>

        {/* Main Card */}
        <Card className="max-w-2xl mx-auto shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>
              Enter a website URL and your email to receive custom merchandise designs
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>
                    <strong>Success!</strong> Check your email for the magic link to track your designs.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Brand Website URL
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  disabled={loading}
                  className="text-base"
                />
                <p className="text-xs text-gray-500">
                  We&apos;ll analyze this website to extract brand colors, fonts, and content
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Your Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="text-base"
                />
                <p className="text-xs text-gray-500">
                  We&apos;ll send you a magic link to track progress and download your designs
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-lg py-6"
              >
                {loading ? 'Creating Your Designs...' : '🚀 Create My Designs'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <div className="text-3xl mb-2">🔍</div>
              <CardTitle className="text-lg">Smart Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                AI extracts brand colors, fonts, logos, and content automatically from any website
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <div className="text-3xl mb-2">✨</div>
              <CardTitle className="text-lg">AI Concepts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Generate creative merchandise concepts and custom motifs using advanced AI
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <div className="text-3xl mb-2">👕</div>
              <CardTitle className="text-lg">5 Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Get mockups for T-Shirts, Hoodies, Mugs, USB Sticks, and Socks instantly
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto mt-16 bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            How It Works
          </h2>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Enter URL & Email', desc: 'Provide your brand website and email' },
              { step: 2, title: 'AI Analysis', desc: 'We scrape and analyze your brand identity' },
              { step: 3, title: 'Concept Generation', desc: 'AI creates unique merchandise concepts' },
              { step: 4, title: 'Motif Creation', desc: 'Generate custom design motifs' },
              { step: 5, title: 'Product Mockups', desc: 'Apply designs to 5 different products' },
              { step: 6, title: 'Deliver Results', desc: 'Receive PDF with all designs via email' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start space-x-4">
                <Badge className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  {step}
                </Badge>
                <div>
                  <h3 className="text-white font-semibold">{title}</h3>
                  <p className="text-purple-200 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-purple-200">
          <p className="text-sm">
            Built with Next.js, Neon Postgres, Gemini AI, and Vercel
          </p>
        </div>
      </div>
    </div>
  )
}

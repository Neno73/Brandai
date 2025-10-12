'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'

interface MotifDisplayProps {
  motifImageUrl?: string
  motifPrompt?: string
  sessionId: string
  onRegenerateComplete?: () => void
  disabled?: boolean
}

export function MotifDisplay({
  motifImageUrl,
  motifPrompt,
  sessionId,
  onRegenerateComplete,
  disabled = false,
}: MotifDisplayProps) {
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegenerateMotif = async () => {
    setRegenerating(true)
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

      const data = await response.json()

      // Notify parent component to refresh session data
      if (onRegenerateComplete) {
        onRegenerateComplete()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate motif')
    } finally {
      setRegenerating(false)
    }
  }

  if (!motifImageUrl && !motifPrompt) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>🎨 Design Motif</CardTitle>
            <CardDescription>
              Custom design elements for your merchandise
            </CardDescription>
          </div>
          {!disabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateMotif}
              disabled={regenerating}
            >
              {regenerating ? 'Generating...' : '🔄 Regenerate Motif'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Motif Image */}
          {motifImageUrl && (
            <div className="relative w-full aspect-square max-w-md mx-auto border rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={motifImageUrl}
                alt="Design Motif"
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Motif Description */}
          {motifPrompt && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Design Description:
              </p>
              <p className="text-sm text-gray-600">{motifPrompt}</p>
            </div>
          )}

          {/* Regenerating indicator */}
          {regenerating && (
            <div className="mt-4">
              <Progress value={undefined} className="h-2" />
              <p className="text-sm text-gray-500 mt-2">
                Creating a new design variation...
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

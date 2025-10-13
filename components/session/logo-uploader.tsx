'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface LogoUploaderProps {
  currentLogo?: string
  onUpload: (logoUrl: string) => Promise<void>
  disabled?: boolean
}

export function LogoUploader({
  currentLogo,
  onUpload,
  disabled = false,
}: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentLogo || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isVectorFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase()
    return fileName.endsWith('.svg') || fileName.endsWith('.ai') || fileName.endsWith('.eps')
  }

  const validateImage = (file: File): Promise<{ valid: boolean; error?: string; isVector: boolean }> => {
    return new Promise((resolve) => {
      // Check if it's a vector file
      const vector = isVectorFile(file)

      // Check file type (allow vector files or regular images)
      if (!vector && !file.type.startsWith('image/')) {
        resolve({ valid: false, error: 'File must be an image or vector file (SVG, AI, EPS)', isVector: false })
        return
      }

      // Check file size (max 10MB for vectors, 5MB for raster)
      const maxSize = vector ? 10 * 1024 * 1024 : 5 * 1024 * 1024
      if (file.size > maxSize) {
        resolve({
          valid: false,
          error: vector ? 'Vector file must be smaller than 10MB' : 'Image must be smaller than 5MB',
          isVector: vector,
        })
        return
      }

      // Skip dimension check for vector files
      if (vector) {
        resolve({ valid: true, isVector: true })
        return
      }

      // Check image dimensions for raster files
      const img = new window.Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)

        if (img.width < 500 || img.height < 500) {
          resolve({
            valid: false,
            error: 'Image must be at least 500x500 pixels',
            isVector: false,
          })
        } else {
          resolve({ valid: true, isVector: false })
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        resolve({ valid: false, error: 'Invalid image file', isVector: false })
      }

      img.src = objectUrl
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      // Validate image
      const validation = await validateImage(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid image')
        setUploading(false)
        return
      }

      // Create preview (for raster images only)
      let previewUrl: string | null = null
      if (!validation.isVector) {
        previewUrl = URL.createObjectURL(file)
        setPreview(previewUrl)
      }

      // Upload to server - use conversion endpoint for vectors
      const formData = new FormData()
      formData.append('logo', file)

      const endpoint = validation.isVector ? '/api/upload/logo/convert' : '/api/upload/logo'
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || data.message || 'Failed to upload logo')
      }

      const data = await response.json()

      // Set preview to the uploaded URL (for vectors, this is the converted PNG)
      setPreview(data.url)

      // Call parent callback
      await onUpload(data.url)

      // Clean up preview URL if we created one
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo')
      setPreview(currentLogo || null)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = async () => {
    setPreview(null)
    setError(null)
    try {
      await onUpload('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove logo')
      setPreview(currentLogo || null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-4">
        {preview ? (
          <div className="relative">
            <div className="relative w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Logo preview"
                fill
                className="object-contain"
              />
            </div>
            {!disabled && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleRemoveLogo}
                title="Remove logo"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
            No logo
          </div>
        )}

        {!disabled && (
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg,.ai,.eps"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="logo-upload"
            />
            <Label htmlFor="logo-upload">
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : preview ? 'Replace Logo' : 'Upload Logo'}
                </span>
              </Button>
            </Label>
            <p className="text-xs text-gray-500">
              PNG, JPG, SVG, AI, or EPS. Vector files will be converted to PNG. Max 10MB.
            </p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

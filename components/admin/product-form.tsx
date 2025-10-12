'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types/product'

interface ProductFormProps {
  product?: Product
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product

  const [name, setName] = useState(product?.name || '')
  const [baseImageUrl, setBaseImageUrl] = useState(product?.base_image_url || '')
  const [printZones, setPrintZones] = useState<string[]>(product?.print_zones || ['front'])
  const [constraints, setConstraints] = useState(product?.constraints || '')
  const [maxColors, setMaxColors] = useState(product?.max_colors || 8)
  const [recommendedElements, setRecommendedElements] = useState<string[]>(
    product?.recommended_elements || []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Print zone input state
  const [newPrintZone, setNewPrintZone] = useState('')
  const [newElement, setNewElement] = useState('')

  const handleAddPrintZone = () => {
    if (newPrintZone.trim() && !printZones.includes(newPrintZone.trim())) {
      setPrintZones([...printZones, newPrintZone.trim()])
      setNewPrintZone('')
    }
  }

  const handleRemovePrintZone = (zone: string) => {
    setPrintZones(printZones.filter((z) => z !== zone))
  }

  const handleAddElement = () => {
    if (newElement.trim() && !recommendedElements.includes(newElement.trim())) {
      setRecommendedElements([...recommendedElements, newElement.trim()])
      setNewElement('')
    }
  }

  const handleRemoveElement = (element: string) => {
    setRecommendedElements(recommendedElements.filter((e) => e !== element))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEdit
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          base_image_url: baseImageUrl,
          print_zones: printZones,
          constraints: constraints || undefined,
          max_colors: maxColors,
          recommended_elements: recommendedElements.length > 0 ? recommendedElements : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} product`)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'create'} product`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          placeholder="e.g., T-Shirt"
        />
      </div>

      <div>
        <Label htmlFor="baseImageUrl">Base Image URL *</Label>
        <Input
          id="baseImageUrl"
          type="url"
          value={baseImageUrl}
          onChange={(e) => setBaseImageUrl(e.target.value)}
          required
          disabled={loading}
          placeholder="https://example.com/product-base.png"
        />
      </div>

      <div>
        <Label>Print Zones *</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newPrintZone}
            onChange={(e) => setNewPrintZone(e.target.value)}
            placeholder="e.g., front, back, sleeves"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddPrintZone()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddPrintZone}
            disabled={loading || !newPrintZone.trim()}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {printZones.map((zone) => (
            <Badge key={zone} variant="secondary">
              {zone}
              <button
                type="button"
                onClick={() => handleRemovePrintZone(zone)}
                className="ml-2 hover:text-red-600"
                disabled={loading}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="maxColors">Max Colors</Label>
        <Input
          id="maxColors"
          type="number"
          min={1}
          max={16}
          value={maxColors}
          onChange={(e) => setMaxColors(parseInt(e.target.value))}
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="constraints">Constraints (Optional)</Label>
        <Textarea
          id="constraints"
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          disabled={loading}
          placeholder="e.g., Maximum print size: 12x12 inches"
          rows={3}
        />
      </div>

      <div>
        <Label>Recommended Elements (Optional)</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newElement}
            onChange={(e) => setNewElement(e.target.value)}
            placeholder="e.g., logo, icon, pattern"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddElement()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddElement}
            disabled={loading || !newElement.trim()}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {recommendedElements.map((element) => (
            <Badge key={element} variant="secondary">
              {element}
              <button
                type="button"
                onClick={() => handleRemoveElement(element)}
                className="ml-2 hover:text-red-600"
                disabled={loading}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

interface ColorPickerProps {
  colors: string[]
  onChange: (colors: string[]) => void
  minColors?: number
  maxColors?: number
  disabled?: boolean
}

export function ColorPicker({
  colors,
  onChange,
  minColors = 2,
  maxColors = 8,
  disabled = false,
}: ColorPickerProps) {
  const [newColor, setNewColor] = useState('#000000')
  const [error, setError] = useState<string | null>(null)

  const validateHexColor = (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color)
  }

  const handleAddColor = () => {
    if (!validateHexColor(newColor)) {
      setError('Invalid hex color format (e.g., #FF5733)')
      return
    }

    if (colors.includes(newColor.toUpperCase())) {
      setError('Color already exists')
      return
    }

    if (colors.length >= maxColors) {
      setError(`Maximum ${maxColors} colors allowed`)
      return
    }

    onChange([...colors, newColor.toUpperCase()])
    setNewColor('#000000')
    setError(null)
  }

  const handleRemoveColor = (index: number) => {
    if (colors.length <= minColors) {
      setError(`Minimum ${minColors} colors required`)
      return
    }

    const updatedColors = colors.filter((_, i) => i !== index)
    onChange(updatedColors)
    setError(null)
  }

  const handleUpdateColor = (index: number, newColorValue: string) => {
    if (!validateHexColor(newColorValue)) {
      return
    }

    const updatedColors = [...colors]
    updatedColors[index] = newColorValue.toUpperCase()
    onChange(updatedColors)
  }

  return (
    <div className="space-y-4">
      {/* Color List */}
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <DropdownMenu key={index}>
            <DropdownMenuTrigger asChild>
              <button
                className="relative group"
                disabled={disabled}
              >
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
                {!disabled && colors.length > minColors && (
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveColor(index)
                    }}
                    title="Remove color"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-4 space-y-2">
              <Label htmlFor={`color-${index}`}>Edit Color</Label>
              <div className="flex gap-2">
                <Input
                  id={`color-${index}`}
                  type="text"
                  value={color}
                  onChange={(e) => handleUpdateColor(index, e.target.value)}
                  placeholder="#FF5733"
                  className="font-mono"
                  maxLength={7}
                />
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => handleUpdateColor(index, e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
              </div>
              <Badge variant="outline" className="text-xs">
                {color}
              </Badge>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}

        {/* Add Color Button */}
        {!disabled && colors.length < maxColors && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12"
                title="Add color"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-4 space-y-3">
              <Label htmlFor="new-color">Add New Color</Label>
              <div className="flex gap-2">
                <Input
                  id="new-color"
                  type="text"
                  value={newColor}
                  onChange={(e) => {
                    setNewColor(e.target.value)
                    setError(null)
                  }}
                  placeholder="#FF5733"
                  className="font-mono"
                  maxLength={7}
                />
                <Input
                  type="color"
                  value={newColor}
                  onChange={(e) => {
                    setNewColor(e.target.value)
                    setError(null)
                  }}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
              </div>
              <Button onClick={handleAddColor} className="w-full" size="sm">
                Add Color
              </Button>
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Color Count Info */}
      <p className="text-xs text-gray-500">
        {colors.length} of {maxColors} colors ({minColors} minimum required)
      </p>
    </div>
  )
}

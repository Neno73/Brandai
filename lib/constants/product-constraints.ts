import type { PrintZone, ElementType } from '@/lib/types/product'

export interface ProductConstraints {
  name: string
  printZones: PrintZone[]
  maxColors: number
  recommendedElements: ElementType[]
  description: string
}

export const DEFAULT_PRODUCT_CONSTRAINTS: Record<string, ProductConstraints> = {
  'T-Shirt': {
    name: 'T-Shirt',
    printZones: ['front', 'back'],
    maxColors: 8,
    recommendedElements: ['icon', 'graphic', 'typography'],
    description: 'Standard screen printing zones. Front: 12x16 inches max. Back: 12x14 inches max.',
  },
  Hoodie: {
    name: 'Hoodie',
    printZones: ['front', 'back', 'sleeves', 'pocket'],
    maxColors: 8,
    recommendedElements: ['icon', 'graphic'],
    description:
      'No inside printing. Solid cuffs only. Pocket embroidery max 2x2cm. Sleeve prints max 4x8 inches.',
  },
  Mug: {
    name: 'Mug',
    printZones: ['wrap'],
    maxColors: 999,
    recommendedElements: ['pattern', 'graphic', 'icon'],
    description: '360° full-color sublimation print. Handle area will be solid.',
  },
  'USB Stick': {
    name: 'USB Stick',
    printZones: ['front'],
    maxColors: 4,
    recommendedElements: ['icon'],
    description: 'Logo area only: 2x2cm max. Single-color engraving or full-color print.',
  },
  Socks: {
    name: 'Socks',
    printZones: ['ankle'],
    maxColors: 6,
    recommendedElements: ['icon', 'pattern'],
    description:
      'Ankle area only (no heel/toe). Stretch fabric - avoid fine details under 5mm.',
  },
}

// Minimum requirements for logo quality
export const LOGO_MIN_WIDTH = 500
export const LOGO_MIN_HEIGHT = 500

// Color extraction limits
export const MIN_COLORS = 2
export const MAX_COLORS = 5

// Content extraction limits
export const MAX_CONTENT_TOKENS = 500

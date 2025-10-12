export type PrintZone = 'front' | 'back' | 'sleeves' | 'wrap' | 'ankle' | 'pocket' | 'all-over'
export type ElementType = 'icon' | 'pattern' | 'graphic' | 'typography'

export interface Product {
  id: string
  name: string
  base_image_url: string
  print_zones: PrintZone[]
  constraints: string | null
  max_colors: number
  recommended_elements: ElementType[] | null
  is_archived: boolean
  created_at: string
}

export interface ProductInput {
  name: string
  base_image_url: string
  print_zones: PrintZone[]
  constraints?: string
  max_colors?: number
  recommended_elements?: ElementType[]
}

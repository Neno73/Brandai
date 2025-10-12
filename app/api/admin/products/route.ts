import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct } from '@/lib/db/queries'
import { z } from 'zod'

const ProductCreateSchema = z.object({
  name: z.string().min(1),
  base_image_url: z.string().url(),
  print_zones: z.array(z.string()).min(1),
  constraints: z.string().optional(),
  max_colors: z.number().min(1).max(16).default(8),
  recommended_elements: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const products = await getProducts()

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = ProductCreateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const product = await createProduct(validationResult.data)

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

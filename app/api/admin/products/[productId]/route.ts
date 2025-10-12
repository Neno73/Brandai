import { NextRequest, NextResponse } from 'next/server'
import { updateProduct, archiveProduct } from '@/lib/db/queries'
import { sql } from '@/lib/db/client'
import { z } from 'zod'

const PrintZoneEnum = z.enum(['front', 'back', 'sleeves', 'wrap', 'ankle', 'pocket', 'all-over'])
const ElementTypeEnum = z.enum(['icon', 'pattern', 'graphic', 'typography'])

const ProductUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  base_image_url: z.string().url().optional(),
  print_zones: z.array(PrintZoneEnum).min(1).optional(),
  constraints: z.string().optional(),
  max_colors: z.number().min(1).max(16).optional(),
  recommended_elements: z.array(ElementTypeEnum).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId
    const body = await request.json()

    // Validate input
    const validationResult = ProductUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const product = await updateProduct(productId, validationResult.data)

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId

    // Check if product is in use by any sessions
    const sessionsUsingProduct = await sql`
      SELECT COUNT(*) as count
      FROM sessions
      WHERE product_images @> ${JSON.stringify([{ product_id: productId }])}::jsonb
    `

    const count = parseInt((sessionsUsingProduct[0] as any).count)

    if (count > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete product',
          message: `This product is used in ${count} session(s). Archive it instead.`,
        },
        { status: 400 }
      )
    }

    // Archive the product instead of deleting
    const product = await archiveProduct(productId)

    return NextResponse.json({
      success: true,
      message: 'Product archived successfully',
      product,
    })
  } catch (error) {
    console.error('Failed to archive product:', error)
    return NextResponse.json(
      { error: 'Failed to archive product' },
      { status: 500 }
    )
  }
}

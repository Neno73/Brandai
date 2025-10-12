import { sql } from './client'
import type { Session, SessionStatus, ScrapedData } from '@/lib/types/session'
import type { Product, ProductInput } from '@/lib/types/product'

// Session queries
export async function createSession(url: string, email: string): Promise<Session> {
  const result = await sql`
    INSERT INTO sessions (email, url, status)
    VALUES (${email}, ${url}, 'scraping')
    RETURNING *
  `
  return result[0] as Session
}

export async function getSession(id: string): Promise<Session | null> {
  const result = await sql`
    SELECT * FROM sessions WHERE id = ${id}
  `
  return result[0] as Session || null
}

export async function updateSession(
  id: string,
  updates: Partial<Pick<Session, 'status' | 'scraped_data' | 'concept' | 'motif_image_url' | 'product_images'>>
): Promise<Session> {
  const setClauses: string[] = []
  const values: any[] = []

  if (updates.status !== undefined) {
    setClauses.push(`status = $${values.length + 1}`)
    values.push(updates.status)
  }
  if (updates.scraped_data !== undefined) {
    setClauses.push(`scraped_data = $${values.length + 1}::jsonb`)
    values.push(JSON.stringify(updates.scraped_data))
  }
  if (updates.concept !== undefined) {
    setClauses.push(`concept = $${values.length + 1}`)
    values.push(updates.concept)
  }
  if (updates.motif_image_url !== undefined) {
    setClauses.push(`motif_image_url = $${values.length + 1}`)
    values.push(updates.motif_image_url)
  }
  if (updates.product_images !== undefined) {
    setClauses.push(`product_images = $${values.length + 1}::jsonb`)
    values.push(JSON.stringify(updates.product_images))
  }

  if (setClauses.length === 0) {
    throw new Error('No updates provided')
  }

  const query = `UPDATE sessions SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`
  values.push(id)

  const result = await sql(query, values)
  return result[0] as Session
}

export async function getSessionsByEmail(email: string): Promise<Session[]> {
  const result = await sql`
    SELECT * FROM sessions
    WHERE email = ${email}
    ORDER BY created_at DESC
  `
  return result as Session[]
}

export async function findExistingSession(email: string, url: string): Promise<Session | null> {
  const result = await sql`
    SELECT * FROM sessions
    WHERE email = ${email} AND url = ${url}
    ORDER BY created_at DESC
    LIMIT 1
  `
  return result[0] as Session || null
}

export async function findAbandonedSessions(): Promise<Session[]> {
  const result = await sql`
    SELECT * FROM sessions
    WHERE status IN ('concept', 'motif')
    AND updated_at < NOW() - INTERVAL '24 hours'
    ORDER BY updated_at DESC
  `
  return result as Session[]
}

// Product queries
export async function getProducts(): Promise<Product[]> {
  const result = await sql`
    SELECT * FROM products
    WHERE is_archived = FALSE
    ORDER BY name
  `
  return result as Product[]
}

export async function getProduct(id: string): Promise<Product | null> {
  const result = await sql`
    SELECT * FROM products WHERE id = ${id}
  `
  return result[0] as Product || null
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const result = await sql`
    INSERT INTO products (
      name,
      base_image_url,
      print_zones,
      constraints,
      max_colors,
      recommended_elements
    )
    VALUES (
      ${input.name},
      ${input.base_image_url},
      ${JSON.stringify(input.print_zones)}::jsonb,
      ${input.constraints || null},
      ${input.max_colors || 8},
      ${input.recommended_elements ? JSON.stringify(input.recommended_elements) : null}::jsonb
    )
    RETURNING *
  `
  return result[0] as Product
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const setClauses: string[] = []
  const values: any[] = []

  if (input.name !== undefined) {
    setClauses.push(`name = $${values.length + 1}`)
    values.push(input.name)
  }
  if (input.base_image_url !== undefined) {
    setClauses.push(`base_image_url = $${values.length + 1}`)
    values.push(input.base_image_url)
  }
  if (input.print_zones !== undefined) {
    setClauses.push(`print_zones = $${values.length + 1}::jsonb`)
    values.push(JSON.stringify(input.print_zones))
  }
  if (input.constraints !== undefined) {
    setClauses.push(`constraints = $${values.length + 1}`)
    values.push(input.constraints)
  }
  if (input.max_colors !== undefined) {
    setClauses.push(`max_colors = $${values.length + 1}`)
    values.push(input.max_colors)
  }
  if (input.recommended_elements !== undefined) {
    setClauses.push(`recommended_elements = $${values.length + 1}::jsonb`)
    values.push(JSON.stringify(input.recommended_elements))
  }

  if (setClauses.length === 0) {
    throw new Error('No updates provided')
  }

  const query = `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${values.length + 1} RETURNING *`
  values.push(id)

  const result = await sql(query, values)
  return result[0] as Product
}

export async function archiveProduct(id: string): Promise<Product> {
  const result = await sql`
    UPDATE products
    SET is_archived = TRUE
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] as Product
}

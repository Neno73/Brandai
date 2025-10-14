/**
 * Google Gemini 2.5 Flash Image (Nanobana) Generation Service
 *
 * Uses the Gemini API with the gemini-2.5-flash-image model for image generation.
 * Documentation: https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash-image
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { put } from '@vercel/blob'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export interface ImagenGenerationOptions {
  prompt: string
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  numberOfImages?: number // 1-4
  negativePrompt?: string
}

export interface ImagenResponse {
  imageUrl: string
  mimeType: string
  base64Data?: string
}

/**
 * Get Gemini AI instance with lazy initialization
 */
function getGenAI(): GoogleGenerativeAI {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY)
}

/**
 * Generate an image using Gemini 2.5 Flash Image (Nanobana)
 * Returns the image URL stored in Vercel Blob
 */
export async function generateImage(
  options: ImagenGenerationOptions
): Promise<ImagenResponse> {
  const {
    prompt,
    aspectRatio = '1:1',
    numberOfImages = 1,
    negativePrompt,
  } = options

  try {
    const genAI = getGenAI()

    // Use the gemini-2.5-flash-image model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image',
    })

    // Construct the full prompt with negative prompt if provided
    let fullPrompt = prompt
    if (negativePrompt) {
      fullPrompt += `\n\nAvoid: ${negativePrompt}`
    }

    // Add aspect ratio to prompt
    fullPrompt += `\n\nAspect ratio: ${aspectRatio}`

    console.log('[Imagen] Generating image with prompt:', fullPrompt.substring(0, 200) + '...')

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: 'image/png', // Request image output
      },
    })

    const response = result.response

    // Extract image data from response
    // Gemini 2.5 Flash Image returns image data in the response
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No image candidates returned from Gemini')
    }

    const candidate = response.candidates[0]
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('No content parts in response')
    }

    // Find the image part
    const imagePart = candidate.content.parts.find(part =>
      part.inlineData && part.inlineData.mimeType?.startsWith('image/')
    )

    if (!imagePart || !imagePart.inlineData) {
      // Fallback: try to get text response and log it
      const textPart = candidate.content.parts.find(part => part.text)
      if (textPart) {
        console.error('[Imagen] Text response instead of image:', textPart.text)
      }
      throw new Error('No image data in response from Gemini')
    }

    const base64Image = imagePart.inlineData.data
    const mimeType = imagePart.inlineData.mimeType || 'image/png'

    if (!base64Image) {
      throw new Error('Empty image data returned from Gemini')
    }

    console.log('[Imagen] Image generated successfully, uploading to Vercel Blob...')

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64')

    // Upload to Vercel Blob
    const timestamp = Date.now()
    const extension = mimeType.split('/')[1] || 'png'
    const blob = await put(
      `motifs/${timestamp}-motif.${extension}`,
      imageBuffer,
      {
        access: 'public',
        contentType: mimeType,
        addRandomSuffix: true,
      }
    )

    console.log('[Imagen] Image uploaded to:', blob.url)

    return {
      imageUrl: blob.url,
      mimeType,
      base64Data: base64Image,
    }
  } catch (error) {
    console.error('[Imagen] Generation error:', error)
    throw error
  }
}

/**
 * Generate a motif image specifically for merchandise
 * Includes enhanced prompt engineering for print-ready designs
 */
export async function generateMotifImage(
  motifPrompt: string,
  colors: string[],
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '1:1'
): Promise<ImagenResponse> {
  // Enhance prompt for merchandise design
  const enhancedPrompt = `${motifPrompt}

Style requirements:
- High resolution, print-ready quality
- Clean, professional graphic design
- Bold, clear visual elements suitable for merchandise printing
- Simple, impactful composition
- Colors: ${colors.join(', ')}
- No text, typography, or words in the design
- No realistic human faces or identifiable people
- Vector art style with clean lines
- Solid background suitable for printing (white or transparent)`

  const negativePrompt = 'text, words, letters, typography, watermarks, signatures, realistic photos, cluttered, messy, low quality, blurry, pixelated, human faces, people, portraits, complex backgrounds'

  return generateImage({
    prompt: enhancedPrompt,
    aspectRatio,
    numberOfImages: 1,
    negativePrompt,
  })
}

/**
 * Fallback: Generate placeholder if Imagen fails
 * Uses a deterministic placeholder based on colors
 */
export function generatePlaceholderMotif(
  title: string,
  colors: string[]
): string {
  const colorParam = colors.length > 0 ? colors[0].replace('#', '') : 'cccccc'
  return `https://via.placeholder.com/1000x1000/${colorParam}/ffffff?text=${encodeURIComponent(
    title + ' Motif'
  )}`
}

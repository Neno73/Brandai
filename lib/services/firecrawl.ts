import FirecrawlApp from '@mendable/firecrawl-js'
import type { ScrapedData } from '@/lib/types/session'

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! })

interface FirecrawlResult {
  markdown?: string
  metadata?: {
    title?: string
    description?: string
  }
}

/**
 * Scrape website homepage content
 */
export async function scrapeWebsiteContent(url: string): Promise<Partial<ScrapedData>> {
  try {
    const result = (await app.scrapeUrl(url, {
      formats: ['markdown'],
      onlyMainContent: true,
      timeout: 60000,
    })) as FirecrawlResult

    if (!result || !result.markdown) {
      throw new Error('No content extracted from website')
    }

    // Parse markdown for key elements
    const lines = result.markdown.split('\n').filter(line => line.trim())
    const h1 = lines.find(l => l.startsWith('# '))?.replace('# ', '') || ''
    const h2s = lines
      .filter(l => l.startsWith('## '))
      .slice(0, 3)
      .map(h => h.replace('## ', ''))
    const paragraphs = lines
      .filter(l => l.length > 50 && !l.startsWith('#') && !l.startsWith('*'))
      .slice(0, 3)

    // Estimate tokens (rough approximation)
    const content = paragraphs.join('\n\n')
    const estimatedTokens = Math.ceil(content.split(/\s+/).length * 1.3)

    // Truncate if needed
    const truncatedContent =
      estimatedTokens > 500
        ? content
            .split(' ')
            .slice(0, Math.floor(500 / 1.3))
            .join(' ')
        : content

    return {
      title: result.metadata?.title || h1 || 'Untitled',
      description: result.metadata?.description || paragraphs[0] || '',
      headings: [h1, ...h2s].filter(Boolean),
      content: truncatedContent,
    }
  } catch (error) {
    console.error('Firecrawl scraping error:', error)
    throw new Error(`Failed to scrape website: ${error}`)
  }
}

/**
 * Extract approximate token count from text
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3)
}

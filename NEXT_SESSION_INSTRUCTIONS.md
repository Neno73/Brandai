# BrandAI: Enhanced Brandfetch Extraction - Implementation Instructions

## 🎯 Mission
Implement enhanced Brandfetch data extraction to capture:
1. **Color types** (brand, accent, dark, light) + brightness
2. **Font types** (title, body) + weights + origin
3. **Logo variants** (icon/full, dark/light themes)
4. **Company industry** for better design context

## 📋 Step 1: Run Database Migration (CRITICAL - Do First!)

Use Neon MCP to execute the brand_cache table migration:

```sql
-- Migration: v1.2 - Brand Cache Table
CREATE TABLE IF NOT EXISTS brand_cache (
  domain TEXT PRIMARY KEY,
  scraped_data JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_brand_cache_expires ON brand_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_brand_cache_domain ON brand_cache(domain) WHERE expires_at > NOW();

COMMENT ON TABLE brand_cache IS 'Caches Brandfetch API responses for 30 days to reduce API calls';
COMMENT ON COLUMN brand_cache.domain IS 'Normalized domain (e.g., example.com without www)';
COMMENT ON COLUMN brand_cache.scraped_data IS 'JSONB containing logo, colors, fonts, and other brand data';
COMMENT ON COLUMN brand_cache.cached_at IS 'Timestamp when data was cached';
COMMENT ON COLUMN brand_cache.expires_at IS 'Timestamp when cache expires (30 days from cached_at)';
```

**Verification:** After running, check that the table exists:
```sql
SELECT * FROM brand_cache LIMIT 1;
```

---

## 📋 Step 2: Update TypeScript Interfaces

### File: `/lib/services/brandfetch.ts`

Replace the `BrandfetchBrand` interface (lines 9-26) with:

```typescript
interface BrandfetchBrand {
  name?: string
  description?: string
  longDescription?: string

  // Enhanced Logo Data
  logos?: Array<{
    theme?: 'dark' | 'light'
    type?: 'icon' | 'logo' | 'symbol' | 'other'
    formats?: Array<{
      src: string
      format: string
      width?: number
      height?: number
    }>
  }>

  // Enhanced Color Data
  colors?: Array<{
    hex: string
    type?: 'brand' | 'accent' | 'dark' | 'light'
    brightness?: number
  }>

  // Enhanced Font Data
  fonts?: Array<{
    name: string
    type?: 'title' | 'body'
    origin?: 'Google' | 'custom' | 'system'
    originId?: string
    weights?: number[]
  }>

  // Company Data
  company?: {
    industries?: string[]
    foundedYear?: number
    location?: {
      city?: string
      country?: string
      countryCode?: string
    }
  }

  // Social Links
  links?: Array<{
    name: string
    url: string
  }>
}
```

---

## 📋 Step 3: Update ScrapedData Type

### File: `/lib/types/session.ts`

Update the `ScrapedData` interface to include enhanced fields (add after line 36):

```typescript
export interface ScrapedData {
  // Core Brand Identity
  logo?: string | {
    original_url: string
    stored_url: string
    format: 'png'
    width: number
    height: number
  }

  // ENHANCED: Store multiple logo variants
  logo_variants?: {
    icon_dark?: { original_url: string; stored_url: string; format: 'png'; width: number; height: number }
    icon_light?: { original_url: string; stored_url: string; format: 'png'; width: number; height: number }
    full_dark?: { original_url: string; stored_url: string; format: 'png'; width: number; height: number }
    full_light?: { original_url: string; stored_url: string; format: 'png'; width: number; height: number }
  }

  // ENHANCED: Colors with type and brightness
  colors: string[] // Keep for backward compatibility
  colors_enhanced?: Array<{
    hex: string
    type: 'brand' | 'accent' | 'dark' | 'light' | 'unknown'
    brightness?: number
  }>

  // ENHANCED: Fonts with type and weights
  fonts?: string[] // Keep for backward compatibility
  fonts_enhanced?: Array<{
    name: string
    type: 'title' | 'body' | 'unknown'
    origin?: 'Google' | 'custom' | 'system'
    weights?: number[]
  }>

  title: string
  description: string
  tagline?: string | null

  // Visual Style
  style?: string
  imagery_style?: string
  iconography_style?: string
  logo_description?: string

  // Brand Voice & Messaging
  tone?: string
  sentiment?: string
  themes?: string[]
  brand_keywords?: string[]
  seo_keywords?: string[]

  // Audience & Market
  target_audience?: string
  industry?: string

  // ENHANCED: Store industries array from Brandfetch
  industries?: string[]

  cta_examples?: string[]
  social_platforms?: string[]

  // ENHANCED: Social media links
  social_links?: Array<{ name: string; url: string }>

  // Company Story
  company_story?: string

  // ENHANCED: Company metadata
  founded_year?: number
  location?: {
    city?: string
    country?: string
    countryCode?: string
  }

  headings: string[]
  content: string

  // Workflow Flags
  requires_manual_input?: boolean
  missing_fields?: string[]

  // Legacy field (deprecated, kept for backward compatibility)
  audience?: string
}
```

---

## 📋 Step 4: Update fetchBrandfetchData Function

### File: `/lib/services/brandfetch.ts`

Replace the `fetchBrandfetchData` function (lines 32-79) with:

```typescript
async function fetchBrandfetchData(domain: string): Promise<{
  logoUrl: string | null
  logoVariants: {
    icon_dark?: string
    icon_light?: string
    full_dark?: string
    full_light?: string
  }
  colors: string[]
  colorsEnhanced: Array<{ hex: string; type: string; brightness?: number }>
  fonts: string[]
  fontsEnhanced: Array<{ name: string; type: string; origin?: string; weights?: number[] }>
  industries?: string[]
  foundedYear?: number
  location?: { city?: string; country?: string; countryCode?: string }
  socialLinks?: Array<{ name: string; url: string }>
}> {
  try {
    console.log(`[Brandfetch] Fetching brand data for domain: ${domain}`)

    const response = await fetch(`${BASE_URL}/brands/${domain}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) {
      console.error(`[Brandfetch] API error (${response.status}):`, response.statusText)
      return {
        logoUrl: null,
        logoVariants: {},
        colors: [],
        colorsEnhanced: [],
        fonts: [],
        fontsEnhanced: [],
      }
    }

    const data: BrandfetchBrand = await response.json()

    // Extract primary logo URL (backward compatibility)
    let logoUrl: string | null = null
    const logo = data.logos?.[0]
    if (logo) {
      const pngFormat = logo.formats?.find(f => f.format === 'png')
      const anyFormat = logo.formats?.[0]
      logoUrl = pngFormat?.src || anyFormat?.src || null
    }

    // ENHANCED: Extract logo variants by type and theme
    const logoVariants: any = {}
    data.logos?.forEach(logo => {
      const type = logo.type || 'logo'
      const theme = logo.theme || 'dark'
      const pngFormat = logo.formats?.find(f => f.format === 'png')
      const url = pngFormat?.src || logo.formats?.[0]?.src

      if (url) {
        const key = `${type === 'icon' ? 'icon' : 'full'}_${theme}`
        if (!logoVariants[key]) {
          logoVariants[key] = url
        }
      }
    })

    // ENHANCED: Extract colors with type and brightness
    const colorsEnhanced = data.colors?.map(c => ({
      hex: c.hex.toUpperCase(),
      type: c.type || 'unknown',
      brightness: c.brightness,
    })) || []

    // Backward compatible: simple hex array
    const colors = colorsEnhanced
      .filter(c => c.hex.match(/^#[0-9A-F]{6}$/i))
      .map(c => c.hex)
      .slice(0, 5)

    // ENHANCED: Extract fonts with type and weights
    const fontsEnhanced = data.fonts?.map(f => ({
      name: f.name,
      type: f.type || 'unknown',
      origin: f.origin,
      weights: f.weights,
    })) || []

    // Backward compatible: simple name array
    const fonts = fontsEnhanced.map(f => f.name)

    // ENHANCED: Extract company data
    const industries = data.company?.industries
    const foundedYear = data.company?.foundedYear
    const location = data.company?.location
    const socialLinks = data.links

    console.log(`[Brandfetch] Extracted: logo=${!!logoUrl}, variants=${Object.keys(logoVariants).length}, colors=${colors.length} (${colorsEnhanced.length} enhanced), fonts=${fonts.length} (${fontsEnhanced.length} enhanced)`)
    if (industries) console.log(`[Brandfetch] Industries:`, industries)

    return {
      logoUrl,
      logoVariants,
      colors,
      colorsEnhanced,
      fonts,
      fontsEnhanced,
      industries,
      foundedYear,
      location,
      socialLinks,
    }
  } catch (error) {
    console.error('[Brandfetch] Data extraction error:', error)
    return {
      logoUrl: null,
      logoVariants: {},
      colors: [],
      colorsEnhanced: [],
      fonts: [],
      fontsEnhanced: [],
    }
  }
}
```

---

## 📋 Step 5: Update fetchBrandData to Use Enhanced Data

### File: `/lib/services/brandfetch.ts`

Update the `fetchBrandData` function (around line 176) to store enhanced data:

```typescript
// Single API call to fetch all data (logo, colors, fonts)
const {
  logoUrl,
  logoVariants,
  colors,
  colorsEnhanced,
  fonts,
  fontsEnhanced,
  industries,
  foundedYear,
  location,
  socialLinks,
} = await fetchBrandfetchData(domain)

// ... existing logo upload logic ...

const brandData = {
  logo: logoData,
  logo_variants: logoVariants, // TODO: Download and upload these variants too
  colors: colors.length >= 2 ? colors : [],
  colors_enhanced: colorsEnhanced,
  fonts,
  fonts_enhanced: fontsEnhanced,
  industries,
  founded_year: foundedYear,
  location,
  social_links: socialLinks,
}
```

---

## 📋 Step 6: Update AI Prompts to Use Enhanced Data

### File: `/lib/services/gemini.ts`

Update the `generateConcept` function to include enhanced color/font info:

Around line 59, update the template variables:

```typescript
// Prepare template variables
const colorInfo = scrapedData.colors_enhanced
  ? scrapedData.colors_enhanced.map(c => `${c.hex} (${c.type})`).join(', ')
  : scrapedData.colors?.join(', ') || 'N/A'

const fontInfo = scrapedData.fonts_enhanced
  ? scrapedData.fonts_enhanced
      .map(f => `${f.name} (${f.type}${f.weights ? `, weights: ${f.weights.join(',')}` : ''})`)
      .join(', ')
  : scrapedData.fonts?.join(', ') || 'N/A'

const industryInfo = scrapedData.industries?.join(', ') || scrapedData.industry || 'N/A'

const variables = {
  brandName: scrapedData.title || 'Unknown',
  description: scrapedData.description || 'N/A',
  colors: colorInfo,
  fonts: fontInfo,
  headings: scrapedData.headings?.slice(0, 5).join(', ') || 'N/A',
  industries: industryInfo,
  regenerateInstruction,
}
```

Update the fallback prompt to mention industries:

```typescript
Brand Information:
- Brand Name: ${variables.brandName}
- Description: ${variables.description}
- Industries: ${variables.industries}
- Primary Colors: ${variables.colors}
- Typography Style: ${variables.fonts}
- Key Content Themes: ${variables.headings}
```

---

## 📋 Step 7: Build and Test

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors

---

## 📋 Step 8: Test with a Real URL

Create a test script or use the admin panel to scrape a URL and verify:
1. Enhanced colors are stored in `colors_enhanced`
2. Enhanced fonts are stored in `fonts_enhanced`
3. Industries are populated
4. Data is cached in `brand_cache` table

---

## 📋 Step 9: Commit and Push

```bash
git add -A
git commit -m "Implement enhanced Brandfetch data extraction

TIER 1 ENHANCEMENTS:
- Extract color types (brand, accent, dark, light) + brightness
- Extract font types (title, body) + weights + origin
- Extract logo variants (icon/full, dark/light themes)
- Extract company industries for better design context

Technical changes:
- Updated BrandfetchBrand interface with full API response structure
- Enhanced ScrapedData type to store rich brand data
- Modified fetchBrandfetchData to extract all available fields
- Updated concept generation prompts to use enhanced data
- Maintained backward compatibility with existing code

Impact:
- AI can make informed color decisions (brand vs accent vs utility)
- Proper font hierarchy (title fonts for headings, body fonts for text)
- Right logo variant for each product type
- Industry-aware design aesthetic

🤖 Generated with Claude Code"

git push origin main
```

---

## ✅ Success Criteria

After implementation, you should see in logs:
```
[Brandfetch] Extracted: logo=true, variants=4, colors=3 (5 enhanced), fonts=2 (2 enhanced)
[Brandfetch] Industries: ["Technology", "Software"]
```

Database should show:
```json
{
  "colors_enhanced": [
    {"hex": "#FF0000", "type": "brand", "brightness": 127},
    {"hex": "#0000FF", "type": "accent", "brightness": 85}
  ],
  "fonts_enhanced": [
    {"name": "Roboto", "type": "title", "weights": [400, 700, 900]},
    {"name": "Open Sans", "type": "body", "weights": [400]}
  ],
  "industries": ["Technology", "Software"]
}
```

---

## 🚨 Important Notes

1. **Cache Migration:** The brand_cache table MUST be created before running the enhanced extraction
2. **Backward Compatibility:** Keep `colors: string[]` and `fonts: string[]` for existing code
3. **Logo Variants:** Initial implementation stores URLs only - future enhancement will download/upload all variants
4. **Testing:** Clear cache (`DELETE FROM brand_cache WHERE domain = 'test.com'`) to test fresh extractions

---

## 📚 Reference

Brandfetch API Documentation: https://docs.brandfetch.com/reference/brand-api

Current files modified:
- `/lib/services/brandfetch.ts` (extraction logic)
- `/lib/types/session.ts` (data types)
- `/lib/services/gemini.ts` (AI prompts)
- `/lib/db/migration-brand-cache.sql` (already exists)

Ready to implement! 🚀

-- Migration: v1.1 - Add prompts table
-- Date: 2025-10-12
-- Feature: Prompt Management System
-- Description: Create prompts table for managing LLM prompts with seed data

BEGIN;

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  category TEXT NOT NULL CHECK (category IN ('concept', 'motif', 'product', 'general')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prompts_key ON prompts(key);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_active ON prompts(is_active) WHERE is_active = TRUE;

-- Create updated_at trigger for prompts
CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON prompts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed default prompts with current system prompts

-- 1. Concept Generation Prompt
INSERT INTO prompts (key, name, description, template, variables, category) VALUES (
  'concept_generation',
  'Brand Concept Generation',
  'Generates a creative merchandise concept based on brand data',
  'You are a creative brand merchandise designer. Based on the following brand information, create a compelling merchandise concept that captures the brand''s essence.

Brand Information:
- Brand Name: {{brandName}}
- Description: {{description}}
- Primary Colors: {{colors}}
- Typography Style: {{fonts}}
- Key Content Themes: {{headings}}

Create a short, focused merchandise concept (2-3 sentences) that:
1. Reflects the brand''s visual identity and messaging
2. Works well across multiple product types (t-shirts, hoodies, mugs, etc.)
3. Is simple enough to be printed/embroidered
4. Has broad appeal to the target audience

Be specific about visual elements, color usage, and composition style.{{regenerateInstruction}}',
  '["brandName", "description", "colors", "fonts", "headings", "regenerateInstruction"]'::jsonb,
  'concept'
);

-- 2. Motif Prompt Generation
INSERT INTO prompts (key, name, description, template, variables, category) VALUES (
  'motif_prompt_generation',
  'Motif Image Generation Prompt',
  'Creates a detailed prompt for generating motif images',
  'You are a graphic designer creating a print-ready motif for merchandise. Based on the concept below, generate a detailed image generation prompt.

Merchandise Concept:
{{concept}}

Brand Colors: {{colors}}
Product Type: {{productName}}
Print Zones: {{printZones}}
Max Colors: {{maxColors}}
Constraints: {{constraints}}

Create a detailed image generation prompt (1-2 sentences) that:
1. Describes the visual motif clearly and specifically
2. Specifies composition, style, and visual elements
3. Respects the color and print zone constraints
4. Avoids text/typography (unless explicitly part of the concept)
5. Is suitable for {{productName}} merchandise

Return ONLY the image generation prompt, nothing else.{{regenerateInstruction}}',
  '["concept", "colors", "productName", "printZones", "maxColors", "constraints", "regenerateInstruction"]'::jsonb,
  'motif'
);

-- 3. Product Variation Prompt
INSERT INTO prompts (key, name, description, template, variables, category) VALUES (
  'product_variation',
  'Product-Specific Adaptation',
  'Adapts the base concept for specific product types',
  'Adapt this merchandise concept for a specific product:

Base Concept: {{concept}}

Product Details:
- Name: {{productName}}
- Print Zones: {{printZones}}
- Max Colors: {{maxColors}}
- Constraints: {{constraints}}
- Recommended Elements: {{recommendedElements}}

Brand Colors: {{colors}}

Provide specific guidance (2-3 sentences) on how to adapt the concept for this product, considering:
1. Print zone placement and sizing
2. Color usage within limits
3. Design elements that work best for this product type
4. Any product-specific constraints

Be concise and actionable.',
  '["concept", "productName", "printZones", "maxColors", "constraints", "recommendedElements", "colors"]'::jsonb,
  'product'
);

COMMIT;

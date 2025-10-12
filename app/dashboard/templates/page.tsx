'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Plus, Copy, Trash, Eye } from '@phosphor-icons/react'

export default function TemplatesPage() {
  // Mock templates data
  const templates = [
    {
      id: '1',
      name: 'Minimalist Brand',
      category: 'Logo Design',
      usageCount: 24,
      lastUsed: '2024-01-19',
      thumbnail: 'https://images.unsplash.com/photo-1626785774625-0b1c2c4eab67?w=300&h=200&fit=crop',
    },
    {
      id: '2',
      name: 'Bold Typography',
      category: 'Marketing',
      usageCount: 18,
      lastUsed: '2024-01-18',
      thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=300&h=200&fit=crop',
    },
    {
      id: '3',
      name: 'Product Showcase',
      category: 'E-commerce',
      usageCount: 31,
      lastUsed: '2024-01-17',
      thumbnail: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=200&fit=crop',
    },
    {
      id: '4',
      name: 'Corporate Clean',
      category: 'Business',
      usageCount: 15,
      lastUsed: '2024-01-16',
      thumbnail: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop',
    },
    {
      id: '5',
      name: 'Creative Splash',
      category: 'Art & Design',
      usageCount: 42,
      lastUsed: '2024-01-15',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop',
    },
    {
      id: '6',
      name: 'Tech Modern',
      category: 'Technology',
      usageCount: 28,
      lastUsed: '2024-01-14',
      thumbnail: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=300&h=200&fit=crop',
    },
  ]

  const [selectedCategory, setSelectedCategory] = useState('All')
  const categories = ['All', 'Logo Design', 'Marketing', 'E-commerce', 'Business', 'Art & Design', 'Technology']

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background overflow-x-hidden font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <DashboardSidebar />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-foreground tracking-light text-[32px] font-bold leading-tight min-w-72">
                Templates
              </p>
              <Button className="h-10 px-4 gap-2">
                <Plus size={20} weight="bold" />
                New Template
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="h-9 px-4 whitespace-nowrap"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-background overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Template Thumbnail */}
                  <div
                    className="w-full bg-center bg-no-repeat bg-cover h-[200px]"
                    style={{ backgroundImage: `url("${template.thumbnail}")` }}
                  />

                  {/* Template Info */}
                  <div className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-foreground text-lg font-bold leading-tight">
                          {template.name}
                        </h3>
                        <p className="text-muted-foreground text-sm font-normal leading-normal">
                          {template.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground text-xs">
                      <span>Used {template.usageCount} times</span>
                      <span>•</span>
                      <span>Last used {template.lastUsed}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="h-9 px-3 flex-1 gap-2">
                        <Eye size={16} weight="regular" />
                        Preview
                      </Button>
                      <Button variant="outline" className="h-9 px-3 gap-2">
                        <Copy size={16} weight="regular" />
                        Duplicate
                      </Button>
                      <Button variant="ghost" className="h-9 w-9 p-0">
                        <Trash size={16} weight="regular" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State (shown when no templates match filter) */}
            {filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-foreground text-lg font-bold leading-tight">
                    No templates found
                  </p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal text-center">
                    Try selecting a different category or create a new template
                  </p>
                </div>
                <Button className="h-10 px-4 gap-2">
                  <Plus size={20} weight="bold" />
                  Create Template
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

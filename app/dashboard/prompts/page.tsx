'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { PencilSimple, ArrowCounterClockwise } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Prompt {
  id: string
  key: string
  name: string
  description: string
  template: string
  variables: string[]
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [editedTemplate, setEditedTemplate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/admin/prompts')
      if (!response.ok) throw new Error('Failed to fetch prompts')
      const data = await response.json()
      setPrompts(data.prompts)
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setEditedTemplate(prompt.template)
  }

  const handleSave = async () => {
    if (!selectedPrompt) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/prompts/${selectedPrompt.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: editedTemplate }),
      })

      if (!response.ok) throw new Error('Failed to update prompt')

      // Refresh the list
      await fetchPrompts()
      setSelectedPrompt(null)
    } catch (error) {
      console.error('Error saving prompt:', error)
      alert('Failed to save prompt. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!selectedPrompt) return
    if (!confirm('Are you sure you want to reset this prompt to default? This cannot be undone.')) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/prompts/${selectedPrompt.key}/reset`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to reset prompt')

      // Refresh the list
      await fetchPrompts()
      setSelectedPrompt(null)
    } catch (error) {
      console.error('Error resetting prompt:', error)
      alert('Failed to reset prompt. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'concept':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'motif':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'product':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background overflow-x-hidden font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <DashboardSidebar />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div>
                <p className="text-foreground tracking-light text-[32px] font-bold leading-tight min-w-72">
                  AI Prompts
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage prompts used by the AI to generate concepts and designs
                </p>
              </div>
            </div>

            {/* Prompts Table */}
            {loading ? (
              <div className="px-4 py-3">
                <p className="text-muted-foreground">Loading prompts...</p>
              </div>
            ) : (
              <div className="px-4 py-3">
                <div className="flex overflow-hidden rounded-lg border border-border bg-background">
                  <table className="flex-1">
                    <thead>
                      <tr className="bg-background">
                        <th className="px-4 py-3 text-left text-foreground w-[300px] text-sm font-medium leading-normal">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-foreground w-[120px] text-sm font-medium leading-normal">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-foreground w-[150px] text-sm font-medium leading-normal">
                          Last Updated
                        </th>
                        <th className="px-4 py-3 text-left text-foreground w-[100px] text-sm font-medium leading-normal">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prompts.map((prompt) => (
                        <tr key={prompt.id} className="border-t border-border">
                          <td className="h-[72px] px-4 py-2 w-[300px]">
                            <div className="flex flex-col gap-1">
                              <p className="text-foreground text-sm font-medium leading-normal">
                                {prompt.name}
                              </p>
                              <p className="text-muted-foreground text-xs leading-normal line-clamp-1">
                                {prompt.description}
                              </p>
                            </div>
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[120px]">
                            <span
                              className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getCategoryBadgeColor(
                                prompt.category
                              )}`}
                            >
                              {prompt.category}
                            </span>
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[150px] text-muted-foreground text-sm font-normal leading-normal">
                            {new Date(prompt.updated_at).toLocaleDateString()}
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[100px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 gap-1"
                              onClick={() => handleEdit(prompt)}
                            >
                              <PencilSimple size={16} weight="regular" />
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPrompt?.name}</DialogTitle>
            <DialogDescription>{selectedPrompt?.description}</DialogDescription>
          </DialogHeader>

          {selectedPrompt && (
            <div className="space-y-4 py-4">
              {/* Variables Info */}
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <p className="text-sm font-medium text-foreground mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPrompt.variables.map((variable) => (
                    <code
                      key={variable}
                      className="px-2 py-1 bg-secondary rounded text-xs font-mono text-foreground"
                    >
                      {`{{${variable}}}`}
                    </code>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Use these variables in your template. They will be replaced with actual values when the prompt is used.
                </p>
              </div>

              {/* Template Editor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Prompt Template
                </label>
                <Textarea
                  value={editedTemplate}
                  onChange={(e) => setEditedTemplate(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Enter your prompt template..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={saving}
                  className="gap-2"
                >
                  <ArrowCounterClockwise size={16} weight="regular" />
                  Reset to Default
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPrompt(null)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  const router = useRouter()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [editedTemplate, setEditedTemplate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/prompts')
      if (!response.ok) throw new Error('Failed to fetch prompts')
      const data = await response.json()
      setPrompts(data.prompts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts')
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

      await fetchPrompts()
      setSelectedPrompt(null)
    } catch (error) {
      console.error('Error resetting prompt:', error)
      alert('Failed to reset prompt. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error('Failed to logout:', err)
    }
  }

  const getCategoryBadgeVariant = (category: string): 'default' | 'secondary' | 'outline' => {
    switch (category) {
      case 'concept':
        return 'default'
      case 'motif':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Prompt Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage prompts used by AI to generate concepts and designs
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/admin">← Back to Dashboard</a>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>AI Prompts</CardTitle>
            <CardDescription>
              Customize the prompts used for concept generation, motif creation, and product mockups
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading prompts...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Last Updated</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prompts.map((prompt) => (
                      <tr key={prompt.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium">{prompt.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {prompt.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={getCategoryBadgeVariant(prompt.category)}>
                            {prompt.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {new Date(prompt.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(prompt)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
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
              <div className="rounded-lg border bg-secondary/20 p-4">
                <p className="text-sm font-medium mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPrompt.variables.map((variable) => (
                    <code
                      key={variable}
                      className="px-2 py-1 bg-secondary rounded text-xs font-mono"
                    >
                      {`{{${variable}}}`}
                    </code>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Use these variables in your template. They will be replaced with actual values.
                </p>
              </div>

              {/* Template Editor */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt Template</label>
                <Textarea
                  value={editedTemplate}
                  onChange={(e) => setEditedTemplate(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Enter your prompt template..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  disabled={saving}
                >
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

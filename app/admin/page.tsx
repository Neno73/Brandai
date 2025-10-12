'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SessionTable } from '@/components/admin/session-table'
import { SessionDetail } from '@/components/admin/session-detail'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import type { Session, SessionStatus } from '@/lib/types/session'

interface PaginationInfo {
  total: number
  currentPage: number
  pageCount: number
  limit: number
  offset: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    currentPage: 1,
    pageCount: 1,
    limit: 20,
    offset: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const fetchSessions = async (page: number = 1, status: SessionStatus | 'all' = 'all') => {
    setLoading(true)
    setError(null)

    try {
      const offset = (page - 1) * pagination.limit
      const statusParam = status !== 'all' ? `&status=${status}` : ''
      const response = await fetch(
        `/api/admin/sessions?limit=${pagination.limit}&offset=${offset}${statusParam}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const data = await response.json()
      setSessions(data.sessions)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handlePageChange = (page: number) => {
    fetchSessions(page, statusFilter)
  }

  const handleStatusFilter = (status: SessionStatus | 'all') => {
    setStatusFilter(status)
    fetchSessions(1, status)
  }

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">BrendAI Admin</h1>
              <p className="text-sm text-muted-foreground">
                Session Management Dashboard
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/admin/products">Manage Products</a>
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
            <CardTitle>Sessions</CardTitle>
            <CardDescription>
              View and manage all design sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <SessionTable
                sessions={sessions}
                pagination={pagination}
                onPageChange={handlePageChange}
                onStatusFilter={handleStatusFilter}
                onViewDetails={handleViewDetails}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {selectedSession && <SessionDetail session={selectedSession} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

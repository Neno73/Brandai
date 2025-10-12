'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Session, SessionStatus } from '@/lib/types/session'

interface SessionTableProps {
  sessions: Session[]
  pagination: {
    total: number
    currentPage: number
    pageCount: number
  }
  onPageChange: (page: number) => void
  onStatusFilter: (status: SessionStatus | 'all') => void
  onViewDetails: (session: Session) => void
}

const STATUS_COLORS: Record<SessionStatus, string> = {
  scraping: 'bg-blue-500',
  concept: 'bg-yellow-500',
  motif: 'bg-purple-500',
  products: 'bg-indigo-500',
  complete: 'bg-green-500',
  failed: 'bg-red-500',
}

export function SessionTable({
  sessions,
  pagination,
  onPageChange,
  onStatusFilter,
  onViewDetails,
}: SessionTableProps) {
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all')

  const handleStatusChange = (value: string) => {
    const newStatus = value as SessionStatus | 'all'
    setStatusFilter(newStatus)
    onStatusFilter(newStatus)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div>
          <label className="text-sm font-medium mr-2">Status:</label>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="scraping">Scraping</SelectItem>
              <SelectItem value="concept">Concept</SelectItem>
              <SelectItem value="motif">Motif</SelectItem>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No sessions found
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-mono text-xs">
                    {session.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{session.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{session.url}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[session.status]}>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(session.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(session)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pageCount > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total: {pagination.total} sessions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.pageCount}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

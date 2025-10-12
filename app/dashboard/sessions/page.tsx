'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { MagnifyingGlass, Funnel } from '@phosphor-icons/react'
import { useState } from 'react'

export default function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock sessions data
  const sessions = [
    {
      id: '1',
      email: 'sophia.clark@email.com',
      url: 'website.com',
      status: 'Completed',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      email: 'liam.walker@email.com',
      url: 'website.net',
      status: 'In Progress',
      createdAt: '2024-01-16',
    },
    {
      id: '3',
      email: 'olivia.hall@email.org',
      url: 'website.io',
      status: 'Pending',
      createdAt: '2024-01-17',
    },
    {
      id: '4',
      email: 'noah.evans@email.co',
      url: 'website.biz',
      status: 'Completed',
      createdAt: '2024-01-18',
    },
    {
      id: '5',
      email: 'emma.cooper@email.info',
      url: 'website.info',
      status: 'In Progress',
      createdAt: '2024-01-19',
    },
    {
      id: '6',
      email: 'james.mitchell@email.com',
      url: 'design.studio',
      status: 'Completed',
      createdAt: '2024-01-19',
    },
    {
      id: '7',
      email: 'ava.thompson@email.net',
      url: 'portfolio.com',
      status: 'Failed',
      createdAt: '2024-01-18',
    },
    {
      id: '8',
      email: 'william.harris@email.org',
      url: 'shop.online',
      status: 'Pending',
      createdAt: '2024-01-17',
    },
  ]

  const filteredSessions = sessions.filter(
    (session) =>
      session.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background overflow-x-hidden font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <DashboardSidebar />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-foreground tracking-light text-[32px] font-bold leading-tight min-w-72">
                Sessions
              </p>
              <Button className="h-10 px-4">
                New Session
              </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 h-12">
                <MagnifyingGlass size={24} weight="regular" className="text-muted-foreground" />
                <Input
                  placeholder="Search by email or URL..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-12 px-4 gap-2">
                <Funnel size={20} weight="regular" />
                Filter
              </Button>
            </div>

            {/* Sessions Table */}
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-lg border border-border bg-background">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-background">
                      <th className="px-4 py-3 text-left text-foreground w-[400px] text-sm font-medium leading-normal">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-foreground w-[400px] text-sm font-medium leading-normal">
                        URL
                      </th>
                      <th className="px-4 py-3 text-left text-foreground w-60 text-sm font-medium leading-normal">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-foreground w-[400px] text-sm font-medium leading-normal">
                        Creation Date
                      </th>
                      <th className="px-4 py-3 text-left text-foreground w-40 text-sm font-medium leading-normal">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => (
                      <tr key={session.id} className="border-t border-border">
                        <td className="h-[72px] px-4 py-2 w-[400px] text-muted-foreground text-sm font-normal leading-normal">
                          {session.email}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-muted-foreground text-sm font-normal leading-normal">
                          {session.url}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                          <Button
                            variant="secondary"
                            className="h-8 px-4 w-full"
                          >
                            {session.status}
                          </Button>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-muted-foreground text-sm font-normal leading-normal">
                          {session.createdAt}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-40">
                          <Button
                            variant="ghost"
                            className="h-8 px-3 text-sm"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-muted-foreground text-sm">
                Showing {filteredSessions.length} of {sessions.length} sessions
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-9 px-4" disabled>
                  Previous
                </Button>
                <Button variant="outline" className="h-9 px-4">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

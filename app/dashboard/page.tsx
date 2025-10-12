'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

export default function DashboardPage() {
  // Mock statistics data
  const stats = [
    { label: 'Total Sessions', value: '142', change: '+12%', changeType: 'positive' },
    { label: 'Active Products', value: '24', change: '+3', changeType: 'positive' },
    { label: 'Completed', value: '98', change: '+8%', changeType: 'positive' },
    { label: 'In Progress', value: '23', change: '-2', changeType: 'negative' },
  ]

  // Mock recent sessions
  const recentSessions = [
    {
      id: '1',
      email: 'sophia.clark@email.com',
      url: 'website.com',
      status: 'Completed',
      createdAt: '2024-01-19',
    },
    {
      id: '2',
      email: 'liam.walker@email.com',
      url: 'website.net',
      status: 'In Progress',
      createdAt: '2024-01-19',
    },
    {
      id: '3',
      email: 'olivia.hall@email.org',
      url: 'website.io',
      status: 'Pending',
      createdAt: '2024-01-18',
    },
  ]

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background overflow-x-hidden font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <DashboardSidebar />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-foreground tracking-light text-[32px] font-bold leading-tight min-w-72">Dashboard</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 py-3">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
                >
                  <p className="text-muted-foreground text-sm font-medium leading-normal">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-foreground text-[28px] font-bold leading-tight">
                      {stat.value}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Sessions Section */}
            <div className="flex items-center justify-between px-4 pt-5 pb-3">
              <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em]">
                Recent Sessions
              </h2>
              <Link href="/dashboard/sessions">
                <Button variant="ghost" className="h-8 px-3 text-sm">
                  View All
                </Button>
              </Link>
            </div>

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
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.map((session) => (
                      <tr key={session.id} className="border-t border-border">
                        <td className="h-[72px] px-4 py-2 w-[400px] text-muted-foreground text-sm font-normal leading-normal">
                          {session.email}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-muted-foreground text-sm font-normal leading-normal">
                          {session.url}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                          <Button variant="secondary" className="h-8 px-4 w-full">
                            {session.status}
                          </Button>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-muted-foreground text-sm font-normal leading-normal">
                          {session.createdAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between px-4 pt-5 pb-3">
              <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em]">
                Quick Actions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3">
              <Link href="/dashboard/products">
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-6 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                      className="text-foreground"
                    >
                      <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z" />
                    </svg>
                    <h3 className="text-foreground text-lg font-bold leading-tight">
                      Manage Products
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    Add, edit, or remove products from your catalog
                  </p>
                </div>
              </Link>

              <Link href="/dashboard/templates">
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-6 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                      className="text-foreground"
                    >
                      <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z" />
                    </svg>
                    <h3 className="text-foreground text-lg font-bold leading-tight">
                      Manage Templates
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    Create and customize design templates
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, Users, Package, Files, ChatCircleText, Gear } from '@phosphor-icons/react'

export function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: House },
    { name: 'Sessions', href: '/dashboard/sessions', icon: Users },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Templates', href: '/dashboard/templates', icon: Files },
    { name: 'Prompts', href: '/dashboard/prompts', icon: ChatCircleText },
    { name: 'Settings', href: '/dashboard/settings', icon: Gear },
  ]

  return (
    <div className="layout-content-container flex flex-col w-80">
      <div className="flex h-full min-h-[700px] flex-col justify-between bg-background p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-foreground text-base font-medium leading-normal">BrendAI</h1>
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-secondary'
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  <Icon size={24} weight="fill" className="text-foreground" />
                  <p className="text-foreground text-sm font-medium leading-normal">
                    {item.name}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

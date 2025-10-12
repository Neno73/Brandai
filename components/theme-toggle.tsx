'use client'

import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-10 w-10"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={20} weight="regular" />
      ) : (
        <Sun size={20} weight="regular" />
      )}
    </Button>
  )
}

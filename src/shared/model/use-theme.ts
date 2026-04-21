import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme')
    return stored === 'dark' ? 'dark' : 'light'
  })

  const setTheme = (next: Theme) => {
    localStorage.setItem('theme', next)
    setThemeState(next)
    applyTheme(next)
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return { theme, setTheme } as const
}

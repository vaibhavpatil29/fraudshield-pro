import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('fs-theme') as Theme) || 'light',
  toggle: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('fs-theme', next)
    document.documentElement.setAttribute('data-theme', next)
    set({ theme: next })
  },
  setTheme: (theme) => {
    localStorage.setItem('fs-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    set({ theme })
  }
}))
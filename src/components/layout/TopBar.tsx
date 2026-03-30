import useDarkMode from '../../hooks/useDarkMode'
import { Button } from '@/components/ui/button'

export default function TopBar() {
  const { darkMode, toggleDarkMode } = useDarkMode()

  return (
    <header className="md:hidden sticky top-0 left-0 right-0 z-30 glass pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-5 h-14">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-purple-400">Finance</span>
          <span className="text-foreground ml-1">Tracker</span>
        </h1>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-xl bg-background/50 hover:bg-muted/50 border-border/50 transition-all duration-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </Button>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </header>
  )
}

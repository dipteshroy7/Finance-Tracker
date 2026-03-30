import { useLocation, useNavigate } from 'react-router-dom'
import useDarkMode from '../../hooks/useDarkMode'
import { TABS } from '../../utils/constants'
import type { ReactNode } from 'react'

const icons: Record<string, (active: boolean) => ReactNode> = {
  receipt: (active) => (
    <svg className="w-5 h-5 shrink-0" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      {active ? (
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      )}
    </svg>
  ),
  chart: (active) => (
    <svg className="w-5 h-5 shrink-0" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      {active ? (
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      )}
    </svg>
  ),
  transfer: (active) => (
    <svg className="w-5 h-5 shrink-0" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      {active ? (
        <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      )}
    </svg>
  ),
  tag: (active) => (
    <svg className="w-5 h-5 shrink-0" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      {active ? (
        <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      )}
    </svg>
  ),
}

export default function SideNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { darkMode, toggleDarkMode } = useDarkMode()

  return (
    <aside className="hidden md:flex flex-col w-64 glass border-r border-white/5 h-screen sticky top-0 shrink-0">
      <div className="flex h-20 items-center px-8 border-b border-white/5">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-purple-400">Finance</span>
          <br/>
          <span className="text-foreground ml-1">Tracker</span>
        </h1>
      </div>
      
      <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
        {TABS.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path)

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 relative group ${
                isActive
                  ? 'bg-primary/10 text-primary-light'
                  : 'text-text-muted hover:bg-white/5 hover:text-foreground'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-lg gradient-primary" />
              )}
              {icons[tab.icon](isActive)}
              <span className="text-sm font-semibold tracking-wide">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-4 px-4 py-3.5 w-full rounded-xl transition-all duration-200 text-text-muted hover:bg-white/5 hover:text-foreground"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg className="w-5 h-5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-muted-foreground shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
          <span className="text-sm font-semibold tracking-wide">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>
    </aside>
  )
}

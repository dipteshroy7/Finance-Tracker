import { useLocation, useNavigate } from 'react-router-dom'
import {
  Receipt,
  Wallet,
  BarChart3,
  ArrowLeftRight,
  Tags,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import useDarkMode from '../../hooks/useDarkMode'
import { TABS } from '../../utils/constants'
import useUIStore from '../../store/uiStore'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  receipt: Receipt,
  wallet: Wallet,
  chart: BarChart3,
  transfer: ArrowLeftRight,
  tag: Tags,
}

export default function SideNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 shrink-0 border-r border-border bg-card transition-[width] duration-200 ease-out ${
        sidebarCollapsed ? 'w-[72px]' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!sidebarCollapsed && (
          <h1 className="text-lg font-bold tracking-tight text-foreground animate-fade-in">
            <span className="text-primary">Finance</span>
            <span className="text-foreground"> Tracker</span>
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150 cursor-pointer"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {TABS.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path)
          const Icon = iconMap[tab.icon]

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              title={sidebarCollapsed ? tab.label : undefined}
              className={`flex items-center gap-3 rounded-lg transition-all duration-150 relative cursor-pointer ${
                sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
              )}
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              {!sidebarCollapsed && (
                <span className="text-sm">{tab.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button
          onClick={toggleDarkMode}
          className={`flex items-center gap-3 w-full rounded-lg transition-all duration-150 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer ${
            sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
          }`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun size={20} strokeWidth={1.5} className="text-amber-500" />
          ) : (
            <Moon size={20} strokeWidth={1.5} />
          )}
          {!sidebarCollapsed && (
            <span className="text-sm">
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}

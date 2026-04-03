import { useLocation, useNavigate } from 'react-router-dom'
import {
  Receipt,
  Wallet,
  BarChart3,
  ArrowLeftRight,
  Tags,
} from 'lucide-react'
import { TABS } from '../../utils/constants'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  receipt: Receipt,
  wallet: Wallet,
  chart: BarChart3,
  transfer: ArrowLeftRight,
  tag: Tags,
}

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16">
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
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 relative cursor-pointer ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-primary" />
              )}
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

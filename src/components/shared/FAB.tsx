import useUIStore from '../../store/uiStore'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function FAB() {
  const openModal = useUIStore((s) => s.openModal)

  return (
    <Button
      onClick={() => openModal()}
      className="fixed bottom-22 right-5 z-40 w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all duration-200 flex items-center justify-center animate-glow p-0"
      aria-label="Add transaction"
    >
      <Plus size={28} />
    </Button>
  )
}

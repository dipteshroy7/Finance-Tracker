import useUIStore from '../../store/uiStore'
import { Plus } from 'lucide-react'

export default function FAB() {
  const openModal = useUIStore((s) => s.openModal)

  return (
    <button
      onClick={() => openModal()}
      className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:bg-primary-dark active:scale-95 transition-all duration-200 flex items-center justify-center animate-glow cursor-pointer"
      aria-label="Add transaction"
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  )
}

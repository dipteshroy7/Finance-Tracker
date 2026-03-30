import useUIStore from '../../store/uiStore'

export default function FAB() {
  const openModal = useUIStore((s) => s.openModal)

  return (
    <button
      onClick={() => openModal()}
      className="fixed bottom-22 right-5 z-40 w-14 h-14 rounded-2xl gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all duration-200 flex items-center justify-center animate-glow"
      aria-label="Add transaction"
    >
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  )
}

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import TransactionForm from './TransactionForm'
import useUIStore from '../../store/uiStore'

export default function TransactionModal() {
  const isOpen = useUIStore((s) => s.isModalOpen)
  const closeModal = useUIStore((s) => s.closeModal)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden h-[100dvh] sm:h-[90vh] w-full sm:w-auto max-w-none sm:rounded-2xl border border-border bg-background"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Transaction Form</DialogTitle>
        <DialogDescription className="sr-only">Add or edit transaction</DialogDescription>
        <div className="flex flex-col h-full w-full">
          <TransactionForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}

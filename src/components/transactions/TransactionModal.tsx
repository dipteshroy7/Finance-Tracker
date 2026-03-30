import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import TransactionForm from './TransactionForm'
import useUIStore from '../../store/uiStore'

export default function TransactionModal() {
  const isOpen = useUIStore((s) => s.isModalOpen)
  const editingTransaction = useUIStore((s) => s.editingTransaction)
  const closeModal = useUIStore((s) => s.closeModal)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden max-h-[92vh]">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg font-semibold">
            {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Add a new expense, income, or transfer transaction
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto">
          <TransactionForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}

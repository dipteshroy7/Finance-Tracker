import Modal from '../shared/Modal'
import TransactionForm from './TransactionForm'
import useUIStore from '../../store/uiStore'

export default function TransactionModal() {
  const isOpen = useUIStore((s) => s.isModalOpen)
  const editingTransaction = useUIStore((s) => s.editingTransaction)
  const closeModal = useUIStore((s) => s.closeModal)

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}
    >
      <TransactionForm />
    </Modal>
  )
}

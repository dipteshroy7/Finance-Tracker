import { useState, useEffect } from 'react'
import type { Account } from '../../types'
import useAccountStore from '../../store/accountStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ACCOUNT_ICONS } from '../../utils/categoryIcons'

interface AccountFormProps {
  editingAccount: Account | null
  onClose: () => void
}

export default function AccountForm({ editingAccount, onClose }: AccountFormProps) {
  const addAccount = useAccountStore((s) => s.addAccount)
  const updateAccount = useAccountStore((s) => s.updateAccount)

  const [name, setName] = useState('')
  const [initialAmount, setInitialAmount] = useState(0)
  const [icon, setIcon] = useState(ACCOUNT_ICONS[0].name)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name)
      setInitialAmount(Number(editingAccount.initial_amount) || 0)
      setIcon(editingAccount.icon ?? ACCOUNT_ICONS[0].name)
    }
  }, [editingAccount])

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, {
          name: name.trim(),
          initial_amount: initialAmount,
          icon,
        })
      } else {
        await addAccount(name.trim(), initialAmount, icon)
      }
      onClose()
    } catch (err) {
      console.error('Failed to save account:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 font-sans">
          Account Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Cash, Bank, UPI"
          className="h-11 rounded-xl bg-secondary border-0 px-4"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 font-sans">
          Initial Amount
        </label>
        <Input
          type="number"
          value={initialAmount || ''}
          onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className="h-11 rounded-xl bg-secondary border-0 px-4"
          min={0}
          step={0.01}
        />
      </div>

      {/* Icon Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 font-sans">
          Icon
        </label>
        <div className="overflow-x-auto scrollbar-hide rounded-xl bg-secondary/50 border border-border p-2.5">
          <div className="flex gap-2 w-max">
            {Array.from({ length: Math.ceil(ACCOUNT_ICONS.length / 2) }, (_, col) => {
              const top = ACCOUNT_ICONS[col * 2]
              const bottom = ACCOUNT_ICONS[col * 2 + 1]
              return (
                <div key={col} className="flex flex-col gap-2">
                  {[top, bottom].filter(Boolean).map((def) => {
                    const Icon = def.icon
                    const isSelected = icon === def.name
                    return (
                      <button
                        key={def.name}
                        type="button"
                        onClick={() => setIcon(def.name)}
                        className={cn(
                          "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-150",
                          isSelected
                            ? "bg-primary text-white shadow-md scale-105"
                            : "bg-secondary text-muted-foreground hover:bg-accent"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving || !name.trim()}
          className="flex-1 rounded-xl h-11"
        >
          {saving ? 'Saving...' : editingAccount ? 'Update' : 'Add Account'}
        </Button>
      </div>
    </div>
  )
}

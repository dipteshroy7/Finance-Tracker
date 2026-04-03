import { useState, useEffect, useMemo, useRef } from "react";
import { X, Check, CheckCircle2 } from "lucide-react";
import type { TransactionType } from "../../types";
import useTransactionStore from "../../store/transactionStore";
import useCategoryStore from "../../store/categoryStore";
import useAccountStore from "../../store/accountStore";
import useUIStore from "../../store/uiStore";
import NumberPad from "../shared/NumberPad";
import { ItemPickerDrawer } from "../shared/ItemPickerDrawer";
import { getIconComponent } from "../../utils/categoryIcons";
import { toLocalDatetime, combineDatetime, formatCurrency } from "../../utils/formatters";
import { computeAccountBalances } from "../../utils/accountBalances";
import { cn } from "@/lib/utils";

// --- Subcomponents ---

function SelectionButton({ 
  label, 
  title, 
  iconName, 
  onClick 
}: { 
  label: string; 
  title: string; 
  iconName: string | null; 
  onClick: () => void;
}) {
  const Icon = getIconComponent(iconName);
  
  return (
    <button 
      onClick={onClick}
      className="flex-1 flex flex-col pt-2 pb-3 px-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all focus:outline-none backdrop-blur-md shadow-sm"
    >
      <span className="text-[11px] text-muted-foreground/80 tracking-wider uppercase text-center w-full mb-1.5 font-semibold">{label}</span>
      <div className="flex items-center justify-center gap-2">
        <Icon size={18} className="text-primary shrink-0 opacity-90" />
        <span className="text-sm font-medium text-foreground line-clamp-1">{title}</span>
      </div>
    </button>
  );
}

function GridLayout({ items, onSelect, balances }: { items: any[], onSelect: (id: string) => void, balances?: Map<string, number> }) {
  return (
    <div className="grid grid-cols-4 gap-y-6 gap-x-2 pt-2 pb-6">
      {items.map(item => {
        const Icon = getIconComponent(item.icon);
        return (
          <button 
            key={item.id} 
            onClick={() => onSelect(item.id)} 
            className="flex flex-col items-center focus:outline-none group"
          >
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-primary bg-white/5 border border-white/5 group-hover:bg-primary group-hover:text-primary-foreground group-active:scale-95 transition-all shrink-0 shadow-sm mb-2 backdrop-blur-sm" 
            >
              <Icon size={24} />
            </div>
            <span className="text-xs text-center text-foreground/90 line-clamp-2 px-1 leading-tight">{item.name}</span>
            {balances && (
              <span className="text-[10px] text-muted-foreground/70 mt-1 font-semibold tracking-tight">
                {formatCurrency(balances.get(item.id) ?? 0)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// --- Main Form ---

export default function TransactionForm() {
    const editingTransaction = useUIStore((s) => s.editingTransaction);
    const closeModal = useUIStore((s) => s.closeModal);
    const addTransaction = useTransactionStore((s) => s.addTransaction);
    const updateTransaction = useTransactionStore((s) => s.updateTransaction);
    const transactions = useTransactionStore((s) => s.transactions);
    const categories = useCategoryStore((s) => s.categories);
    const accounts = useAccountStore((s) => s.accounts);

    const isEditing = !!editingTransaction;
    const now = new Date();
    const defaultDate = now.toISOString().split("T")[0];
    const defaultTime = now.toTimeString().slice(0, 5);

    const [type, setType] = useState<TransactionType>("expense");
    const [amount, setAmount] = useState(0);
    const [categoryId, setCategoryId] = useState("");
    const [accountId, setAccountId] = useState("");
    const [fromAccountId, setFromAccountId] = useState("");
    const [toAccountId, setToAccountId] = useState("");
    const [nos, setNos] = useState("");
    const [date, setDate] = useState(defaultDate);
    const [time, setTime] = useState(defaultTime);
    const [saving, setSaving] = useState(false);

    // Picker states
    const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
    const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);
    const [isFromAccountPickerOpen, setIsFromAccountPickerOpen] = useState(false);
    const [isToAccountPickerOpen, setIsToAccountPickerOpen] = useState(false);

    useEffect(() => {
        if (editingTransaction) {
            const tx = editingTransaction;
            setType(tx.type);
            setAmount(Number(tx.amount));
            setCategoryId(tx.category_id ?? "");
            setAccountId(tx.account_id ?? "");
            setFromAccountId(tx.from_account_id ?? "");
            setToAccountId(tx.to_account_id ?? "");
            setNos(tx.nos ?? "");
            const { date: d, time: t } = toLocalDatetime(tx.date);
            setDate(d);
            setTime(t);
        }
    }, [editingTransaction]);

    const filteredCategories = useMemo(
        () => categories.filter((c) => c.type === (type === "transfer" ? "expense" : type)),
        [categories, type],
    );

    const accountBalances = useMemo(
        () => computeAccountBalances(accounts, transactions),
        [accounts, transactions]
    );

    const handleSubmit = async () => {
        if (amount === 0) return;
        setSaving(true);
        try {
            const payload = {
                date: combineDatetime(date, time),
                type,
                amount,
                category_id: type === "transfer" ? null : categoryId || null,
                account_id: type === "transfer" ? null : accountId || null,
                from_account_id: type === "transfer" ? fromAccountId || null : null,
                to_account_id: type === "transfer" ? toAccountId || null : null,
                nos,
            };

            if (isEditing) {
                await updateTransaction(editingTransaction!.id, payload);
            } else {
                await addTransaction(payload);
            }
            closeModal();
        } catch (err) {
            console.error("Failed to save transaction:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-w-[450px] font-sans">
            {/* ── Custom Header ── */}
            <div className="flex justify-between items-center px-5 py-4 shrink-0">
                <button
                    onClick={closeModal}
                    className="p-2 -ml-2 rounded-xl hover:bg-white/10 active:scale-95 text-muted-foreground hover:text-foreground text-sm font-semibold flex items-center gap-2 focus:outline-none tracking-wide transition-all"
                >
                    <X size={18} /> CANCEL
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={
                        saving ||
                        amount === 0 ||
                        (type === "transfer"
                            ? !fromAccountId || !toAccountId
                            : !categoryId || !accountId)
                    }
                    className="p-2 -mr-2 rounded-xl hover:bg-primary/20 active:scale-95 text-primary text-sm font-semibold flex items-center gap-2 focus:outline-none disabled:opacity-50 tracking-wide transition-all"
                >
                    <Check size={18} /> SAVE
                </button>
            </div>

            {/* ── Transaction Type Tabs ── */}
            <div className="flex justify-center items-center gap-4 py-2 px-4 shrink-0">
                {(["income", "expense", "transfer"] as TransactionType[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        className={cn(
                            "px-4 py-2 rounded-full text-[13px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 transition-all duration-200 active:scale-95",
                            type === t
                                ? "bg-white/10 text-foreground shadow-sm backdrop-blur-md border border-white/10"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent",
                        )}
                    >
                        {type === t && (
                            <CheckCircle2 size={16} className="text-primary fill-primary/20" />
                        )}
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Top Section (Scrollable on tiny screens) ── */}
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2 flex flex-col gap-4">
                {/* ── Selection Buttons ── */}
                {type === "transfer" ? (
                    <div className="flex gap-4 shrink-0">
                        <SelectionButton
                            label="From"
                            iconName={
                                accounts.find((a) => a.id === fromAccountId)?.icon || "wallet"
                            }
                            title={accounts.find((a) => a.id === fromAccountId)?.name || "Account"}
                            onClick={() => setIsFromAccountPickerOpen(true)}
                        />
                        <SelectionButton
                            label="To"
                            iconName={accounts.find((a) => a.id === toAccountId)?.icon || "wallet"}
                            title={accounts.find((a) => a.id === toAccountId)?.name || "Account"}
                            onClick={() => setIsToAccountPickerOpen(true)}
                        />
                    </div>
                ) : (
                    <div className="flex gap-4 shrink-0">
                        <SelectionButton
                            label="Account"
                            iconName={accounts.find((a) => a.id === accountId)?.icon || "wallet"}
                            title={accounts.find((a) => a.id === accountId)?.name || "Account"}
                            onClick={() => setIsAccountPickerOpen(true)}
                        />
                        <SelectionButton
                            label="Category"
                            iconName={
                                filteredCategories.find((c) => c.id === categoryId)?.icon || "tag"
                            }
                            title={
                                filteredCategories.find((c) => c.id === categoryId)?.name ||
                                "Category"
                            }
                            onClick={() => setIsCategoryPickerOpen(true)}
                        />
                    </div>
                )}

                {/* ── Notes ── */}
                <textarea
                    value={nos}
                    onChange={(e) => setNos(e.target.value)}
                    placeholder="Add notes"
                    className="w-full bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl p-4 text-foreground text-base placeholder:text-muted-foreground/60 focus:outline-none focus:border-white/20 resize-none h-24 shrink-0 backdrop-blur-md transition-all shadow-inner"
                />
            </div>

            {/* ── NumberPad Container ── */}
            <div className="shrink-0 pb-0">
                <NumberPad value={amount} onChange={setAmount} />

                {/* ── Bottom Bar ── */}
                <div className="flex border-t border-white/5 mt-1 h-14 bg-white/[0.02] backdrop-blur-sm">
                    <div className="flex-1 flex border-r border-white/5 hover:bg-white/10 transition-colors relative">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-full bg-transparent border-0 text-center text-sm font-medium tracking-wide text-muted-foreground outline-none cursor-pointer focus:text-foreground px-2 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                    </div>
                    <div className="flex-1 flex hover:bg-white/10 transition-colors relative">
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full h-full bg-transparent border-0 text-center text-sm font-medium tracking-wide text-muted-foreground outline-none cursor-pointer focus:text-foreground px-2 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* ── Pickers ── */}
            <ItemPickerDrawer
                open={isCategoryPickerOpen}
                setOpen={setIsCategoryPickerOpen}
                title="Select a category"
            >
                <GridLayout
                    items={filteredCategories}
                    onSelect={(id) => {
                        setCategoryId(id);
                        setIsCategoryPickerOpen(false);
                    }}
                />
            </ItemPickerDrawer>
            <ItemPickerDrawer
                open={isAccountPickerOpen}
                setOpen={setIsAccountPickerOpen}
                title="Select an account"
            >
                <GridLayout
                    items={accounts}
                    balances={accountBalances}
                    onSelect={(id) => {
                        setAccountId(id);
                        setIsAccountPickerOpen(false);
                    }}
                />
            </ItemPickerDrawer>
            <ItemPickerDrawer
                open={isFromAccountPickerOpen}
                setOpen={setIsFromAccountPickerOpen}
                title="Select source account"
            >
                <GridLayout
                    items={accounts}
                    balances={accountBalances}
                    onSelect={(id) => {
                        setFromAccountId(id);
                        setIsFromAccountPickerOpen(false);
                    }}
                />
            </ItemPickerDrawer>
            <ItemPickerDrawer
                open={isToAccountPickerOpen}
                setOpen={setIsToAccountPickerOpen}
                title="Select destination account"
            >
                <GridLayout
                    items={accounts}
                    balances={accountBalances}
                    onSelect={(id) => {
                        setToAccountId(id);
                        setIsToAccountPickerOpen(false);
                    }}
                />
            </ItemPickerDrawer>
        </div>
    );
}

import { useState, useMemo, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import TransactionItem from "../transactions/TransactionItem";
import EmptyState from "./EmptyState";
import ConfirmDialog from "./ConfirmDialog";
import { Button } from "@/components/ui/button";
import useTransactionStore from "../../store/transactionStore";
import useUIStore from "../../store/uiStore";
import { formatCurrency } from "../../utils/formatters";
import { Receipt, AlertTriangle } from "lucide-react";
import type { Transaction } from "../../types";

interface TransactionListDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    transactions: Transaction[];
}

export default function TransactionListDrawer({
    open,
    onOpenChange,
    title,
    transactions,
}: TransactionListDrawerProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const openModal = useUIStore((s) => s.openModal);
    const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleClose = () => {
        setDeleteId(null);
        onOpenChange(false);
    };

    const handleEdit = useCallback(
        (tx: Transaction) => {
            if (deleteId) return;
            handleClose();
            setTimeout(() => openModal(tx), 200);
        },
        [deleteId, openModal],
    );

    const handleDeleteClick = useCallback(
        (id: string) => {
            if (deleteId) return;
            setDeleteId(id);
        },
        [deleteId],
    );

    const handleConfirmDelete = useCallback(() => {
        if (deleteId) deleteTransaction(deleteId);
        setDeleteId(null);
    }, [deleteId, deleteTransaction]);

    const { totalIncome, totalExpense } = useMemo(() => {
        let income = 0;
        let expense = 0;
        for (const tx of transactions) {
            const amt = Number(tx.amount);
            if (tx.type === "income") income += amt;
            else if (tx.type === "expense") expense += amt;
        }
        return { totalIncome: income, totalExpense: expense };
    }, [transactions]);

    const summaryBar = transactions.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border text-xs tabular-nums shrink-0">
            <span className="text-muted-foreground">
                {transactions.length} transaction
                {transactions.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-3">
                {totalIncome > 0 && (
                    <span className="text-income font-medium">
                        +{formatCurrency(totalIncome)}
                    </span>
                )}
                {totalExpense > 0 && (
                    <span className="text-expense font-medium">
                        -{formatCurrency(totalExpense)}
                    </span>
                )}
            </div>
        </div>
    );

    const transactionList = (
        <div className="overflow-y-auto flex-1">
            {transactions.length === 0 ? (
                <EmptyState
                    title="No transactions"
                    description={`No transactions found for ${title}`}
                    icon={Receipt}
                />
            ) : (
                <div className="divide-y divide-border">
                    {transactions.map((tx) => (
                        <TransactionItem
                            key={tx.id}
                            transaction={tx}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    if (isDesktop) {
        return (
            <>
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="sm:max-w-lg max-h-[80vh] p-0 gap-0 overflow-hidden border-border bg-card flex flex-col">
                        <DialogHeader className="px-5 pt-5 pb-3 shrink-0">
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription className="sr-only">
                                Transactions for {title}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col flex-1 min-h-0">
                            {summaryBar}
                            {transactionList}
                        </div>
                    </DialogContent>
                </Dialog>
                <ConfirmDialog
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    onConfirm={handleConfirmDelete}
                    title="Delete transaction?"
                    message="This action cannot be undone."
                    confirmLabel="Delete"
                    danger
                />
            </>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="!mt-0 !max-h-[100dvh] h-[100dvh] bg-card !border-t-0">
                <DrawerHeader className="px-4 py-3 border-b border-border shrink-0">
                    <DrawerTitle className="text-foreground text-base font-semibold">
                        {title}
                    </DrawerTitle>
                    <DrawerDescription className="sr-only">
                        Transactions for {title}
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col flex-1 min-h-0">
                    {summaryBar}
                    <div className={`overflow-y-auto flex-1 ${deleteId ? "pointer-events-none" : ""}`}>
                        {transactions.length === 0 ? (
                            <EmptyState
                                title="No transactions"
                                description={`No transactions found for ${title}`}
                                icon={Receipt}
                            />
                        ) : (
                            <div className="divide-y divide-border">
                                {transactions.map((tx) => (
                                    <TransactionItem
                                        key={tx.id}
                                        transaction={tx}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Inline delete confirmation — no portal, avoids vaul pointer event interception */}
                    {deleteId && (
                        <div data-vaul-no-drag className="shrink-0 border-t border-border bg-card p-4 animate-slide-up">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                                    <AlertTriangle size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Delete transaction?
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setDeleteId(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleConfirmDelete}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="pb-[env(safe-area-inset-bottom)]" />
            </DrawerContent>
        </Drawer>
    );
}

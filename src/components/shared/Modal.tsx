import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === "Escape") onClose();
            };
            window.addEventListener("keydown", handleEsc);
            return () => {
                document.body.style.overflow = "";
                window.removeEventListener("keydown", handleEsc);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />
            <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-hidden animate-slide-up flex flex-col rounded-t-3xl sm:rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a1d2e] shadow-2xl">
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-5 pb-0">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <svg
                                className="w-5 h-5 text-text-muted"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Scrollable content — no padding here, children manage their own */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
}

import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-dark placeholder-text-muted/60 outline-none focus:border-primary/50 focus:bg-white/8 focus:ring-1 focus:ring-primary/30 transition-all duration-200 ${className}`}
        {...props}
      />
    </div>
  )
}

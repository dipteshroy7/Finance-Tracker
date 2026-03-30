import type { InputHTMLAttributes } from 'react'

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function DatePicker({ label, className = '', id, ...props }: DatePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}
      <input
        id={id}
        type="date"
        className={`w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-text dark:text-text-dark outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-white/8 focus:ring-1 focus:ring-primary/30 transition-all duration-200 ${className}`}
        {...props}
      />
    </div>
  )
}

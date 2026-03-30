import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export default function Select({
  label,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-text dark:text-text-dark outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-white/8 focus:ring-1 focus:ring-primary/30 transition-all duration-200 ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

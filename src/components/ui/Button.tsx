import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variants = {
  primary: 'gradient-primary text-white hover:opacity-90 active:opacity-80 shadow-lg shadow-primary/20',
  danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 active:opacity-80',
  ghost: 'bg-transparent text-text-muted hover:text-text-dark hover:bg-white/5 active:bg-white/10',
  secondary: 'glass-card text-text-dark hover:bg-white/10 active:bg-white/15',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

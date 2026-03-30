import { useState, useCallback } from 'react'
import {
  appendDigit,
  appendOperator,
  appendDecimal,
  backspace,
  evaluate,
} from '../../utils/numberPadParser'
import { formatCurrency } from '../../utils/formatters'

interface NumberPadProps {
  value: number
  onChange: (value: number) => void
}

export default function NumberPad({ value, onChange }: NumberPadProps) {
  const [expression, setExpression] = useState(value ? String(value) : '')

  const result = evaluate(expression)

  const handleDigit = useCallback(
    (digit: string) => {
      const next = appendDigit(expression, digit)
      setExpression(next)
      const r = evaluate(next)
      if (r !== null) onChange(r)
    },
    [expression, onChange]
  )

  const handleOperator = useCallback(
    (op: string) => {
      const next = appendOperator(expression, op)
      setExpression(next)
    },
    [expression]
  )

  const handleDecimal = useCallback(() => {
    const next = appendDecimal(expression)
    setExpression(next)
  }, [expression])

  const handleBackspace = useCallback(() => {
    const next = backspace(expression)
    setExpression(next)
    const r = evaluate(next)
    onChange(r ?? 0)
  }, [expression, onChange])

  const handleClear = useCallback(() => {
    setExpression('')
    onChange(0)
  }, [onChange])

  const handleEquals = useCallback(() => {
    if (result !== null) {
      setExpression(String(result))
      onChange(result)
    }
  }, [result, onChange])

  const btnBase =
    'flex items-center justify-center h-12 rounded-xl text-base font-semibold transition-all duration-150 active:scale-95 select-none'

  return (
    <div className="space-y-2">
      {/* Display */}
      <div className="glass-card px-4 py-3">
        <div className="text-right text-xs text-text-muted font-mono min-h-[16px] truncate">
          {expression || '0'}
        </div>
        <div className="text-right text-2xl font-bold text-text-dark font-mono mt-0.5">
          {result !== null ? formatCurrency(result) : formatCurrency(0)}
        </div>
      </div>

      {/* Keypad grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {['7', '8', '9', '/'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              key === '/' ? handleOperator(key) : handleDigit(key)
            }
            className={`${btnBase} ${
              key === '/'
                ? 'bg-primary/15 text-primary-light'
                : 'bg-white/5 text-text-dark hover:bg-white/10'
            }`}
          >
            {key === '/' ? '\u00F7' : key}
          </button>
        ))}
        {['4', '5', '6', '*'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              key === '*' ? handleOperator(key) : handleDigit(key)
            }
            className={`${btnBase} ${
              key === '*'
                ? 'bg-primary/15 text-primary-light'
                : 'bg-white/5 text-text-dark hover:bg-white/10'
            }`}
          >
            {key === '*' ? '\u00D7' : key}
          </button>
        ))}
        {['1', '2', '3', '-'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              key === '-' ? handleOperator(key) : handleDigit(key)
            }
            className={`${btnBase} ${
              key === '-'
                ? 'bg-primary/15 text-primary-light'
                : 'bg-white/5 text-text-dark hover:bg-white/10'
            }`}
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className={`${btnBase} bg-white/5 text-text-dark hover:bg-white/10`}
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDecimal}
          className={`${btnBase} bg-white/5 text-text-dark hover:bg-white/10`}
        >
          .
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className={`${btnBase} bg-white/5 text-text-dark hover:bg-white/10`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l7-7 11 0v14H10L3 12z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleOperator('+')}
          className={`${btnBase} bg-primary/15 text-primary-light`}
        >
          +
        </button>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={handleClear}
          className={`${btnBase} bg-expense/15 text-expense`}
        >
          C
        </button>
        <button
          type="button"
          onClick={handleEquals}
          className={`${btnBase} gradient-primary text-white`}
        >
          =
        </button>
      </div>
    </div>
  )
}

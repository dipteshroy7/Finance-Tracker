import { useState, useCallback, useRef, useEffect } from 'react'
import {
  appendDigit,
  appendOperator,
  appendDecimal,
  backspace,
  evaluate,
} from '../../utils/numberPadParser'
import { formatCurrency } from '../../utils/formatters'
import { Delete } from 'lucide-react'

interface NumberPadProps {
  value: number
  onChange: (value: number) => void
}

export default function NumberPad({ value, onChange }: NumberPadProps) {
  const [expression, setExpression] = useState(value ? String(value) : '')
  const lastEmittedValue = useRef(value)

  // Sync expression when value changes externally (e.g. editing a transaction)
  useEffect(() => {
    if (value !== lastEmittedValue.current) {
      setExpression(value ? String(value) : '')
      lastEmittedValue.current = value
    }
  }, [value])

  const result = evaluate(expression)

  // Wrap onChange to track the last value we emitted, so the sync effect
  // doesn't overwrite user input
  const emit = useCallback((v: number) => {
    lastEmittedValue.current = v
    onChange(v)
  }, [onChange])

  const handleDigit = useCallback(
    (digit: string) => {
      const next = appendDigit(expression, digit)
      setExpression(next)
      const r = evaluate(next)
      if (r !== null) emit(r)
    },
    [expression, emit]
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
    emit(r ?? 0)
  }, [expression, emit])

  const handleEquals = useCallback(() => {
    if (result !== null) {
      setExpression(String(result))
      emit(result)
    }
  }, [result, emit])

  const btnBase =
    'flex items-center justify-center p-3 sm:p-4 rounded-xl text-2xl font-normal transition-all duration-150 active:scale-95 select-none focus:outline-none cursor-pointer'

  const opBtn = 'bg-primary/10 text-primary hover:bg-primary/15 border border-primary/10'
  const numBtn = 'bg-muted text-foreground hover:bg-accent border border-border'
  const eqBtn = 'bg-primary text-white font-semibold shadow-md shadow-primary/20'

  // Only stripping generic formatting to show raw number if needed, 
  // but formatCurrency gives good localization. We might just strip the code.
  const displayAmount = result !== null ? formatCurrency(result) : '0'

  return (
    <div className="flex flex-col px-4 gap-4 pb-2 w-full">
      {/* Display & Backspace */}
      <div className="flex justify-end items-end gap-3 min-h-[60px]">
        <div className="flex flex-col items-end flex-1 overflow-hidden">
          <div className="text-right text-xs text-muted-foreground font-mono min-h-[16px] truncate w-full">
            {expression || ''}
          </div>
          <div className="text-right text-[48px] leading-[1] font-light text-foreground tracking-tight truncate w-full">
            {displayAmount}
          </div>
        </div>
        <button 
          onClick={handleBackspace} 
          className="text-muted-foreground hover:text-foreground pb-2 focus:outline-none active:scale-90 transition-transform p-2 shrink-0"
        >
          <Delete size={28} strokeWidth={1.5} />
        </button>
      </div>

      {/* Keypad grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {/* Row 1 */}
        <button type="button" onClick={() => handleOperator('+')} className={`${btnBase} ${opBtn}`}>+</button>
        <button type="button" onClick={() => handleDigit('7')} className={`${btnBase} ${numBtn}`}>7</button>
        <button type="button" onClick={() => handleDigit('8')} className={`${btnBase} ${numBtn}`}>8</button>
        <button type="button" onClick={() => handleDigit('9')} className={`${btnBase} ${numBtn}`}>9</button>

        {/* Row 2 */}
        <button type="button" onClick={() => handleOperator('-')} className={`${btnBase} ${opBtn}`}>-</button>
        <button type="button" onClick={() => handleDigit('4')} className={`${btnBase} ${numBtn}`}>4</button>
        <button type="button" onClick={() => handleDigit('5')} className={`${btnBase} ${numBtn}`}>5</button>
        <button type="button" onClick={() => handleDigit('6')} className={`${btnBase} ${numBtn}`}>6</button>

        {/* Row 3 */}
        <button type="button" onClick={() => handleOperator('*')} className={`${btnBase} ${opBtn}`}>×</button>
        <button type="button" onClick={() => handleDigit('1')} className={`${btnBase} ${numBtn}`}>1</button>
        <button type="button" onClick={() => handleDigit('2')} className={`${btnBase} ${numBtn}`}>2</button>
        <button type="button" onClick={() => handleDigit('3')} className={`${btnBase} ${numBtn}`}>3</button>

        {/* Row 4 */}
        <button type="button" onClick={() => handleOperator('/')} className={`${btnBase} ${opBtn}`}>÷</button>
        <button type="button" onClick={() => handleDigit('0')} className={`${btnBase} ${numBtn}`}>0</button>
        <button type="button" onClick={handleDecimal} className={`${btnBase} ${numBtn}`}>.</button>
        <button type="button" onClick={handleEquals} className={`${btnBase} ${eqBtn}`}>=</button>
      </div>
    </div>
  )
}

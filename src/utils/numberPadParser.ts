const OPERATORS = ['+', '-', '*', '/']
const MAX_DIGITS_BEFORE_DECIMAL = 8
const MAX_DECIMAL_PLACES = 2

function tokenize(expression: string): string[] {
  const tokens: string[] = []
  let current = ''
  for (const char of expression) {
    if (OPERATORS.includes(char)) {
      if (current) tokens.push(current)
      tokens.push(char)
      current = ''
    } else {
      current += char
    }
  }
  if (current) tokens.push(current)
  return tokens
}

function getLastNumberToken(expression: string): string {
  const tokens = tokenize(expression)
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (!OPERATORS.includes(tokens[i])) return tokens[i]
  }
  return ''
}

export function appendDigit(expression: string, digit: string): string {
  const lastNum = getLastNumberToken(expression + digit)
  const parts = lastNum.split('.')
  if (parts[0].replace(/^0+/, '').length > MAX_DIGITS_BEFORE_DECIMAL) return expression
  if (parts[1] && parts[1].length > MAX_DECIMAL_PLACES) return expression
  return expression + digit
}

export function appendOperator(expression: string, operator: string): string {
  if (expression === '') return ''
  const lastChar = expression[expression.length - 1]
  if (OPERATORS.includes(lastChar)) {
    return expression.slice(0, -1) + operator
  }
  if (lastChar === '.') return expression
  return expression + operator
}

export function appendDecimal(expression: string): string {
  const lastNum = getLastNumberToken(expression)
  if (lastNum.includes('.')) return expression
  if (expression === '' || OPERATORS.includes(expression[expression.length - 1])) {
    return expression + '0.'
  }
  return expression + '.'
}

export function backspace(expression: string): string {
  return expression.slice(0, -1)
}

export function evaluate(expression: string): number | null {
  if (!expression) return null
  const tokens = tokenize(expression)
  if (tokens.length === 0) return null

  // Filter out trailing operator
  const cleaned = OPERATORS.includes(tokens[tokens.length - 1])
    ? tokens.slice(0, -1)
    : tokens

  if (cleaned.length === 0) return null

  // Convert number strings to numbers
  const nums: number[] = []
  const ops: string[] = []
  for (const token of cleaned) {
    if (OPERATORS.includes(token)) {
      ops.push(token)
    } else {
      const n = parseFloat(token)
      if (isNaN(n)) return null
      nums.push(n)
    }
  }

  if (nums.length === 0) return null
  if (nums.length !== ops.length + 1) return null

  // First pass: handle * and /
  const nums2: number[] = [nums[0]]
  const ops2: string[] = []
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === '*') {
      nums2[nums2.length - 1] *= nums[i + 1]
    } else if (ops[i] === '/') {
      if (nums[i + 1] === 0) return null
      nums2[nums2.length - 1] /= nums[i + 1]
    } else {
      ops2.push(ops[i])
      nums2.push(nums[i + 1])
    }
  }

  // Second pass: handle + and -
  let result = nums2[0]
  for (let i = 0; i < ops2.length; i++) {
    if (ops2[i] === '+') result += nums2[i + 1]
    else if (ops2[i] === '-') result -= nums2[i + 1]
  }

  return Math.round(result * 100) / 100
}

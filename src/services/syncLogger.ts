export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

let currentLevel: LogLevel = 'info'

export function setLogLevel(level: LogLevel) {
  currentLevel = level
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

const PREFIX = '[Sync]'

export const syncLogger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.debug(PREFIX, ...args)
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.info(PREFIX, ...args)
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(PREFIX, ...args)
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error(PREFIX, ...args)
  },
}

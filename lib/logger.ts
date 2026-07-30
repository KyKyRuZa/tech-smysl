type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogMeta = Record<string, unknown>

class Logger {
  private level: LogLevel

  constructor(private readonly minLevel: LogLevel = 'info') {
    this.level = minLevel
  }

  private format(level: LogLevel, message: string, meta?: LogMeta) {
    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }
    console.log(JSON.stringify(entry))
  }

  private isEnabled(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  debug(message: string, meta?: LogMeta) {
    if (this.isEnabled('debug')) {
      this.format('debug', message, meta)
    }
  }

  info(message: string, meta?: LogMeta) {
    if (this.isEnabled('info')) {
      this.format('info', message, meta)
    }
  }

  warn(message: string, meta?: LogMeta) {
    if (this.isEnabled('warn')) {
      this.format('warn', message, meta)
    }
  }

  error(message: string, meta?: LogMeta) {
    if (this.isEnabled('error')) {
      this.format('error', message, meta)
    }
  }
}

export const logger = new Logger(process.env.LOG_LEVEL === 'debug' ? 'debug' : 'info')

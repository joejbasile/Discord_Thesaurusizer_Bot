type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const emit = (level: LogLevel, args: unknown[]): void => {
    const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}]`
    if (level === 'error') {
        console.error(prefix, ...args)
    } else if (level === 'warn') {
        console.warn(prefix, ...args)
    } else {
        console.log(prefix, ...args)
    }
}

export const logger = {
    debug: (...args: unknown[]) => emit('debug', args),
    info: (...args: unknown[]) => emit('info', args),
    warn: (...args: unknown[]) => emit('warn', args),
    error: (...args: unknown[]) => emit('error', args)
}

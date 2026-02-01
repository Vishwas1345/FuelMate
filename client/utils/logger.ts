import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix';

// Define colors for different log levels
const colors = {
    TRACE: 'lightblue',
    DEBUG: 'cyan',
    INFO: 'green',
    WARN: 'orange',
    ERROR: 'red',
};

// Configure the prefix plugin
prefix.reg(log);
prefix.apply(log, {
    template: '[%t] %l (%n):',
    levelFormatter(level) {
        return level.toUpperCase();
    },
    nameFormatter(name) {
        return name || 'FuelMate';
    },
    timestampFormatter(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    },
});

// Set log level based on environment
const logLevel = import.meta.env.VITE_LOG_LEVEL ||
    (import.meta.env.MODE === 'production' ? 'warn' : 'debug');
log.setLevel(logLevel);

// Add custom styling to console logs
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);

    return function (...args) {
        const color = colors[methodName.toUpperCase()] || 'gray';

        // Apply color styling in browser console
        if (typeof window !== 'undefined') {
            const prefix = `%c[${new Date().toLocaleTimeString()}] ${methodName.toUpperCase()}`;
            const style = `color: ${color}; font-weight: bold;`;
            rawMethod(prefix, style, ...args);
        } else {
            rawMethod(...args);
        }
    };
};

// Apply the new method factory
log.setLevel(log.getLevel());

// Create logger instance
const logger = {
    trace: (...args) => log.trace(...args),
    debug: (...args) => log.debug(...args),
    info: (...args) => log.info(...args),
    warn: (...args) => log.warn(...args),
    error: (...args) => log.error(...args),

    // Helper methods for common use cases
    api: (method, url, data) => {
        log.debug(`API ${method}:`, url, data ? data : '');
    },

    component: (name, message, data) => {
        log.debug(`[${name}]`, message, data ? data : '');
    },

    action: (action, payload) => {
        log.info(`Action: ${action}`, payload ? payload : '');
    },

    // Set log level dynamically
    setLevel: (level) => {
        log.setLevel(level);
    },

    // Get current log level
    getLevel: () => {
        return log.getLevel();
    },
};

// Log initialization
logger.info('Logger initialized with level:', logLevel);

export default logger;

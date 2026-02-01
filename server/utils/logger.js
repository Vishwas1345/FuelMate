import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

// Tell winston about our colors
winston.addColors(colors);

// Define the format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
            metaStr = '\n' + JSON.stringify(meta, null, 2);
        }
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
);

// Define the format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.uncolorize(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
            metaStr = ' ' + JSON.stringify(meta);
        }
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
    })
);

// Create logs directory path
const logsDir = path.join(__dirname, '..', 'logs');

// Define transports
const transports = [
    // Console transport - always show logs in terminal
    new winston.transports.Console({
        format: consoleFormat,
    }),

    // File transport for all logs
    new DailyRotateFile({
        filename: path.join(logsDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
    }),

    // File transport for error logs only
    new DailyRotateFile({
        filename: path.join(logsDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
        format: fileFormat,
    }),
];

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    transports,
    // Handle exceptions and rejections
    exceptionHandlers: [
        new winston.transports.Console({
            format: consoleFormat,
        }),
        new DailyRotateFile({
            filename: path.join(logsDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            format: fileFormat,
        }),
    ],
    rejectionHandlers: [
        new winston.transports.Console({
            format: consoleFormat,
        }),
        new DailyRotateFile({
            filename: path.join(logsDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            format: fileFormat,
        }),
    ],
});

// Create a stream object for Morgan HTTP logger
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

export default logger;

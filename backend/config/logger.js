const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'pregmanage' },
    transports: [
        // Write errors to error.log
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
});

// In non-production, also log to console with color
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
                const metaStr = Object.keys(meta).length > 1
                    ? ` ${JSON.stringify(meta)}`
                    : '';
                return `${timestamp} ${level}: ${message}${metaStr}`;
            })
        )
    }));
}

// Create a stream for morgan-style HTTP request logging
logger.stream = {
    write: (message) => logger.info(message.trim())
};

module.exports = logger;

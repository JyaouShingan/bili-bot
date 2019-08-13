import { createLogger, format, transports, Logger } from 'winston';

export function getLogger(moduleName: string): Logger {
    return createLogger({
        level: 'info',
        format: format.combine(
            format.label({label: moduleName}),
            format.timestamp(),
            format.colorize(),
            format.printf(({level, message, label, timestamp}): string => {
                return `${timestamp} [${level}][${label}] ${message}`;
            })
        ),
        transports: [
            new transports.Console()
        ]
    });
}

export { Logger } from 'winston';

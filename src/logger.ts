import { createLogger, format, transports } from 'winston';

export function getLogger(moduleName: string) {
    return createLogger({
        level: 'info',
        format: format.combine(
            format.label({label: moduleName}),
            format.timestamp(),
            format.colorize(),
            format.printf(({level, message, label, timestamp}) => {
                return `${timestamp} [${level}][${label}] ${message}`;
            })
        ),
        transports: [
            new transports.Console()
        ]
    });
}
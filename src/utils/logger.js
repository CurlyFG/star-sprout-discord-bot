const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logFile = path.join(__dirname, '../../logs/star-sprout.log');
        this.ensureLogDirectory();
    }

    // Ensure log directory exists
    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    // Format timestamp
    getTimestamp() {
        return new Date().toISOString();
    }

    // Write log entry
    writeLog(level, message, data = null) {
        const timestamp = this.getTimestamp();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        // Console output with colors
        const colors = {
            error: '\x1b[31m',   // Red
            warn: '\x1b[33m',    // Yellow
            info: '\x1b[36m',    // Cyan
            debug: '\x1b[90m',   // Gray
            reset: '\x1b[0m'
        };

        const color = colors[level] || colors.reset;
        const emoji = {
            error: '🥀',
            warn: '🌾',
            info: '🌱',
            debug: '🌿'
        }[level] || '📝';

        console.log(`${color}${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`);
        
        if (data) {
            console.log(`${color}${JSON.stringify(data, null, 2)}${colors.reset}`);
        }

        // File output
        try {
            const logLine = JSON.stringify(logEntry) + '\n';
            fs.appendFileSync(this.logFile, logLine);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    // Log levels
    error(message, data = null) {
        this.writeLog('error', message, data);
    }

    warn(message, data = null) {
        this.writeLog('warn', message, data);
    }

    info(message, data = null) {
        this.writeLog('info', message, data);
    }

    debug(message, data = null) {
        this.writeLog('debug', message, data);
    }
}

module.exports = new Logger();

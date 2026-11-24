
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { config } from "./env.config.js";

const isDevelopment = config.nodeEnv === "development";

const levels = {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
};

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}] ${stack || message}`;
    })
);

const errorsOnly = winston.format((info) => {
    return ["fatal", "error"].includes(info.level) ? info : false;
});

const logger = winston.createLogger({
    levels,
    level: isDevelopment ? "debug" : "info",
    format: logFormat,
    transports: [
        new winston.transports.Console(),

        new DailyRotateFile({
            dirname: "logs",
            filename: "error-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            format: winston.format.combine(
                errorsOnly(),
                logFormat
            ),
            maxSize: "10m",
            maxFiles: "14d",
        }),
    ],
});

export default logger;

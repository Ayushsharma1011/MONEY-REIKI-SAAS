export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMetadata = Record<string, unknown>;

const SECRET_KEY_PATTERN =
  /(password|token|secret|authorization|api[_-]?key|access[_-]?token|refresh[_-]?token|cookie|session)/i;

const SECRET_VALUE_PATTERN =
  /^(Bearer\s+)?[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    if (SECRET_VALUE_PATTERN.test(value)) {
      return "[REDACTED]";
    }

    if (value.length > 8 && /[A-Za-z0-9+/=]{24,}/.test(value)) {
      return "[REDACTED]";
    }
  }

  return value;
}

function sanitizeMetadata(metadata?: LogMetadata): LogMetadata | undefined {
  if (!metadata) {
    return undefined;
  }

  const sanitized: LogMetadata = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (SECRET_KEY_PATTERN.test(key)) {
      sanitized[key] = "[REDACTED]";
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeMetadata(value as LogMetadata);
      continue;
    }

    sanitized[key] = redactValue(value);
  }

  return sanitized;
}

function writeLog(
  level: LogLevel,
  message: string,
  metadata?: LogMetadata
): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(metadata ? { metadata: sanitizeMetadata(metadata) } : {})
  };

  switch (level) {
    case "debug":
      console.debug(payload);
      break;
    case "info":
      console.info(payload);
      break;
    case "warn":
      console.warn(payload);
      break;
    case "error":
      console.error(payload);
      break;
  }
}

export type Logger = {
  debug: (message: string, metadata?: LogMetadata) => void;
  info: (message: string, metadata?: LogMetadata) => void;
  warn: (message: string, metadata?: LogMetadata) => void;
  error: (message: string, metadata?: LogMetadata) => void;
};

export function createLogger(scope?: string): Logger {
  const withScope = (metadata?: LogMetadata): LogMetadata | undefined =>
    scope ? { scope, ...metadata } : metadata;

  return {
    debug(message, metadata) {
      if (!isProduction()) {
        writeLog("debug", message, withScope(metadata));
      }
    },
    info(message, metadata) {
      writeLog("info", message, withScope(metadata));
    },
    warn(message, metadata) {
      writeLog("warn", message, withScope(metadata));
    },
    error(message, metadata) {
      writeLog("error", message, withScope(metadata));
    }
  };
}

/** Shared production-safe logger for core infrastructure. */
export const logger = createLogger("core");

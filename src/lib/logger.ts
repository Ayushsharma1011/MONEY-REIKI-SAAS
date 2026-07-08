type LogContext = Record<string, unknown>;

function shouldLogDebug() {
  return process.env.NODE_ENV !== "production";
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (shouldLogDebug()) {
      console.debug(message, context ?? {});
    }
  },
  info(message: string, context?: LogContext) {
    if (shouldLogDebug()) {
      console.info(message, context ?? {});
    }
  },
  warn(message: string, context?: LogContext) {
    console.warn(message, context ?? {});
  },
  error(message: string, context?: LogContext) {
    console.error(message, context ?? {});
  }
};

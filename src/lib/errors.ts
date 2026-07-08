export type ErrorMetadata = Record<string, unknown>;

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly metadata?: ErrorMetadata;

  constructor(
    message: string,
    code = "APP_ERROR",
    statusCode = 500,
    metadata?: ErrorMetadata
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed.", metadata?: ErrorMetadata) {
    super(message, "VALIDATION_ERROR", 400, metadata);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends AppError {
  constructor(
    message = "Database operation failed.",
    metadata?: ErrorMetadata
  ) {
    super(message, "DATABASE_ERROR", 500, metadata);
    this.name = "DatabaseError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.", metadata?: ErrorMetadata) {
    super(message, "NOT_FOUND", 404, metadata);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict.", metadata?: ErrorMetadata) {
    super(message, "CONFLICT", 409, metadata);
    this.name = "ConflictError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = "Authentication is required.",
    metadata?: ErrorMetadata
  ) {
    super(message, "UNAUTHORIZED", 401, metadata);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = "You do not have permission to perform this action.",
    metadata?: ErrorMetadata
  ) {
    super(message, "FORBIDDEN", 403, metadata);
    this.name = "ForbiddenError";
  }
}

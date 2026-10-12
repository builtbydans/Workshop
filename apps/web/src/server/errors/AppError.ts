export const ERROR_CODES = {
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

type ErrorDetails = Record<string, string[]>;

const DEFAULT_CODES: Record<number, ErrorCode> = {
  400: ERROR_CODES.VALIDATION_ERROR,
  401: ERROR_CODES.UNAUTHORIZED,
  403: ERROR_CODES.FORBIDDEN,
  404: ERROR_CODES.NOT_FOUND,
  409: ERROR_CODES.INVALID_STATUS_TRANSITION,
};

export class AppError extends Error {
  statusCode: number;
  code: ErrorCode;
  details?: ErrorDetails;

  constructor(
    message: string,
    statusCode: number,
    code?: ErrorCode,
    details?: ErrorDetails,
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code =
      code ?? DEFAULT_CODES[statusCode] ?? ERROR_CODES.INTERNAL_SERVER_ERROR;
    this.details = details;
  }
}

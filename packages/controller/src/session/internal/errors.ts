const SNIP9_ERROR_CODES = new Set([
  "OUTSIDE_EXECUTION",
  "OUTSIDE_EXECUTION_AUTHORIZATION_FAILED",
  "OUTSIDE_EXECUTION_MANUAL_EXECUTION_REQUIRED",
  "OUTSIDE_EXECUTION_NOT_SUPPORTED",
  "OUTSIDE_EXECUTION_UNSUPPORTED",
]);

const SNIP9_MESSAGE_PATTERNS = [
  /\baccount is not compatible with snip-9\b/i,
  /\bmanual execution required\b/i,
  /(?:^|:\s*)(?:outside execution )?authorization failed(?:[.!)]|\s|$)/i,
  /(?:^|:\s*)not implemented:\s*(outside execution|execute_from_outside|snip-9)(?:[.!)]|\s|$)/i,
  /\bfailed to check if nonce is valid\b/i,
  /\boutside_execution_nonce\b/i,
  /\bis_valid_outside_execution_nonce\b/i,
  /(?:^|:\s*)requested entrypoint does not exist(?:[.!)]|\s|$)/i,
  /(?:^|:\s*)entrypoint does not exist(?:[.!)]|\s|$)/i,
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const r = error as Record<string, unknown>;
    if (typeof r.message === "string") return r.message;
  }
  return String(error);
}

function getErrorCode(error: unknown, depth = 0): string | null {
  if (depth > 2) return null;
  if (!error || typeof error !== "object") return null;
  const r = error as Record<string, unknown>;
  if (typeof r.code === "string" && r.code.trim()) {
    return r.code.trim().toUpperCase();
  }
  return r.cause !== undefined ? getErrorCode(r.cause, depth + 1) : null;
}

/**
 * Returns true when the error indicates the account doesn't support SNIP-9
 * outside execution and a direct-invoke fallback should be attempted.
 */
export function isSnip9CompatibilityError(error: unknown): boolean {
  const code = getErrorCode(error);
  if (code && SNIP9_ERROR_CODES.has(code)) return true;
  const message = getErrorMessage(error).trim();
  return SNIP9_MESSAGE_PATTERNS.some((p) => p.test(message));
}

export class SessionProtocolError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "SessionProtocolError";
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

export class SessionTimeoutError extends SessionProtocolError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "SessionTimeoutError";
  }
}

export class SessionRejectedError extends SessionProtocolError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "SessionRejectedError";
  }
}

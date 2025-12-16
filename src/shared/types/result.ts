/**
 * Result type for functional error handling
 * Prevents throwing exceptions and makes error handling explicit
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

export const Result = {
  ok: <T>(data: T): Result<T> => ({ success: true, data }),
  error: <E = Error>(error: E): Result<never, E> => ({ success: false, error }),
}


import type { HttpError } from "../types/domain.js";

export function createHttpError(message: string, status = 400): HttpError {
  return Object.assign(new Error(message), { status });
}

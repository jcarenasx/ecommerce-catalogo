import type { NextFunction, Request, Response } from "express";

type ErrorPayload = {
  error: string;
  message: string;
  details?: Record<string, unknown>;
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response<ErrorPayload> {
  const status = (err as any)?.status ?? 500;
  const payload: ErrorPayload = {
    error: (err as any)?.code ?? "INTERNAL_ERROR",
    message: (err as any)?.message ?? "Ocurrió un error inesperado.",
  };

  if ((err as any)?.details) {
    payload.details = (err as any).details;
  }

  return res.status(status).json(payload);
}

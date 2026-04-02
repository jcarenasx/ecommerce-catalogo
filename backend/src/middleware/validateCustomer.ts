import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const createCustomerSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export function validateCustomerCreate(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  const result = createCustomerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "INVALID_BODY",
      message: "El cuerpo de la solicitud no cumple la validación.",
      details: result.error.format(),
    });
  }

  req.body = result.data;
  next();
}

import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const addCartItemSchema = z.object({
  productModel: z.string().trim().min(1),
  quantity: z.number().int().positive().default(1),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

function buildErrorResponse(error: z.ZodError) {
  return {
    error: "INVALID_BODY",
    message: "El cuerpo de la solicitud no cumple la validación.",
    details: error.format(),
  };
}

export function validateAddCartItem(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  const result = addCartItemSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(buildErrorResponse(result.error));
  }

  req.body = result.data;
  next();
}

export function validateUpdateCartItem(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  const result = updateCartItemSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(buildErrorResponse(result.error));
  }

  req.body = result.data;
  next();
}

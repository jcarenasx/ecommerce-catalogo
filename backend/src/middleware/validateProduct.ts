import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

const optionalText = (max: number) =>
  z.union([z.string().trim().min(1).max(max), z.null()]).optional();

const optionalUrl = () =>
  z.union([z.string().trim().url(), z.null()]).optional();

const imagesSchema = z.union([z.array(z.string().url()), z.null()]).optional();

const baseProductSchema = z.object({
  name: z.union([z.string().trim().min(1), z.null()]).optional(),
  size: optionalText(60),
  color: optionalText(60),
  model: z.string().trim().min(1).max(120),
  sku: optionalText(80),
  priceCents: z.union([z.number().int().nonnegative(), z.null()]).optional(),
  paymentLinkWithShipping: optionalUrl(),
  paymentLinkWithoutShipping: optionalUrl(),
  category: optionalText(120),
  brand: optionalText(120),
  images: imagesSchema,
  active: z.boolean().optional(),
});

const createSchema = baseProductSchema;
const updateSchema = baseProductSchema.partial();

type ValidationResult = {
  success: boolean;
  data?: z.infer<typeof baseProductSchema>;
  error?: z.ZodError;
};

function getZodMessages(error: z.ZodError): string[] {
  const issues = "issues" in error && Array.isArray(error.issues)
    ? error.issues
    : "errors" in error && Array.isArray((error as z.ZodError & { errors?: z.ZodIssue[] }).errors)
      ? (error as z.ZodError & { errors?: z.ZodIssue[] }).errors ?? []
      : [];

  return issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
    return `${path}${issue.message}`;
  });
}

export function validateProductCreate(
  req: Request,
  res: Response,
  next: NextFunction
): ReturnType<typeof res.status> | void {
  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "INVALID_BODY",
      message: "El cuerpo de la solicitud contiene errores.",
      details: {
        formErrors: getZodMessages(result.error),
      },
    });
  }

  req.body = result.data;
  next();
}

export function validateProductUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): ReturnType<typeof res.status> | void {
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "INVALID_BODY",
      message: "El cuerpo de la solicitud contiene errores.",
      details: {
        formErrors: getZodMessages(result.error),
      },
    });
  }

  req.body = result.data;
  next();
}

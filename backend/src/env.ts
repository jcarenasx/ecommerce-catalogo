import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  COOKIE_NAME: z.string().min(1).default("ecom_access"),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  AWS_REGION: z.string().min(1).default("us-east-1"),
  S3_BUCKET_NAME: z.string().min(1).optional(),
  S3_UPLOAD_MAX_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(5_242_880), // 5 MB by default
  S3_ALLOWED_CONTENT_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/webp,avif"),
  S3_PUBLIC_URL_BASE: z.string().url().optional(),
  S3_ENDPOINT: z.string().url().optional(),
});

const parsed = envSchema.parse(process.env);
const allowedContentTypes = parsed.S3_ALLOWED_CONTENT_TYPES.split(",")
  .map((type) => type.trim())
  .filter(Boolean);

export const env = {
  ...parsed,
  s3AllowedContentTypes: allowedContentTypes,
};

import "dotenv/config";
import { z } from "zod";

const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  COOKIE_NAME: z.string().min(1).default("ecom_access"),
  COOKIE_SECURE: z.string().default("false").transform((value) => value === "true"),
  UPLOAD_DIRECTORY: z.string().min(1).default("uploads"),
  S3_BUCKET_NAME: z.string().min(1).optional(),
  AWS_REGION: z.string().default("us-east-1"),
  S3_UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(5_242_880),
  S3_ALLOWED_CONTENT_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/webp,avif"),
});

export const config = (() => {
  const parsed = baseSchema.parse(process.env);
  const allowedContentTypes = parsed.S3_ALLOWED_CONTENT_TYPES.split(",").map((type) =>
    type.trim()
  );

  return {
    env: parsed.NODE_ENV,
    port: parsed.PORT,
    databaseUrl: parsed.DATABASE_URL,
    jwtSecret: parsed.JWT_ACCESS_SECRET,
    cookieName: parsed.COOKIE_NAME,
    cookieSecure: parsed.COOKIE_SECURE,
    uploadDirectory: parsed.UPLOAD_DIRECTORY,
    bucketName: parsed.S3_BUCKET_NAME,
    awsRegion: parsed.AWS_REGION,
    maxUploadBytes: parsed.S3_UPLOAD_MAX_BYTES,
    allowedContentTypes,
  };
})();

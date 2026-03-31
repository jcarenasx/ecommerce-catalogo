import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { env } from "../env";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.S3_ENDPOINT ?? undefined,
});

function buildPublicUrl(key: string): string {
  const baseUrl =
    env.S3_PUBLIC_URL_BASE ??
    `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com`;
  return `${baseUrl.replace(/\/+$/, "")}/${key}`;
}

export async function uploadMediaFiles(files: Express.Multer.File[]): Promise<string[]> {
  if (!env.S3_BUCKET_NAME) {
    throw new Error("S3_NOT_CONFIGURED");
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!file.mimetype || !env.s3AllowedContentTypes.includes(file.mimetype)) {
      throw new Error("INVALID_CONTENT_TYPE");
    }

    if (file.size > env.S3_UPLOAD_MAX_BYTES) {
      throw new Error("FILE_TOO_LARGE");
    }

    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `catalog/${Date.now()}-${randomUUID()}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    });

    await s3Client.send(command);

    urls.push(buildPublicUrl(key));
  }

  return urls;
}

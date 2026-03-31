import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { config } from "../config";

const ensureUploadsDirectory = () => {
  const uploadPath = path.resolve(process.cwd(), config.uploadDirectory);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

export const mediaRepository = {
  async saveFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadDir = ensureUploadsDirectory();
    const urls: string[] = [];

    for (const file of files) {
      const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}-${randomUUID()}-${sanitized}`;
      const filepath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filepath, file.buffer);
      urls.push(`/uploads/${filename}`);
    }

    return urls;
  },
};

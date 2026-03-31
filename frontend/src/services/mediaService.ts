import { uploadMedia } from "../api/admin";

export async function uploadGalleryImages(files: FileList | File[]): Promise<string[]> {
  const formData = new FormData();
  const candidates = Array.isArray(files) ? files : Array.from(files ?? []);

  for (const file of candidates) {
    formData.append("files", file);
  }

  return uploadMedia(formData);
}

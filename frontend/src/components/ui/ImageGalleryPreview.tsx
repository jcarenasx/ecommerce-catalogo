import type { HTMLAttributes } from "react";

type ImageGalleryPreviewProps = HTMLAttributes<HTMLDivElement> & {
  images: string[];
};

export default function ImageGalleryPreview({
  images,
  className = "",
  ...rest
}: ImageGalleryPreviewProps) {
  if (images.length === 0) return null;

  return (
    <div
      className={`flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 ${className}`}
      {...rest}
    >
      {images.map((src) => (
        <div
          key={src}
          className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <img src={src} alt="Galería del producto" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

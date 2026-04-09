import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import type { Product } from "../types";
import { buildWhatsAppUrl } from "../lib/whatsapp";
import { resolveMediaUrl } from "../lib/media";
import Card from "./ui/Card";

interface ProductProps {
  product: Product;
}

const PLACEHOLDER_IMAGE = "https://placehold.co/600x360/e2e8f0/64748b?text=Producto";

function formatCurrency(priceCents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceCents / 100);
}

export default function ProductCard({ product }: ProductProps) {
  const displayName = product.name?.trim() || product.model;
  const sizeLabel = product.size?.trim() || "—";
  const colorLabel = product.color?.trim() || "—";

  const normalizedImages = useMemo(() => {
    const list = Array.isArray(product.images)
      ? product.images
          .filter((item) => typeof item === "string" && item.trim() !== "")
          .map(resolveMediaUrl)
      : [];
    return list.length > 0 ? list : [PLACEHOLDER_IMAGE];
  }, [product.images]);

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const modalTouchStartX = useRef<number | null>(null);
  const didSwipeRef = useRef(false);

  const hasMultipleImages = normalizedImages.length > 1;
  const currentImageSrc =
    currentImage && normalizedImages.includes(currentImage)
      ? currentImage
      : normalizedImages[0];
  const currentImageIndex = normalizedImages.indexOf(currentImageSrc);

  useEffect(() => {
    if (!isModalOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);

  const goNextImage = useCallback(() => {
    const nextIndex = (currentImageIndex + 1) % normalizedImages.length;
    setCurrentImage(normalizedImages[nextIndex]);
  }, [currentImageIndex, normalizedImages]);

  const goPrevImage = useCallback(() => {
    const prevIndex = (currentImageIndex - 1 + normalizedImages.length) % normalizedImages.length;
    setCurrentImage(normalizedImages[prevIndex]);
  }, [currentImageIndex, normalizedImages]);

  const handleTouchStart = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
    didSwipeRef.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      if (touchStartX.current === null) return;

      const delta = touchStartX.current - event.changedTouches[0].clientX;

      if (Math.abs(delta) > 30) {
        didSwipeRef.current = true;
        if (delta > 0) {
          goNextImage();
        } else {
          goPrevImage();
        }
      }

      touchStartX.current = null;
    },
    [goNextImage, goPrevImage]
  );

  const handleModalTouchStart = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    modalTouchStartX.current = event.touches[0].clientX;
  }, []);

  const handleModalTouchEnd = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      if (modalTouchStartX.current === null) return;

      const delta = modalTouchStartX.current - event.changedTouches[0].clientX;

      if (Math.abs(delta) > 30) {
        if (delta > 0) {
          goNextImage();
        } else {
          goPrevImage();
        }
      }

      modalTouchStartX.current = null;
    },
    [goNextImage, goPrevImage]
  );

  const handleCardClick = () => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    setIsModalOpen(true);
  };

  const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsModalOpen(true);
    }
  };

  const interestMessage = `Hola, me interesa ${displayName}. ¿Lo tienes disponible?`;
  const interestHref = buildWhatsAppUrl(interestMessage);

  return (
    <Card className="h-full border-none bg-white shadow transition-shadow duration-200 hover:shadow-xl">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Ver galería de ${displayName}`}
        className="flex h-full w-full cursor-pointer flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4"
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
      >
        <div
          className="group relative flex h-40 basis-3/4 items-center justify-center overflow-hidden rounded-t-2xl bg-white sm:h-52"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={currentImageSrc}
            alt={displayName}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 ease-out md:group-hover:scale-110"
          />

          {hasMultipleImages && (
            <>
              <button
                type="button"
                aria-label="Imagen previa"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrevImage();
                }}
                className="pointer-events-auto absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/60 bg-black/40 px-3 py-1 text-xl font-bold text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100 md:flex"
              >
                ‹
              </button>

              <button
                type="button"
                aria-label="Imagen siguiente"
                onClick={(event) => {
                  event.stopPropagation();
                  goNextImage();
                }}
                className="pointer-events-auto absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/60 bg-black/40 px-3 py-1 text-xl font-bold text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100 md:flex"
              >
                ›
              </button>
            </>
          )}
        </div>

        <div className="flex basis-1/4 flex-col gap-1 px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
  <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{displayName}</h3>

  
{product.availabilityTag && (
  <p className="text-[10px] font-semibold text-slate-500 uppercase sm:text-xs">
  {product.availabilityTag.name}
</p>
)}

  <p className="text-xs text-slate-600 sm:text-sm">Tallas: {sizeLabel}</p>
  <p className="text-xs text-slate-600 sm:text-sm">Color: {colorLabel}</p>
  <p className="text-xs font-semibold text-slate-900 sm:text-sm">
    Precio: {formatCurrency(product.priceCents ?? 0)}
  </p>
</div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative flex h-full w-full max-w-5xl flex-col gap-6 overflow-hidden rounded-3xl bg-white p-6 sm:h-[calc(100vh-2rem)] sm:p-10"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 z-10 rounded-full border border-slate-200 bg-white/80 p-2 text-xl font-bold text-slate-700 transition hover:bg-white"
            >
              ×
            </button>

            <div
              className="group relative h-full min-h-[50vh] flex-1 overflow-hidden rounded-2xl bg-white"
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd}
            >
              <img
                src={currentImageSrc}
                alt={displayName}
                className="h-full w-full object-contain"
                loading="lazy"
              />

              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    aria-label="Imagen previa"
                    onClick={(event) => {
                      event.stopPropagation();
                      goPrevImage();
                    }}
                    className="pointer-events-auto absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 px-2 py-2 text-xl font-bold text-slate-800 opacity-0 transition hover:bg-white group-hover:opacity-100 md:flex"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    aria-label="Imagen siguiente"
                    onClick={(event) => {
                      event.stopPropagation();
                      goNextImage();
                    }}
                    className="pointer-events-auto absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 px-2 py-2 text-xl font-bold text-slate-800 opacity-0 transition hover:bg-white group-hover:opacity-100 md:flex"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{displayName}</p>
              <a
                href={interestHref}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-2xl border border-black bg-black px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
              >
                Me interesa
              </a>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

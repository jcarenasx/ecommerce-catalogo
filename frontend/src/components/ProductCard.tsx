import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import type { Product } from "../types";
import { buildWhatsAppUrl } from "../lib/whatsapp";
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
      ? product.images.filter((item) => typeof item === "string" && item.trim() !== "")
      : [];
    return list.length > 0 ? list : [PLACEHOLDER_IMAGE];
  }, [product.images]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const normalizedImagesRef = useRef(normalizedImages);
  const touchStartX = useRef<number | null>(null);
  const modalTouchStartX = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const hasMultipleImages = normalizedImages.length > 1;

  useEffect(() => {
    if (normalizedImagesRef.current === normalizedImages) {
      return;
    }
    normalizedImagesRef.current = normalizedImages;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentImageIndex(0);
  }, [normalizedImages]);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
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
    setCurrentImageIndex((prev) => (prev + 1) % normalizedImages.length);
  }, [normalizedImages.length]);

  const goPrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + normalizedImages.length) % normalizedImages.length);
  }, [normalizedImages.length]);

  const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
    didSwipeRef.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
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

  const handleModalTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    modalTouchStartX.current = event.touches[0].clientX;
  }, []);

  const handleModalTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
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

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
          className="relative h-52 flex basis-3/4 items-center justify-center overflow-hidden rounded-t-2xl bg-white group"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={normalizedImages[currentImageIndex]}
            alt={displayName}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 ease-out transform md:group-hover:scale-110"
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
                className="pointer-events-auto hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-black/40 px-3 py-1 text-xl font-bold text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
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
                className="pointer-events-auto hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-black/40 px-3 py-1 text-xl font-bold text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
              >
                ›
              </button>
            </>
          )}
        </div>

        <div className="flex basis-1/4 flex-col gap-1 px-5 pb-5 pt-4">
          <h3 className="text-base font-semibold text-slate-900">{displayName}</h3>
          <p className="text-sm text-slate-600">Tallas: {sizeLabel}</p>
          <p className="text-sm text-slate-600">Color: {colorLabel}</p>
          <p className="text-sm font-semibold text-slate-900">
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
              className="relative h-full min-h-[50vh] flex-1 overflow-hidden rounded-2xl bg-white group"
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd}
            >
              <img
                src={normalizedImages[currentImageIndex]}
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
                    className="pointer-events-auto hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 px-2 py-2 text-xl font-bold text-slate-800 opacity-0 transition hover:bg-white group-hover:opacity-100"
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
                    className="pointer-events-auto hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 px-2 py-2 text-xl font-bold text-slate-800 opacity-0 transition hover:bg-white group-hover:opacity-100"
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

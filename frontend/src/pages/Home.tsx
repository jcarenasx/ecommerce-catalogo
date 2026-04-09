import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Pill from "../components/ui/Pill";
import { useProductBrands } from "../hooks/useProductBrands";
import { useProductCategories } from "../hooks/useProductCategories";
import { useProducts } from "../hooks/useProducts";
import { useAvailabilityTags } from "../hooks/useAvailabilityTags";
import Loader from "../components/ui/Loader";
import { registerCustomer } from "../services/customerService";

const NOTIFICATION_KEY = "acceptedNotifications";

export default function Home() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null); // 👈 NUEVO
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products = [], isLoading, isError, error } = useProducts({
    category: categoryFilter ?? undefined,
    brand: brandFilter ?? undefined,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();
  const { data: brands = [], isLoading: brandsLoading } = useProductBrands();
  const { data: availabilityTags = [], isLoading: availabilityLoading } = useAvailabilityTags(); // 👈 NUEVO

  const filteredProducts = products.filter((product) => {
    const matchesAvailability =
      !availabilityFilter ||
      product.availabilityTag?.name === availabilityFilter;

    return matchesAvailability;
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(NOTIFICATION_KEY);
    if (!saved) {
      setShowModal(true);
    }
  }, []);

  const handleDecline = () => {
    window.localStorage.setItem(NOTIFICATION_KEY, "declined");
    setShowModal(false);
  };

  const handleAccept = async () => {
    if (!name.trim() || !phone.trim()) {
      setFormError("Ingresa tu nombre y WhatsApp para recibir avisos.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      await registerCustomer({ name: name.trim(), phone: phone.trim() });
      window.localStorage.setItem(NOTIFICATION_KEY, "accepted");
      setShowModal(false);
    } catch {
      setFormError("No se pudo guardar tu preferencia. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4.75rem)] w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:py-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="max-w-2xl text-sm text-slate-600">
          Curaduria discreta de sneakers, bolsos y piezas seleccionadas.
        </p>
      </header>

      {/* CATEGORÍAS */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Pill active={categoryFilter === null} onClick={() => setCategoryFilter(null)} className="px-4">
          Todas las categorías
        </Pill>
        {categoriesLoading && <Loader />}
        {categories.map((category) => (
          <Pill
            key={category}
            active={categoryFilter === category}
            onClick={() =>
              setCategoryFilter((current) => (current === category ? null : category))
            }
          >
            {category}
          </Pill>
        ))}
      </div>

      {/* MARCAS */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill active={brandFilter === null} onClick={() => setBrandFilter(null)} className="px-4">
          Todas las marcas
        </Pill>
        {brandsLoading && <Loader />}
        {brands.map((brand) => (
          <Pill
            key={brand}
            active={brandFilter === brand}
            onClick={() =>
              setBrandFilter((current) => (current === brand ? null : brand))
            }
          >
            {brand}
          </Pill>
        ))}
      </div>

      {/* ETIQUETAS DE DISPONIBILIDAD */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill active={availabilityFilter === null} onClick={() => setAvailabilityFilter(null)} className="px-4">
          Disponibilidad
        </Pill>
        {availabilityLoading && <Loader />}
        {availabilityTags.map((tag) => (
          <Pill
            key={tag.id}
            active={availabilityFilter === tag.name}
            onClick={() =>
              setAvailabilityFilter((current) => (current === tag.name ? null : tag.name))
            }
          >
            {tag.name}
          </Pill>
        ))}
      </div>

      {isLoading && (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          Cargando productos...
        </p>
      )}

      {isError && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          {error instanceof Error ? error.message : "No se pudieron cargar productos."}
        </p>
      )}

      {!isLoading && !isError && filteredProducts.length === 0 && (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No hay productos con ese filtro.
        </p>
      )}

    {!isLoading && !isError && filteredProducts.length > 0 && (
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.model} product={product} />
        ))}
      </div>
    )}
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-slate-900">
            ¿Quieres recibir avisos de productos nuevos?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Comparte tu nombre y WhatsApp para que podamos avisarte cuando haya novedades.
          </p>
          <div className="mt-4 space-y-3">
            <label className="block text-sm text-slate-700">
              Nombre
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500"
                placeholder="Tu nombre"
              />
            </label>
            <label className="block text-sm text-slate-700">
              WhatsApp
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500"
                placeholder="Ej. 5591234567"
              />
            </label>
          </div>
          {formError && (
            <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {formError}
            </p>
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleAccept}
              disabled={isSubmitting}
              className="flex-1 rounded-2xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Quiero recibir avisos"}
            </button>
            <button
              type="button"
              onClick={handleDecline}
              disabled={isSubmitting}
              className="flex-1 rounded-2xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              No gracias
            </button>
          </div>
        </div>
      </div>
    )}
  </main>
);
}

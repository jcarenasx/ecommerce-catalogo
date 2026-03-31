import { useState } from "react";
import ProductCard from "../components/ProductCard";
import Pill from "../components/ui/Pill";
import { useProductBrands } from "../hooks/useProductBrands";
import { useProductCategories } from "../hooks/useProductCategories";
import { useProducts } from "../hooks/useProducts";
import Loader from "../components/ui/Loader";

export default function Home() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const { data: products = [], isLoading, isError, error } = useProducts({
    category: categoryFilter ?? undefined,
    brand: brandFilter ?? undefined,
  });
  const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();
  const { data: brands = [], isLoading: brandsLoading } = useProductBrands();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4.75rem)] w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:py-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Catalogo
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          Colección activa
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Selecciona lo que necesites y solicita el enlace de pago con o sin
          envío directamente desde cada producto. Si tienes dudas, el botón de
          WhatsApp te conecta con nosotros en segundos.
        </p>
      </header>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Pill
            active={categoryFilter === null}
            onClick={() => setCategoryFilter(null)}
            className="px-4"
          >
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

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Pill
            active={brandFilter === null}
            onClick={() => setBrandFilter(null)}
            className="px-4"
          >
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

      {!isLoading && !isError && products.length === 0 && (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          El catálogo está vacio por el momento. Regresa más tarde para ver las novedades.
        </p>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.model} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

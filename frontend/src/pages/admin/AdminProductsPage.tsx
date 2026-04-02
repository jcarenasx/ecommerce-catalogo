import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ApiError } from "../../lib/api";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Pill from "../../components/ui/Pill";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import { useAdminProductList } from "../../hooks/useAdminProductList";
import { useAvailabilityTags } from "../../hooks/useAvailabilityTags";
import { useAdminAvailabilityTags } from "../../hooks/useAdminAvailabilityTags";
import { useProductCategories } from "../../hooks/useProductCategories";
import type { Product, ProductInput } from "../../types";
import { uploadGalleryImages } from "../../services/mediaService";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 5_242_880;

type ProductFormState = {
  name: string;
  size: string;
  color: string;
  model: string;
  sku: string;
  category: string;
  brand: string;
  priceCents: string;
  paymentLinkWithShipping: string;
  paymentLinkWithoutShipping: string;
  images: string[];
  active: boolean;
  availabilityTagId: string;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  size: "",
  color: "",
  model: "",
  sku: "",
  category: "",
  brand: "",
  priceCents: "",
  paymentLinkWithShipping: "",
  paymentLinkWithoutShipping: "",
  images: [],
  active: true,
  availabilityTagId: "",
};

const createEmptyFormState = (): ProductFormState => ({
  ...EMPTY_FORM,
  images: [],
  active: true,
  availabilityTagId: "",
});

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

const mapFormToInput = (state: ProductFormState): ProductInput => {
  const trimmedModel = state.model.trim();
  const finalName = state.name.trim() || trimmedModel;

  return {
    name: finalName,
    size: toNullable(state.size),
    color: toNullable(state.color),
    model: trimmedModel,
    sku: toNullable(state.sku),
    priceCents:
      state.priceCents.trim() === "" ? null : Number(state.priceCents.trim()),
    paymentLinkWithShipping: toNullable(state.paymentLinkWithShipping),
    paymentLinkWithoutShipping: toNullable(state.paymentLinkWithoutShipping),
    category: toNullable(state.category),
    brand: toNullable(state.brand),
    images: state.images,
    active: state.active,
    availabilityTagId: state.availabilityTagId.trim() === "" ? null : state.availabilityTagId,
  };
};

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return "Sin precio";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value / 100);
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export default function AdminProductsPage() {
  const ITEMS_PER_PAGE = 10;
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { createProduct, editProduct, deleteProduct } = useAdminProducts();
  const { data: categorySuggestions = [] } = useProductCategories(true);
  const currentOffset = (currentPage - 1) * ITEMS_PER_PAGE;
  const { data, isLoading, isError, error } = useAdminProductList({
    category: categoryFilter ?? undefined,
    search: searchTerm || undefined,
    limit: ITEMS_PER_PAGE,
    offset: currentOffset,
  });
  const {
    data: availabilityTags = [],
    isLoading: availabilityTagsLoading,
    isError: availabilityTagsLoadError,
    error: availabilityTagsErrorValue,
  } = useAvailabilityTags();
  const { createTag } = useAdminAvailabilityTags();
  const products = data?.products ?? [];
  const totalProducts = data?.total ?? 0;
  const totalPages = totalProducts > 0 ? Math.ceil(totalProducts / ITEMS_PER_PAGE) : 1;
  const showingFrom = totalProducts === 0 ? 0 : currentOffset + 1;
  const showingTo = Math.min(totalProducts, currentOffset + products.length);
  const [editingProductModel, setEditingProductModel] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProductFormState>(() => createEmptyFormState());
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageInputValue, setImageInputValue] = useState("");
  const [togglingProductModel, setTogglingProductModel] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [availabilityTagNameInput, setAvailabilityTagNameInput] = useState("");
  const [availabilityTagFeedback, setAvailabilityTagFeedback] = useState<string | null>(null);
  const [availabilityTagError, setAvailabilityTagError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingProductModel(null);
    setFormState(createEmptyFormState());
    setFormError(null);
    setUploadError(null);
    setImageInputValue("");
    setAvailabilityTagFeedback(null);
    setAvailabilityTagError(null);
    setAvailabilityTagNameInput("");
  };

  const handleCategoryFilter = (category: string | null) => {
    setCategoryFilter((current) => {
      const next = current === category ? null : category;
      if (next !== current) {
        setCurrentPage(1);
      }
      return next;
    });
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    setSearchTerm(trimmed);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((current) => Math.max(1, current - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((current) => Math.min(totalPages, current + 1));
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleEdit = (product: Product) => {
    setEditingProductModel(product.model);
    setFormState({
      name: product.name ?? product.model,
      size: product.size ?? "",
      color: product.color ?? "",
      model: product.model ?? "",
      sku: product.sku ?? "",
      category: product.category ?? "",
      brand: product.brand ?? "",
      priceCents: product.priceCents !== null ? String(product.priceCents) : "",
      paymentLinkWithShipping: product.paymentLinkWithShipping ?? "",
      paymentLinkWithoutShipping: product.paymentLinkWithoutShipping ?? "",
      images: product.images ?? [],
      active: product.active ?? true,
      availabilityTagId: product.availabilityTag?.id ?? "",
    });
    setFormError(null);
    setUploadError(null);
    setAvailabilityTagFeedback(null);
    setAvailabilityTagError(null);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleToggleActive = async (product: Product) => {
    setFormError(null);
    setTogglingProductModel(product.model);

    try {
      await editProduct.mutateAsync({
        productModel: product.model,
        input: {
          name: product.name,
          model: product.model,
          size: product.size,
          color: product.color,
          sku: product.sku ?? undefined,
          priceCents: product.priceCents,
          paymentLinkWithShipping: product.paymentLinkWithShipping ?? undefined,
          paymentLinkWithoutShipping: product.paymentLinkWithoutShipping ?? undefined,
          category: product.category ?? undefined,
          brand: product.brand ?? undefined,
          images: product.images ?? [],
          active: !product.active,
        },
      });
    } catch (mutationError) {
      if (mutationError instanceof ApiError) {
        setFormError(mutationError.message);
      } else {
        setFormError("No se pudo actualizar la visibilidad del producto.");
      }
  } finally {
    setTogglingProductModel(null);
  }
};

  const handleCreateAvailabilityTag = async () => {
    setAvailabilityTagFeedback(null);
    setAvailabilityTagError(null);

    const trimmed = availabilityTagNameInput.trim();
    if (trimmed === "") {
      setAvailabilityTagError("Escribe el nombre de la etiqueta antes de crearla.");
      return;
    }

    try {
      const tag = await createTag.mutateAsync(trimmed);
      setFormState((current) => ({ ...current, availabilityTagId: tag.id }));
      setAvailabilityTagFeedback("Etiqueta creada y seleccionada.");
      setAvailabilityTagNameInput("");
    } catch (mutationError) {
      if (mutationError instanceof ApiError) {
        setAvailabilityTagError(mutationError.message);
      } else {
        setAvailabilityTagError("No se pudo crear la etiqueta.");
      }
    }
  };

  const handleAddImageLink = () => {
    const trimmed = imageInputValue.trim();
    if (trimmed === "") {
      return;
    }

    if (!isValidUrl(trimmed)) {
      setFormError("El enlace debe ser una URL válida.");
      return;
    }

    setFormState((current) => {
      if (current.images.includes(trimmed)) {
        setFormError("Esa imagen ya está en la galería.");
        return current;
      }
      return { ...current, images: [...current.images, trimmed] };
    });
    setFormError(null);
    setImageInputValue("");
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList) as File[];
    const invalidType = files.find((file) => !ACCEPTED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      setUploadError("Solo se admiten imágenes .jpg, .png, .webp o .avif.");
      return;
    }

    const tooLarge = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (tooLarge) {
      setUploadError("Alguna imagen excede el límite de 5 MB.");
      return;
    }

    setUploadError(null);
    setIsUploadingImage(true);

    try {
      const urls = await uploadGalleryImages(files);
      setFormState((current) => ({
        ...current,
        images: [...current.images, ...urls],
      }));
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "No se pudieron subir las imágenes."
      );
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (url: string) => {
    setFormState((current) => ({
      ...current,
      images: current.images.filter((item) => item !== url),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const priceField = formState.priceCents.trim();
    if (priceField) {
      const parsed = Number(priceField);
      if (!Number.isInteger(parsed) || parsed < 0) {
        setFormError("El precio debe ser un entero positivo en centavos.");
        return;
      }
    }

    const linkFields = [
      {
        label: "Link con envío",
        value: formState.paymentLinkWithShipping.trim(),
      },
      {
        label: "Link sin envío",
        value: formState.paymentLinkWithoutShipping.trim(),
      },
    ]
      .filter((field) => field.value !== "")
      .filter((field) => !isValidUrl(field.value));

    if (linkFields.length > 0) {
      setFormError(`El campo "${linkFields[0].label}" no contiene una URL válida.`);
      return;
    }

    const modelField = formState.model.trim();
    if (modelField === "") {
      setFormError("El modelo es obligatorio.");
      return;
    }

    const nextInput = mapFormToInput(formState);

    try {
      if (editingProductModel === null) {
        await createProduct.mutateAsync(nextInput);
      } else {
        await editProduct.mutateAsync({
          productModel: editingProductModel,
          input: nextInput,
        });
      }

      resetForm();
    } catch (mutationError) {
      if (mutationError instanceof ApiError) {
        setFormError(mutationError.message);
      } else {
        setFormError("No se pudo guardar el producto.");
      }
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
          Administración
        </p>
        <h1 className="text-3xl font-semibold text-stone-900">Catálogo de productos</h1>
        <p className="max-w-2xl text-sm text-stone-600">
          Controla los productos y enlaces de pago visibles para el público. Los
          campos vacíos se omiten en la tienda y las imágenes se almacenan en S3
          mediante URLs firmadas.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-stone-900">Productos del catálogo</h2>
          </div>
          <div className="border-b border-stone-200 px-5 py-5">
            <div className="flex flex-wrap gap-2">
              <Pill
                active={categoryFilter === null}
                onClick={() => handleCategoryFilter(null)}
              >
                Todas las categorías
              </Pill>
              {categorySuggestions.map((category) => (
                <Pill
                  key={category}
                  active={categoryFilter === category}
                  onClick={() => handleCategoryFilter(category)}
                >
                  {category}
                </Pill>
              ))}
            </div>
            <form
              className="mt-4 flex flex-wrap items-center gap-3"
              onSubmit={handleSearchSubmit}
            >
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar por nombre o modelo"
                className="flex-1 min-w-[200px] rounded-2xl border border-stone-200 px-4 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500"
              />
              <Button type="submit" variant="ghost">
                Buscar
              </Button>
              {isLoading && <Loader />}
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-stone-500">
              <span>
                {showingFrom === 0
                  ? "Sin productos"
                  : `Mostrando ${showingFrom}–${showingTo} de ${totalProducts}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={currentPage <= 1}
                  className="rounded-full border border-stone-200 px-3 py-1 text-[0.65rem] font-semibold text-stone-600 transition hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-[0.65rem] font-semibold text-stone-600">
                  {`Página ${currentPage}/${totalPages}`}
                </span>
                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages}
                  className="rounded-full border border-stone-200 px-3 py-1 text-[0.65rem] font-semibold text-stone-600 transition hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
            {isError && (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error instanceof Error
                  ? error.message
                  : "No se pudieron cargar los productos."}
              </p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-[0.3em] text-stone-500">
                <tr>
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Modelo</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Marca</th>
                  <th className="px-5 py-3">Tallas</th>
                  <th className="px-5 py-3">Precio</th>
                  <th className="px-5 py-3">Enlaces</th>
                  <th className="px-5 py-3">Vitrina</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-6 text-center text-sm text-stone-500">
                      No se encontraron productos. Ajusta los filtros si deseas ver más resultados.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const photoCount = product.images?.length ?? 0;

                    return (
                      <tr key={product.model}>
                        <td className="px-5 py-4 font-semibold text-stone-900">{product.name}</td>
                        <td className="px-5 py-4 text-stone-700">{product.model}</td>
                        <td className="px-5 py-4 text-stone-700">{product.sku ?? "—"}</td>
                        <td className="px-5 py-4 text-stone-700">{product.category ?? "—"}</td>
                        <td className="px-5 py-4 text-stone-700">{product.brand ?? "—"}</td>
                        <td className="px-5 py-4 text-stone-700">{product.size ?? "—"}</td>
                        <td className="px-5 py-4 text-stone-700">
                          {formatCurrency(product.priceCents)}
                        </td>
                        <td className="px-5 py-4 text-stone-700">
                          {photoCount === 0
                            ? "Sin fotos"
                            : `${photoCount} foto${photoCount === 1 ? "" : "s"}`}
                        </td>
                        <td className="px-5 py-4 text-stone-700">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] ${
                              product.active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {product.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(product)}
                              className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              disabled={togglingProductModel === product.model}
                              onClick={() => handleToggleActive(product)}
                              className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {product.active ? "Desactivar" : "Reactivar"}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct.mutate(product.model)}
                              className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-8">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {editingProductModel === null ? "Crear nuevo producto" : "Editar producto existente"}
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Los campos vacíos no se mostrarán en la tienda pública.
              </p>
            </div>
            {editingProductModel !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Cancelar edición
              </button>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">Nombre</span>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                  placeholder="Nombre del producto"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">Talla</span>
                <input
                  type="text"
                  value={formState.size}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, size: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                  placeholder="Ej. M, 38, S"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">Color</span>
                <input
                  type="text"
                  value={formState.color}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, color: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                  placeholder="Ej. Negro, Blanco"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">Modelo</span>
                <input
                  type="text"
                  value={formState.model}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, model: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                  placeholder="Ej. Graduate"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">Categoría</span>
                <input
                  type="text"
                  list="category-options"
                  value={formState.category}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, category: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                  placeholder="Ej. Calzado"
                />
                <datalist id="category-options">
                  {categorySuggestions.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">Marca</span>
                <input
                  type="text"
                  value={formState.brand}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, brand: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                  placeholder="Ej. Nike"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">Disponibilidad</span>
                <select
                  value={formState.availabilityTagId}
                  onChange={(event) => {
                    setFormState((current) => ({
                      ...current,
                      availabilityTagId: event.target.value,
                    }));
                    setAvailabilityTagFeedback(null);
                    setAvailabilityTagError(null);
                  }}
                  disabled={availabilityTagsLoading}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-50"
                >
                  <option value="">Sin etiqueta</option>
                  {availabilityTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                {availabilityTagsLoading && (
                  <p className="mt-1 text-xs text-stone-500">Cargando etiquetas...</p>
                )}
                {availabilityTagsLoadError && (
                  <p className="mt-1 text-xs text-rose-600">
                    {availabilityTagsErrorValue instanceof Error
                      ? availabilityTagsErrorValue.message
                      : "No se pudieron cargar las etiquetas."}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">SKU</span>
                <input
                  type="text"
                  value={formState.sku}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, sku: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                  placeholder="Código interno"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">Precio (centavos)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formState.priceCents}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      priceCents: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                  placeholder="165000 para $1,650.00"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">Link con envío</span>
                <input
                  type="url"
                  value={formState.paymentLinkWithShipping}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      paymentLinkWithShipping: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                  placeholder="https://..."
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">Link sin envío</span>
                <input
                  type="url"
                  value={formState.paymentLinkWithoutShipping}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      paymentLinkWithoutShipping: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                  placeholder="https://..."
                />
              </label>

            <div className="space-y-3 border-b border-stone-100 pb-4">
              <p className="text-sm font-medium text-stone-700">
                ¿No ves la etiqueta adecuada?
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={availabilityTagNameInput}
                  onChange={(event) => {
                    setAvailabilityTagNameInput(event.target.value);
                    setAvailabilityTagFeedback(null);
                    setAvailabilityTagError(null);
                  }}
                  disabled={createTag.isPending}
                  className="flex-1 min-w-[200px] rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-50"
                  placeholder="Escribe un nombre y crea la etiqueta"
                />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={handleCreateAvailabilityTag}
                  disabled={createTag.isPending}
                >
                  {createTag.isPending ? "Creando etiqueta..." : "Crear etiqueta"}
                </Button>
              </div>
              {availabilityTagFeedback && (
                <p className="text-xs text-emerald-700">{availabilityTagFeedback}</p>
              )}
              {availabilityTagError && (
                <p className="text-xs text-rose-700">{availabilityTagError}</p>
              )}
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-700">URLs de imágenes</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
                      El orden define la vista principal
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <input
                      type="url"
                      value={imageInputValue}
                      onChange={(event) => {
                        setImageInputValue(event.target.value);
                        setFormError(null);
                      }}
                      className="flex-1 min-w-[220px] rounded-2xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                      placeholder="https://..."
                    />
                    <Button variant="ghost" type="button" onClick={handleAddImageLink}>
                      Añadir enlace
                    </Button>
                  </div>
                  <p className="text-xs text-stone-500">
                    Puedes pegar varias URLs y subir nuevas imágenes; cualquier enlace duplicado será ignorado.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Subir imágenes
                    </Button>
                    <span className="text-xs text-stone-500">
                      .jpg/.png/.webp/.avif (hasta 5 MB)
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  {formState.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {formState.images.map((url) => (
                        <div
                          key={url}
                          className="relative h-20 overflow-hidden rounded-3xl border border-stone-200 bg-stone-50"
                        >
                          <img src={url} alt="Galería" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            aria-label="Eliminar imagen"
                            onClick={() => handleRemoveImage(url)}
                            className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-stone-500 transition hover:bg-white hover:text-stone-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-sm text-stone-600">
              <label className="inline-flex items-center gap-3 text-stone-900">
                <input
                  type="checkbox"
                  checked={formState.active}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, active: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                Mostrar en vitrina pública
              </label>
              <p className="text-xs text-stone-500">
                Cuando el producto está desactivado no aparece en la tienda pública, pero conserva
                toda su configuración para volverlo a usar.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {(formError || uploadError) && (
                <p className="rounded-2xl border border-red-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {uploadError ?? formError}
                </p>
              )}
              {isUploadingImage && (
                <p className="flex items-center gap-2 text-sm text-stone-500">
                  <span className="h-2 w-2 animate-spin rounded-full border border-stone-500 border-t-transparent" />
                  Subiendo imágenes al servidor...
                </p>
              )}

              <button
                type="submit"
                disabled={createProduct.isPending || editProduct.isPending || isUploadingImage}
                className="w-full rounded-2xl bg-stone-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
              {createProduct.isPending || editProduct.isPending
                ? "Guardando cambios..."
                : editingProductModel === null
                  ? "Crear producto ahora"
                  : "Guardar cambios del producto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

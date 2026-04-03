import { Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!copyFeedback) return;
    const timeout = window.setTimeout(() => setCopyFeedback(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyFeedback]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-72 shrink-0 border-r border-stone-200 bg-stone-950 px-6 py-8 text-stone-100 lg:block">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
            Aweshop MX
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Panel administrativo</h1>
          <nav className="mt-10 flex flex-col gap-2">
            <Link
              to="/admin/products"
              className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15"
            >
              Catálogo privado
            </Link>
            <Link
              to="/admin/availability"
              className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15"
            >
              Etiquetas de disponibilidad
            </Link>
            <button
              type="button"
              onClick={() => {
                if (!navigator?.clipboard) return;
                const baseUrl = `${window.location.origin}`;
                const message = `Tenemos nuevos productos disponibles en el catálogo 👇\n${baseUrl}`;
                navigator.clipboard.writeText(message).then(() => {
                  setCopyFeedback("Mensaje copiado");
                });
              }}
              className="rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-medium transition hover:bg-white/15"
            >
              Enviar notificación
            </button>
            {copyFeedback && (
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-emerald-400">
                {copyFeedback}
              </p>
            )}
            <Link
              to="/admin/customers"
              className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15"
            >
              Clientes
            </Link>
          </nav>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">{user?.email}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">
              {user?.role}
            </p>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-4 rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Cerrar sesion
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-stone-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Aweshop MX
                </p>
                <h1 className="text-lg font-semibold text-stone-900">
                  Panel administrativo
                </h1>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Cerrar sesion
              </button>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

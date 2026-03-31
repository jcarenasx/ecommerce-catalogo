import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
        Acceso denegado
      </p>
      <h1 className="text-3xl font-semibold text-stone-900">
        Necesitas estar logueado como administrador
      </h1>
      <p className="text-sm text-stone-600">
        Por seguridad, el panel admin queda protegido. Inicia sesión con una cuenta
        con role <strong>ADMIN</strong> o regresa al catálogo público.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/login"
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
        >
          Ir a login
        </Link>
        <Link
          to="/home"
          className="rounded-full border border-transparent bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}

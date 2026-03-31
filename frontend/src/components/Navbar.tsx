import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <Link to="/home" className="text-xl font-semibold text-slate-900">
            Catálogo
          </Link>
          <p className="mt-1 text-sm text-slate-500">
            Productos seleccionados para mostrar al público.
          </p>
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Público
        </div>
      </div>
    </nav>
  );
}

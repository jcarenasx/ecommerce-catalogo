import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className="overflow-hidden rounded-xl border border-slate-200 bg-black shadow-sm"
          >
            <img
              src="/aweshop-logo.jpg"
              alt="AweShop"
              className="h-12 w-28 object-cover sm:h-14 sm:w-32"
            />
          </Link>
          <div>
            <Link to="/home" className="text-xl font-semibold text-slate-900">
              AweShop MX
            </Link>
            <p className="mt-1 text-sm text-slate-500">
              Sneakers y productos seleccionados para tu catalogo privado.
            </p>
          </div>
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Catalogo
        </div>
      </div>
    </nav>
  );
}

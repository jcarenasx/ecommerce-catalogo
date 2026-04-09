import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-sm"
          >
            <img
              src="/aweshop-logo.jpg"
              alt="AweShop"
              className="h-12 w-28 object-cover sm:h-14 sm:w-32"
            />
          </Link>
          <div>
            <Link to="/home" className="text-xl font-semibold text-white">
              AweShop MX
            </Link>
            <p className="mt-1 text-sm text-white/60">
              Seleccion de sneakers y accesorios.
            </p>
          </div>
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/40">
          Catalogo
        </div>
      </div>
    </nav>
  );
}

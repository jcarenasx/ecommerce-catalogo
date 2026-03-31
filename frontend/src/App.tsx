import LoginForm from "./components/LoginForm";
import Navbar from "./components/Navbar";
import WhatsAppContactButton from "./components/WhatsAppContactButton";
import { useAuth } from "./context/useAuth";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import AccessDenied from "./components/AccessDenied";

function AdminRoute() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return <Outlet />;
}

function LoginRoute() {
  return <LoginForm />;
}

function App() {
  const { isLoading } = useAuth();
  const location = useLocation();
  const isHomeRoute = location.pathname === "/home" || location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {isHomeRoute && <Navbar />}
      {isLoading ? (
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10">
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            Revisando sesion...
          </p>
        </main>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="products" element={<AdminProductsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      )}
      {isHomeRoute && <WhatsAppContactButton />}
    </div>
  );
}

export default App;

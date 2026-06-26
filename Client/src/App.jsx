import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./layout/Footer";
import HomePage from "./pages/HomePage";
import TailorPage from "./pages/TailorPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TailorDashboardPage from "./pages/TailorDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import TopRatedPage from "./pages/TopRatedPage";
import ProfilePage from "./pages/ProfilePage";

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tailor/:id" element={<TailorPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register/tailor" element={<RegisterPage role="tailor" />} />
                <Route
                  path="/dashboard/tailor"
                  element={
                    <PrivateRoute role="tailor">
                      <TailorDashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route path="/admin/tci_01/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin/tci_01/dashboard_hidden"
                  element={
                    <PrivateRoute role="admin">
                      <AdminDashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route path="/top-rated" element={<TopRatedPage />} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="*"
                  element={
                    <div className="max-w-2xl mx-auto px-6 py-32 text-center">
                      <p className="font-d text-[80px] text-ink-100 leading-none">404</p>
                      <p className="font-d text-2xl text-ink-900 mt-2 mb-4">Page not found</p>
                      <p className="font-t italic text-ink-500 mb-8">
                        The page you're looking for doesn't exist.
                      </p>
                      <Link
                        to="/"
                        className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs text-ink-900 border border-ink-900 px-5 py-2.5 rounded-sm hover:bg-ink-900 hover:text-paper-50 transition-colors duration-base"
                      >
                        Back to home
                      </Link>
                    </div>
                  }
                />
              </Routes>
            </main>

            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

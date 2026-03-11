import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import About from "./pages/About";
import ContactPage from "./pages/ContactPage";
import Shop from "./pages/Shop";
import Nav from "./commponent/Nav";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/home";
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./commponent/Dashboard";
import ProductsPage from "./commponent/ProductsPage";
import CustomersPage from "./commponent/CustomersPage";
import RegisterForm from "./commponent/RegisterForm";
import ProtectedRoute from "./commponent/ProtectedRoute";
import NotificationsPage from "./pages/NotificationsPage";

function AppRoutes() {
  const [user, setUser] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const hideNav =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNav && <Nav user={user} setUser={setUser} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/contact-me" element={<ContactPage />} />

        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterForm />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route
          path="*"
          element={
            <h1 className="flex justify-center items-center h-dvh font-bold">
              Error 404 || Page not found 😢
            </h1>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <div className="w-full overflow-hidden dark:bg-black dark:text-white">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

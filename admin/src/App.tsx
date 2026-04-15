import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminLayout } from "./components/admin/AdminLayout";
import { DashboardHome } from "./components/admin/DashboardHome";
import { ProductManagement } from "./components/admin/ProductManagement";
import { StudioManagement } from "./components/admin/StudioManagement";
import { OrderManagement } from "./components/admin/OrderManagement";
import { ContactManagement } from "./components/admin/ContactManagement";
import { ModelManagement } from "./components/admin/ModelManagement";
import { ClientAccessManagement } from "./components/admin/ClientAccessManagement";
import { SettingsManagement } from "./components/admin/SettingsManagement";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { useAdminAuthStore } from "./store/adminAuthStore";
import { API_URL } from "./config";

function App() {
  const { token, logout } = useAdminAuthStore();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          logout();
        }
      } catch (error) {
        console.error("Token validation failed:", error);
      }
    };

    validateToken();
  }, [token, logout]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="models" element={<ModelManagement />} />
          <Route path="client-access" element={<ClientAccessManagement />} />
          <Route path="studio" element={<StudioManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="messages" element={<ContactManagement />} />
          <Route path="settings" element={<SettingsManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="bottom-right" richColors />
    </BrowserRouter>
  );
}

export default App;

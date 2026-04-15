import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { MainLayout } from "./components/MainLayout";
import { ScrollToTop } from "./components/ScrollToTop";
import { HomePage } from "./pages/HomePage";
import { StudioPage } from "./pages/StudioPage";
import { ContactPage } from "./pages/ContactPage";
import { AboutPage } from "./pages/AboutPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "./pages/TermsOfServicePage";
import { ModelAccessPage } from "./pages/ModelAccessPage";
import { ShopProvider } from "./context/ShopContext";
import { CartProvider } from "./context/CartContext";
import { StudioProvider } from "./context/StudioContext";

function App() {
  return (
    <ShopProvider>
      <CartProvider>
        <StudioProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/studio" element={<StudioPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/3d-access" element={<ModelAccessPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="bottom-right" richColors />
          </BrowserRouter>
        </StudioProvider>
      </CartProvider>
    </ShopProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { MainLayout } from './components/MainLayout';
import { HomePage } from './pages/HomePage';
import { ShopProvider } from './context/ShopContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <ShopProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="bottom-right" richColors />
        </BrowserRouter>
      </CartProvider>
    </ShopProvider>
  );
}

export default App;

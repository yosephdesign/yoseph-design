import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { LightWaves } from './ui/LightWaves';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { ProductDetail } from './ProductDetail';
import { CartProvider } from '../context/CartContext';
import { Outlet } from 'react-router-dom';
import { Product } from '../data/products';

export const MainLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchSelectedProduct, setSearchSelectedProduct] = useState<Product | null>(null);

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
        <LightWaves />
        <Header 
          onOpenCart={() => setIsCartOpen(true)} 
          onSelectProduct={setSearchSelectedProduct}
        />
        
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>

        <Footer />

        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          onCheckout={handleOpenCheckout}
        />
        
        <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
        />

        {/* Product detail from search */}
        <ProductDetail 
          product={searchSelectedProduct} 
          isOpen={!!searchSelectedProduct} 
          onClose={() => setSearchSelectedProduct(null)} 
        />
      </div>
    </CartProvider>
  );
};
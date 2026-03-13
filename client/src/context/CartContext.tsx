import React, { createContext, useContext, useState, useMemo } from 'react';
import { Product } from '../data/products';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(() => 
    items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  [items]);

  const itemCount = useMemo(() => 
    items.reduce((acc, item) => acc + item.quantity, 0),
  [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  // #region agent log
  fetch('http://127.0.0.1:7820/ingest/2ac2eff3-ff6b-4709-856e-6f4cc9b8f30c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c217ea'},body:JSON.stringify({sessionId:'c217ea',location:'CartContext.tsx:useCart',message:'useCart called',data:{hasContext:!!context},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
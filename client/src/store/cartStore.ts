import { create } from 'zustand';
import { Product } from '../data/products';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

// Simple state management using a pattern similar to zustand but without the library if possible
// Wait, I'll just use a React Context for simplicity and to avoid adding more libs if not needed.
// Actually, let's use a custom hook and context.
import { create } from 'zustand';
import { Product } from '../data/products';
import { Order, OrderStatus } from '../types/admin';
import { useAdminAuthStore } from './adminAuthStore';

const API_URL = 'http://localhost:4000';

interface AdminState {
  products: Product[];
  orders: Order[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

const getAuthHeaders = () => {
  const token = useAdminAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleAuthError = (res: Response) => {
  if (res.status === 401) {
    useAdminAuthStore.getState().logout();
    throw new Error('Session expired. Please login again.');
  }
};

export const useAdminStore = create<AdminState>((set) => ({
  products: [],
  orders: [],
  loading: false,

  fetchProducts: async () => {
    try {
      set({ loading: true });
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const products = await res.json();
        set({ products });
      } else {
        console.error('Failed to fetch products:', res.status);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchOrders: async () => {
    try {
      set({ loading: true });
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        handleAuthError(res);
        return;
      }
      if (res.ok) {
        const orders = await res.json();
        set({ orders });
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    const res = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product),
    });
    
    if (res.status === 401) {
      handleAuthError(res);
      return;
    }
    
    if (!res.ok) {
      throw new Error('Failed to add product');
    }
    
    const newProduct = await res.json();
    set((state) => ({ products: [...state.products, newProduct] }));
  },

  updateProduct: async (product) => {
    const res = await fetch(`${API_URL}/api/products/${product.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(product),
    });
    
    if (res.status === 401) {
      handleAuthError(res);
      return;
    }
    
    if (!res.ok) {
      throw new Error('Failed to update product');
    }
    
    const updatedProduct = await res.json();
    set((state) => ({
      products: state.products.map((p) =>
        p.id === product.id ? updatedProduct : p
      ),
    }));
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (res.status === 401) {
      handleAuthError(res);
      return;
    }
    
    if (!res.ok) {
      throw new Error('Failed to delete product');
    }
    
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    if (res.status === 401) {
      handleAuthError(res);
      return;
    }
    
    if (!res.ok) {
      throw new Error('Failed to update order status');
    }
    
    const updatedOrder = await res.json();
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? updatedOrder : o
      ),
    }));
  },
}));

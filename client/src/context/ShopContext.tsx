import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Product } from "../data/products";
import { toast } from "sonner";
import { API_URL } from "../config";
import { useClientAuthStore } from "../store/clientAuthStore";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface CreateOrderData {
  customerName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  total: number;
}

interface ShopContextType {
  products: Product[];
  loading: boolean;
  refetchProducts: () => Promise<void>;
  createOrder: (orderData: CreateOrderData) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: CreateOrderData) => {
    try {
      const [firstName, ...lastNameParts] = orderData.customerName.split(" ");
      const lastName = lastNameParts.join(" ") || "";
      const token = useClientAuthStore.getState().getToken();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          status: "pending",
          items: orderData.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total: orderData.total,
          customer: {
            firstName,
            lastName,
            email: orderData.email,
            phone: orderData.phone,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ShopContext.Provider
      value={{ products, loading, refetchProducts: fetchProducts, createOrder }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within a ShopProvider");
  return context;
}

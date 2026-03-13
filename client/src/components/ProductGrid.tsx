import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { ProductDetail } from './ProductDetail';
import { Product } from '../data/products';

export const ProductGrid = () => {
  const { products, loading } = useShop();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <section className="py-12 px-4 md:px-6" id="collection">
           {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-neutral-200 mb-4"></div>
              <div className="h-4 bg-neutral-200 w-3/4 mb-2"></div>
              <div className="h-4 bg-neutral-200 w-1/4"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-lg">No products found.</p>
          <p className="text-sm mt-2">Make sure the server is running at http://localhost:4000</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {products.map(product => (
            <div key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      <ProductDetail 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </section>
  );
};

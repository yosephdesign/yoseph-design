import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { ProductDetail } from './ProductDetail';
import { Product3DModal } from './Product3DModal';
import { Product } from '../data/products';
import { API_URL } from '../config';

export const ProductGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const productIdFromUrl = searchParams.get('product');
  const categoryFromUrl = searchParams.get('category');
  const { products, loading } = useShop();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productFor3D, setProductFor3D] = useState<Product | null>(null);

  const filteredProducts =
    categoryFromUrl && categoryFromUrl.trim() !== ''
      ? products.filter((p) => p.category === categoryFromUrl)
      : products;

  useEffect(() => {
    if (loading || !productIdFromUrl || products.length === 0) return;
    const product = products.find((p) => p.id === productIdFromUrl);
    if (product) setSelectedProduct(product);
  }, [loading, productIdFromUrl, products]);

  const handleCloseDetail = () => {
    setSelectedProduct(null);
    const next = new URLSearchParams(searchParams);
    next.delete('product');
    setSearchParams(next, { replace: true });
  };

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
          <p className="text-sm mt-2">Make sure the API is reachable ({API_URL}).</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-lg">No products in this category yet.</p>
          <p className="text-sm mt-2">Try another category from the sidebar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filteredProducts.map(product => (
            <div key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
              <ProductCard
                product={product}
                onGet3DModel={(p) => setProductFor3D(p)}
              />
            </div>
          ))}
        </div>
      )}

      <ProductDetail 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={handleCloseDetail} 
      />

      <Product3DModal
        product={productFor3D}
        isOpen={!!productFor3D}
        onClose={() => setProductFor3D(null)}
      />
    </section>
  );
};

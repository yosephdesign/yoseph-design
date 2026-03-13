import React from 'react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { Plus, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`, {
      description: "You can view it in your shopping bag.",
      duration: 2000,
    });
  };

  return (
    <div className="group relative">
      <div className="aspect-[4/5] overflow-hidden bg-neutral-100 mb-4 relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
           <div className="flex gap-2">
             <button 
               onClick={handleAddToCart}
               className="bg-white text-black p-3 hover:bg-neutral-900 hover:text-white transition-colors"
               title="Add to Cart"
             >
               <Plus size={20} />
             </button>
             <button className="bg-white text-black p-3 hover:bg-neutral-900 hover:text-white transition-colors" title="View Details">
               <Info size={20} />
             </button>
           </div>
        </div>
        {product.featured && (
          <div className="absolute top-4 left-4">
             <span className="bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm">
               Featured
             </span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-neutral-800 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-neutral-500 mt-1">{product.category}</p>
        </div>
        <span className="text-sm font-semibold whitespace-nowrap">${product.price.toLocaleString()}</span>
      </div>
    </div>
  );
};
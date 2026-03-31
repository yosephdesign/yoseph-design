import React, { useState, useRef, useCallback } from 'react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { Plus, Info, Box, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ZOOM_SCALE = 1.8;

interface ProductCardProps {
  product: Product;
  onGet3DModel?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onGet3DModel }) => {
  const { addItem } = useCart();
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`, {
      description: "You can view it in your shopping bag.",
      duration: 2000,
    });
  };

  const handleGet3DModel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGet3DModel?.(product);
  };

  const has3D = product.modelFiles && product.modelFiles.length > 0;

  return (
    <div className="group relative">
      <div
        ref={containerRef}
        className="aspect-[4/5] overflow-hidden bg-neutral-100 mb-4 relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 ease-out"
          style={{
            transformOrigin: `${origin.x}% ${origin.y}%`,
            transform: isHovering ? `scale(${ZOOM_SCALE})` : 'scale(1)',
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none [&_button]:pointer-events-auto">
           <div className="flex flex-wrap gap-2 justify-center p-2">
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
             {has3D && (
               <button 
                 onClick={handleGet3DModel}
                 className="p-3 transition-colors flex items-center gap-1.5 bg-white text-black hover:bg-neutral-900 hover:text-white"
                 title="Get 3D model"
               >
                 <Box size={20} />
                 <span className="text-[10px] font-bold uppercase tracking-wider">3D</span>
               </button>
             )}
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

      {/* Mobile/Tablet action buttons */}
      <div className="flex lg:hidden gap-4 mb-3">
        <button
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold uppercase tracking-wider active:scale-95 transition-all cursor-pointer rounded-4xl"
        >
          <Plus size={13} />
          <span>Add</span>
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-neutral-100 text-neutral-700 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 text-[11px] font-semibold uppercase tracking-wider active:scale-90 transition-all border border-neutral-200/60 cursor-pointer rounded-4xl"
          title="View Details"
        >
          <Info size={13} />
          <span>Details</span>
        </button>
        {has3D && (
          <button
            onClick={handleGet3DModel}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-all border rounded-lg bg-neutral-100 text-neutral-700 border-neutral-200/60 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 active:scale-95 cursor-pointer"
            title="Get 3D model"
          >
            <Box size={13} />
            <span>3D</span>
          </button>
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
import * as Dialog from '@radix-ui/react-dialog';
import { X, ShoppingBag, Minus, Plus } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetail = ({ product, isOpen, onClose }: ProductDetailProps) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`${quantity} × ${product.name} added to cart`);
    setQuantity(1);
    onClose();
  };

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) { setQuantity(1); onClose(); } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120]" />
        <AnimatePresence>
          {isOpen && (
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-4xl bg-white z-[121] shadow-2xl focus:outline-none rounded-xl sm:rounded-none overflow-hidden"
              >
                {/* Mobile Close Button - Fixed at top */}
                <button 
                  onClick={onClose}
                  className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg sm:hidden"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col sm:flex-row h-full sm:h-auto sm:max-h-[90vh]">
                  {/* Image Section */}
                  <div className="relative w-full sm:flex-1 h-56 sm:h-auto sm:min-h-[500px] bg-neutral-100 shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                    {/* Category Badge on Image - Mobile */}
                    <span className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest rounded-full sm:hidden">
                      {product.category}
                    </span>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col overflow-y-auto">
                    <div className="p-5 sm:p-10 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4 sm:mb-6">
                        <div>
                          <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-1">
                            {product.category}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{product.name}</h2>
                          <p className="text-xl sm:text-2xl font-light mt-1">${product.price.toLocaleString()}</p>
                        </div>
                        {/* Desktop Close Button */}
                        <Dialog.Close className="hidden sm:flex p-2 hover:bg-neutral-100 rounded-full transition-colors">
                          <X size={20} />
                        </Dialog.Close>
                      </div>

                      {/* Description */}
                      <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6">
                        {product.description}
                      </p>

                      {/* Color Options */}
                      <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3">Color</p>
                        <div className="flex gap-2">
                          <button className="w-8 h-8 rounded-full bg-black ring-2 ring-offset-2 ring-black" />
                          <button className="w-8 h-8 rounded-full bg-neutral-300 hover:ring-2 hover:ring-offset-2 hover:ring-neutral-300 transition-all" />
                          <button className="w-8 h-8 rounded-full bg-stone-500 hover:ring-2 hover:ring-offset-2 hover:ring-stone-500 transition-all" />
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3">Quantity</p>
                        <div className="inline-flex items-center border border-neutral-200 rounded-lg">
                          <button 
                            onClick={decrementQuantity}
                            className="p-3 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                            disabled={quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-medium">{quantity}</span>
                          <button 
                            onClick={incrementQuantity}
                            className="p-3 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                            disabled={quantity >= 10}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Spacer */}
                      <div className="flex-1 min-h-4" />

                      {/* Add to Cart Button */}
                      <button 
                        onClick={handleAddToCart}
                        className="w-full bg-amber-500 text-white py-4 text-sm font-semibold uppercase tracking-wider hover:bg-amber-600 transition-all flex items-center justify-center gap-3 rounded-lg shadow-lg hover:shadow-xl"
                      >
                        <ShoppingBag size={18} />
                        Add to Bag — ${(product.price * quantity).toLocaleString()}
                      </button>

                      {/* Product Info */}
                      <div className="mt-6 pt-6 border-t border-neutral-100 grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Materials</h4>
                          <p className="text-xs text-neutral-600">Premium Sustainable</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Delivery</h4>
                          <p className="text-xs text-neutral-600">2-4 Business Days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export const CartDrawer = ({ isOpen, onClose, onCheckout }: { 
  isOpen: boolean; 
  onClose: () => void;
  onCheckout: () => void;
}) => {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl focus:outline-none flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} />
              <Dialog.Title className="text-sm font-bold uppercase tracking-[0.2em]">Shopping Bag ({itemCount})</Dialog.Title>
            </div>
            <Dialog.Close className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                   <ShoppingBag size={24} className="text-neutral-300" />
                </div>
                <p className="text-neutral-500 font-light">Your bag is currently empty.</p>
                <button 
                  onClick={onClose}
                  className="mt-6 text-xs font-bold uppercase tracking-widest underline underline-offset-4"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-24 h-32 bg-neutral-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider">{item.name}</h4>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-400 hover:text-black"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">{item.category}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-neutral-200">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 px-2 hover:bg-neutral-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-neutral-50"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t bg-neutral-50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Subtotal</span>
                <span className="text-xl font-light">${total.toLocaleString()}</span>
              </div>
              <button 
                onClick={onCheckout}
                className="w-full bg-amber-500 text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors"
              >
                Proceed to Checkout
              </button>
              <p className="text-[10px] text-center text-neutral-400 mt-4 uppercase tracking-widest">
                Shipping and taxes calculated at checkout
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
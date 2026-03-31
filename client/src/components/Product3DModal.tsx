import * as Dialog from '@radix-ui/react-dialog';
import { X, ShoppingBag, Download, Check, Box } from 'lucide-react';
import { Product } from '../data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { useState } from 'react';

const FORMAT_INFO: Record<string, string> = {
  RVT: 'BIM & documentation',
  FBX: 'Animation & game engines',
  OBJ: 'Universal 3D exchange',
  SKP: 'Conceptual modeling',
  '3DS': 'Rendering & V-Ray',
  DWG: '2D/3D CAD drawings',
};

interface Product3DModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Product3DModal = ({ product, isOpen, onClose }: Product3DModalProps) => {
  const { addItem } = useCart();
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  if (!product) return null;

  const files = product.modelFiles ?? [];
  const hasFiles = files.length > 0;

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} added to cart`, {
      description: selectedFormat
        ? `3D format: ${selectedFormat}. View in your shopping bag.`
        : 'View it in your shopping bag.',
      duration: 2000,
    });
    onClose();
  };

  const handleDownload = (format: string) => {
    const file = files.find((f) => f.format === format);
    if (file?.url) {
      window.open(file.url, '_blank');
    } else {
      toast.info(`${format} file for "${product.name}"`, {
        description: 'Download will be available after purchase.',
        duration: 3000,
      });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) { setSelectedFormat(null); onClose(); } }}>
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
                className="fixed inset-3 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[calc(100%-2rem)] sm:max-w-md md:max-w-xl lg:max-w-3xl sm:max-h-[85vh] bg-white z-[121] shadow-2xl focus:outline-none rounded-xl overflow-hidden"
              >
                <div className="flex flex-col md:flex-row max-h-[85vh]">
                  {/* Left — Image */}
                  <div className="relative w-full md:w-1/2 h-40 sm:h-48 md:h-auto md:min-h-[380px] lg:min-h-[460px] bg-neutral-100 shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={onClose}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg md:hidden"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Right — Details & formats */}
                  <div className="flex-1 flex flex-col overflow-y-auto">
                    <div className="p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-3 sm:mb-4 md:mb-5">
                        <div>
                          <h2 className="text-base sm:text-lg font-semibold tracking-tight">3D Model Files</h2>
                          <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                            {hasFiles ? `${files.length} format${files.length > 1 ? 's' : ''} available` : 'No 3D files configured yet'}
                          </p>
                        </div>
                        <Dialog.Close className="hidden md:flex p-2 hover:bg-neutral-100 rounded-full transition-colors">
                          <X size={20} />
                        </Dialog.Close>
                      </div>

                      <p className="text-xs sm:text-sm font-medium text-neutral-800 mb-0.5">{product.name}</p>
                      <p className="text-[10px] sm:text-xs text-neutral-500 mb-3 sm:mb-4 md:mb-5">{product.category} &middot; ${product.price.toLocaleString()}</p>

                      {hasFiles ? (
                        <>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-3">
                            Select format
                          </p>
                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-4 md:mb-6">
                            {files.map(({ format }) => {
                              const isSelected = selectedFormat === format;
                              const desc = FORMAT_INFO[format] || format;
                              return (
                                <button
                                  key={format}
                                  onClick={() => setSelectedFormat(isSelected ? null : format)}
                                  className={`relative flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border text-left transition-all ${
                                    isSelected
                                      ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400'
                                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                  }`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[10px] sm:text-xs font-bold text-neutral-800 block">.{format.toLowerCase()}</span>
                                    <span className="text-[9px] sm:text-[10px] text-neutral-500 block mt-0.5 leading-tight">{desc}</span>
                                  </div>
                                  <Download size={12} className={`shrink-0 mt-0.5 sm:w-3.5 sm:h-3.5 ${isSelected ? 'text-amber-500' : 'text-neutral-300'}`} />
                                  {isSelected && (
                                    <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5">
                                      <Check size={10} className="sm:w-3 sm:h-3 text-amber-500" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                          <Box size={32} className="text-neutral-300 mb-3" />
                          <p className="text-sm text-neutral-500">No 3D model files available for this product yet.</p>
                          <p className="text-xs text-neutral-400 mt-1">3D files can be added from the admin dashboard.</p>
                        </div>
                      )}

                      <div className="flex-1 min-h-4" />

                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-amber-500 text-white py-2.5 sm:py-3 md:py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-amber-600 transition-all flex items-center justify-center gap-2 rounded-lg shadow-lg hover:shadow-xl"
                      >
                        <ShoppingBag size={16} className="sm:hidden" />
                        <ShoppingBag size={18} className="hidden sm:block" />
                        Add to Cart — ${product.price.toLocaleString()}
                      </button>

                      {selectedFormat && (
                        <button
                          onClick={() => handleDownload(selectedFormat)}
                          className="w-full mt-2 border border-neutral-200 text-neutral-700 py-2.5 sm:py-3 text-xs sm:text-sm font-medium uppercase tracking-wider hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 rounded-lg"
                        >
                          <Download size={14} className="sm:hidden" />
                          <Download size={16} className="hidden sm:block" />
                          Download .{selectedFormat.toLowerCase()} file
                        </button>
                      )}
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

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, Mail, ArrowLeft, Box, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { SiTiktok } from 'react-icons/si';
import { FaInstagram, FaYoutube, FaFacebookF, FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa';
import { Product } from '../data/products';
import { StudioModel } from '../data/studioModels';
import logoImage from '../assets/yoseph-logo.png';
import { useStudioCategory, STUDIO_CATEGORIES } from '../context/StudioCategoryContext';
import { useStudio } from '../context/StudioContext';

const socialLinks = [
  { name: "TikTok", icon: SiTiktok, href: "#" },
  { name: "Instagram", icon: FaInstagram, href: "#" },
  { name: "YouTube", icon: FaYoutube, href: "#" },
  { name: "Facebook", icon: FaFacebookF, href: "#" },
  { name: "LinkedIn", icon: FaLinkedinIn, href: "#" },
  { name: "Telegram", icon: FaTelegramPlane, href: "#" },
  { name: "Email", icon: Mail, href: "mailto:yosephteferi@gmail.com" }
];

interface HeaderProps {
  onOpenCart: () => void;
  onSelectProduct?: (product: Product) => void;
  onSelectStudioModel?: (model: StudioModel) => void;
}

export const Header = ({ onOpenCart, onSelectProduct, onSelectStudioModel }: HeaderProps) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');
  const isStudioPage = location.pathname === '/studio';
  const { setSelectedCategory } = useStudioCategory();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();
  const { products } = useShop();
  const { studioModels } = useStudio();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchResults = searchQuery.trim() 
    ? products.filter(product => {
        const query = searchQuery.toLowerCase();
        const priceStr = product.price.toString();
        const priceRange = query.match(/under\s*(\d+)/i) || query.match(/below\s*(\d+)/i);
        const aboveRange = query.match(/above\s*(\d+)/i) || query.match(/over\s*(\d+)/i);
        
        if (priceRange) {
          return product.price <= parseInt(priceRange[1]);
        }
        if (aboveRange) {
          return product.price >= parseInt(aboveRange[1]);
        }

        const is3DQuery = /3d|model\s*file/i.test(query);
        if (is3DQuery) {
          return product.modelFiles && product.modelFiles.length > 0;
        }
        
        return (
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          priceStr.includes(query)
        );
      }).slice(0, 6)
    : [];

  const studioSearchResults = searchQuery.trim()
    ? studioModels.filter(model => {
        const query = searchQuery.toLowerCase();
        return (
          model.name.toLowerCase().includes(query) ||
          model.category.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query)
        );
      }).slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleProductClick = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleStudioModelClick = (model: StudioModel) => {
    if (onSelectStudioModel) {
      onSelectStudioModel(model);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const activeResults = isStudioPage ? studioSearchResults : searchResults;
  const searchPlaceholder = isStudioPage
    ? 'Search studio by name, category...'
    : 'Search by name, category, price, 3D...';

  return (
    <>
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      {/* Top Bar */}
      <div className="bg-neutral-900 text-white text-[10px] uppercase tracking-[0.2em] py-2">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <span className="hidden sm:inline">Your Dream Home Begins With Great Design.</span>
          <span className="sm:hidden flex-1 text-center">Yoseph Designs</span>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                aria-label={social.name}
                className="text-white/70 hover:text-amber-400 transition-colors"
              >
                <social.icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 -ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img 
              src={logoImage} 
              alt="Yoseph Design" 
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-neutral-200 shadow-md group-hover:shadow-lg group-hover:border-neutral-300 transition-all"
            />
            <span className="hidden sm:inline text-xl font-bold tracking-tighter uppercase group-hover:opacity-70 transition-opacity">Yoseph-Design</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div ref={searchRef} className="hidden sm:block flex-1 max-w-md relative">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-100 border border-transparent rounded-full text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {isSearchOpen && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden z-50"
                >
                  {activeResults.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50">
                        {activeResults.length} Result{activeResults.length !== 1 ? 's' : ''}
                      </p>
                      {isStudioPage
                        ? studioSearchResults.map((model) => (
                            <button
                              key={model.id}
                              onClick={() => handleStudioModelClick(model)}
                              className="w-full flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors text-left border-b border-neutral-50 last:border-b-0"
                            >
                              <div className="w-14 h-14 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                                <img src={model.image} alt={model.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{model.name}</p>
                                <p className="text-xs text-neutral-500">{model.category}</p>
                              </div>
                            </button>
                          ))
                        : searchResults.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleProductClick(product)}
                              className="w-full flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors text-left border-b border-neutral-50 last:border-b-0"
                            >
                              <div className="w-14 h-14 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-neutral-500">{product.category}</p>
                                  {product.modelFiles && product.modelFiles.length > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                      <Box size={10} /> 3D
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm font-semibold shrink-0">${product.price.toLocaleString()}</p>
                            </button>
                          ))
                      }
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-neutral-500 text-sm">
                        No {isStudioPage ? 'studio posts' : 'products'} found for "{searchQuery}"
                      </p>
                      <p className="text-neutral-400 text-xs mt-1">
                        {isStudioPage
                          ? 'Try searching by name or category'
                          : 'Try searching by name, category, price (e.g., "under 1000"), or "3D"'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle - home: search; studio: same navbar, search still available */}
            <button 
              className="sm:hidden p-2 text-neutral-600 hover:text-black transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>
            {/* Studio page: Back to Home; Home: link to Studio */}
            {isStudioPage ? (
              <Link
                to="/"
                className="p-2 text-neutral-600 hover:text-amber-500 transition-colors inline-flex items-center gap-1.5 text-sm font-medium"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            ) : (
              <Link
                to="/studio"
                className="p-2 text-neutral-600 hover:text-amber-500 transition-colors"
              >
                Studio
              </Link>
            )}
            <button 
              onClick={onOpenCart}
              className="p-2 text-neutral-600 hover:text-black relative"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden pb-4 overflow-hidden"
            >
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder={isStudioPage ? 'Search studio...' : 'Search products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 bg-neutral-100 border border-transparent rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {/* Mobile Search Results */}
              {searchQuery.trim() && (
                <div className="mt-2 bg-white rounded-lg border border-neutral-100 overflow-hidden">
                  {activeResults.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      {isStudioPage
                        ? studioSearchResults.map((model) => (
                            <button
                              key={model.id}
                              onClick={() => handleStudioModelClick(model)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors text-left border-b border-neutral-50 last:border-b-0"
                            >
                              <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden shrink-0">
                                <img src={model.image} alt={model.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{model.name}</p>
                                <p className="text-xs text-neutral-500">{model.category}</p>
                              </div>
                            </button>
                          ))
                        : searchResults.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleProductClick(product)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors text-left border-b border-neutral-50 last:border-b-0"
                            >
                              <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-neutral-500">${product.price.toLocaleString()} · {product.category}</p>
                                  {product.modelFiles && product.modelFiles.length > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                      <Box size={10} /> 3D
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))
                      }
                    </div>
                  ) : (
                    <div className="p-4 text-center text-neutral-500 text-sm">
                      No {isStudioPage ? 'studio posts' : 'products'} found
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </header>
    <MobileSidebar
      isOpen={isMenuOpen}
      onClose={() => setIsMenuOpen(false)}
      isStudioPage={isStudioPage}
      activeCategory={activeCategory}
      setSelectedCategory={setSelectedCategory}
    />
    </>
  );
};

const SIDEBAR_CATEGORIES = ['LIVING', 'BEDROOM', 'DINING', 'OFFICE', 'OUTDOOR', 'DECOR'];
const THREED_CATEGORY = '3D_MODEL';

const MobileSidebar = ({
  isOpen,
  onClose,
  isStudioPage,
  activeCategory,
  setSelectedCategory,
}: {
  isOpen: boolean;
  onClose: () => void;
  isStudioPage: boolean;
  activeCategory: string | null;
  setSelectedCategory: (id: string) => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 left-0 bottom-0 w-56 sm:w-64 bg-white z-[70] lg:hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-100 shrink-0">
              <span className="text-sm font-bold uppercase tracking-widest">Menu</span>
              <button onClick={onClose} className="p-2 -mr-2 text-neutral-500 hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-12">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-4">
                Categories
              </h3>
              <nav className="space-y-1">
                {isStudioPage ? (
                  STUDIO_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        onClose();
                      }}
                      className="group flex items-center justify-between w-full py-3 px-4 -mx-0 text-sm uppercase tracking-widest transition-all duration-200 rounded text-neutral-600 hover:bg-amber-50 hover:text-amber-600 text-left"
                    >
                      <span className="font-medium">{category.name}</span>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                    </button>
                  ))
                ) : (
                  <>
                    <Link
                      to="/"
                      onClick={() => {
                        onClose();
                        document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="block"
                    >
                      <span
                        className={`group flex items-center justify-between py-3 px-4 text-sm uppercase tracking-widest transition-all duration-200 rounded ${
                          !activeCategory ? 'bg-amber-500 text-white' : 'text-neutral-600 hover:bg-amber-50 hover:text-amber-600'
                        }`}
                      >
                        <span className="font-medium">All</span>
                        <ChevronRight size={14} className={!activeCategory ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'} />
                      </span>
                    </Link>
                    {SIDEBAR_CATEGORIES.map((cat) => (
                      <Link
                        key={cat}
                        to={`/?category=${encodeURIComponent(cat)}`}
                        onClick={() => {
                          onClose();
                          document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="block"
                      >
                        <span
                          className={`group flex items-center justify-between py-3 px-4 text-sm uppercase tracking-widest transition-all duration-200 rounded ${
                            activeCategory === cat
                              ? 'bg-amber-500 text-white'
                              : 'text-neutral-600 hover:bg-amber-50 hover:text-amber-600'
                          }`}
                        >
                          <span className="font-medium">{cat}</span>
                          <ChevronRight
                            size={14}
                            className={activeCategory === cat ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                          />
                        </span>
                      </Link>
                    ))}

                    <div className="my-2 border-t border-neutral-200" />

                    <Link
                      to={`/?category=${THREED_CATEGORY}`}
                      onClick={() => {
                        onClose();
                        document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="block"
                    >
                      <span
                        className={`group flex items-center justify-between py-3 px-4 text-sm uppercase tracking-widest transition-all duration-200 rounded ${
                          activeCategory === THREED_CATEGORY
                            ? 'bg-amber-500 text-white'
                            : 'text-neutral-600 hover:bg-amber-50 hover:text-amber-600'
                        }`}
                      >
                        <span className="font-medium flex items-center gap-2">
                          <Box size={14} />
                          3D Model
                        </span>
                        <ChevronRight
                          size={14}
                          className={activeCategory === THREED_CATEGORY ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                        />
                      </span>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

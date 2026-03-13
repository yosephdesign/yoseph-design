import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Search, User, Menu, X, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SiTiktok } from 'react-icons/si';
import { FaInstagram, FaYoutube, FaFacebookF, FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa';
import { Product } from '../data/products';
import logoImage from '../assets/yoseph-logo.png';

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
}

export const Header = ({ onOpenCart, onSelectProduct }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();
  const { products } = useShop();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
        
        return (
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          priceStr.includes(query)
        );
      }).slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (
        isMenuOpen &&
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleProductClick = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      {/* Top Bar */}
      <div className="bg-neutral-900 text-white text-[10px] uppercase tracking-[0.2em] py-2">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <span className="hidden sm:inline">Your Dream Home Begins With Great Design.</span>
          <span className="sm:hidden flex-1 text-center">Free Shipping</span>
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
            ref={menuButtonRef}
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
            <span className="text-lg sm:text-xl font-bold tracking-tighter uppercase group-hover:opacity-70 transition-opacity">Yoseph-Design</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div ref={searchRef} className="hidden sm:block flex-1 max-w-md relative">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by name, category, price..."
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
                  {searchResults.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50">
                        {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''}
                      </p>
                      {searchResults.map((product) => (
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
                            <p className="text-xs text-neutral-500">{product.category}</p>
                          </div>
                          <p className="text-sm font-semibold shrink-0">${product.price.toLocaleString()}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-neutral-500 text-sm">No products found for "{searchQuery}"</p>
                      <p className="text-neutral-400 text-xs mt-1">Try searching by name, category, or price (e.g., "under 1000")</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button 
              className="sm:hidden p-2 text-neutral-600 hover:text-black"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>
           
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
                  placeholder="Search products..."
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
                  {searchResults.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((product) => (
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
                            <p className="text-xs text-neutral-500">${product.price.toLocaleString()} · {product.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-neutral-500 text-sm">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-2">Categories</p>
              <a href="#collection" onClick={() => setIsMenuOpen(false)} className="block text-sm uppercase tracking-widest font-medium">Living</a>
              <a href="#collection" onClick={() => setIsMenuOpen(false)} className="block text-sm uppercase tracking-widest font-medium">Bedroom</a>
              <a href="#collection" onClick={() => setIsMenuOpen(false)} className="block text-sm uppercase tracking-widest font-medium">Dining</a>
              <a href="#collection" onClick={() => setIsMenuOpen(false)} className="block text-sm uppercase tracking-widest font-medium">Office</a>
              <a href="#collection" onClick={() => setIsMenuOpen(false)} className="block text-sm uppercase tracking-widest font-medium">Outdoor</a>
              <a href="#collection" onClick={() => setIsMenuOpen(false)} className="block text-sm uppercase tracking-widest font-medium">Decor</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

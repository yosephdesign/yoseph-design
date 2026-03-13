import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'LIVING', href: '#collection' },
  { name: 'BEDROOM', href: '#collection' },
  { name: 'DINING', href: '#collection' },
  { name: 'OFFICE', href: '#collection' },
  { name: 'OUTDOOR', href: '#collection' },
  { name: 'DECOR', href: '#collection' },
];

export const Sidebar = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-neutral-50 border-r border-neutral-100 pt-8 pb-12 sticky top-[104px] h-[calc(100vh-104px)]">
      <div className="px-6 mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-6">
          Categories
        </h2>
        <nav className="space-y-1">
          {categories.map((category) => (
            <motion.a
              key={category.name}
              href={category.href}
              onClick={() => setActiveCategory(category.name)}
              className={`group flex items-center justify-between py-3 px-4 -mx-4 text-sm uppercase tracking-widest transition-all duration-200 ${
                activeCategory === category.name
                  ? 'bg-amber-500 text-white'
                  : 'text-neutral-600 hover:bg-amber-50 hover:text-amber-600'
              }`}
              whileHover={{ x: activeCategory === category.name ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-medium">{category.name}</span>
              <ChevronRight 
                size={14} 
                className={`transition-transform ${
                  activeCategory === category.name 
                    ? 'opacity-100' 
                    : 'opacity-0 group-hover:opacity-50'
                }`} 
              />
            </motion.a>
          ))}
        </nav>
      </div>
    </aside>
  );
};

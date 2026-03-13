import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative h-[80vh] flex items-center overflow-hidden">
      {/* Hero Image Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/f579f73a-3c76-43af-9367-4cbdb65814c1/hero-interior-2e0b088a-1773311416938.webp" 
          alt="Architectural Interior" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-2xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-white/80 mb-4 bg-black/20 backdrop-blur-sm px-3 py-1 rounded"
          >
            Curated Architectural Selection
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-light text-white leading-tight mb-8"
          >
            Design for the <br /> 
            <span className="font-serif italic">Modern Mind.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/90 mb-10 max-w-lg font-light leading-relaxed"
          >
            Discover furniture and objects that bridge the gap between architecture and living. Hand-picked pieces that define contemporary elegance.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a 
              href="#collection"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group bg-amber-500 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-3 hover:bg-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Shop The Collection
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
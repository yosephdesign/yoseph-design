import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';

export const HomePage = () => {
  return (
    <>
      <Hero />
      <ProductGrid />
      
      {/* Philosophy Section */}
      <section className="py-24 bg-neutral-50 relative overflow-hidden">
         <div className="container mx-auto px-4 text-center max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-8">Our Philosophy</span>
            <blockquote 
              className="text-3xl md:text-4xl lg:text-5xl font-light italic leading-snug text-neutral-800"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              "Great design transforms a house into a home — where every piece tells a story and every space inspires living."
            </blockquote>
            <p className="mt-10 text-sm font-medium uppercase tracking-widest text-neutral-600">Yoseph Design</p>
         </div>
      </section>
    </>
  );
};
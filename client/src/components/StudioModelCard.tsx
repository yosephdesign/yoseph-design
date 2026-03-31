import { useState, useRef, useCallback } from 'react';
import { Eye } from 'lucide-react';
import { StudioModel } from '../data/studioModels';

const ZOOM_SCALE = 1.8;

interface StudioModelCardProps {
  model: StudioModel;
  onViewDetails: () => void;
}

export const StudioModelCard = ({ model, onViewDetails }: StudioModelCardProps) => {
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
          src={model.image}
          alt={model.name}
          className="w-full h-full object-cover transition-transform duration-300 ease-out"
          style={{
            transformOrigin: `${origin.x}% ${origin.y}%`,
            transform: isHovering ? `scale(${ZOOM_SCALE})` : 'scale(1)',
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none [&_button]:pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="bg-white text-black px-5 py-3 flex items-center gap-2 hover:bg-neutral-900 hover:text-white transition-colors text-sm font-medium uppercase tracking-wider"
            title="View Details"
          >
            <Eye size={18} />
            View Details
          </button>
        </div>
        {model.featured && (
          <div className="absolute top-4 left-4">
            <span className="bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm">
              Featured
            </span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium uppercase tracking-wider text-neutral-800 line-clamp-1">
          {model.name}
        </h3>
        <p className="text-xs text-neutral-500 mt-1">{model.category}</p>
        <button
          onClick={onViewDetails}
          className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors md:hidden rounded-4xl"
        >
          <Eye size={16} />
          View Details
        </button>
      </div>
    </div>
  );
};

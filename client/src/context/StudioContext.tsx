import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { StudioModel, STUDIO_MODELS } from '../data/studioModels';
import { API_URL } from '../config';

interface StudioContextType {
  studioModels: StudioModel[];
  loading: boolean;
  refetchStudioModels: () => Promise<void>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [studioModels, setStudioModels] = useState<StudioModel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudioModels = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/studio-models`);
      if (res.ok) {
        const data = await res.json();
        setStudioModels(data);
      } else {
        setStudioModels(STUDIO_MODELS);
      }
    } catch {
      setStudioModels(STUDIO_MODELS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudioModels();
  }, []);

  return (
    <StudioContext.Provider value={{ studioModels, loading, refetchStudioModels: fetchStudioModels }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error('useStudio must be used within StudioProvider');
  return context;
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OptimizedImage } from '@/components/OptimizedImage';

interface SiteCardLogoProps {
  logo?: string;
  name: string;
  priority?: boolean;
}

export const SiteCardLogo = ({ logo, name, priority }: SiteCardLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const showFallback = !logo || !logoUrl || imageError;

  useEffect(() => {
    if (logo) {
      setIsLoading(true);
      setImageError(false);
      
      if (logo.startsWith('http')) {
        setLogoUrl(logo);
        setIsLoading(false);
      } else {
        const { data } = supabase.storage.from('site-logos').getPublicUrl(logo);
        setLogoUrl(data.publicUrl);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [logo]);

  return (
    <div className="flex-shrink-0 w-60 h-40 bg-card dark:bg-card rounded-xl flex items-center justify-center overflow-hidden border-2 border-border hover:border-primary/70 shadow-md hover:shadow-xl ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300 relative group/logo">
      {isLoading && !showFallback && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      )}
      
      {!showFallback ? (
        <OptimizedImage
          src={logoUrl!}
          alt={`${name} logo`}
          className={`w-32 h-32 object-contain p-1 transition-all duration-300 group-hover/logo:scale-105 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          width={128}
          height={128}
          objectFit="contain"
          fetchPriority={priority ? 'high' : 'auto'}
          priority={priority}
          responsive={false}
          fallback="/placeholder.svg"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <span className="text-4xl font-black text-primary/40 group-hover/logo:text-primary/60 transition-colors">
            {name.charAt(0)}
          </span>
        </div>
      )}
    </div>
  );
};

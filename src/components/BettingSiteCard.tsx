import { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OptimizedImage } from '@/components/OptimizedImage';

interface BettingSiteCardProps {
  id?: string;
  slug?: string;
  name: string;
  logo?: string;
  rating: number;
  bonus?: string;
  features?: string[];
  affiliateUrl: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  views?: number;
  clicks?: number;
  reviewCount?: number;
  avgRating?: number;
  priority?: boolean;
}

const BettingSiteCardComponent = ({
  id,
  slug,
  name,
  logo,
  priority = false,
}: BettingSiteCardProps) => {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const showFallback = !logo || !logoUrl || imageError;


  useEffect(() => {
    if (logo) {
      setImageError(false);
      
      if (logo.startsWith('http')) {
        setLogoUrl(logo);
      } else {
        const { data } = supabase.storage.from('site-logos').getPublicUrl(logo);
        setLogoUrl(data.publicUrl);
      }
    }
  }, [logo]);

  const handleCardClick = () => {
    if (slug) {
      navigate(`/${slug}`);
    } else if (id) {
      navigate(`/site/${id}`);
    }
  };

  return (
    <div 
      className="cursor-pointer group"
      onClick={handleCardClick}
      role="article"
      aria-label={`${name} - Bahis sitesi`}
    >
      <div className="relative w-48 h-48 flex items-center justify-center">
        {!showFallback ? (
          <OptimizedImage
            src={logoUrl!}
            alt={`${name} logo`}
            className="w-full h-full object-contain p-2"
            width={192}
            height={192}
            objectFit="contain"
            fetchPriority={priority ? 'high' : 'auto'}
            priority={priority}
            responsive={false}
            fallback="/placeholder.svg"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-lg">
            <span className="text-5xl font-bold text-primary">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const BettingSiteCard = memo(BettingSiteCardComponent);
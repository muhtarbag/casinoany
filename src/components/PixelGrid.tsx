import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BettingSiteCard } from './BettingSiteCard';
import { Loader2 } from 'lucide-react';

export const PixelGrid = () => {
  const { data: sites, isLoading } = useQuery({
    queryKey: ['betting-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sites || sites.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">Henüz kayıtlı bahis sitesi bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sites.map((site) => (
        <BettingSiteCard
          key={site.id}
          name={site.name}
          logo_url={site.logo_url || undefined}
          rating={Number(site.rating) || 0}
          bonus={site.bonus || undefined}
          features={site.features || undefined}
          affiliate_link={site.affiliate_link}
          email={site.email || undefined}
          whatsapp={site.whatsapp || undefined}
          telegram={site.telegram || undefined}
          twitter={site.twitter || undefined}
          instagram={site.instagram || undefined}
          facebook={site.facebook || undefined}
          youtube={site.youtube || undefined}
        />
      ))}
    </div>
  );
};

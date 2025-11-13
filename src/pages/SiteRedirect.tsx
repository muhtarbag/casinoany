import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function SiteRedirect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch site slug by ID
  const { data: site, isLoading } = useQuery({
    queryKey: ['site-redirect', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('slug')
        .eq('id', id)
        .single() as any;

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (site?.slug) {
      // Redirect to new slug URL
      navigate(`/${site.slug}`, { replace: true });
    } else if (!isLoading && !site) {
      // If site not found, redirect to home
      navigate('/', { replace: true });
    }
  }, [site, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <p className="text-muted-foreground">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return null;
}

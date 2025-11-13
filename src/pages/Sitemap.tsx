import { useEffect } from 'react';

export default function Sitemap() {
  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );
        
        if (response.ok) {
          const xml = await response.text();
          const blob = new Blob([xml], { type: 'application/xml' });
          const url = window.URL.createObjectURL(blob);
          window.location.href = url;
        }
      } catch (error) {
        console.error('Error fetching sitemap:', error);
      }
    };

    fetchSitemap();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sitemap Yükleniyor...</h1>
        <p className="text-muted-foreground">Lütfen bekleyin.</p>
      </div>
    </div>
  );
}

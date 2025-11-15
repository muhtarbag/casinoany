import { useEffect, useState } from 'react';

export default function SitemapXML() {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap-xml`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
          }
        );
        
        if (response.ok) {
          const xml = await response.text();
          setXmlContent(xml);
        }
      } catch (error) {
        console.error('Error fetching sitemap:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSitemap();
  }, []);

  if (loading) {
    return <div>Loading sitemap...</div>;
  }

  return (
    <pre style={{ 
      fontFamily: 'monospace', 
      whiteSpace: 'pre-wrap',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      {xmlContent}
    </pre>
  );
}

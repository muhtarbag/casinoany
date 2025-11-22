import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const SUPABASE_URL = 'https://cpaukwimbfoembwwtqhj.supabase.co';

export default function SitemapXML() {
  const { type } = useParams<{ type?: string }>();

  useEffect(() => {
    const fetchAndServeSitemap = async () => {
      try {
        // Determine sitemap endpoint
        const sitemapEndpoint = type ? `sitemap-${type}` : 'sitemap';
        const url = `${SUPABASE_URL}/functions/v1/${sitemapEndpoint}`;

        // Fetch XML from edge function
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlContent = await response.text();

        // Replace entire document with XML
        // This is the cleanest way to serve pure XML in a React SPA
        document.open();
        document.write(xmlContent);
        document.close();

        // Ensure correct MIME type
        const metaTag = document.createElement('meta');
        metaTag.httpEquiv = 'Content-Type';
        metaTag.content = 'application/xml; charset=UTF-8';
        document.head.appendChild(metaTag);

      } catch (error) {
        console.error('Sitemap fetch error:', error);
        
        // Show error as XML
        const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Failed to load sitemap</message>
  <details>${error instanceof Error ? error.message : 'Unknown error'}</details>
</error>`;
        
        document.open();
        document.write(errorXml);
        document.close();
      }
    };

    fetchAndServeSitemap();
  }, [type]);

  // Loading state (will be replaced immediately)
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'monospace',
      color: '#666'
    }}>
      Loading sitemap...
    </div>
  );
}

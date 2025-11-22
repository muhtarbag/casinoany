import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function SitemapXML() {
  const { type } = useParams();
  const [xml, setXml] = useState<string>('');
  
  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        // Correct endpoint based on type parameter
        const sitemapPath = type ? `sitemap-${type}` : 'sitemap';
        const response = await fetch(`https://cpaukwimbfoembwwtqhj.supabase.co/functions/v1/${sitemapPath}`);
        const xmlText = await response.text();
        setXml(xmlText);
      } catch (error) {
        console.error('Sitemap fetch error:', error);
        // Fallback XML
        setXml(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.casinoany.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
      }
    };
    
    fetchSitemap();
  }, [type]);

  // Return raw XML with proper content type header
  return (
    <>
      <Helmet>
        <meta httpEquiv="Content-Type" content="application/xml; charset=utf-8" />
      </Helmet>
      <pre style={{ 
        margin: 0, 
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      }}>
        {xml}
      </pre>
    </>
  );
}

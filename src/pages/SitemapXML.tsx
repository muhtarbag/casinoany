import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const SUPABASE_URL = 'https://cpaukwimbfoembwwtqhj.supabase.co';

export default function SitemapXML() {
  const { type } = useParams();
  
  useEffect(() => {
    // Determine which sitemap to serve
    const sitemapPath = type ? `sitemap-${type}` : 'sitemap';
    
    // Redirect to edge function
    window.location.replace(`${SUPABASE_URL}/functions/v1/${sitemapPath}`);
  }, [type]);

  return null;
}

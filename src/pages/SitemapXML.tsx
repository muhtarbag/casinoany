import { useEffect } from 'react';

const SUPABASE_URL = 'https://cpaukwimbfoembwwtqhj.supabase.co';

export default function SitemapXML() {
  useEffect(() => {
    // Redirect directly to edge function for proper XML serving
    window.location.replace(`${SUPABASE_URL}/functions/v1/sitemap-xml`);
  }, []);

  return null;
}

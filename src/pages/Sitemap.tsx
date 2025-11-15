import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export default function Sitemap() {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

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
        } else {
          setError('Sitemap yüklenirken bir hata oluştu.');
        }
      } catch (error) {
        console.error('Error fetching sitemap:', error);
        setError('Sitemap yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchSitemap();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Site Haritası Yükleniyor...</h1>
            <p className="text-muted-foreground">Lütfen bekleyin.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Hata</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Parse XML to extract URLs
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  const urls = Array.from(xmlDoc.getElementsByTagName('url'));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">🗺️ Site Haritası</h1>
          <p className="text-muted-foreground">Sitemizde bulunan tüm sayfaların listesi</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {urls.map((urlNode, index) => {
            const loc = urlNode.getElementsByTagName('loc')[0]?.textContent || '';
            const lastmod = urlNode.getElementsByTagName('lastmod')[0]?.textContent || '';
            const priority = urlNode.getElementsByTagName('priority')[0]?.textContent || '';
            
            // Extract page name from URL
            const pageName = loc.split('/').filter(Boolean).pop() || 'Ana Sayfa';
            const displayName = pageName === window.location.origin.split('/').pop() 
              ? 'Ana Sayfa' 
              : pageName.charAt(0).toUpperCase() + pageName.slice(1);

            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{displayName}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={loc} 
                    className="text-sm text-primary hover:underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {loc}
                  </a>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {lastmod && (
                      <div>Güncelleme: {new Date(lastmod).toLocaleDateString('tr-TR')}</div>
                    )}
                    {priority && <div>Öncelik: {priority}</div>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>XML Sitemap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Arama motorları için XML formatındaki site haritasına aşağıdaki linkten ulaşabilirsiniz:
            </p>
            <a 
              href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap-xml`}
              className="text-primary hover:underline inline-flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              XML Sitemap <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

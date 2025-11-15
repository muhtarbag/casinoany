import { CacheManagement } from '@/components/admin/CacheManagement';
import { SEO } from '@/components/SEO';

export default function CacheManagementPage() {
  return (
    <>
      <SEO 
        title="Cache Yönetimi | Admin Panel"
        description="Sistem cache yönetimi ve optimizasyonu"
      />
      
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cache Yönetimi</h1>
          <p className="text-muted-foreground">
            Sistem performansını optimize etmek için cache yönetimi ve temizliği
          </p>
        </div>

        <CacheManagement />
      </div>
    </>
  );
}

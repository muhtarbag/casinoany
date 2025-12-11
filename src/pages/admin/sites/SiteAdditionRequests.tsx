import { SiteAdditionRequestsManagement } from '@/components/admin/SiteAdditionRequestsManagement';

export default function AdminSiteAdditionRequests() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Ekleme Talepleri</h1>
        <p className="text-muted-foreground mt-2">
          Kullanıcıların gönderdiği site ekleme taleplerini inceleyin ve yönetin
        </p>
      </div>
      <SiteAdditionRequestsManagement />
    </div>
  );
}

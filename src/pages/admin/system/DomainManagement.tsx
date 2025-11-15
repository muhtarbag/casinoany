import { AdminLayout } from "@/components/admin/AdminLayout";
import { DomainManagement } from "@/components/DomainManagement";

const DomainManagementPage = () => {
  return (
    <AdminLayout activeTab="system-health" onTabChange={() => {}}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Domain Yönetimi</h2>
          <p className="text-muted-foreground">
            TİB/BTK engeline karşı multi-domain stratejisi
          </p>
        </div>
        <DomainManagement />
      </div>
    </AdminLayout>
  );
};

export default DomainManagementPage;

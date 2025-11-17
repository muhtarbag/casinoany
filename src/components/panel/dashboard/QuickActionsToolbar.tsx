import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Plus,
  RefreshCw
} from 'lucide-react';

interface QuickActionsToolbarProps {
  onAction: (action: string) => void;
}

export const QuickActionsToolbar = ({ onAction }: QuickActionsToolbarProps) => {
  const actions = [
    {
      id: 'content',
      label: 'İçerik Düzenle',
      icon: FileText,
      variant: 'default' as const,
      description: 'Hızlı içerik güncellemesi'
    },
    {
      id: 'complaints',
      label: 'Şikayetleri Gör',
      icon: MessageSquare,
      variant: 'outline' as const,
      description: 'Bekleyen şikayetler'
    },
    {
      id: 'reports',
      label: 'Rapor İndir',
      icon: BarChart3,
      variant: 'outline' as const,
      description: 'İstatistikleri dışa aktar'
    },
    {
      id: 'site-info',
      label: 'Site Ayarları',
      icon: Settings,
      variant: 'outline' as const,
      description: 'Temel bilgileri güncelle'
    }
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Hızlı İşlemler</h3>
              <p className="text-xs text-muted-foreground">Sık kullanılan işlemler için kısayollar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  onClick={() => onAction(action.id)}
                  className="gap-2"
                  title={action.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

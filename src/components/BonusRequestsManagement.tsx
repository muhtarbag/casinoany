import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Mail, Phone, Calendar, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface BonusRequest {
  id: string;
  notification_id: string;
  email: string;
  phone: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  site_notifications?: {
    title: string;
  };
}

export const BonusRequestsManagement = () => {
  const { data: requests, isLoading } = useQuery({
    queryKey: ['bonus-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bonus_requests')
        .select(`
          *,
          site_notifications (
            title
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BonusRequest[];
    },
  });

  const handleExportCSV = () => {
    if (!requests || requests.length === 0) return;

    const headers = ['Tarih', 'E-posta', 'Telefon', 'Kampanya', 'IP Adresi', 'Tarayıcı'];
    const csvData = requests.map(req => [
      format(new Date(req.created_at), 'dd.MM.yyyy HH:mm', { locale: tr }),
      req.email,
      req.phone,
      req.site_notifications?.title || 'Bilinmiyor',
      req.ip_address || '-',
      req.user_agent || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bonus-talepler-${format(new Date(), 'dd-MM-yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // 🔧 Memory leak fix: cleanup object URL
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>📧 Bonus Talepleri</CardTitle>
              <CardDescription>
                Popup formlarından gelen kullanıcı bilgileri
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Toplam: {requests?.length || 0}
              </Badge>
              <Button onClick={handleExportCSV} variant="outline" disabled={!requests || requests.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                CSV Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Henüz bonus talebi bulunmuyor</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Tarih
                    </TableHead>
                    <TableHead>
                      <Mail className="w-4 h-4 inline mr-2" />
                      E-posta
                    </TableHead>
                    <TableHead>
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefon
                    </TableHead>
                    <TableHead>Kampanya</TableHead>
                    <TableHead>
                      <Globe className="w-4 h-4 inline mr-2" />
                      IP / Tarayıcı
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(request.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`mailto:${request.email}`}
                          className="text-primary hover:underline"
                        >
                          {request.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`tel:${request.phone}`}
                          className="text-primary hover:underline font-mono"
                        >
                          {request.phone}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {request.site_notifications?.title || 'Silinmiş Kampanya'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="space-y-1">
                          <div className="font-mono">{request.ip_address || 'Bilinmiyor'}</div>
                          <div className="truncate max-w-xs" title={request.user_agent || ''}>
                            {request.user_agent ? 
                              (request.user_agent.includes('Chrome') ? '🌐 Chrome' :
                               request.user_agent.includes('Firefox') ? '🦊 Firefox' :
                               request.user_agent.includes('Safari') ? '🧭 Safari' :
                               request.user_agent.includes('Edge') ? '🔷 Edge' : '🌐 Diğer')
                              : '-'}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

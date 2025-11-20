import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';

interface SiteAdditionRequest {
  id: string;
  user_id: string;
  site_name: string;
  site_url: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  rejection_reason: string | null;
  user_email?: string;
}

export function SiteAdditionRequestsManagement() {
  const [selectedRequest, setSelectedRequest] = useState<SiteAdditionRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['site-addition-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_addition_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map user_id to show just the first 8 characters for display
      return data.map(request => ({
        ...request,
        user_email: `User: ${request.user_id.substring(0, 8)}...`,
      })) as SiteAdditionRequest[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (request: SiteAdditionRequest) => {
      // Create a slug from site name
      const slug = request.site_name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Insert the new site
      const { data: newSite, error: siteError } = await supabase
        .from('betting_sites')
        .insert({
          name: request.site_name,
          slug: slug,
          affiliate_link: request.site_url,
          is_active: true,
          rating: 0,
        })
        .select()
        .single();

      if (siteError) throw siteError;

      // Update the request status
      const { error: updateError } = await supabase
        .from('site_addition_requests')
        .update({
          status: 'approved',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          created_site_id: newSite.id,
        })
        .eq('id', request.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success('Site başarıyla eklendi ve talep onaylandı!');
      queryClient.invalidateQueries({ queryKey: ['site-addition-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
    onError: (error) => {
      console.error('Error approving request:', error);
      toast.error('Talep onaylanırken bir hata oluştu');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const { error } = await supabase
        .from('site_addition_requests')
        .update({
          status: 'rejected',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Talep reddedildi');
      queryClient.invalidateQueries({ queryKey: ['site-addition-requests'] });
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    },
    onError: (error) => {
      console.error('Error rejecting request:', error);
      toast.error('Talep reddedilirken bir hata oluştu');
    },
  });

  const handleReject = () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      toast.error('Lütfen red nedeni belirtin');
      return;
    }
    rejectMutation.mutate({ requestId: selectedRequest.id, reason: rejectionReason });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Bekliyor</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Onaylandı</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={5} />;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Talep Eden</TableHead>
                <TableHead>Site Adı</TableHead>
                <TableHead>Site URL</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Henüz talep bulunmuyor
                  </TableCell>
                </TableRow>
              )}
              {requests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(request.created_at), 'dd MMM yyyy', { locale: tr })}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{request.user_email}</div>
                  </TableCell>
                  <TableCell className="font-medium">{request.site_name}</TableCell>
                  <TableCell>
                    <a
                      href={request.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <span className="max-w-[200px] truncate">{request.site_url}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className="max-w-[200px] truncate block">
                      {request.description || '-'}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => approveMutation.mutate(request)}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Onayla
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedRequest(request);
                            setRejectDialogOpen(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reddet
                        </Button>
                      </div>
                    )}
                    {request.status === 'rejected' && request.rejection_reason && (
                      <span className="text-sm text-muted-foreground">
                        {request.rejection_reason}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Talebi Reddet</DialogTitle>
            <DialogDescription>
              Bu site ekleme talebini reddetmek için bir neden belirtin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Red Nedeni *</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Örn: Bu site lisans bilgisi eksik..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

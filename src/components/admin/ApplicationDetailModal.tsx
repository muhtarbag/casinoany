import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, Mail, Phone, Globe, CheckCircle, XCircle, 
  Clock, FileText, Send, Copy, AlertCircle, Loader2, User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ApplicationDetailModalProps {
  application: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function ApplicationDetailModal({ 
  application, 
  isOpen, 
  onClose,
  onApprove,
  onReject 
}: ApplicationDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState(application?.admin_notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Fetch verification status
  const { data: verifications } = useQuery({
    queryKey: ['ownership-verifications', application?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ownership_verifications')
        .select('*')
        .eq('application_id', application.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!application?.id && isOpen,
  });

  // Send email verification
  const sendEmailVerificationMutation = useMutation({
    mutationFn: async () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const { error } = await supabase
        .from('ownership_verifications')
        .insert({
          application_id: application.id,
          verification_type: 'email',
          verification_code: code,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          metadata: { 
            email: application.betting_sites?.email || application.profiles?.email 
          }
        });
      
      if (error) throw error;
      return code;
    },
    onSuccess: (code) => {
      queryClient.invalidateQueries({ queryKey: ['ownership-verifications', application?.id] });
      toast({
        title: 'Doğrulama Kodu Oluşturuldu',
        description: `Kod: ${code} (24 saat geçerli)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Auto-save admin notes
  const saveAdminNotes = async () => {
    if (adminNotes === application?.admin_notes) return;
    
    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from('site_owners')
        .update({ admin_notes: adminNotes })
        .eq('id', application.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['site-owner-applications'] });
      toast({ title: 'Notlar kaydedildi' });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (!application) return null;

  const site = application.betting_sites;
  const profile = application.profiles;
  const emailVerification = verifications?.find(v => v.verification_type === 'email' && v.verified_at);
  const domainVerification = verifications?.find(v => 
    (v.verification_type === 'domain_txt' || v.verification_type === 'domain_meta') && v.verified_at
  );

  const emailMatches = profile?.email && site?.email && profile.email === site.email;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Başvuru Detayları</DialogTitle>
          <DialogDescription>
            {site?.name} - {profile?.email}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="application" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="application">Başvuru</TabsTrigger>
            <TabsTrigger value="site">Site Bilgileri</TabsTrigger>
            <TabsTrigger value="verification">Doğrulama</TabsTrigger>
            <TabsTrigger value="notes">Admin Notları</TabsTrigger>
          </TabsList>

          <TabsContent value="application" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Başvuru Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Durum</Label>
                    <div className="mt-1">
                      <Badge variant={
                        application.status === 'approved' ? 'default' :
                        application.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {application.status === 'pending' ? 'Beklemede' :
                         application.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Başvuru Tarihi</Label>
                    <p className="mt-1">
                      {formatDistanceToNow(new Date(application.created_at), { 
                        addSuffix: true, 
                        locale: tr 
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Başvuran</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{profile?.first_name} {profile?.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{profile?.email}</span>
                      {emailMatches && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Email Eşleşiyor
                        </Badge>
                      )}
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {profile?.company_name && (
                  <div>
                    <Label className="text-muted-foreground">Şirket Bilgileri</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{profile.company_name}</span>
                      </div>
                      {profile.company_tax_number && (
                        <p className="text-sm">Vergi No: {profile.company_tax_number}</p>
                      )}
                      {profile.company_website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <a href={profile.company_website} target="_blank" rel="noopener noreferrer" 
                             className="text-primary hover:underline">
                            {profile.company_website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="site" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Site Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {site?.logo_url && (
                    <img src={site.logo_url} alt={site.name} className="h-16 w-16 object-contain" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{site?.name}</h3>
                    <p className="text-sm text-muted-foreground">/{site?.slug}</p>
                  </div>
                </div>

                {site?.email && (
                  <div>
                    <Label className="text-muted-foreground">Kayıtlı Email</Label>
                    <p className="mt-1">{site.email}</p>
                  </div>
                )}

                {site?.rating && (
                  <div>
                    <Label className="text-muted-foreground">Rating</Label>
                    <p className="mt-1">{site.rating}/10</p>
                  </div>
                )}

                <div>
                  <Label className="text-muted-foreground">Aktif Durum</Label>
                  <div className="mt-1">
                    <Badge variant={site?.is_active ? 'default' : 'secondary'}>
                      {site?.is_active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            {emailMatches && (
              <Alert className="border-blue-500 bg-blue-50">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Email Eşleşmesi Tespit Edildi</AlertTitle>
                <AlertDescription>
                  Başvuran kişinin email adresi ({profile.email}) ile sitenin kayıtlı email adresi eşleşiyor.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Email Doğrulama
                  {emailVerification && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Doğrulandı
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!emailVerification ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Sitenin kayıtlı email adresine doğrulama kodu gönderin
                    </p>
                    <Button 
                      onClick={() => sendEmailVerificationMutation.mutate()}
                      disabled={sendEmailVerificationMutation.isPending}
                      className="gap-2"
                    >
                      {sendEmailVerificationMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <Send className="h-4 w-4" />
                      Doğrulama Kodu Oluştur
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Email doğrulaması {formatDistanceToNow(new Date(emailVerification.verified_at), { 
                        addSuffix: true, 
                        locale: tr 
                      })} tamamlandı
                    </p>
                  </div>
                )}

                {verifications?.filter(v => v.verification_type === 'email' && !v.verified_at).map(v => (
                  <Alert key={v.id}>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Bekleyen Doğrulama</AlertTitle>
                    <AlertDescription>
                      Kod: {v.verification_code}
                      <br />
                      Son kullanma: {new Date(v.expires_at).toLocaleString('tr-TR')}
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Domain Doğrulama
                  {domainVerification && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Doğrulandı
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Domain sahipliğini doğrulamak için aşağıdaki yöntemlerden birini kullanabilirsiniz
                </p>
                
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Yöntem 1: DNS TXT Record</AlertTitle>
                  <AlertDescription>
                    <code className="block bg-muted p-2 rounded mt-2 text-xs">
                      TXT _casinodoo-verify.{site?.slug}.com = "casinodoo-verify-{application.id.slice(0, 8)}"
                    </code>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Yöntem 2: HTML Meta Tag</AlertTitle>
                  <AlertDescription>
                    <code className="block bg-muted p-2 rounded mt-2 text-xs">
                      {`<meta name="casinodoo-verification" content="${application.id.slice(0, 8)}" />`}
                    </code>
                  </AlertDescription>
                </Alert>

                <Button variant="outline" disabled>
                  Otomatik Doğrulama (Yakında)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Notları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Notlar (Sadece adminler görebilir)</Label>
                  <Textarea 
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    onBlur={saveAdminNotes}
                    placeholder="Bu başvuru hakkında notlarınızı buraya yazın..."
                    className="mt-2"
                    rows={6}
                  />
                  {isSavingNotes && (
                    <p className="text-xs text-muted-foreground mt-1">Kaydediliyor...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
          {application.status === 'pending' && (
            <>
              <Button variant="destructive" onClick={onReject}>
                <XCircle className="h-4 w-4 mr-2" />
                Reddet
              </Button>
              <Button onClick={onApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Onayla
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, AlertTriangle, CheckCircle, Search, Flag, Scan, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function DomainMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [flagReason, setFlagReason] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const queryClient = useQueryClient();

  // Check user permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_id', user?.id);
      
      setDebugInfo({ user: user?.email, roles });
      console.log('User permissions:', { user: user?.email, roles });
    };
    
    checkPermissions();
  }, []);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('domain-tracking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'domain_tracking',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['domain-tracking'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: domains, isLoading } = useQuery({
    queryKey: ['domain-tracking', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('domain_tracking')
        .select(`
          *,
          profiles:user_id(username, email)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('domain', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Domain tracking query error:', error);
        throw error;
      }
      
      console.log('Fetched domains:', data?.length || 0);
      return data;
    },
  });

  const flagMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('domain_tracking')
        .update({
          is_flagged: true,
          flagged_reason: reason,
          flagged_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domain-tracking'] });
      toast({ title: 'Domain işaretlendi' });
      setSelectedDomain(null);
      setFlagReason('');
    },
  });

  const unflagMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('domain_tracking')
        .update({
          is_flagged: false,
          flagged_reason: null,
          flagged_at: null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domain-tracking'] });
      toast({ title: 'Domain işareti kaldırıldı' });
    },
  });

  const allDomains = domains || [];
  const flaggedDomains = allDomains.filter((d) => d.is_flagged);
  const unflaggedDomains = allDomains.filter((d) => !d.is_flagged);

  // Group by domain
  const domainGroups = allDomains.reduce((acc: any, curr: any) => {
    if (!acc[curr.domain]) {
      acc[curr.domain] = [];
    }
    acc[curr.domain].push(curr);
    return acc;
  }, {});

  const scanExistingContent = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.rpc('scan_existing_content_for_domains');
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['domain-tracking'] });
      
      if (data && data.length > 0) {
        toast({
          title: 'Tarama tamamlandı',
          description: `${data[0].scanned_records} kayıt tarandı, ${data[0].found_domains} domain bulundu`,
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: 'Tarama hatası',
        description: 'Bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const DomainCard = ({ item }: { item: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              {item.domain}
              {item.is_flagged && (
                <Badge variant="destructive" className="ml-2">
                  <Flag className="w-3 h-3 mr-1" />
                  İşaretli
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {item.source_table} - {item.source_column}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-1">URL:</p>
          <a
            href={item.full_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {item.full_url}
          </a>
        </div>

        {item.context_text && (
          <div>
            <p className="text-sm font-medium mb-1">İçerik:</p>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
              ...{item.context_text}...
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div>
            Kullanıcı: {item.profiles?.username || item.profiles?.email || 'Anonim'}
          </div>
          <div>{format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}</div>
        </div>

        {item.is_flagged && item.flagged_reason && (
          <div className="bg-destructive/10 p-2 rounded">
            <p className="text-sm font-medium text-destructive">İşaretlenme Nedeni:</p>
            <p className="text-sm text-muted-foreground">{item.flagged_reason}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {item.is_flagged ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => unflagMutation.mutate(item.id)}
              disabled={unflagMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              İşareti Kaldır
            </Button>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setSelectedDomain(item)}
                >
                  <Flag className="w-4 h-4 mr-1" />
                  İşaretle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Domain İşaretle</DialogTitle>
                  <DialogDescription>
                    Bu domain'i neden işaretliyorsunuz? (örn: hacklink, spam)
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="İşaretleme nedeni..."
                  rows={3}
                />
                <DialogFooter>
                  <Button
                    onClick={() => {
                      if (flagReason.trim()) {
                        flagMutation.mutate({ id: item.id, reason: flagReason });
                      }
                    }}
                    disabled={!flagReason.trim() || flagMutation.isPending}
                  >
                    İşaretle
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Domain Monitoring</h1>
          <p className="text-muted-foreground">
            Kullanıcıların girdiği tüm domainleri izleyin ve hacklink/spam tespiti yapın
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ✨ Real-time: Yeni domainler otomatik görünür
          </p>
          {debugInfo && (
            <div className="mt-2 text-xs bg-muted p-2 rounded">
              <strong>Debug:</strong> {debugInfo.user} - Roles: {JSON.stringify(debugInfo.roles)}
            </div>
          )}
        </div>
        <Button
          onClick={scanExistingContent}
          disabled={isScanning}
          variant="outline"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Taranıyor...
            </>
          ) : (
            <>
              <Scan className="w-4 h-4 mr-2" />
              Tüm İçeriği Tara
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Domain ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Toplam Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(domainGroups).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Toplam Kayıt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allDomains.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive">İşaretli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{flaggedDomains.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            Tümü ({allDomains.length})
          </TabsTrigger>
          <TabsTrigger value="flagged">
            İşaretliler ({flaggedDomains.length})
          </TabsTrigger>
          <TabsTrigger value="unflagged">
            Temiz ({unflaggedDomains.length})
          </TabsTrigger>
          <TabsTrigger value="grouped">
            Domain Gruplu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div>Yükleniyor...</div>
          ) : allDomains.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Henüz domain kaydı yok
              </CardContent>
            </Card>
          ) : (
            allDomains.map((item: any) => <DomainCard key={item.id} item={item} />)
          )}
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          {flaggedDomains.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                İşaretli domain yok
              </CardContent>
            </Card>
          ) : (
            flaggedDomains.map((item: any) => <DomainCard key={item.id} item={item} />)
          )}
        </TabsContent>

        <TabsContent value="unflagged" className="space-y-4">
          {unflaggedDomains.map((item: any) => (
            <DomainCard key={item.id} item={item} />
          ))}
        </TabsContent>

        <TabsContent value="grouped" className="space-y-4">
          {Object.entries(domainGroups).map(([domain, items]: [string, any]) => (
            <Card key={domain}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {domain}
                  <Badge variant="secondary">{items.length} kayıt</Badge>
                  {items.some((i: any) => i.is_flagged) && (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Dikkat
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className="text-sm p-2 bg-muted rounded flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.source_table}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(item.created_at), 'dd MMM yyyy', { locale: tr })}
                      </div>
                    </div>
                    {item.is_flagged && (
                      <Badge variant="destructive" className="ml-2">
                        İşaretli
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

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

  const { data: domains, isLoading, error: queryError } = useQuery({
    queryKey: ['domain-tracking', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('domain_tracking')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (searchTerm) {
        query = query.ilike('domain', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Domain tracking query error:', error);
        throw error;
      }
      
      console.log('Fetched domains:', data?.length || 0);
      
      // Manually fetch user info for each unique user_id
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(d => d.user_id).filter(Boolean))];
        
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, email')
            .in('id', userIds);
          
          // Map profiles to domains
          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
          
          return data.map(domain => ({
            ...domain,
            profiles: domain.user_id ? profileMap.get(domain.user_id) : null
          }));
        }
      }
      
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

  const whitelistMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('domain_tracking')
        .update({
          is_whitelisted: true,
          whitelisted_by: user?.id,
          whitelisted_at: new Date().toISOString(),
          whitelist_reason: reason || 'Güvenli olarak işaretlendi',
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domain-tracking'] });
      toast({ title: 'Domain whitelist\'e eklendi', description: 'Bu domain artık güvenli olarak işaretlendi' });
    },
  });

  const unwhitelistMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('domain_tracking')
        .update({
          is_whitelisted: false,
          whitelisted_by: null,
          whitelisted_at: null,
          whitelist_reason: null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domain-tracking'] });
      toast({ title: 'Domain whitelist\'ten çıkarıldı' });
    },
  });

  const allDomains = domains || [];
  const flaggedDomains = allDomains.filter((d) => d.is_flagged);
  const whitelistedDomains = allDomains.filter((d) => d.is_whitelisted);

  // Smart categorization
  const categorizeDomain = (item: any) => {
    // Whitelisted domains are always safe
    if (item.is_whitelisted) {
      return 'safe';
    }
    
    const domain = item.domain;
    const suspiciousKeywords = ['link', 'bet', 'casino', 'porn', 'xxx', 'hack', 'seo'];
    const domainLower = domain.toLowerCase();
    
    if (suspiciousKeywords.some(keyword => domainLower.includes(keyword))) {
      return 'high-risk';
    }
    
    const knownDomains = ['google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com'];
    if (knownDomains.some(known => domainLower.includes(known))) {
      return 'safe';
    }
    
    return 'medium-risk';
  };

  // Group by domain with risk analysis
  const domainGroups = allDomains.reduce((acc: any, curr: any) => {
    if (!acc[curr.domain]) {
      acc[curr.domain] = {
        entries: [],
        riskLevel: categorizeDomain(curr),
        isFlagged: false,
        isWhitelisted: curr.is_whitelisted,
      };
    }
    acc[curr.domain].entries.push(curr);
    if (curr.is_flagged) {
      acc[curr.domain].isFlagged = true;
    }
    if (curr.is_whitelisted) {
      acc[curr.domain].isWhitelisted = true;
      acc[curr.domain].riskLevel = 'safe';
    }
    return acc;
  }, {});

  // Categorize by risk
  const highRiskDomains = allDomains.filter(d => categorizeDomain(d) === 'high-risk');
  const mediumRiskDomains = allDomains.filter(d => categorizeDomain(d) === 'medium-risk');
  const safeDomains = allDomains.filter(d => categorizeDomain(d) === 'safe');

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

  const DomainCard = ({ item }: { item: any }) => {
    const riskLevel = categorizeDomain(item);
    const riskColor = 
      riskLevel === 'high-risk' ? 'border-destructive/50 bg-destructive/5' :
      riskLevel === 'medium-risk' ? 'border-yellow-500/50 bg-yellow-50/50' :
      'border-green-500/50 bg-green-50/50';
    
    return (
      <Card className={`hover:shadow-md transition-shadow ${riskColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                {item.domain}
                {item.is_whitelisted && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Whitelist
                  </Badge>
                )}
                {riskLevel === 'high-risk' && !item.is_whitelisted && (
                  <Badge variant="destructive">🔴 Yüksek Risk</Badge>
                )}
                {riskLevel === 'medium-risk' && !item.is_whitelisted && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">🟡 Orta Risk</Badge>
                )}
                {riskLevel === 'safe' && !item.is_whitelisted && (
                  <Badge className="bg-green-500 hover:bg-green-600">🟢 Güvenli</Badge>
                )}
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
          {item.is_whitelisted ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => unwhitelistMutation.mutate(item.id)}
              disabled={unwhitelistMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Whitelist'ten Çıkar
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={() => whitelistMutation.mutate({ id: item.id })}
              disabled={whitelistMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Whitelist Yap
            </Button>
          )}
          
          {item.is_flagged ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => unflagMutation.mutate(item.id)}
              disabled={unflagMutation.isPending}
            >
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
  };

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

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive">Yüksek Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{highRiskDomains.length}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">Orta Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mediumRiskDomains.length}</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Güvenli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{safeDomains.length}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600">Whitelist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{whitelistedDomains.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="high-risk" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="high-risk" className="text-destructive">
            🔴 Yüksek Risk ({highRiskDomains.length})
          </TabsTrigger>
          <TabsTrigger value="medium-risk" className="text-yellow-600">
            🟡 Orta Risk ({mediumRiskDomains.length})
          </TabsTrigger>
          <TabsTrigger value="safe" className="text-green-600">
            🟢 Güvenli ({safeDomains.length})
          </TabsTrigger>
          <TabsTrigger value="whitelisted" className="text-blue-600">
            ✅ Whitelist ({whitelistedDomains.length})
          </TabsTrigger>
          <TabsTrigger value="flagged">
            🚩 İşaretli ({flaggedDomains.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            📋 Tümü ({allDomains.length})
          </TabsTrigger>
          <TabsTrigger value="grouped">
            📊 Domain Gruplu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="high-risk" className="space-y-4">
          {highRiskDomains.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Yüksek riskli domain yok
              </CardContent>
            </Card>
          ) : (
            highRiskDomains.map((item: any) => <DomainCard key={item.id} item={item} />)
          )}
        </TabsContent>

        <TabsContent value="medium-risk" className="space-y-4">
          {mediumRiskDomains.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Orta riskli domain yok
              </CardContent>
            </Card>
          ) : (
            mediumRiskDomains.map((item: any) => <DomainCard key={item.id} item={item} />)
          )}
        </TabsContent>

        <TabsContent value="safe" className="space-y-4">
          {safeDomains.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Güvenli domain yok
              </CardContent>
            </Card>
          ) : (
            safeDomains.map((item: any) => <DomainCard key={item.id} item={item} />)
          )}
        </TabsContent>

        <TabsContent value="whitelisted" className="space-y-4">
          {whitelistedDomains.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Whitelist'te domain yok
              </CardContent>
            </Card>
          ) : (
            whitelistedDomains.map((item: any) => <DomainCard key={item.id} item={item} />)
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


        <TabsContent value="grouped" className="space-y-4">
          {Object.entries(domainGroups)
            .sort(([, a]: [string, any], [, b]: [string, any]) => {
              // Whitelisted first, then by risk level
              if (a.isWhitelisted && !b.isWhitelisted) return -1;
              if (!a.isWhitelisted && b.isWhitelisted) return 1;
              const riskOrder = { 'high-risk': 0, 'medium-risk': 1, 'safe': 2 };
              return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
            })
            .map(([domain, data]: [string, any]) => {
              const { entries, riskLevel, isFlagged, isWhitelisted } = data;
              return (
                <Card key={domain} className={
                  riskLevel === 'high-risk' ? 'border-destructive/50' :
                  riskLevel === 'medium-risk' ? 'border-yellow-500/50' :
                  'border-green-500/50'
                }>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {riskLevel === 'high-risk' && '🔴'}
                      {riskLevel === 'medium-risk' && '🟡'}
                      {riskLevel === 'safe' && '🟢'}
                      {domain}
                      <Badge variant="secondary">{entries.length} kayıt</Badge>
                      {isWhitelisted && (
                        <Badge className="bg-blue-500 hover:bg-blue-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Whitelist
                        </Badge>
                      )}
                      {isFlagged && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          İşaretli
                        </Badge>
                      )}
                      {riskLevel === 'high-risk' && !isWhitelisted && (
                        <Badge variant="destructive">Yüksek Risk</Badge>
                      )}
                      {riskLevel === 'medium-risk' && !isWhitelisted && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">Orta Risk</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {entries.map((item: any) => (
                      <div
                        key={item.id}
                        className="text-sm p-2 bg-muted rounded flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.source_table} - {item.source_column}</div>
                          <div className="text-xs text-muted-foreground">
                            Kullanıcı: {item.profiles?.username || item.profiles?.email || 'Anonim'} • {format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {item.is_flagged && (
                            <Badge variant="destructive" className="ml-2">
                              İşaretli
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, AlertTriangle, CheckCircle, Search, Flag, Scan, Loader2, Shield, Activity, Database, AlertCircle, X } from 'lucide-react';
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
import { motion } from 'framer-motion';

export default function DomainMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [flagReason, setFlagReason] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
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
      return 'high';
    }
    
    const knownDomains = ['google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com'];
    if (knownDomains.some(known => domainLower.includes(known))) {
      return 'safe';
    }
    
    return 'medium';
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
  const highRiskDomains = allDomains.filter(d => categorizeDomain(d) === 'high');
  const mediumRiskDomains = allDomains.filter(d => categorizeDomain(d) === 'medium');
  const safeDomains = allDomains.filter(d => categorizeDomain(d) === 'safe');

  const stats = {
    total: allDomains.length,
    unique_domains: Object.keys(domainGroups).length,
    high_risk: highRiskDomains.length,
    medium_risk: mediumRiskDomains.length,
    safe: safeDomains.length,
    flagged: flaggedDomains.length,
    whitelisted: whitelistedDomains.length,
  };

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

  const DomainCard = ({ item, index }: { item: any; index: number }) => {
    const riskLevel = categorizeDomain(item);
    const riskConfig = {
      'high': {
        icon: <AlertTriangle className="h-4 w-4 text-destructive" />
      },
      'medium': {
        icon: <AlertCircle className="h-4 w-4 text-warning" />
      },
      'safe': {
        icon: <CheckCircle className="h-4 w-4 text-success" />
      }
    };

    const config = riskConfig[riskLevel];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -2 }}
      >
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {config.icon}
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold truncate">{item.domain}</span>
                {item.is_whitelisted && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Whitelist
                  </Badge>
                )}
                {riskLevel === 'high' && !item.is_whitelisted && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    Yüksek Risk
                  </Badge>
                )}
                {riskLevel === 'medium' && !item.is_whitelisted && (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    Orta Risk
                  </Badge>
                )}
                {riskLevel === 'safe' && !item.is_whitelisted && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Güvenli
                  </Badge>
                )}
                {item.is_flagged && (
                  <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                    <Flag className="h-3 w-3 mr-1" />
                    İşaretli
                  </Badge>
                )}
              </div>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm mt-2">
              <span className="px-2 py-1 bg-muted/50 rounded text-xs font-mono">
                {item.source_table}.{item.source_column}
              </span>
            </CardDescription>
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
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
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
              <div className="bg-destructive/10 p-2 rounded border border-destructive/20">
                <p className="text-sm font-medium text-destructive">İşaretlenme Nedeni:</p>
                <p className="text-sm text-muted-foreground">{item.flagged_reason}</p>
              </div>
            )}

            <div className="flex gap-2 pt-3 flex-wrap">
              <Button
                size="sm"
                variant={item.is_whitelisted ? "outline" : "default"}
                onClick={() => item.is_whitelisted ? unwhitelistMutation.mutate(item.id) : whitelistMutation.mutate({ id: item.id })}
                disabled={whitelistMutation.isPending || unwhitelistMutation.isPending}
              >
                {item.is_whitelisted ? (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Whitelist'ten Çıkar
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Whitelist Yap
                  </>
                )}
              </Button>
              
              {item.is_flagged ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unflagMutation.mutate(item.id)}
                  disabled={unflagMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  İşareti Kaldır
                </Button>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedDomain(item)}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      İşaretle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
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
                      className="resize-none"
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
      </motion.div>
    );
  };

  const filteredDomains = activeTab === 'all' ? allDomains :
                         activeTab === 'high' ? highRiskDomains :
                         activeTab === 'medium' ? mediumRiskDomains :
                         activeTab === 'safe' ? safeDomains :
                         activeTab === 'flagged' ? flaggedDomains :
                         activeTab === 'whitelisted' ? whitelistedDomains : allDomains;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Domain İzleme Sistemi</h1>
                <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                  <Activity className="h-4 w-4" />
                  Gerçek zamanlı güvenlik ve içerik kontrolü
                </p>
              </div>
            </div>

            <Button
              onClick={scanExistingContent}
              disabled={isScanning}
              size="lg"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Taranıyor...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Tüm İçeriği Tara
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Domain, tablo veya kaynak ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 bg-card border"
          />
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Yüksek Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.high_risk}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Orta Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.medium_risk}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Güvenli
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.safe}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  İşaretli
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-info">{stats.flagged}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Benzersiz Domain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.unique_domains}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Toplam Girdi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-auto p-1.5 bg-muted">
              <TabsTrigger value="all" className="flex-col h-auto py-2 px-4 data-[state=active]:bg-card">
                <Database className="h-4 w-4 mb-1" />
                <span className="text-xs">Tümü</span>
                <Badge variant="secondary" className="mt-1 text-xs">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="high" className="flex-col h-auto py-2 px-4 data-[state=active]:bg-card">
                <AlertTriangle className="h-4 w-4 mb-1" />
                <span className="text-xs">Yüksek Risk</span>
                <Badge variant="secondary" className="mt-1 text-xs">{stats.high_risk}</Badge>
              </TabsTrigger>
              <TabsTrigger value="medium" className="flex-col h-auto py-2 px-4 data-[state=active]:bg-card">
                <AlertCircle className="h-4 w-4 mb-1" />
                <span className="text-xs">Orta Risk</span>
                <Badge variant="secondary" className="mt-1 text-xs">{stats.medium_risk}</Badge>
              </TabsTrigger>
              <TabsTrigger value="safe" className="flex-col h-auto py-2 px-4 data-[state=active]:bg-card">
                <CheckCircle className="h-4 w-4 mb-1" />
                <span className="text-xs">Güvenli</span>
                <Badge variant="secondary" className="mt-1 text-xs">{stats.safe}</Badge>
              </TabsTrigger>
              <TabsTrigger value="flagged" className="flex-col h-auto py-2 px-4 data-[state=active]:bg-card">
                <Flag className="h-4 w-4 mb-1" />
                <span className="text-xs">İşaretli</span>
                <Badge variant="secondary" className="mt-1 text-xs">{stats.flagged}</Badge>
              </TabsTrigger>
              <TabsTrigger value="whitelisted" className="flex-col h-auto py-2 px-4 data-[state=active]:bg-card">
                <Shield className="h-4 w-4 mb-1" />
                <span className="text-xs">Whitelist</span>
                <Badge variant="secondary" className="mt-1 text-xs">{stats.whitelisted}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredDomains.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Kayıt bulunamadı</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDomains.map((domain, index) => (
                    <DomainCard key={domain.id} item={domain} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, AlertTriangle, CheckCircle, Search, Flag, Scan, Loader2, Shield, Activity, TrendingUp } from 'lucide-react';
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
    const riskConfig = {
      'high-risk': {
        gradient: 'from-red-50 via-red-50/50 to-background dark:from-red-950/20 dark:via-red-900/10 dark:to-background',
        border: 'border-red-200 dark:border-red-800',
        icon: '🔴',
      },
      'medium-risk': {
        gradient: 'from-yellow-50 via-yellow-50/50 to-background dark:from-yellow-950/20 dark:via-yellow-900/10 dark:to-background',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: '🟡',
      },
      'safe': {
        gradient: 'from-green-50 via-green-50/50 to-background dark:from-green-950/20 dark:via-green-900/10 dark:to-background',
        border: 'border-green-200 dark:border-green-800',
        icon: '🟢',
      },
    };

    const config = riskConfig[riskLevel];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} border-2 ${config.border} shadow-lg hover:shadow-2xl transition-all`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
          <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                {config.icon}
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <span className="font-bold">{item.domain}</span>
                {item.is_whitelisted && (
                  <Badge className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0 shadow-md">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Whitelist
                  </Badge>
                )}
                {riskLevel === 'high-risk' && !item.is_whitelisted && (
                  <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md">
                    🔴 Yüksek Risk
                  </Badge>
                )}
                {riskLevel === 'medium-risk' && !item.is_whitelisted && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-md">
                    🟡 Orta Risk
                  </Badge>
                )}
                {riskLevel === 'safe' && !item.is_whitelisted && (
                  <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md">
                    🟢 Güvenli
                  </Badge>
                )}
                {item.is_flagged && (
                  <Badge variant="destructive" className="shadow-md">
                    <Flag className="w-3 h-3 mr-1" />
                    İşaretli
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                <span className="px-2 py-1 bg-muted rounded-md text-xs font-mono">{item.source_table}</span>
                <span className="text-muted-foreground">→</span>
                <span className="px-2 py-1 bg-muted rounded-md text-xs font-mono">{item.source_column}</span>
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

        <div className="flex gap-2 pt-3 flex-wrap">
          {item.is_whitelisted ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => unwhitelistMutation.mutate(item.id)}
              disabled={unwhitelistMutation.isPending}
              className="bg-gradient-to-r from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 border-cyan-300"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Whitelist'ten Çıkar
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-md"
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
              className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-300"
            >
              İşareti Kaldır
            </Button>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                  onClick={() => setSelectedDomain(item)}
                >
                  <Flag className="w-4 h-4 mr-1" />
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
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Header with Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Domain Monitoring</h1>
                  <p className="text-blue-100 mt-1">
                    Kullanıcı içeriklerinde akıllı domain takibi ve güvenlik analizi
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Activity className="w-4 h-4" />
                  <span>Real-time İzleme</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <TrendingUp className="w-4 h-4" />
                  <span>Akıllı Kategorizasyon</span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={scanExistingContent}
              disabled={isScanning}
              size="lg"
              className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Taranıyor...
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5 mr-2" />
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
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
          <Input
            placeholder="Domain ara... (örn: example.com)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 text-lg bg-card border-2 focus:border-primary shadow-lg transition-all"
          />
        </motion.div>

        {/* Stats Cards with Gradient */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/10 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Toplam Domain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Object.keys(domainGroups).length}</div>
                <p className="text-xs text-muted-foreground mt-1">Benzersiz domain</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">Toplam Kayıt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{allDomains.length}</div>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Tüm girişler</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-red-700 dark:text-red-300">🔴 Yüksek Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{highRiskDomains.length}</div>
                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Dikkat gerektir</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-yellow-700 dark:text-yellow-300">🟡 Orta Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{mediumRiskDomains.length}</div>
                <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1">Gözlem altında</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-green-700 dark:text-green-300">🟢 Güvenli</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{safeDomains.length}</div>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Onaylanmış</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-cyan-700 dark:text-cyan-300">✅ Whitelist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{whitelistedDomains.length}</div>
                <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70 mt-1">Güvenli liste</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Modern Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs defaultValue="high-risk" className="w-full">
            <TabsList className="grid w-full grid-cols-7 h-auto p-2 bg-card border-2 shadow-lg">
              <TabsTrigger 
                value="high-risk" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">🔴</span>
                <span className="text-xs font-medium">Yüksek Risk</span>
                <span className="text-xs opacity-80">({highRiskDomains.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="medium-risk" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">🟡</span>
                <span className="text-xs font-medium">Orta Risk</span>
                <span className="text-xs opacity-80">({mediumRiskDomains.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="safe" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">🟢</span>
                <span className="text-xs font-medium">Güvenli</span>
                <span className="text-xs opacity-80">({safeDomains.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="whitelisted" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">✅</span>
                <span className="text-xs font-medium">Whitelist</span>
                <span className="text-xs opacity-80">({whitelistedDomains.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="flagged" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">🚩</span>
                <span className="text-xs font-medium">İşaretli</span>
                <span className="text-xs opacity-80">({flaggedDomains.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">📋</span>
                <span className="text-xs font-medium">Tümü</span>
                <span className="text-xs opacity-80">({allDomains.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="grouped" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">📊</span>
                <span className="text-xs font-medium">Gruplu</span>
                <span className="text-xs opacity-80">({Object.keys(domainGroups).length})</span>
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
    </motion.div>
  </div>
</div>
  );
}

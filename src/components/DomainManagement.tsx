import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface AlternativeDomain {
  id: string;
  domain: string;
  is_primary: boolean;
  is_active: boolean;
  priority: number;
  status: string;
  last_checked_at: string | null;
  blocked_at: string | null;
  notes: string | null;
}

export const DomainManagement = () => {
  const [newDomain, setNewDomain] = useState("");
  const [newPriority, setNewPriority] = useState("50");
  const queryClient = useQueryClient();

  const { data: domains, isLoading } = useQuery({
    queryKey: ['alternative-domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alternative_domains')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as AlternativeDomain[];
    },
  });

  const addDomainMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('alternative_domains')
        .insert({
          domain: newDomain,
          priority: parseInt(newPriority),
          status: 'ready',
          notes: 'Yeni eklenen domain',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alternative-domains'] });
      setNewDomain("");
      setNewPriority("50");
      toast.success("Domain başarıyla eklendi");
    },
    onError: (error: any) => {
      toast.error("Domain eklenemedi: " + error.message);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('alternative_domains')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alternative-domains'] });
      toast.success("Domain durumu güncellendi");
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alternative_domains')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alternative-domains'] });
      toast.success("Domain silindi");
    },
  });

  const healthCheckMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('domain-health-check');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alternative-domains'] });
      
      const { summary, primaryHealthy, primaryDomain } = data;
      
      if (summary && summary.total > 0) {
        const healthPercentage = Math.round((summary.healthy / summary.total) * 100);
        const avgTime = summary.avgResponseTime || 0;
        
        if (primaryHealthy) {
          toast.success(
            `✅ Tüm kontroller tamamlandı!\n${summary.healthy}/${summary.total} domain aktif (${healthPercentage}%) • Ortalama: ${avgTime}ms\nPrimary domain (${primaryDomain}) çalışıyor`,
            { duration: 8000 }
          );
        } else {
          toast.warning(
            `⚠️ Primary domain problemi!\n${summary.healthy}/${summary.total} domain aktif (${healthPercentage}%)\nPrimary domain (${primaryDomain}) erişilemez durumda`,
            { duration: 10000 }
          );
        }
      } else {
        toast.success('Health check tamamlandı');
      }
    },
    onError: (error: any) => {
      toast.error("Health check başarısız: " + error.message, { duration: 8000 });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'ready':
        return <Shield className="h-4 w-4 text-primary" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'blocked':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      ready: "secondary",
      offline: "destructive",
      blocked: "destructive",
    };
    return variants[status] || "outline";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            TİB/BTK Koruma - Multi-Domain Yönetimi
          </CardTitle>
          <CardDescription>
            Ana domain erişim engeli durumunda otomatik yedek domain'e geçiş yapılır
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add New Domain */}
            <div className="flex gap-2">
              <Input
                placeholder="yeni-domain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Öncelik"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-32"
              />
              <Button
                onClick={() => addDomainMutation.mutate()}
                disabled={!newDomain || addDomainMutation.isPending}
              >
                {addDomainMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Ekle
                  </>
                )}
              </Button>
            </div>

            {/* Health Check Button */}
            <Button
              onClick={() => healthCheckMutation.mutate()}
              disabled={healthCheckMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {healthCheckMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Tüm Domain'leri Kontrol Et
            </Button>

            {/* Domains List */}
            <div className="space-y-2">
              {domains?.map((domain) => (
                <Card key={domain.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(domain.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{domain.domain}</span>
                            {domain.is_primary && (
                              <Badge variant="default">Primary</Badge>
                            )}
                            <Badge variant={getStatusBadge(domain.status)}>
                              {domain.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Öncelik: {domain.priority}
                            {domain.last_checked_at && (
                              <> • Son kontrol: {new Date(domain.last_checked_at).toLocaleString('tr-TR')}</>
                            )}
                          </p>
                          {domain.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{domain.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={domain.is_active}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: domain.id, isActive: checked })
                          }
                        />
                        {!domain.is_primary && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDomainMutation.mutate(domain.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Instructions */}
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Kurulum Talimatları:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Yedek domain'leri buraya ekleyin</li>
                  <li>Her domain için Lovable Settings → Domains'dan bağlantı yapın</li>
                  <li>DNS A record: <code className="bg-background px-1 py-0.5 rounded">185.158.133.1</code></li>
                  <li>Health check ile düzenli kontrol yapın</li>
                  <li>Ana domain engellenirse otomatik yönlendirme aktif olur</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

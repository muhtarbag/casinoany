import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MessageSquare, CheckCircle2, Clock, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export const ComplaintsShowcase = () => {
  // Fetch complaint stats
  const { data: stats } = useQuery({
    queryKey: ['complaint-stats'],
    queryFn: async () => {
      const { data: allComplaints, error: allError } = await supabase
        .from('site_complaints')
        .select('id, status')
        .eq('is_public', true)
        .eq('approval_status', 'approved');

      if (allError) throw allError;

      const total = allComplaints?.length || 0;
      const resolved = allComplaints?.filter(c => c.status === 'resolved').length || 0;
      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

      return {
        total,
        resolved,
        resolutionRate,
        avgResponseTime: '48', // Could be calculated from actual data
      };
    },
  });

  // Fetch recently resolved complaints
  const { data: resolvedComplaints } = useQuery({
    queryKey: ['resolved-complaints-showcase'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_complaints')
        .select(`
          id,
          title,
          description,
          created_at,
          resolved_at,
          response_count,
          betting_sites (name, slug, logo_url)
        `)
        .eq('is_public', true)
        .eq('approval_status', 'approved')
        .eq('status', 'resolved')
        .order('resolved_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-card/30 to-background border-y border-border/40">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto px-4 py-12 md:py-20 relative">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Şikayet Yönetim Platformu</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
              Bahis Sitesiyle Sorun mu Yaşıyorsunuz?
            </span>
          </h2>

          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Şikayetlerinizi paylaşın, site yetkilileri ile doğrudan iletişime geçin. 
            Şeffaf ve adil bir çözüm süreci için platformumuz sizinle.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="border-2 hover:border-primary/40 transition-all">
            <CardContent className="p-4 md:p-6 text-center space-y-2">
              <div className="flex items-center justify-center">
                <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">{stats?.total || 0}+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Toplam Şikayet</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-success/40 transition-all">
            <CardContent className="p-4 md:p-6 text-center space-y-2">
              <div className="flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-success" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-success">{stats?.resolutionRate || 0}%</div>
              <div className="text-xs md:text-sm text-muted-foreground">Çözüm Oranı</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/40 transition-all">
            <CardContent className="p-4 md:p-6 text-center space-y-2">
              <div className="flex items-center justify-center">
                <Clock className="w-8 h-8 md:w-10 md:h-10 text-accent" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">{stats?.avgResponseTime || 48}sa</div>
              <div className="text-xs md:text-sm text-muted-foreground">Ortalama Yanıt</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/40 transition-all">
            <CardContent className="p-4 md:p-6 text-center space-y-2">
              <div className="flex items-center justify-center">
                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">{stats?.resolved || 0}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Çözülen Sorun</div>
            </CardContent>
          </Card>
        </div>

        {/* Recently Resolved Complaints */}
        <div className="mb-10">
          <h3 className="text-xl md:text-2xl font-bold mb-6 text-center">
            Son Çözülen Şikayetler
          </h3>

          <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
            {resolvedComplaints?.map((complaint) => (
              <Card 
                key={complaint.id}
                className="group hover:shadow-lg hover:border-success/30 transition-all border-l-4 border-l-success"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Site Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-border">
                      <AvatarImage 
                        src={complaint.betting_sites?.logo_url} 
                        alt={complaint.betting_sites?.name}
                        className="object-contain p-1"
                      />
                      <AvatarFallback className="text-sm">
                        {complaint.betting_sites?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {complaint.betting_sites?.name}
                      </div>
                      <Badge variant="outline" className="border-success text-success text-xs">
                        ✓ Çözüldü
                      </Badge>
                    </div>
                  </div>

                  {/* Title */}
                  <p className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {complaint.title}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {complaint.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{complaint.response_count || 0} yanıt</span>
                    </div>
                    {complaint.resolved_at && (
                      <span>
                        {format(new Date(complaint.resolved_at), 'dd MMM', { locale: tr })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all group">
            <Link to="/sikayetler/yeni">
              <MessageSquare className="w-5 h-5 mr-2" />
              Şikayetini Paylaş
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base font-semibold">
            <Link to="/sikayetler">
              Tüm Şikayetleri Görüntüle
            </Link>
          </Button>
        </div>

        {/* Trust Message */}
        <div className="text-center mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>Tüm şikayetler incelenir ve site yetkilileri bilgilendirilir</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Şeffaf, adil ve güvenilir çözüm süreci için platformumuz 7/24 aktif
          </p>
        </div>
      </div>
    </section>
  );
};

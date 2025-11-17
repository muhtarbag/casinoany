import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MessageSquare, AlertTriangle, Gift, User, ArrowRight, Sparkles, TrendingUp, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, isSiteOwner, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect site owners to their management panel
  useEffect(() => {
    if (!loading && isSiteOwner) {
      navigate('/panel/site-management', { replace: true });
    }
  }, [isSiteOwner, loading, navigate]);

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [favorites, memberships, reviews, complaints, bonuses] = await Promise.all([
        supabase.from('user_favorite_sites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_site_memberships').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('site_reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('site_complaints').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_bonus_tracking').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active')
      ]);

      return {
        favorites: favorites.count || 0,
        memberships: memberships.count || 0,
        reviews: reviews.count || 0,
        complaints: complaints.count || 0,
        activeBonuses: bonuses.count || 0
      };
    },
    enabled: !!user
  });

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Yükleniyor...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Hesabınıza erişmek için lütfen giriş yapın.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
              <Button variant="outline" onClick={() => navigate('/signup')}>Kayıt Ol</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has any activity
  const hasActivity = stats && (
    stats.favorites > 0 || 
    stats.memberships > 0 || 
    stats.reviews > 0 || 
    stats.complaints > 0 || 
    stats.activeBonuses > 0
  );

  // Hero action (primary)
  const heroAction = {
    title: 'Aktif Bonuslarım',
    description: 'Takip ettiğiniz aktif bonuslar',
    icon: Gift,
    count: stats?.activeBonuses,
    href: '/profile/bonus-tracking',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    hoverBg: 'hover:bg-primary/15',
    emptyMessage: 'Henüz bonus takibi yapmıyorsunuz'
  };

  // Grid actions (compact cards)
  const gridActions = [
    {
      title: 'Favorilerim',
      icon: Heart,
      count: stats?.favorites,
      href: '/profile/favorites',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      darkBg: 'dark:bg-red-950/30',
      emptyMessage: 'Favori ekle'
    },
    {
      title: 'Üyeliklerim',
      icon: User,
      count: stats?.memberships,
      href: '/profile/memberships',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      darkBg: 'dark:bg-blue-950/30',
      emptyMessage: 'Üyelik ekle'
    },
    {
      title: 'Yorumlarım',
      icon: MessageSquare,
      count: stats?.reviews,
      href: '/profile/reviews',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      darkBg: 'dark:bg-green-950/30',
      emptyMessage: 'Yorum yaz'
    },
    {
      title: 'Şikayetlerim',
      icon: AlertTriangle,
      count: stats?.complaints,
      href: '/profile/complaints',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      darkBg: 'dark:bg-orange-950/30',
      emptyMessage: 'Şikayet yok'
    },
    {
      title: 'Profilim',
      icon: Settings,
      count: undefined,
      href: '/profile/settings',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      darkBg: 'dark:bg-purple-950/30',
      emptyMessage: 'Düzenle'
    }
  ];

  return (
    <>
      <SEO 
        title="Hesabım | Kullanıcı Paneli"
        description="Favori sitelerinizi yönetin, üyeliklerinizi takip edin ve bonus kampanyalarından haberdar olun."
      />
      <ProfileLayout>
        <div className="space-y-4 pb-20">
          
          {/* Onboarding / Empty State for New Users */}
          {!hasActivity && (
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1">Hoş Geldiniz! 👋</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Favori sitelerinizi ekleyin, bonusları takip edin ve yorumlar yazın.
                    </p>
                    <Button size="sm" asChild className="h-8 text-xs">
                      <Link to="/">
                        Siteleri Keşfet
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hero Card: Aktif Bonuslarım */}
          <Link to={heroAction.href}>
            <Card className={cn(
              "group cursor-pointer transition-all duration-300 border-2",
              heroAction.borderColor,
              heroAction.bgColor,
              heroAction.hoverBg,
              "hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            )}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform group-hover:scale-110",
                    heroAction.bgColor
                  )}>
                    <heroAction.icon className={cn("h-7 w-7", heroAction.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-base truncate">{heroAction.title}</h3>
                      {(heroAction.count || 0) > 0 && (
                        <TrendingUp className={cn("h-4 w-4 flex-shrink-0", heroAction.color)} />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {heroAction.description}
                    </p>
                    {(heroAction.count || 0) === 0 && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        {heroAction.emptyMessage}
                      </p>
                    )}
                  </div>

                  {/* Badge */}
                  {(heroAction.count || 0) > 0 ? (
                    <Badge className="text-xl px-3 py-1.5 font-bold flex-shrink-0">
                      {heroAction.count}
                    </Badge>
                  ) : (
                    <ArrowRight className={cn("h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-1", heroAction.color)} />
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Grid Cards: Compact 2x3 Layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gridActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <Card className={cn(
                  "group cursor-pointer transition-all duration-200 h-24 border",
                  action.bgColor,
                  action.darkBg,
                  "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                )}>
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <action.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", action.color)} />
                      {(action.count || 0) > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5 font-semibold">
                          {action.count}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-base font-semibold truncate mb-0.5">{action.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(action.count || 0) > 0 ? `${action.count} adet` : action.emptyMessage}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </ProfileLayout>
    </>
  );
}

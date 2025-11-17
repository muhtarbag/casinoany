import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MessageSquare, AlertTriangle, Gift, User, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

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

  const [currentActionIndex, setCurrentActionIndex] = useState(0);

  // Priority-ordered quick actions (most used first)
  const quickActions = [
    {
      title: 'Aktif Bonuslarım',
      description: 'Takip ettiğiniz aktif bonuslar',
      icon: Gift,
      count: stats?.activeBonuses,
      href: '/profile/bonus-tracking',
      color: 'text-primary',
      gradient: 'from-primary/20 to-primary/5',
      priority: 1
    },
    {
      title: 'Favorilerim',
      description: 'Favori bahis siteleriniz',
      icon: Heart,
      count: stats?.favorites,
      href: '/profile/favorites',
      color: 'text-red-500',
      gradient: 'from-red-500/20 to-red-500/5',
      priority: 2
    },
    {
      title: 'Üyeliklerim',
      description: 'Kayıtlı olduğunuz siteler',
      icon: User,
      count: stats?.memberships,
      href: '/profile/memberships',
      color: 'text-blue-500',
      gradient: 'from-blue-500/20 to-blue-500/5',
      priority: 3
    },
    {
      title: 'Yorumlarım',
      description: 'Yazdığınız yorumlar',
      icon: MessageSquare,
      count: stats?.reviews,
      href: '/profile/reviews',
      color: 'text-green-500',
      gradient: 'from-green-500/20 to-green-500/5',
      priority: 4
    },
    {
      title: 'Şikayetlerim',
      description: 'Aktif şikayetleriniz',
      icon: AlertTriangle,
      count: stats?.complaints,
      href: '/profile/complaints',
      color: 'text-orange-500',
      gradient: 'from-orange-500/20 to-orange-500/5',
      priority: 5
    }
  ].sort((a, b) => a.priority - b.priority);

  // Swipe gesture for mobile navigation
  const { handlers } = useSwipeGesture({
    onSwipeLeft: () => {
      if (currentActionIndex < quickActions.length - 1) {
        setCurrentActionIndex(prev => prev + 1);
      }
    },
    onSwipeRight: () => {
      if (currentActionIndex > 0) {
        setCurrentActionIndex(prev => prev - 1);
      }
    },
    threshold: 50
  });

  return (
    <>
      <SEO 
        title="Hesabım | Kullanıcı Paneli"
        description="Favori sitelerinizi yönetin, üyeliklerinizi takip edin ve bonus kampanyalarından haberdar olun."
      />
      <ProfileLayout>
        <div className="space-y-6 pb-6">
          {/* Hero Stats - Priority Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Link to="/profile/bonus-tracking">
              <Card className="group cursor-pointer bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]">
                <CardContent className="p-4 text-center">
                  <div className="relative">
                    <Gift className="h-8 w-8 mx-auto mb-2 text-primary transition-transform group-hover:scale-110" />
                    {(stats?.activeBonuses || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats?.activeBonuses || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Aktif Bonus</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/profile/favorites">
              <Card className="group cursor-pointer bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]">
                <CardContent className="p-4 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-red-500 transition-transform group-hover:scale-110 group-hover:fill-red-500" />
                  <p className="text-2xl md:text-3xl font-bold">{stats?.favorites || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Favori</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/profile/reviews">
              <Card className="group cursor-pointer bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]">
                <CardContent className="p-4 text-center">
                  <div className="relative">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500 transition-transform group-hover:scale-110" />
                    {(stats?.reviews || 0) > 0 && (
                      <TrendingUp className="absolute -top-1 -right-1 h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats?.reviews || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Yorum</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/profile/complaints">
              <Card className="group cursor-pointer bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]">
                <CardContent className="p-4 text-center">
                  <div className="relative">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500 transition-transform group-hover:scale-110" />
                    {(stats?.complaints || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats?.complaints || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Şikayet</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Actions - Mobile: Swipeable Carousel, Desktop: Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Hızlı Erişim</h2>
              {/* Mobile: Swipe indicator */}
              <div className="flex md:hidden gap-1">
                {quickActions.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      index === currentActionIndex 
                        ? "w-6 bg-primary" 
                        : "w-1.5 bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Mobile: Swipeable Single Card */}
            <div className="md:hidden" {...handlers}>
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${currentActionIndex * 100}%)` }}
                >
                  {quickActions.map((action) => (
                    <Link
                      key={action.href}
                      to={action.href}
                      className="w-full flex-shrink-0 px-1"
                    >
                      <Card className={cn(
                        "bg-gradient-to-br border-l-4 hover:shadow-xl transition-all duration-300 active:scale-[0.98]",
                        action.gradient
                      )}>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg",
                              action.color === 'text-primary' && "bg-primary/20",
                              action.color === 'text-blue-500' && "bg-blue-500/20",
                              action.color === 'text-red-500' && "bg-red-500/20",
                              action.color === 'text-green-500' && "bg-green-500/20",
                              action.color === 'text-orange-500' && "bg-orange-500/20"
                            )}>
                              <action.icon className={cn("h-7 w-7", action.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base mb-1 truncate">{action.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {action.description}
                              </p>
                            </div>
                            {action.count !== undefined && action.count > 0 && (
                              <Badge variant="secondary" className="text-lg px-3 py-1 font-bold">
                                {action.count}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop: Grid View */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="group"
                >
                  <Card className={cn(
                    "bg-gradient-to-br border-l-4 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
                    action.gradient
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg",
                          action.color === 'text-primary' && "bg-primary/20",
                          action.color === 'text-blue-500' && "bg-blue-500/20",
                          action.color === 'text-red-500' && "bg-red-500/20",
                          action.color === 'text-green-500' && "bg-green-500/20",
                          action.color === 'text-orange-500' && "bg-orange-500/20"
                        )}>
                          <action.icon className={cn("h-7 w-7", action.color)} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-1">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        {action.count !== undefined && action.count > 0 && (
                          <Badge variant="secondary" className="text-lg px-3 py-1 font-bold">
                            {action.count}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ProfileLayout>
    </>
  );
}

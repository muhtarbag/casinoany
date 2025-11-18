import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MessageSquare, AlertTriangle, Gift, User, Bell, Settings, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, isSiteOwner, loading, impersonatedUserId, isImpersonating } = useAuth();
  const navigate = useNavigate();

  // Impersonate ediliyorsa impersonatedUserId kullan, yoksa user?.id kullan
  const effectiveUserId = isImpersonating ? impersonatedUserId : user?.id;

  // Redirect site owners to their management panel
  useEffect(() => {
    if (!loading && isSiteOwner) {
      navigate('/panel/site-management', { replace: true });
    }
  }, [isSiteOwner, loading, navigate]);

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['user-stats', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return null;

      const [favorites, memberships, reviews, complaints, bonuses] = await Promise.all([
        supabase.from('user_favorite_sites').select('id', { count: 'exact', head: true }).eq('user_id', effectiveUserId),
        supabase.from('user_site_memberships').select('id', { count: 'exact', head: true }).eq('user_id', effectiveUserId),
        supabase.from('site_reviews').select('id', { count: 'exact', head: true }).eq('user_id', effectiveUserId),
        supabase.from('site_complaints').select('id', { count: 'exact', head: true }).eq('user_id', effectiveUserId),
        supabase.from('user_bonus_tracking').select('id', { count: 'exact', head: true }).eq('user_id', effectiveUserId).eq('status', 'active')
      ]);

      return {
        favorites: favorites.count || 0,
        memberships: memberships.count || 0,
        reviews: reviews.count || 0,
        complaints: complaints.count || 0,
        activeBonuses: bonuses.count || 0
      };
    },
    enabled: !!effectiveUserId
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

  // Menu items for the dashboard
  const menuItems = [
    {
      title: 'Aktif Bonuslarım',
      icon: Gift,
      count: stats?.activeBonuses,
      href: '/profile/bonus-tracking',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
    },
    {
      title: 'Favori Sitelerim',
      icon: Heart,
      count: stats?.favorites,
      href: '/profile/favorites',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    {
      title: 'Üye Olduğum Siteler',
      icon: User,
      count: stats?.memberships,
      href: '/profile/memberships',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Yorumlarım',
      icon: MessageSquare,
      count: stats?.reviews,
      href: '/profile/reviews',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Şikayetlerim',
      icon: AlertTriangle,
      count: stats?.complaints,
      href: '/profile/complaints',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
    {
      title: 'Hesap Ayarlarım',
      icon: Settings,
      count: undefined,
      href: '/profile/settings',
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20',
    }
  ];

  return (
    <>
      <SEO 
        title="Hesabım | Kullanıcı Paneli"
        description="Favori sitelerinizi yönetin, üyeliklerinizi takip edin ve bonus kampanyalarından haberdar olun."
      />
      <ProfileLayout>
        <div className="flex flex-col gap-5">
          {menuItems.map((item) => (
            <Link key={item.href} to={item.href} className="block">
              <Card className={cn(
                "group cursor-pointer transition-all duration-300 border-l-4",
                item.borderColor,
                "hover:shadow-lg hover:bg-accent/5 active:scale-[0.98]"
              )}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                      item.bgColor
                    )}>
                      <item.icon className={cn("w-6 h-6", item.color)} />
                    </div>

                    {/* Title and Count */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                      {item.count !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          {item.count} {item.count === 1 ? 'adet' : 'adet'}
                        </p>
                      )}
                    </div>

                    {/* Badge or Arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {item.count !== undefined && item.count > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="text-lg px-3 py-1 font-bold"
                        >
                          {item.count}
                        </Badge>
                      )}
                      <ChevronRight 
                        className={cn(
                          "w-5 h-5 transition-transform group-hover:translate-x-1",
                          item.color
                        )} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </ProfileLayout>
    </>
  );
}

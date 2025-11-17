import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Star, MessageSquare, AlertTriangle, Gift, User, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, isSiteOwner } = useAuth();
  const navigate = useNavigate();

  // Redirect site owners to their management panel
  useEffect(() => {
    if (isSiteOwner) {
      navigate('/panel/site-management', { replace: true });
    }
  }, [isSiteOwner, navigate]);

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

  const quickActions = [
    {
      title: 'Aktif Bonuslarım',
      description: 'Takip ettiğiniz aktif bonuslar',
      icon: Gift,
      count: stats?.activeBonuses,
      href: '/profile/bonus-tracking',
      color: 'text-primary'
    },
    {
      title: 'Favorilerim',
      description: 'Favori bahis siteleriniz',
      icon: Heart,
      count: stats?.favorites,
      href: '/profile/favorites',
      color: 'text-red-500'
    },
    {
      title: 'Yorumlarım',
      description: 'Yazdığınız yorumlar',
      icon: MessageSquare,
      count: stats?.reviews,
      href: '/profile/reviews',
      color: 'text-green-500'
    },
    {
      title: 'Şikayetlerim',
      description: 'Aktif şikayetleriniz',
      icon: AlertTriangle,
      count: stats?.complaints,
      href: '/profile/complaints',
      color: 'text-orange-500'
    }
  ];

  return (
    <>
      <SEO 
        title="Hesabım | Kullanıcı Paneli"
        description="Favori sitelerinizi yönetin, üyeliklerinizi takip edin ve bonus kampanyalarından haberdar olun."
      />
      <ProfileLayout>
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <Gift className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats?.activeBonuses || 0}</p>
                <p className="text-xs text-muted-foreground">Aktif Bonus</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{stats?.favorites || 0}</p>
                <p className="text-xs text-muted-foreground">Favori</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{stats?.reviews || 0}</p>
                <p className="text-xs text-muted-foreground">Yorum</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{stats?.complaints || 0}</p>
                <p className="text-xs text-muted-foreground">Şikayet</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="group"
              >
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                        action.color === 'text-primary' && "bg-primary/10",
                        action.color === 'text-red-500' && "bg-red-500/10",
                        action.color === 'text-green-500' && "bg-green-500/10",
                        action.color === 'text-orange-500' && "bg-orange-500/10"
                      )}>
                        <action.icon className={cn("h-6 w-6", action.color)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      {action.count !== undefined && (
                        <Badge variant="secondary" className="text-lg px-3">
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
      </ProfileLayout>
    </>
  );
}

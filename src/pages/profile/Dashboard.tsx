import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MessageSquare, AlertTriangle, Gift, User, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [favorites, memberships, reviews, complaints, bonuses] = await Promise.all([
        supabase.from('user_favorite_sites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_site_memberships').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('site_reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_complaints').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
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
      title: 'Favorilerim',
      description: 'Favori sitelerinizi görüntüleyin',
      icon: Heart,
      count: stats?.favorites,
      href: '/profile/favorites',
      color: 'text-red-500'
    },
    {
      title: 'Üyeliklerim',
      description: 'Kayıt olduğunuz siteleri yönetin',
      icon: User,
      count: stats?.memberships,
      href: '/profile/memberships',
      color: 'text-blue-500'
    },
    {
      title: 'Yorumlarım',
      description: 'Site yorumlarınızı görüntüleyin',
      icon: MessageSquare,
      count: stats?.reviews,
      href: '/profile/reviews',
      color: 'text-green-500'
    },
    {
      title: 'Şikayetlerim',
      description: 'Şikayetlerinizi takip edin',
      icon: AlertTriangle,
      count: stats?.complaints,
      href: '/profile/complaints',
      color: 'text-orange-500'
    },
    {
      title: 'Bonus Takibi',
      description: 'Aktif bonuslarınızı takip edin',
      icon: Gift,
      count: stats?.activeBonuses,
      href: '/profile/bonus-tracking',
      color: 'text-purple-500'
    },
    {
      title: 'Ayarlar',
      description: 'Hesap ayarlarınızı düzenleyin',
      icon: Settings,
      href: '/profile/settings',
      color: 'text-gray-500'
    }
  ];

  return (
    <>
      <SEO 
        title="Hesabım | Kullanıcı Paneli"
        description="Favori sitelerinizi yönetin, üyeliklerinizi takip edin ve bonus kampanyalarından haberdar olun."
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz 👋</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Card 
                key={action.href}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => navigate(action.href)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <action.icon className={`w-8 h-8 ${action.color}`} />
                    {action.count !== undefined && (
                      <span className="text-2xl font-bold">{action.count}</span>
                    )}
                  </div>
                  <CardTitle className="mt-4">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Hızlı Erişim</CardTitle>
              <CardDescription>Sık kullandığınız sayfalara hızlıca ulaşın</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate('/')}>
                Ana Sayfa
              </Button>
              <Button variant="outline" onClick={() => navigate('/kategoriler')}>
                Kategoriler
              </Button>
              <Button variant="outline" onClick={() => navigate('/blog')}>
                Blog
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

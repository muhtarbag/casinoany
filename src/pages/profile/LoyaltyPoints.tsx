import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useUserLoyaltyPoints } from '@/hooks/useUserLoyaltyPoints';
import { Trophy, TrendingUp, Gift, History, Star, Award, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { SEO } from '@/components/SEO';
import { Leaderboard } from '@/components/Leaderboard';

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'platinum':
      return <Sparkles className="w-5 h-5" />;
    case 'gold':
      return <Star className="w-5 h-5" />;
    case 'silver':
      return <Award className="w-5 h-5" />;
    default:
      return <Trophy className="w-5 h-5" />;
  }
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'earn':
      return '➕';
    case 'spend':
      return '➖';
    case 'bonus':
      return '🎁';
    case 'expire':
      return '⏰';
    default:
      return '📝';
  }
};

const getRewardTypeLabel = (type: string) => {
  switch (type) {
    case 'bonus':
      return 'Bonus';
    case 'cashback':
      return 'Cashback';
    case 'free_spin':
      return 'Bedava Çevirme';
    case 'vip_access':
      return 'VIP Erişim';
    default:
      return 'Özel Ödül';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Beklemede';
    case 'approved':
      return 'Onaylandı';
    case 'delivered':
      return 'Teslim Edildi';
    case 'rejected':
      return 'Reddedildi';
    case 'expired':
      return 'Süresi Doldu';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
    case 'delivered':
      return 'bg-green-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'rejected':
    case 'expired':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export default function LoyaltyPoints() {
  const {
    loyaltyPoints,
    transactions,
    rewards,
    redemptions,
    isLoading,
    redeemReward,
    isRedeeming,
    getTierInfo
  } = useUserLoyaltyPoints();

  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProfileLayout>
    );
  }

  const tierInfo = loyaltyPoints ? getTierInfo(loyaltyPoints.tier) : getTierInfo('bronze');
  const progressToNextTier = tierInfo.nextPoints 
    ? ((loyaltyPoints?.lifetime_points || 0) / tierInfo.nextPoints) * 100 
    : 100;

  return (
    <ProfileLayout>
      <SEO
        title="Sadakat Puanlarım | CasinoAny"
        description="Sadakat puanlarınızı görüntüleyin ve ödüller kazanın"
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            Sadakat Puanları
          </h1>
          <p className="text-muted-foreground mt-1">
            Puanlarınızı toplayın ve harika ödüller kazanın
          </p>
        </div>

        {/* Points Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Mevcut Puanlarınız</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {loyaltyPoints?.total_points || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Puan</p>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Toplam Kazanılan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loyaltyPoints?.lifetime_points || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ömür Boyu Puan</p>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getTierIcon(loyaltyPoints?.tier || 'bronze')}
                Seviyeniz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${tierInfo.color}`}>
                {tierInfo.name}
              </div>
              {tierInfo.nextTier && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {tierInfo.nextTier} için
                    </span>
                    <span className="font-medium">
                      {loyaltyPoints?.lifetime_points || 0} / {tierInfo.nextPoints}
                    </span>
                  </div>
                  <Progress value={progressToNextTier} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Ödüller
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Geçmiş
            </TabsTrigger>
            <TabsTrigger value="my-rewards" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Kullanılanlar
            </TabsTrigger>
          </TabsList>

          {/* Available Rewards */}
          <TabsContent value="rewards" className="mt-6">
            {rewards.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Şu anda kullanılabilir ödül yok</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rewards.map((reward) => {
                  const canRedeem = 
                    loyaltyPoints && 
                    loyaltyPoints.total_points >= reward.points_cost &&
                    getTierInfo(loyaltyPoints.tier).name.toLowerCase() >= reward.min_tier;
                  
                  return (
                    <Card key={reward.id} className="flex flex-col">
                      {reward.image_url && (
                        <img 
                          src={reward.image_url} 
                          alt={reward.title}
                          className="w-full h-40 object-cover rounded-t-lg"
                        />
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{reward.title}</CardTitle>
                          <Badge variant="secondary" className="shrink-0">
                            {getRewardTypeLabel(reward.reward_type)}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {reward.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          {reward.reward_value && (
                            <div className="text-2xl font-bold text-primary">
                              {reward.reward_value}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Maliyet:</span>
                            <span className="font-semibold">{reward.points_cost} puan</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Min. Seviye:</span>
                            <Badge variant="outline" className="capitalize">
                              {reward.min_tier}
                            </Badge>
                          </div>
                          {reward.stock_quantity !== null && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Stok:</span>
                              <span className={reward.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                {reward.stock_quantity > 0 ? `${reward.stock_quantity} adet` : 'Tükendi'}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => redeemReward(reward.id)}
                          disabled={!canRedeem || isRedeeming || (reward.stock_quantity !== null && reward.stock_quantity <= 0)}
                          className="w-full"
                        >
                          {!canRedeem && loyaltyPoints && loyaltyPoints.total_points < reward.points_cost
                            ? 'Yetersiz Puan'
                            : !canRedeem
                            ? 'Seviye Yetersiz'
                            : 'Kullan'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Transaction History */}
          <TabsContent value="history" className="mt-6">
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Henüz işlem geçmişiniz yok</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getTransactionIcon(transaction.transaction_type)}
                          </div>
                          <div>
                            <p className="font-semibold">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.source} • {formatDistanceToNow(new Date(transaction.created_at), { 
                                addSuffix: true,
                                locale: tr 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Redemptions */}
          <TabsContent value="my-rewards" className="mt-6">
            {redemptions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Henüz ödül kullanmadınız</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {redemptions.map((redemption) => (
                  <Card key={redemption.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{redemption.reward?.title}</p>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(redemption.status)}`} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {redemption.reward?.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(redemption.redeemed_at), { 
                                addSuffix: true,
                                locale: tr 
                              })}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getStatusLabel(redemption.status)}
                            </Badge>
                          </div>
                          {redemption.redemption_code && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm font-mono">
                              Kod: {redemption.redemption_code}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            -{redemption.points_spent}
                          </div>
                          <p className="text-xs text-muted-foreground">puan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Leaderboard Section */}
        <Leaderboard limit={10} showTitle={true} />
      </div>
    </ProfileLayout>
  );
}

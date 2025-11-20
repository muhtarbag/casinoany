import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useReferralProgram } from '@/hooks/useReferralProgram';
import { Copy, Share2, Gift, Users, TrendingUp, Mail, MessageCircle, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function Referrals() {
  const {
    referralData,
    referralHistory,
    isLoading,
    getReferralLink,
    copyReferralLink,
    shareViaWhatsApp,
    shareViaTelegram,
    shareViaEmail
  } = useReferralProgram();

  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Davet</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralData?.total_referrals || 0}</div>
              <p className="text-xs text-muted-foreground">
                Gönderilen toplam davet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Başarılı Davet</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralData?.successful_referrals || 0}</div>
              <p className="text-xs text-muted-foreground">
                Kayıt olan kullanıcılar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kazanılan Puan</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralData?.total_points_earned || 0}</div>
              <p className="text-xs text-muted-foreground">
                Davetlerden kazanılan toplam puan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section */}
        <Card>
          <CardHeader>
            <CardTitle>Davet Linkin</CardTitle>
            <CardDescription>
              Bu linki arkadaşlarınla paylaş. Kayıt olduklarında hem sen hem de onlar puan kazanacaksınız!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Referral Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Davet Kodun</label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={referralData?.referral_code || ''}
                  className="font-mono text-lg"
                />
                <Button onClick={copyReferralLink} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Referral Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Davet Linki</label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getReferralLink()}
                  className="text-sm"
                />
                <Button onClick={copyReferralLink} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hızlı Paylaş</label>
              <div className="flex flex-wrap gap-2">
                <Button onClick={shareViaWhatsApp} variant="outline" className="flex-1 min-w-[140px]">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button onClick={shareViaTelegram} variant="outline" className="flex-1 min-w-[140px]">
                  <Send className="h-4 w-4 mr-2" />
                  Telegram
                </Button>
                <Button onClick={shareViaEmail} variant="outline" className="flex-1 min-w-[140px]">
                  <Mail className="h-4 w-4 mr-2" />
                  E-posta
                </Button>
              </div>
            </div>

            {/* Referral Info */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <Gift className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nasıl Çalışır?</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Arkadaşın senin linkini kullanarak kayıt olur</li>
                    <li>• Sen <strong>50 puan</strong> kazanırsın</li>
                    <li>• Arkadaşın hoş geldin bonusu olarak <strong>25 puan</strong> kazanır</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Davet Geçmişi</CardTitle>
            <CardDescription>
              Davet ettiğin arkadaşların listesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referralHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Share2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Henüz kimseyi davet etmedin</p>
                <p className="text-sm mt-1">Yukarıdaki linki paylaşarak başla!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referralHistory.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {referral.referred_user?.username || referral.referred_user?.email || 'Anonim Kullanıcı'}
                        </p>
                        <Badge
                          variant={
                            referral.status === 'completed'
                              ? 'default'
                              : referral.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {referral.status === 'completed'
                            ? 'Tamamlandı'
                            : referral.status === 'pending'
                            ? 'Beklemede'
                            : 'İptal'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(referral.created_at), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                      </p>
                    </div>
                    {referral.status === 'completed' && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">+{referral.points_awarded}</p>
                        <p className="text-xs text-muted-foreground">puan</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
}

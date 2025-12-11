import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementBadge } from '@/components/AchievementBadge';
import { Trophy, Target, Users, Gift } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';

const categoryInfo = {
  social: { label: 'Sosyal', icon: Users, color: '#10b981' },
  loyalty: { label: 'Sadakat', icon: Trophy, color: '#8b5cf6' },
  activity: { label: 'Aktivite', icon: Target, color: '#3b82f6' },
  special: { label: 'Özel', icon: Gift, color: '#eab308' }
};

export default function Achievements() {
  const {
    achievementsByCategory,
    earnedCount,
    totalCount,
    completionPercentage,
    isLoading
  } = useAchievements();

  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <SEO
        title="Başarılarım | CasinoAny"
        description="Kazandığınız rozetleri görüntüleyin ve yenilerini açın"
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Başarılarım
          </h1>
          <p className="text-muted-foreground mt-1">
            Rozetlerinizi toplayın ve özel ödüller kazanın
          </p>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Genel İlerleme</CardTitle>
            <CardDescription>
              Toplam {earnedCount} / {totalCount} rozet kazandınız
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={completionPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>%{completionPercentage.toFixed(0)} tamamlandı</span>
              <span>{totalCount - earnedCount} rozet kaldı</span>
            </div>
          </CardContent>
        </Card>

        {/* Achievements by Category */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tümü</TabsTrigger>
            {Object.entries(categoryInfo).map(([key, info]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                <info.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{info.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All Achievements */}
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Object.values(achievementsByCategory).flat().map((achievement: any) => (
                <div key={achievement.code} className="flex flex-col items-center gap-2">
                  <AchievementBadge
                    icon={achievement.icon}
                    name={achievement.name}
                    description={achievement.description}
                    color={achievement.color}
                    isEarned={achievement.isEarned}
                    earnedAt={achievement.earnedAt}
                    size="lg"
                  />
                  <div className="text-center">
                    <p className="text-sm font-medium">{achievement.name}</p>
                    {achievement.points_reward > 0 && (
                      <p className="text-xs text-muted-foreground">
                        +{achievement.points_reward} puan
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Category Tabs */}
          {Object.entries(categoryInfo).map(([key, info]) => (
            <TabsContent key={key} value={key} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <info.icon className="h-5 w-5" style={{ color: info.color }} />
                    {info.label} Rozetleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {achievementsByCategory[key]?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {achievementsByCategory[key].map((achievement: any) => (
                        <div key={achievement.code} className="flex flex-col items-center gap-2">
                          <AchievementBadge
                            icon={achievement.icon}
                            name={achievement.name}
                            description={achievement.description}
                            color={achievement.color}
                            isEarned={achievement.isEarned}
                            earnedAt={achievement.earnedAt}
                            size="lg"
                          />
                          <div className="text-center">
                            <p className="text-sm font-medium">{achievement.name}</p>
                            {achievement.points_reward > 0 && (
                              <p className="text-xs text-muted-foreground">
                                +{achievement.points_reward} puan
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Bu kategoride henüz rozet yok
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ProfileLayout>
  );
}

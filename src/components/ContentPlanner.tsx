import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, Target, Lightbulb, ArrowRight, Clock, BarChart, Sparkles, Plus, CheckCircle2, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TopicSuggestion {
  title: string;
  description: string;
  seo_score: number;
  target_audience: string;
  content_type: string;
  keywords: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  traffic_potential: 'low' | 'medium' | 'high';
  user_question: string;
  estimated_word_count: number;
  recommended_publish_time: string;
}

interface ContentGap {
  topic: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimated_search_volume: string;
  difficulty: 'easy' | 'medium' | 'hard';
  content_type: string;
}

interface CalendarItem {
  week: number;
  date: string;
  title: string;
  content_type: string;
  target_words: number;
  keywords: string[];
  goal: string;
  priority: 'high' | 'medium' | 'low';
  estimated_hours: number;
  dependencies: string[];
}

export const ContentPlanner = ({ onNavigateToBlog }: { onNavigateToBlog?: () => void }) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);
  const [topicSuggestions, setTopicSuggestions] = useState<TopicSuggestion[]>([]);
  const [contentCalendar, setContentCalendar] = useState<CalendarItem[]>([]);
  const [selectedTab, setSelectedTab] = useState('suggestions');
  const [isCreatingBlog, setIsCreatingBlog] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Fetch existing blog posts
  const { data: existingPosts } = useQuery({
    queryKey: ['blog-posts-for-planning'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('title, category, tags, created_at')
        .eq('is_published', true);
      if (error) throw error;
      return data || [];
    },
  });

  const analyzeContentGaps = async () => {
    setIsAnalyzing(true);
    try {
      toast({
        title: "📊 İçerik Analizi Başlatıldı",
        description: "Mevcut içerikler analiz ediliyor ve fırsatlar belirleniyor...",
      });

      const { data, error } = await supabase.functions.invoke('content-planner', {
        body: {
          action: 'analyze-content-gaps',
          data: {
            existingPosts: existingPosts || [],
            targetAudience: 'Bahis siteleri kullanıcıları',
            niche: 'Online bahis ve casino'
          }
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Analiz başarısız');

      const result = data.data;
      setContentGaps(result.missing_topics);

      toast({
        title: "✅ Analiz Tamamlandı!",
        description: `${result.missing_topics.length} içerik fırsatı, ${result.keyword_opportunities.length} keyword fırsatı tespit edildi!`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "İçerik analizi yapılırken bir hata oluştu";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setLoadingMessage('');
    }
  };

  const generateTopicSuggestions = async () => {
    setIsAnalyzing(true);
    setLoadingMessage('AI Konu Önerilerini Oluşturuyor Lütfen Bekleyin');
    try {
      toast({
        title: "💡 Konu Önerileri Oluşturuluyor",
        description: "AI tarafından optimize edilmiş konu önerileri hazırlanıyor...",
      });

      const { data, error } = await supabase.functions.invoke('content-planner', {
        body: {
          action: 'suggest-topics',
          data: {
            category: 'Online bahis ve casino',
            count: 15,
            siteName: 'Bahis Sitesi Karşılaştırma'
          }
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Öneri oluşturma başarısız');

      const result = data.data;
      setTopicSuggestions(result.topics);

      toast({
        title: "✨ Konu Önerileri Hazır!",
        description: `${result.topics.length} adet SEO-optimize konu önerisi oluşturuldu!`,
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Konu önerileri oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setLoadingMessage('');
    }
  };

  const generateContentCalendar = async () => {
    if (topicSuggestions.length === 0) {
      toast({
        title: "Uyarı",
        description: "Önce konu önerileri oluşturun",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setLoadingMessage('İçerik Takvimi Oluşturuluyor');
    try {
      toast({
        title: "📅 İçerik Takvimi Oluşturuluyor",
        description: "3 aylık içerik planlaması yapılıyor...",
      });

      const { data, error } = await supabase.functions.invoke('content-planner', {
        body: {
          action: 'generate-content-calendar',
          data: {
            topics: topicSuggestions.slice(0, 12).map(t => t.title),
            duration: 3,
            frequency: 'Haftada 3 içerik',
            startDate: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Takvim oluşturma başarısız');

      const result = data.data;
      setContentCalendar(result.calendar);
      setSelectedTab('calendar'); // Takvim tabına otomatik geç

      toast({
        title: "🎯 İçerik Takvimi Hazır!",
        description: `${result.calendar.length} haftalık içerik planı oluşturuldu. Toplam ${result.success_metrics.target_posts} içerik hedefi belirlendi.`,
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İçerik takvimi oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setLoadingMessage('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrafficColor = (traffic: string) => {
    switch (traffic) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const handleDeleteCalendarItem = (index: number) => {
    setContentCalendar(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "İçerik Silindi",
      description: "İçerik takvimden başarıyla kaldırıldı.",
    });
  };

  const handleCreateBlogFromTopic = async (topic: TopicSuggestion) => {
    setIsCreatingBlog(true);
    try {
      toast({
        title: "Blog Oluşturuluyor",
        description: "AI ile içerik üretiliyor, lütfen bekleyin...",
      });

      // Generate blog content using AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke('admin-ai-assistant', {
        body: {
          type: 'generate-blog',
          data: {
            topic: topic.title,
            siteName: 'Bahis Siteleri',
            targetKeywords: topic.keywords.join(', ')
          }
        }
      });

      if (aiError) throw aiError;
      if (!aiData?.success) throw new Error('Blog içeriği oluşturulamadı');

      const blogContent = aiData.data;

      // Create slug from title
      const slug = topic.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      // Save to database
      const { error: insertError } = await (supabase as any)
        .from('blog_posts')
        .insert({
          title: topic.title,
          slug: slug,
          excerpt: topic.description,
          content: blogContent.content,
          meta_title: blogContent.seoAnalysis?.suggestedTitle || topic.title,
          meta_description: blogContent.seoAnalysis?.suggestedMetaDescription || topic.description,
          meta_keywords: topic.keywords,
          category: topic.content_type,
          tags: topic.keywords,
          read_time: Math.ceil(topic.estimated_word_count / 200),
          is_published: false,
          display_order: 0
        });

      if (insertError) throw insertError;

      toast({
        title: "✅ Blog Başarıyla Oluşturuldu!",
        description: "Blog yazısı taslak olarak kaydedildi. Blog yönetim sekmesinden düzenleyebilirsiniz.",
      });

      onNavigateToBlog?.();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Blog oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBlog(false);
    }
  };

  const handleCreateBlogFromCalendar = async (item: CalendarItem) => {
    setIsCreatingBlog(true);
    try {
      toast({
        title: "Blog Oluşturuluyor",
        description: "AI ile içerik üretiliyor, lütfen bekleyin...",
      });

      // Generate blog content using AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke('admin-ai-assistant', {
        body: {
          type: 'generate-blog',
          data: {
            topic: item.title,
            siteName: 'Bahis Siteleri',
            targetKeywords: item.keywords.join(', ')
          }
        }
      });

      if (aiError) throw aiError;
      if (!aiData?.success) throw new Error('Blog içeriği oluşturulamadı');

      const blogContent = aiData.data;

      // Create slug from title
      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      // Save to database
      const { error: insertError } = await (supabase as any)
        .from('blog_posts')
        .insert({
          title: item.title,
          slug: slug,
          excerpt: `${item.content_type} - ${item.goal}`,
          content: blogContent.content,
          meta_title: blogContent.seoAnalysis?.suggestedTitle || item.title,
          meta_description: blogContent.seoAnalysis?.suggestedMetaDescription || item.title,
          meta_keywords: item.keywords,
          category: item.content_type,
          tags: item.keywords,
          read_time: Math.ceil(item.target_words / 200),
          is_published: false,
          display_order: 0
        });

      if (insertError) throw insertError;

      toast({
        title: "✅ Blog Başarıyla Oluşturuldu!",
        description: "Blog yazısı taslak olarak kaydedildi. Blog yönetim sekmesinden düzenleyebilirsiniz.",
      });

      onNavigateToBlog?.();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Blog oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBlog(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay */}
      {isAnalyzing && loadingMessage && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-96 shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">{loadingMessage}</h3>
                  <p className="text-sm text-muted-foreground">
                    Bu işlem birkaç saniye sürebilir...
                  </p>
                </div>
                <Progress className="w-full" value={undefined} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">İçerik Planlama Asistanı</h2>
          <p className="text-muted-foreground mt-1">
            AI destekli içerik stratejisi ve planlama sistemi
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={analyzeContentGaps} disabled={isAnalyzing} variant="outline">
            <BarChart className="h-4 w-4 mr-2" />
            İçerik Analizi
          </Button>
          <Button onClick={generateTopicSuggestions} disabled={isAnalyzing}>
            <Sparkles className="h-4 w-4 mr-2" />
            Konu Önerileri
          </Button>
          <Button 
            onClick={generateContentCalendar} 
            disabled={isAnalyzing || topicSuggestions.length === 0}
            variant="default"
          >
            <Calendar className="h-4 w-4 mr-2" />
            İçerik Takvimi Oluştur
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam İçerik</p>
                <p className="text-2xl font-bold">{existingPosts?.length || 0}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">İçerik Fırsatları</p>
                <p className="text-2xl font-bold">{contentGaps.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Konu Önerileri</p>
                <p className="text-2xl font-bold">{topicSuggestions.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Takvim Öğeleri</p>
                <p className="text-2xl font-bold">{contentCalendar.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">Konu Önerileri</TabsTrigger>
          <TabsTrigger value="gaps">İçerik Boşlukları</TabsTrigger>
          <TabsTrigger value="calendar">İçerik Takvimi</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {topicSuggestions.length === 0 ? (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                Henüz konu önerisi oluşturulmadı. "Konu Önerileri" butonuna tıklayarak AI destekli konu önerileri alın.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {topicSuggestions.map((topic, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        <CardDescription className="mt-2">{topic.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {topic.content_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span>SEO: {topic.seo_score}/100</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getDifficultyColor(topic.difficulty)}`} />
                          <span className="capitalize">{topic.difficulty}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${getTrafficColor(topic.traffic_potential)}`}>
                          <TrendingUp className="h-4 w-4" />
                          <span className="capitalize">{topic.traffic_potential} Trafik</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{topic.estimated_word_count} kelime</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">🎯 Hedef: {topic.user_question}</p>
                        <div className="flex flex-wrap gap-2">
                          {topic.keywords.slice(0, 5).map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">
                          Hedef Kitle: {topic.target_audience}
                        </span>
                        <Button 
                          size="sm"
                          onClick={() => handleCreateBlogFromTopic(topic)}
                          disabled={isCreatingBlog}
                        >
                          {isCreatingBlog ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Oluşturuluyor...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Blog Oluştur
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          {contentGaps.length === 0 ? (
            <Alert>
              <BarChart className="h-4 w-4" />
              <AlertDescription>
                Henüz içerik analizi yapılmadı. "İçerik Analizi" butonuna tıklayarak mevcut içeriklerinizi analiz edin ve fırsatları keşfedin.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {contentGaps.map((gap, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{gap.topic}</CardTitle>
                        <CardDescription className="mt-2">{gap.reason}</CardDescription>
                      </div>
                      <Badge variant={getPriorityColor(gap.priority)}>
                        {gap.priority === 'high' && '🔥 '}
                        {gap.priority === 'medium' && '⚡ '}
                        {gap.priority === 'low' && '📝 '}
                        {gap.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span>📊 Arama: {gap.estimated_search_volume}</span>
                        <span className={`flex items-center gap-1`}>
                          <div className={`h-2 w-2 rounded-full ${getDifficultyColor(gap.difficulty)}`} />
                          Zorluk: {gap.difficulty}
                        </span>
                        <Badge variant="outline">{gap.content_type}</Badge>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (topicSuggestions.length === 0) {
                            toast({
                              title: "Önce Konu Önerileri Oluşturun",
                              description: "İçerik takvimi için önce konu önerileri oluşturmanız gerekiyor.",
                              variant: "destructive"
                            });
                            setSelectedTab('suggestions');
                          } else {
                            generateContentCalendar();
                          }
                        }}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Planla
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          {contentCalendar.length === 0 ? (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Henüz içerik takvimi oluşturulmadı. Önce konu önerileri oluşturun, ardından "İçerik Takvimi Oluştur" butonuna tıklayın.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={generateContentCalendar} disabled={isAnalyzing}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Yeni Takvim Oluştur
                </Button>
              </div>
              <div className="grid gap-4">
                {contentCalendar.map((item, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Hafta {item.week}</Badge>
                            <span className="text-sm text-muted-foreground">{item.date}</span>
                            <Badge variant={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="secondary">{item.content_type}</Badge>
                          <span>{item.target_words} kelime</span>
                          <span>{item.estimated_hours} saat</span>
                          <span className="text-muted-foreground">🎯 {item.goal}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {item.keywords.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>

                        {item.dependencies.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            ⚠️ Bağımlılıklar: {item.dependencies.join(', ')}
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-3 border-t">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleCreateBlogFromCalendar(item)}
                            disabled={isCreatingBlog}
                          >
                            {isCreatingBlog ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Oluşturuluyor...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Blog Oluştur
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: "Düzenleme",
                                description: "İçerik düzenleme özelliği yakında eklenecek.",
                              });
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Düzenle
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteCalendarItem(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

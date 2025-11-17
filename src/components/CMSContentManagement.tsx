import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cmsContentUpdateSchema, emailSchema, urlSchema } from '@/schemas/cmsValidation';

export const CMSContentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contents, setContents] = useState<Record<string, string>>({});

  // Content keys to manage
  const contentKeys = [
    { key: 'hero_title', label: 'Hero Başlık', section: 'hero' },
    { key: 'hero_description', label: 'Hero Açıklama', section: 'hero' },
    { key: 'about_title', label: 'Hakkımızda Başlık', section: 'about' },
    { key: 'about_description', label: 'Hakkımızda İçerik', section: 'about' },
    { key: 'about_mission', label: 'Misyonumuz', section: 'about' },
    { key: 'about_vision', label: 'Vizyonumuz', section: 'about' },
    { key: 'footer_description', label: 'Footer Açıklama', section: 'footer' },
    { key: 'footer_email', label: 'Footer Email', section: 'footer' },
    { key: 'footer_telegram', label: 'Footer Telegram', section: 'footer' },
  ];

  // Fetch all CMS content
  const { data: cmsData, isLoading } = useQuery({
    queryKey: ['cms-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('setting_key', contentKeys.map(c => c.key));
      if (error) throw error;
      
      const contentMap: Record<string, string> = {};
      data?.forEach(item => {
        contentMap[item.setting_key] = item.setting_value;
      });
      setContents(contentMap);
      return contentMap;
    },
  });

  // Update content mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            setting_key: update.key,
            setting_value: update.value,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'setting_key',
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Başarılı',
        description: 'İçerik güncellendi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSaveSection = (section: string) => {
    const sectionKeys = contentKeys.filter(c => c.section === section);
    const updates: { key: string; value: string }[] = sectionKeys.map(c => ({
      key: c.key,
      value: (contents[c.key] || '').toString(),
    }));
    
    // ✅ VALIDATION FIX: Validate content before updating
    try {
      cmsContentUpdateSchema.parse(updates);
      
      // Additional validation for email and URL fields
      updates.forEach(update => {
        if (update.key.includes('email')) {
          emailSchema.parse(update.value);
        }
        if (update.key.includes('url') || update.key.includes('link')) {
          urlSchema.parse(update.value);
        }
      });
      
      updateMutation.mutate(updates);
    } catch (error: any) {
      toast({
        title: 'Validasyon Hatası',
        description: error.errors?.[0]?.message || 'Geçersiz içerik',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const sections = ['hero', 'about', 'footer'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>İçerik Yönetimi (CMS)</CardTitle>
          <CardDescription>
            Site içeriklerini buradan düzenleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hero" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="about">Hakkımızda</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
            </TabsList>

            {sections.map(section => (
              <TabsContent key={section} value={section} className="space-y-4">
                {contentKeys
                  .filter(c => c.section === section)
                  .map(content => (
                    <div key={content.key}>
                      <Label htmlFor={content.key}>{content.label}</Label>
                      <Textarea
                        id={content.key}
                        value={contents[content.key] || ''}
                        onChange={(e) => setContents({
                          ...contents,
                          [content.key]: e.target.value,
                        })}
                        rows={content.key.includes('description') || content.key.includes('mission') || content.key.includes('vision') ? 6 : 3}
                        className="mt-2"
                      />
                    </div>
                  ))}
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSaveSection(section)}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

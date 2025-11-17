import { useReducer, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { blogManagementReducer, createInitialState } from '@/reducers/blogManagementReducer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit, Eye, Plus, Save, X, Upload, Sparkles, Loader2, Calendar, Clock, Tag, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/queries/useCategoryQueries';

import { RichTextEditor } from './RichTextEditor';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  is_published: boolean;
  published_at?: string;
  view_count: number;
  read_time?: number;
  category?: string;
  category_id?: string;
  tags?: string[];
  display_order: number;
  primary_site_id?: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  category: string;
  tags: string;
  read_time: string;
  is_published: boolean;
  primary_site_id: string;
  category_id: string;
}

export const BlogManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories({ isActive: true });
  
  const [state, dispatch] = useReducer(blogManagementReducer, createInitialState());
  
  // Destructure state for easier access
  const {
    isEditing,
    editingId,
    imageFile,
    imagePreview,
    selectedSites,
    primarySiteId,
    isAiLoading,
    aiTopic,
    isPreviewOpen,
    formData,
  } = state;

  // Helper functions to maintain existing API
  const setIsEditing = useCallback((value: boolean) => {
    dispatch({ type: 'SET_EDITING', isEditing: value, editingId: value ? editingId : null });
  }, [editingId]);

  const setEditingId = useCallback((id: string | null) => {
    dispatch({ type: 'SET_EDITING', isEditing: !!id, editingId: id });
  }, []);

  const setImageFile = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch({ type: 'SET_IMAGE', file, preview: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      dispatch({ type: 'CLEAR_IMAGE' });
    }
  }, []);

  const setImagePreview = useCallback((preview: string | null) => {
    if (preview && imageFile) {
      dispatch({ type: 'SET_IMAGE', file: imageFile, preview });
    } else if (!preview) {
      dispatch({ type: 'CLEAR_IMAGE' });
    }
  }, [imageFile]);

  const setSelectedSites = useCallback((sites: string[] | ((prev: string[]) => string[])) => {
    const newSites = typeof sites === 'function' ? sites(selectedSites) : sites;
    dispatch({ type: 'SET_SELECTED_SITES', sites: newSites });
  }, [selectedSites]);

  const setPrimarySiteId = useCallback((siteId: string) => {
    dispatch({ type: 'SET_PRIMARY_SITE', siteId });
  }, []);

  const setIsAiLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_AI_LOADING', loading });
  }, []);

  const setAiTopic = useCallback((topic: string) => {
    dispatch({ type: 'SET_AI_TOPIC', topic });
  }, []);

  const setIsPreviewOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_PREVIEW_OPEN', open });
  }, []);

  const setFormData = useCallback((data: Partial<BlogFormData> | ((prev: BlogFormData) => BlogFormData)) => {
    if (typeof data === 'function') {
      dispatch({ type: 'SET_FORM_DATA', data: data(formData) });
    } else {
      dispatch({ type: 'SET_FORM_DATA', data });
    }
  }, [formData]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  // Fetch all betting sites for selection
  const { data: bettingSites } = useQuery({
    queryKey: ['betting-sites-for-blog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, logo_url')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let imageUrl = null;
      
      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, imageFile);
        
        if (uploadError) {
          // Try to create bucket if it doesn't exist
          const { error: bucketError } = await supabase.storage.createBucket('blog-images', {
            public: true,
          });
          
          if (!bucketError) {
            // Retry upload after creating bucket
            const { error: retryError } = await supabase.storage
              .from('blog-images')
              .upload(fileName, imageFile);
            if (!retryError) {
              const { data: urlData } = supabase.storage
                .from('blog-images')
                .getPublicUrl(fileName);
              imageUrl = urlData.publicUrl;
            }
          }
        } else {
          const { data: urlData } = supabase.storage
            .from('blog-images')
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }
      
      const postData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featured_image: imageUrl,
        meta_title: data.meta_title || data.title,
        meta_description: data.meta_description || data.excerpt,
        meta_keywords: data.meta_keywords ? data.meta_keywords.split(',').map(k => k.trim()) : [],
        category: data.category,
        category_id: data.category_id || null,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        read_time: parseInt(data.read_time) || 5,
        is_published: data.is_published,
        published_at: data.is_published ? new Date().toISOString() : null,
        author_id: user?.id,
        primary_site_id: data.primary_site_id || null,
      };
      
      const { data: newPost, error } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();
      
      if (error) throw error;

      // Add related sites if any selected
      if (selectedSites.length > 0 && newPost) {
        const relatedSitesData = selectedSites.map((siteId, index) => ({
          post_id: newPost.id,
          site_id: siteId,
          display_order: index,
        }));
        
        const { error: relError } = await supabase
          .from('blog_post_related_sites')
          .insert(relatedSitesData);
        
        if (relError) throw relError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({ title: 'Blog yazısı oluşturuldu' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      let imageUrl = imagePreview; // Keep existing image
      
      // Upload new image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, imageFile);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('blog-images')
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }
      
      const postData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featured_image: imageUrl,
        meta_title: data.meta_title || data.title,
        meta_description: data.meta_description || data.excerpt,
        meta_keywords: data.meta_keywords ? data.meta_keywords.split(',').map(k => k.trim()) : [],
        category: data.category,
        category_id: data.category_id || null,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        read_time: parseInt(data.read_time) || 5,
        is_published: data.is_published,
        published_at: data.is_published ? new Date().toISOString() : null,
        primary_site_id: data.primary_site_id || null,
      };
      const { error } = await supabase.from('blog_posts').update(postData).eq('id', id);
      if (error) throw error;

      // Update related sites
      // First delete existing relations
      await supabase
        .from('blog_post_related_sites')
        .delete()
        .eq('post_id', id);

      // Then add new ones if any selected
      if (selectedSites.length > 0) {
        const relatedSitesData = selectedSites.map((siteId, index) => ({
          post_id: id,
          site_id: siteId,
          display_order: index,
        }));
        
        const { error: relError } = await supabase
          .from('blog_post_related_sites')
          .insert(relatedSitesData);
        
        if (relError) throw relError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({ title: 'Blog yazısı güncellendi' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({ title: 'Blog yazısı silindi' });
    },
    onError: (error: any) => {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    },
  });

  const handleAiGenerateBlog = async () => {
    if (!aiTopic.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir konu girin",
        variant: "destructive",
      });
      return;
    }

    setIsAiLoading(true);
    try {
      toast({
        title: "🚀 AI İçerik Üretimi Başlatıldı",
        description: "4 aşamalı profesyonel içerik üretimi: Keyword araştırma → Taslak → İçerik → SEO analizi",
      });

      const { data, error } = await supabase.functions.invoke('admin-ai-assistant', {
        body: { 
          type: 'generate-blog',
          data: {
            topic: aiTopic,
            siteName: primarySiteId ? bettingSites?.find(s => s.id === primarySiteId)?.name : '',
            targetKeywords: formData.meta_keywords ? formData.meta_keywords.split(',').map(k => k.trim()) : []
          }
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Blog oluşturma başarısız');

      const blogData = data.data;
      
      // Auto-generate slug from title
      const slug = generateSlug(blogData.title);

      setFormData({
        ...formData,
        title: blogData.title,
        slug: slug,
        content: blogData.content,
        excerpt: blogData.excerpt || '',
        meta_description: blogData.meta_description || '',
        meta_keywords: blogData.meta_keywords?.join(', ') || '',
        tags: blogData.tags?.join(', ') || '',
        read_time: blogData.read_time?.toString() || '5',
        category: blogData.category || 'Genel',
        meta_title: blogData.title,
      });

      // Show detailed success message with SEO analysis
      if (blogData.seo_analysis) {
        const seo = blogData.seo_analysis;
        toast({
          title: `✨ Profesyonel İçerik Oluşturuldu!`,
          description: `${blogData.word_count} kelime | ${blogData.read_time} dk okuma | SEO: ${seo.seo_score}/100 | Okunabilirlik: ${seo.readability_score}/100`,
        });
      } else {
        toast({
          title: "Başarılı! ✅",
          description: `${blogData.word_count} kelime, ${blogData.read_time} dk okuma süresi. SEO optimizeli içerik hazır!`,
        });
      }

      setAiTopic('');
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Blog oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const handleEdit = useCallback(async (post: BlogPost) => {
    // Load related sites
    const { data: relatedSites } = await supabase
      .from('blog_post_related_sites')
      .select('site_id')
      .eq('post_id', post.id)
      .order('display_order');
    
    const relatedSiteIds = relatedSites?.map((rs: any) => rs.site_id) || [];
    
    dispatch({ type: 'LOAD_POST_DATA', post, relatedSiteIds });
    dispatch({ type: 'SET_EDITING', isEditing: true, editingId: post.id });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePreview = () => {
    if (!formData.title || !formData.content) {
      toast({ 
        title: 'Eksik Bilgi', 
        description: 'Önizleme için en az başlık ve içerik gerekli', 
        variant: 'destructive' 
      });
      return;
    }
    setIsPreviewOpen(true);
  };

  const generateSlug = (title: string) => {
    const trMap: { [key: string]: string } = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };
    return title
      .split('')
      .map(char => trMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  if (isLoading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Yönetimi</h2>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Yazı
          </Button>
        )}
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Blog Yazısı Düzenle' : 'Yeni Blog Yazısı'}</CardTitle>
          </CardHeader>
          <CardContent>
            {!editingId && (
              <div className="mb-6 p-4 border border-primary/20 rounded-lg bg-primary/5">
                <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI ile SEO-Optimized Blog Oluştur
                </Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Blog konusu girin (örn: 'Canlı bahis stratejileri 2024')"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAiGenerateBlog();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="default"
                      onClick={handleAiGenerateBlog}
                      disabled={isAiLoading || !aiTopic}
                      className="gap-2 whitespace-nowrap"
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          AI Oluştur
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 pl-1">
                    <p className="font-medium text-foreground">✨ AI otomatik oluşturacak:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>SEO-optimized başlık (55-60 karakter, anahtar kelime içeren)</li>
                      <li>1500+ kelime detaylı içerik (H2, H3 başlıklar, listeler, FAQ)</li>
                      <li>Meta açıklama ve etiketler (arama motorları için)</li>
                      <li>Özet (sosyal medya paylaşımları için)</li>
                      <li>Otomatik okuma süresi hesaplama</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      if (!editingId) {
                        // Otomatik slug oluştur (sadece yeni yazılarda)
                        setFormData({ ...formData, title: newTitle, slug: generateSlug(newTitle) });
                      } else {
                        setFormData({ ...formData, title: newTitle });
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    URL Slug * 
                    <span className="text-xs text-muted-foreground ml-2">
                      (Otomatik oluşturulur, manuel düzenlenebilir)
                    </span>
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ornek-blog-yazisi"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_image">Kapak Görseli</Label>
                <Input
                  id="featured_image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Özet *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">İçerik *</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Blog içeriğinizi buraya yazın..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Kategori</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories && categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="bahis, casino, bonus"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="read_time">Okuma Süresi (dk)</Label>
                  <Input
                    id="read_time"
                    type="number"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">SEO Ayarları</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Başlık (boş bırakılırsa başlık kullanılır)</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="60 karakter önerilir"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">{formData.meta_title.length}/60 karakter</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Açıklama (boş bırakılırsa özet kullanılır)</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={3}
                    placeholder="160 karakter önerilir"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">{formData.meta_description.length}/160 karakter</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_keywords">Meta Anahtar Kelimeler (virgülle ayırın)</Label>
                  <Input
                    id="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    placeholder="bahis siteleri, casino, bonus"
                  />
                </div>
              </div>

              {/* Primary Site Selection */}
              <div className="space-y-3 border-t pt-4">
                <Label htmlFor="primary_site">Ana Bahis Sitesi (Önemli!)</Label>
                <p className="text-sm text-muted-foreground">
                  Bu blog yazısının hangi bahis sitesi hakkında olduğunu seçin. Site detay sayfasında bu yazı gösterilecek.
                </p>
                <select
                  id="primary_site"
                  value={formData.primary_site_id}
                  onChange={(e) => setFormData({ ...formData, primary_site_id: e.target.value })}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Site Seçiniz (Opsiyonel)</option>
                  {bettingSites && bettingSites.map((site: any) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Related Betting Sites Selection */}
              <div className="space-y-3 border-t pt-4">
                <Label>İlgili Bahis Siteleri</Label>
                <p className="text-sm text-muted-foreground">
                  Bu blog yazısıyla ilgili bahis sitelerini seçin (blog detay sayfasında önerilecek)
                </p>
                {bettingSites && bettingSites.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg">
                    {bettingSites.map((site: any) => (
                      <label
                        key={site.id}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedSites.includes(site.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSites.includes(site.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSites([...selectedSites, site.id]);
                            } else {
                              setSelectedSites(selectedSites.filter((id) => id !== site.id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {site.logo_url && (
                            <img
                              src={site.logo_url}
                              alt={site.name}
                              className="w-6 h-6 object-contain"
                            />
                          )}
                          <span className="text-sm font-medium truncate">{site.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aktif bahis sitesi bulunmamaktadır.</p>
                )}
                {selectedSites.length > 0 && (
                  <p className="text-sm text-primary">
                    {selectedSites.length} site seçildi
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 border-t pt-4">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="is_published">Yayınla</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Güncelle' : 'Oluştur'}
                </Button>
                <Button type="button" variant="secondary" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Önizle
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Blog Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Blog Önizleme
            </DialogTitle>
            <DialogDescription>
              Blog yazınızın yayınlandığında nasıl görüneceğinin önizlemesi
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Preview Content - mimics BlogPost page */}
            <article className="prose prose-invert max-w-none">
              {/* Header Section */}
              <div className="mb-8 pb-6 border-b border-border">
                <h1 className="text-4xl font-bold mb-4 text-foreground">{formData.title || 'Başlık'}</h1>
                
                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(), 'dd MMMM yyyy', { locale: tr })}</span>
                  </div>
                  {formData.read_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formData.read_time} dakika okuma</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>0 görüntüleme</span>
                  </div>
                </div>
                
                {/* Tags */}
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {formData.tags.split(',').map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Category */}
                {formData.category && (
                  <div className="mt-3">
                    <Badge variant="outline">{formData.category}</Badge>
                  </div>
                )}
              </div>
              
              {/* Featured Image */}
              {imagePreview && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt={formData.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              {/* Excerpt */}
              {formData.excerpt && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <p className="text-lg italic text-foreground">{formData.excerpt}</p>
                </div>
              )}
              
              {/* Content */}
              <div 
                className="prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-blockquote:text-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-muted-foreground">İçerik henüz eklenmedi...</p>' }}
              />
            </article>
            
            {/* SEO Meta Preview */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                SEO Önizleme
              </h3>
              
              {/* Google Search Result Preview */}
              <div className="bg-card p-4 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">
                  {window.location.origin}/blog/{formData.slug || 'blog-basligi'}
                </div>
                <div className="text-xl text-blue-500 hover:underline mb-1">
                  {formData.meta_title || formData.title || 'Blog Başlığı'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formData.meta_description || formData.excerpt || 'Meta açıklama henüz eklenmedi...'}
                </div>
              </div>
              
              {/* Meta Keywords */}
              {formData.meta_keywords && (
                <div className="text-sm">
                  <span className="font-medium text-foreground">Anahtar Kelimeler: </span>
                  <span className="text-muted-foreground">{formData.meta_keywords}</span>
                </div>
              )}
              
              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">Yayın Durumu:</span>
                {formData.is_published ? (
                  <Badge variant="default">Yayınlanacak</Badge>
                ) : (
                  <Badge variant="secondary">Taslak Olarak Kaydedilecek</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {posts?.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    {post.is_published ? (
                      <Badge variant="default">Yayında</Badge>
                    ) : (
                      <Badge variant="secondary">Taslak</Badge>
                    )}
                    {post.category && <Badge variant="outline">{post.category}</Badge>}
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.view_count} görüntüleme
                    </span>
                    {post.read_time && <span>{post.read_time} dk okuma</span>}
                    {post.tags && post.tags.length > 0 && (
                      <span>Etiketler: {post.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      // Load post data for preview
                      setFormData({
                        title: post.title,
                        slug: post.slug,
                        excerpt: post.excerpt,
                        content: post.content,
                        meta_title: post.meta_title || '',
                        meta_description: post.meta_description || '',
                        meta_keywords: post.meta_keywords?.join(', ') || '',
                        category: post.category || '',
                        tags: post.tags?.join(', ') || '',
                        read_time: post.read_time?.toString() || '5',
                        is_published: post.is_published,
                        primary_site_id: post.primary_site_id || '',
                        category_id: post.category_id || '',
                      });
                      setImagePreview(post.featured_image || null);
                      setIsPreviewOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
                        deleteMutation.mutate(post.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

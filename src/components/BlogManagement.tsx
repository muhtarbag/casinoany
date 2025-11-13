import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, Plus, Save, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
}

export const BlogManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [primarySiteId, setPrimarySiteId] = useState<string>('');
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    category: '',
    tags: '',
    read_time: '5',
    is_published: false,
    primary_site_id: '',
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown) as BlogPost[];
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
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        read_time: parseInt(data.read_time) || 5,
        is_published: data.is_published,
        published_at: data.is_published ? new Date().toISOString() : null,
        author_id: user?.id,
        primary_site_id: data.primary_site_id || null,
      };
      
      const { data: newPost, error } = await supabase
        .from('blog_posts' as any)
        .insert([postData])
        .select()
        .single();
      
      if (error) throw error;

      // Add related sites if any selected
      if (selectedSites.length > 0 && newPost) {
        const relatedSitesData = selectedSites.map((siteId, index) => ({
          post_id: (newPost as any).id,
          site_id: siteId,
          display_order: index,
        }));
        
        const { error: relError } = await (supabase as any)
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
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        read_time: parseInt(data.read_time) || 5,
        is_published: data.is_published,
        published_at: data.is_published ? new Date().toISOString() : null,
        primary_site_id: data.primary_site_id || null,
      };
      const { error } = await supabase.from('blog_posts' as any).update(postData).eq('id', id);
      if (error) throw error;

      // Update related sites
      // First delete existing relations
      await (supabase as any)
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
        
        const { error: relError } = await (supabase as any)
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
      const { error } = await supabase.from('blog_posts' as any).delete().eq('id', id);
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

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      category: '',
      tags: '',
      read_time: '5',
      is_published: false,
      primary_site_id: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setSelectedSites([]);
    setPrimarySiteId('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = async (post: BlogPost) => {
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
    });
    setImagePreview(post.featured_image || null);
    setImageFile(null);
    setPrimarySiteId(post.primary_site_id || '');
    
    // Load related sites
    const { data: relatedSites } = await (supabase as any)
      .from('blog_post_related_sites')
      .select('site_id')
      .eq('post_id', post.id)
      .order('display_order');
    
    if (relatedSites) {
      setSelectedSites(relatedSites.map((r: any) => r.site_id));
    }
    
    setEditingId(post.id);
    setIsEditing(true);
  };

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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (!editingId) {
                        setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Bahis İpuçları"
                  />
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
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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

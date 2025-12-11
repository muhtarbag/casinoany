
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, X, Save, Eye, Link as LinkIcon, Calendar } from 'lucide-react';
import { RichTextEditor } from '@/components/BlogManagement'; // Assuming this is kept or moved, we'll need to check imports

// We need to import RichTextEditor properly. 
// If it was internal to BlogManagement, we might need to extract it too or import from where it is.
// Looking at original file: import { RichTextEditor } from './RichTextEditor';
import { RichTextEditor } from '@/components/RichTextEditor';

interface BlogFormProps {
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    editingId: string | null;
    imagePreview: string | null;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    resetImage: () => void;
    categories: any[];
    bettingSites: any[];
    selectedSites: string[];
    setSelectedSites: (sites: string[]) => void;
    aiTopic: string;
    setAiTopic: (topic: string) => void;
    handleAiGenerateBlog: () => void;
    isAiLoading: boolean;
    isPending: boolean;
    handlePreview: () => void;
    handleGenerateInternalLinks: () => void;
    isGeneratingLinks: boolean;
    resetForm: () => void;
}

export function BlogForm({
    formData,
    setFormData,
    onSubmit,
    editingId,
    imagePreview,
    handleImageChange,
    resetImage,
    categories,
    bettingSites,
    selectedSites,
    setSelectedSites,
    aiTopic,
    setAiTopic,
    handleAiGenerateBlog,
    isAiLoading,
    isPending,
    handlePreview,
    handleGenerateInternalLinks,
    isGeneratingLinks,
    resetForm
}: BlogFormProps) {

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

    return (
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
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Başlık *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => {
                                    const newTitle = e.target.value;
                                    if (!editingId) {
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
                                    onClick={resetImage}
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
                                placeholder="120 karakter önerilir"
                                maxLength={120}
                            />
                            <p className="text-xs text-muted-foreground">{formData.meta_title?.length || 0}/120 karakter</p>
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
                            <p className="text-xs text-muted-foreground">{formData.meta_description?.length || 0}/160 karakter</p>
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
                                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selectedSites.includes(site.id)
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
                            onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked, scheduled_publish_at: checked ? '' : formData.scheduled_publish_at })}
                        />
                        <Label htmlFor="is_published">Hemen Yayınla</Label>
                    </div>

                    {!formData.is_published && (
                        <div className="space-y-2">
                            <Label htmlFor="scheduled_publish_at" className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Zamanlanmış Yayınlama Tarihi (İsteğe Bağlı)
                            </Label>
                            <Input
                                id="scheduled_publish_at"
                                type="datetime-local"
                                value={formData.scheduled_publish_at}
                                onChange={(e) => setFormData({ ...formData, scheduled_publish_at: e.target.value })}
                                placeholder="Belirli bir tarihte yayınlamak için seçin"
                            />
                            <p className="text-sm text-muted-foreground">
                                Boş bırakırsanız taslak olarak kalır. Tarih seçerseniz o tarihte otomatik yayınlanır.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending}>
                            <Save className="w-4 h-4 mr-2" />
                            {editingId ? 'Güncelle' : 'Oluştur'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={handlePreview}>
                            <Eye className="w-4 h-4 mr-2" />
                            Önizle
                        </Button>
                        {editingId && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleGenerateInternalLinks}
                                disabled={isGeneratingLinks}
                            >
                                {isGeneratingLinks ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Link Oluşturuluyor...
                                    </>
                                ) : (
                                    <>
                                        <LinkIcon className="w-4 h-4 mr-2" />
                                        AI Internal Link Öner
                                    </>
                                )}
                            </Button>
                        )}
                        <Button type="button" variant="outline" onClick={resetForm}>
                            <X className="w-4 h-4 mr-2" />
                            İptal
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

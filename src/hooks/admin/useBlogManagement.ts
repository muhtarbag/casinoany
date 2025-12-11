
import { useReducer, useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { blogManagementReducer, createInitialState } from '@/reducers/blogManagementReducer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/queries/useCategoryQueries';
import { generateInternalLinks } from '@/hooks/useInternalLinking';

export interface BlogFormData {
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
    scheduled_publish_at: string;
    primary_site_id: string;
    category_id: string;
}

export interface BlogPost {
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
    scheduled_publish_at?: string;
    view_count: number;
    read_time?: number;
    category?: string;
    category_id?: string;
    tags?: string[];
    display_order: number;
    primary_site_id?: string;
}

export function useBlogManagement() {
    const { toast } = useToast();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { data: categories } = useCategories({ isActive: true });
    const [isGeneratingLinks, setIsGeneratingLinks] = useState(false);

    const [state, dispatch] = useReducer(blogManagementReducer, createInitialState());

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

    // Optimized Setters
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
        // Handling function update or direct value to match React setState signature
        if (typeof sites === 'function') {
            // We can't easily access previous state in reducer dispatch without thunk, so we rely on current state
            const newSites = sites(selectedSites);
            dispatch({ type: 'SET_SELECTED_SITES', sites: newSites });
        } else {
            dispatch({ type: 'SET_SELECTED_SITES', sites });
        }
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

    const resetForm = useCallback(() => {
        dispatch({ type: 'RESET_FORM' });
    }, []);

    // Queries
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

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            let imageUrl = null;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('blog-images')
                    .upload(fileName, imageFile);

                if (uploadError) {
                    const { error: bucketError } = await supabase.storage.createBucket('blog-images', { public: true });
                    if (!bucketError) {
                        await supabase.storage.from('blog-images').upload(fileName, imageFile);
                    }
                }

                const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
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
                scheduled_publish_at: !data.is_published && data.scheduled_publish_at ? data.scheduled_publish_at : null,
                author_id: user?.id,
                primary_site_id: data.primary_site_id || null,
            };

            const { data: newPost, error } = await supabase
                .from('blog_posts')
                .insert([postData])
                .select()
                .single();

            if (error) throw error;

            if (selectedSites.length > 0 && newPost) {
                const relatedSitesData = selectedSites.map((siteId, index) => ({
                    post_id: newPost.id,
                    site_id: siteId,
                    display_order: index,
                }));
                await supabase.from('blog_post_related_sites').insert(relatedSitesData);
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
            let imageUrl = imagePreview;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, imageFile);
                if (!uploadError) {
                    const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);
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
                scheduled_publish_at: !data.is_published && data.scheduled_publish_at ? data.scheduled_publish_at : null,
                primary_site_id: data.primary_site_id || null,
            };

            const { error } = await supabase.from('blog_posts').update(postData).eq('id', id);
            if (error) throw error;

            await supabase.from('blog_post_related_sites').delete().eq('post_id', id);
            if (selectedSites.length > 0) {
                const relatedSitesData = selectedSites.map((siteId, index) => ({
                    post_id: id,
                    site_id: siteId,
                    display_order: index,
                }));
                await supabase.from('blog_post_related_sites').insert(relatedSitesData);
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

    // Load Post Data Logic
    const handleEdit = useCallback(async (post: BlogPost) => {
        const { data: relatedSites } = await supabase
            .from('blog_post_related_sites')
            .select('site_id')
            .eq('post_id', post.id)
            .order('display_order');

        const relatedSiteIds = relatedSites?.map((rs: any) => rs.site_id) || [];

        dispatch({ type: 'LOAD_POST_DATA', post, relatedSiteIds });
        dispatch({ type: 'SET_EDITING', isEditing: true, editingId: post.id });
    }, []);

    // AI Logic
    const handleAiGenerateBlog = async () => {
        if (!aiTopic.trim()) {
            toast({ title: "Hata", description: "Lütfen bir konu girin", variant: "destructive" });
            return;
        }

        setIsAiLoading(true);
        try {
            toast({
                title: "🚀 AI İçerik Üretimi Başlatıldı",
                description: "İçerik üretiliyor...",
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
            const generateSlug = (title: string) => {
                const trMap: { [key: string]: string } = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
                return title.split('').map(char => trMap[char] || char).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            };

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

            toast({ title: "Başarılı!", description: "AI içerik oluşturuldu." });
            setAiTopic('');
        } catch (error: any) {
            toast({ title: "Hata", description: error.message, variant: "destructive" });
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleGenerateInternalLinks = async () => {
        if (!editingId || !formData.slug || !formData.content) {
            toast({ title: 'Eksik Bilgi', description: 'Internal link için önce kaydedin', variant: 'destructive' });
            return;
        }

        setIsGeneratingLinks(true);
        try {
            await generateInternalLinks(`/${formData.slug}`, 'blog', formData.content, 5);
            toast({ title: 'Başarılı', description: 'Internal linkler oluşturuldu.' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Hata', description: 'Internal link hatası', variant: 'destructive' });
        } finally {
            setIsGeneratingLinks(false);
        }
    };

    return {
        // State
        isEditing, editingId, imageFile, imagePreview, selectedSites,
        primarySiteId, isAiLoading, aiTopic, isPreviewOpen, formData,
        isGeneratingLinks,

        // Setters
        setIsEditing, setEditingId, setImageFile, setImagePreview, setSelectedSites,
        setPrimarySiteId, setIsAiLoading, setAiTopic, setIsPreviewOpen,
        setFormData, resetForm,

        // Data
        posts, isLoading, categories, bettingSites,

        // Actions
        createMutation, updateMutation, deleteMutation,
        handleEdit, handleAiGenerateBlog, handleGenerateInternalLinks
    };
}

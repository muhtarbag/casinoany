
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useBlogManagement } from '@/hooks/admin/useBlogManagement';
import { BlogList } from '@/components/admin/blog/BlogList';
import { BlogForm } from '@/components/admin/blog/BlogForm';
import { BlogPreviewDialog } from '@/components/admin/blog/BlogPreviewDialog';
import { Toaster } from '@/components/ui/toaster';

export const BlogManagement = () => {
  const {
    // State
    isEditing, editingId, imagePreview, selectedSites,
    isAiLoading, aiTopic, isPreviewOpen, formData,
    isGeneratingLinks,

    // Setters
    setIsEditing, setImageFile, setImagePreview, setSelectedSites,
    setAiTopic, setIsPreviewOpen,
    setFormData, resetForm,

    // Data
    posts, isLoading, categories, bettingSites,

    // Actions
    createMutation, updateMutation, deleteMutation,
    handleEdit, handleAiGenerateBlog, handleGenerateInternalLinks
  } = useBlogManagement();

  if (isLoading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const setFormDataWrapper = (data: any) => {
    // Handling function update or direct value to match the hook's expectation
    // If the child component passes a direct object, wrap it or pass as is.
    // The hook expects: Partial<BlogFormData> | ((prev: BlogFormData) => BlogFormData)
    // BlogForm sets: { ...formData, ... } usually
    setFormData(data);
  };

  // Prepare post data for preview which expects the same structure as formData
  const getPreviewFormData = () => {
    return {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      read_time: formData.read_time,
      tags: formData.tags,
      category: formData.category, // This might be missing in formData if only ID is stored, check hook
      // In hook, we set category name when loading post, but if creating new, we might need to find it from categories list
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      meta_keywords: formData.meta_keywords,
      is_published: formData.is_published
    };
  };

  // Helper to sync category name for preview if only ID is set
  const previewData = getPreviewFormData();
  if (formData.category_id && !previewData.category && categories) {
    const cat = categories.find((c: any) => c.id === formData.category_id);
    if (cat) previewData.category = cat.name;
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

      {isEditing ? (
        <BlogForm
          formData={formData}
          setFormData={setFormDataWrapper}
          onSubmit={handleFormSubmit}
          editingId={editingId}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          resetImage={() => { setImageFile(null); setImagePreview(null); }}
          categories={categories || []}
          bettingSites={bettingSites || []}
          selectedSites={selectedSites}
          setSelectedSites={setSelectedSites}
          aiTopic={aiTopic}
          setAiTopic={setAiTopic}
          handleAiGenerateBlog={handleAiGenerateBlog}
          isAiLoading={isAiLoading}
          isPending={createMutation.isPending || updateMutation.isPending}
          handlePreview={() => setIsPreviewOpen(true)}
          handleGenerateInternalLinks={handleGenerateInternalLinks}
          isGeneratingLinks={isGeneratingLinks}
          resetForm={resetForm}
        />
      ) : (
        <BlogList
          posts={posts || []}
          onEdit={handleEdit}
          onPreview={(post) => {
            // We need to load post into form data to preview it, essentially same as edit but readonly?
            // Or just pass post data to preview dialog.
            // The original code used setFormData to load post into state then opened preview.
            // Let's implement onPreview to load data then open dialog, but 'onEdit' already loads data.
            // For purely previewing from list without editing state, we might need a separate state or just reuse load logic.
            // Original: setFormData({...}), setIsPreviewOpen(true).

            // Quick fix: reuse handleEdit to load state, but don't set isEditing to true if we just want preview?
            // Actually original code set isPreviewOpen TRUE and loaded data. 
            // Let's manually load data into formData for preview
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
          onDelete={(id) => {
            if (confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
              deleteMutation.mutate(id);
            }
          }}
        />
      )}

      <BlogPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        formData={previewData}
        imagePreview={imagePreview}
      />

      <Toaster />
    </div>
  );
};

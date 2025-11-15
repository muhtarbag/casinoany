import { useState } from 'react';
import { Plus, Grip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryList } from './CategoryList';
import { CategoryForm } from './CategoryForm';
import { useCategoriesWithStats } from '@/hooks/queries/useCategoryQueries';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Category } from '@/hooks/queries/useCategoryQueries';

export function CategoryManagement() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: categories, isLoading } = useCategoriesWithStats();

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Site kategorilerini yönetin ve düzenleyin
          </p>
        </div>
        <Button onClick={handleAdd} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kategori
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kategoriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories?.filter((c) => c.is_active).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İlişkili Siteler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories?.reduce((sum, c) => sum + c.site_count, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Form (Add/Edit) */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
            </CardTitle>
            <CardDescription>
              Kategori bilgilerini doldurun. Slug otomatik oluşturulacaktır.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryForm
              category={editingCategory}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </CardContent>
        </Card>
      )}

      {/* Category List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kategoriler</CardTitle>
              <CardDescription>
                Sürükle-bırak ile sıralama yapabilirsiniz
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Grip className="h-4 w-4" />
              <span>Sürükle</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CategoryList
            categories={categories || []}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>
    </div>
  );
}

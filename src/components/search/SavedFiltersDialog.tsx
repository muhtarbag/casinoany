import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useSavedFilters, SavedFilter } from '@/hooks/useSavedFilters';
import { Save, Trash2, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SavedFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: string;
  currentFilters: Record<string, any>;
  onApplyFilter: (filters: Record<string, any>) => void;
}

export function SavedFiltersDialog({
  open,
  onOpenChange,
  context,
  currentFilters,
  onApplyFilter,
}: SavedFiltersDialogProps) {
  const { savedFilters, saveFilter, deleteFilter } = useSavedFilters(context);
  const [filterName, setFilterName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCurrentFilter = () => {
    if (!filterName.trim()) return;
    
    setIsSaving(true);
    saveFilter(filterName, currentFilters);
    setFilterName('');
    setIsSaving(false);
  };

  const handleApplyFilter = (filter: SavedFilter) => {
    onApplyFilter(filter.filters);
    onOpenChange(false);
  };

  const hasActiveFilters = Object.values(currentFilters).some(v => v !== '' && v !== null && v !== undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Kaydedilmiş Filtreler
          </DialogTitle>
          <DialogDescription>
            Sık kullandığınız filtreleri kaydedin ve hızlıca uygulayın
          </DialogDescription>
        </DialogHeader>

        {hasActiveFilters && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <Label>Mevcut Filtreyi Kaydet</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Filtre adı..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveCurrentFilter()}
              />
              <Button onClick={handleSaveCurrentFilter} disabled={!filterName.trim() || isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
            </div>
          </div>
        )}

        <ScrollArea className="h-[400px] pr-4">
          {savedFilters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Henüz kaydedilmiş filtre yok</p>
              <p className="text-sm mt-2">Filtreleri ayarlayıp kaydedin</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{filter.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {Object.keys(filter.filters).length} filtre
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(filter.createdAt), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyFilter(filter)}
                    >
                      Uygula
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFilter(filter.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

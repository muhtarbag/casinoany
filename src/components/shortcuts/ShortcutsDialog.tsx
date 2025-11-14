import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';
import { getShortcutText } from '@/hooks/useKeyboardShortcuts';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  category: string;
}

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { key: 'K', ctrl: true, description: 'Arama aç', category: 'Navigasyon' },
  { key: 'N', ctrl: true, description: 'Yeni site ekle', category: 'Navigasyon' },
  { key: 'Escape', description: 'Dialog/Modal kapat', category: 'Navigasyon' },
  
  // Actions
  { key: 'S', ctrl: true, description: 'Formu kaydet', category: 'İşlemler' },
  { key: 'Enter', ctrl: true, description: 'Formu gönder', category: 'İşlemler' },
  
  // Selection
  { key: 'A', ctrl: true, description: 'Tümünü seç', category: 'Seçim' },
  { key: 'Escape', description: 'Seçimi temizle', category: 'Seçim' },
  
  // Utility
  { key: '/', description: 'Kısayolları göster', category: 'Yardımcı' },
  { key: 'R', ctrl: true, shift: true, description: 'Cache temizle', category: 'Yardımcı' },
];

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Klavye Kısayolları
          </DialogTitle>
          <DialogDescription>
            Admin panelinde kullanabileceğiniz klavye kısayolları
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map(category => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {getShortcutText({
                          key: shortcut.key,
                          ctrl: shortcut.ctrl,
                          shift: shortcut.shift,
                          alt: shortcut.alt,
                          meta: shortcut.meta,
                          handler: () => {}, // Dummy handler for type compatibility
                        })}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-info/10 border border-info/20">
          <p className="text-sm text-info-foreground">
            <strong>İpucu:</strong> Çoğu kısayol Mac'te ⌘ (Command), Windows/Linux'ta Ctrl tuşu ile çalışır.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

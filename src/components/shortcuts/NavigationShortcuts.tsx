import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ShortcutsDialog } from './ShortcutsDialog';

interface ShortcutConfig {
  key: string;
  route: string;
  label: string;
}

const shortcuts: ShortcutConfig[] = [
  { key: 'd', route: '/admin/dashboard', label: 'Dashboard' },
  { key: 's', route: '/admin/sites', label: 'Site Yönetimi' },
  { key: 'r', route: '/admin/reviews', label: 'Yorumlar' },
  { key: 'b', route: '/admin/blog/posts', label: 'Blog' },
  { key: 'a', route: '/admin/finance/affiliate', label: 'Affiliate' },
  { key: 'p', route: '/admin/system/performance', label: 'Performans' },
  { key: 'l', route: '/admin/analytics/realtime', label: 'Canlı Takip' },
  { key: 'c', route: '/admin/content/casino', label: 'Casino İçerik' },
  { key: 'y', route: '/admin/analytics', label: 'Analytics' },
];

export function NavigationShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [gPressed, setGPressed] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // ? = Show shortcuts dialog
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // Reset on escape
      if (e.key === 'Escape') {
        setGPressed(false);
        clearTimeout(timeout);
        return;
      }

      // Ctrl/Cmd + K = Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toast.info('Arama özelliği yakında eklenecek');
        return;
      }

      // Ctrl/Cmd + N = New (context-aware)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const path = location.pathname;
        
        if (path.includes('/sites')) {
          toast.success('Yeni site ekleme formu açılıyor');
        } else if (path.includes('/blog')) {
          toast.success('Yeni blog yazısı oluşturuluyor');
        } else if (path.includes('/reviews')) {
          toast.success('Yeni yorum ekleniyor');
        } else {
          toast.info('Bu sayfada yeni öğe oluşturulamaz');
        }
        return;
      }

      // Ctrl/Cmd + Shift + R = Clear cache
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        localStorage.clear();
        toast.success('Cache temizlendi, sayfa yenileniyor...');
        setTimeout(() => window.location.reload(), 1000);
        return;
      }

      // First key: 'g'
      if (e.key === 'g' && !gPressed) {
        e.preventDefault();
        setGPressed(true);
        
        toast.info('Navigasyon kısayolu bekleniyor... (iptal için ESC)', {
          duration: 2000,
        });

        timeout = setTimeout(() => {
          setGPressed(false);
        }, 2000);
        return;
      }

      // Second key: navigation target
      if (gPressed) {
        const shortcut = shortcuts.find(s => s.key === e.key);
        if (shortcut) {
          navigate(shortcut.route);
          toast.success(`${shortcut.label} sayfasına yönlendiriliyorsunuz`);
        }
        setGPressed(false);
        clearTimeout(timeout);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [navigate, location, gPressed]);

  return <ShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />;
}

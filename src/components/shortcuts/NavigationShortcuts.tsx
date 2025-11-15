import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface ShortcutConfig {
  key: string;
  route: string;
  label: string;
}

const shortcuts: ShortcutConfig[] = [
  { key: 'd', route: '/admin/dashboard', label: 'Dashboard' },
  { key: 'l', route: '/admin/analytics/realtime', label: 'Canlı Takip' },
  { key: 's', route: '/admin/sites', label: 'Site Yönetimi' },
  { key: 'c', route: '/admin/content/casino', label: 'Casino İçerik' },
  { key: 'b', route: '/admin/blog', label: 'Blog' },
  { key: 'a', route: '/admin/finance/affiliate', label: 'Affiliate' },
  { key: 'r', route: '/admin/reviews', label: 'Yorumlar' },
  { key: 'y', route: '/admin/analytics', label: 'Analytics' },
];

export function NavigationShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let gPressed = false;
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Reset on escape
      if (e.key === 'Escape') {
        gPressed = false;
        clearTimeout(timeout);
        return;
      }

      // Ignore if in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // First key: 'g'
      if (e.key === 'g' && !gPressed) {
        gPressed = true;
        
        // Show hint toast
        toast({
          title: '⌨️ Navigation Mode',
          description: 'Press a key: d(Dashboard), s(Sites), r(Reviews), b(Blog)...',
          duration: 2000,
        });

        // Reset after 2 seconds
        timeout = setTimeout(() => {
          gPressed = false;
        }, 2000);
        return;
      }

      // Second key: navigation target
      if (gPressed) {
        const shortcut = shortcuts.find(s => s.key === e.key);
        if (shortcut) {
          navigate(shortcut.route);
          toast({
            title: `📍 ${shortcut.label}`,
            description: `Shortcut: g → ${e.key}`,
            duration: 1500,
          });
        }
        gPressed = false;
        clearTimeout(timeout);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return null; // No UI, just keyboard listener
}

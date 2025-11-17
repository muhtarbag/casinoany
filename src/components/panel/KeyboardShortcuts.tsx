import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  const shortcuts = [
    { keys: ['g', 'd'], description: 'Dashboard\'a git' },
    { keys: ['g', 'c'], description: 'Şikayetlere git' },
    { keys: ['g', 'r'], description: 'Yorumlara git' },
    { keys: ['g', 's'], description: 'Site Bilgilerine git' },
    { keys: ['?'], description: 'Kısayolları göster' },
    { keys: ['Esc'], description: 'İletişim kutusunu kapat' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Klavye Kısayolları</DialogTitle>
          <DialogDescription>
            Daha hızlı gezinmek için bu kısayolları kullanabilirsiniz
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 mt-4">
          {shortcuts.map((shortcut, index) => (
            <Card key={index} className="p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, i) => (
                  <Kbd key={i}>{key}</Kbd>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useGlobalKeyboardShortcuts(siteId?: string) {
  const navigate = useNavigate();

  useKeyboardShortcuts([
    {
      key: 'd',
      handler: () => {
        if (siteId) {
          navigate('/panel/site-management', { state: { siteId, activeTab: 'dashboard' } });
        }
      },
      description: 'Dashboard\'a git',
    },
    {
      key: 'c',
      handler: () => {
        if (siteId) {
          navigate('/panel/site-management', { state: { siteId, activeTab: 'complaints' } });
        }
      },
      description: 'Şikayetlere git',
    },
    {
      key: 'r',
      handler: () => {
        if (siteId) {
          navigate('/panel/site-management', { state: { siteId, activeTab: 'reviews' } });
        }
      },
      description: 'Yorumlara git',
    },
    {
      key: 's',
      handler: () => {
        if (siteId) {
          navigate('/panel/site-management', { state: { siteId, activeTab: 'info' } });
        }
      },
      description: 'Site Bilgilerine git',
    },
  ]);
}

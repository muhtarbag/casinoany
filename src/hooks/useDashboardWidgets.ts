import { useState, useEffect } from 'react';

export interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'quick-action' | 'recent-activity';
  title: string;
  size: 'small' | 'medium' | 'large';
  order: number;
  visible: boolean;
  data?: any;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'sites-count', type: 'stats', title: 'Toplam Site', size: 'small', order: 0, visible: true },
  { id: 'active-sites', type: 'stats', title: 'Aktif Siteler', size: 'small', order: 1, visible: true },
  { id: 'total-views', type: 'stats', title: 'Toplam Görüntülenme', size: 'small', order: 2, visible: true },
  { id: 'total-clicks', type: 'stats', title: 'Toplam Tıklama', size: 'small', order: 3, visible: true },
  { id: 'total-revenue', type: 'stats', title: 'Toplam Gelir', size: 'small', order: 4, visible: true },
  { id: 'conversion-rate', type: 'stats', title: 'Dönüşüm Oranı', size: 'small', order: 5, visible: true },
  { id: 'trend-analysis', type: 'stats', title: 'Trend Analizi', size: 'small', order: 6, visible: true },
  { id: 'recent-changes', type: 'recent-activity', title: 'Son Değişiklikler', size: 'medium', order: 7, visible: true },
  { id: 'quick-actions', type: 'quick-action', title: 'Hızlı İşlemler', size: 'medium', order: 8, visible: true },
];

const STORAGE_KEY = 'dashboard-widgets';

export function useDashboardWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const reorderWidgets = (newOrder: Widget[]) => {
    const updated = newOrder.map((widget, index) => ({
      ...widget,
      order: index,
    }));
    setWidgets(updated);
  };

  const toggleWidget = (id: string) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, visible: !w.visible } : w
    ));
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  return {
    widgets: widgets.sort((a, b) => a.order - b.order),
    reorderWidgets,
    toggleWidget,
    resetWidgets,
  };
}

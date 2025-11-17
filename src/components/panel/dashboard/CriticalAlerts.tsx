import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  MessageSquare, 
  TrendingDown, 
  Clock,
  ChevronRight
} from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  action: string;
  actionLabel: string;
  priority: number;
}

interface CriticalAlertsProps {
  alerts: AlertItem[];
  onActionClick: (action: string) => void;
}

export const CriticalAlerts = ({ alerts, onActionClick }: CriticalAlertsProps) => {
  const isMobile = useIsMobile();
  if (alerts.length === 0) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <Clock className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  // Sort by priority and show max 3
  const topAlerts = alerts.sort((a, b) => b.priority - a.priority).slice(0, 3);

  return (
    <div className="space-y-3">
      {topAlerts.map((alert) => (
        <Alert 
          key={alert.id} 
          variant={getAlertVariant(alert.type)}
          className="border-l-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {getAlertIcon(alert.type)}
              <div className="space-y-1 flex-1">
                <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
                <AlertDescription className="text-xs">{alert.description}</AlertDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant={alert.type === 'error' ? 'default' : 'outline'}
              onClick={() => onActionClick(alert.action)}
              className="gap-1 shrink-0"
            >
              {alert.actionLabel}
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};

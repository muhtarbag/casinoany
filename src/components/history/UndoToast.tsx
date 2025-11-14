import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UndoToastProps {
  onUndo: () => void;
  message: string;
}

export function showUndoToast({ onUndo, message }: UndoToastProps) {
  const { dismiss } = toast({
    title: message,
    description: (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onUndo();
          dismiss();
        }}
        className="mt-2"
      >
        <Undo2 className="w-4 h-4 mr-2" />
        Geri Al
      </Button>
    ),
    duration: 8000, // 8 seconds to undo
  });

  return dismiss;
}

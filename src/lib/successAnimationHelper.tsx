import { toast as sonnerToast } from 'sonner';
import { SuccessAnimation } from '@/components/feedback/SuccessAnimation';

/**
 * Show a success toast with animation
 * Usage: showSuccessAnimation('Site başarıyla eklendi!')
 */
export function showSuccessAnimation(message: string, duration = 3000) {
  sonnerToast.custom(
    (t) => (
      <div className="bg-background border rounded-lg shadow-lg p-4">
        <SuccessAnimation 
          message={message}
          onComplete={() => sonnerToast.dismiss(t)}
        />
      </div>
    ),
    {
      duration,
      position: 'top-center',
    }
  );
}

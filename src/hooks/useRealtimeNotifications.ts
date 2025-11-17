import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeNotificationsProps {
  siteId: string;
  enabled?: boolean;
}

export function useRealtimeNotifications({
  siteId,
  enabled = true,
}: UseRealtimeNotificationsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled || !siteId) return;

    // ✅ FIX: Prevent memory leaks with mounted flag
    let mounted = true;
    const queryClientRef = queryClient;

    // Subscribe to new complaints
    const complaintsChannel = supabase
      .channel('new-complaints')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'site_complaints',
          filter: `site_id=eq.${siteId}`,
        },
        (payload) => {
          if (!mounted) return; // ✅ Prevent state update on unmounted component
          
          // Realtime complaint notification
          
          queryClientRef.invalidateQueries({ queryKey: ['site-complaints', siteId] });
          queryClientRef.invalidateQueries({ queryKey: ['site-activity-feed', siteId] });
          
          const complaint = payload.new as any;
          if (mounted) {
            toast({
              title: '🔔 Yeni Şikayet',
              description: `${complaint.title}`,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to new reviews
    const reviewsChannel = supabase
      .channel('new-reviews')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'site_reviews',
          filter: `site_id=eq.${siteId}`,
        },
        (payload) => {
          if (!mounted) return; // ✅ Prevent state update on unmounted component
          
          // Realtime review notification
          
          queryClientRef.invalidateQueries({ queryKey: ['site-reviews', siteId] });
          queryClientRef.invalidateQueries({ queryKey: ['site-activity-feed', siteId] });
          
          const review = payload.new as any;
          if (review.is_approved && mounted) {
            toast({
              title: '⭐ Yeni Değerlendirme',
              description: `${review.rating} yıldız aldınız!`,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to complaint responses
    const responsesChannel = supabase
      .channel('complaint-responses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaint_responses',
        },
        (payload) => {
          if (!mounted) return; // ✅ Prevent state update on unmounted component
          
          // Realtime complaint response notification
          queryClientRef.invalidateQueries({ queryKey: ['site-complaints', siteId] });
        }
      )
      .subscribe();

    return () => {
      mounted = false; // ✅ Set flag before cleanup
      
      // ✅ FIX: Properly unsubscribe before removing channels
      complaintsChannel.unsubscribe();
      reviewsChannel.unsubscribe();
      responsesChannel.unsubscribe();
      
      supabase.removeChannel(complaintsChannel);
      supabase.removeChannel(reviewsChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, [siteId, enabled]); // ✅ Removed queryClient and toast from dependencies
}

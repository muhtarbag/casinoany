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
          console.log('New complaint:', payload);
          
          queryClient.invalidateQueries({ queryKey: ['site-complaints', siteId] });
          queryClient.invalidateQueries({ queryKey: ['site-activity-feed', siteId] });
          
          const complaint = payload.new as any;
          toast({
            title: '🔔 Yeni Şikayet',
            description: `${complaint.title}`,
          });
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
          console.log('New review:', payload);
          
          queryClient.invalidateQueries({ queryKey: ['site-reviews', siteId] });
          queryClient.invalidateQueries({ queryKey: ['site-activity-feed', siteId] });
          
          const review = payload.new as any;
          if (review.is_approved) {
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
          console.log('New complaint response:', payload);
          queryClient.invalidateQueries({ queryKey: ['site-complaints', siteId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(complaintsChannel);
      supabase.removeChannel(reviewsChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, [siteId, enabled, queryClient, toast]);
}

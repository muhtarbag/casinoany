import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useOwnershipVerification(applicationId: string | undefined) {
  return useQuery({
    queryKey: ['ownership-verifications', applicationId],
    queryFn: async () => {
      if (!applicationId) return null;
      
      const { data, error } = await supabase
        .from('ownership_verifications')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const emailVerification = data?.find(v => v.verification_type === 'email' && v.verified_at);
      const domainVerification = data?.find(v => 
        (v.verification_type === 'domain_txt' || v.verification_type === 'domain_meta') && v.verified_at
      );
      
      return {
        all: data || [],
        emailVerified: !!emailVerification,
        domainVerified: !!domainVerification,
        isFullyVerified: !!emailVerification || !!domainVerification,
      };
    },
    enabled: !!applicationId,
  });
}
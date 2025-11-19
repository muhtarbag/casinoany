import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ImpersonationBanner = () => {
  const { impersonatedUserId, stopImpersonation, isImpersonating } = useAuth();

  const { data: impersonatedUser } = useQuery({
    queryKey: ['impersonated-user', impersonatedUserId],
    queryFn: async () => {
      if (!impersonatedUserId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', impersonatedUserId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!impersonatedUserId,
  });

  if (!isImpersonating) return null;

  const displayName = impersonatedUser
    ? `${impersonatedUser.first_name || ''} ${impersonatedUser.last_name || ''}`.trim() || impersonatedUser.email
    : 'Unknown User';

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-warning/5 border-b border-warning/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-warning" />
          <span className="text-xs text-muted-foreground">
            Görüntülenen: <span className="font-medium text-foreground">{displayName}</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={stopImpersonation}
          className="h-6 px-2 text-xs gap-1 hover:bg-warning/10"
        >
          <X className="h-3 w-3" />
          Çıkış
        </Button>
      </div>
    </div>
  );
};

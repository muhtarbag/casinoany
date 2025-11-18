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
    <Alert className="fixed top-0 left-0 right-0 z-[70] rounded-none border-b-2 border-warning bg-warning/10">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Admin olarak <strong>{displayName}</strong> görüntülüyorsunuz
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={stopImpersonation}
          className="ml-4 h-7 gap-1"
        >
          <X className="h-3 w-3" />
          Normal Moda Dön
        </Button>
      </AlertDescription>
    </Alert>
  );
};

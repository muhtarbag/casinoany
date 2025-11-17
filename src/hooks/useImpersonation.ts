import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * ✅ TAMAMLANMIŞ: Admin impersonation hook
 * Güvenli kullanıcı taklit etme sistemi
 */
export const useImpersonation = () => {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  // Check impersonation status on mount
  useEffect(() => {
    const originalSession = localStorage.getItem('original_admin_session');
    setIsImpersonating(!!originalSession);
  }, []);

  // Start impersonation
  const impersonateUser = async (userId: string, userName: string) => {
    if (!isAdmin) {
      toast.error('Sadece adminler bu özelliği kullanabilir');
      return false;
    }

    setLoading(true);
    
    try {
      // 1. Get current session (admin's session)
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (!currentSession.session) {
        throw new Error('Aktif oturum bulunamadı');
      }

      // 2. Save original admin session
      localStorage.setItem('original_admin_session', JSON.stringify(currentSession.session));
      localStorage.setItem('impersonation_start_time', Date.now().toString());

      // 3. Get impersonation tokens via edge function
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
        'impersonate-user',
        {
          body: { user_id: userId }
        }
      );

      if (tokenError) throw tokenError;

      if (!tokenData.access_token || !tokenData.refresh_token) {
        throw new Error('Token alınamadı');
      }

      // 4. Set new session (impersonated user's session)
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token
      });

      if (sessionError) throw sessionError;

      setIsImpersonating(true);
      toast.success(`${userName} olarak giriş yapıldı`, {
        description: 'Geri dönmek için "Admin Moduna Dön" butonuna tıklayın',
        duration: 5000,
      });

      // 5. Reload to apply new session
      setTimeout(() => {
        window.location.replace('/');
      }, 1000);

      return true;
    } catch (error: any) {
      console.error('Impersonation error:', error);
      
      // Cleanup on error
      localStorage.removeItem('original_admin_session');
      localStorage.removeItem('impersonation_start_time');
      
      toast.error('Kullanıcı olarak giriş yapılamadı', {
        description: error.message || 'Bir hata oluştu'
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Exit impersonation and return to admin
  const exitImpersonation = async () => {
    setLoading(true);
    
    try {
      const originalSessionStr = localStorage.getItem('original_admin_session');
      
      if (!originalSessionStr) {
        throw new Error('Orijinal oturum bulunamadı');
      }

      const originalSession = JSON.parse(originalSessionStr);

      // Restore admin session
      const { error } = await supabase.auth.setSession({
        access_token: originalSession.access_token,
        refresh_token: originalSession.refresh_token
      });

      if (error) throw error;

      // Cleanup
      localStorage.removeItem('original_admin_session');
      localStorage.removeItem('impersonation_start_time');
      
      setIsImpersonating(false);
      toast.success('Admin moduna dönüldü');

      // Redirect to admin users page
      setTimeout(() => {
        window.location.replace('/admin/system/users');
      }, 500);

      return true;
    } catch (error: any) {
      console.error('Exit impersonation error:', error);
      toast.error('Admin moduna dönülemedi', {
        description: error.message || 'Sayfayı yenileyin'
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get impersonation duration (memoized to prevent re-renders)
  const getImpersonationDuration = useCallback(() => {
    const startTime = localStorage.getItem('impersonation_start_time');
    if (!startTime) return null;
    
    const duration = Date.now() - parseInt(startTime);
    const minutes = Math.floor(duration / 60000);
    return minutes;
  }, []);

  return {
    isImpersonating,
    loading,
    impersonateUser,
    exitImpersonation,
    getImpersonationDuration,
  };
};

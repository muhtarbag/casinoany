import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { prodLogger } from '@/lib/productionLogger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isSiteOwner: boolean;
  ownedSites: string[];
  userRoles: string[];
  loading: boolean;
  signUp: (
    email: string, 
    password: string, 
    accountType?: 'user' | 'site_owner', 
    siteId?: string, 
    userData?: { 
      firstName?: string; 
      lastName?: string; 
      phone?: string;
      companyName?: string;
      companyTaxNumber?: string;
      companyType?: string;
      companyAuthorizedPerson?: string;
      companyPhone?: string;
      companyEmail?: string;
      companyAddress?: string;
      companyWebsite?: string;
    }
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

// CRITICAL: Create context outside component to ensure single instance
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSiteOwner, setIsSiteOwner] = useState(false);
  const [ownedSites, setOwnedSites] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    
    // ✅ FIX: Proper async initialization with cancellation
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (isCancelled) return;
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkUserRoles(session.user.id);
        }
      } catch (error) {
        if (!isCancelled) {
          prodLogger.error('Failed to initialize auth', error as Error, { 
            component: 'auth' 
          });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Then setup listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isCancelled) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkUserRoles(session.user.id);
        } else {
          setIsAdmin(false);
          setIsSiteOwner(false);
          setOwnedSites([]);
          setUserRoles([]);
        }
      }
    );

    return () => {
      isCancelled = true;
      subscription.unsubscribe();
    };
  }, []); // ✅ Correct: Empty deps, cleanup handled properly

  const checkUserRoles = async (userId: string) => {
    try {
      // ✅ SECURITY FIX: Use server-side RPC function instead of direct query
      // This prevents client-side manipulation of role checks
      const { data, error } = await supabase.rpc('get_current_user_roles');
      
      if (error) {
        prodLogger.error('Failed to fetch user roles', error, { 
          component: 'auth',
          metadata: { userId } 
        });
        return;
      }
      
      // Data is already filtered by approved status on server-side
      const roles = data?.map(r => r.role) || [];
      const sites = data?.[0]?.owned_sites || [];
      
      setUserRoles(roles);
      setIsAdmin(roles.includes('admin'));
      setIsSiteOwner(sites.length > 0);
      setOwnedSites(sites);
    } catch (error) {
      prodLogger.error('Unexpected error in checkUserRoles', error, { 
        component: 'auth',
        metadata: { userId } 
      });
    }
  };

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    accountType: 'user' | 'site_owner' = 'user', 
    siteId?: string, 
    userData?: { 
      firstName?: string; 
      lastName?: string; 
      phone?: string;
      companyName?: string;
      companyTaxNumber?: string;
      companyType?: string;
      companyAuthorizedPerson?: string;
      companyPhone?: string;
      companyEmail?: string;
      companyAddress?: string;
      companyWebsite?: string;
    }
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          accountType,
          first_name: userData?.firstName,
          last_name: userData?.lastName,
          phone: userData?.phone,
          companyName: userData?.companyName,
          companyTaxNumber: userData?.companyTaxNumber,
          companyType: userData?.companyType,
          companyAuthorizedPerson: userData?.companyAuthorizedPerson,
          companyPhone: userData?.companyPhone,
          companyEmail: userData?.companyEmail,
          companyAddress: userData?.companyAddress,
          companyWebsite: userData?.companyWebsite
        }
      }
    });
    
    if (error) return { error };
    
    // Create user role if needed
    // ✅ Trigger otomatik role ekliyor, burada duplicate insert yapmıyoruz
    // handle_new_user() trigger'ı user_roles'e otomatik insert yapıyor
    
    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return { error };
    
    // ✅ GÜÇLENDIRILMIŞ: Rol kontrolü - null durumları handle eder
    if (data.user) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('status, role')
        .eq('user_id', data.user.id)
        .maybeSingle();
      
      // Eğer rol kaydı varsa kontrol et
      if (roleData) {
        if (roleData.status === 'pending') {
          await supabase.auth.signOut();
          return { error: { message: 'Hesabınız henüz onaylanmadı. Lütfen admin onayını bekleyin.' } };
        }
        
        if (roleData.status === 'rejected') {
          await supabase.auth.signOut();
          return { error: { message: 'Hesabınız reddedildi. Destek ile iletişime geçin.' } };
        }
      } else {
        // ✅ YENİ: Rol kaydı yoksa (veri tutarsızlığı)
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Hesap kurulumu tamamlanmamış. Lütfen yeniden kayıt olun veya destek ile iletişime geçin.' 
          } 
        };
      }
    }
    
    // ✅ CRITICAL FIX: Redirect to home page after successful login
    window.location.href = '/';
    
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Clear local state first (optimistic update)
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsSiteOwner(false);
      setOwnedSites([]);
      setUserRoles([]);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        prodLogger.error('Failed to sign out', error, { 
          component: 'auth' 
        });
      }
      
      // Redirect to login page after logout
      window.location.href = '/login';
    } catch (error) {
      prodLogger.error('Unexpected error during sign out', error as Error, { 
        component: 'auth' 
      });
      // Even if there's an error, redirect to login
      window.location.href = '/login';
    }
  }, []);

  // ✅ FIX: Memoize context value AFTER function definitions
  const authContextValue = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isAdmin,
      isSiteOwner,
      ownedSites,
      userRoles,
      loading,
      signUp,
      signIn,
      signOut,
    }),
    [user, session, isAdmin, isSiteOwner, ownedSites, userRoles, loading]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

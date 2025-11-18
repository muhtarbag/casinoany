import { createContext, useContext, useState, useEffect, type ReactNode, useRef, useMemo } from 'react';
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
  impersonatedUserId: string | null;
  isImpersonating: boolean;
  impersonateUser: (userId: string) => void;
  stopImpersonation: () => void;
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
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);
  
  // Impersonate edilen kullanıcının rolleri için ayrı state'ler
  const [impersonatedIsAdmin, setImpersonatedIsAdmin] = useState(false);
  const [impersonatedIsSiteOwner, setImpersonatedIsSiteOwner] = useState(false);
  const [impersonatedOwnedSites, setImpersonatedOwnedSites] = useState<string[]>([]);
  const [impersonatedUserRoles, setImpersonatedUserRoles] = useState<string[]>([]);

  // Impersonate edildiğinde impersonate edilen kullanıcının rollerini çek
  useEffect(() => {
    if (impersonatedUserId) {
      checkImpersonatedUserRoles(impersonatedUserId);
    } else {
      // Impersonation durdurulduğunda impersonate state'lerini temizle
      setImpersonatedIsAdmin(false);
      setImpersonatedIsSiteOwner(false);
      setImpersonatedOwnedSites([]);
      setImpersonatedUserRoles([]);
    }
  }, [impersonatedUserId]);

  useEffect(() => {
    let mounted = true;
    
    // Restore impersonation state from localStorage
    const savedImpersonatedUserId = localStorage.getItem('impersonated_user_id');
    if (savedImpersonatedUserId) {
      setImpersonatedUserId(savedImpersonatedUserId);
    }
    
    // Get initial session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRoles(session.user.id);
      }
      setLoading(false);
    });

    // Then setup listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          checkUserRoles(session.user.id);
        } else {
          setIsAdmin(false);
          setIsSiteOwner(false);
          setOwnedSites([]);
          setUserRoles([]);
          setImpersonatedUserId(null);
          localStorage.removeItem('impersonated_user_id');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_id', userId);
      
      if (error) {
        prodLogger.error('Failed to fetch user roles', error, { 
          component: 'auth',
          metadata: { userId } 
        });
        return;
      }
      
      // Only set roles if user is approved
      const approvedRoles = data?.filter(r => r.status === 'approved') || [];
      const roles = approvedRoles.map(r => r.role);
      
      // Check site ownership independently from roles
      const { data: ownedSitesData, error: ownershipError } = await (supabase as any)
        .from('site_owners')
        .select('site_id')
        .eq('user_id', userId)
        .eq('status', 'approved');
      
      if (ownershipError) {
        prodLogger.error('Failed to fetch site ownership', ownershipError, { 
          component: 'auth',
          metadata: { userId } 
        });
      }
      
      const sites = ownedSitesData?.map((s: any) => s.site_id).filter(Boolean) || [];
      
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

  const checkImpersonatedUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_id', userId);
      
      if (error) {
        prodLogger.error('Failed to fetch impersonated user roles', error, { 
          component: 'auth',
          metadata: { userId } 
        });
        return;
      }
      
      // Only set roles if user is approved
      const approvedRoles = data?.filter(r => r.status === 'approved') || [];
      const roles = approvedRoles.map(r => r.role);
      
      // Check site ownership independently from roles
      const { data: ownedSitesData, error: ownershipError } = await (supabase as any)
        .from('site_owners')
        .select('site_id')
        .eq('user_id', userId)
        .eq('status', 'approved');
      
      if (ownershipError) {
        prodLogger.error('Failed to fetch impersonated user site ownership', ownershipError, { 
          component: 'auth',
          metadata: { userId } 
        });
      }
      
      const sites = ownedSitesData?.map((s: any) => s.site_id).filter(Boolean) || [];
      
      setImpersonatedUserRoles(roles);
      setImpersonatedIsAdmin(roles.includes('admin'));
      setImpersonatedIsSiteOwner(sites.length > 0);
      setImpersonatedOwnedSites(sites);
    } catch (error) {
      prodLogger.error('Unexpected error in checkImpersonatedUserRoles', error, { 
        component: 'auth',
        metadata: { userId } 
      });
    }
  };

  const signUp = async (
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
  };

  const signIn = async (email: string, password: string) => {
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
    
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setImpersonatedUserId(null);
    localStorage.removeItem('impersonated_user_id');
  };

  const impersonateUser = (userId: string) => {
    if (!isAdmin) {
      prodLogger.warn('Unauthorized impersonation attempt', { userId });
      return;
    }
    setImpersonatedUserId(userId);
    localStorage.setItem('impersonated_user_id', userId);
  };

  const stopImpersonation = () => {
    setImpersonatedUserId(null);
    localStorage.removeItem('impersonated_user_id');
  };

  // ✅ FIX: Memoize context value AFTER function definitions
  const authContextValue = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isAdmin: impersonatedUserId ? impersonatedIsAdmin : isAdmin,
      isSiteOwner: impersonatedUserId ? impersonatedIsSiteOwner : isSiteOwner,
      ownedSites: impersonatedUserId ? impersonatedOwnedSites : ownedSites,
      userRoles: impersonatedUserId ? impersonatedUserRoles : userRoles,
      loading,
      impersonatedUserId,
      isImpersonating: !!impersonatedUserId,
      impersonateUser,
      stopImpersonation,
      signUp,
      signIn,
      signOut,
    }),
    [
      user, 
      session, 
      isAdmin, 
      isSiteOwner, 
      ownedSites, 
      userRoles, 
      loading, 
      impersonatedUserId,
      impersonatedIsAdmin,
      impersonatedIsSiteOwner,
      impersonatedOwnedSites,
      impersonatedUserRoles
    ]
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

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isSiteOwner: boolean;
  ownedSites: string[];
  userRoles: string[];
  loading: boolean;
  signUp: (email: string, password: string, accountType?: 'user' | 'site_owner', siteId?: string, userData?: { firstName?: string; lastName?: string; phone?: string }) => Promise<{ error: any }>;
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
  
  // Cache user roles to prevent duplicate requests
  const rolesCache = useRef<{ userId: string; roles: string[]; timestamp: number } | null>(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    let mounted = true;
    
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
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRoles = async (userId: string) => {
    // Check cache first
    if (rolesCache.current?.userId === userId) {
      const cacheAge = Date.now() - rolesCache.current.timestamp;
      if (cacheAge < CACHE_DURATION) {
        const roles = rolesCache.current.roles;
        setUserRoles(roles);
        setIsAdmin(roles.includes('admin'));
        return;
      }
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role, status')
      .eq('user_id', userId);
    
    // Only set roles if user is approved
    const approvedRoles = data?.filter(r => r.status === 'approved') || [];
    const roles = approvedRoles.map(r => r.role);
    
    // Update cache
    rolesCache.current = {
      userId,
      roles,
      timestamp: Date.now()
    };
    
    setUserRoles(roles);
    setIsAdmin(roles.includes('admin'));
    setIsSiteOwner(roles.includes('site_owner' as any));
    
    // Check site ownership
    if (roles.includes('site_owner' as any)) {
      const { data: ownedSitesData } = await (supabase as any)
        .from('site_owners')
        .select('site_id')
        .eq('user_id', userId)
        .eq('status', 'approved');
      
      setOwnedSites(ownedSitesData?.map((s: any) => s.site_id) || []);
    } else {
      setOwnedSites([]);
    }
  };

  const signUp = async (email: string, password: string, accountType: 'user' | 'site_owner' = 'user', siteId?: string, userData?: { firstName?: string; lastName?: string; phone?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: userData?.firstName,
          last_name: userData?.lastName,
          phone: userData?.phone
        }
      }
    });
    
    if (error) return { error };
    
    // Create user role if needed
    if (data.user) {
      const role = accountType === 'site_owner' ? 'site_owner' : 'user';
      
      // Insert role (pending for site owners, approved for regular users)
      await (supabase as any).from('user_roles').insert({
        user_id: data.user.id,
        role: role as any,
        status: accountType === 'site_owner' ? 'pending' : 'approved'
      });
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return { error };
    
    // Check if user is approved (only for users with role records)
    if (data.user) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('status')
        .eq('user_id', data.user.id)
        .maybeSingle(); // Use maybeSingle instead of single to allow null
      
      // Only block if role record exists and status is pending/rejected
      if (roleData) {
        if (roleData.status === 'pending') {
          await supabase.auth.signOut();
          return { error: { message: 'Hesabınız henüz onaylanmadı. Lütfen admin onayını bekleyin.' } };
        }
        
        if (roleData.status === 'rejected') {
          await supabase.auth.signOut();
          return { error: { message: 'Hesabınız reddedildi. Destek ile iletişime geçin.' } };
        }
      }
      // If no role record exists (old users), allow login
    }
    
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAdmin,
      isSiteOwner,
      ownedSites,
      userRoles, 
      loading, 
      signUp, 
      signIn, 
      signOut 
    }}>
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

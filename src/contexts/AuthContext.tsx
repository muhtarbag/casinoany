import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  userRoles: string[];
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cache user roles to prevent duplicate requests
  const rolesCache = useRef<{ userId: string; roles: string[]; timestamp: number } | null>(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkUserRoles(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setUserRoles([]);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
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
    <AuthContext.Provider value={{ user, session, isAdmin, userRoles, loading, signUp, signIn, signOut }}>
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

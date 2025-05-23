
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { testSupabaseConnection } from '@/lib/supabase';
import { handleSignIn, handleSignUp, handleSignOut } from '@/lib/auth-utils';

export const useAuthentication = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isDev] = useState(() => import.meta.env.MODE === 'development');

  useEffect(() => {
    // Check Supabase connection first
    testSupabaseConnection().then(connected => {
      setIsConnected(connected);
      
      if (!connected) {
        setLoading(false);
        setError("Unable to connect to authentication service. Please check your network connection.");
        return;
      }
      
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
  
      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
  
      return () => subscription.unsubscribe();
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const result = await handleSignIn(email, password, isConnected);
    
    if (result.error) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const result = await handleSignUp(email, password, isConnected, isDev);
    
    if (result.error) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const signOut = async () => {
    const result = await handleSignOut(isConnected);
    
    if (result.error) {
      setError(result.error);
    } else {
      // Force navigation to auth page after logout
      window.location.href = '/auth';
    }
  };

  return {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
    error,
    isConnected,
    isDev
  };
};

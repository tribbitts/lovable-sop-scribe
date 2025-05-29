
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, testSupabaseConnection } from '@/lib/supabase';
import { handleSignIn, handleSignUp, handleSignOut } from '@/lib/auth-utils';

export const useAuthentication = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isDev] = useState(() => import.meta.env.MODE === 'development');

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Check Supabase connection first
        const connected = await testSupabaseConnection();
        
        if (!mounted) return;
        
        setIsConnected(connected);
        
        if (!connected) {
          setLoading(false);
          setError("Unable to connect to authentication service. Please check your network connection.");
          return;
        }
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Failed to retrieve session");
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        setLoading(false);
    
        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          console.log("Auth state changed:", event);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          if (event === 'SIGNED_OUT') {
            setError(null);
          }
        });
    
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        if (!mounted) return;
        
        console.error("Auth initialization error:", err);
        setError("Failed to initialize authentication");
        setLoading(false);
      }
    };

    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isConnected) {
      setError("No connection to authentication service");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await handleSignIn(email, password, isConnected);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isConnected) {
      setError("No connection to authentication service");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await handleSignUp(email, password, isConnected, isDev);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!isConnected) {
      setError("No connection to authentication service");
      return;
    }
    
    try {
      const result = await handleSignOut(isConnected);
      
      if (result.error) {
        setError(result.error);
      } else {
        // Clear any cached data
        setSession(null);
        setUser(null);
        setError(null);
        
        // Force navigation to auth page after logout
        window.location.href = '/auth';
      }
    } catch (err) {
      console.error("Sign out error:", err);
      setError("An unexpected error occurred during sign out");
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

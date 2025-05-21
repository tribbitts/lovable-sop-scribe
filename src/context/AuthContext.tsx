
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { testSupabaseConnection } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loading: true,
  error: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    try {
      setLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error("Unable to connect to authentication service. Please check your network connection.");
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Error signing in";
      setError(errorMessage);
      
      toast({
        title: "Error signing in",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error("Unable to connect to authentication service. Please check your network connection.");
      }
      
      // In development mode, use auto-confirm for easier testing
      let options = {};
      if (isDev) {
        options = { emailRedirectTo: window.location.origin + '/app' };
      }
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: isDev 
          ? "Development account created. You can now sign in." 
          : "Please check your email for the confirmation link.",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Error creating account";
      setError(errorMessage);
      
      toast({
        title: "Error creating account",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error("Unable to connect to authentication service. Please check your network connection.");
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Error signing out";
      setError(errorMessage);
      
      toast({
        title: "Error signing out",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

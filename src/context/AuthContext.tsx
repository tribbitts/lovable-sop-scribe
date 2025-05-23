
import React, { createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useAuthentication } from '@/hooks/useAuthentication';

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
  const {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
    error
  } = useAuthentication();

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

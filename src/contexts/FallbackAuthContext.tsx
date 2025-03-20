import React, { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { UserRole } from '../types';

interface FallbackAuthContextType {
  session: Session | null;
  user: any | null;
  loading: boolean;
  userRole: UserRole | null;
  signOut: () => Promise<void>;
}

const FallbackAuthContext = createContext<FallbackAuthContextType>({
  session: null,
  user: null,
  loading: false,
  userRole: null,
  signOut: async () => {}
});

export const FallbackAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = {
    session: null,
    user: null,
    loading: false,
    userRole: null,
    signOut: async () => {
      console.log('Mock sign out called');
    }
  };
  
  return (
    <FallbackAuthContext.Provider value={value}>
      {children}
    </FallbackAuthContext.Provider>
  );
};

export const useFallbackAuth = (): FallbackAuthContextType => {
  return useContext(FallbackAuthContext);
};

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({
  children,
  serverSession,
}: {
  children: React.ReactNode;
  serverSession: AuthState | null;
}) {
  const [authState, setAuthState] = useState<AuthState>(
    serverSession || {
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      isInitialized: false,
    }
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session: session,
        isLoading: false,
        isAuthenticated: !!session,
        isInitialized: true,
      });
    });

    // Initial check if not provided by server
    if (!serverSession) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setAuthState({
          user: session?.user ?? null,
          session: session,
          isLoading: false,
          isAuthenticated: !!session,
          isInitialized: true,
        });
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [serverSession]);

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

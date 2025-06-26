'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/supabase/client';
import { useAuthContext } from '@/contexts/auth-context';
import type { OAuthProvider } from '@/lib/auth/auth-service';

export function useAuth() {
  const authState = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const loginWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('OAuth login error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    ...authState,
    isLoading: authState.isLoading || isLoading,
    loginWithOAuth,
    logout,
  };
}

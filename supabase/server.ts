import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// import type { Database } from './client';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
};

// 인증 상태 확인을 위한 헬퍼 함수
export const getUser = async () => {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    console.log('=== Supabase getUser ===');
    console.log('User:', user ? { id: user.id, email: user.email } : 'null');
    console.log('Error:', error);

    return { user, error };
  } catch (error) {
    console.error('Error getting user:', error);
    return { user: null, error };
  }
};

// 세션 확인을 위한 헬퍼 함수
export const getSession = async () => {
  const supabase = await createClient();

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log('=== Supabase getSession ===');
    console.log(
      'Session:',
      session
        ? {
            user: { id: session.user.id, email: session.user.email },
            expires_at: session.expires_at,
          }
        : 'null'
    );
    console.log('Error:', error);

    return { session, error };
  } catch (error) {
    console.error('Error getting session:', error);
    return { session: null, error };
  }
};

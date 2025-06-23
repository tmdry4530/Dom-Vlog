import { supabase } from './client';

// 연결 상태 확인 함수
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error && error.message !== 'Auth session missing!') {
      throw error;
    }

    return {
      isConnected: true,
      user: data?.user || null,
      message: 'Supabase 연결이 정상적으로 작동합니다.',
    };
  } catch (error) {
    return {
      isConnected: false,
      user: null,
      message:
        error instanceof Error ? error.message : '연결 오류가 발생했습니다.',
      error,
    };
  }
}

// 환경변수 검증 함수
export function validateSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const errors: string[] = [];

  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
  } else if (
    !supabaseUrl.startsWith('https://') ||
    !supabaseUrl.includes('.supabase.co')
  ) {
    errors.push(
      'NEXT_PUBLIC_SUPABASE_URL이 올바른 Supabase URL 형식이 아닙니다.'
    );
  }

  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  } else if (supabaseAnonKey.length < 100) {
    errors.push(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY가 올바르지 않습니다. (너무 짧음)'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    config: {
      supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    },
  };
}

// Phase 1에서 사용할 기본적인 데이터베이스 헬퍼 함수들
export const db = {
  // 향후 posts 테이블 관련 함수들
  // posts: {
  //   getAll: () => supabase.from('posts').select('*'),
  //   getById: (id: string) => supabase.from('posts').select('*').eq('id', id).single(),
  //   create: (post: any) => supabase.from('posts').insert(post),
  //   update: (id: string, updates: any) => supabase.from('posts').update(updates).eq('id', id),
  //   delete: (id: string) => supabase.from('posts').delete().eq('id', id)
  // },
  // 향후 categories 테이블 관련 함수들
  // categories: {
  //   getAll: () => supabase.from('categories').select('*'),
  //   create: (category: any) => supabase.from('categories').insert(category)
  // }
};

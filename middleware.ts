import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAllowedUser } from '@/lib/auth/auth-service'; // isAllowedUser 임포트

/**
 * 인증이 필요한 경로인지 확인
 */
function requiresAuth(pathname: string): boolean {
  const authRequiredPaths = [
    '/profile',
    '/admin',
    '/dashboard',
    '/api/posts',
    '/api/ai',
    '/api/auth/profile',
    '/api/auth/logout',
  ];

  return authRequiredPaths.some((path) => pathname.startsWith(path));
}

/**
 * 공개 접근 가능한 경로인지 확인
 */
function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    '/',
    '/blog',
    '/auth/login',
    '/auth/callback',
    '/unauthorized',
    '/api/auth/login',
    '/api/auth/session',
    '/api/health',
    '/api/debug',
    '/api/posts/recent',
    '/api/stats',
    '/api/categories/stats',
    '/api/profile/blog-info',
    '/api/posts',
  ];

  return publicPaths.some((path) => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  // response 객체를 먼저 생성합니다.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase 환경변수가 설정되지 않았습니다.');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    console.error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY:',
      supabaseAnonKey ? '[설정됨]' : '[없음]'
    );
    return response;
  }

  // URL 형식 검증
  try {
    new URL(supabaseUrl);
  } catch (_error) {
    console.error('잘못된 Supabase URL 형식:', supabaseUrl);
    console.error('올바른 형식: https://your-project-id.supabase.co');
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        // response 객체에 직접 쿠키를 설정합니다.
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: Record<string, unknown>) {
        // response 객체에 직접 쿠키를 설정합니다.
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // 사용자 세션 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // 공개 경로는 통과
  if (isPublicPath(pathname)) {
    return response;
  }

  // 인증이 필요한 경로인 경우
  if (requiresAuth(pathname)) {
    // 로그인하지 않은 사용자
    if (!user) {
      // API 요청인 경우 JSON 에러 반환
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: '인증이 필요합니다.' },
          { status: 401 }
        );
      }

      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 화이트리스트에 없는 사용자
    if (!user.email || !isAllowedUser(user.email)) {
      // API 요청인 경우 JSON 에러 반환
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
      }

      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 요청에 대해 미들웨어 실행:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 기타 public 파일들
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

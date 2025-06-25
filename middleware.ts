import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * 허용된 사용자인지 확인 (개인 블로그용 화이트리스트)
 */
function isAllowedUser(email: string): boolean {
  const allowedEmails = process.env.ALLOWED_USER_EMAILS;

  if (!allowedEmails) {
    console.error('ALLOWED_USER_EMAILS 환경변수가 설정되지 않았습니다.');
    return false;
  }

  // 쉼표로 구분된 이메일 목록 파싱
  const emailList = allowedEmails
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);

  return emailList.includes(email.toLowerCase());
}

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
  ];

  return publicPaths.some(
    (path) =>
      path === pathname ||
      (path === '/' && pathname === '/') ||
      (path === '/blog' && pathname.startsWith('/blog'))
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase 환경변수가 설정되지 않았습니다.');
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: Record<string, unknown>) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
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
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 화이트리스트에 없는 사용자
    if (!user.email || !isAllowedUser(user.email)) {
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

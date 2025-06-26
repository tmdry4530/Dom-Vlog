'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Menu,
  User,
  LogOut,
  Settings,
  Github,
  PenTool,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useAuthPermissions } from '@/hooks/useAuthPermissions';
import Link from 'next/link';

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

export function Header({ toggleMobileSidebar }: HeaderProps) {
  const { user, isAuthenticated, isLoading, loginWithOAuth, logout } =
    useAuth();
  const { canWrite, isLoading: permissionsLoading } = useAuthPermissions();
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration 완료 확인
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // OAuth 로그인 처리
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsOAuthLoading(provider);
    try {
      await loginWithOAuth(provider);
    } catch (error) {
      console.error('OAuth 로그인 오류:', error);
      alert(
        `로그인 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsOAuthLoading(null);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    await logout();
  };

  // 사용자 정보 추출 (Supabase user_metadata 사용)
  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    '사용자';
  const userAvatar =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userEmail = user?.email || '';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* 왼쪽: 모바일 메뉴 버튼 + 로고 */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Dom Vlog
            </span>
          </Link>
        </div>

        {/* 오른쪽: 검색 + 글쓰기 + 사용자 메뉴 */}
        <div className="flex items-center gap-3">
          {/* 검색 버튼 */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Search className="h-4 w-4" />
          </Button>

          {/* Hydration이 완료된 후에만 조건부 렌더링 */}
          {isHydrated && (
            <>
              {/* 글쓰기 버튼 - 허용된 사용자에게만 표시 */}
              {canWrite && !permissionsLoading && (
                <Button asChild size="sm" className="hidden sm:flex">
                  <Link
                    href="/admin/posts/new"
                    className="flex items-center gap-2"
                  >
                    <PenTool className="h-4 w-4" />
                    <span>글쓰기</span>
                  </Link>
                </Button>
              )}

              {/* 사용자 메뉴 */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userAvatar} alt={userDisplayName} />
                        <AvatarFallback>
                          {userDisplayName[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userDisplayName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userEmail}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>프로필</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/posts" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>관리</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>로그아웃</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  {/* 구글 로그인 버튼 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isOAuthLoading === 'google' || isLoading}
                    className="flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {isOAuthLoading === 'google' ? '로그인 중...' : 'Google'}
                  </Button>

                  {/* 깃허브 로그인 버튼 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOAuthLogin('github')}
                    disabled={isOAuthLoading === 'github' || isLoading}
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    {isOAuthLoading === 'github' ? '로그인 중...' : 'GitHub'}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Hydration 로딩 중에는 기본 레이아웃만 표시 */}
          {!isHydrated && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

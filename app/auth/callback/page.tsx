'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    if (isProcessed) return;
    setIsProcessed(true);

    const processCallback = async () => {
      try {
        console.log('🔄 OAuth 콜백 처리 시작');
        console.log('📍 현재 URL:', window.location.href);
        console.log('🔗 URL 해시:', window.location.hash);
        console.log('🔍 URL 검색 파라미터:', window.location.search);

        // URL 해시에서 OAuth 토큰 처리
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Auth callback error:', error);
          setStatus('error');
          setMessage(error.message || '로그인 처리 중 오류가 발생했습니다.');
          return;
        }

        // URL 해시 파라미터 확인 및 처리
        if (typeof window !== 'undefined') {
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1)
          );
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const error_description = hashParams.get('error_description');
          const error_code = hashParams.get('error');

          console.log('🔑 해시 파라미터:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            error_description,
            error_code,
          });

          if (error_description || error_code) {
            console.error('❌ OAuth 오류:', { error_code, error_description });
            setStatus('error');
            setMessage(
              decodeURIComponent(
                error_description || error_code || '알 수 없는 오류'
              )
            );
            return;
          }

          if (accessToken) {
            console.log('🔄 세션 설정 중...');
            // 토큰이 있으면 세션 설정
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });

            if (sessionError) {
              console.error('❌ Session setting error:', sessionError);
              setStatus('error');
              setMessage(
                sessionError.message || '세션 설정 중 오류가 발생했습니다.'
              );
              return;
            }

            if (sessionData.session && sessionData.session.user) {
              console.log('✅ 세션 설정 성공:', sessionData.session.user.email);
              setStatus('success');
              setMessage('로그인이 완료되었습니다.');

              // URL 해시 제거
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );

              // 2초 후 홈페이지로 리다이렉트
              setTimeout(() => {
                router.push('/');
              }, 2000);
              return;
            }
          }
        }

        // 기존 세션 확인
        if (data.session && data.session.user) {
          console.log('✅ 기존 세션 발견:', data.session.user.email);
          setStatus('success');
          setMessage('로그인이 완료되었습니다.');

          // 2초 후 홈페이지로 리다이렉트
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          console.warn('⚠️ 세션을 찾을 수 없음');
          setStatus('error');
          setMessage('로그인 세션을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('💥 OAuth 콜백 처리 오류:', error);
        setStatus('error');
        setMessage('예상치 못한 오류가 발생했습니다.');
      }
    };

    processCallback();

    // Supabase Auth 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session) {
        setStatus('success');
        setMessage('로그인이 완료되었습니다.');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else if (event === 'SIGNED_OUT') {
        setStatus('error');
        setMessage('로그인이 취소되었습니다.');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, isProcessed]);

  const handleRetry = () => {
    router.push('/');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return '로그인 처리 중...';
      case 'success':
        return '로그인 완료';
      case 'error':
        return '로그인 실패';
      default:
        return '로그인 처리 중...';
    }
  };

  return (
    <PageLayout
      title={getTitle()}
      description="OAuth 인증을 처리하고 있습니다."
      maxWidth="md"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 상태 아이콘 */}
          <div className="flex justify-center">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>

          {/* 메시지 */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
            {status === 'success' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                잠시 후 자동으로 이동합니다...
              </p>
            )}
          </div>

          {/* 액션 버튼 */}
          {status === 'error' && (
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full">
                다시 시도하기
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                홈으로 이동
              </Button>
            </div>
          )}

          {/* 성공 시 홈 버튼 */}
          {status === 'success' && (
            <Button onClick={handleGoHome} className="w-full">
              홈으로 이동
            </Button>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  handleOAuthCallback,
  type OAuthProvider,
} from '@/lib/auth/auth-service';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // URL에서 인증 코드와 제공자 정보 추출
        const code = searchParams.get('code');
        const provider = searchParams.get('provider') as OAuthProvider;
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // 에러가 있는 경우
        if (error) {
          setStatus('error');
          setMessage(
            errorDescription || `${provider} 로그인이 취소되었습니다.`
          );
          return;
        }

        // 코드나 제공자 정보가 없는 경우
        if (!code || !provider) {
          setStatus('error');
          setMessage('인증 정보가 올바르지 않습니다.');
          return;
        }

        // OAuth 콜백 처리
        const result = await handleOAuthCallback(code, provider);

        if (result.success) {
          setStatus('success');
          setMessage(result.message || '로그인이 완료되었습니다.');
          toast.success('로그인 성공!');

          // 2초 후 홈페이지로 리다이렉트
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.error || '로그인 처리 중 오류가 발생했습니다.');
          toast.error('로그인 실패');
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setStatus('error');
        setMessage('예상치 못한 오류가 발생했습니다.');
        toast.error('로그인 처리 실패');
      }
    };

    processCallback();
  }, [searchParams, router]);

  const handleRetry = () => {
    router.push('/auth/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === 'loading' && '로그인 처리 중...'}
            {status === 'success' && '로그인 완료'}
            {status === 'error' && '로그인 실패'}
          </CardTitle>
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
            <p className="text-sm text-gray-600">{message}</p>
            {status === 'success' && (
              <p className="text-xs text-gray-500 mt-2">
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
                홈으로 돌아가기
              </Button>
            </div>
          )}

          {status === 'success' && (
            <Button onClick={handleGoHome} className="w-full">
              홈으로 이동
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

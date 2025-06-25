'use client';

import { useRouter } from 'next/navigation';
import { Shield, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl">접근 권한이 없습니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>개인 블로그 알림</strong>
              </p>
              <p className="text-sm text-red-700 mt-2">
                이 블로그는 개인용으로 운영되며, 허가된 사용자만 접근할 수
                있습니다. 방문해 주셔서 감사하지만 콘텐츠 열람 권한이 제한되어
                있습니다.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Mail className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">
                  접근 요청
                </span>
              </div>
              <p className="text-sm text-blue-700">
                블로그 콘텐츠에 접근하고 싶으시다면, 블로그 운영자에게 직접
                문의해 주세요. 공개된 포스트는 메인 페이지에서 확인하실 수
                있습니다.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              메인 페이지로 이동
            </Button>
            <Button onClick={handleLogin} variant="outline" className="w-full">
              로그인 시도하기
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>이 블로그는 Next.js와 Supabase로 구동됩니다</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

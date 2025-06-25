'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Lock, Eye, EyeOff, Github } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useAuth } from '@/hooks/useAuth';
import { signInWithOAuth, type OAuthProvider } from '@/lib/auth/auth-service';
import { toast } from 'sonner';

// 로그인 폼 스키마
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  onSuccess?: () => void;
  onSignUpClick?: () => void;
  className?: string;
}

export function LoginForm({
  onSuccess,
  onSignUpClick,
  className,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<OAuthProvider | null>(
    null
  );
  const { login, isLoading, error } = useAuth();

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 폼 제출 처리
  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data);

    if (success) {
      reset();
      onSuccess?.();
    }
  };

  // OAuth 로그인 처리
  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setIsOAuthLoading(provider);

    try {
      const result = await signInWithOAuth(provider);

      if (result.success && result.data) {
        toast.success(result.message);
        // OAuth 리다이렉트 URL로 이동
        window.location.href = result.data.url;
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(`${provider} 로그인 오류:`, error);
      toast.error('소셜 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsOAuthLoading(null);
    }
  };

  // Google 아이콘 SVG 컴포넌트
  const GoogleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  const isAnyLoading = isLoading || isOAuthLoading !== null;

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          Dom Vlog에 오신 것을 환영합니다
        </CardDescription>
        <div className="text-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
          ⚠️ 이 블로그는 개인용으로 운영됩니다. 허가된 사용자만 접근할 수
          있습니다.
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 소셜 로그인 버튼들 */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isAnyLoading}
            onClick={() => handleOAuthLogin('github')}
          >
            {isOAuthLoading === 'github' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            GitHub으로 로그인
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isAnyLoading}
            onClick={() => handleOAuthLogin('google')}
          >
            {isOAuthLoading === 'google' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span className="ml-2">Google로 로그인</span>
          </Button>
        </div>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              또는 이메일로
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 이메일 필드 */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="pl-10"
                disabled={isAnyLoading}
                {...register('email')}
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* 비밀번호 필드 */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                className="pl-10 pr-10"
                disabled={isAnyLoading}
                {...register('password')}
                aria-invalid={!!errors.password}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isAnyLoading}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* 전역 에러 메시지 */}
          {error && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            </div>
          )}

          {/* 로그인 버튼 */}
          <Button type="submit" className="w-full" disabled={isAnyLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </Button>
        </form>

        {/* 회원가입 링크 */}
        {onSignUpClick && (
          <div className="text-center text-sm">
            <span className="text-muted-foreground">계정이 없으신가요? </span>
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={onSignUpClick}
              disabled={isAnyLoading}
            >
              회원가입
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useAuth } from '@/hooks/useAuth';

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

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          Dom Vlog에 오신 것을 환영합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                disabled={isLoading}
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
                disabled={isLoading}
                {...register('password')}
                aria-invalid={!!errors.password}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
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
          <Button type="submit" className="w-full" disabled={isLoading}>
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
              disabled={isLoading}
            >
              회원가입
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

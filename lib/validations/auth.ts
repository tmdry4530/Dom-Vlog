import { z } from 'zod';

// 로그인 스키마
export const loginSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

// 회원가입 스키마 (Phase 1에서는 사용하지 않지만 구조 준비)
export const registerSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
  displayName: z.string().min(2, '표시 이름은 최소 2자 이상이어야 합니다.'),
  username: z
    .string()
    .min(3, '사용자명은 최소 3자 이상이어야 합니다.')
    .max(20, '사용자명은 최대 20자까지 가능합니다.')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      '사용자명은 영문, 숫자, _, - 만 사용 가능합니다.'
    ),
});

// 비밀번호 변경 스키마
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
    newPassword: z.string().min(6, '새 비밀번호는 최소 6자 이상이어야 합니다.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine(
    (data: { newPassword: string; confirmPassword: string }) =>
      data.newPassword === data.confirmPassword,
    {
      message: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
      path: ['confirmPassword'],
    }
  );

// 타입 추출
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

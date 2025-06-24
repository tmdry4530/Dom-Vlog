import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signIn, signOut, getCurrentUser } from '@/lib/auth/auth-service';
import type { LoginInput } from '@/lib/validations/auth';

// Supabase 모킹
vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Prisma 모킹
vi.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      findFirst: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      updateUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { createClient } = require('@/supabase/server');
    createClient.mockResolvedValue(mockSupabase);
  });

  describe('signIn', () => {
    const loginData: LoginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('성공적인 로그인', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockProfile = {
        id: 'profile-123',
        username: 'testuser',
        displayName: 'Test User',
        avatar: null,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { prisma } = require('@/lib/prisma');
      prisma.profile.findFirst.mockResolvedValue(mockProfile);

      // Act
      const result = await signIn(loginData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        profile: {
          id: 'profile-123',
          username: 'testuser',
          displayName: 'Test User',
          avatar: undefined,
        },
      });
      expect(result.message).toBe('로그인이 완료되었습니다.');
    });

    it('잘못된 인증 정보로 로그인 실패', async () => {
      // Arrange
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      // Act
      const result = await signIn(loginData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('프로필이 없는 사용자 로그인', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { prisma } = require('@/lib/prisma');
      prisma.profile.findFirst.mockResolvedValue(null);

      // Act
      const result = await signIn(loginData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        profile: undefined,
      });
    });
  });

  describe('signOut', () => {
    it('성공적인 로그아웃', async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const result = await signOut();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('로그아웃이 완료되었습니다.');
    });

    it('로그아웃 실패', async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Logout failed' },
      });

      // Act
      const result = await signOut();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Logout failed');
    });
  });

  describe('getCurrentUser', () => {
    it('인증된 사용자 정보 조회', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockProfile = {
        id: 'profile-123',
        username: 'testuser',
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { prisma } = require('@/lib/prisma');
      prisma.profile.findFirst.mockResolvedValue(mockProfile);

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        profile: {
          id: 'profile-123',
          username: 'testuser',
          displayName: 'Test User',
          avatar: 'https://example.com/avatar.jpg',
        },
      });
    });

    it('인증되지 않은 사용자', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toBe('인증되지 않은 사용자입니다.');
    });

    it('세션 조회 실패', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Session expired' },
      });

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Session expired');
    });
  });
});

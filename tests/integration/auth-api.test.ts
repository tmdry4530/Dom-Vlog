import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as logoutPost } from '@/app/api/auth/logout/route';
import { GET as sessionGet } from '@/app/api/auth/session/route';

// Mock dependencies
vi.mock('@/lib/auth/auth-service', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
}));

describe('Authentication API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('유효한 로그인 데이터로 성공', async () => {
      // Arrange
      const { signIn } = require('@/lib/auth/auth-service');
      signIn.mockResolvedValue({
        success: true,
        data: {
          id: 'user-123',
          email: 'test@example.com',
          profile: {
            id: 'profile-123',
            username: 'testuser',
            displayName: 'Test User',
          },
        },
        message: '로그인이 완료되었습니다.',
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await loginPost(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('test@example.com');
      expect(data.message).toBe('로그인이 완료되었습니다.');
    });

    it('잘못된 입력값으로 실패', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123', // 너무 짧음
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await loginPost(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('입력값이 올바르지 않습니다.');
      expect(data.details).toBeDefined();
    });

    it('인증 실패', async () => {
      // Arrange
      const { signIn } = require('@/lib/auth/auth-service');
      signIn.mockResolvedValue({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await loginPost(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('성공적인 로그아웃', async () => {
      // Arrange
      const { signOut } = require('@/lib/auth/auth-service');
      signOut.mockResolvedValue({
        success: true,
        data: null,
        message: '로그아웃이 완료되었습니다.',
      });

      // Act
      const response = await logoutPost();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('로그아웃이 완료되었습니다.');
    });

    it('로그아웃 실패', async () => {
      // Arrange
      const { signOut } = require('@/lib/auth/auth-service');
      signOut.mockResolvedValue({
        success: false,
        error: '세션이 유효하지 않습니다.',
      });

      // Act
      const response = await logoutPost();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('세션이 유효하지 않습니다.');
    });
  });

  describe('GET /api/auth/session', () => {
    it('인증된 사용자 세션 조회', async () => {
      // Arrange
      const { getCurrentUser } = require('@/lib/auth/auth-service');
      getCurrentUser.mockResolvedValue({
        success: true,
        data: {
          id: 'user-123',
          email: 'test@example.com',
          profile: {
            id: 'profile-123',
            username: 'testuser',
            displayName: 'Test User',
          },
        },
      });

      // Act
      const response = await sessionGet();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('test@example.com');
    });

    it('인증되지 않은 사용자', async () => {
      // Arrange
      const { getCurrentUser } = require('@/lib/auth/auth-service');
      getCurrentUser.mockResolvedValue({
        success: true,
        data: null,
        message: '인증되지 않은 사용자입니다.',
      });

      // Act
      const response = await sessionGet();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeNull();
      expect(data.message).toBe('인증되지 않은 사용자입니다.');
    });

    it('세션 확인 실패', async () => {
      // Arrange
      const { getCurrentUser } = require('@/lib/auth/auth-service');
      getCurrentUser.mockResolvedValue({
        success: false,
        error: '서버 오류가 발생했습니다.',
      });

      // Act
      const response = await sessionGet();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('서버 오류가 발생했습니다.');
    });
  });
});

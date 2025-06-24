import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCurrentProfile,
  createProfile,
  updateProfile,
  checkUsernameAvailability,
} from '@/lib/auth/profile-service';
import type {
  CreateProfileInput,
  UpdateProfileInput,
} from '@/lib/validations/profile';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth/auth-service', () => ({
  requireAuth: vi.fn(),
}));

describe('ProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentProfile', () => {
    it('인증된 사용자의 프로필 조회 성공', async () => {
      // Arrange
      const { requireAuth } = require('@/lib/auth/auth-service');
      const { prisma } = require('@/lib/prisma');

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        bio: 'Test bio',
        blogTitle: 'Test Blog',
      };

      requireAuth.mockResolvedValue(mockUser);
      prisma.profile.findFirst.mockResolvedValue(mockProfile);

      // Act
      const result = await getCurrentProfile();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
      expect(prisma.profile.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('인증되지 않은 사용자', async () => {
      // Arrange
      const { requireAuth } = require('@/lib/auth/auth-service');
      requireAuth.mockResolvedValue(null);

      // Act
      const result = await getCurrentProfile();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('인증이 필요합니다.');
    });

    it('프로필이 없는 사용자', async () => {
      // Arrange
      const { requireAuth } = require('@/lib/auth/auth-service');
      const { prisma } = require('@/lib/prisma');

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      requireAuth.mockResolvedValue(mockUser);
      prisma.profile.findFirst.mockResolvedValue(null);

      // Act
      const result = await getCurrentProfile();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toBe('프로필이 없습니다. 프로필을 생성해주세요.');
    });
  });

  describe('createProfile', () => {
    const profileData: CreateProfileInput = {
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      bio: 'Test bio',
      blogTitle: 'Test Blog',
    };

    it('프로필 생성 성공', async () => {
      // Arrange
      const { requireAuth } = require('@/lib/auth/auth-service');
      const { prisma } = require('@/lib/prisma');

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockCreatedProfile = {
        id: 'profile-123',
        userId: 'user-123',
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      requireAuth.mockResolvedValue(mockUser);
      prisma.profile.findFirst.mockResolvedValue(null); // 기존 프로필 없음
      prisma.profile.findUnique.mockResolvedValue(null); // 사용자명 중복 없음
      prisma.profile.create.mockResolvedValue(mockCreatedProfile);

      // Act
      const result = await createProfile(profileData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedProfile);
      expect(result.message).toBe('프로필이 성공적으로 생성되었습니다.');
      expect(prisma.profile.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          bio: 'Test bio',
          blogTitle: 'Test Blog',
        },
      });
    });

    it('이미 프로필이 존재하는 경우 실패', async () => {
      // Arrange
      const { requireAuth } = require('@/lib/auth/auth-service');
      const { prisma } = require('@/lib/prisma');

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const existingProfile = { id: 'existing-profile' };

      requireAuth.mockResolvedValue(mockUser);
      prisma.profile.findFirst.mockResolvedValue(existingProfile);

      // Act
      const result = await createProfile(profileData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('이미 프로필이 존재합니다.');
    });

    it('사용자명 중복으로 실패', async () => {
      // Arrange
      const { requireAuth } = require('@/lib/auth/auth-service');
      const { prisma } = require('@/lib/prisma');

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const existingUsername = { id: 'other-profile', username: 'testuser' };

      requireAuth.mockResolvedValue(mockUser);
      prisma.profile.findFirst.mockResolvedValue(null);
      prisma.profile.findUnique.mockResolvedValue(existingUsername);

      // Act
      const result = await createProfile(profileData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('이미 사용 중인 사용자명입니다.');
    });
  });

  describe('updateProfile', () => {
    const updateData: UpdateProfileInput = {
      displayName: 'Updated User',
      bio: 'Updated bio',
    };

    it('프로필 업데이트 성공', async () => {
      // Arrange
      const { requireAuth } = require('@/lib/auth/auth-service');
      const { prisma } = require('@/lib/prisma');

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const currentProfile = {
        id: 'profile-123',
        userId: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        bio: 'Test bio',
      };
      const updatedProfile = {
        ...currentProfile,
        displayName: 'Updated User',
        bio: 'Updated bio',
      };

      requireAuth.mockResolvedValue(mockUser);
      prisma.profile.findFirst.mockResolvedValue(currentProfile);
      prisma.profile.update.mockResolvedValue(updatedProfile);

      // Act
      const result = await updateProfile(updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedProfile);
      expect(result.message).toBe('프로필이 성공적으로 업데이트되었습니다.');
      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'profile-123' },
        data: {
          displayName: 'Updated User',
          bio: 'Updated bio',
        },
      });
    });

    it('프로필이 존재하지 않는 경우 실패', async () => {
      // Arrange
      const { requireAuth } = require('@/lib/auth/auth-service');
      const { prisma } = require('@/lib/prisma');

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      requireAuth.mockResolvedValue(mockUser);
      prisma.profile.findFirst.mockResolvedValue(null);

      // Act
      const result = await updateProfile(updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('프로필이 존재하지 않습니다.');
    });
  });

  describe('checkUsernameAvailability', () => {
    it('사용 가능한 사용자명', async () => {
      // Arrange
      const { prisma } = require('@/lib/prisma');
      prisma.profile.findUnique.mockResolvedValue(null);

      // Act
      const result = await checkUsernameAvailability('newuser');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ available: true });
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { username: 'newuser' },
      });
    });

    it('이미 사용 중인 사용자명', async () => {
      // Arrange
      const { prisma } = require('@/lib/prisma');
      const existingProfile = { id: 'profile-123', username: 'existinguser' };
      prisma.profile.findUnique.mockResolvedValue(existingProfile);

      // Act
      const result = await checkUsernameAvailability('existinguser');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ available: false });
    });
  });
});

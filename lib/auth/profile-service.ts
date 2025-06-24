import { prisma } from '@/lib/prisma';
import { requireAuth } from './auth-service';
import type {
  UpdateProfileInput,
  CreateProfileInput,
} from '@/lib/validations/profile';
import type { ApiResponse, Profile, ProfileWithStats } from '@/types/database';

/**
 * 현재 사용자의 프로필 조회
 */
export async function getCurrentProfile(): Promise<
  ApiResponse<Profile | null>
> {
  try {
    // 인증 확인
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
      };
    }

    const profile = await prisma.profile.findFirst({
      where: { email: user.email },
    });

    if (!profile) {
      return {
        success: true,
        data: null,
        message: '프로필이 없습니다. 프로필을 생성해주세요.',
      };
    }

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error('프로필 조회 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 프로필 생성 (Phase 1 초기 설정용)
 */
export async function createProfile(
  profileData: CreateProfileInput
): Promise<ApiResponse<Profile>> {
  try {
    // 인증 확인
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
      };
    }

    // 이미 프로필이 있는지 확인
    const existingProfile = await prisma.profile.findFirst({
      where: { email: user.email },
    });

    if (existingProfile) {
      return {
        success: false,
        error: '이미 프로필이 존재합니다.',
      };
    }

    // 사용자명 중복 확인
    const existingUsername = await prisma.profile.findUnique({
      where: { username: profileData.username },
    });

    if (existingUsername) {
      return {
        success: false,
        error: '이미 사용 중인 사용자명입니다.',
      };
    }

    // 프로필 생성
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        email: user.email,
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        blogTitle: profileData.blogTitle,
      },
    });

    return {
      success: true,
      data: profile,
      message: '프로필이 성공적으로 생성되었습니다.',
    };
  } catch (error) {
    console.error('프로필 생성 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 프로필 업데이트
 */
export async function updateProfile(
  profileData: UpdateProfileInput
): Promise<ApiResponse<Profile>> {
  try {
    // 인증 확인
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
      };
    }

    // 현재 프로필 확인
    const currentProfile = await prisma.profile.findFirst({
      where: { email: user.email },
    });

    if (!currentProfile) {
      return {
        success: false,
        error: '프로필이 존재하지 않습니다.',
      };
    }

    // 업데이트할 데이터만 추출 (undefined인 값 제거)
    const updateData = Object.fromEntries(
      Object.entries(profileData).filter(([, value]) => value !== undefined)
    );

    // 프로필 업데이트
    const updatedProfile = await prisma.profile.update({
      where: { id: currentProfile.id },
      data: updateData,
    });

    return {
      success: true,
      data: updatedProfile,
      message: '프로필이 성공적으로 업데이트되었습니다.',
    };
  } catch (error) {
    console.error('프로필 업데이트 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 프로필 통계 조회
 */
export async function getProfileStats(): Promise<
  ApiResponse<ProfileWithStats | null>
> {
  try {
    // 인증 확인
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
      };
    }

    const profile = await prisma.profile.findFirst({
      where: { email: user.email },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
        posts: {
          select: {
            status: true,
            viewCount: true,
            seoScore: {
              select: {
                overallScore: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return {
        success: true,
        data: null,
        message: '프로필이 없습니다.',
      };
    }

    // 통계 계산
    const publishedPosts = profile.posts.filter(
      (post) => post.status === 'PUBLISHED'
    ).length;
    const draftPosts = profile.posts.filter(
      (post) => post.status === 'DRAFT'
    ).length;
    const totalViews = profile.posts.reduce(
      (sum, post) => sum + post.viewCount,
      0
    );
    const seoScores = profile.posts
      .map((post) => post.seoScore?.overallScore)
      .filter((score) => score !== undefined && score !== null) as number[];
    const avgSeoScore =
      seoScores.length > 0
        ? Math.round(
            seoScores.reduce((sum, score) => sum + score, 0) / seoScores.length
          )
        : 0;

    const profileWithStats: ProfileWithStats = {
      ...profile,
      stats: {
        totalViews,
        publishedPosts,
        draftPosts,
        avgSeoScore,
      },
    };

    return {
      success: true,
      data: profileWithStats,
    };
  } catch (error) {
    console.error('프로필 통계 조회 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 사용자명 중복 확인
 */
export async function checkUsernameAvailability(
  username: string
): Promise<ApiResponse<{ available: boolean }>> {
  try {
    const existingProfile = await prisma.profile.findUnique({
      where: { username },
    });

    return {
      success: true,
      data: { available: !existingProfile },
    };
  } catch (error) {
    console.error('사용자명 중복 확인 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

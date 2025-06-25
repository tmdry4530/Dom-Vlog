import { prisma } from '@/lib/prisma';
import type {
  AutoTagRequest,
  AutoTagResponse,
  CategoryRecommendation,
} from '@/types/ai';
import { categoryService } from './CategoryService';

export class AutoTagService {
  /**
   * 선택된 카테고리를 기반으로 포스트에 자동 태깅 적용
   */
  async applyAutoTags(request: AutoTagRequest): Promise<AutoTagResponse> {
    try {
      // 1. 요청 검증
      await this.validateAutoTagRequest(request);

      // 2. 포스트 존재 확인
      const post = await this.getPost(request.postId);
      if (!post) {
        throw new Error('포스트를 찾을 수 없습니다.');
      }

      // 3. 기존 카테고리 처리
      let currentCategoryIds: string[] = [];
      if (!request.replaceExisting) {
        // 기존 카테고리 유지
        const existingCategories = await this.getExistingCategories(
          request.postId
        );
        currentCategoryIds = existingCategories
          .filter((pc) => !pc.isAiSuggested) // 수동 추가된 카테고리만 유지
          .map((pc) => pc.categoryId);
      }

      // 4. 새로운 카테고리 추가
      const newCategoryIds = request.selectedCategories.map(
        (sc) => sc.categoryId
      );
      const finalCategoryIds = [
        ...new Set([...currentCategoryIds, ...newCategoryIds]),
      ];

      // 5. 데이터베이스 업데이트
      const result = await this.updatePostCategories(
        request.postId,
        request.selectedCategories,
        request.replaceExisting || false
      );

      // 6. 응답 생성
      return {
        success: true,
        data: {
          postId: request.postId,
          addedCategories: result.addedCategories,
          removedCategories: result.removedCategories,
          finalCategories: result.finalCategories,
        },
      };
    } catch (error) {
      console.error('자동 태깅 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 포스트에 대한 카테고리 추천 및 자동 태깅
   */
  async recommendAndApplyTags(
    postId: string,
    autoApply: boolean = false
  ): Promise<{
    success: boolean;
    recommendations?: CategoryRecommendation[];
    applied?: boolean;
    error?: string;
  }> {
    try {
      // 1. 포스트 조회
      const post = await this.getPost(postId);
      if (!post) {
        throw new Error('포스트를 찾을 수 없습니다.');
      }

      // 2. 기존 카테고리 조회
      const existingCategories = await this.getExistingCategories(postId);
      const existingCategoryIds = existingCategories.map((pc) => pc.categoryId);

      // 3. AI 카테고리 추천 요청
      const recommendResult = await categoryService.recommendCategories({
        title: post.title,
        content: post.content,
        contentType: 'markdown', // 기본값 markdown
        existingCategories: existingCategoryIds,
        maxSuggestions: 3,
      });

      if (!recommendResult.success || !recommendResult.data) {
        throw new Error('카테고리 추천 실패');
      }

      const recommendations = recommendResult.data.recommendations;

      // 4. 자동 적용 옵션이 활성화된 경우
      let applied = false;
      if (autoApply && recommendations.length > 0) {
        // 신뢰도 0.8 이상인 카테고리만 자동 적용
        const highConfidenceCategories = recommendations.filter(
          (rec) => rec.confidence >= 0.8
        );

        if (highConfidenceCategories.length > 0) {
          const autoTagRequest: AutoTagRequest = {
            postId,
            selectedCategories: highConfidenceCategories.map((rec) => ({
              categoryId: rec.categoryId,
              confidence: rec.confidence,
            })),
            replaceExisting: false,
          };

          const applyResult = await this.applyAutoTags(autoTagRequest);
          applied = applyResult.success;
        }
      }

      return {
        success: true,
        recommendations,
        applied,
      };
    } catch (error) {
      console.error('카테고리 추천 및 자동 태깅 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 포스트의 기존 카테고리 조회
   */
  private async getExistingCategories(postId: string) {
    return await prisma.postCategory.findMany({
      where: {
        postId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * 포스트 조회
   */
  private async getPost(postId: string) {
    return await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
      },
    });
  }

  /**
   * 자동 태깅 요청 검증
   */
  private async validateAutoTagRequest(request: AutoTagRequest): Promise<void> {
    // 기본 필드 검증
    if (!request.postId?.trim()) {
      throw new Error('포스트 ID는 필수입니다.');
    }

    if (
      !request.selectedCategories ||
      request.selectedCategories.length === 0
    ) {
      throw new Error('선택된 카테고리가 없습니다.');
    }

    // 카테고리 개수 제한
    if (request.selectedCategories.length > 5) {
      throw new Error('최대 5개까지 카테고리를 선택할 수 있습니다.');
    }

    // 각 카테고리 검증
    for (const selectedCategory of request.selectedCategories) {
      if (!selectedCategory.categoryId?.trim()) {
        throw new Error('카테고리 ID는 필수입니다.');
      }

      if (
        typeof selectedCategory.confidence !== 'number' ||
        selectedCategory.confidence < 0 ||
        selectedCategory.confidence > 1
      ) {
        throw new Error('신뢰도는 0과 1 사이의 숫자여야 합니다.');
      }

      // 카테고리 존재 여부 확인
      const categoryExists = await prisma.category.findUnique({
        where: {
          id: selectedCategory.categoryId,
        },
      });

      if (!categoryExists) {
        throw new Error(
          `카테고리 '${selectedCategory.categoryId}'가 존재하지 않습니다.`
        );
      }
    }
  }

  /**
   * 포스트 카테고리 업데이트
   */
  private async updatePostCategories(
    postId: string,
    selectedCategories: Array<{
      categoryId: string;
      confidence: number;
    }>,
    replaceExisting: boolean
  ) {
    return await prisma.$transaction(async (tx) => {
      let removedCategories = 0;

      // 기존 카테고리 처리
      if (replaceExisting) {
        // 모든 기존 카테고리 삭제
        const deleteResult = await tx.postCategory.deleteMany({
          where: {
            postId,
          },
        });
        removedCategories = deleteResult.count;
      } else {
        // AI 추천 카테고리만 삭제
        const deleteResult = await tx.postCategory.deleteMany({
          where: {
            postId,
            isAiSuggested: true,
          },
        });
        removedCategories = deleteResult.count;
      }

      // 새로운 카테고리 추가
      const newPostCategories = selectedCategories.map((sc) => ({
        postId,
        categoryId: sc.categoryId,
        confidence: sc.confidence,
        isAiSuggested: true,
        createdAt: new Date(),
      }));

      await tx.postCategory.createMany({
        data: newPostCategories,
      });

      // 최종 카테고리 목록 조회
      const finalPostCategories = await tx.postCategory.findMany({
        where: {
          postId,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      const finalCategories = finalPostCategories.map((pc) => ({
        categoryId: pc.categoryId,
        categoryName: pc.category.name,
        confidence: pc.confidence || 0,
        isAiSuggested: pc.isAiSuggested,
      }));

      return {
        addedCategories: selectedCategories.length,
        removedCategories,
        finalCategories,
      };
    });
  }

  /**
   * 포스트의 카테고리 삭제
   */
  async removePostCategories(
    postId: string,
    categoryIds: string[],
    onlyAiSuggested: boolean = false
  ): Promise<{
    success: boolean;
    removedCount: number;
    error?: string;
  }> {
    try {
      const deleteCondition: any = {
        postId,
        categoryId: {
          in: categoryIds,
        },
      };

      if (onlyAiSuggested) {
        deleteCondition.isAiSuggested = true;
      }

      const deleteResult = await prisma.postCategory.deleteMany({
        where: deleteCondition,
      });

      return {
        success: true,
        removedCount: deleteResult.count,
      };
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      return {
        success: false,
        removedCount: 0,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 포스트의 카테고리 통계 조회
   */
  async getPostCategoryStats(postId: string) {
    try {
      const categoryStats = await prisma.postCategory.groupBy({
        by: ['isAiSuggested'],
        where: {
          postId,
        },
        _count: {
          categoryId: true,
        },
        _avg: {
          confidence: true,
        },
      });

      const stats = {
        total: 0,
        aiSuggested: 0,
        manual: 0,
        averageConfidence: 0,
      };

      categoryStats.forEach((stat) => {
        const count = stat._count.categoryId;
        stats.total += count;

        if (stat.isAiSuggested) {
          stats.aiSuggested = count;
        } else {
          stats.manual = count;
        }

        if (stat._avg.confidence) {
          stats.averageConfidence = stat._avg.confidence;
        }
      });

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('카테고리 통계 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }
}

// 싱글톤 인스턴스 생성
export const autoTagService = new AutoTagService();

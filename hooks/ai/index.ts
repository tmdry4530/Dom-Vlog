// AI 관련 커스텀 훅들 배럴 익스포트

export { useAiStyling } from './useAiStyling';
export { useSeoOptimization } from './useSeoOptimization';
export { useCategoryRecommendation } from './useCategoryRecommendation';
export { useAiIntegration } from './useAiIntegration';

// 타입들도 재내보내기
export type {
  UseAiStylingReturn,
  UseSeoOptimizationReturn,
  UseCategoryRecommendationReturn,
  UseAiIntegrationReturn,
  AiIntegrationRequest,
  AiIntegrationResult,
} from '@/types/ai';

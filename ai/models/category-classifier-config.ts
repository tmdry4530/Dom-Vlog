import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  SafetySetting,
} from '@google/generative-ai';
import type { CategoryClassifierConfig } from '@/types/ai';
import { getGeminiApiKey } from './gemini-config';

// 카테고리 분류 전용 설정
export const categoryClassifierConfig: CategoryClassifierConfig = {
  model: 'gemini-2.5-flash-lite',
  temperature: 0.3, // 일관된 분류를 위한 낮은 temperature
  topK: 20,
  topP: 0.8,
  maxTokens: 2048,
  maxContentLength: 10000, // 10KB 최대 콘텐츠 길이
  timeoutMs: 30000, // 30초 타임아웃
  retryAttempts: 3,
};

// 카테고리 분류용 안전 설정
export const categorySafetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// 카테고리 분류용 Gemini 모델 생성
export function createCategoryClassifierModel(
  customConfig?: Partial<CategoryClassifierConfig>
) {
  try {
    const apiKey = getGeminiApiKey();
    const client = new GoogleGenerativeAI(apiKey);
    const config = { ...categoryClassifierConfig, ...customConfig };

    return client.getGenerativeModel({
      model: config.model,
      generationConfig: {
        temperature: config.temperature,
        topK: config.topK,
        topP: config.topP,
        maxOutputTokens: config.maxTokens,
      },
      safetySettings: categorySafetySettings,
    });
  } catch (error) {
    console.error('카테고리 분류 모델 생성 실패:', error);
    throw new Error('카테고리 분류 모델을 초기화할 수 없습니다.');
  }
}

// 콘텐츠 길이 제한 검증
export function validateContentLength(
  content: string,
  config: CategoryClassifierConfig = categoryClassifierConfig
): boolean {
  return content.length <= config.maxContentLength;
}

// 카테고리 분류 에러 처리
export function handleCategoryClassificationError(error: unknown): never {
  console.error('카테고리 분류 오류:', error);

  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes('API_KEY')) {
    throw new Error('Gemini API 키가 유효하지 않습니다.');
  }

  if (errorMessage.includes('QUOTA_EXCEEDED')) {
    throw new Error('카테고리 분류 API 할당량이 초과되었습니다.');
  }

  if (errorMessage.includes('RATE_LIMIT')) {
    throw new Error(
      '카테고리 분류 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.'
    );
  }

  if (errorMessage.includes('SAFETY')) {
    throw new Error('콘텐츠가 안전 가이드라인을 위반했습니다.');
  }

  if (errorMessage.includes('timeout')) {
    throw new Error('카테고리 분류 요청이 시간 초과되었습니다.');
  }

  throw new Error('카테고리 분류 서비스 처리 중 오류가 발생했습니다.');
}

// 분류 성능 모니터링을 위한 설정
export const performanceConfig = {
  // 응답 시간 임계값 (ms)
  responseTimeThreshold: 5000,
  // 신뢰도 점수 임계값
  confidenceThreshold: 0.7,
  // 배치 처리 크기
  batchSize: 5,
  // 캐시 TTL (ms)
  cacheTTL: 24 * 60 * 60 * 1000, // 24시간
} as const;

// 카테고리별 가중치 설정 (도메인 특화)
export const categoryWeights = {
  'web-development': 1.2, // 웹 개발이 주력 분야이므로 가중치 증가
  blockchain: 1.1,
  cryptography: 1.1,
  'ai-ml': 1.0,
  devops: 1.0,
  tutorial: 0.9, // 일반적인 카테고리이므로 가중치 감소
  review: 0.9,
} as const;

// 기본 카테고리 매핑 (DB 카테고리와 AI 분류 결과 매핑)
export const defaultCategoryMapping = {
  // 웹 개발 관련
  'web development': 'web-development',
  frontend: 'web-development',
  backend: 'web-development',
  fullstack: 'web-development',
  react: 'web-development',
  nextjs: 'web-development',
  vue: 'web-development',
  angular: 'web-development',

  // 블록체인 관련
  blockchain: 'blockchain',
  cryptocurrency: 'blockchain',
  'smart contract': 'blockchain',
  defi: 'blockchain',
  web3: 'blockchain',

  // 암호학 관련
  cryptography: 'cryptography',
  encryption: 'cryptography',
  security: 'cryptography',
  authentication: 'cryptography',

  // AI/ML 관련
  'artificial intelligence': 'ai-ml',
  'machine learning': 'ai-ml',
  'deep learning': 'ai-ml',
  'neural network': 'ai-ml',
  llm: 'ai-ml',
  gemini: 'ai-ml',

  // DevOps 관련
  devops: 'devops',
  docker: 'devops',
  kubernetes: 'devops',
  'ci/cd': 'devops',
  deployment: 'devops',
  infrastructure: 'devops',

  // 콘텐츠 타입
  tutorial: 'tutorial',
  guide: 'tutorial',
  'how-to': 'tutorial',
  review: 'review',
  analysis: 'review',
} as const;

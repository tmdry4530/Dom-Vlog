import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  SafetySetting,
} from '@google/generative-ai';
import type { GeminiConfig } from '@/types/ai';

// 기본 Gemini 설정
export const DEFAULT_GEMINI_CONFIG: Partial<GeminiConfig> = {
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
  safetySettings: [
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
  ] as SafetySetting[],
};

// 환경 변수에서 API 키 가져오기
export function getGeminiApiKey(): string {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GOOGLE_AI_API_KEY 환경 변수가 설정되지 않았습니다. ' +
        '.env.local 파일에 GOOGLE_AI_API_KEY를 추가해주세요.'
    );
  }
  return apiKey;
}

// Gemini 클라이언트 생성
export function createGeminiClient(
  config?: Partial<GeminiConfig>
): GoogleGenerativeAI {
  try {
    const apiKey = config?.apiKey || getGeminiApiKey();
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Gemini 클라이언트 생성 실패:', error);
    throw new Error('Gemini AI 서비스에 연결할 수 없습니다.');
  }
}

// 모델별 설정
export const MODEL_CONFIGS = {
  'gemini-1.5-flash': {
    ...DEFAULT_GEMINI_CONFIG,
    model: 'gemini-1.5-flash',
    generationConfig: {
      ...DEFAULT_GEMINI_CONFIG.generationConfig,
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  },
  'gemini-1.5-pro': {
    ...DEFAULT_GEMINI_CONFIG,
    model: 'gemini-1.5-pro',
    generationConfig: {
      ...DEFAULT_GEMINI_CONFIG.generationConfig,
      maxOutputTokens: 4096, // 더 긴 응답 허용
      temperature: 0.8, // 더 창의적인 응답
    },
  },
} as const;

// SEO 서비스용 설정
export const geminiConfig = {
  seo: {
    model: 'gemini-1.5-flash',
    temperature: 0.4, // SEO 최적화를 위한 일관된 출력
    topK: 20,
    topP: 0.85,
    maxTokens: 2048,
    maxContentLength: 10000, // 10KB 최대 콘텐츠 길이
    timeoutMs: 30000, // 30초 타임아웃
    retryAttempts: 3,
  },
  keyword: {
    model: 'gemini-1.5-flash',
    temperature: 0.3, // 키워드 분석을 위한 정확성 중시
    topK: 15,
    topP: 0.8,
    maxTokens: 1024,
    maxContentLength: 8000,
    timeoutMs: 20000,
    retryAttempts: 2,
  },
  validation: {
    model: 'gemini-1.5-flash',
    temperature: 0.2, // 검증을 위한 정확성 최우선
    topK: 10,
    topP: 0.7,
    maxTokens: 1536,
    maxContentLength: 12000,
    timeoutMs: 25000,
    retryAttempts: 3,
  },
} as const;

// 모델 인스턴스 생성 헬퍼
export function createGeminiModel(
  modelName: keyof typeof MODEL_CONFIGS = 'gemini-1.5-flash',
  customConfig?: Partial<GeminiConfig>
) {
  try {
    const client = createGeminiClient(customConfig);
    const config = { ...MODEL_CONFIGS[modelName], ...customConfig };

    return client.getGenerativeModel({
      model: config.model!,
      generationConfig: config.generationConfig,
      safetySettings: config.safetySettings,
    });
  } catch (error) {
    console.error(`${modelName} 모델 생성 실패:`, error);
    throw new Error(`${modelName} 모델을 초기화할 수 없습니다.`);
  }
}

// 스타일 업그레이드용 모델 설정
export function createStyleUpgradeModel(customConfig?: Partial<GeminiConfig>) {
  return createGeminiModel('gemini-1.5-flash', {
    ...customConfig,
    generationConfig: {
      temperature: 0.6, // 일관된 스타일링을 위해 조정
      topK: 30,
      topP: 0.9,
      maxOutputTokens: 2048,
      ...customConfig?.generationConfig,
    },
  });
}

// 가독성 분석용 모델 설정
export function createReadabilityAnalyzerModel(
  customConfig?: Partial<GeminiConfig>
) {
  return createGeminiModel('gemini-1.5-flash', {
    ...customConfig,
    generationConfig: {
      temperature: 0.3, // 정확한 분석을 위해 낮은 temperature
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 1024,
      ...customConfig?.generationConfig,
    },
  });
}

// 에러 처리 헬퍼
export function handleGeminiError(error: unknown): never {
  console.error('Gemini API 오류:', error);

  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes('API_KEY')) {
    throw new Error('Gemini API 키가 유효하지 않습니다.');
  }

  if (errorMessage.includes('QUOTA_EXCEEDED')) {
    throw new Error('Gemini API 할당량이 초과되었습니다.');
  }

  if (errorMessage.includes('RATE_LIMIT')) {
    throw new Error(
      'Gemini API 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.'
    );
  }

  if (errorMessage.includes('SAFETY')) {
    throw new Error('콘텐츠가 안전 가이드라인을 위반했습니다.');
  }

  throw new Error('Gemini AI 서비스 처리 중 오류가 발생했습니다.');
}

// 모델 상태 확인
export async function checkGeminiModelHealth(
  modelName?: keyof typeof MODEL_CONFIGS
): Promise<boolean> {
  try {
    const model = createGeminiModel(modelName);

    // 간단한 테스트 요청
    const result = await model.generateContent('테스트');
    return !!result.response.text();
  } catch (error) {
    console.warn('Gemini 모델 상태 확인 실패:', error);
    return false;
  }
}

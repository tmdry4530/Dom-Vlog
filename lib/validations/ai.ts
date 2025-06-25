import { z } from 'zod';

// 스타일 업그레이드 요청 스키마
export const styleUpgradeRequestSchema = z.object({
  content: z
    .string()
    .min(10, '콘텐츠는 최소 10자 이상이어야 합니다.')
    .max(50000, '콘텐츠는 최대 50,000자까지 허용됩니다.')
    .refine(
      (content) => content.trim().length > 0,
      '콘텐츠가 비어있을 수 없습니다.'
    ),
  contentType: z.enum(['markdown', 'html'], {
    errorMap: () => ({
      message: '지원되는 콘텐츠 타입은 markdown 또는 html입니다.',
    }),
  }),
  options: z
    .object({
      includeTableOfContents: z.boolean().optional().default(false),
      enhanceCodeBlocks: z.boolean().optional().default(true),
      improveHeadingStructure: z.boolean().optional().default(true),
      optimizeForSEO: z.boolean().optional().default(false),
    })
    .optional()
    .default({}),
});

// 가독성 분석 요청 스키마
export const readabilityAnalysisRequestSchema = z.object({
  content: z
    .string()
    .min(10, '분석할 콘텐츠는 최소 10자 이상이어야 합니다.')
    .max(50000, '분석할 콘텐츠는 최대 50,000자까지 허용됩니다.'),
  contentType: z.enum(['markdown', 'html']).optional().default('markdown'),
});

// 목차 생성 요청 스키마
export const tocGenerationRequestSchema = z.object({
  content: z
    .string()
    .min(50, '목차 생성을 위해서는 최소 50자 이상의 콘텐츠가 필요합니다.')
    .max(50000, '콘텐츠는 최대 50,000자까지 허용됩니다.'),
  maxDepth: z.number().min(1).max(6).optional().default(3),
  format: z.enum(['markdown', 'html']).optional().default('markdown'),
});

// AI 설정 스키마
export const aiConfigSchema = z.object({
  model: z.string().min(1, '모델명은 필수입니다.'),
  apiKey: z.string().min(1, 'API 키는 필수입니다.'),
  maxTokens: z.number().min(100).max(8192).optional().default(2048),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  timeoutMs: z.number().min(1000).max(30000).optional().default(15000),
});

// 콘텐츠 처리 옵션 스키마
export const contentProcessingOptionsSchema = z.object({
  preserveOriginalStructure: z.boolean().optional().default(false),
  enhanceCodeSyntax: z.boolean().optional().default(true),
  generateTOC: z.boolean().optional().default(false),
  optimizeHeadings: z.boolean().optional().default(true),
  improveReadability: z.boolean().optional().default(true),
});

// Gemini 설정 스키마
export const geminiConfigSchema = z.object({
  apiKey: z.string().min(1, 'Gemini API 키는 필수입니다.'),
  model: z
    .enum(['gemini-2.5-flash-lite', 'gemini-1.5-pro'])
    .optional()
    .default('gemini-2.5-flash-lite'),
  generationConfig: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      topK: z.number().min(1).max(100).optional(),
      topP: z.number().min(0).max(1).optional(),
      maxOutputTokens: z.number().min(100).max(8192).optional(),
    })
    .optional(),
  safetySettings: z
    .array(
      z.object({
        category: z.string(),
        threshold: z.string(),
      })
    )
    .optional(),
});

// SEO 검증 요청 스키마
export const seoValidationRequestSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters'),
  metadata: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  url: z.string().url().optional(),
});

// 카테고리 추천 요청 스키마
export const categoryRecommendRequestSchema = z.object({
  title: z
    .string()
    .min(5, '제목은 최소 5자 이상이어야 합니다.')
    .max(200, '제목은 최대 200자까지 허용됩니다.'),
  content: z
    .string()
    .min(50, '콘텐츠는 최소 50자 이상이어야 합니다.')
    .max(50000, '콘텐츠는 최대 50,000자까지 허용됩니다.')
    .refine(
      (content) => content.trim().length > 0,
      '콘텐츠가 비어있을 수 없습니다.'
    ),
  contentType: z.enum(['markdown', 'html'], {
    errorMap: () => ({
      message: '지원되는 콘텐츠 타입은 markdown 또는 html입니다.',
    }),
  }),
  existingCategories: z
    .array(z.string().min(1, '카테고리 ID는 비어있을 수 없습니다.'))
    .optional(),
  maxSuggestions: z.number().min(1).max(10).optional().default(3),
});

// 자동 태깅 요청 스키마
export const autoTagRequestSchema = z.object({
  postId: z.string().min(1, '포스트 ID는 필수입니다.'),
  selectedCategories: z
    .array(
      z.object({
        categoryId: z.string().min(1, '카테고리 ID는 필수입니다.'),
        confidence: z
          .number()
          .min(0, '신뢰도는 0 이상이어야 합니다.')
          .max(1, '신뢰도는 1 이하여야 합니다.'),
      })
    )
    .min(1, '최소 하나의 카테고리를 선택해야 합니다.')
    .max(5, '최대 5개까지 카테고리를 선택할 수 있습니다.'),
  replaceExisting: z.boolean().optional().default(false),
});

// 카테고리 분류기 설정 스키마
export const categoryClassifierConfigSchema = z.object({
  model: z.string().min(1, '모델명은 필수입니다.'),
  temperature: z.number().min(0).max(2).optional().default(0.3),
  topK: z.number().min(1).max(100).optional().default(20),
  topP: z.number().min(0).max(1).optional().default(0.8),
  maxTokens: z.number().min(100).max(4096).optional().default(2048),
  maxContentLength: z.number().min(100).max(50000).optional().default(10000),
  timeoutMs: z.number().min(1000).max(60000).optional().default(30000),
  retryAttempts: z.number().min(0).max(5).optional().default(3),
});

// 타입 추론
export type StyleUpgradeRequestInput = z.infer<
  typeof styleUpgradeRequestSchema
>;
export type ReadabilityAnalysisRequestInput = z.infer<
  typeof readabilityAnalysisRequestSchema
>;
export type TocGenerationRequestInput = z.infer<
  typeof tocGenerationRequestSchema
>;
export type AIConfigInput = z.infer<typeof aiConfigSchema>;
export type ContentProcessingOptionsInput = z.infer<
  typeof contentProcessingOptionsSchema
>;
export type GeminiConfigInput = z.infer<typeof geminiConfigSchema>;
export type SEOValidationRequest = z.infer<typeof seoValidationRequestSchema>;
export type CategoryRecommendRequestInput = z.infer<
  typeof categoryRecommendRequestSchema
>;
export type AutoTagRequestInput = z.infer<typeof autoTagRequestSchema>;
export type CategoryClassifierConfigInput = z.infer<
  typeof categoryClassifierConfigSchema
>;

// 유효성 검사 헬퍼 함수들
export function validateContentLength(
  content: string,
  maxLength: number = 50000
): boolean {
  return content.length <= maxLength && content.trim().length > 0;
}

export function validateContentType(
  contentType: string
): contentType is 'markdown' | 'html' {
  return ['markdown', 'html'].includes(contentType);
}

export function sanitizeContent(content: string): string {
  // 악의적인 스크립트나 HTML 태그 제거
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function extractTextFromMarkdown(markdown: string): string {
  // 기본적인 마크다운에서 텍스트만 추출
  return markdown
    .replace(/#{1,6}\s/g, '') // 헤더 마크 제거
    .replace(/\*\*(.*?)\*\*/g, '$1') // 볼드 제거
    .replace(/\*(.*?)\*/g, '$1') // 이탤릭 제거
    .replace(/```[\s\S]*?```/g, '[코드블록]') // 코드블록을 플레이스홀더로 대체
    .replace(/`([^`]+)`/g, '$1') // 인라인 코드 제거
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 링크에서 텍스트만 추출
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '[이미지: $1]') // 이미지를 플레이스홀더로 대체
    .trim();
}

export function validateCategoryId(categoryId: string): boolean {
  return categoryId.length > 0 && categoryId.length <= 50;
}

export function validateConfidenceScore(confidence: number): boolean {
  return confidence >= 0 && confidence <= 1;
}

export function extractTechnicalTerms(content: string): string[] {
  // 기술적 용어 추출을 위한 정규 표현식 패턴들
  const patterns = [
    /\b(?:React|Vue|Angular|Next\.js|Nuxt\.js|Svelte)\b/gi, // 프론트엔드 프레임워크
    /\b(?:Node\.js|Express|FastAPI|Django|Flask|Rails)\b/gi, // 백엔드 프레임워크
    /\b(?:TypeScript|JavaScript|Python|Java|Go|Rust|C\+\+)\b/gi, // 프로그래밍 언어
    /\b(?:Docker|Kubernetes|AWS|GCP|Azure|Vercel)\b/gi, // 인프라/클라우드
    /\b(?:PostgreSQL|MongoDB|Redis|MySQL|SQLite)\b/gi, // 데이터베이스
    /\b(?:Git|GitHub|GitLab|CI\/CD|Jenkins)\b/gi, // DevOps
  ];

  const terms = new Set<string>();

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match) => terms.add(match.toLowerCase()));
    }
  });

  return Array.from(terms);
}

export function extractFrameworksAndTools(content: string): string[] {
  // 프레임워크와 도구 추출
  const frameworks = [
    'react',
    'vue',
    'angular',
    'next.js',
    'nuxt.js',
    'svelte',
    'gatsby',
    'express',
    'fastapi',
    'django',
    'flask',
    'rails',
    'spring',
    'docker',
    'kubernetes',
    'terraform',
    'ansible',
    'webpack',
    'vite',
    'parcel',
    'rollup',
    'jest',
    'cypress',
    'playwright',
    'vitest',
  ];

  const contentLower = content.toLowerCase();
  return frameworks.filter((framework) =>
    contentLower.includes(framework.toLowerCase())
  );
}

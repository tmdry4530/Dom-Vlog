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
    .enum(['gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'])
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

import { ApiResponse } from './database';

// ===== SEO 추천 관련 타입 =====

export interface SeoRecommendationRequest {
  content: string;
  title: string;
  contentType: 'markdown' | 'html';
  targetKeywords?: string[];
  options?: {
    generateSlug?: boolean;
    optimizeForMobile?: boolean;
    includeSchema?: boolean;
    language?: 'ko' | 'en';
  };
}

export interface SeoRecommendationResponse
  extends ApiResponse<SeoRecommendationData> {
  processing?: {
    timeMs: number;
    model: string;
    wordsAnalyzed: number;
  };
}

export interface SeoRecommendationData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  openGraph: OpenGraphData;
  suggestedSlug: string;
  schema?: Record<string, any>;
  confidence: ConfidenceScores;
}

export interface OpenGraphData {
  title: string;
  description: string;
  image?: string;
  type?: 'article' | 'website';
  locale?: string;
}

export interface ConfidenceScores {
  overall: number; // 0-100
  keywords: number; // 0-100
  description: number; // 0-100
  title: number; // 0-100
  slug: number; // 0-100
}

// ===== SEO 검증 관련 타입 =====

export interface SeoValidationRequest {
  postId?: string;
  content?: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    slug?: string;
  };
  options?: {
    checkLighthouse?: boolean;
    includeDetailedAnalysis?: boolean;
  };
}

export interface SeoValidationResponse extends ApiResponse<SeoValidationData> {
  processing?: {
    timeMs: number;
    checksPerformed: string[];
  };
}

export interface SeoValidationData {
  overallScore: number; // 0-100
  scores: DetailedScores;
  recommendations: string[];
  issues: SeoIssue[];
  lighthouse?: LighthouseResult;
}

export interface DetailedScores {
  title: number; // 제목 최적화 점수 (0-100)
  description: number; // 설명 최적화 점수 (0-100)
  keywords: number; // 키워드 최적화 점수 (0-100)
  structure: number; // 구조 점수 (0-100)
  readability: number; // 가독성 점수 (0-100)
  technical: number; // 기술적 SEO 점수 (0-100)
  performance?: number; // 성능 점수 (0-100, 선택적)
}

export interface SeoIssue {
  severity: 'low' | 'medium' | 'high';
  category:
    | 'title'
    | 'description'
    | 'keywords'
    | 'structure'
    | 'technical'
    | 'performance';
  message: string;
  fix: string;
  impact?: number; // 예상 개선 효과 (0-100)
}

export interface LighthouseResult {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  url: string;
  timestamp: string;
}

// ===== 메타데이터 추출 관련 타입 =====

export interface MetadataExtractionRequest {
  content: string;
  contentType: 'markdown' | 'html';
  options?: {
    extractImages?: boolean;
    calculateReadingTime?: boolean;
    analyzeStructure?: boolean;
  };
}

export interface MetadataExtractionResponse
  extends ApiResponse<ExtractedMetadata> {}

export interface ExtractedMetadata {
  keywords: string[];
  headings: HeadingStructure[];
  images: ImageMetadata[];
  wordCount: number;
  readingTime: number; // 분 단위
  structure: ContentStructure;
  language?: string;
}

export interface HeadingStructure {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  id?: string;
  position: number; // 콘텐츠 내 위치 (0-100%)
}

export interface ImageMetadata {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  size?: number; // 파일 크기 (bytes)
}

export interface ContentStructure {
  hasTableOfContents: boolean;
  headingDistribution: Record<number, number>; // 레벨별 제목 개수
  paragraphCount: number;
  codeBlockCount: number;
  listCount: number;
  linkCount: number;
  averageParagraphLength: number;
  readabilityMetrics: ReadabilityMetrics;
}

export interface ReadabilityMetrics {
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  fleschKincaidGradeLevel: number;
  fleschReadingEase: number;
}

// ===== 키워드 분석 관련 타입 =====

export interface KeywordAnalysis {
  primary: string[]; // 주요 키워드 (3-5개)
  secondary: string[]; // 보조 키워드 (5-10개)
  longtail: string[]; // 롱테일 키워드 (10-20개)
  entities: string[]; // 개체명 (사람, 장소, 조직 등)
  density: KeywordDensity[];
}

export interface KeywordDensity {
  keyword: string;
  count: number;
  density: number; // 0-100%
  positions: number[]; // 콘텐츠 내 위치들
}

// ===== URL 슬러그 생성 관련 타입 =====

export interface SlugGenerationOptions {
  maxLength?: number; // 기본값: 50
  includeNumbers?: boolean; // 기본값: true
  separateWords?: boolean; // 기본값: true
  removeStopWords?: boolean; // 기본값: true
  language?: 'ko' | 'en'; // 기본값: 'ko'
}

export interface SlugSuggestion {
  slug: string;
  confidence: number; // 0-100
  seoScore: number; // 0-100
  readability: number; // 0-100
}

// ===== AI 모델 응답 관련 타입 =====

export interface GeminiSeoResponse {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  openGraphTitle: string;
  openGraphDescription: string;
  suggestedSlug: string;
  reasoning?: string; // AI의 추천 이유
}

export interface SeoPromptVariables {
  content: string;
  title: string;
  contentType: string;
  targetKeywords?: string;
  language: string;
  maxTitleLength: string;
  maxDescriptionLength: string;
  includeSchema: string;
}

// ===== 서비스 설정 관련 타입 =====

export interface SeoServiceConfig {
  geminiModel: string;
  maxContentLength: number;
  defaultLanguage: 'ko' | 'en';
  timeoutMs: number;
  retryAttempts: number;
  cacheEnabled: boolean;
  cacheTtl: number; // seconds
}

// ===== 성능 모니터링 관련 타입 =====

export interface SeoProcessingMetrics {
  requestId: string;
  startTime: number;
  endTime: number;
  processingTimeMs: number;
  model: string;
  contentLength: number;
  wordsAnalyzed: number;
  tokensUsed?: number;
  cacheHit: boolean;
  success: boolean;
  errorCode?: string;
}

// ===== 스키마 마크업 관련 타입 =====

export interface BlogPostSchema {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  image?: string;
  author: {
    '@type': 'Person';
    name: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  keywords: string[];
}

// ===== 에러 관련 타입 =====

export interface SeoError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
}

export const SEO_ERROR_CODES = {
  INVALID_CONTENT: 'INVALID_CONTENT',
  CONTENT_TOO_LONG: 'CONTENT_TOO_LONG',
  CONTENT_TOO_SHORT: 'CONTENT_TOO_SHORT',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  API_QUOTA_EXCEEDED: 'API_QUOTA_EXCEEDED',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  INVALID_LANGUAGE: 'INVALID_LANGUAGE',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
} as const;

export type SeoErrorCode =
  (typeof SEO_ERROR_CODES)[keyof typeof SEO_ERROR_CODES];

// ===== 유틸리티 타입 =====

export type SeoRecommendationServiceResult<T> = {
  success: boolean;
  data?: T;
  error?: SeoError;
  metrics?: SeoProcessingMetrics;
};

// 기존 데이터베이스 타입과의 호환성을 위한 매핑 타입
export interface DatabaseSeoScore {
  id: string;
  postId: string;
  overallScore: number;
  readabilityScore: number;
  performanceScore: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: string;
  wordCount?: number;
  readingTime?: number;
  isProcessed: boolean;
  processedAt?: Date;
  aiModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SEORecommendation {
  keywords: string[];
  metaDescription: string;
  ogTags: {
    title: string;
    description: string;
    type: string;
    image?: string;
  };
  urlSlug: string;
  confidence: number;
}

export interface SEOValidationResult {
  overallScore: number;
  passed: boolean; // true if score >= 80
  metrics: {
    contentScore: number;
    technicalScore: number;
    metadataScore: number;
    performanceScore: number;
  };
  suggestions: string[];
  validatedAt: string;
}

export interface SEOMetrics {
  titleLength: number;
  metaDescriptionLength: number;
  headingStructure: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
  };
  imageAltTextCount: number;
  internalLinksCount: number;
  externalLinksCount: number;
  contentLength: number;
  keywordDensity: { [keyword: string]: number };
}

export interface SEOValidationRequest {
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  url?: string;
}

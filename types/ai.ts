// AI 서비스 관련 타입 정의
import { SeoRecommendationData, SEOValidationResult } from './seo';

export interface StyleUpgradeRequest {
  content: string;
  contentType: 'markdown' | 'html';
  options?: {
    includeTableOfContents?: boolean;
    enhanceCodeBlocks?: boolean;
    improveHeadingStructure?: boolean;
    optimizeForSEO?: boolean;
  };
}

export interface StyleUpgradeResponse {
  success: boolean;
  data?: {
    enhancedContent: string;
    readabilityScore: number;
    improvements: string[];
    processingTime: number;
    metadata?: {
      originalLength: number;
      enhancedLength: number;
      improvementRatio: number;
    };
  };
  error?: string;
  message?: string;
}

export interface ReadabilityScore {
  score: number; // 0-100
  breakdown: {
    headingStructure: number;
    codeBlockFormatting: number;
    paragraphFlow: number;
    listOrganization: number;
    overallClarity: number;
  };
  suggestions: string[];
}

export interface ContentProcessingOptions {
  preserveOriginalStructure?: boolean;
  enhanceCodeSyntax?: boolean;
  generateTOC?: boolean;
  optimizeHeadings?: boolean;
  improveReadability?: boolean;
}

export interface AIProcessingResult {
  processedContent: string;
  readabilityScore: ReadabilityScore;
  processingMetrics: {
    startTime: number;
    endTime: number;
    duration: number;
    tokensUsed?: number;
  };
  improvements: string[];
}

export interface AIServiceConfig {
  model: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface PromptTemplate {
  system: string;
  user: string;
  variables?: Record<string, string>;
}

// AI 에러 타입
export interface AIError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

// AI 서비스 인터페이스
export interface IStyleUpgradeService {
  enhanceContent(input: StyleUpgradeRequest): Promise<AIProcessingResult>;
  analyzeReadability(content: string): Promise<ReadabilityScore>;
  generateTableOfContents(content: string): Promise<string>;
}

export interface IReadabilityAnalyzer {
  calculateScore(content: string): Promise<ReadabilityScore>;
  identifyImprovements(content: string): Promise<string[]>;
}

export interface IContentProcessor {
  preprocessContent(
    content: string,
    contentType: 'markdown' | 'html'
  ): Promise<string>;
  postprocessContent(content: string): Promise<string>;
  extractCodeBlocks(content: string): string[];
  extractHeadings(content: string): Array<{ level: number; text: string }>;
}

// Gemini 관련 타입
export interface GeminiConfig {
  apiKey: string;
  model: 'gemini-2.5-flash-lite' | 'gemini-1.5-pro';
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  safetySettings?: any[]; // Google AI SDK의 SafetySetting 타입 사용
}

// LangChain 관련 타입
export interface LangChainPipelineConfig {
  llm: any; // LangChain LLM 인스턴스
  prompt: PromptTemplate;
  outputParser?: any;
  memory?: any;
}

// ===== 카테고리 추천 관련 타입 =====

// 카테고리 추천 요청 타입
export interface CategoryRecommendRequest {
  title: string;
  content: string;
  contentType: 'markdown' | 'html';
  existingCategories?: string[]; // 기존 카테고리 ID 배열
  maxSuggestions?: number; // 기본값: 3
}

// 카테고리 추천 응답 타입
export interface CategoryRecommendResponse {
  success: boolean;
  data?: {
    recommendations: CategoryRecommendation[];
    processingTime: number;
    model: string;
  };
  error?: string;
}

// 개별 카테고리 추천 정보
export interface CategoryRecommendation {
  categoryId: string;
  categoryName: string;
  confidence: number; // 0.0-1.0
  reasoning: string;
  isExisting: boolean; // 기존 카테고리 여부
  keyTopics: string[];
}

// 자동 태깅 요청 타입
export interface AutoTagRequest {
  postId: string;
  selectedCategories: Array<{
    categoryId: string;
    confidence: number;
  }>;
  replaceExisting?: boolean; // 기존 카테고리 대체 여부
}

// 자동 태깅 응답 타입
export interface AutoTagResponse {
  success: boolean;
  data?: {
    postId: string;
    addedCategories: number;
    removedCategories: number;
    finalCategories: Array<{
      categoryId: string;
      categoryName: string;
      confidence: number;
      isAiSuggested: boolean;
    }>;
  };
  error?: string;
}

// AI 콘텐츠 분석 결과
export interface ContentAnalysis {
  primaryTopic: string;
  secondaryTopics: string[];
  technicalLevel: 'beginner' | 'intermediate' | 'advanced';
  contentType: 'tutorial' | 'review' | 'analysis' | 'guide' | 'news' | 'other';
  keyTopics: string[];
  technicalTerms: string[];
  frameworksAndTools: string[];
}

// 카테고리 매칭 결과
export interface CategoryMatch {
  categoryId: string;
  categoryName: string;
  matchScore: number; // 0.0-1.0
  matchReasons: string[];
  topicOverlap: string[];
}

// Gemini AI 카테고리 분류 응답
export interface GeminiCategoryResponse {
  recommendations: CategoryRecommendation[];
  contentAnalysis: ContentAnalysis;
}

// 카테고리 추천 서비스 결과
export interface CategoryRecommendationResult {
  success: boolean;
  data?: {
    recommendations: CategoryRecommendation[];
    contentAnalysis: ContentAnalysis;
    processingMetrics: ProcessingMetrics;
  };
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

// 처리 메트릭
export interface ProcessingMetrics {
  requestId: string;
  startTime: number;
  endTime: number;
  processingTimeMs: number;
  contentLength: number;
  modelUsed: string;
  success: boolean;
}

// 카테고리 분류기 설정
export interface CategoryClassifierConfig {
  model: string;
  temperature: number;
  topK: number;
  topP: number;
  maxTokens: number;
  maxContentLength: number;
  timeoutMs: number;
  retryAttempts: number;
}

// 정확도 통계
export interface AccuracyStats {
  totalRecommendations: number;
  correctRecommendations: number;
  accuracy: number; // 0.0-1.0
  averageConfidence: number;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    totalRecommendations: number;
    correctRecommendations: number;
    accuracy: number;
  }>;
}

// AI 통합 관련 타입들
export interface AiIntegrationRequest {
  title: string;
  content: string;
  postId?: string;
  enableStyling?: boolean;
  enableSeo?: boolean;
  enableCategories?: boolean;
}

export interface AiIntegrationResult {
  styling?: {
    success: boolean;
    data?: StyleUpgradeData;
    error?: string;
  };
  seo?: {
    success: boolean;
    data?: SeoRecommendationData;
    error?: string;
  };
  categories?: {
    success: boolean;
    data?: CategoryRecommendation[];
    error?: string;
  };
  overallSuccess: boolean;
  processedAt: Date;
}

export interface AiOperation {
  type: 'styling' | 'seo' | 'categories';
  priority: number;
  estimatedDuration: number; // milliseconds
}

export interface LoadingState {
  isLoading: boolean;
  progress: number; // 0-100
  currentStep?: string;
  estimatedTimeRemaining?: number;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  canRetry: boolean;
  retryDelay?: number;
  fallbackOptions?: string[];
}

export interface ProgressUpdate {
  step: string;
  progress: number;
  message: string;
}

export interface RetryStrategy {
  maxRetries: number;
  backoffMultiplier: number;
  baseDelay: number;
}

// Hook return types
export interface UseAiStylingReturn {
  enhanceContent: (content: string) => Promise<StyleUpgradeResponse>;
  isLoading: boolean;
  error: string | null;
  lastResult: StyleUpgradeData | null;
  clearResult: () => void;
  clearError: () => void;
}

export interface UseSeoOptimizationReturn {
  generateSeoData: (
    content: string,
    title: string
  ) => Promise<SeoRecommendationData>;
  validateSeo: (content: string) => Promise<SEOValidationResult>;
  isGenerating: boolean;
  isValidating: boolean;
  seoData: SeoRecommendationData | null;
  validationResult: SEOValidationResult | null;
  error: string | null;
  clearData: () => void;
  clearError: () => void;
}

export interface UseCategoryRecommendationReturn {
  recommendCategories: (
    title: string,
    content: string
  ) => Promise<CategoryRecommendation[]>;
  applyCategories: (
    postId: string,
    categories: SelectedCategory[]
  ) => Promise<boolean>;
  isRecommending: boolean;
  isApplying: boolean;
  recommendations: CategoryRecommendation[];
  error: string | null;
  clearRecommendations: () => void;
  clearError: () => void;
}

export interface UseAiIntegrationReturn {
  processAllAiFeatures: (
    request: AiIntegrationRequest
  ) => Promise<AiIntegrationResult>;
  isProcessing: boolean;
  progress: number; // 0-100
  currentStep: 'styling' | 'seo' | 'categories' | 'done' | null;
  results: AiIntegrationResult | null;
  error: string | null;
  clearResults: () => void;
  clearError: () => void;
}

export interface SelectedCategory {
  id: string;
  name: string;
  confidence: number;
}

export interface StyleUpgradeData {
  enhancedContent: string;
  readabilityScore: number;
  improvements: string[];
  processingTime: number;
  metadata?: {
    originalLength: number;
    enhancedLength: number;
    improvementRatio: number;
  };
}

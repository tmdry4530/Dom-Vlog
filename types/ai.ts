// AI 서비스 관련 타입 정의

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
  model: 'gemini-2.5-flash-lite' | 'gemini-1.5-flash' | 'gemini-1.5-pro';
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

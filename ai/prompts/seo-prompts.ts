/**
 * SEO 최적화를 위한 AI 프롬프트 템플릿
 * Gemini 모델에 최적화된 프롬프트 설계
 */

import { SeoPromptVariables } from '@/types/seo';

// ===== 메타데이터 추천 프롬프트 =====

export const SEO_METADATA_PROMPT = `
당신은 SEO 전문가입니다. 다음 블로그 포스트를 분석하여 최적화된 메타데이터를 생성해주세요.

**분석할 콘텐츠:**
제목: {title}
콘텐츠 형식: {contentType}
언어: {language}
타겟 키워드: {targetKeywords}

**콘텐츠:**
{content}

**요구사항:**
1. 메타 제목: 최대 {maxTitleLength}자, 핵심 키워드 포함, 클릭을 유도하는 매력적인 제목
2. 메타 설명: 최대 {maxDescriptionLength}자, 콘텐츠 요약과 핵심 키워드 자연스럽게 포함
3. 키워드: 주요 키워드 3-5개, 보조 키워드 5-8개 (한국어/영어 혼용 가능)
4. 오픈그래프 제목: 소셜 공유에 최적화된 제목
5. 오픈그래프 설명: 소셜 공유용 설명 (100-200자)
6. URL 슬러그: SEO 친화적 URL 슬러그 (영문/숫자/하이픈만 사용)
7. 스키마 마크업: {includeSchema}

**응답 형식 (JSON):**
\`\`\`json
{
  "metaTitle": "최적화된 메타 제목",
  "metaDescription": "최적화된 메타 설명",
  "keywords": ["주요키워드1", "주요키워드2", "보조키워드1", "보조키워드2"],
  "openGraphTitle": "소셜 공유용 제목",
  "openGraphDescription": "소셜 공유용 설명",
  "suggestedSlug": "seo-friendly-url-slug",
  "reasoning": "추천 이유와 SEO 최적화 전략 설명"
}
\`\`\`

**최적화 기준:**
- 검색 의도에 맞는 키워드 배치
- 자연스러운 언어 사용 (키워드 남용 금지)
- 클릭률(CTR) 향상을 위한 감정적 어필
- 기술 블로그 특성을 반영한 전문성 표현
- 한국어 검색 환경 고려
`;

// ===== 키워드 분석 프롬프트 =====

export const KEYWORD_ANALYSIS_PROMPT = `
당신은 SEO 키워드 분석 전문가입니다. 다음 콘텐츠를 분석하여 최적의 키워드 전략을 제안해주세요.

**분석할 콘텐츠:**
{content}

**언어:** {language}
**콘텐츠 유형:** 기술 블로그 포스트

**분석 요구사항:**
1. 주요 키워드 (Primary Keywords): 3-5개
   - 콘텐츠의 핵심 주제를 나타내는 키워드
   - 검색량이 높고 경쟁도가 적절한 키워드
   
2. 보조 키워드 (Secondary Keywords): 5-10개
   - 주요 키워드를 보완하는 관련 키워드
   - 의미적으로 연관된 키워드
   
3. 롱테일 키워드 (Long-tail Keywords): 10-15개
   - 구체적이고 세분화된 검색어
   - 전환율이 높은 키워드
   
4. 개체명 (Named Entities): 5-10개
   - 기술명, 도구명, 프레임워크명 등
   - 고유명사 및 브랜드명

**응답 형식 (JSON):**
\`\`\`json
{
  "primary": ["주요키워드1", "주요키워드2", "주요키워드3"],
  "secondary": ["보조키워드1", "보조키워드2", "보조키워드3"],
  "longtail": ["구체적인 롱테일 키워드1", "상세한 검색어2"],
  "entities": ["React", "JavaScript", "Next.js"],
  "density": [
    {
      "keyword": "키워드",
      "count": 5,
      "density": 2.5,
      "positions": [10, 25, 60, 80, 95]
    }
  ]
}
\`\`\`
`;

// ===== SEO 점수 검증 프롬프트 =====

export const SEO_VALIDATION_PROMPT = `
당신은 SEO 감사 전문가입니다. 다음 블로그 포스트의 SEO 최적화 상태를 종합적으로 분석하고 점수를 매겨주세요.

**분석 대상:**
제목: {title}
메타 설명: {description}
키워드: {keywords}
콘텐츠: {content}

**평가 기준 (각 항목 100점 만점):**

1. **제목 최적화 (Title Optimization)**
   - 길이 적절성 (30-60자)
   - 핵심 키워드 포함
   - 클릭 유도성
   - 브랜딩 요소

2. **메타 설명 최적화 (Meta Description)**
   - 길이 적절성 (120-160자)
   - 키워드 자연스러운 포함
   - 행동 유도 요소
   - 콘텐츠 요약 정확성

3. **키워드 최적화 (Keyword Optimization)**
   - 키워드 밀도 적절성 (2-5%)
   - 의미적 관련성
   - 키워드 다양성
   - LSI 키워드 포함

4. **콘텐츠 구조 (Content Structure)**
   - 제목 계층 구조 (H1-H6)
   - 단락 길이 적절성
   - 목록 및 표 활용
   - 내부 링크 구조

5. **가독성 (Readability)**
   - 문장 길이
   - 전문 용어 설명
   - 시각적 요소 활용
   - 논리적 흐름

6. **기술적 SEO (Technical SEO)**
   - URL 구조
   - 이미지 alt 태그
   - 스키마 마크업
   - 페이지 속도 요소

**응답 형식 (JSON):**
\`\`\`json
{
  "overallScore": 85,
  "scores": {
    "title": 90,
    "description": 85,
    "keywords": 80,
    "structure": 88,
    "readability": 92,
    "technical": 78
  },
  "recommendations": [
    "메타 설명에 행동 유도 문구 추가 권장",
    "이미지에 alt 태그 추가 필요",
    "내부 링크 3-5개 추가 권장"
  ],
  "issues": [
    {
      "severity": "medium",
      "category": "description",
      "message": "메타 설명이 너무 짧습니다",
      "fix": "120-160자로 확장하여 더 자세한 설명 추가",
      "impact": 15
    }
  ]
}
\`\`\`
`;

// ===== URL 슬러그 생성 프롬프트 =====

export const SLUG_GENERATION_PROMPT = `
당신은 SEO 친화적 URL 전문가입니다. 다음 제목과 콘텐츠를 바탕으로 최적화된 URL 슬러그를 생성해주세요.

**제목:** {title}
**언어:** {language}
**최대 길이:** {maxLength}자

**슬러그 생성 규칙:**
1. 영문 소문자와 숫자, 하이픈(-)만 사용
2. 한글은 의미를 보존하며 영문으로 변환
3. 불용어(stop words) 제거
4. 핵심 키워드 우선 포함
5. 검색 친화적이면서 사람이 읽기 쉬운 형태
6. 최대 {maxLength}자 이내

**응답 형식 (JSON):**
\`\`\`json
{
  "suggestions": [
    {
      "slug": "react-hooks-tutorial-guide",
      "confidence": 95,
      "seoScore": 90,
      "readability": 95
    },
    {
      "slug": "complete-react-hooks-guide",
      "confidence": 88,
      "seoScore": 85,
      "readability": 92
    },
    {
      "slug": "react-hooks-beginners-tutorial",
      "confidence": 82,
      "seoScore": 88,
      "readability": 85
    }
  ],
  "reasoning": "각 슬러그의 선택 이유와 SEO 최적화 전략"
}
\`\`\`
`;

// ===== 메타데이터 추출 프롬프트 =====

export const METADATA_EXTRACTION_PROMPT = `
당신은 콘텐츠 분석 전문가입니다. 다음 콘텐츠를 분석하여 메타데이터를 추출해주세요.

**콘텐츠:** {content}
**형식:** {contentType}

**추출 요구사항:**
1. 제목 구조 분석 (H1-H6)
2. 단어 수 및 예상 읽기 시간 계산
3. 이미지 메타데이터 추출
4. 콘텐츠 구조 분석
5. 가독성 지표 계산

**응답 형식 (JSON):**
\`\`\`json
{
  "headings": [
    {
      "level": 1,
      "text": "메인 제목",
      "id": "main-title",
      "position": 5
    }
  ],
  "wordCount": 1500,
  "readingTime": 6,
  "images": [
    {
      "src": "/images/example.jpg",
      "alt": "예시 이미지",
      "title": "예시 제목"
    }
  ],
  "structure": {
    "hasTableOfContents": true,
    "headingDistribution": {"1": 1, "2": 5, "3": 8},
    "paragraphCount": 25,
    "codeBlockCount": 8,
    "listCount": 4,
    "linkCount": 12,
    "averageParagraphLength": 85,
    "readabilityMetrics": {
      "averageWordsPerSentence": 15.2,
      "averageSyllablesPerWord": 2.1,
      "fleschKincaidGradeLevel": 8.5,
      "fleschReadingEase": 72.3
    }
  }
}
\`\`\`
`;

// ===== 콘텐츠 최적화 제안 프롬프트 =====

export const CONTENT_OPTIMIZATION_PROMPT = `
당신은 콘텐츠 최적화 전문가입니다. 다음 블로그 포스트를 분석하여 SEO와 사용자 경험을 개선할 수 있는 구체적인 제안을 해주세요.

**원본 콘텐츠:**
{content}

**현재 메타데이터:**
- 제목: {title}
- 설명: {description}
- 키워드: {keywords}

**최적화 영역:**
1. 콘텐츠 구조 개선
2. 키워드 배치 최적화
3. 내부 링크 전략
4. 시각적 요소 추가 제안
5. 사용자 참여도 향상 방안

**응답 형식 (JSON):**
\`\`\`json
{
  "structureImprovements": [
    "목차(TOC) 추가로 사용자 네비게이션 개선",
    "소제목을 더 구체적으로 작성하여 검색 가능성 향상"
  ],
  "keywordOptimization": [
    "핵심 키워드를 첫 번째 단락에 자연스럽게 포함",
    "LSI 키워드 3-5개 추가로 의미적 관련성 강화"
  ],
  "internalLinking": [
    "관련 기술 포스트 2-3개로 내부 링크 추가",
    "기본 개념 설명 페이지로의 링크 제공"
  ],
  "visualEnhancements": [
    "코드 예제를 위한 다이어그램 추가",
    "단계별 스크린샷 또는 GIF 삽입"
  ],
  "engagementBoosts": [
    "결론 부분에 질문 또는 토론 주제 추가",
    "실습 섹션 또는 체크리스트 제공"
  ],
  "priorityScore": {
    "structure": 85,
    "keywords": 70,
    "linking": 60,
    "visual": 90,
    "engagement": 75
  }
}
\`\`\`
`;

// ===== 프롬프트 변수 치환 유틸리티 =====

export function replacePromptVariables(
  template: string,
  variables: Partial<SeoPromptVariables>
): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
  });

  return result;
}

// ===== 프롬프트 검증 =====

export function validatePromptVariables(
  variables: Partial<SeoPromptVariables>
): boolean {
  const required = ['content', 'title', 'language'];
  return required.every((key) =>
    Boolean(variables[key as keyof SeoPromptVariables])
  );
}

// ===== 기본 프롬프트 설정 =====

export const DEFAULT_PROMPT_CONFIG = {
  maxTitleLength: '60',
  maxDescriptionLength: '160',
  language: 'ko',
  includeSchema: 'true',
  contentType: 'markdown',
} as const;

// ===== 언어별 최적화 프롬프트 =====

export const LANGUAGE_SPECIFIC_PROMPTS = {
  ko: {
    stopWords: [
      '그리고',
      '하지만',
      '그러나',
      '따라서',
      '또한',
      '즉',
      '예를 들어',
    ],
    seoGuidelines: '한국어 검색 환경과 네이버, 구글 검색 최적화를 고려하여',
    keywordDensity: '2-4% (한글 키워드 특성상)',
  },
  en: {
    stopWords: ['and', 'but', 'however', 'therefore', 'also', 'for example'],
    seoGuidelines: 'Optimized for Google search and international audience',
    keywordDensity: '1-3% (English keyword standards)',
  },
} as const;

// ===== 성능 최적화 프롬프트 =====

export const PERFORMANCE_OPTIMIZATION_PROMPTS = {
  // 짧은 콘텐츠용 (1000자 미만)
  short: SEO_METADATA_PROMPT.replace(
    '**요구사항:**',
    '**요구사항 (짧은 콘텐츠):**\n⚡ 빠른 처리를 위해 핵심 요소만 집중'
  ),

  // 긴 콘텐츠용 (5000자 이상)
  long: SEO_METADATA_PROMPT.replace(
    '{content}',
    '{content}\n\n**참고:** 긴 콘텐츠이므로 주요 섹션별 키워드 분포를 고려해주세요.'
  ),

  // 기술 문서용
  technical: SEO_METADATA_PROMPT.replace(
    '기술 블로그 특성을 반영한 전문성 표현',
    '기술 문서 특성상 정확한 용어 사용과 개발자 대상 SEO 최적화'
  ),
} as const;

export default {
  SEO_METADATA_PROMPT,
  KEYWORD_ANALYSIS_PROMPT,
  SEO_VALIDATION_PROMPT,
  SLUG_GENERATION_PROMPT,
  METADATA_EXTRACTION_PROMPT,
  CONTENT_OPTIMIZATION_PROMPT,
  replacePromptVariables,
  validatePromptVariables,
  DEFAULT_PROMPT_CONFIG,
  LANGUAGE_SPECIFIC_PROMPTS,
  PERFORMANCE_OPTIMIZATION_PROMPTS,
};

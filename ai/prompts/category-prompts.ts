/**
 * 카테고리 추천을 위한 AI 프롬프트 템플릿
 * Gemini 모델에 최적화된 프롬프트 설계
 */

// 카테고리 추천 프롬프트 변수 인터페이스
export interface CategoryPromptVariables {
  title: string;
  content: string;
  contentType: 'markdown' | 'html';
  availableCategories: string;
  maxSuggestions: number;
  existingCategories?: string;
}

// ===== 메인 카테고리 분류 프롬프트 =====

export const CATEGORY_CLASSIFICATION_PROMPT = `
당신은 기술 블로그 카테고리 분류 전문가입니다. 다음 블로그 포스트를 분석하여 가장 적절한 카테고리를 추천해주세요.

**분석할 콘텐츠:**
제목: {title}
콘텐츠 타입: {contentType}
기존 카테고리: {existingCategories}

**콘텐츠:**
{content}

**사용 가능한 카테고리:**
{availableCategories}

**분류 기준:**
1. **핵심 주제 분석**: 콘텐츠의 핵심 기술 스택과 주제
2. **대상 독자**: 초급자, 중급자, 고급자 대상 여부
3. **콘텐츠 목적**: 튜토리얼, 리뷰, 분석, 가이드, 뉴스 등
4. **기술 영역**: 프론트엔드, 백엔드, 데브옵스, AI/ML 등
5. **도구 및 프레임워크**: 사용된 구체적인 기술 도구들

**추천 기준:**
- 상위 {maxSuggestions}개 카테고리 추천
- 각 카테고리별 신뢰도 점수 (0.0-1.0)
- 추천 이유와 핵심 키워드 제시
- 기존 카테고리와의 중복 방지

**응답 형식 (JSON):**
\`\`\`json
{
  "recommendations": [
    {
      "categoryId": "web-development",
      "categoryName": "Web Development",
      "confidence": 0.92,
      "reasoning": "React와 Next.js를 사용한 웹 애플리케이션 개발 튜토리얼로, 프론트엔드 웹 개발의 핵심 내용을 다루고 있습니다.",
      "keyTopics": ["React", "Next.js", "Frontend", "Tutorial"]
    },
    {
      "categoryId": "tutorial",
      "categoryName": "Tutorial",
      "confidence": 0.85,
      "reasoning": "단계별 구현 과정을 설명하는 튜토리얼 형식의 콘텐츠입니다.",
      "keyTopics": ["Step-by-step", "Guide", "Implementation"]
    }
  ],
  "contentAnalysis": {
    "primaryTopic": "Web Development",
    "secondaryTopics": ["React", "Frontend Development", "JavaScript"],
    "technicalLevel": "intermediate",
    "contentType": "tutorial",
    "keyTopics": ["React", "Next.js", "Components", "Hooks"],
    "technicalTerms": ["jsx", "useState", "useEffect", "components"],
    "frameworksAndTools": ["React", "Next.js", "npm", "webpack"]
  }
}
\`\`\`

**중요 지침:**
- JSON 형식을 정확히 준수해주세요
- 신뢰도 점수는 0.6 이상인 카테고리만 추천해주세요
- 추천 이유는 구체적이고 명확하게 작성해주세요
- 한국어와 영어 기술 용어를 적절히 혼용해주세요
`;

// ===== 콘텐츠 분석 전용 프롬프트 =====

export const CONTENT_ANALYSIS_PROMPT = `
다음 기술 블로그 콘텐츠를 분석하여 주제, 기술 스택, 난이도 등을 파악해주세요.

**분석할 콘텐츠:**
제목: {title}
콘텐츠: {content}

**분석 요소:**
1. **주요 주제**: 콘텐츠의 핵심 주제
2. **기술 스택**: 언급된 프로그래밍 언어, 프레임워크, 도구
3. **기술 수준**: 초급/중급/고급 판단
4. **콘텐츠 유형**: 튜토리얼/리뷰/분석/가이드/뉴스 등

**응답 형식 (JSON):**
\`\`\`json
{
  "primaryTopic": "React Development",
  "secondaryTopics": ["Hooks", "State Management"],
  "technicalLevel": "intermediate",
  "contentType": "tutorial",
  "keyTopics": ["React", "Hooks", "useState", "useEffect"],
  "technicalTerms": ["JSX", "Virtual DOM", "Component"],
  "frameworksAndTools": ["React", "Create React App", "npm"]
}
\`\`\`
`;

// ===== 카테고리 매칭 프롬프트 =====

export const CATEGORY_MATCHING_PROMPT = `
분석된 콘텐츠 주제를 기반으로 사용 가능한 카테고리와 매칭해주세요.

**콘텐츠 분석 결과:**
{contentAnalysis}

**사용 가능한 카테고리:**
{availableCategories}

**매칭 규칙:**
1. 주제 일치도 (60%)
2. 기술 스택 일치도 (25%)
3. 콘텐츠 유형 일치도 (15%)

**응답 형식 (JSON):**
\`\`\`json
{
  "matches": [
    {
      "categoryId": "web-development",
      "categoryName": "Web Development",
      "matchScore": 0.89,
      "matchReasons": ["React 프레임워크 사용", "웹 개발 튜토리얼"],
      "topicOverlap": ["React", "Frontend", "JavaScript"]
    }
  ]
}
\`\`\`
`;

// ===== 프롬프트 변수 치환 함수 =====

export function replacePromptVariables(
  template: string,
  variables: Partial<CategoryPromptVariables>
): string {
  let result = template;

  // 필수 변수들 치환
  if (variables.title) {
    result = result.replace(/{title}/g, variables.title);
  }

  if (variables.content) {
    result = result.replace(/{content}/g, variables.content);
  }

  if (variables.contentType) {
    result = result.replace(/{contentType}/g, variables.contentType);
  }

  if (variables.availableCategories) {
    result = result.replace(
      /{availableCategories}/g,
      variables.availableCategories
    );
  }

  if (variables.maxSuggestions) {
    result = result.replace(
      /{maxSuggestions}/g,
      variables.maxSuggestions.toString()
    );
  }

  // 선택적 변수들 치환
  result = result.replace(
    /{existingCategories}/g,
    variables.existingCategories || '없음'
  );

  return result;
}

// ===== 카테고리 정보 포맷팅 함수 =====

export function formatAvailableCategories(
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
  }>
): string {
  return categories
    .map(
      (cat) =>
        `- ${cat.name} (${cat.slug}): ${cat.description || '카테고리 설명 없음'}`
    )
    .join('\n');
}

// ===== 프롬프트 검증 함수 =====

export function validatePromptVariables(
  variables: Partial<CategoryPromptVariables>
): boolean {
  const requiredFields = [
    'title',
    'content',
    'contentType',
    'availableCategories',
  ];

  for (const field of requiredFields) {
    if (!variables[field as keyof CategoryPromptVariables]) {
      console.warn(`필수 프롬프트 변수 누락: ${field}`);
      return false;
    }
  }

  // 콘텐츠 길이 검증
  if (variables.content && variables.content.length < 50) {
    console.warn('콘텐츠가 너무 짧습니다 (최소 50자 필요)');
    return false;
  }

  if (variables.content && variables.content.length > 50000) {
    console.warn('콘텐츠가 너무 깁니다 (최대 50,000자)');
    return false;
  }

  return true;
}

// ===== 기본 프롬프트 설정 =====

export const DEFAULT_CATEGORY_PROMPT_CONFIG = {
  maxSuggestions: 3,
  confidenceThreshold: 0.6,
  includeAnalysis: true,
  language: 'ko-KR',
} as const;

// ===== 에러 메시지 =====

export const CATEGORY_PROMPT_ERRORS = {
  INVALID_CONTENT_TYPE: '지원되지 않는 콘텐츠 타입입니다.',
  CONTENT_TOO_SHORT: '콘텐츠가 너무 짧습니다.',
  CONTENT_TOO_LONG: '콘텐츠가 너무 깁니다.',
  MISSING_REQUIRED_FIELD: '필수 필드가 누락되었습니다.',
  INVALID_CATEGORIES: '유효하지 않은 카테고리 정보입니다.',
} as const;

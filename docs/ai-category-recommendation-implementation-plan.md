# AI 카테고리 추천 및 자동 태깅 API 구현 계획서

## 1. 코드베이스 분석 결과

### 현재 프로젝트 구조 분석

**🏗️ 기존 아키텍처 패턴**

```
Next.js 15 App Router 기반:
- API Routes: /app/api/ (RESTful 구조)
- Service Layer: /lib/ (비즈니스 로직 분리)
- Validation: Zod 스키마 기반 (/lib/validations/)
- Types: TypeScript 완전 타입 안전성 (/types/)
- AI Services: /ai/ (모듈화된 AI 기능)
- Database: Prisma + Supabase PostgreSQL
```

**🔗 기존 통합 지점 확인**

1. **AI 인프라**: 완전 구축됨
   - `ai/models/gemini-config.ts`: Gemini 설정 완비
   - `ai/prompts/seo-prompts.ts`: 프롬프트 시스템 구조화
   - `lib/ai/seo/seoRecommendationService.ts`: AI 서비스 패턴 확립

2. **데이터베이스 구조**: 카테고리 추천에 최적화됨
   - `categories` 테이블: 기본 7개 카테고리 설정됨
   - `post_categories` 테이블: AI 추천 신뢰도(`confidence`) 및 `isAiSuggested` 필드 준비됨
   - `posts` 테이블: AI 처리 대상 콘텐츠 구조 완비

3. **서비스 레이어**: 확장 가능한 구조
   - `lib/database/services.ts`: CategoryService, PostService 구현됨
   - `lib/blog/post-service.ts`: 포스트 CRUD 완비
   - 표준화된 에러 처리 및 응답 형식

### 기존 AI 구현 패턴 분석

**📋 사용 중인 AI 모델 설정**

```typescript
// ai/models/gemini-config.ts
export const geminiConfig = {
  seo: {
    model: 'gemini-2.5-flash-lite',
    temperature: 0.4, // SEO 최적화를 위한 일관된 출력
    topK: 20,
    topP: 0.85,
    maxTokens: 2048,
    maxContentLength: 10000,
    timeoutMs: 30000,
    retryAttempts: 3,
  },
};
```

**🔧 기존 프롬프트 시스템**

- 모듈화된 프롬프트 템플릿 (`ai/prompts/`)
- 변수 치환 시스템 (`replacePromptVariables`)
- JSON 응답 파싱 및 검증 로직

**⚡ 성능 및 에러 처리**

- Gemini API 에러 처리 (`handleGeminiError`)
- 재시도 로직 및 타임아웃 설정
- 신뢰도 점수 계산 시스템

## 2. 카테고리 추천 API 설계

### 핵심 기능 명세

**🎯 기능 1: 카테고리 추천**

- **입력**: 포스트 제목, 콘텐츠 (Markdown/HTML)
- **AI 처리**: 주제 모델링으로 상위 3개 카테고리 추천
- **출력**: 카테고리명, 신뢰도 점수 (0.0-1.0), 추천 이유
- **성능 목표**: 추천 정확도 ≥ 85%

**🎯 기능 2: 자동 태깅**

- **입력**: 추천된 카테고리 선택
- **처리**: PostCategory 테이블에 관계 생성
- **출력**: 성공/실패 상태, 업데이트된 포스트 정보
- **트랜잭션**: 데이터 정합성 보장

### API 엔드포인트 설계

**📡 엔드포인트 1: 카테고리 추천**

```
POST /api/ai/category/recommend
```

```typescript
// 요청 스키마
interface CategoryRecommendRequest {
  title: string;
  content: string;
  contentType: 'markdown' | 'html';
  existingCategories?: string[]; // 기존 카테고리 ID 배열
  maxSuggestions?: number; // 기본값: 3
}

// 응답 스키마
interface CategoryRecommendResponse {
  success: boolean;
  data?: {
    recommendations: Array<{
      categoryId: string;
      categoryName: string;
      confidence: number; // 0.0-1.0
      reasoning: string;
      isExisting: boolean; // 기존 카테고리 여부
    }>;
    processingTime: number;
    model: string;
  };
  error?: string;
}
```

**📡 엔드포인트 2: 자동 태깅**

```
POST /api/ai/category/auto-tag
```

```typescript
// 요청 스키마
interface AutoTagRequest {
  postId: string;
  selectedCategories: Array<{
    categoryId: string;
    confidence: number;
  }>;
  replaceExisting?: boolean; // 기존 카테고리 대체 여부
}

// 응답 스키마
interface AutoTagResponse {
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
```

## 3. 기술 구현 상세 설계

### 3.1 AI 카테고리 추천 서비스

**📁 파일 구조**

```
ai/
├── services/
│   └── CategoryRecommendationService.ts    # 메인 추천 서비스
├── processors/
│   └── content-classifier.ts               # 콘텐츠 분류 프로세서
├── prompts/
│   └── category-prompts.ts                 # 카테고리 추천 프롬프트
└── models/
    └── category-classifier-config.ts       # 분류 모델 설정
```

**🧠 CategoryRecommendationService 설계**

```typescript
export class CategoryRecommendationService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly config: CategoryClassifierConfig;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.config = categoryClassifierConfig;
    this.model = this.createClassifierModel();
  }

  // 메인 추천 메서드
  async recommendCategories(
    request: CategoryRecommendRequest
  ): Promise<CategoryRecommendationResult>;

  // 콘텐츠 분석 및 주제 추출
  private async analyzeContent(content: string): Promise<ContentAnalysis>;

  // 기존 카테고리와 매칭
  private async matchWithExistingCategories(
    topics: string[],
    existingCategories: Category[]
  ): Promise<CategoryMatch[]>;

  // 신뢰도 점수 계산
  private calculateConfidenceScore(
    match: CategoryMatch,
    contentAnalysis: ContentAnalysis
  ): number;
}
```

### 3.2 카테고리 추천 프롬프트 설계

**📝 주제 분류 프롬프트**

```typescript
export const CATEGORY_CLASSIFICATION_PROMPT = `
당신은 기술 블로그 카테고리 분류 전문가입니다. 다음 블로그 포스트를 분석하여 가장 적절한 카테고리를 추천해주세요.

**분석할 콘텐츠:**
제목: {title}
콘텐츠 타입: {contentType}
콘텐츠: {content}

**사용 가능한 카테고리:**
{availableCategories}

**분류 기준:**
1. 콘텐츠의 핵심 주제와 기술 스택
2. 대상 독자층과 난이도
3. 콘텐츠의 목적 (튜토리얼, 리뷰, 분석 등)
4. 사용된 기술과 도구

**응답 형식 (JSON):**
\`\`\`json
{
  "recommendations": [
    {
      "categoryId": "category-id",
      "categoryName": "카테고리명",
      "confidence": 0.95,
      "reasoning": "이 포스트는 React와 Next.js를 사용한 웹 개발 내용으로...",
      "keyTopics": ["React", "Next.js", "Frontend"]
    }
  ],
  "contentAnalysis": {
    "primaryTopic": "Web Development",
    "secondaryTopics": ["React", "Frontend"],
    "technicalLevel": "intermediate",
    "contentType": "tutorial"
  }
}
\`\`\`
`;
```

### 3.3 데이터베이스 통합 전략

**🗄️ 기존 스키마 활용**

```sql
-- 이미 구현된 테이블 구조 활용
post_categories {
  id: TEXT PRIMARY KEY,
  postId: TEXT NOT NULL,
  categoryId: TEXT NOT NULL,
  confidence: DOUBLE PRECISION,     -- AI 신뢰도 점수
  isAiSuggested: BOOLEAN DEFAULT false,
  createdAt: TIMESTAMP
}
```

**⚙️ 서비스 레이어 확장**

```typescript
// lib/blog/category-service.ts 확장
export const CategoryService = {
  // 기존 메서드들...

  // AI 추천 카테고리 저장
  async saveAIRecommendations(
    postId: string,
    recommendations: CategoryRecommendation[]
  ): Promise<void>;

  // 포스트의 AI 추천 카테고리 조회
  async getAIRecommendations(postId: string): Promise<CategoryRecommendation[]>;

  // 카테고리 추천 정확도 통계
  async getRecommendationAccuracy(): Promise<AccuracyStats>;
};
```

## 4. 구현 단계별 계획

### Phase 1: 기반 구조 구축 (1일)

**🔧 1.1 AI 모델 및 프롬프트 설정**

- [ ] `ai/models/category-classifier-config.ts` 생성
- [ ] `ai/prompts/category-prompts.ts` 작성
- [ ] 기존 Gemini 설정과 통합

**📝 1.2 타입 정의 및 스키마**

- [ ] `types/ai.ts`에 카테고리 추천 타입 추가
- [ ] `lib/validations/ai.ts`에 검증 스키마 추가
- [ ] API 요청/응답 인터페이스 정의

### Phase 2: 핵심 서비스 구현 (2일)

**🧠 2.1 CategoryRecommendationService 구현**

- [ ] 콘텐츠 분석 로직
- [ ] Gemini API 호출 및 응답 파싱
- [ ] 신뢰도 점수 계산 알고리즘
- [ ] 에러 처리 및 재시도 로직

**🔄 2.2 콘텐츠 분류 프로세서**

- [ ] 텍스트 전처리 (마크다운 파싱)
- [ ] 키워드 추출 및 가중치 계산
- [ ] 기존 카테고리와 매칭 로직

### Phase 3: API 엔드포인트 구현 (1일)

**📡 3.1 추천 API**

- [ ] `app/api/ai/category/recommend/route.ts` 구현
- [ ] 입력 검증 및 보안 처리
- [ ] 응답 형식 표준화

**🏷️ 3.2 자동 태깅 API**

- [ ] `app/api/ai/category/auto-tag/route.ts` 구현
- [ ] 트랜잭션 처리 로직
- [ ] 데이터 정합성 검증

### Phase 4: 통합 테스트 및 최적화 (1일)

**🧪 4.1 단위 테스트**

- [ ] 카테고리 추천 서비스 테스트
- [ ] API 엔드포인트 테스트
- [ ] 에러 케이스 테스트

**⚡ 4.2 성능 최적화**

- [ ] AI 호출 캐싱 전략
- [ ] 배치 처리 최적화
- [ ] 응답 시간 모니터링

## 5. 품질 보증 및 검증

### 5.1 추천 정확도 측정

**📊 테스트 데이터셋**

```typescript
const testPosts = [
  {
    title: 'React 18의 새로운 기능과 Concurrent Features',
    content: 'React 18에서 도입된 Concurrent Features...',
    expectedCategories: ['Web Development', 'React'],
    expectedConfidence: 0.9,
  },
  // 20개 샘플 포스트
];
```

**🎯 정확도 기준**

- 상위 3개 추천 중 최소 2개 정확 (66% 정확도)
- 평균 신뢰도 점수 ≥ 0.8
- 응답 시간 ≤ 5초

### 5.2 에러 처리 검증

**🛡️ 예외 상황 테스트**

- AI API 장애 시 폴백 처리
- 네트워크 타임아웃 처리
- 잘못된 응답 형식 처리
- 동시성 이슈 처리

## 6. 배포 및 모니터링

### 6.1 배포 전 체크리스트

- [ ] 환경 변수 설정 (`GEMINI_API_KEY`)
- [ ] 데이터베이스 마이그레이션 확인
- [ ] API 문서 업데이트
- [ ] 성능 테스트 통과

### 6.2 모니터링 지표

**📈 핵심 메트릭**

- API 응답 시간
- AI 호출 성공률
- 추천 정확도
- 사용자 수용률

**🚨 알람 설정**

- API 응답 시간 > 10초
- AI 호출 실패율 > 5%
- 일일 API 사용량 임계치 초과

## 7. 확장 계획

### Phase 2 확장 대비

**🎯 멀티 사용자 지원**

- 사용자별 카테고리 커스터마이징
- 카테고리 추천 학습 데이터 축적
- 사용자 피드백 기반 정확도 개선

**🔮 고급 기능**

- 카테고리 자동 생성
- 계층적 카테고리 구조
- 다국어 카테고리 지원

## 8. 위험 요소 및 대응책

### 기술적 위험

| 위험 요소          | 영향도 | 대응책                            |
| ------------------ | ------ | --------------------------------- |
| AI API 할당량 초과 | 높음   | 캐싱 전략, 배치 처리              |
| 추천 정확도 부족   | 중간   | 프롬프트 튜닝, 테스트 데이터 확대 |
| 응답 시간 지연     | 중간   | 비동기 처리, 타임아웃 설정        |

### 비즈니스 위험

| 위험 요소          | 영향도 | 대응책                     |
| ------------------ | ------ | -------------------------- |
| 사용자 수용도 낮음 | 중간   | 수동 편집 옵션 제공        |
| AI 비용 급증       | 높음   | 사용량 모니터링, 비용 제한 |

이 구현 계획서는 기존 코드베이스 분석을 바탕으로 AI 카테고리 추천 기능을 체계적으로 구현하기 위한 상세한 로드맵을 제공합니다. PRD 요구사항인 "추천 정확도 ≥ 85%"와 "자동 태깅" 기능을 모두 충족하도록 설계되었습니다.

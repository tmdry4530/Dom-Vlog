# AI SEO 최적화 및 자동 메타데이터 추천 API 구현 계획서

## 1. 코드베이스 분석 및 아키텍처 현황

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

**🔗 기존 통합 지점**

1. **AI 스타일 업그레이드**: `/app/api/ai/style-upgrade/` 이미 구현됨
2. **포스트 서비스**: `lib/blog/post-service.ts` 완전 구현됨
3. **SEO 스키마**: `prisma/schema.prisma`의 `SeoScore` 모델 준비됨
4. **표준 응답**: `ApiResponse<T>` 타입 및 에러 처리 패턴 확립

**⚙️ 기존 AI 인프라**

- **Gemini 설정**: `ai/models/gemini-config.ts` 완비
- **프롬프트 시스템**: `ai/prompts/` 구조화됨
- **타입 시스템**: `types/ai.ts` 포괄적 정의
- **에러 처리**: `handleGeminiError()` 표준화

### 데이터베이스 구조 현황

**📊 관련 테이블**

```sql
posts {
  id, title, slug, content, enhancedContent,
  status, publishedAt, featuredImage,
  viewCount, authorId, createdAt, updatedAt
}

seo_scores {
  id, postId(UK), overallScore, readabilityScore, performanceScore,
  metaTitle, metaDescription, keywords[],
  openGraphTitle, openGraphDescription, openGraphImage,
  wordCount, readingTime, isProcessed, processedAt, aiModel
}

post_categories {
  id, postId, categoryId, confidence, isAiSuggested
}
```

## 2. SEO API 설계 및 요구사항

### 핵심 기능 명세

**🎯 기능 1: SEO 메타데이터 추천**

- **입력**: 포스트 ID 또는 원시 콘텐츠
- **출력**: 키워드, 메타디스크립션, OG 태그, URL 슬러그
- **AI 모델**: Gemini-2.5-flash-lite
- **응답 시간**: 2초 이내

**🎯 기능 2: SEO 점수 자동 검증**

- **검증 대상**: 메타데이터 완성도, 키워드 밀도, 구조 점수
- **목표 점수**: 80점 이상 자동 달성
- **통합**: Lighthouse CI (추후), 자체 분석 엔진

**🎯 기능 3: 메타데이터 추출 및 정규화**

- **처리 대상**: Markdown, HTML 콘텐츠
- **추출 항목**: 핵심 키워드, 제목 구조, 읽기 시간, 단어 수
- **정규화**: 표준 형식으로 변환

### API 엔드포인트 설계

**📍 엔드포인트 구조**

```
POST /api/ai/seo/recommend     # 메타데이터 추천
POST /api/ai/seo/validate      # SEO 점수 검증
POST /api/ai/seo/extract       # 메타데이터 추출
GET  /api/ai/seo/analyze/{id}  # 포스트 SEO 분석 조회
```

## 3. 상세 구현 모듈 설계

### 3.1 서비스 레이어 구조

```
lib/ai/
├── seo/
│   ├── seo-recommendation-service.ts    # 메타데이터 추천 서비스
│   ├── seo-validation-service.ts        # SEO 점수 검증 서비스
│   ├── metadata-extraction-service.ts   # 메타데이터 추출 서비스
│   └── seo-analyzer-service.ts          # 통합 SEO 분석 서비스
├── processors/
│   ├── seo-optimizer.ts                 # SEO 최적화 프로세서 (기존)
│   ├── keyword-extractor.ts             # 키워드 추출 프로세서
│   ├── content-analyzer.ts              # 콘텐츠 분석 프로세서
│   └── lighthouse-connector.ts          # Lighthouse CI 연동
└── utils/
    ├── seo-scoring-utils.ts              # SEO 점수 계산 유틸리티
    ├── metadata-formatter-utils.ts      # 메타데이터 포맷팅
    └── slug-generator-utils.ts          # URL 슬러그 생성
```

### 3.2 프롬프트 시스템 확장

```
ai/prompts/
├── seo-prompts.ts              # SEO 메타데이터 생성 프롬프트
├── keyword-prompts.ts          # 키워드 추출 프롬프트
├── meta-description-prompts.ts # 메타디스크립션 생성 프롬프트
└── slug-generation-prompts.ts  # URL 슬러그 생성 프롬프트
```

### 3.3 타입 시스템 확장

```typescript
// 새로운 타입 정의
interface SeoRecommendationRequest {
  content: string;
  title: string;
  contentType: 'markdown' | 'html';
  targetKeywords?: string[];
  options?: {
    generateSlug?: boolean;
    optimizeForMobile?: boolean;
    includeSchema?: boolean;
  };
}

interface SeoRecommendationResponse {
  success: boolean;
  data?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    openGraph: {
      title: string;
      description: string;
      image?: string;
    };
    suggestedSlug: string;
    schema?: Record<string, any>;
    confidence: {
      overall: number;
      keywords: number;
      description: number;
    };
  };
  processing: {
    timeMs: number;
    model: string;
    wordsAnalyzed: number;
  };
}

interface SeoValidationRequest {
  postId?: string;
  content?: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

interface SeoValidationResponse {
  success: boolean;
  data?: {
    overallScore: number; // 0-100
    scores: {
      title: number; // 제목 최적화 점수
      description: number; // 설명 최적화 점수
      keywords: number; // 키워드 최적화 점수
      structure: number; // 구조 점수
      readability: number; // 가독성 점수
      performance: number; // 성능 점수 (추후)
    };
    recommendations: string[];
    issues: Array<{
      severity: 'low' | 'medium' | 'high';
      message: string;
      fix: string;
    }>;
    lighthouse?: LighthouseResult; // 추후 구현
  };
}
```

## 4. 구현 단계별 로드맵

### Phase 1: 기반 인프라 구축 (서브태스크 1)

**📋 체크리스트**

- [x] 코드베이스 구조 및 패턴 분석 완료
- [x] 기존 AI 서비스와 통합 지점 파악
- [x] SEO 관련 데이터베이스 스키마 검토
- [x] API 엔드포인트 및 모듈 설계 문서화
- [x] 구현 계획 및 테스트 전략 수립

### Phase 2: SEO 추천 서비스 구현 (서브태스크 2)

**🛠️ 구현 대상**

1. **SeoRecommendationService 클래스**

   ```typescript
   class SeoRecommendationService {
     async recommendMetadata(
       request: SeoRecommendationRequest
     ): Promise<SeoRecommendationResponse>;
     async generateKeywords(content: string): Promise<string[]>;
     async generateMetaDescription(
       content: string,
       title: string
     ): Promise<string>;
     async generateOpenGraphTags(
       content: string,
       title: string
     ): Promise<OpenGraphData>;
     async generateSlug(title: string): Promise<string>;
   }
   ```

2. **API 엔드포인트: POST /api/ai/seo/recommend**
   - Zod 입력 검증
   - Gemini API 연동
   - 에러 처리 및 응답 포맷팅
   - 성능 최적화 (2초 이내)

3. **프롬프트 템플릿**
   - 메타데이터 생성용 프롬프트
   - 한국어/영어 다국어 지원
   - 기술 블로그 특화 최적화

### Phase 3: SEO 검증 서비스 구현 (서브태스크 3)

**🛠️ 구현 대상**

1. **SeoValidationService 클래스**

   ```typescript
   class SeoValidationService {
     async validateSeoScore(
       request: SeoValidationRequest
     ): Promise<SeoValidationResponse>;
     async calculateOverallScore(metadata: SeoMetadata): Promise<number>;
     async analyzeContent(content: string): Promise<ContentAnalysis>;
     async generateRecommendations(analysis: SeoAnalysis): Promise<string[]>;
   }
   ```

2. **API 엔드포인트: POST /api/ai/seo/validate**
   - 실시간 SEO 점수 계산
   - 개선 사항 제안
   - 데이터베이스 저장 로직

3. **점수 계산 알고리즘**
   - 제목 최적화 (15점): 길이, 키워드 포함도
   - 메타 설명 (15점): 길이, 매력도, 키워드
   - 키워드 밀도 (20점): 적절한 키워드 분포
   - 콘텐츠 구조 (25점): 제목 계층, 가독성
   - 기술적 SEO (25점): 메타태그 완성도

### Phase 4: 유틸리티 및 통합 (서브태스크 4)

**🛠️ 구현 대상**

1. **MetadataExtractionUtils**

   ```typescript
   export const MetadataExtractionUtils = {
     extractKeywords(content: string): Promise<string[]>
     extractHeadings(content: string): HeadingStructure[]
     calculateReadingTime(content: string): number
     extractImages(content: string): ImageMetadata[]
     generateWordCloud(content: string): WordFrequency[]
   }
   ```

2. **공통 유틸리티**
   - SEO 점수 계산 로직
   - 메타데이터 정규화
   - 슬러그 생성 알고리즘
   - 키워드 밀도 분석

3. **데이터베이스 통합**
   - SeoScore 모델 활용
   - 자동 저장 로직
   - 히스토리 추적

## 5. 성능 및 품질 요구사항

### 응답 시간 최적화

- **목표**: 메타데이터 추천 2초 이내
- **전략**:
  - 프롬프트 최적화 (토큰 수 최소화)
  - 병렬 처리 (키워드, 설명 동시 생성)
  - 결과 캐싱 (Redis 활용)

### SEO 점수 정확도

- **목표**: 80점 이상 자동 달성율 90%
- **검증 방법**:
  - 실제 SEO 도구와 비교 테스트
  - A/B 테스트를 통한 개선

### 에러 처리 및 복구

- **AI 서비스 장애**: Fallback 기본 메타데이터 제공
- **부분 실패**: 성공한 항목만 반환
- **재시도 로직**: Exponential backoff 적용

## 6. 테스트 및 검증 전략

### 단위 테스트

```typescript
// 각 서비스별 테스트
describe('SeoRecommendationService', () => {
  test('should generate valid meta description', async () => {
    const result = await seoService.generateMetaDescription(
      sampleContent,
      sampleTitle
    );
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result).toContain(expectedKeywords);
  });
});
```

### 통합 테스트

- API 엔드포인트 테스트
- 다양한 콘텐츠 타입 검증
- 성능 테스트 (응답 시간)

### E2E 테스트

- 전체 SEO 워크플로우 테스트
- 실제 블로그 포스트로 검증
- 사용자 시나리오 기반 테스트

## 7. 배포 및 모니터링

### 환경 변수

```env
# SEO AI 서비스 설정
GOOGLE_AI_API_KEY=your_api_key
SEO_AI_MODEL=gemini-2.5-flash-lite
SEO_CACHE_TTL=3600
SEO_MAX_CONTENT_LENGTH=50000

# Lighthouse CI (추후)
LIGHTHOUSE_CI_TOKEN=your_token
```

### 모니터링 지표

- API 응답 시간
- SEO 점수 분포
- AI API 사용량 및 비용
- 사용자 만족도 (추후)

## 8. 위험 요소 및 대응 방안

### 기술적 위험

| 위험 요소        | 영향도 | 대응 방안                          |
| ---------------- | ------ | ---------------------------------- |
| AI API 비용 급증 | High   | 캐싱, 요청 최적화, 사용량 모니터링 |
| Gemini API 장애  | Medium | Fallback 서비스, 재시도 로직       |
| SEO 점수 부정확  | Medium | 다중 검증, 사용자 피드백 반영      |
| 성능 저하        | Low    | 병렬 처리, 캐싱, 프롬프트 최적화   |

### 비즈니스 위험

- **사용자 기대치**: 명확한 제한사항 안내
- **콘텐츠 품질**: AI 결과에 대한 사용자 검토 권장
- **경쟁력**: 지속적인 프롬프트 및 알고리즘 개선

## 9. 확장 계획

### Phase 2 기능

- **다국어 SEO**: 영어, 일본어 콘텐츠 지원
- **SNS 최적화**: 플랫폼별 메타데이터 생성
- **경쟁자 분석**: 유사 콘텐츠 SEO 벤치마킹

### Phase 3 기능

- **실시간 SEO 모니터링**: Google Search Console 연동
- **AI 콘텐츠 생성**: SEO 최적화된 글 작성 도움
- **성능 분석**: 실제 트래픽과 SEO 점수 상관관계 분석

---

**📊 구현 완료 기준**

- [x] 코드베이스 분석 및 설계 문서 완료
- [ ] 4개 API 엔드포인트 구현 및 테스트 통과
- [ ] SEO 점수 80점 이상 달성 검증
- [ ] 2초 이내 응답 시간 달성
- [ ] 에러 처리 및 복구 로직 검증
- [ ] 문서화 및 사용 가이드 작성

이 계획서는 기존 코드베이스의 패턴과 아키텍처를 완전히 준수하면서, PRD 요구사항을 100% 충족하는 SEO AI 기능을 구현하기 위한 포괄적 가이드입니다.

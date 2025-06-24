# AI 문서 스타일 업그레이드 API 구현 계획서

## 1. 코드베이스 분석

### 현재 구조 분석

```
현재 프로젝트 구조:
- Next.js 15 App Router 기반
- 데이터베이스: Supabase + Prisma
- API 패턴: RESTful API routes (/app/api/)
- 인증: Supabase Auth + custom auth service
- 에러 처리: 표준화된 ApiResponse 타입
- 입력 검증: Zod 스키마 기반
```

### 기존 패턴 및 아키텍처

1. **API 레이어**: `/app/api/` 구조
2. **서비스 레이어**: `/lib/` 내 비즈니스 로직
3. **유효성 검사**: `/lib/validations/` 내 Zod 스키마
4. **타입 정의**: `/types/` 내 TypeScript 타입
5. **에러 처리**: 표준화된 ApiResponse와 에러 핸들러

### AI 기능 연동 요구사항

- **기존 AI 디렉토리**: `/ai/` 구조는 준비되어 있으나 구현체 없음
- **필요한 패키지**: Vercel AI SDK, Google AI SDK, LangChain 미설치
- **통합 지점**: 기존 post API와 연동 필요

## 2. 기술 스택 및 의존성

### 추가 필요 패키지

```json
{
  "ai": "^4.0.24", // Vercel AI SDK
  "@google/generative-ai": "^0.25.0", // Google Gemini SDK
  "langchain": "^0.3.13", // LangChain 코어
  "@langchain/google-genai": "^0.1.22", // LangChain Google AI 연동
  "markdown-it": "^14.1.0", // Markdown 파싱
  "@types/markdown-it": "^14.1.2" // Markdown 타입
}
```

### AI 모델 선택

- **주 모델**: Gemini-2.5-flash-lite (빠른 응답, 비용 효율적)
- **백업 모델**: Gemini-1.5-flash (더 안정적인 결과)

## 3. API 설계

### 엔드포인트 구조

```
POST /api/ai/style-upgrade
```

### 요청/응답 스키마

```typescript
// 요청
interface StyleUpgradeRequest {
  content: string; // Markdown/HTML 입력
  contentType: 'markdown' | 'html';
  options?: {
    includeTableOfContents?: boolean;
    enhanceCodeBlocks?: boolean;
    improveHeadingStructure?: boolean;
  };
}

// 응답
interface StyleUpgradeResponse {
  success: boolean;
  data?: {
    enhancedContent: string; // 스타일 향상된 콘텐츠
    readabilityScore: number; // 가독성 점수 (0-100)
    improvements: string[]; // 개선 사항 목록
    processingTime: number; // 처리 시간 (ms)
  };
  error?: string;
  message?: string;
}
```

## 4. 모듈 설계

### 4.1 AI 서비스 구조

```
ai/
├── services/
│   ├── StyleUpgradeService.ts      # 메인 스타일 업그레이드 서비스
│   ├── ReadabilityAnalyzer.ts      # 가독성 평가 서비스
│   └── ContentProcessor.ts         # 콘텐츠 전처리 서비스
├── processors/
│   ├── style-enhancer.ts           # 스타일 향상 프로세서
│   ├── heading-optimizer.ts        # 제목 구조 최적화
│   ├── code-highlighter.ts         # 코드 블록 향상
│   └── table-generator.ts          # 표/목차 생성
├── prompts/
│   ├── style-prompts.ts             # 스타일 개선 프롬프트
│   ├── readability-prompts.ts       # 가독성 분석 프롬프트
│   └── technical-prompts.ts         # 기술 문서 특화 프롬프트
└── models/
    ├── gemini-config.ts             # Gemini 모델 설정
    └── langchain-pipeline.ts        # LangChain 파이프라인
```

### 4.2 핵심 서비스 인터페이스

```typescript
interface IStyleUpgradeService {
  enhanceContent(input: StyleUpgradeInput): Promise<StyleUpgradeResult>;
  analyzeReadability(content: string): Promise<ReadabilityScore>;
  generateTableOfContents(content: string): Promise<string>;
}

interface IReadabilityAnalyzer {
  calculateScore(content: string): Promise<number>;
  identifyImprovements(content: string): Promise<string[]>;
}
```

## 5. 구현 단계

### Phase 1: 기반 설정 (1일)

1. **패키지 설치 및 환경 설정**
   - AI 관련 패키지 설치
   - 환경 변수 설정 (GOOGLE_AI_API_KEY)
   - 기본 AI 설정 파일 생성

2. **기본 서비스 구조 생성**
   - AI 서비스 기본 클래스 생성
   - 에러 처리 및 로깅 설정
   - 기본 타입 정의

### Phase 2: 핵심 기능 구현 (2-3일)

1. **스타일 업그레이드 서비스**
   - Gemini API 연동
   - 기본 스타일 향상 로직
   - 가독성 점수 계산

2. **콘텐츠 프로세싱**
   - Markdown 파싱 및 전처리
   - 코드 블록 향상
   - 제목 구조 최적화

3. **API 엔드포인트 구현**
   - 입력 검증 및 에러 처리
   - 응답 포맷 표준화
   - 성능 최적화 (2초 이내)

### Phase 3: 고급 기능 및 최적화 (1-2일)

1. **고급 처리 기능**
   - 목차 자동 생성
   - 표 구조 개선
   - 기술 문서 특화 처리

2. **성능 및 품질 최적화**
   - 캐싱 전략 구현
   - 에러 복구 로직
   - 모니터링 및 로깅

### Phase 4: 테스트 및 검증 (1일)

1. **통합 테스트**
   - API 엔드포인트 테스트
   - 다양한 입력 케이스 검증
   - 성능 테스트 (2초 이내 응답)

2. **품질 검증**
   - 가독성 점수 정확성 검증
   - 에러 처리 테스트
   - 문서화 완료

## 6. 성능 요구사항

### 응답 시간 목표

- **목표**: 2초 이내 응답
- **전략**:
  - 스트리밍 응답 고려
  - 프롬프트 최적화
  - 캐싱 구현

### 가독성 점수 기준

- **목표**: 80점 이상 달성
- **측정 기준**:
  - 제목 구조 개선도
  - 코드 블록 정리도
  - 전체적인 가독성 향상

## 7. 에러 처리 및 복구 전략

### AI 서비스 실패 시

1. **Fallback 전략**: 기본 포맷팅 제공
2. **Retry 로직**: 최대 3회 재시도
3. **Graceful Degradation**: 부분적 성공 허용

### 입력 검증

- 콘텐츠 길이 제한 (최대 50,000자)
- 지원 포맷 검증 (Markdown, HTML)
- 악의적 입력 필터링

## 8. 보안 고려사항

### API 키 관리

- 환경 변수를 통한 안전한 키 관리
- 서버사이드에서만 AI API 호출

### 입력 데이터 보안

- 사용자 콘텐츠의 외부 유출 방지
- 프라이버시 정책 준수

## 9. 모니터링 및 로깅

### 성능 메트릭

- 응답 시간 추적
- AI API 호출 성공/실패율
- 가독성 점수 분포

### 로깅 전략

- AI 처리 과정 상세 로깅
- 에러 발생 시 컨텍스트 보존
- 사용 패턴 분석을 위한 익명화된 로깅

## 10. 향후 확장 계획

### Phase 2 준비사항

- 멀티 사용자 환경에서의 AI 사용량 관리
- 사용자별 AI 설정 커스터마이징
- AI 처리 결과 캐싱 및 재사용

### 고도화 기능

- 실시간 스타일 제안
- A/B 테스트를 통한 프롬프트 최적화
- 다국어 지원 준비

---

이 구현 계획서는 PRD의 요구사항을 만족하면서도 확장 가능한 아키텍처를 제공합니다. 각 단계별로 검증 가능한 결과물을 만들어 점진적으로 완성도를 높여나갈 예정입니다.

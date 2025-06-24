# Dom vlog

AI 기능이 내장된 개인 기술 블로그 플랫폼

## 🚀 프로젝트 개요

Dom vlog는 AI가 자동으로 글 가독성을 향상시키고, SEO를 최적화하며, 적절한 카테고리를 추천하는 차세대 개인 기술 블로그 플랫폼입니다.

### 주요 기능

- ✨ **AI 자동 스타일링**: 코드 블록, 제목 구조, 표를 AI가 자동으로 정리해 가독성 80점 이상 달성
- 🚀 **SEO 최적화**: 키워드 추출, 메타태그, OG 태그를 AI가 자동 생성하여 검색 노출 극대화
- 🎯 **스마트 카테고리**: 주제 모델링으로 최적의 카테고리를 추천하여 체계적인 블로그 관리

## 🛠 기술 스택

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **Tools**: ESLint, Prettier, Husky, pnpm
- **Future**: Vercel AI SDK, Gemini-2.5-flash-lite

## 📦 설치 및 실행

### 요구사항

- Node.js 20 이상
- pnpm 8 이상

### 설치

\`\`\`bash

# 의존성 설치

pnpm install
\`\`\`

### 환경설정

#### 🚀 자동 설정 (권장)

**Windows (PowerShell):**
\`\`\`powershell
.\scripts\setup-env.ps1
\`\`\`

**Linux/Mac (Bash):**
\`\`\`bash
./scripts/setup-env.sh
\`\`\`

#### 🔧 수동 설정

1. **Supabase 프로젝트 생성** ([supabase.com](https://supabase.com))

2. **환경변수 파일 생성:**
   \`\`\`bash

# 예제 파일을 복사하여 .env.local 생성

cp env.example .env.local
\`\`\`

3. **필수 환경변수 설정:**
   \`\`\`env

# Supabase 설정 (필수)

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI 기능 사용 시 필수

GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# 개발 환경 설정

NODE_ENV=development
\`\`\`

4. **API 키 발급:**
   - **Supabase**: Dashboard > Settings > API에서 Project URL과 anon public key 확인
   - **Google AI**: [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 생성

> 📚 **자세한 환경설정 가이드**: [docs/environment-setup-guide.md](./docs/environment-setup-guide.md)

### 실행

\`\`\`bash

# 개발 서버 실행

pnpm dev

# 빌드

pnpm build

# 프로덕션 실행

pnpm start
\`\`\`

### Supabase 연결 확인

개발 서버 실행 후 홈페이지 하단의 "Supabase 연결 상태" 섹션에서 연결 테스트를 진행할 수 있습니다.

또는 API 엔드포인트로 직접 확인:
\`\`\`bash
curl http://localhost:3000/api/supabase-test
\`\`\`

### 개발 도구

\`\`\`bash

# 린트 검사

pnpm lint

# 린트 자동 수정

pnpm lint:fix

# 코드 포맷팅

pnpm format

# 포맷팅 검사

pnpm format:check

# 타입 체크

pnpm type-check

# CI 전체 실행 (로컬 테스트)

pnpm ci
\`\`\`

## ⚙️ CI/CD 파이프라인

이 프로젝트는 GitHub Actions를 사용하여 완전 자동화된 CI/CD 파이프라인을 구축했습니다.

### 설정된 워크플로우

- **CI (Continuous Integration)**: 코드 품질 검사, 타입 체크, 테스트, 빌드
- **CD (Continuous Deployment)**: Vercel 자동 배포
- **PR Check**: PR 제목 검증, 크기 제한, 자동 리뷰어 할당
- **CodeQL Security**: 보안 취약점 분석
- **Dependabot**: 의존성 자동 업데이트

### 필요한 GitHub Secrets

CI/CD가 정상 작동하려면 다음 Secrets를 GitHub 저장소에 설정해야 합니다:

\`\`\`

# Supabase

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Vercel (자동 배포용)

VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
\`\`\`

자세한 설정 가이드는 [GitHub Actions 설정 가이드](./docs/github-actions-setup.md)를 참고하세요.

## 📁 프로젝트 구조

\`\`\`
dom-vlog/
├── app/ # Next.js 15 App Router
│ ├── api/ # API 라우트
│ │ └── supabase-test/ # Supabase 연결 테스트
│ ├── layout.tsx # 루트 레이아웃
│ └── page.tsx # 홈페이지
├── components/ # 재사용 가능한 React 컴포넌트
│ ├── ui/ # 기본 UI 컴포넌트 (shadcn/ui)
│ ├── layout/ # 레이아웃 컴포넌트
│ ├── editor/ # 에디터 관련 컴포넌트
│ ├── blog/ # 블로그 관련 컴포넌트
│ ├── ai/ # AI 관련 컴포넌트
│ ├── auth/ # 인증 관련 컴포넌트
│ └── SupabaseStatus.tsx # Supabase 연결 상태 컴포넌트
├── lib/ # 유틸리티 및 설정
│ ├── ai/ # AI 서비스 설정
│ ├── utils/ # 유틸리티 함수
│ ├── constants/ # 상수 정의
│ ├── validations/ # 유효성 검사 스키마
│ └── utils.ts # 일반 유틸리티
├── types/ # TypeScript 타입 정의
├── hooks/ # 커스텀 React 훅
├── ai/ # AI 관련 기능
│ ├── processors/ # AI 처리 엔진
│ ├── models/ # AI 모델 설정
│ ├── prompts/ # AI 프롬프트 템플릿
│ └── services/ # AI 서비스 클래스
├── supabase/ # Supabase 설정 및 마이그레이션
│ ├── migrations/ # 데이터베이스 마이그레이션
│ ├── functions/ # Edge Functions
│ ├── seed/ # 초기 데이터
│ ├── client.ts # 클라이언트 사이드 설정
│ ├── server.ts # 서버 사이드 설정
│ └── utils.ts # Supabase 유틸리티
├── tests/ # 테스트 파일
│ ├── **mocks**/ # 모의 객체
│ ├── unit/ # 단위 테스트
│ ├── integration/ # 통합 테스트
│ └── e2e/ # E2E 테스트
├── docs/ # 프로젝트 문서
├── middleware.ts # Next.js 미들웨어 (Supabase Auth)
├── public/ # 정적 파일
├── .husky/ # Git 훅
└── .env.local # 환경변수 (로컬 개발용)
\`\`\`

## 🤝 개발 가이드라인

### 커밋 메시지 규칙

이 프로젝트는 [Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다.

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경
- `refactor`: 리팩토링
- `perf`: 성능 개선
- `test`: 테스트 추가/수정
- `build`: 빌드 시스템 변경
- `ci`: CI 설정 변경
- `chore`: 기타 변경

### 코드 스타일

- TypeScript strict mode 사용
- Prettier로 코드 포맷팅 자동화
- ESLint로 코드 품질 관리
- Husky로 pre-commit 훅 적용

## 📝 라이선스

MIT License

## 🔗 관련 링크

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

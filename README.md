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
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **Tools**: ESLint, Prettier, Husky, pnpm
- **Future**: Supabase, Prisma, Vercel AI SDK, Gemini-2.5-flash-lite

## 📦 설치 및 실행

### 요구사항

- Node.js 20 이상
- pnpm 8 이상

### 설치

\`\`\`bash

# 의존성 설치

pnpm install

# 개발 서버 실행

pnpm dev

# 빌드

pnpm build

# 프로덕션 실행

pnpm start
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
\`\`\`

## 📁 프로젝트 구조

\`\`\`
dom-vlog/
├── src/
│ ├── app/ # Next.js App Router
│ ├── components/ # React 컴포넌트
│ │ └── ui/ # UI 컴포넌트
│ └── lib/ # 유틸리티 함수
├── public/ # 정적 파일
├── .husky/ # Git 훅
└── docs/ # 문서
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

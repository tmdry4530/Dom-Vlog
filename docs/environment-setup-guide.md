# 환경변수 설정 가이드

## 개요

Dom vlog 프로젝트를 실행하기 위해 필요한 환경변수 설정 방법을 안내합니다.

## 📋 필수 환경변수

### 1. Supabase 설정 (필수)

프로젝트의 데이터베이스와 인증 시스템을 위해 반드시 필요합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**설정 방법:**

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Dashboard > Settings > API 메뉴에서 다음 정보 확인:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Google AI API 키 (AI 기능 사용 시 필수)

AI 스타일 업그레이드 기능을 사용하려면 필요합니다.

```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**설정 방법:**

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 생성
2. "Create API key" 버튼 클릭
3. 생성된 키를 복사하여 환경변수에 설정

> ⚠️ **주의**: API 키 없이도 개발 모드에서는 모의 응답으로 테스트 가능합니다.

## 🔧 개발 환경 설정

### 환경변수 파일 생성

```bash
# 루트 디렉토리에서 실행
cp env.example .env.local
```

### .env.local 파일 편집

```env
# 필수 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
GOOGLE_AI_API_KEY=your_actual_google_ai_key

# 개발 환경 설정
NODE_ENV=development
PORT=3000
```

## 🗄️ 데이터베이스 설정

### Prisma 연결 설정 (선택사항)

로컬 개발 시 Prisma CLI를 사용하려면:

```env
DATABASE_URL=postgresql://postgres:your_password@db.your-project-id.supabase.co:5432/postgres
```

**DATABASE_URL 구성:**

- `your_password`: Supabase 프로젝트 생성 시 설정한 데이터베이스 비밀번호
- `your-project-id`: Supabase 프로젝트 ID

**비밀번호 찾기:**

1. Supabase Dashboard > Settings > Database
2. "Connection string" 섹션에서 확인

## 🚀 환경별 설정

### 개발 환경 (.env.local)

```env
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

### 프로덕션 환경 (Vercel)

Vercel Dashboard에서 환경변수 설정:

1. 프로젝트 설정 > Environment Variables
2. 다음 변수들 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_AI_API_KEY`
   - `NODE_ENV=production`

### 테스트 환경

```env
NODE_ENV=test
DATABASE_URL=file:./test.db
```

## 🔍 환경변수 검증

### 1. Supabase 연결 테스트

```bash
# 개발 서버 실행 후
curl http://localhost:3000/api/supabase-test
```

### 2. AI API 테스트

```bash
# AI 테스트 스크립트 실행
node ai/test-style-enhancer.js
```

### 3. 웹 인터페이스 확인

- 홈페이지 하단의 "Supabase 연결 상태" 섹션에서 상태 확인
- 연결 성공 시 녹색 체크 표시

## 🔒 보안 주의사항

### 환경변수 보안

- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- API 키는 외부에 노출되지 않도록 주의하세요
- 프로덕션과 개발 환경의 키를 분리하여 사용하세요

### 권한 설정

- Supabase RLS(Row Level Security) 정책 확인
- Google AI API 키 사용량 제한 설정 권장

## 🐛 문제 해결

### 자주 발생하는 오류

#### 1. Supabase 연결 실패

```
Error: Supabase 환경변수가 설정되지 않았습니다.
```

**해결방법:**

- `.env.local` 파일에 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
- 키 값에 공백이나 특수문자가 포함되지 않았는지 확인

#### 2. AI API 키 오류

```
Error: GOOGLE_AI_API_KEY 환경 변수가 설정되지 않았습니다.
```

**해결방법:**

- Google AI Studio에서 새 API 키 생성
- 키가 활성화되었는지 확인 (생성 후 몇 분 소요)

#### 3. 데이터베이스 연결 오류

```
Error: Can't reach database server
```

**해결방법:**

- `DATABASE_URL` 형식 확인
- Supabase 프로젝트가 활성 상태인지 확인
- 네트워크 연결 상태 확인

## 📚 추가 리소스

### 공식 문서

- [Supabase 환경변수 설정](https://supabase.com/docs/guides/getting-started/local-development)
- [Next.js 환경변수](https://nextjs.org/docs/basic-features/environment-variables)
- [Google AI API 문서](https://ai.google.dev/docs)

### 개발 도구

- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Prisma Studio](https://www.prisma.io/studio)

## 📞 지원

환경설정 관련 문제가 발생하면:

1. 이 가이드의 문제 해결 섹션 확인
2. 프로젝트 이슈 트래커에 문의
3. 개발팀에 직접 연락

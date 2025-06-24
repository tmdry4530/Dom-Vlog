# 환경변수 설정 체크리스트

## 📋 개발 환경 설정 체크리스트

### ✅ 필수 환경변수

#### 1. Supabase 설정

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 공개 키 (anon key)

**확인 방법:**

```bash
# Supabase 연결 테스트
curl http://localhost:3000/api/supabase-test
```

#### 2. AI 기능 설정

- [ ] `GOOGLE_AI_API_KEY` - Google AI Studio API 키

**확인 방법:**

```bash
# AI 기능 테스트
node ai/test-style-enhancer.js
```

### 🔧 선택적 환경변수

#### 3. 데이터베이스 직접 연결 (Prisma CLI 사용 시)

- [ ] `DATABASE_URL` - PostgreSQL 연결 문자열

**확인 방법:**

```bash
# Prisma 연결 테스트
pnpm db:generate
```

#### 4. 개발 환경 설정

- [ ] `NODE_ENV=development` - 개발 모드 설정
- [ ] `PORT=3000` - 개발 서버 포트 (기본값)

### 🚀 프로덕션 환경 추가 설정

#### 5. 보안 설정

- [ ] `NEXTAUTH_SECRET` - JWT 시크릿 키
- [ ] `NEXTAUTH_URL` - 프로덕션 도메인

#### 6. 모니터링 및 분석

- [ ] `VERCEL_ANALYTICS_ID` - Vercel Analytics ID
- [ ] `SENTRY_DSN` - Sentry 에러 추적 DSN

## 🔍 환경변수 검증 방법

### 1. 자동 검증 스크립트 실행

```bash
# Windows
.\scripts\setup-env.ps1

# Linux/Mac
./scripts/setup-env.sh
```

### 2. 수동 검증

#### Supabase 연결 확인

```bash
# API 테스트
curl http://localhost:3000/api/supabase-test

# 웹 인터페이스에서 확인
# 홈페이지 하단 "Supabase 연결 상태" 섹션
```

#### AI 기능 확인

```bash
# AI 스타일 업그레이드 테스트
node ai/test-style-enhancer.js

# API 엔드포인트 테스트
curl -X POST http://localhost:3000/api/ai/style-upgrade \
  -H "Content-Type: application/json" \
  -d '{"content":"# 테스트","contentType":"markdown"}'
```

#### 개발 서버 실행 확인

```bash
# 개발 서버 시작
pnpm dev

# 브라우저에서 http://localhost:3000 접속
```

## 🐛 문제 해결

### 일반적인 오류와 해결방법

#### 1. Supabase 연결 실패

**오류:**

```
Error: Supabase 환경변수가 설정되지 않았습니다.
```

**해결방법:**

1. `.env.local` 파일에 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
2. Supabase Dashboard에서 정확한 값 복사
3. 환경변수 값에 공백이나 따옴표가 포함되지 않았는지 확인

#### 2. AI API 키 오류

**오류:**

```
Error: GOOGLE_AI_API_KEY 환경 변수가 설정되지 않았습니다.
```

**해결방법:**

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 새 API 키 생성
2. 생성된 키를 `.env.local`에 정확히 입력
3. API 키가 활성화될 때까지 몇 분 대기

#### 3. 데이터베이스 연결 오류

**오류:**

```
Error: Can't reach database server
```

**해결방법:**

1. `DATABASE_URL` 형식 확인
2. Supabase 프로젝트가 활성 상태인지 확인
3. 네트워크 연결 상태 확인

### 환경변수 파일 위치 확인

#### 개발 환경

- `.env.local` - 루트 디렉토리
- `tests/env.test` - 테스트 환경
- `supabase/env.supabase` - Supabase 로컬 개발

#### 프로덕션 환경

- Vercel Dashboard > Project Settings > Environment Variables
- GitHub Secrets (CI/CD용)

## 📚 참고 자료

### 환경변수 관련 문서

- [환경변수 설정 가이드](./environment-setup-guide.md)
- [env.example](../env.example) - 환경변수 예제 파일

### 외부 서비스 문서

- [Supabase 환경변수 설정](https://supabase.com/docs/guides/getting-started/local-development)
- [Next.js 환경변수](https://nextjs.org/docs/basic-features/environment-variables)
- [Google AI API 문서](https://ai.google.dev/docs)

### 도구 및 스크립트

- `scripts/setup-env.ps1` - Windows 자동 설정 스크립트
- `scripts/setup-env.sh` - Linux/Mac 자동 설정 스크립트
- `ai/test-style-enhancer.js` - AI 기능 테스트 스크립트

## ✅ 완료 체크리스트

설정이 완료되면 다음 항목들을 확인하세요:

### 기본 기능

- [ ] 홈페이지 정상 로딩 (http://localhost:3000)
- [ ] Supabase 연결 상태 녹색 표시
- [ ] 개발 서버 오류 없이 실행

### AI 기능 (선택사항)

- [ ] AI 스타일 업그레이드 API 정상 응답
- [ ] 테스트 스크립트 실행 성공

### 개발 도구

- [ ] TypeScript 컴파일 오류 없음
- [ ] ESLint 검사 통과
- [ ] 테스트 실행 성공

### 추가 확인사항

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있음
- [ ] 환경변수 값에 실제 API 키가 포함되어 있음
- [ ] 프로덕션 배포 시 환경변수 별도 설정 완료

---

**🎉 모든 체크리스트가 완료되면 Dom vlog 개발을 시작할 준비가 완료됩니다!**

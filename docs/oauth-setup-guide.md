# OAuth 소셜 로그인 설정 가이드

## 개요

Dom Vlog에서 Google과 GitHub OAuth 로그인을 설정하는 방법을 안내합니다.

## 🚀 구현된 기능

- ✅ GitHub 로그인
- ✅ Google 로그인
- ✅ OAuth 콜백 처리
- ✅ 자동 프로필 생성
- ✅ 기존 계정과 연동

## 📋 사전 준비사항

1. Supabase 프로젝트 생성 완료
2. GitHub 계정 (GitHub OAuth App 생성용)
3. Google 계정 (Google Cloud Console 접근용)

## 🔧 1. Supabase OAuth 설정

### 1.1 Supabase Dashboard 접속

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 `Authentication` > `Providers` 클릭

### 1.2 Google OAuth 설정

#### Google Cloud Console에서 OAuth 앱 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트 생성 또는 기존 프로젝트 선택
3. `APIs & Services` > `Credentials` 이동
4. `+ CREATE CREDENTIALS` > `OAuth 2.0 Client IDs` 선택
5. Application type: `Web application` 선택
6. Name: `Dom Vlog` 입력
7. Authorized redirect URIs에 추가:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
8. `CREATE` 클릭하여 Client ID와 Client Secret 획득

#### Supabase에서 Google Provider 활성화

1. Supabase Dashboard > Authentication > Providers
2. Google 토글 활성화
3. Client ID와 Client Secret 입력
4. `Save` 클릭

### 1.3 GitHub OAuth 설정

#### GitHub OAuth App 생성

1. [GitHub Settings](https://github.com/settings/developers)에 접속
2. `OAuth Apps` > `New OAuth App` 클릭
3. 다음 정보 입력:
   - Application name: `Dom Vlog`
   - Homepage URL: `http://localhost:3000` (개발용) 또는 실제 도메인
   - Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
4. `Register application` 클릭
5. Client ID와 Client Secret 확인

#### Supabase에서 GitHub Provider 활성화

1. Supabase Dashboard > Authentication > Providers
2. GitHub 토글 활성화
3. Client ID와 Client Secret 입력
4. `Save` 클릭

## 🐙 2. GitHub OAuth App 생성

### 2.1 GitHub OAuth App 등록

1. GitHub > Settings > Developer settings > OAuth Apps 이동
2. `New OAuth App` 클릭
3. 다음 정보 입력:
   ```
   Application name: Dom Vlog
   Homepage URL: http://localhost:3000 (개발환경)
   Authorization callback URL: https://[your-project-ref].supabase.co/auth/v1/callback
   ```

### 2.2 Client ID/Secret 복사

1. 생성된 OAuth App에서 `Client ID` 복사
2. `Generate a new client secret` 클릭하여 Secret 생성 및 복사

## 🔴 3. Google OAuth Client 생성

### 3.1 Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. `APIs & Services` > `Credentials` 이동

### 3.2 OAuth 2.0 Client ID 생성

1. `+ CREATE CREDENTIALS` > `OAuth client ID` 선택
2. Application type: `Web application`
3. 다음 정보 입력:
   ```
   Name: Dom Vlog Web Client
   Authorized JavaScript origins: http://localhost:3000
   Authorized redirect URIs: https://[your-project-ref].supabase.co/auth/v1/callback
   ```
4. `Create` 클릭하여 Client ID/Secret 복사

### 3.3 OAuth 동의 화면 설정

1. `OAuth consent screen` 메뉴 이동
2. User Type: `External` 선택
3. 기본 정보 입력:
   ```
   App name: Dom Vlog
   User support email: your-email@example.com
   Developer contact information: your-email@example.com
   ```

## ⚙️ 4. 환경변수 설정

### 4.1 `.env.local` 파일 생성

```bash
# 기본 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 사용자 이메일 설정
ALLOWED_USER_EMAILS=your-email@example.com
```

### 4.2 프로덕션 환경 설정

배포 시에는 도메인을 실제 운영 도메인으로 변경:

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 🧪 5. 테스트

### 5.1 개발 서버 실행

```bash
npm run dev
```

### 5.2 로그인 테스트

1. `http://localhost:3000` 접속
2. 로그인 페이지에서 `GitHub으로 로그인` 또는 `Google로 로그인` 클릭
3. OAuth 제공자의 인증 페이지에서 승인
4. 콜백 처리 확인 (`/auth/callback`)
5. 자동으로 홈페이지로 리다이렉트 확인

## 🔍 6. 문제 해결

### 6.1 일반적인 오류

**오류**: `Invalid OAuth state`
**해결**: Supabase의 리다이렉트 URL이 정확한지 확인

**오류**: `The client_id passed is incorrect`  
**해결**: GitHub/Google Client ID가 올바른지 확인

**오류**: `redirect_uri_mismatch`
**해결**: OAuth App/Client의 리다이렉트 URI 설정 확인

### 6.2 디버깅 방법

1. **브라우저 개발자 도구** 확인
   - Network 탭에서 API 호출 상태 확인
   - Console에서 JavaScript 오류 확인

2. **Supabase Dashboard 로그** 확인
   - Authentication > Logs에서 OAuth 오류 확인

3. **서버 로그** 확인
   ```bash
   npm run dev
   # 터미널에서 OAuth 관련 로그 확인
   ```

## 📚 7. 추가 설정

### 7.1 커스텀 OAuth 콜백 처리

필요시 `/app/auth/callback/page.tsx` 파일을 수정하여 로그인 후 동작을 커스터마이징할 수 있습니다.

### 7.2 프로필 정보 매핑

OAuth 사용자 정보는 자동으로 프로필에 매핑됩니다:

- **GitHub**: `user_name` → `username`, `name` → `displayName`, `avatar_url` → `avatar`
- **Google**: `preferred_username` → `username`, `name` → `displayName`, `picture` → `avatar`

### 7.3 추가 OAuth 제공자

더 많은 OAuth 제공자 추가는 Supabase에서 지원하는 제공자 목록을 확인하여 동일한 패턴으로 구현 가능합니다.

## ✅ 완료 체크리스트

- [ ] Supabase에서 GitHub Provider 활성화
- [ ] Supabase에서 Google Provider 활성화
- [ ] GitHub OAuth App 생성 및 설정
- [ ] Google OAuth Client 생성 및 설정
- [ ] 환경변수 설정 완료
- [ ] 로그인 테스트 성공
- [ ] 콜백 처리 확인
- [ ] 프로필 자동 생성 확인

축하합니다! 🎉 이제 GitHub와 Google 소셜 로그인이 활성화되었습니다.

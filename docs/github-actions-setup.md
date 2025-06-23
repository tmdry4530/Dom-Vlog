# GitHub Actions CI/CD 설정 가이드

## 개요

Dom vlog 프로젝트는 GitHub Actions를 사용하여 CI/CD 파이프라인을 구축했습니다. 이 문서는 설정된 워크플로우와 필요한 구성 요소들을 설명합니다.

## 📋 설정된 워크플로우

### 1. CI (Continuous Integration) - `.github/workflows/ci.yml`

**트리거**:

- `main`, `develop` 브랜치에 push
- `main`, `develop` 브랜치로 PR 생성

**실행 작업**:

- ✅ ESLint 코드 품질 검사
- ✅ TypeScript 타입 체크
- ✅ 단위 테스트 실행
- ✅ 프로덕션 빌드 테스트
- ✅ Lighthouse CI 성능 검사 (PR시에만)

### 2. CD (Continuous Deployment) - `.github/workflows/cd.yml`

**트리거**:

- `main` 브랜치에 push

**실행 작업**:

- 🚀 Vercel에 자동 배포
- 📧 배포 상태 알림

### 3. PR Check - `.github/workflows/pr-check.yml`

**트리거**:

- PR 생성, 업데이트

**실행 작업**:

- 📝 PR 제목 형식 검증 (Semantic Commit)
- 📏 PR 크기 검증 (최대 500라인)
- 👥 자동 리뷰어 할당

### 4. CodeQL Security - `.github/workflows/codeql.yml`

**트리거**:

- `main` 브랜치에 push/PR
- 매주 화요일 1:30 AM (예약)

**실행 작업**:

- 🔒 보안 취약점 분석
- 📊 코드 품질 스캔

## 🔧 필요한 설정

### GitHub Secrets

프로젝트가 정상적으로 작동하려면 다음 Secrets를 GitHub 저장소에 설정해야 합니다:

#### Supabase 관련

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Vercel 배포 관련

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### GitHub Settings > Secrets and variables > Actions에서 설정

1. **Repository secrets**에 위 값들을 추가
2. **Environment secrets** (선택사항): production, staging 환경별 분리

### 브랜치 보호 규칙 설정

`main` 브랜치를 보호하기 위해 다음 규칙을 설정하는 것을 권장합니다:

1. GitHub 저장소 → **Settings** → **Branches**
2. **Add rule** 클릭
3. 다음 설정 적용:
   - Branch name pattern: `main`
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Required checks: `Lint and Test`, `PR Validation`
   - ✅ Require up-to-date branches before merging
   - ✅ Require linear history
   - ✅ Include administrators

## 📦 자동화된 기능

### Dependabot (`.github/dependabot.yml`)

- 매주 월요일 4시에 의존성 업데이트 확인
- npm 패키지 및 GitHub Actions 자동 업데이트
- 자동으로 PR 생성

### PR 템플릿 (`.github/pull_request_template.md`)

- 표준화된 PR 형식 제공
- 체크리스트로 품질 보장

### Lighthouse CI (`.lighthouserc.json`)

- 성능: 80점 이상 (경고)
- 접근성: 90점 이상 (필수)
- Best Practices: 80점 이상 (경고)
- SEO: 80점 이상 (경고)

## 🚀 워크플로우 사용법

### 개발 워크플로우

1. **기능 브랜치 생성**

   ```bash
   git checkout -b feat/new-feature
   ```

2. **개발 및 커밋**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **로컬 CI 실행 (선택사항)**

   ```bash
   pnpm run ci
   ```

4. **브랜치 푸시**

   ```bash
   git push origin feat/new-feature
   ```

5. **PR 생성**
   - GitHub에서 PR 생성
   - PR 템플릿 작성
   - CI 통과 확인

6. **코드 리뷰 및 머지**
   - 리뷰어 확인
   - CI 통과 확인
   - `main` 브랜치로 머지

7. **자동 배포**
   - `main`으로 머지 시 자동 배포 실행

### 커밋 메시지 규칙

Semantic Commit Convention을 따라야 합니다:

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅
refactor: 코드 리팩토링
perf: 성능 개선
test: 테스트 추가
build: 빌드 시스템 수정
ci: CI 설정 변경
chore: 기타 변경사항
revert: 이전 커밋 되돌리기
```

## 🔍 문제 해결

### CI 실패 시

1. **린트 오류**: `pnpm run lint:fix`로 자동 수정
2. **타입 오류**: TypeScript 에러 확인 및 수정
3. **빌드 실패**: 콘솔 로그 확인 후 수정

### 배포 실패 시

1. Vercel 토큰 및 프로젝트 ID 확인
2. 환경 변수 설정 확인
3. Vercel 대시보드에서 로그 확인

### 보안 경고 시

1. Dependabot PR 확인
2. CodeQL 분석 결과 확인
3. 취약점 수정 및 업데이트

## 📊 모니터링

### GitHub Actions 탭에서 확인 가능한 정보:

- ✅ 워크플로우 실행 상태
- 📈 실행 시간 및 성능
- 📋 상세 로그 및 에러 메시지
- 📊 Lighthouse 성능 리포트

### Vercel 대시보드에서 확인:

- 🚀 배포 상태 및 로그
- 📈 성능 메트릭
- 🌐 프리뷰 URL

이 설정으로 안정적이고 효율적인 개발 및 배포 파이프라인이 구축되었습니다.

# UI-API 통합 구현 계획

## 1. 코드베이스 구조 분석 결과

### 현재 구현 상태

- ✅ **백엔드 서비스 계층**: 완전 구현됨
  - `auth-service.ts`: 인증 관리 (로그인, 로그아웃, 세션)
  - `post-service.ts`: 블로그 포스트 CRUD
  - `profile-service.ts`: 프로필 관리
- ✅ **API 라우트**: 완전 구현됨
  - `/api/auth/*`: 인증 관련 API
  - `/api/posts/*`: 포스트 관련 API
  - `/api/profile/*`: 프로필 관련 API
- ⚠️ **훅 모듈**: 목 데이터로 구현됨
  - `usePosts`: 임시 샘플 데이터 사용
  - `useProfile`: 임시 프로필 데이터 사용
  - 실제 API 연동 필요
- ⚠️ **UI 컴포넌트**: 부분적 구현
  - 컴포넌트는 존재하지만 실제 API 연동 없음
  - 상태 관리와 에러 처리 부분 완성 필요

### 주요 패턴 분석

1. **API 응답 표준화**: `ApiResponse<T>` 타입으로 일관된 응답 구조
2. **에러 처리**: 서비스 계층에서 try-catch로 일관된 에러 처리
3. **인증 체크**: `requireAuth()` 유틸리티로 인증 확인 표준화
4. **유효성 검증**: Zod 스키마로 입력값 검증
5. **타입 안전성**: TypeScript로 완전한 타입 안전성 보장

## 2. 통합 전략 및 모듈별 역할

### 데이터 플로우

```
UI Components → Custom Hooks → API Routes → Service Layer → Database
     ↑              ↑              ↑            ↑
   State         API Call      Validation   Business Logic
```

### 모듈별 역할 정의

#### 1) Custom Hooks (`hooks/`)

- **역할**: UI와 API 사이의 상태 관리 및 데이터 페칭
- **책임**:
  - API 호출 및 응답 처리
  - 로딩/에러 상태 관리
  - 클라이언트 사이드 캐싱
  - 낙관적 업데이트

#### 2) API Routes (`app/api/`)

- **역할**: HTTP 요청/응답 처리 및 비즈니스 로직 호출
- **책임**:
  - 요청 파라미터 파싱 및 검증
  - 서비스 계층 호출
  - HTTP 상태 코드 관리
  - 에러 응답 표준화

#### 3) Service Layer (`lib/`)

- **역할**: 비즈니스 로직 및 데이터 액세스 로직
- **책임**:
  - 인증 및 권한 검증
  - 데이터 조작 및 검증
  - 데이터베이스 트랜잭션
  - 비즈니스 규칙 적용

## 3. 통합 구현 플로우

### Phase 1: 인증/세션 관리 모듈 (useAuth)

#### 구현할 기능

1. **인증 상태 관리**

   ```typescript
   interface AuthState {
     user: UserSession | null;
     isLoading: boolean;
     isAuthenticated: boolean;
     error: string | null;
   }
   ```

2. **인증 관련 함수**
   - `login(email, password)`: 로그인 처리
   - `logout()`: 로그아웃 처리
   - `checkAuth()`: 인증 상태 확인
   - `refreshSession()`: 세션 갱신

#### 통합 지점

- API: `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`
- Service: `auth-service.ts`의 `signIn`, `signOut`, `getCurrentUser`

### Phase 2: 글 관리 모듈 (usePosts)

#### 구현할 기능

1. **포스트 상태 관리**

   ```typescript
   interface PostsState {
     posts: Post[];
     selectedPost: Post | null;
     isLoading: boolean;
     error: string | null;
     pagination: PaginationInfo;
   }
   ```

2. **CRUD 함수**
   - `getPosts(filters, pagination)`: 포스트 목록 조회
   - `getPost(id)`: 단일 포스트 조회
   - `createPost(data)`: 포스트 생성
   - `updatePost(id, data)`: 포스트 수정
   - `deletePost(id)`: 포스트 삭제

#### 통합 지점

- API: `/api/posts/*`
- Service: `post-service.ts`의 모든 함수들

### Phase 3: 프로필 관리 모듈 (useProfile)

#### 구현할 기능

1. **프로필 상태 관리**

   ```typescript
   interface ProfileState {
     profile: Profile | null;
     isLoading: boolean;
     error: string | null;
     uploadProgress: number;
   }
   ```

2. **프로필 관련 함수**
   - `getProfile()`: 프로필 조회
   - `updateProfile(data)`: 프로필 수정
   - `uploadAvatar(file)`: 아바타 업로드

#### 통합 지점

- API: `/api/auth/profile/*`
- Service: `profile-service.ts`의 모든 함수들

## 4. 에러 처리 전략

### 1) 계층별 에러 처리

```typescript
// Service Layer: 비즈니스 에러 처리
try {
  // 비즈니스 로직
} catch (error) {
  return { success: false, error: 'Business error message' };
}

// API Layer: HTTP 에러 처리
if (!result.success) {
  return NextResponse.json(
    { success: false, error: result.error },
    { status: getStatusCode(result.error) }
  );
}

// Hook Layer: UI 에러 처리
catch (error) {
  setError(getErrorMessage(error));
  showNotification('error', error.message);
}
```

### 2) 공통 에러 처리 유틸리티

```typescript
// lib/utils/error-handler.ts
export function getStatusCode(error: string): number;
export function getErrorMessage(error: unknown): string;
export function isAuthError(error: string): boolean;
```

## 5. 구현 단계별 계획

### Step 1: useAuth 훅 구현

- [ ] 인증 상태 관리 구현
- [ ] API 연동 및 에러 처리
- [ ] 세션 유지 및 갱신 로직
- [ ] 로그인/로그아웃 UI 연동 테스트

### Step 2: usePosts 훅 구현

- [ ] 포스트 목록 조회 구현
- [ ] 포스트 CRUD 연동
- [ ] 필터링 및 페이지네이션
- [ ] 낙관적 업데이트 구현

### Step 3: useProfile 훅 구현

- [ ] 프로필 조회/수정 구현
- [ ] 아바타 업로드 기능
- [ ] 프로필 유효성 검증
- [ ] 실시간 UI 반영

### Step 4: 통합 테스트 및 최적화

- [ ] 엔드투엔드 테스트
- [ ] 성능 최적화 (캐싱, 디바운싱)
- [ ] 접근성 개선
- [ ] 에러 경계 구현

## 6. 품질 기준

### 기능 요구사항

- [ ] 모든 CRUD 작업이 정상 동작
- [ ] 인증 상태가 실시간으로 UI에 반영
- [ ] 에러 상황에서 적절한 사용자 피드백
- [ ] 로딩 상태 표시

### 성능 요구사항

- [ ] API 응답 시간 < 500ms
- [ ] 페이지 로딩 시간 < 2초
- [ ] 메모리 누수 없음
- [ ] 불필요한 리렌더링 방지

### 사용자 경험 요구사항

- [ ] 직관적인 에러 메시지
- [ ] 적절한 로딩 인디케이터
- [ ] 키보드 네비게이션 지원
- [ ] 반응형 디자인 지원

## 7. 테스트 전략

### 단위 테스트

- Custom hooks 개별 기능 테스트
- API 엔드포인트 테스트
- 서비스 계층 로직 테스트

### 통합 테스트

- Hook + API + Service 연동 테스트
- 인증 플로우 테스트
- CRUD 작업 플로우 테스트

### E2E 테스트

- 전체 사용자 워크플로우 테스트
- 에러 시나리오 테스트
- 성능 테스트

## 8. 예외 상황 처리

### 네트워크 에러

- 재시도 로직 구현
- 오프라인 상태 감지
- 사용자 친화적 에러 메시지

### 인증 에러

- 자동 로그아웃 처리
- 로그인 페이지 리다이렉션
- 세션 만료 알림

### 데이터 동기화 에러

- 낙관적 업데이트 롤백
- 데이터 새로고침 옵션
- 충돌 해결 전략

이 계획을 바탕으로 단계별로 구현을 진행하여 안정적이고 사용자 친화적인 UI-API 통합을 완성할 예정입니다.

# Dom Vlog - UI 인터랙션 및 상태관리 구현 계획서

## 1. 현재 코드베이스 분석

### 1.1 구현된 UI 컴포넌트 현황

#### Layout Components ✅

```
components/layout/
├── Header.tsx           # 네비게이션, 모바일 메뉴 (상태: 일부 인터랙션 구현)
├── Footer.tsx           # 정적 푸터 (상태: 완료)
└── BlogLayout.tsx       # 페이지 래퍼 (상태: 완료)
```

#### Blog Components ✅

```
components/blog/
├── PostCard.tsx         # 포스트 카드 (상태: 일부 인터랙션 구현)
└── PostList.tsx         # 포스트 목록 (상태: 클라이언트 상태관리 구현)
```

#### Hooks ✅

```
hooks/
├── useResponsive.ts     # 반응형 감지 (상태: 완료)
└── index.ts             # 훅 익스포트 (상태: 완료)
```

### 1.2 현재 상태관리 패턴 분석

#### 구현된 상태관리

1. **PostList.tsx**
   - `useState`로 로컬 상태 관리
   - 검색, 필터링, 페이지네이션 상태
   - 클라이언트 사이드 로직

2. **Header.tsx**
   - 모바일 메뉴 토글 상태
   - 기본적인 `useState` 사용

#### 부족한 상태관리 영역

1. **글 편집/게시/삭제 플로우**: 미구현
2. **프로필 관리**: 정적 페이지만 존재
3. **전역 상태관리**: 없음
4. **에러 처리**: 기본적 수준
5. **로딩 상태**: 미구현
6. **폼 유효성 검사**: 미구현

### 1.3 인터랙션 요구사항 분석

#### Phase 1 필수 인터랙션

1. **글 관리 플로우**
   - 글 작성 (에디터)
   - 글 수정 (기존 글 로드 + 에디터)
   - 글 삭제 (확인 다이얼로그)
   - 글 게시/저장 (상태 토글)

2. **프로필 관리 플로우**
   - 프로필 정보 수정
   - 아바터 이미지 업로드
   - 설정 변경

3. **사용자 경험 개선**
   - 로딩 상태 표시
   - 에러 메시지 처리
   - 성공 알림
   - 실시간 유효성 검사

## 2. 상태관리 아키텍처 설계

### 2.1 상태관리 전략

#### 로컬 상태 (useState, useReducer)

- 컴포넌트별 UI 상태
- 폼 입력 상태
- 모달/다이얼로그 상태

#### 전역 상태 (Zustand)

- 사용자 정보
- 글 목록 캐시
- 알림/토스트 메시지
- 테마 설정

#### 서버 상태 (TanStack Query 권장)

- API 호출 상태
- 데이터 캐싱
- 배경 업데이트
- 오프라인 지원

### 2.2 권장 라이브러리 스택

```json
{
  "상태관리": {
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.17.0"
  },
  "폼관리": {
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0"
  },
  "UI피드백": {
    "sonner": "^1.3.0"
  }
}
```

## 3. 구현 계획

### 3.1 Phase 1: 글 편집/게시/삭제 상태관리

#### 3.1.1 글 에디터 컴포넌트

```typescript
// components/editor/PostEditor.tsx
interface PostEditorProps {
  postId?: string;     // 수정 모드
  initialData?: Post;  // 초기 데이터
  onSave: (post: PostData) => Promise<void>;
  onCancel: () => void;
}

// 상태관리
- 에디터 내용 (markdown)
- 제목, 카테고리, 태그
- 저장 상태 (저장중, 성공, 실패)
- AI 처리 상태
- 유효성 검사 상태
```

#### 3.1.2 글 목록 관리

```typescript
// hooks/usePosts.ts
interface UsePostsResult {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  createPost: (data: CreatePostData) => Promise<Post>;
  updatePost: (id: string, data: UpdatePostData) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
}
```

#### 3.1.3 글 삭제 확인 다이얼로그

```typescript
// components/blog/DeletePostDialog.tsx
interface DeletePostDialogProps {
  isOpen: boolean;
  postTitle: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}
```

### 3.2 Phase 2: 프로필 관리 상태관리

#### 3.2.1 프로필 편집 폼

```typescript
// components/profile/ProfileEditForm.tsx
interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  avatar?: File;
  website?: string;
  location?: string;
  skills: string[];
  interests: string[];
}

// 상태관리
- 폼 데이터
- 유효성 검사 결과
- 이미지 업로드 진행률
- 저장 상태
```

#### 3.2.2 이미지 업로드 컴포넌트

```typescript
// components/ui/ImageUpload.tsx
interface ImageUploadProps {
  currentImage?: string;
  onUpload: (file: File) => Promise<string>;
  maxSize?: number;
  acceptedTypes?: string[];
}

// 상태관리
- 업로드 진행률
- 미리보기 이미지
- 드래그 앤 드롭 상태
- 에러 상태
```

### 3.3 Phase 3: 전역 상태관리

#### 3.3.1 전역 스토어 설계

```typescript
// stores/useGlobalStore.ts
interface GlobalState {
  // 사용자 정보
  user: User | null;
  setUser: (user: User | null) => void;

  // 테마
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // 알림
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;

  // 사이드바 상태
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}
```

#### 3.3.2 알림 시스템

```typescript
// hooks/useNotifications.ts
interface UseNotificationsResult {
  notifications: Notification[];
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}
```

## 4. 인터랙션 패턴 설계

### 4.1 폼 인터랙션 패턴

#### 4.1.1 실시간 유효성 검사

```typescript
// 패턴: debounced validation
const useFormValidation = (schema: ZodSchema) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useMemo(
    () =>
      debounce((name: string, value: any) => {
        // 실시간 유효성 검사 로직
      }, 300),
    [schema]
  );

  return { errors, validateField };
};
```

#### 4.1.2 낙관적 업데이트

```typescript
// 패턴: optimistic update
const useOptimisticUpdate = <T>(
  updateFn: (data: T) => Promise<T>,
  queryKey: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFn,
    onMutate: async (newData) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, newData);
      return { previousData };
    },
    onError: (err, newData, context) => {
      // 롤백
      queryClient.setQueryData(queryKey, context?.previousData);
    },
    onSettled: () => {
      // 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
```

### 4.2 사용자 피드백 패턴

#### 4.2.1 로딩 상태 패턴

```typescript
// 패턴: unified loading states
interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState<
    Record<string, LoadingState>
  >({});

  const setLoading = (key: string, state: LoadingState) => {
    setLoadingStates((prev) => ({ ...prev, [key]: state }));
  };

  return { loadingStates, setLoading };
};
```

#### 4.2.2 에러 처리 패턴

```typescript
// 패턴: structured error handling
interface AppError {
  code: string;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryAction?: () => void;
}

const useErrorHandler = () => {
  const showNotification = useNotifications();

  const handleError = (error: Error | AppError) => {
    if ('code' in error) {
      // 구조화된 에러
      showNotification.showError(error.userMessage);
      if (error.recoverable && error.retryAction) {
        // 재시도 옵션 제공
      }
    } else {
      // 일반 에러
      showNotification.showError('알 수 없는 오류가 발생했습니다.');
    }
  };

  return { handleError };
};
```

## 5. 구현 우선순위

### 5.1 Phase 1: 기본 인터랙션 (Week 1-2)

1. **기본 상태관리 설정**
   - Zustand 스토어 설정
   - TanStack Query 설정
   - 기본 훅들 구현

2. **글 관리 기본 플로우**
   - 글 생성 폼
   - 글 수정 폼
   - 글 삭제 확인

3. **사용자 피드백 시스템**
   - 로딩 스피너
   - 성공/에러 토스트
   - 기본 에러 바운더리

### 5.2 Phase 2: 고급 인터랙션 (Week 3)

1. **프로필 관리**
   - 프로필 편집 폼
   - 이미지 업로드
   - 설정 관리

2. **고급 피드백**
   - 진행률 표시
   - 실시간 유효성 검사
   - 자동 저장

### 5.3 Phase 3: 최적화 및 통합 (Week 4)

1. **성능 최적화**
   - 메모이제이션
   - 지연 로딩
   - 백그라운드 업데이트

2. **접근성 개선**
   - 키보드 네비게이션
   - 스크린 리더 지원
   - 포커스 관리

3. **통합 테스트**
   - E2E 테스트
   - 사용자 플로우 테스트
   - 성능 테스트

## 6. 기술적 고려사항

### 6.1 성능 최적화

1. **상태 업데이트 최적화**
   - React.memo() 활용
   - useMemo(), useCallback() 적절한 사용
   - 상태 분리로 불필요한 리렌더링 방지

2. **데이터 페칭 최적화**
   - TanStack Query 캐싱 전략
   - 백그라운드 업데이트
   - 낙관적 업데이트

### 6.2 에러 복구 전략

1. **에러 바운더리**
   - 컴포넌트별 에러 바운더리
   - 전역 에러 핸들러
   - 에러 리포팅

2. **재시도 메커니즘**
   - 자동 재시도
   - 수동 재시도 옵션
   - 백오프 전략

### 6.3 접근성 고려사항

1. **키보드 네비게이션**
   - Tab 순서 관리
   - 단축키 지원
   - 포커스 트랩

2. **스크린 리더 지원**
   - ARIA 라이브 영역
   - 상태 변경 알림
   - 의미있는 라벨

## 7. 검증 기준

### 7.1 기능적 검증

- [ ] 모든 CRUD 작업 정상 동작
- [ ] 폼 유효성 검사 적절한 동작
- [ ] 에러 상황 적절한 처리
- [ ] 로딩 상태 명확한 표시

### 7.2 사용자 경험 검증

- [ ] 3초 이내 응답 시간
- [ ] 직관적인 인터랙션
- [ ] 일관된 피드백 패턴
- [ ] 접근성 기준 준수

### 7.3 기술적 검증

- [ ] TypeScript 타입 안전성
- [ ] 메모리 누수 없음
- [ ] 적절한 에러 처리
- [ ] 테스트 커버리지 80% 이상

이 계획서를 바탕으로 체계적이고 사용자 중심적인 인터랙션 및 상태관리 시스템을 구축하겠습니다.

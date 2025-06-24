# 인증 및 프로필 API 문서

## 개요

Dom vlog 플랫폼의 인증 및 프로필 관리 API입니다. Supabase Auth를 기반으로 한 안전한 인증 시스템을 제공합니다.

## 기본 정보

- **Base URL**: `/api/auth`
- **인증 방식**: Supabase Session (Cookie 기반)
- **Content-Type**: `application/json`

## API 엔드포인트

### 1. 로그인

사용자 로그인을 처리합니다.

**POST** `/api/auth/login`

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "profile": {
      "id": "profile-123",
      "username": "testuser",
      "displayName": "Test User",
      "avatar": "https://example.com/avatar.jpg"
    }
  },
  "message": "로그인이 완료되었습니다."
}
```

#### 오류 응답

- **400 Bad Request**: 입력값 검증 실패
- **401 Unauthorized**: 인증 실패

---

### 2. 로그아웃

사용자 로그아웃을 처리합니다.

**POST** `/api/auth/logout`

#### Request Body

없음

#### Response

```json
{
  "success": true,
  "message": "로그아웃이 완료되었습니다."
}
```

---

### 3. 세션 확인

현재 사용자의 인증 상태를 확인합니다.

**GET** `/api/auth/session`

#### Response

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "profile": {
      "id": "profile-123",
      "username": "testuser",
      "displayName": "Test User",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

#### 인증되지 않은 경우

```json
{
  "success": true,
  "data": null,
  "message": "인증되지 않은 사용자입니다."
}
```

---

### 4. 프로필 조회

현재 사용자의 프로필 정보를 조회합니다.

**GET** `/api/auth/profile`

#### Query Parameters

- `stats` (optional): `true`로 설정 시 통계 정보 포함

#### Response

```json
{
  "success": true,
  "data": {
    "id": "profile-123",
    "userId": "user-123",
    "email": "user@example.com",
    "username": "testuser",
    "displayName": "Test User",
    "bio": "개발자입니다.",
    "avatar": "https://example.com/avatar.jpg",
    "website": "https://example.com",
    "github": "https://github.com/testuser",
    "twitter": "https://twitter.com/testuser",
    "linkedin": "https://linkedin.com/in/testuser",
    "blogTitle": "Test Blog",
    "blogSubtitle": "개발 블로그",
    "blogDescription": "개발 관련 글을 작성합니다.",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 통계 포함 응답 (`?stats=true`)

```json
{
  "success": true,
  "data": {
    // ... 기본 프로필 정보
    "_count": {
      "posts": 10
    },
    "stats": {
      "totalViews": 1500,
      "publishedPosts": 8,
      "draftPosts": 2,
      "avgSeoScore": 85
    }
  }
}
```

---

### 5. 프로필 생성

새 프로필을 생성합니다. (Phase 1에서는 초기 설정용)

**POST** `/api/auth/profile`

#### Request Body

```json
{
  "email": "user@example.com",
  "username": "testuser",
  "displayName": "Test User",
  "bio": "개발자입니다.",
  "blogTitle": "Test Blog"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    // 생성된 프로필 전체 정보
  },
  "message": "프로필이 성공적으로 생성되었습니다."
}
```

#### 오류 응답

- **400 Bad Request**: 이미 프로필 존재, 사용자명 중복, 입력값 오류

---

### 6. 프로필 수정

기존 프로필 정보를 수정합니다.

**PATCH** `/api/auth/profile`

#### Request Body

```json
{
  "displayName": "Updated User",
  "bio": "업데이트된 자기소개",
  "website": "https://newsite.com",
  "blogTitle": "새로운 블로그 제목"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    // 수정된 프로필 전체 정보
  },
  "message": "프로필이 성공적으로 업데이트되었습니다."
}
```

---

### 7. 사용자명 중복 확인

사용자명 사용 가능 여부를 확인합니다.

**GET** `/api/auth/profile/check-username?username=testuser`

#### Query Parameters

- `username` (required): 확인할 사용자명

#### Response

```json
{
  "success": true,
  "data": {
    "available": true
  }
}
```

#### 사용자명이 이미 사용 중인 경우

```json
{
  "success": true,
  "data": {
    "available": false
  }
}
```

---

## 데이터 검증 규칙

### 로그인

- `email`: 유효한 이메일 형식
- `password`: 최소 6자 이상

### 프로필 생성

- `email`: 유효한 이메일 형식
- `username`: 3-20자, 영문/숫자/언더스코어/하이픈만 허용
- `displayName`: 2-50자
- `blogTitle`: 1-100자

### 프로필 수정

- `displayName`: 2-50자 (선택적)
- `bio`: 최대 500자 (선택적)
- `website`: 유효한 URL 형식 (선택적)
- `github`: GitHub 프로필 URL 형식 (선택적)
- `twitter`: Twitter/X 프로필 URL 형식 (선택적)
- `linkedin`: LinkedIn 프로필 URL 형식 (선택적)
- `blogTitle`: 1-100자 (선택적)
- `blogSubtitle`: 최대 200자 (선택적)
- `blogDescription`: 최대 500자 (선택적)

---

## 오류 처리

### 공통 오류 응답 형식

```json
{
  "success": false,
  "error": "오류 메시지",
  "details": [] // 입력값 검증 오류 시에만 포함
}
```

### HTTP 상태 코드

- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청 (입력값 검증 실패, 비즈니스 로직 오류)
- `401`: 인증 실패
- `500`: 서버 내부 오류

---

## 사용 예시

### 로그인 플로우

```javascript
// 1. 로그인
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

// 2. 세션 확인
const sessionResponse = await fetch('/api/auth/session');
const session = await sessionResponse.json();

if (session.success && session.data) {
  console.log('로그인됨:', session.data.email);
} else {
  console.log('로그인 필요');
}
```

### 프로필 관리

```javascript
// 프로필 조회
const profileResponse = await fetch('/api/auth/profile');
const profile = await profileResponse.json();

// 프로필 수정
const updateResponse = await fetch('/api/auth/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    displayName: '새로운 이름',
    bio: '업데이트된 자기소개',
  }),
});
```

### 사용자명 중복 확인

```javascript
const checkResponse = await fetch(
  '/api/auth/profile/check-username?username=newuser'
);
const result = await checkResponse.json();

if (result.data.available) {
  console.log('사용 가능한 사용자명');
} else {
  console.log('이미 사용 중인 사용자명');
}
```

---

## 보안 고려사항

1. **세션 관리**: Supabase Auth의 쿠키 기반 세션 사용
2. **입력값 검증**: 모든 API에서 Zod 스키마를 통한 엄격한 검증
3. **권한 확인**: 인증이 필요한 모든 엔드포인트에서 사용자 확인
4. **오류 정보**: 보안에 민감한 정보는 오류 메시지에 포함하지 않음
5. **Rate Limiting**: 향후 구현 예정

---

## 향후 개선사항

1. **OAuth 로그인**: GitHub, Google 등 소셜 로그인 지원
2. **2FA**: 이중 인증 기능 추가
3. **비밀번호 재설정**: 이메일 기반 비밀번호 재설정
4. **프로필 이미지**: 파일 업로드 및 이미지 처리
5. **활동 로그**: 사용자 활동 기록 및 조회

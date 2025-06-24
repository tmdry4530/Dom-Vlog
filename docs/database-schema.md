# Dom vlog Database Schema Documentation

## 개요

Dom vlog는 Phase 1에서 단일 사용자를 위한 AI 기능이 내장된 기술 블로그 플랫폼입니다. 이 문서는 데이터베이스 스키마 설계와 구현 내용을 상세히 설명합니다.

## 설계 원칙

- **단일 사용자 구조**: Phase 1에서는 하나의 프로필만 지원
- **AI 기능 중심**: 카테고리 추천과 SEO 최적화를 위한 구조
- **확장 가능성**: Phase 2 멀티 사용자 전환을 고려한 설계
- **성능 최적화**: 주요 쿼리에 대한 인덱스 설정

## 테이블 구조

### 1. profiles (프로필)

개인 블로그 운영자의 정보를 저장합니다.

```sql
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "email" TEXT NOT NULL UNIQUE,
    "username" TEXT NOT NULL UNIQUE,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "website" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "blogTitle" TEXT NOT NULL DEFAULT 'Dom vlog',
    "blogSubtitle" TEXT,
    "blogDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**주요 특징:**

- Phase 2 확장을 위한 `userId` 필드 포함
- 소셜 링크와 블로그 설정 지원
- 자동 타임스탬프 관리

### 2. categories (카테고리)

AI 추천 시스템을 위한 카테고리 정보를 저장합니다.

```sql
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**주요 특징:**

- SEO 친화적인 slug 필드
- UI 표시를 위한 색상 정보
- 중복 방지를 위한 UNIQUE 제약

### 3. posts (포스트)

블로그 글의 원본 콘텐츠와 AI 처리된 콘텐츠를 저장합니다.

```sql
CREATE TABLE "posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,           -- Markdown 원본
    "excerpt" TEXT,                    -- 요약
    "enhancedContent" TEXT,            -- AI 처리된 HTML
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "featuredImage" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL REFERENCES "profiles"("id")
);
```

**주요 특징:**

- 원본과 AI 처리된 콘텐츠 분리 저장
- 게시 상태 관리 (DRAFT, PUBLISHED, ARCHIVED)
- 조회수 추적 기능

### 4. post_categories (포스트-카테고리 관계)

다대다 관계와 AI 추천 신뢰도를 저장합니다.

```sql
CREATE TABLE "post_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL REFERENCES "posts"("id"),
    "categoryId" TEXT NOT NULL REFERENCES "categories"("id"),
    "confidence" DOUBLE PRECISION,     -- AI 추천 신뢰도 (0.0-1.0)
    "isAiSuggested" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**주요 특징:**

- AI 추천 신뢰도 점수 저장
- 수동/자동 분류 구분
- 중복 방지를 위한 복합 인덱스

### 5. seo_scores (SEO 점수 및 메타데이터)

AI 생성 SEO 정보와 분석 결과를 저장합니다.

```sql
CREATE TABLE "seo_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL UNIQUE REFERENCES "posts"("id"),
    "overallScore" INTEGER NOT NULL,
    "readabilityScore" INTEGER NOT NULL,
    "performanceScore" INTEGER NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "openGraphTitle" TEXT,
    "openGraphDescription" TEXT,
    "openGraphImage" TEXT,
    "wordCount" INTEGER,
    "readingTime" INTEGER,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "aiModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**주요 특징:**

- 포스트당 하나의 SEO 레코드 (1:1 관계)
- 다양한 SEO 점수 분리 저장
- AI 처리 상태 추적

## 인덱스 설계

### 성능 최적화 인덱스

```sql
-- 게시 상태와 발행일 기준 조회
CREATE INDEX "posts_status_publishedAt_idx" ON "posts"("status", "publishedAt");

-- 슬러그 기반 단일 포스트 조회
CREATE INDEX "posts_slug_idx" ON "posts"("slug");

-- 작성자 기준 포스트 조회
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");

-- SEO 점수 기준 조회
CREATE INDEX "seo_scores_overallScore_idx" ON "seo_scores"("overallScore");

-- AI 처리 상태 조회
CREATE INDEX "seo_scores_isProcessed_idx" ON "seo_scores"("isProcessed");
```

### 유니크 인덱스

```sql
-- 프로필 중복 방지
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- 카테고리 중복 방지
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- 포스트 슬러그 중복 방지
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- 포스트-카테고리 중복 관계 방지
CREATE UNIQUE INDEX "post_categories_postId_categoryId_key" ON "post_categories"("postId", "categoryId");

-- SEO 점수 중복 방지
CREATE UNIQUE INDEX "seo_scores_postId_key" ON "seo_scores"("postId");
```

## 트리거 및 함수

### 자동 타임스탬프 업데이트

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON "profiles"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON "categories"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON "posts"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_scores_updated_at
    BEFORE UPDATE ON "seo_scores"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 주요 쿼리 패턴

### 1. 게시된 포스트 목록 조회

```sql
SELECT p.*, pr.displayName as authorName,
       array_agg(c.name) as categories,
       s.overallScore as seoScore
FROM posts p
JOIN profiles pr ON p.authorId = pr.id
LEFT JOIN post_categories pc ON p.id = pc.postId
LEFT JOIN categories c ON pc.categoryId = c.id
LEFT JOIN seo_scores s ON p.id = s.postId
WHERE p.status = 'PUBLISHED'
GROUP BY p.id, pr.displayName, s.overallScore
ORDER BY p.publishedAt DESC;
```

### 2. 카테고리별 포스트 수 조회

```sql
SELECT c.name, c.slug, COUNT(pc.postId) as postCount
FROM categories c
LEFT JOIN post_categories pc ON c.id = pc.categoryId
LEFT JOIN posts p ON pc.postId = p.id AND p.status = 'PUBLISHED'
GROUP BY c.id, c.name, c.slug
ORDER BY postCount DESC;
```

### 3. AI 처리가 필요한 포스트 조회

```sql
SELECT p.*
FROM posts p
LEFT JOIN seo_scores s ON p.id = s.postId
WHERE s.id IS NULL OR s.isProcessed = false;
```

## 마이그레이션 전략

### Phase 1 → Phase 2 확장 계획

1. **users 테이블 추가**
   - 기존 profiles의 userId를 users 테이블과 연결
   - 인증 정보 분리

2. **blogs 테이블 추가**
   - 사용자별 개별 블로그 지원
   - posts 테이블에 blogId 외래키 추가

3. **권한 관리**
   - Role-based access control
   - Row-level security 적용

### 백업 및 복구

- **자동 백업**: Supabase 일일 스냅샷
- **WAL 아카이브**: 실시간 변경 이력
- **Point-in-time 복구** 지원

## 성능 모니터링

### 주요 메트릭

- 쿼리 응답 시간 (< 100ms 목표)
- 동시 연결 수
- 인덱스 사용률
- 느린 쿼리 분석

### 최적화 포인트

1. **연결 풀링**: Supabase pgbouncer 활용
2. **쿼리 캐싱**: Redis를 통한 결과 캐싱
3. **읽기 복제본**: Phase 2에서 읽기 전용 복제본 추가

## 보안 고려사항

### Row Level Security (RLS)

Phase 2에서 적용할 RLS 정책:

```sql
-- 사용자는 자신의 포스트만 수정 가능
CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid()::text = authorId);

-- 게시된 포스트는 모든 사용자가 조회 가능
CREATE POLICY "Published posts are viewable by everyone" ON posts
    FOR SELECT USING (status = 'PUBLISHED' OR auth.uid()::text = authorId);
```

### 데이터 검증

- 입력 데이터 검증: Prisma + Zod
- SQL Injection 방지: Parameterized queries
- XSS 방지: 콘텐츠 sanitization

## 결론

이 데이터베이스 스키마는 Phase 1의 단일 사용자 요구사항을 충족하면서, Phase 2의 멀티 사용자 확장을 고려한 설계입니다. AI 기능 지원과 성능 최적화를 위한 인덱스 설계가 핵심 특징입니다.

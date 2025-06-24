# 데이터베이스 마이그레이션 로그

## 개요

Dom vlog 프로젝트의 데이터베이스 마이그레이션 이력 및 변경 사항을 기록합니다.

## 마이그레이션 이력

### Migration 001: Initial Schema (2025-01-27)

**파일**: `supabase/migrations/001_initial_schema.sql`

#### 생성된 테이블

##### 1. profiles (프로필 테이블)

```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  website TEXT,
  github TEXT,
  twitter TEXT,
  linkedin TEXT,
  blog_title TEXT NOT NULL DEFAULT 'Dom vlog',
  blog_subtitle TEXT,
  blog_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**주요 특징:**

- Phase 1 단일 사용자 구조 (확장 고려)
- 소셜 미디어 링크 필드 포함
- 블로그 설정 필드 포함
- 자동 타임스탬프 관리

##### 2. categories (카테고리 테이블)

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**주요 특징:**

- SEO 친화적 슬러그 필드
- UI 표시용 색상 필드
- 유니크 제약조건 (name, slug)

##### 3. posts (포스트 테이블)

```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  enhanced_content TEXT,
  status post_status NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMPTZ,
  featured_image TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  author_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**주요 특징:**

- AI 처리된 콘텐츠 저장 (enhanced_content)
- 게시 상태 관리 (DRAFT, PUBLISHED, ARCHIVED)
- 조회수 추적
- CASCADE DELETE로 데이터 무결성 보장

##### 4. post_categories (포스트-카테고리 관계 테이블)

```sql
CREATE TABLE post_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  confidence DECIMAL(3,2),
  is_ai_suggested BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, category_id)
);
```

**주요 특징:**

- 다대다 관계 구현
- AI 추천 신뢰도 저장
- 중복 방지 복합 유니크 제약

##### 5. seo_scores (SEO 점수 테이블)

```sql
CREATE TABLE seo_scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT UNIQUE NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  readability_score INTEGER NOT NULL,
  performance_score INTEGER NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  open_graph_title TEXT,
  open_graph_description TEXT,
  open_graph_image TEXT,
  word_count INTEGER,
  reading_time INTEGER,
  is_processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  ai_model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**주요 특징:**

- AI 생성 SEO 메타데이터 저장
- 다중 점수 추적 (전체, 가독성, 성능)
- PostgreSQL 배열 타입 활용 (keywords)
- 처리 상태 및 시간 추적

#### 생성된 인덱스

##### 성능 최적화 인덱스

```sql
-- Posts 테이블 인덱스
CREATE INDEX idx_posts_status_published ON posts(status, published_at);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_author_id ON posts(author_id);

-- SEO Scores 테이블 인덱스
CREATE INDEX idx_seo_scores_overall_score ON seo_scores(overall_score);
CREATE INDEX idx_seo_scores_is_processed ON seo_scores(is_processed);
```

**인덱스 목적:**

- `idx_posts_status_published`: 게시된 포스트 조회 최적화
- `idx_posts_slug`: 슬러그 기반 조회 최적화
- `idx_posts_author_id`: 작성자별 포스트 조회 최적화
- `idx_seo_scores_overall_score`: SEO 점수 정렬 최적화
- `idx_seo_scores_is_processed`: AI 처리 상태 필터링 최적화

#### 생성된 함수 및 트리거

##### 자동 타임스탬프 업데이트

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 모든 테이블에 트리거 적용
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_seo_scores_updated_at BEFORE UPDATE ON seo_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 초기 데이터 삽입

##### 기본 카테고리 데이터

```sql
INSERT INTO categories (name, slug, description, color) VALUES
('Web Development', 'web-development', '웹 개발 관련 기술 포스트', '#3B82F6'),
('Blockchain', 'blockchain', '블록체인 및 암호화폐 기술', '#10B981'),
('Cryptography', 'cryptography', '암호학 및 보안 기술', '#8B5CF6'),
('AI/ML', 'ai-ml', '인공지능 및 머신러닝', '#F59E0B'),
('DevOps', 'devops', '개발 운영 및 인프라', '#EF4444'),
('Tutorial', 'tutorial', '기술 튜토리얼 및 가이드', '#6366F1'),
('Review', 'review', '기술 리뷰 및 분석', '#EC4899');
```

## 마이그레이션 적용 결과

### 검증된 사항

- ✅ 모든 테이블 정상 생성
- ✅ 외래키 제약조건 정상 동작
- ✅ 유니크 제약조건 정상 동작
- ✅ 인덱스 정상 생성
- ✅ 트리거 정상 동작
- ✅ 초기 데이터 정상 삽입

### 성능 검증

- ✅ 인덱스 기반 쿼리 최적화 확인
- ✅ 복합 인덱스 효율성 검증
- ✅ CASCADE DELETE 성능 확인

### 데이터 무결성 검증

- ✅ 참조 무결성 제약조건 동작
- ✅ 도메인 무결성 (NOT NULL, DEFAULT) 동작
- ✅ 엔터티 무결성 (PRIMARY KEY, UNIQUE) 동작

## 롤백 계획

### 마이그레이션 롤백 스크립트

```sql
-- 역순으로 삭제
DROP TABLE IF EXISTS seo_scores CASCADE;
DROP TABLE IF EXISTS post_categories CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS post_status;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

### 롤백 절차

1. 데이터 백업 확인
2. 외래키 의존성 순서대로 테이블 삭제
3. 타입 및 함수 삭제
4. 백업에서 이전 상태 복원

## 다음 마이그레이션 계획

### Phase 2 준비 사항

- **사용자 테이블 분리**: profiles → users + user_profiles
- **멀티 테넌트 지원**: blog_id 외래키 추가
- **권한 관리**: roles, permissions 테이블 추가
- **소셜 기능**: follows, likes, comments 테이블 추가

### 예상 마이그레이션

- **002_multiuser_support.sql**: 멀티사용자 구조 변경
- **003_social_features.sql**: 소셜 기능 추가
- **004_analytics_tables.sql**: 분석 데이터 테이블
- **005_performance_optimization.sql**: 성능 최적화

## 모니터링 및 유지보수

### 정기 점검 항목

- [ ] 인덱스 사용률 모니터링
- [ ] 쿼리 성능 분석
- [ ] 테이블 크기 증가율 확인
- [ ] 데이터 무결성 검증

### 알림 설정

- 테이블 크기 임계치 초과 시 알림
- 쿼리 실행 시간 임계치 초과 시 알림
- 데이터베이스 연결 오류 시 알림

## 변경 이력 관리

### 변경 승인 프로세스

1. 스키마 변경 제안
2. 영향도 분석
3. 테스트 환경 검증
4. 피어 리뷰
5. 프로덕션 적용

### 문서 업데이트

- 스키마 변경 시 자동 문서 생성
- ERD 다이어그램 자동 업데이트
- API 문서 자동 갱신

이 마이그레이션 로그는 Dom vlog 프로젝트의 데이터베이스 진화 과정을 추적하고, 향후 변경 사항의 기준점 역할을 합니다.

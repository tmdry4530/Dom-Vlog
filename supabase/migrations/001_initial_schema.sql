-- Dom vlog Phase 1 Initial Schema Migration
-- 단일 사용자 기술 블로그를 위한 데이터베이스 스키마

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- 개인 프로필 테이블 (단일 레코드)
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- 카테고리 테이블
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- 블로그 포스트 테이블
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "enhancedContent" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "featuredImage" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- 포스트-카테고리 다대다 관계 테이블
CREATE TABLE "post_categories" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "isAiSuggested" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_categories_pkey" PRIMARY KEY ("id")
);

-- SEO 점수 및 메타데이터 테이블
CREATE TABLE "seo_scores" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_scores_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

CREATE UNIQUE INDEX "post_categories_postId_categoryId_key" ON "post_categories"("postId", "categoryId");

CREATE UNIQUE INDEX "seo_scores_postId_key" ON "seo_scores"("postId");

-- Create performance indexes
CREATE INDEX "posts_status_publishedAt_idx" ON "posts"("status", "publishedAt");
CREATE INDEX "posts_slug_idx" ON "posts"("slug");
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");

CREATE INDEX "seo_scores_overallScore_idx" ON "seo_scores"("overallScore");
CREATE INDEX "seo_scores_isProcessed_idx" ON "seo_scores"("isProcessed");

-- Add foreign key constraints
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "seo_scores" ADD CONSTRAINT "seo_scores_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON "profiles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON "posts" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_scores_updated_at BEFORE UPDATE ON "seo_scores" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories for Phase 1
INSERT INTO "categories" ("id", "name", "slug", "description", "color") VALUES
    (gen_random_uuid()::text, 'Web Development', 'web-development', '웹 개발 관련 기술 포스트', '#3B82F6'),
    (gen_random_uuid()::text, 'Blockchain', 'blockchain', '블록체인 및 암호화폐 기술', '#10B981'),
    (gen_random_uuid()::text, 'Cryptography', 'cryptography', '암호학 및 보안 기술', '#8B5CF6'),
    (gen_random_uuid()::text, 'AI/ML', 'ai-ml', '인공지능 및 머신러닝', '#F59E0B'),
    (gen_random_uuid()::text, 'DevOps', 'devops', '개발 운영 및 인프라', '#EF4444'),
    (gen_random_uuid()::text, 'Tutorial', 'tutorial', '기술 튜토리얼 및 가이드', '#6366F1'),
    (gen_random_uuid()::text, 'Review', 'review', '기술 리뷰 및 분석', '#EC4899');

-- Comments
COMMENT ON TABLE "profiles" IS 'Phase 1: 단일 사용자 프로필 정보';
COMMENT ON TABLE "categories" IS 'AI 카테고리 추천을 위한 카테고리 정보';
COMMENT ON TABLE "posts" IS '블로그 포스트 원본 및 AI 처리된 콘텐츠';
COMMENT ON TABLE "post_categories" IS 'AI 추천 신뢰도가 포함된 포스트-카테고리 관계';
COMMENT ON TABLE "seo_scores" IS 'AI 생성 SEO 메타데이터 및 점수'; 
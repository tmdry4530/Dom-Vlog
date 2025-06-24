// Dom vlog - Database Schema Tests
// Phase 1: 데이터베이스 스키마 및 CRUD 작업 검증

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  ProfileService,
  CategoryService,
  PostService,
  SeoService,
  StatsService,
} from '@/lib/database/services';
import { prisma } from '@/lib/prisma';

describe('Database Schema Tests', () => {
  beforeAll(async () => {
    // 테스트용 DB 연결
    await prisma.$connect();
  });

  afterAll(async () => {
    // 테스트 종료 후 연결 해제
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 각 테스트 전에 DB 초기화
    await cleanupDatabase();
  });

  describe('Profile Service Tests', () => {
    it('should create a profile successfully', async () => {
      const profileData = {
        userId: 'test-user-001',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
      };

      const profile = await ProfileService.createProfile(profileData);

      expect(profile).toBeDefined();
      expect(profile.email).toBe(profileData.email);
      expect(profile.username).toBe(profileData.username);
      expect(profile.displayName).toBe(profileData.displayName);
      expect(profile.blogTitle).toBe('Dom vlog'); // Default value
    });

    it('should retrieve profile successfully', async () => {
      // 먼저 프로필 생성
      await ProfileService.createProfile({
        userId: 'test-user-002',
        email: 'test2@example.com',
        username: 'testuser2',
        displayName: 'Test User 2',
      });

      const profile = await ProfileService.getProfile();

      expect(profile).toBeDefined();
      expect(profile?.email).toBe('test2@example.com');
    });

    it('should update profile successfully', async () => {
      // 프로필 생성
      const profile = await ProfileService.createProfile({
        userId: 'test-user-003',
        email: 'test3@example.com',
        username: 'testuser3',
        displayName: 'Test User 3',
      });

      // 업데이트
      const updateData = {
        displayName: 'Updated Test User',
        bio: 'Updated bio description',
        blogTitle: 'Updated Blog Title',
      };

      const updatedProfile = await ProfileService.updateProfile(
        profile.id,
        updateData
      );

      expect(updatedProfile.displayName).toBe(updateData.displayName);
      expect(updatedProfile.bio).toBe(updateData.bio);
      expect(updatedProfile.blogTitle).toBe(updateData.blogTitle);
    });
  });

  describe('Category Service Tests', () => {
    it('should create categories successfully', async () => {
      const categoryData = {
        name: 'Web Development',
        slug: 'web-development',
        description: '웹 개발 관련 기술 포스트',
        color: '#3B82F6',
      };

      const category = await CategoryService.createCategory(categoryData);

      expect(category).toBeDefined();
      expect(category.name).toBe(categoryData.name);
      expect(category.slug).toBe(categoryData.slug);
      expect(category.description).toBe(categoryData.description);
      expect(category.color).toBe(categoryData.color);
    });

    it('should retrieve all categories', async () => {
      // 여러 카테고리 생성
      await CategoryService.createCategory({
        name: 'Blockchain',
        slug: 'blockchain',
        description: '블록체인 기술',
        color: '#10B981',
      });

      await CategoryService.createCategory({
        name: 'AI/ML',
        slug: 'ai-ml',
        description: '인공지능 및 머신러닝',
        color: '#F59E0B',
      });

      const categories = await CategoryService.getAllCategories();

      expect(categories).toHaveLength(2);
      expect(categories[0].name).toBe('AI/ML'); // 알파벳 순 정렬
      expect(categories[1].name).toBe('Blockchain');
    });

    it('should find category by slug', async () => {
      await CategoryService.createCategory({
        name: 'DevOps',
        slug: 'devops',
        description: '개발 운영',
        color: '#EF4444',
      });

      const category = await CategoryService.getCategoryBySlug('devops');

      expect(category).toBeDefined();
      expect(category?.name).toBe('DevOps');
    });
  });

  describe('Post Service Tests', () => {
    let profile: any;
    let category: any;

    beforeEach(async () => {
      // 테스트용 프로필과 카테고리 생성
      profile = await ProfileService.createProfile({
        userId: 'test-author',
        email: 'author@example.com',
        username: 'author',
        displayName: 'Test Author',
      });

      category = await CategoryService.createCategory({
        name: 'Tutorial',
        slug: 'tutorial',
        description: '튜토리얼',
        color: '#6366F1',
      });
    });

    it('should create post with categories', async () => {
      const postData = {
        title: 'Test Post',
        slug: 'test-post',
        content: '# Test Content\n\nThis is a test post.',
        excerpt: 'Test excerpt',
        status: 'DRAFT' as const,
        categoryIds: [category.id],
      };

      const post = await PostService.createPost(profile.id, postData);

      expect(post).toBeDefined();
      expect(post.title).toBe(postData.title);
      expect(post.slug).toBe(postData.slug);
      expect(post.content).toBe(postData.content);
      expect(post.status).toBe('DRAFT');
      expect(post.categories).toHaveLength(1);
      expect(post.categories[0].category.name).toBe('Tutorial');
    });

    it('should retrieve post by slug', async () => {
      // 포스트 생성
      await PostService.createPost(profile.id, {
        title: 'Slug Test Post',
        slug: 'slug-test-post',
        content: 'Content for slug test',
        status: 'PUBLISHED',
        categoryIds: [category.id],
      });

      const post = await PostService.getPostBySlug('slug-test-post');

      expect(post).toBeDefined();
      expect(post?.title).toBe('Slug Test Post');
      expect(post?.author.displayName).toBe('Test Author');
    });

    it('should update post successfully', async () => {
      // 포스트 생성
      const post = await PostService.createPost(profile.id, {
        title: 'Original Title',
        slug: 'original-slug',
        content: 'Original content',
        status: 'DRAFT',
        categoryIds: [category.id],
      });

      // 업데이트
      const updateData = {
        id: post.id,
        title: 'Updated Title',
        content: 'Updated content',
        status: 'PUBLISHED' as const,
      };

      const updatedPost = await PostService.updatePost(post.id, updateData);

      expect(updatedPost.title).toBe('Updated Title');
      expect(updatedPost.content).toBe('Updated content');
      expect(updatedPost.status).toBe('PUBLISHED');
    });

    it('should publish post with publishedAt timestamp', async () => {
      // 드래프트 포스트 생성
      const post = await PostService.createPost(profile.id, {
        title: 'Draft Post',
        slug: 'draft-post',
        content: 'Draft content',
        status: 'DRAFT',
        categoryIds: [category.id],
      });

      expect(post.publishedAt).toBeNull();

      // 발행
      const publishedPost = await PostService.publishPost(post.id);

      expect(publishedPost.status).toBe('PUBLISHED');
      expect(publishedPost.publishedAt).toBeDefined();
      expect(publishedPost.publishedAt).toBeInstanceOf(Date);
    });

    it('should increment view count', async () => {
      // 포스트 생성
      const post = await PostService.createPost(profile.id, {
        title: 'View Count Test',
        slug: 'view-count-test',
        content: 'View count test content',
        status: 'PUBLISHED',
        categoryIds: [category.id],
      });

      expect(post.viewCount).toBe(0);

      // 조회수 증가
      await PostService.incrementViewCount(post.id);
      await PostService.incrementViewCount(post.id);

      const updatedPost = await PostService.getPostById(post.id);
      expect(updatedPost?.viewCount).toBe(2);
    });
  });

  describe('SEO Service Tests', () => {
    let profile: any;
    let category: any;
    let post: any;

    beforeEach(async () => {
      profile = await ProfileService.createProfile({
        userId: 'seo-test-author',
        email: 'seo@example.com',
        username: 'seoauthor',
        displayName: 'SEO Test Author',
      });

      category = await CategoryService.createCategory({
        name: 'SEO',
        slug: 'seo',
        description: 'SEO 관련',
        color: '#EC4899',
      });

      post = await PostService.createPost(profile.id, {
        title: 'SEO Test Post',
        slug: 'seo-test-post',
        content: 'SEO test content',
        status: 'PUBLISHED',
        categoryIds: [category.id],
      });
    });

    it('should create SEO score successfully', async () => {
      const seoData = {
        overallScore: 85,
        readabilityScore: 88,
        performanceScore: 82,
        metaTitle: 'SEO Test Post - Dom vlog',
        metaDescription: 'This is a test post for SEO scoring',
        keywords: ['SEO', 'test', 'blog'],
        wordCount: 50,
        readingTime: 1,
        aiModel: 'gemini-2.5-flash-lite',
      };

      const seoScore = await SeoService.upsertSeoScore(post.id, seoData);

      expect(seoScore).toBeDefined();
      expect(seoScore.overallScore).toBe(85);
      expect(seoScore.readabilityScore).toBe(88);
      expect(seoScore.performanceScore).toBe(82);
      expect(seoScore.metaTitle).toBe(seoData.metaTitle);
      expect(seoScore.isProcessed).toBe(true);
      expect(seoScore.processedAt).toBeDefined();
    });

    it('should retrieve SEO score by post ID', async () => {
      // SEO 점수 생성
      await SeoService.upsertSeoScore(post.id, {
        overallScore: 90,
        readabilityScore: 92,
        performanceScore: 88,
        wordCount: 100,
        readingTime: 2,
      });

      const seoScore = await SeoService.getSeoScoreByPostId(post.id);

      expect(seoScore).toBeDefined();
      expect(seoScore?.overallScore).toBe(90);
      expect(seoScore?.readabilityScore).toBe(92);
    });
  });

  describe('Stats Service Tests', () => {
    it('should calculate blog statistics correctly', async () => {
      // 테스트 데이터 생성
      const profile = await ProfileService.createProfile({
        userId: 'stats-test-author',
        email: 'stats@example.com',
        username: 'statsauthor',
        displayName: 'Stats Test Author',
      });

      const category = await CategoryService.createCategory({
        name: 'Stats Test',
        slug: 'stats-test',
        description: '통계 테스트',
        color: '#8B5CF6',
      });

      // 여러 포스트 생성
      const publishedPost = await PostService.createPost(profile.id, {
        title: 'Published Post',
        slug: 'published-post',
        content: 'Published content',
        status: 'PUBLISHED',
        categoryIds: [category.id],
      });

      await PostService.createPost(profile.id, {
        title: 'Draft Post',
        slug: 'draft-post',
        content: 'Draft content',
        status: 'DRAFT',
        categoryIds: [category.id],
      });

      // 조회수 증가
      await PostService.incrementViewCount(publishedPost.id);
      await PostService.incrementViewCount(publishedPost.id);

      // SEO 점수 생성
      await SeoService.upsertSeoScore(publishedPost.id, {
        overallScore: 85,
        readabilityScore: 88,
        performanceScore: 82,
      });

      const stats = await StatsService.getBlogStats();

      expect(stats.totalPosts).toBe(2);
      expect(stats.publishedPosts).toBe(1);
      expect(stats.draftPosts).toBe(1);
      expect(stats.totalViews).toBe(2);
      expect(stats.totalCategories).toBe(1);
      expect(stats.avgSeoScore).toBe(85);
    });
  });

  // 헬퍼 함수
  async function cleanupDatabase() {
    try {
      // 관계 테이블부터 삭제 (외래키 제약 때문)
      await prisma.seoScore.deleteMany();
      await prisma.postCategory.deleteMany();
      await prisma.post.deleteMany();
      await prisma.category.deleteMany();
      await prisma.profile.deleteMany();
    } catch (error) {
      console.warn('Database cleanup warning:', error);
    }
  }
});

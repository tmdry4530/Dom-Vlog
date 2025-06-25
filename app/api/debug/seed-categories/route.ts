import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

const defaultCategories = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: '웹 개발 관련 기술 포스트',
    color: '#3B82F6',
  },
  {
    name: 'Blockchain',
    slug: 'blockchain',
    description: '블록체인 및 암호화폐 기술',
    color: '#10B981',
  },
  {
    name: 'Cryptography',
    slug: 'cryptography',
    description: '암호학 및 보안 기술',
    color: '#8B5CF6',
  },
  {
    name: 'AI/ML',
    slug: 'ai-ml',
    description: '인공지능 및 머신러닝',
    color: '#F59E0B',
  },
  {
    name: 'DevOps',
    slug: 'devops',
    description: '개발 운영 및 인프라',
    color: '#EF4444',
  },
  {
    name: 'Tutorial',
    slug: 'tutorial',
    description: '기술 튜토리얼 및 가이드',
    color: '#6366F1',
  },
  {
    name: 'Review',
    slug: 'review',
    description: '기술 리뷰 및 분석',
    color: '#EC4899',
  },
];

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. 기존 카테고리 확인
    const { data: existingCategories, error: checkError } = await supabase
      .from('categories')
      .select('slug');

    if (checkError) {
      throw new Error(
        `Failed to check existing categories: ${checkError.message}`
      );
    }

    const existingSlugs = new Set(
      existingCategories?.map((cat) => cat.slug) || []
    );

    // 2. 새 카테고리만 필터링
    const newCategories = defaultCategories.filter(
      (cat) => !existingSlugs.has(cat.slug)
    );

    if (newCategories.length === 0) {
      return NextResponse.json({
        success: true,
        message: '모든 기본 카테고리가 이미 존재합니다',
        skipped: defaultCategories.length,
        inserted: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. 새 카테고리 삽입
    const { error: insertError } = await supabase
      .from('categories')
      .insert(newCategories)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert categories: ${insertError.message}`);
    }

    // 4. 최종 카테고리 목록 조회
    const { data: allCategories } = await supabase
      .from('categories')
      .select('name, slug, description, color')
      .order('name');

    return NextResponse.json({
      success: true,
      message: `기본 카테고리 시드 완료`,
      inserted: newCategories.length,
      skipped: defaultCategories.length - newCategories.length,
      totalCategories: allCategories?.length || 0,
      categories: allCategories || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Category seeding failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Category seeding failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

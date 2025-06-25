import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. 기본 연결 테스트
    const { error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      throw new Error(`Connection failed: ${connectionError.message}`);
    }

    // 2. 각 테이블 존재 여부 및 레코드 수 확인
    const tableChecks = [
      'profiles',
      'categories',
      'posts',
      'post_categories',
      'seo_scores',
    ];

    const tableStatus: Record<
      string,
      {
        exists: boolean;
        count: number;
        error: string | null;
      }
    > = {};

    for (const tableName of tableChecks) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          tableStatus[tableName] = {
            exists: false,
            error: error.message,
            count: 0,
          };
        } else {
          tableStatus[tableName] = {
            exists: true,
            count: count || 0,
            error: null,
          };
        }
      } catch (err) {
        tableStatus[tableName] = {
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          count: 0,
        };
      }
    }

    // 3. 샘플 카테고리 데이터 확인
    const { data: sampleCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('name, slug')
      .limit(5);

    return NextResponse.json({
      success: true,
      message: '데이터베이스 스키마 점검 완료',
      timestamp: new Date().toISOString(),
      connection: {
        status: 'connected',
        url:
          process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/g, '') ||
          'not configured',
      },
      tables: tableStatus,
      sampleData: {
        categories: sampleCategories || [],
        categoriesError: categoriesError?.message || null,
      },
    });
  } catch (error) {
    console.error('Database schema check failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Database schema check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

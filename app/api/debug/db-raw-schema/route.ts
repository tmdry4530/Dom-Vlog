import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. 현재 데이터베이스에서 실제 테이블 목록 조회
    const { data: tablesData, error: tablesError } =
      await supabase.rpc('get_table_list');

    // RPC 함수가 없을 수 있으므로 대안으로 pg_tables에서 조회
    const { data: pgTables, error: pgTablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'spatial_ref_sys'); // PostGIS 테이블 제외

    if (pgTablesError) {
      // information_schema에 접근할 수 없으면 직접 시도
      console.log(
        'Cannot access information_schema, trying direct table access'
      );
    }

    // 2. 알려진 테이블들에 대해 직접 접근 시도
    const expectedTables = [
      'profiles',
      'categories',
      'posts',
      'post_categories',
      'seo_scores',
    ];
    const tableAccessResults: Record<string, any> = {};

    for (const tableName of expectedTables) {
      try {
        const { error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        tableAccessResults[tableName] = {
          accessible: !error,
          error: error?.message || null,
          count: count || 0,
          details: error?.details || null,
        };
      } catch (err) {
        tableAccessResults[tableName] = {
          accessible: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          count: 0,
          details: null,
        };
      }
    }

    // 3. 버킷 정보 조회 (Storage)
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    return NextResponse.json({
      success: true,
      message: '데이터베이스 원시 스키마 점검 완료',
      timestamp: new Date().toISOString(),
      connection: {
        status: 'connected',
        url:
          process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/g, '') ||
          'not configured',
      },
      schema: {
        pgTables: pgTables || [],
        pgTablesError: pgTablesError?.message || null,
        rpcTables: tablesData || null,
        rpcError: tablesError?.message || null,
      },
      tableAccess: tableAccessResults,
      storage: {
        buckets: buckets || [],
        error: bucketsError?.message || null,
      },
    });
  } catch (error) {
    console.error('Raw database schema check failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Raw database schema check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

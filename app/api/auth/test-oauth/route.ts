import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/client';

export async function GET() {
  try {
    // Google OAuth 테스트
    const testGoogleAuth = async () => {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        return {
          provider: 'google',
          success: !error,
          error: error?.message || null,
          hasUrl: !!data.url,
        };
      } catch (err) {
        return {
          provider: 'google',
          success: false,
          error: err instanceof Error ? err.message : String(err),
          hasUrl: false,
        };
      }
    };

    // GitHub OAuth 테스트
    const testGitHubAuth = async () => {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
          },
        });

        return {
          provider: 'github',
          success: !error,
          error: error?.message || null,
          hasUrl: !!data.url,
        };
      } catch (err) {
        return {
          provider: 'github',
          success: false,
          error: err instanceof Error ? err.message : String(err),
          hasUrl: false,
        };
      }
    };

    const [googleResult, githubResult] = await Promise.all([
      testGoogleAuth(),
      testGitHubAuth(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
      providers: {
        google: googleResult,
        github: githubResult,
      },
      summary: {
        googleEnabled: googleResult.success,
        githubEnabled: githubResult.success,
        anyEnabled: googleResult.success || githubResult.success,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'OAuth 테스트 중 오류 발생',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

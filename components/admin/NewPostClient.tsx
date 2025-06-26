'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { PostEditor } from '@/components/editor/PostEditor';
import { useAuthPermissions } from '@/hooks/useAuthPermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function NewPostClient() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { canWrite, isLoading: permissionsLoading } = useAuthPermissions();
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const goBack = () => {
    router.back();
  };

  // hydration이 완료되기 전까지는 로딩 상태로 렌더링
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <Header toggleMobileSidebar={() => {}} />
        <div className="flex">
          <Sidebar isMobileSidebarOpen={false} toggleMobileSidebar={() => {}} />
          <main className="flex-1 lg:ml-80 pt-14">
            <div className="max-w-5xl mx-auto p-6">
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 권한이 없는 경우
  if (!permissionsLoading && !canWrite) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <Header toggleMobileSidebar={toggleMobileSidebar} />
        <div className="flex">
          <Sidebar
            isMobileSidebarOpen={isMobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          />
          <main className="flex-1 lg:ml-80 pt-14">
            <div className="max-w-5xl mx-auto p-6">
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="p-6 text-center">
                  <div className="text-red-600 dark:text-red-400 mb-4">
                    <h2 className="text-xl font-semibold mb-2">
                      접근 권한 없음
                    </h2>
                    <p>이 페이지에 접근할 권한이 없습니다.</p>
                  </div>
                  <Button onClick={() => router.push('/')} variant="outline">
                    홈으로 돌아가기
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Header toggleMobileSidebar={toggleMobileSidebar} />
      <div className="flex">
        <Sidebar
          isMobileSidebarOpen={isMobileSidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <main className="flex-1 lg:ml-80 pt-14">
          <div className="max-w-5xl mx-auto p-6">
            {/* 헤더 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Button
                  onClick={goBack}
                  variant="ghost"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  뒤로가기
                </Button>
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-2">새 글 작성</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  새로운 블로그 포스트를 작성하고 공유해보세요.
                </p>
              </div>
            </div>

            {/* 에디터 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <PostEditor />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

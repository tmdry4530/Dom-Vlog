import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dom vlog
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
          AI가 자동으로 최적화하는 개인 기술 블로그 플랫폼
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          글 가독성 향상, SEO 최적화, 카테고리 추천까지 AI가 자동으로 처리해주는
          차세대 블로그 플랫폼입니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="w-full sm:w-auto">
            블로그 시작하기
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            더 알아보기
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              ✨
            </div>
            <h3 className="text-lg font-semibold mb-2">AI 자동 스타일링</h3>
            <p className="text-gray-600 dark:text-gray-400">
              코드 블록, 제목 구조, 표를 AI가 자동으로 정리해 가독성을 80점
              이상으로 향상
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              🚀
            </div>
            <h3 className="text-lg font-semibold mb-2">SEO 최적화</h3>
            <p className="text-gray-600 dark:text-gray-400">
              키워드 추출, 메타태그, OG 태그를 AI가 자동 생성하여 검색 노출
              극대화
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              🎯
            </div>
            <h3 className="text-lg font-semibold mb-2">스마트 카테고리</h3>
            <p className="text-gray-600 dark:text-gray-400">
              주제 모델링으로 최적의 카테고리를 추천하여 체계적인 블로그 관리
            </p>
          </div>
        </div>
      </main>
      <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; 2024 Dom vlog. AI로 더 나은 블로그 경험을 만들어갑니다.</p>
      </footer>
    </div>
  );
}

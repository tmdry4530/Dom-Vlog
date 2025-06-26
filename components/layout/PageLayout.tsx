'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | 'full';
  showHeader?: boolean;
  showSidebar?: boolean;
}

export function PageLayout({
  children,
  title,
  description,
  className = '',
  maxWidth = '6xl',
  showHeader = true,
  showSidebar = true,
}: PageLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const getMaxWidthClass = (size: typeof maxWidth) => {
    const widthMap = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      full: 'max-w-full',
    };
    return widthMap[size];
  };

  // hydration이 완료되기 전까지는 서버와 동일한 상태로 렌더링
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        {showHeader && <Header toggleMobileSidebar={() => {}} />}
        <div className="flex">
          {showSidebar && (
            <Sidebar
              isMobileSidebarOpen={false}
              toggleMobileSidebar={() => {}}
            />
          )}
          <main
            className={`flex-1 ${showSidebar ? 'lg:ml-80' : ''} ${showHeader ? 'pt-14' : ''}`}
          >
            <div className="p-6">
              {(title || description) && (
                <div className="mb-8">
                  {title && (
                    <h1 className="text-3xl font-bold mb-2">{title}</h1>
                  )}
                  {description && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
              )}
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      {showHeader && <Header toggleMobileSidebar={toggleMobileSidebar} />}
      <div className="flex">
        {showSidebar && (
          <Sidebar
            isMobileSidebarOpen={isMobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          />
        )}
        <main
          className={`flex-1 ${showSidebar ? 'lg:ml-80' : ''} ${showHeader ? 'pt-14' : ''}`}
        >
          <div
            className={`p-6 ${getMaxWidthClass(maxWidth)} mx-auto ${className}`}
          >
            {(title || description) && (
              <div className="mb-8">
                {title && <h1 className="text-3xl font-bold mb-2">{title}</h1>}
                {description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

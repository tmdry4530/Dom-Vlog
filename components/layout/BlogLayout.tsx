import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface BlogLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showSidebar?: boolean;
  sidebar?: ReactNode;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function BlogLayout({
  children,
  className,
  maxWidth = 'xl',
  showSidebar = false,
  sidebar,
}: BlogLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div
          className={cn(
            'container mx-auto px-4 sm:px-6 lg:px-8',
            maxWidthClasses[maxWidth]
          )}
        >
          {showSidebar ? (
            <div className="grid gap-6 lg:grid-cols-4 xl:gap-8">
              {/* Main content */}
              <div className="lg:col-span-3">
                <div className={cn('py-6 lg:py-8', className)}>{children}</div>
              </div>

              {/* Sidebar */}
              {sidebar && (
                <div className="lg:col-span-1">
                  <div className="sticky top-20 py-6 lg:py-8">{sidebar}</div>
                </div>
              )}
            </div>
          ) : (
            <div className={cn('py-6 lg:py-8', className)}>{children}</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Grid system components for flexible layouts
interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function Container({
  children,
  className,
  size = 'xl',
}: ContainerProps) {
  return (
    <div
      className={cn(
        'container mx-auto px-4 sm:px-6 lg:px-8',
        maxWidthClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}

interface GridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
}

const gridColsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  12: 'grid-cols-12',
};

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

export function Grid({ children, className, cols = 1, gap = 'md' }: GridProps) {
  return (
    <div
      className={cn('grid', gridColsClasses[cols], gapClasses[gap], className)}
    >
      {children}
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  id?: string;
}

export function Section({
  children,
  className,
  title,
  subtitle,
  id,
}: SectionProps) {
  return (
    <section className={cn('space-y-6', className)} id={id}>
      {(title || subtitle) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground md:text-lg">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

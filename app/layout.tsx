import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/theme-context';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { getCurrentUser } from '@/lib/auth/auth-service';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dom Vlog',
  description: 'AI 기능이 내장된 개인 기술 블로그 플랫폼',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentUser();
  const serverSession = session.success
    ? {
        user: session.data,
        session: session.data, // Simplified for this context
        isAuthenticated: !!session.data,
        isLoading: false,
        isInitialized: true,
      }
    : null;

  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider serverSession={serverSession as any}>
            <AuthInitializer>{children}</AuthInitializer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

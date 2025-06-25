import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Dom Vlog - AI 기반 개인 기술 블로그',
    template: '%s | Dom Vlog',
  },
  description:
    'AI 기능이 내장된 개인 기술 블로그 플랫폼. 자동 스타일링, SEO 최적화, 카테고리 추천 기능을 제공합니다.',
  keywords: [
    '기술블로그',
    'AI',
    'SEO',
    '개발자',
    '프로그래밍',
    'Next.js',
    'Supabase',
  ],
  authors: [{ name: 'Dom' }],
  creator: 'Dom',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://domvlog.com',
    siteName: 'Dom Vlog',
    title: 'Dom Vlog - AI 기반 개인 기술 블로그',
    description: 'AI 기능이 내장된 개인 기술 블로그 플랫폼',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dom Vlog - AI 기반 개인 기술 블로그',
    description: 'AI 기능이 내장된 개인 기술 블로그 플랫폼',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" expand={false} richColors closeButton />
      </body>
    </html>
  );
}

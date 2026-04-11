/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 app / 루트 레이아웃
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeApplier } from '@/components/ui/ThemeApplier';
import { PwaInit } from '@/components/ui/PwaInit';
import { WelcomeTutorial } from '@/components/tutorial/WelcomeTutorial';

/* ════════════════════════════════
   1. FONTS
   ════════════════════════════════ */

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/* ════════════════════════════════
   2. METADATA
   ════════════════════════════════ */

export const metadata: Metadata = {
  title: '하루책 — AI 파트너와 함께 쓰는 투두',
  description:
    '당신과 AI 파트너가 공동 주인공인 소설이 매주 연재되는 투두 앱. 할 일을 해낼수록 하루나무가 자라고, 당신만의 이야기가 매주 한 편씩 써집니다.',
  applicationName: '하루책',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: '하루책',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: '하루책 — AI 파트너와 함께 쓰는 투두',
    description: '할 일이 매주 한 편의 소설로 연재돼요',
    locale: 'ko_KR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // iOS 노치 대응
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdf2f8' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f1218' },
  ],
};

/* ════════════════════════════════
   3. LAYOUT
   ════════════════════════════════ */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeApplier />
        <PwaInit />
        {children}
        <WelcomeTutorial />
      </body>
    </html>
  );
}

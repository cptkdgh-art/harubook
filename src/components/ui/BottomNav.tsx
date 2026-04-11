/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/ui / BottomNav
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 6탭 하단 네비. 홈/이야기/기록/소개/가이드/설정.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, BarChart3, Info, Compass, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/home',     label: '홈',     icon: Home },
  { href: '/story',    label: '이야기', icon: BookOpen },
  { href: '/history',  label: '기록',   icon: BarChart3 },
  { href: '/about',    label: '소개',   icon: Info },
  { href: '/guide',    label: '가이드', icon: Compass },
  { href: '/settings', label: '설정',   icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-background/90 backdrop-blur-lg border-t border-border/40">
      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto grid grid-cols-6">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(tab.href + '/');
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 md:py-2.5 lg:py-3 text-[10px] md:text-[11px] lg:text-xs transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'w-[18px] h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]',
                  active && 'stroke-[2.5]'
                )}
              />
              <span className={cn('font-medium', active && 'font-semibold')}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

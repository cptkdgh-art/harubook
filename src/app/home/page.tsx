/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 app/home / 메인 페이지
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 앱의 메인 화면. Todo 리스트 + 날짜 네비게이션.
 * 하단에 AI 채팅 플로팅 버튼 (P4에서 구현).
 */

'use client';

/* ════════════════════════════════
   1. IMPORTS
   ════════════════════════════════ */

import { useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HelpCircle } from 'lucide-react';
import { useTodoStore } from '@/lib/stores/useTodoStore';
import { ChatSheet } from '@/components/chat/ChatSheet';
import { usePartnerStore } from '@/lib/stores/usePartnerStore';
import { useTutorialStore } from '@/lib/stores/useTutorialStore';
import { TodoList } from '@/components/todo/TodoList';
import { CalendarView } from '@/components/todo/CalendarView';
import { BottomNav } from '@/components/ui/BottomNav';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AnimationToggle } from '@/components/ui/AnimationToggle';
import { FontSizeToggle } from '@/components/ui/FontSizeToggle';
import { HaruTree } from '@/components/tree/HaruTree';
import { today } from '@/lib/db/dexie';

/* ════════════════════════════════
   2. COMPONENT
   ════════════════════════════════ */

export default function HomePage() {
  const { selectedDate, setSelectedDate } = useTodoStore();
  const { partner, loadPartner } = usePartnerStore();
  const openTutorial = useTutorialStore((s) => s.open);

  useEffect(() => {
    loadPartner();
  }, [loadPartner]);

  const isToday = selectedDate === today();
  const dateObj = new Date(selectedDate + 'T00:00:00');
  const formattedDate = format(dateObj, 'M월 d일 (EEE)', { locale: ko });

  return (
    <div className="min-h-screen bg-background">

      {/* ════════════════════════════════
          상단 헤더
          ════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/30">
        <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 pt-3 pb-1">

          {/* 파트너 인사 + 애니/테마 토글 */}
          {partner && (
            <div className="flex items-center justify-between mb-2 gap-2">
              <p className="text-xs text-muted-foreground truncate">
                <span className="text-primary font-medium">{partner.name}</span>
                {isToday ? '과 함께하는 오늘' : '의 기록'}
              </p>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={openTutorial}
                  aria-label="튜토리얼 다시 보기"
                  title="튜토리얼 다시 보기"
                  className="flex items-center justify-center w-7 h-7 rounded-full border border-border/60 bg-transparent text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
                <FontSizeToggle />
                <AnimationToggle />
                <ThemeToggle />
              </div>
            </div>
          )}

          {/* 날짜 스트립 캘린더 */}
          <CalendarView />

          {/* 선택된 날짜 텍스트 */}
          <div className="flex items-center gap-2 py-1.5">
            <button
              onClick={() => setSelectedDate(today())}
              className="flex items-center gap-2"
            >
              <h1 className="text-base font-bold">{formattedDate}</h1>
              {!isToday && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  오늘로
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* ════════════════════════════════
          메인 콘텐츠
          ════════════════════════════════ */}
      <main className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-4 pb-24 space-y-4">
        <HaruTree />
        <TodoList />
      </main>

      {/* ════════════════════════════════
          AI 채팅 시트
          ════════════════════════════════ */}
      <ChatSheet />

      {/* ════════════════════════════════
          하단 네비게이션
          ════════════════════════════════ */}
      <BottomNav />

    </div>
  );
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 app/history / 월별 기록 페이지
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 월 단위 활동 회고: 요약 카드 + 히트맵 + 카테고리별 활동 + 해당 월 소설.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, BarChart3, BookOpen } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { useTodoStore } from '@/lib/stores/useTodoStore';
import { usePartnerStore } from '@/lib/stores/usePartnerStore';
import { useEssayStore } from '@/lib/stores/useEssayStore';
import { MonthlySummary } from '@/components/history/MonthlySummary';
import { MonthHeatmap } from '@/components/history/MonthHeatmap';
import { CategoryBreakdown } from '@/components/history/CategoryBreakdown';
import { BottomNav } from '@/components/ui/BottomNav';

export default function HistoryPage() {
  const router = useRouter();
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));
  const { setSelectedDate } = useTodoStore();
  const { partner, loadPartner } = usePartnerStore();
  const { essays, loadEssays } = useEssayStore();

  useEffect(() => {
    loadPartner();
    loadEssays();
  }, [loadPartner, loadEssays]);

  // 해당 월의 todos 실시간 쿼리
  const monthTodos = useLiveQuery(async () => {
    const start = format(startOfMonth(viewMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(viewMonth), 'yyyy-MM-dd');
    return db.todos.where('date').between(start, end, true, true).toArray();
  }, [viewMonth]) ?? [];

  // 해당 월의 essays 필터
  const monthEssays = useMemo(() => {
    const ym = format(viewMonth, 'yyyy-MM');
    return essays.filter((e) => e.periodStart.startsWith(ym) || e.periodEnd.startsWith(ym));
  }, [essays, viewMonth]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/30">
        <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">기록</h1>
          </div>
          {partner ? (
            <p className="text-[11px] text-muted-foreground">
              <span className="text-primary font-medium">{partner.name}</span>
              과 쌓아온 한 달의 발자국
            </p>
          ) : null}
        </div>
      </header>

      <main className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            aria-label="이전 달"
            className="p-2 rounded-full hover:bg-muted"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold">
            {format(viewMonth, 'yyyy년 M월', { locale: ko })}
          </h2>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            aria-label="다음 달"
            className="p-2 rounded-full hover:bg-muted"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 요약 카드 */}
        <MonthlySummary todos={monthTodos} />

        {/* 히트맵 */}
        <MonthHeatmap
          viewMonth={viewMonth}
          todos={monthTodos}
          onSelectDate={handleDateClick}
        />

        {/* 카테고리별 활동 */}
        <CategoryBreakdown todos={monthTodos} />

        {/* 해당 월 소설 */}
        {monthEssays.length > 0 ? (
          <section className="rounded-2xl border border-border/50 bg-card/60 p-4 space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />이 달의 이야기
            </h3>
            <div className="space-y-1.5">
              {monthEssays.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => router.push('/story')}
                  className="w-full text-left rounded-xl bg-muted/40 hover:bg-muted/70 px-3 py-2 transition-colors"
                >
                  <div className="text-[11px] text-muted-foreground">
                    {e.periodStart} ~ {e.periodEnd}
                  </div>
                  <div className="text-sm font-medium">{e.title}</div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {monthTodos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              이 달엔 아직 기록이 없어요.
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              홈 화면에서 할 일을 추가해보세요.
            </p>
          </div>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}

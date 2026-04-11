/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/history / MonthHeatmap
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * GitHub contribution 스타일 월별 히트맵.
 * 각 셀 = 하루. 농도 = 완료 개수.
 */

'use client';

import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isToday as isDateToday,
} from 'date-fns';
import type { Todo } from '@/types/todo';

interface Props {
  viewMonth: Date;
  todos: Todo[];
  onSelectDate?: (date: string) => void;
}

export function MonthHeatmap({ viewMonth, todos, onSelectDate }: Props) {
  // 날짜별 완료 개수 집계
  const countsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of todos) {
      if (t.status !== 'completed') continue;
      map[t.date] = (map[t.date] || 0) + 1;
    }
    return map;
  }, [todos]);

  const days = useMemo(() => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  // 첫 주 앞쪽 빈 칸 (월요일 시작 기준)
  const firstDayOfWeek = useMemo(() => {
    const d = getDay(startOfMonth(viewMonth)); // 0(일)~6(토)
    // 월요일=0 기준으로 변환
    return d === 0 ? 6 : d - 1;
  }, [viewMonth]);

  const WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">매일의 기록</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>적음</span>
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/10" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/30" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/60" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
          </div>
          <span>많음</span>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_LABELS.map((w) => (
          <div key={w} className="text-[10px] text-muted-foreground text-center font-medium">
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((d) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const count = countsByDate[dateStr] || 0;
          const isToday = isDateToday(d);

          let bg = 'bg-muted/50';
          if (count >= 5) bg = 'bg-primary';
          else if (count >= 3) bg = 'bg-primary/60';
          else if (count >= 1) bg = 'bg-primary/30';

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate?.(dateStr)}
              className={`aspect-square rounded-md ${bg} flex items-center justify-center text-[10px] font-medium transition-all hover:scale-110 ${
                isToday ? 'ring-2 ring-primary ring-offset-1' : ''
              } ${count > 0 && count < 3 ? 'text-foreground' : count >= 3 ? 'text-primary-foreground' : 'text-muted-foreground/60'}`}
              title={`${format(d, 'M.d')} — ${count}개 완료`}
            >
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

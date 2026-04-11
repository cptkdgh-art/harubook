/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/todo / 날짜 스트립 + 월 네비 + 풀 캘린더
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 구조:
 *  [◀] 2026년 4월 [▶]   (탭하면 풀 캘린더 다이얼로그)
 *  [월 1 2 3 4 ... 30]  가로 스크롤 스트립 (선택된 월 전체)
 */

'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isToday as isDateToday,
  isSameMonth,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTodoStore } from '@/lib/stores/useTodoStore';
import { db } from '@/lib/db/dexie';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/* ════════════════════════════════
   COMPONENT
   ════════════════════════════════ */

export function CalendarView() {
  const { selectedDate, setSelectedDate } = useTodoStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ── 현재 보고 있는 '월' 상태 ──
     기본은 선택된 날짜의 월. 사용자가 ◀▶ 눌러서 탐색 가능. */
  const selectedDateObj = useMemo(
    () => new Date(selectedDate + 'T00:00:00'),
    [selectedDate]
  );
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(selectedDateObj));
  const [pickerOpen, setPickerOpen] = useState(false);

  // 선택된 날짜가 바뀌면 시야 월도 따라가기
  useEffect(() => {
    if (!isSameMonth(viewMonth, selectedDateObj)) {
      setViewMonth(startOfMonth(selectedDateObj));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  /* ── 해당 월의 모든 날짜 ── */
  const days = useMemo(() => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    return eachDayOfInterval({ start, end }).map((date) => ({
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE', { locale: ko }),
      dayNum: format(date, 'd'),
      isToday: isDateToday(date),
    }));
  }, [viewMonth]);

  /* ── todo 개수 실시간 ── */
  const todoCounts = useLiveQuery(async () => {
    const startStr = format(startOfMonth(viewMonth), 'yyyy-MM-dd');
    const endStr = format(endOfMonth(viewMonth), 'yyyy-MM-dd');
    const rows = await db.todos
      .where('date')
      .between(startStr, endStr, true, true)
      .toArray();
    const counts: Record<string, number> = {};
    for (const t of rows) counts[t.date] = (counts[t.date] || 0) + 1;
    return counts;
  }, [viewMonth]);

  /* ── 선택된 날짜로 자동 스크롤 ── */
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current.querySelector('[data-selected="true"]');
    if (el) el.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }, [selectedDate, viewMonth]);

  /* ── 월 이동 시 selectedDate도 함께 옮긴다 ──
     ◀▶ 를 눌렀을 때 같은 day-of-month 를 유지하되,
     해당 월에 그 일자가 없으면(예: 1/31 → 2월) 마지막 날로 클램프.
     이렇게 해야 HaruTree·파티클·todo 리스트가 새 달에 동기화됨. */
  const shiftMonth = (delta: number) => {
    const next = delta > 0 ? addMonths(viewMonth, 1) : subMonths(viewMonth, 1);
    setViewMonth(next);
    const lastDay = endOfMonth(next).getDate();
    const targetDay = Math.min(selectedDateObj.getDate(), lastDay);
    const target = new Date(next.getFullYear(), next.getMonth(), targetDay);
    setSelectedDate(format(target, 'yyyy-MM-dd'));
  };
  const handlePrevMonth = () => shiftMonth(-1);
  const handleNextMonth = () => shiftMonth(1);

  /* ════════════════════════════════
     RENDER
     ════════════════════════════════ */

  return (
    <>
      {/* 월 헤더 */}
      <div className="flex items-center justify-between px-1 mb-1">
        <button
          onClick={handlePrevMonth}
          aria-label="이전 달"
          className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-muted text-sm font-semibold"
        >
          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
          {format(viewMonth, 'yyyy년 M월', { locale: ko })}
        </button>

        <button
          onClick={handleNextMonth}
          aria-label="다음 달"
          className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 날짜 스트립 */}
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide py-1 px-1 -mx-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {days.map((day) => {
          const isSelected = day.dateStr === selectedDate;
          const hasTodos = (todoCounts?.[day.dateStr] || 0) > 0;

          return (
            <motion.button
              key={day.dateStr}
              data-selected={isSelected}
              onClick={() => setSelectedDate(day.dateStr)}
              whileTap={{ scale: 0.92 }}
              className={`
                flex flex-col items-center justify-center
                min-w-[2.8rem] h-[4rem] rounded-2xl flex-shrink-0
                transition-all duration-200
                ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : day.isToday
                    ? 'bg-primary/10 text-primary'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/50'
                }
              `}
              style={{ scrollSnapAlign: 'center' }}
            >
              <span className="text-[10px] font-medium leading-none mb-0.5">
                {day.dayName}
              </span>
              <span className="text-lg font-bold leading-none">{day.dayNum}</span>
              <div
                className={`w-1 h-1 mt-0.5 rounded-full ${
                  !hasTodos
                    ? 'opacity-0'
                    : isSelected
                    ? 'bg-primary-foreground'
                    : 'bg-primary'
                }`}
              />
            </motion.button>
          );
        })}
      </div>

      {/* 풀 캘린더 다이얼로그 */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>날짜 선택</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              locale={ko}
              month={viewMonth}
              onMonthChange={setViewMonth}
              selected={selectedDateObj}
              onSelect={(d) => {
                if (!d) return;
                setSelectedDate(format(d, 'yyyy-MM-dd'));
                setPickerOpen(false);
              }}
              className="rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

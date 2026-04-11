/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/story / PeriodPicker
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 소설 생성 대상 기간 선택기.
 * 프리셋 (이번 주/지난 주/이번 달/지난 달) + 커스텀 날짜.
 * 옴니버스 시리즈를 위해 사용자가 매번 다른 기간을 고를 수 있게 함.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, CalendarRange } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { getWeekRange } from '@/lib/stores/useEssayStore';

type Preset = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

export interface PeriodValue {
  start: string; // YYYY-MM-DD
  end: string;
  label: string;
}

interface Props {
  value: PeriodValue;
  onChange: (period: PeriodValue) => void;
}

const fmt = (d: Date) => d.toISOString().split('T')[0];

function buildPreset(p: Exclude<Preset, 'custom'>): PeriodValue {
  const today = new Date();
  switch (p) {
    case 'thisWeek': {
      const { start, end } = getWeekRange(today);
      return { start, end, label: '이번 주' };
    }
    case 'lastWeek': {
      const { start, end } = getWeekRange(subDays(today, 7));
      return { start, end, label: '지난 주' };
    }
    case 'thisMonth': {
      return {
        start: fmt(startOfMonth(today)),
        end: fmt(endOfMonth(today)),
        label: '이번 달',
      };
    }
    case 'lastMonth': {
      const last = subMonths(today, 1);
      return {
        start: fmt(startOfMonth(last)),
        end: fmt(endOfMonth(last)),
        label: '지난 달',
      };
    }
  }
}

export function PeriodPicker({ value, onChange }: Props) {
  const [preset, setPreset] = useState<Preset>('thisWeek');
  const [customStart, setCustomStart] = useState(value.start);
  const [customEnd, setCustomEnd] = useState(value.end);

  // 프리셋 변경 시 value 갱신
  useEffect(() => {
    if (preset === 'custom') return;
    const p = buildPreset(preset);
    onChange(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  // 커스텀 입력 변경 시 반영
  const applyCustom = () => {
    if (!customStart || !customEnd) return;
    const s = customStart > customEnd ? customEnd : customStart;
    const e = customStart > customEnd ? customStart : customEnd;
    onChange({
      start: s,
      end: e,
      label: `${format(new Date(s + 'T00:00:00'), 'M.d', { locale: ko })} ~ ${format(
        new Date(e + 'T00:00:00'),
        'M.d',
        { locale: ko }
      )}`,
    });
  };

  // 선택된 기간의 todo 통계
  const stats = useLiveQuery(async () => {
    if (!value.start || !value.end) return null;
    const rows = await db.todos
      .where('date')
      .between(value.start, value.end, true, true)
      .toArray();
    const completed = rows.filter((t) => t.status === 'completed').length;
    return { total: rows.length, completed };
  }, [value.start, value.end]);

  const presets: { id: Preset; label: string }[] = useMemo(
    () => [
      { id: 'thisWeek', label: '이번 주' },
      { id: 'lastWeek', label: '지난 주' },
      { id: 'thisMonth', label: '이번 달' },
      { id: 'lastMonth', label: '지난 달' },
      { id: 'custom', label: '커스텀' },
    ],
    []
  );

  const rangeDisplay = `${format(new Date(value.start + 'T00:00:00'), 'yyyy.M.d (EEE)', {
    locale: ko,
  })} ~ ${format(new Date(value.end + 'T00:00:00'), 'M.d (EEE)', { locale: ko })}`;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
        <CalendarRange className="w-3.5 h-3.5" />
        기간 선택
      </div>

      {/* 프리셋 */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
              preset === p.id
                ? 'bg-primary/15 border-primary/50 text-primary font-semibold'
                : 'bg-transparent border-border/50 text-muted-foreground hover:border-border'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 커스텀 입력 */}
      {preset === 'custom' ? (
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="h-8 px-2 rounded-md bg-background border border-border/60 text-xs outline-none focus:border-primary/60 font-mono"
          />
          <span className="text-xs text-muted-foreground">~</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="h-8 px-2 rounded-md bg-background border border-border/60 text-xs outline-none focus:border-primary/60 font-mono"
          />
          <button
            type="button"
            onClick={applyCustom}
            disabled={!customStart || !customEnd}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-[11px] font-semibold disabled:opacity-40"
          >
            적용
          </button>
        </div>
      ) : null}

      {/* 선택된 기간 표시 */}
      <div className="rounded-xl bg-muted/30 p-3 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">{value.label}</span>
          <span className="text-muted-foreground font-mono">{rangeDisplay}</span>
        </div>
        {stats ? (
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>
              총 <b className="text-foreground">{stats.total}</b>개
            </span>
            <span>
              완료 <b className="text-primary">{stats.completed}</b>개
            </span>
            {stats.total === 0 ? (
              <span className="text-amber-600 ml-auto">⚠️ 이 기간에 할 일이 없어요</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

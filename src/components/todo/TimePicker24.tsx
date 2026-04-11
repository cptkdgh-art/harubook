/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/todo / TimePicker24
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 24시간제 전용 시·분 선택기 (시: 0~23, 분: 5분 단위).
 * 네이티브 <input type="time"> 의 AM/PM 문제 회피.
 */

'use client';

import { Clock } from 'lucide-react';

interface Props {
  value: string; // "HH:MM" 또는 빈 문자열
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
// 5분 단위 — 터치 친화적
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

export function TimePicker24({ value, onChange, autoFocus }: Props) {
  const [h = '', m = ''] = value ? value.split(':') : ['', ''];

  const handleHour = (hh: string) => {
    const mm = m || '00';
    onChange(`${hh}:${mm}`);
  };
  const handleMinute = (mm: string) => {
    const hh = h || '09';
    onChange(`${hh}:${mm}`);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      <select
        value={h}
        onChange={(e) => handleHour(e.target.value)}
        autoFocus={autoFocus}
        aria-label="시"
        className="h-8 px-2 rounded-md bg-background border border-border/60 text-xs outline-none focus:border-primary/60 font-mono"
      >
        <option value="">시</option>
        {HOURS.map((hh) => (
          <option key={hh} value={hh}>
            {hh}
          </option>
        ))}
      </select>
      <span className="text-xs text-muted-foreground font-mono">:</span>
      <select
        value={m}
        onChange={(e) => handleMinute(e.target.value)}
        aria-label="분"
        className="h-8 px-2 rounded-md bg-background border border-border/60 text-xs outline-none focus:border-primary/60 font-mono"
      >
        <option value="">분</option>
        {MINUTES.map((mm) => (
          <option key={mm} value={mm}>
            {mm}
          </option>
        ))}
      </select>
      <span className="text-[10px] text-muted-foreground/70 ml-1">24시간제</span>
    </div>
  );
}

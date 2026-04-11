/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/history / MonthlySummary
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

'use client';

import type { Todo } from '@/types/todo';
import { pointsForCategory } from '@/types/stats';
import { CheckCircle2, ListTodo, Sparkles, Flame } from 'lucide-react';

interface Props {
  todos: Todo[];
}

export function MonthlySummary({ todos }: Props) {
  const total = todos.length;
  const completed = todos.filter((t) => t.status === 'completed').length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const points = todos
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + pointsForCategory(t.category), 0);

  // 연속 완료일 (해당 월 내 최장 streak)
  const dateSet = new Set(
    todos.filter((t) => t.status === 'completed').map((t) => t.date)
  );
  let longestStreak = 0;
  let currentStreak = 0;
  const sortedDates = Array.from(dateSet).sort();
  let prev: Date | null = null;
  for (const ds of sortedDates) {
    const d = new Date(ds + 'T00:00:00');
    if (prev && (d.getTime() - prev.getTime()) === 86400000) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak;
    prev = d;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <SummaryCard
        icon={<ListTodo className="w-4 h-4" />}
        label="총 할 일"
        value={total.toString()}
        sub={`완료 ${completed}`}
      />
      <SummaryCard
        icon={<CheckCircle2 className="w-4 h-4" />}
        label="완료율"
        value={`${rate}%`}
        sub={total > 0 ? `${completed}/${total}` : '—'}
        progress={rate}
      />
      <SummaryCard
        icon={<Sparkles className="w-4 h-4" />}
        label="획득 포인트"
        value={`+${points}P`}
        sub="이 달에 쌓은"
      />
      <SummaryCard
        icon={<Flame className="w-4 h-4" />}
        label="최장 연속"
        value={longestStreak > 0 ? `${longestStreak}일` : '—'}
        sub="매일 이어간"
      />
    </div>
  );
}

/* ════════════════════════════════
   SummaryCard
   ════════════════════════════════ */

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  progress?: number;
}

function SummaryCard({ icon, label, value, sub, progress }: CardProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
      {progress !== undefined ? (
        <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

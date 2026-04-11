/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/history / CategoryBreakdown
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 카테고리별 완료 개수 + 획득 포인트를 가로 바로 표시.
 */

'use client';

import { useMemo } from 'react';
import type { Todo } from '@/types/todo';
import { CATEGORY_CONFIG, type TodoCategory } from '@/types/todo';
import { pointsForCategory } from '@/types/stats';

interface Props {
  todos: Todo[];
}

const ALL_CATEGORIES: TodoCategory[] = ['성장', '회복', '관계', '창작', '유지'];

export function CategoryBreakdown({ todos }: Props) {
  const data = useMemo(() => {
    const counts: Record<string, { completed: number; total: number; points: number }> = {};
    for (const cat of ALL_CATEGORIES) {
      counts[cat] = { completed: 0, total: 0, points: 0 };
    }
    for (const t of todos) {
      if (!t.category) continue;
      const entry = counts[t.category];
      if (!entry) continue;
      entry.total += 1;
      if (t.status === 'completed') {
        entry.completed += 1;
        entry.points += pointsForCategory(t.category);
      }
    }
    return counts;
  }, [todos]);

  const maxCompleted = Math.max(1, ...ALL_CATEGORIES.map((c) => data[c].completed));

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4 space-y-3">
      <h3 className="text-sm font-bold">카테고리별 활동</h3>
      <div className="space-y-2.5">
        {ALL_CATEGORIES.map((cat) => {
          const entry = data[cat];
          const cfg = CATEGORY_CONFIG[cat];
          const widthPct = (entry.completed / maxCompleted) * 100;
          const hasData = entry.total > 0;

          return (
            <div key={cat} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <span>{cfg.emoji}</span>
                  <span>{cfg.label}</span>
                </span>
                <span className="text-muted-foreground">
                  {hasData ? (
                    <>
                      {entry.completed}/{entry.total}{' '}
                      <span className="text-primary font-semibold">+{entry.points}P</span>
                    </>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

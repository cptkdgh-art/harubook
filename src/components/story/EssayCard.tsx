/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/story / EssayCard
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 소설 카드 — 제목/기간/미리보기 + 삭제·재생성 액션.
 */

'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Trash2, RefreshCw } from 'lucide-react';
import type { Essay } from '@/types/essay';

interface Props {
  essay: Essay;
  onClick: () => void;
  onDelete?: (id: number) => void;
  onRegenerate?: (essay: Essay) => void;
  busy?: boolean;
}

export function EssayCard({ essay, onClick, onDelete, onRegenerate, busy }: Props) {
  const start = new Date(essay.periodStart + 'T00:00:00');
  const end = new Date(essay.periodEnd + 'T00:00:00');
  const periodLabel = `${format(start, 'M.d', { locale: ko })} ~ ${format(end, 'M.d', { locale: ko })}`;

  const preview = essay.content.replace(/\n+/g, ' ').slice(0, 90).trim() + '…';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!essay.id) return;
    if (confirm(`"${essay.title}" 이야기를 삭제할까요? 복구할 수 없어요.`)) {
      onDelete?.(essay.id);
    }
  };

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`같은 기간(${periodLabel})으로 새 이야기를 생성할까요?\n기존 이야기는 그대로 남아요.`)) {
      onRegenerate?.(essay);
    }
  };

  return (
    <div className="group relative rounded-2xl border border-border/40 bg-card hover:bg-accent/40 transition-colors shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left p-5"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground font-medium tracking-wide">
            {periodLabel}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
            {essay.type === 'monthly' ? '월간' : '주간'}
          </span>
        </div>
        <h3 className="text-lg font-bold mb-2 leading-snug pr-14">{essay.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {preview}
        </p>
        {essay.teaser ? (
          <p className="mt-3 text-[11px] text-primary/80 italic">
            다음 화: {essay.teaser}
          </p>
        ) : null}
      </button>

      {/* 액션 버튼 */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
        {onRegenerate ? (
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={busy}
            aria-label="재생성"
            title="같은 기간으로 다시 쓰기"
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-background/80 border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            aria-label="삭제"
            title="이야기 삭제"
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-background/80 border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

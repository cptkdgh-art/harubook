/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/story / EssayReader
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 소설 상세 읽기 뷰. 책 느낌의 여백과 세리프 폰트.
 */

'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X } from 'lucide-react';
import type { Essay } from '@/types/essay';

interface Props {
  essay: Essay;
  onClose: () => void;
}

export function EssayReader({ essay, onClose }: Props) {
  const start = new Date(essay.periodStart + 'T00:00:00');
  const end = new Date(essay.periodEnd + 'T00:00:00');
  const periodLabel = `${format(start, 'yyyy년 M월 d일', { locale: ko })} ~ ${format(end, 'M월 d일', { locale: ko })}`;

  const paragraphs = essay.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* 상단 바 */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/30">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <span className="text-xs text-muted-foreground">{periodLabel}</span>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-2 -mr-2 rounded-full hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 본문 */}
      <article className="max-w-2xl mx-auto px-6 py-10 pb-24">
        <h1 className="text-3xl font-bold mb-2 leading-tight tracking-tight">
          {essay.title}
        </h1>
        <p className="text-xs text-muted-foreground mb-10">{periodLabel}</p>

        <div className="space-y-6 text-[17px] leading-[1.95] text-foreground/90 font-serif">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {essay.teaser && (
          <div className="mt-12 pt-6 border-t border-border/40">
            <p className="text-xs text-muted-foreground mb-1">다음 화 예고</p>
            <p className="text-base italic text-primary/90">{essay.teaser}</p>
          </div>
        )}
      </article>
    </div>
  );
}

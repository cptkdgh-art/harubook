/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/todo / TodoInput
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Todo 추가 입력 컴포넌트.
 * 텍스트 입력 + 카테고리 선택 + 추가 버튼.
 * Enter 키로 빠르게 추가 가능.
 */

'use client';

import { useState, useCallback, type KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Plus, Clock, X } from 'lucide-react';
import type { TodoCategory } from '@/types/todo';
import { CATEGORY_CONFIG } from '@/types/todo';
import { TimePicker24 } from './TimePicker24';

/* ════════════════════════════════
   1. PROPS
   ════════════════════════════════ */

interface TodoInputProps {
  onAdd: (title: string, category?: TodoCategory, time?: string) => void;
}

/* ════════════════════════════════
   2. COMPONENT
   ════════════════════════════════ */

export function TodoInput({ onAdd }: TodoInputProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TodoCategory | undefined>();
  const [time, setTime] = useState<string>('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSubmit = useCallback(() => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, category, time || undefined);
    setTitle('');
    setCategory(undefined);
    setTime('');
    setShowTimePicker(false);
  }, [title, category, time, onAdd]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const categories = Object.entries(CATEGORY_CONFIG) as [TodoCategory, typeof CATEGORY_CONFIG[TodoCategory]][];

  return (
    <div className="space-y-2">
      {/* 입력 행 */}
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="할 일을 입력하세요..."
          className="flex-1 h-11 bg-card/50 border-border/50 placeholder:text-muted-foreground/50"
        />
        <button
          type="button"
          onClick={() => setShowTimePicker((v) => !v)}
          aria-label="시간 설정"
          className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${
            time || showTimePicker
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-card/50 border-border/50 text-muted-foreground hover:border-border'
          }`}
        >
          <Clock className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="h-11 w-11 flex items-center justify-center rounded-xl
            bg-primary text-primary-foreground
            hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed
            transition-all duration-200 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* 시간 피커 (토글) — 24시간제 */}
      {showTimePicker ? (
        <div className="flex items-center gap-2 px-1 flex-wrap">
          <TimePicker24 value={time} onChange={setTime} />
          {time ? (
            <>
              <button
                type="button"
                onClick={() => setTime('')}
                aria-label="시간 지우기"
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted/40 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] text-primary">자동 정렬 ⏱️</span>
            </>
          ) : null}
        </div>
      ) : null}

      {/* 카테고리 선택 */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(category === key ? undefined : key)}
            className={`
              text-xs px-2.5 py-1 rounded-full border transition-all duration-200
              ${category === key
                ? 'bg-primary/15 border-primary/40 text-primary'
                : 'bg-transparent border-border/40 text-muted-foreground hover:border-border'
              }
            `}
          >
            {config.emoji} {config.label}
          </button>
        ))}
      </div>
    </div>
  );
}

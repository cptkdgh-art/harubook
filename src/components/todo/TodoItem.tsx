/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/todo / TodoItem
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 개별 Todo 항목.
 * 체크박스 + 제목 + 카테고리 + 시간 편집 토글 + 삭제.
 * 카드 안의 ⏱️ 버튼으로 인라인 시간 피커 열기 → 저장 시 자동 재정렬.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Clock, X, Check } from 'lucide-react';
import type { Todo } from '@/types/todo';
import { CATEGORY_CONFIG } from '@/types/todo';
import { TimePicker24 } from './TimePicker24';

/* ════════════════════════════════
   1. PROPS
   ════════════════════════════════ */

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate?: (id: number, changes: Partial<Todo>) => void;
}

/* ════════════════════════════════
   2. COMPONENT
   ════════════════════════════════ */

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const isCompleted = todo.status === 'completed';
  const category = todo.category ? CATEGORY_CONFIG[todo.category] : null;
  const [editingTime, setEditingTime] = useState(false);
  const [timeDraft, setTimeDraft] = useState(todo.time || '');

  const handleTimeSave = () => {
    if (!todo.id) return;
    onUpdate?.(todo.id, { time: timeDraft || undefined });
    setEditingTime(false);
  };

  const handleTimeClear = () => {
    if (!todo.id) return;
    setTimeDraft('');
    onUpdate?.(todo.id, { time: undefined });
    setEditingTime(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className={`
        group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm
        hover:bg-card/80 transition-all duration-200 overflow-hidden
        ${isCompleted ? 'opacity-50' : ''}
      `}
    >
      {/* 메인 행 */}
      <div className="flex items-center gap-3 p-3">
        {/* 체크박스 */}
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => todo.id && onToggle(todo.id)}
          className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-primary"
        />

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isCompleted ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {todo.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {category ? (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {category.emoji} {category.label}
              </Badge>
            ) : null}
          </div>
        </div>

        {/* 시간 토글 */}
        <button
          type="button"
          onClick={() => {
            setTimeDraft(todo.time || '');
            setEditingTime((v) => !v);
          }}
          aria-label="시간 설정"
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all ${
            todo.time
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-transparent border-border/50 text-muted-foreground hover:border-border'
          }`}
        >
          <Clock className="w-3 h-3" />
          {todo.time || '시간'}
        </button>

        {/* 삭제 */}
        <button
          type="button"
          onClick={() => todo.id && onDelete(todo.id)}
          aria-label="삭제"
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
            hover:bg-destructive/10 text-muted-foreground hover:text-destructive
            transition-all duration-200"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 시간 편집 인라인 패널 */}
      <AnimatePresence initial={false}>
        {editingTime ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="border-t border-border/40 bg-muted/20"
          >
            <div className="flex items-center gap-2 p-2.5 flex-wrap">
              <TimePicker24 value={timeDraft} onChange={setTimeDraft} autoFocus />
              <div className="flex gap-1 ml-auto">
                <button
                  type="button"
                  onClick={handleTimeSave}
                  aria-label="저장"
                  className="h-8 w-8 flex items-center justify-center rounded-md bg-primary text-primary-foreground"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                {todo.time ? (
                  <button
                    type="button"
                    onClick={handleTimeClear}
                    aria-label="시간 지우기"
                    className="h-8 w-8 flex items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/70 px-3 pb-2">
              💡 저장하면 타임라인에서 해당 시간으로 자동 이동해요
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

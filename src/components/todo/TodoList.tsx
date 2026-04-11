/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/todo / TodoList (타임라인 레이아웃)
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 수직 0~24시 타임라인.
 * 상단: 언제든(시간 미정) 섹션
 * 본체: 시간 슬롯 (todo 있는 시간만 굵게 + 현재 시각 표시)
 * 하단: 완료 목록
 */

'use client';

import { useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTodoStore } from '@/lib/stores/useTodoStore';
import { TodoItem } from './TodoItem';
import { TodoInput } from './TodoInput';
import { CheckCircle2, Clock } from 'lucide-react';
import type { Todo } from '@/types/todo';

/* ════════════════════════════════
   HELPERS
   ════════════════════════════════ */

function getHourFromTime(time?: string): number | null {
  if (!time) return null;
  const [h] = time.split(':').map(Number);
  if (isNaN(h)) return null;
  return h;
}

/* ════════════════════════════════
   COMPONENT
   ════════════════════════════════ */

export function TodoList() {
  const {
    todos,
    isLoading,
    loadTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
  } = useTodoStore();

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const pendingTodos = useMemo(
    () => todos.filter((t) => t.status === 'pending'),
    [todos]
  );
  const completedTodos = useMemo(
    () => todos.filter((t) => t.status === 'completed'),
    [todos]
  );
  const completionRate =
    todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;

  // 시간 없는 todo (언제든)
  const anytimeTodos = useMemo(
    () => pendingTodos.filter((t) => !t.time),
    [pendingTodos]
  );

  // 시간 있는 todo 시간순 + 시간별 그룹핑 (hour 단위)
  const todosByHour = useMemo(() => {
    const map: Record<number, Todo[]> = {};
    for (const t of pendingTodos) {
      const h = getHourFromTime(t.time);
      if (h === null) continue;
      if (!map[h]) map[h] = [];
      map[h].push(t);
    }
    // 각 시간 내부는 분 단위 정렬
    for (const h of Object.keys(map)) {
      map[Number(h)].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }
    return map;
  }, [pendingTodos]);

  // 현재 시각
  const currentHour = new Date().getHours();

  // 24시간 슬롯
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-4">
      {/* 입력 */}
      <TodoInput
        onAdd={(title, category, time) => addTodo(title, undefined, time, category)}
      />

      {/* 진행률 */}
      {todos.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {completedTodos.length}/{todos.length} 완료
            </span>
            <span>{completionRate}%</span>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      ) : null}

      {/* 로딩 */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">불러오는 중...</div>
      ) : null}

      {/* 빈 상태 */}
      {!isLoading && todos.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <div className="text-4xl">📝</div>
          <p className="text-muted-foreground text-sm">오늘의 할 일을 추가해보세요</p>
          <p className="text-muted-foreground/50 text-xs">또는 AI 파트너에게 말해보세요</p>
        </div>
      ) : null}

      {/* ⏱️ 언제든 (시간 미정) */}
      {anytimeTodos.length > 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-semibold">언제든</span>
            <span className="text-[10px] text-muted-foreground/60">시간 미정</span>
            <span className="text-[10px] text-muted-foreground/60 ml-auto">
              카드의 ⏱️ 버튼으로 시간 설정 가능
            </span>
          </div>
          <AnimatePresence mode="popLayout">
            {anytimeTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : null}

      {/* 수직 타임라인 0~24시 */}
      {pendingTodos.some((t) => !!t.time) ? (
        <div className="rounded-2xl border border-border/50 bg-card/40 p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mb-2">
            <span className="font-semibold">🕐 타임라인</span>
            <span className="text-[10px] text-muted-foreground/60">
              0시 ~ 24시 · 현재 {currentHour}시
            </span>
          </div>

          <div className="relative">
            {hours.map((h) => {
              const hourTodos = todosByHour[h] || [];
              const hasAny = hourTodos.length > 0;
              const isNow = h === currentHour;
              return (
                <div
                  key={h}
                  className={`flex gap-2 ${hasAny ? 'py-1.5' : 'py-0'}`}
                >
                  {/* 시간 라벨 */}
                  <div
                    className={`flex-shrink-0 w-9 text-right pt-0.5 text-[10px] font-mono ${
                      isNow
                        ? 'text-primary font-bold'
                        : hasAny
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground/30'
                    }`}
                  >
                    {String(h).padStart(2, '0')}시
                  </div>

                  {/* 타임라인 축 */}
                  <div className="flex-shrink-0 w-px relative">
                    <div
                      className={`absolute inset-0 ${
                        isNow ? 'bg-primary w-[2px]' : hasAny ? 'bg-border' : 'bg-border/30'
                      }`}
                    />
                    {/* 현재 시각 도트 */}
                    {isNow ? (
                      <div className="absolute -left-[3px] top-1 w-2 h-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
                    ) : null}
                    {/* 할 일 있는 시간 도트 */}
                    {hasAny && !isNow ? (
                      <div className="absolute -left-[2px] top-2 w-1.5 h-1.5 rounded-full bg-primary/70" />
                    ) : null}
                  </div>

                  {/* 해당 시간 todo들 */}
                  <div className="flex-1 min-w-0 space-y-1.5 pl-2">
                    {hasAny ? (
                      <AnimatePresence mode="popLayout">
                        {hourTodos.map((todo) => (
                          <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                            onUpdate={updateTodo}
                          />
                        ))}
                      </AnimatePresence>
                    ) : (
                      <div className="h-px" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ✅ 완료 목록 */}
      {completedTodos.length > 0 ? (
        <div className="space-y-1.5 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>완료 ({completedTodos.length})</span>
          </div>
          <AnimatePresence mode="popLayout">
            {completedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}

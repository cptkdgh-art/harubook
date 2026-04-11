/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 stores / useTodoStore
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { create } from 'zustand';
import { db, today, now } from '@/lib/db/dexie';
import type { Todo, TodoCategory } from '@/types/todo';
import { timeToMinutes } from '@/types/todo';
import { useStatsStore } from './useStatsStore';

/* ════════════════════════════════
   1. STATE INTERFACE
   ════════════════════════════════ */

interface TodoState {
  todos: Todo[];
  selectedDate: string;
  isLoading: boolean;

  // Actions
  loadTodos: (date?: string) => Promise<void>;
  addTodo: (title: string, date?: string, time?: string, category?: TodoCategory) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  updateTodo: (id: number, changes: Partial<Todo>) => Promise<void>;
  setSelectedDate: (date: string) => void;
}

/* ════════════════════════════════
   2. STORE
   ════════════════════════════════ */

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  selectedDate: today(),
  isLoading: false,

  loadTodos: async (date) => {
    const targetDate = date || get().selectedDate;
    set({ isLoading: true });
    const rows = await db.todos.where('date').equals(targetDate).toArray();
    // 시간 우선 정렬: time 있는 것은 time 순, 없는 것은 createdAt 순으로 뒤에
    const sorted = rows.sort((a, b) => {
      const ta = timeToMinutes(a.time);
      const tb = timeToMinutes(b.time);
      if (ta !== tb) return ta - tb;
      // time 동일 (또는 둘 다 없음) → createdAt 오름차순
      return (a.createdAt || '').localeCompare(b.createdAt || '');
    });
    set({ todos: sorted, isLoading: false, selectedDate: targetDate });
  },

  addTodo: async (title, date, time, category) => {
    const newTodo: Todo = {
      title,
      date: date || get().selectedDate,
      time,
      category,
      status: 'pending',
      createdAt: now(),
    };
    await db.todos.add(newTodo);
    await get().loadTodos();
  },

  toggleTodo: async (id) => {
    const todo = await db.todos.get(id);
    if (!todo) return;
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    await db.todos.update(id, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? now() : undefined,
    });

    // 포인트 지급/회수 — 나무가 자란다 (todo.date 의 계절에 누적)
    const stats = useStatsStore.getState();
    if (newStatus === 'completed') {
      await stats.addPointsForCompletion(todo.category, todo.date);
    } else {
      await stats.subtractPointsForUncompletion(todo.category, todo.date);
    }

    await get().loadTodos();
  },

  deleteTodo: async (id) => {
    await db.todos.delete(id);
    await get().loadTodos();
  },

  updateTodo: async (id, changes) => {
    await db.todos.update(id, changes);
    await get().loadTodos();
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().loadTodos(date);
  },
}));

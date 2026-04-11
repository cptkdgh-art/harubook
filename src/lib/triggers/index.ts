/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 triggers / index
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { db, now } from '@/lib/db/dexie';
import type { Todo, TodoCategory } from '@/types/todo';
import type { AIAction } from '@/types/message';

/* ════════════════════════════════
   1. TRIGGER FUNCTIONS
   ════════════════════════════════ */

async function addTodoTrigger(data: { title: string; date: string; time?: string; category?: string }) {
  const todo: Todo = {
    title: data.title,
    date: data.date,
    time: data.time,
    category: (data.category as TodoCategory) || undefined,
    status: 'pending',
    createdAt: now(),
  };
  return db.todos.add(todo);
}

async function updateTodoTrigger(data: { id: number; title?: string; date?: string; time?: string }) {
  const changes: Partial<Todo> = {};
  if (data.title) changes.title = data.title;
  if (data.date) changes.date = data.date;
  if (data.time) changes.time = data.time;
  return db.todos.update(data.id, changes);
}

async function deleteTodoTrigger(data: { id: number }) {
  return db.todos.delete(data.id);
}

async function completeTodoTrigger(data: { id: number }) {
  return db.todos.update(data.id, { status: 'completed', completedAt: now() });
}

async function listTodoTrigger(data: { date?: string }) {
  const date = data.date || new Date().toISOString().split('T')[0];
  return db.todos.where('date').equals(date).toArray();
}

/* ════════════════════════════════
   2. TRIGGER MAP
   ════════════════════════════════ */

const triggers: Record<string, (data: any) => Promise<any>> = {
  add: addTodoTrigger,
  update: updateTodoTrigger,
  delete: deleteTodoTrigger,
  complete: completeTodoTrigger,
  list: listTodoTrigger,
};

/* ════════════════════════════════
   3. ROUTER — AI 응답 받으면 여기서 실행
   ════════════════════════════════ */

export async function executeAction(action: AIAction): Promise<{ success: boolean; reply: string }> {
  const fn = triggers[action.action];
  if (!fn) return { success: false, reply: `알 수 없는 액션: ${action.action}` };

  try {
    if (action.todos && action.todos.length > 0) {
      await Promise.all(action.todos.map(t => fn(t)));
    }
    return { success: true, reply: action.reply };
  } catch (error) {
    return { success: false, reply: '처리 중 오류가 발생했어요.' };
  }
}

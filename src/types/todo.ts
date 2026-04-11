/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 types / Todo 타입 정의
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export type TodoCategory = '성장' | '회복' | '관계' | '창작' | '유지';
export type TodoStatus = 'pending' | 'completed' | 'skipped';

export interface Todo {
  id?: number;
  title: string;
  date: string;         // YYYY-MM-DD
  time?: string;        // HH:MM
  category?: TodoCategory;
  status: TodoStatus;
  createdAt: string;    // ISO timestamp
  completedAt?: string; // ISO timestamp
}

export const CATEGORY_CONFIG: Record<TodoCategory, { emoji: string; label: string; color: string }> = {
  '성장': { emoji: '💪', label: '성장', color: 'emerald' },
  '회복': { emoji: '🧘', label: '회복', color: 'sky' },
  '관계': { emoji: '🤝', label: '관계', color: 'pink' },
  '창작': { emoji: '🎨', label: '창작', color: 'violet' },
  '유지': { emoji: '🔧', label: '유지', color: 'amber' },
};

/* ════════════════════════════════
   시간대 분류
   ════════════════════════════════ */

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';

export const TIME_SLOT_CONFIG: Record<TimeSlot, { emoji: string; label: string; range: string; order: number }> = {
  morning:   { emoji: '🌅', label: '아침',   range: '06:00~12:00', order: 1 },
  afternoon: { emoji: '☀️', label: '낮',     range: '12:00~18:00', order: 2 },
  evening:   { emoji: '🌆', label: '저녁',   range: '18:00~22:00', order: 3 },
  night:     { emoji: '🌙', label: '밤',     range: '22:00~06:00', order: 4 },
  anytime:   { emoji: '⏱️', label: '언제든', range: '시간 미정',   order: 5 },
};

/** HH:MM 문자열 → 분 단위 숫자 (정렬용) */
export function timeToMinutes(time?: string): number {
  if (!time) return Infinity;
  const [h, m] = time.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return Infinity;
  return h * 60 + m;
}

/** 시간을 시간대로 분류 */
export function getTimeSlot(time?: string): TimeSlot {
  if (!time) return 'anytime';
  const [h] = time.split(':').map(Number);
  if (isNaN(h)) return 'anytime';
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'night';
}

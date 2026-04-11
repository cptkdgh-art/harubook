/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 lib/db / IndexedDB 스키마 (Dexie)
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Local-First 아키텍처의 핵심.
 * 모든 데이터는 브라우저 IndexedDB에 먼저 저장.
 * 로그인 없이도 Todo, 파트너, 메시지 전부 사용 가능.
 */

import Dexie, { type Table } from 'dexie';
import type { Todo } from '@/types/todo';
import type { Partner } from '@/types/partner';
import type { Essay } from '@/types/essay';
import type { Message } from '@/types/message';
import type { AIConfig } from '@/types/ai';
import type { Stats } from '@/types/stats';

/* ════════════════════════════════
   1. DATABASE CLASS
   ════════════════════════════════ */

export class HarubookDB extends Dexie {
  todos!: Table<Todo>;
  partner!: Table<Partner>;
  essays!: Table<Essay>;
  messages!: Table<Message>;
  aiConfig!: Table<AIConfig>;
  stats!: Table<Stats>;

  constructor() {
    super('harubook');

    // v2 스키마 (기존 사용자 호환)
    this.version(2).stores({
      todos:    '++id, date, status, category, createdAt',
      partner:  '++id',
      essays:   '++id, type, periodStart, periodEnd, createdAt',
      messages: '++id, role, createdAt',
      aiConfig: '++id, provider',
    });

    // v3 — stats 테이블 추가
    this.version(3).stores({
      todos:    '++id, date, status, category, createdAt',
      partner:  '++id',
      essays:   '++id, type, periodStart, periodEnd, createdAt',
      messages: '++id, role, createdAt',
      aiConfig: '++id, provider',
      stats:    '++id',
    });
  }
}

/* ════════════════════════════════
   2. SINGLETON INSTANCE
   ════════════════════════════════ */

export const db = new HarubookDB();

/* ════════════════════════════════
   3. HELPER FUNCTIONS
   ════════════════════════════════ */

/** 오늘 날짜 (YYYY-MM-DD) */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}

/** ISO 타임스탬프 */
export function now(): string {
  return new Date().toISOString();
}

/** 오늘의 Todo 목록 */
export async function getTodosForDate(date: string): Promise<Todo[]> {
  return db.todos.where('date').equals(date).toArray();
}

/** 이번 주 Todo (월~일) */
export async function getTodosForWeek(startDate: string, endDate: string): Promise<Todo[]> {
  return db.todos
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

/** 파트너 조회 (1명만) */
export async function getPartner(): Promise<Partner | undefined> {
  return db.partner.toCollection().first();
}

/** 파트너 저장/업데이트 */
export async function savePartner(partner: Omit<Partner, 'id'>): Promise<number> {
  await db.partner.clear();
  return db.partner.add(partner as Partner);
}

/* ════════════════════════════════
   4. AI CONFIG HELPERS
   ════════════════════════════════ */

/** AI 설정 조회 */
export async function getAIConfig(): Promise<AIConfig | undefined> {
  return db.aiConfig.toCollection().first();
}

/** AI 설정 저장 */
export async function saveAIConfig(config: Omit<AIConfig, 'id'>): Promise<number> {
  await db.aiConfig.clear();
  return db.aiConfig.add(config as AIConfig);
}

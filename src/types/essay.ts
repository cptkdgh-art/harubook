/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 types / Essay 타입 정의
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export type EssayType = 'weekly' | 'monthly';

export interface Essay {
  id?: number;
  type: EssayType;
  title: string;
  content: string;
  teaser?: string;        // 다음 화 예고
  periodStart: string;    // YYYY-MM-DD
  periodEnd: string;      // YYYY-MM-DD
  createdAt: string;
}

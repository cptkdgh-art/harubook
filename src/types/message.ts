/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 types / Message 타입 정의
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export type MessageRole = 'user' | 'assistant';

export interface AIAction {
  action: 'add' | 'update' | 'delete' | 'list' | 'complete' | 'chat';
  todos?: Array<{
    title?: string;
    date?: string;
    time?: string;
    category?: string;
    id?: number;
  }>;
  reply: string;
}

export interface Message {
  id?: number;
  role: MessageRole;
  content: string;
  action?: AIAction;
  createdAt: string;
}

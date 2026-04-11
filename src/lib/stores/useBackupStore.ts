/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 stores / useBackupStore
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 수동 백업/복원 상태.
 */

import { create } from 'zustand';
import {
  uploadBackup,
  fetchBackupMeta,
  downloadAndRestore,
  deleteBackup,
  type BackupMeta,
} from '@/lib/firebase/backup';

/* ════════════════════════════════
   STATE
   ════════════════════════════════ */

interface BackupState {
  meta: BackupMeta | null;
  busy: boolean;
  lastAction: 'upload' | 'download' | 'delete' | null;
  error: string | null;
  successMessage: string | null;

  loadMeta: (userId: string) => Promise<void>;
  upload: (userId: string) => Promise<void>;
  download: (userId: string) => Promise<void>;
  remove: (userId: string) => Promise<void>;
  clearFeedback: () => void;
}

/* ════════════════════════════════
   STORE
   ════════════════════════════════ */

export const useBackupStore = create<BackupState>((set) => ({
  meta: null,
  busy: false,
  lastAction: null,
  error: null,
  successMessage: null,

  loadMeta: async (userId) => {
    // 자동 조회는 조용히 실패. fetchBackupMeta 내부에서 이미 try/catch.
    try {
      const meta = await fetchBackupMeta(userId);
      set({ meta });
    } catch {
      set({ meta: null });
    }
  },

  upload: async (userId) => {
    set({ busy: true, error: null, successMessage: null, lastAction: 'upload' });
    try {
      const meta = await uploadBackup(userId);
      set({
        meta,
        busy: false,
        successMessage: `☁️ 백업 완료! ${meta.totalItems}개 항목 저장됨`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '업로드 실패';
      set({ busy: false, error: msg });
    }
  },

  download: async (userId) => {
    set({ busy: true, error: null, successMessage: null, lastAction: 'download' });
    try {
      const meta = await downloadAndRestore(userId);
      set({
        meta,
        busy: false,
        successMessage: `⬇️ 가져오기 완료! ${meta.totalItems}개 항목 복원됨`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '가져오기 실패';
      set({ busy: false, error: msg });
    }
  },

  remove: async (userId) => {
    set({ busy: true, error: null, successMessage: null, lastAction: 'delete' });
    try {
      await deleteBackup(userId);
      set({
        meta: null,
        busy: false,
        successMessage: '🗑️ 클라우드 백업이 삭제됐어요.',
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '삭제 실패';
      set({ busy: false, error: msg });
    }
  },

  clearFeedback: () => set({ error: null, successMessage: null }),
}));

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 lib/backup / 파일 기반 JSON 백업·복원
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 서버 없이 브라우저에서 JSON 파일로 내보내기/가져오기.
 * 프라이버시 완벽 + 타 앱 이주 지원 + 영구 보관.
 *
 * buildBackupPayload 는 firebase/backup.ts 의 것과 동일 포맷 사용.
 */

import { db as localDb } from '@/lib/db/dexie';
import type { BackupPayload } from '@/lib/firebase/backup';

const FILE_VERSION = 3;

/* ════════════════════════════════
   1. 페이로드 수집 (Firestore 없이 로컬만)
   ════════════════════════════════ */

async function collectPayload(): Promise<BackupPayload> {
  const [todos, partner, essays, messages, stats] = await Promise.all([
    localDb.todos.toArray(),
    localDb.partner.toArray(),
    localDb.essays.toArray(),
    localDb.messages.toArray(),
    localDb.stats.toArray(),
  ]);

  return {
    version: FILE_VERSION,
    exportedAt: new Date().toISOString(),
    deviceLabel: 'file-export',
    todos,
    partner,
    essays,
    messages,
    stats,
  };
}

/* ════════════════════════════════
   2. Export — JSON 다운로드
   ════════════════════════════════ */

export async function exportToFile(): Promise<{
  filename: string;
  size: number;
  itemCount: number;
}> {
  const payload = await collectPayload();
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hhmm = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `harubook-backup-${yyyy}-${mm}-${dd}-${hhmm}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const itemCount =
    payload.todos.length +
    payload.partner.length +
    payload.essays.length +
    payload.messages.length +
    payload.stats.length;

  return { filename, size: blob.size, itemCount };
}

/* ════════════════════════════════
   3. Import — 파일에서 복원
   ════════════════════════════════ */

export interface ImportPreview {
  version: number;
  exportedAt: string;
  todos: number;
  partner: number;
  essays: number;
  messages: number;
  stats: number;
}

export async function parseFile(file: File): Promise<{
  payload: BackupPayload;
  preview: ImportPreview;
}> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('파일이 올바른 JSON 형식이 아니에요.');
  }

  const p = parsed as Partial<BackupPayload>;
  if (typeof p.version !== 'number' || !Array.isArray(p.todos)) {
    throw new Error('하루책 백업 파일이 아닌 것 같아요.');
  }

  const payload: BackupPayload = {
    version: p.version,
    exportedAt: p.exportedAt || '알 수 없음',
    deviceLabel: p.deviceLabel || 'file-import',
    todos: p.todos || [],
    partner: p.partner || [],
    essays: p.essays || [],
    messages: p.messages || [],
    stats: p.stats || [],
  };

  return {
    payload,
    preview: {
      version: payload.version,
      exportedAt: payload.exportedAt,
      todos: payload.todos.length,
      partner: payload.partner.length,
      essays: payload.essays.length,
      messages: payload.messages.length,
      stats: payload.stats.length,
    },
  };
}

export async function restoreFromPayload(payload: BackupPayload): Promise<void> {
  await localDb.transaction(
    'rw',
    [localDb.todos, localDb.partner, localDb.essays, localDb.messages, localDb.stats],
    async () => {
      await localDb.todos.clear();
      await localDb.partner.clear();
      await localDb.essays.clear();
      await localDb.messages.clear();
      await localDb.stats.clear();

      if (payload.todos.length) await localDb.todos.bulkAdd(payload.todos as never);
      if (payload.partner.length) await localDb.partner.bulkAdd(payload.partner as never);
      if (payload.essays.length) await localDb.essays.bulkAdd(payload.essays as never);
      if (payload.messages.length) await localDb.messages.bulkAdd(payload.messages as never);
      if (payload.stats.length) await localDb.stats.bulkAdd(payload.stats as never);
    }
  );
}

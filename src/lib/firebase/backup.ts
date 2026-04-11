/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 lib/firebase / 백업 함수
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Firestore에 IndexedDB 전체 스냅샷을 JSON으로 저장/불러오기.
 * 한 유저당 backups/{uid} 문서 1개 — 덮어쓰기 방식.
 */

import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './client';
import { db as localDb } from '@/lib/db/dexie';

/* ════════════════════════════════
   1. 백업 페이로드 타입
   ════════════════════════════════ */

export interface BackupPayload {
  version: number;
  exportedAt: string;
  deviceLabel: string;
  todos: unknown[];
  partner: unknown[];
  essays: unknown[];
  messages: unknown[];
  stats: unknown[];
  // aiConfig 는 의도적으로 제외 — API 키를 클라우드에 올리지 않음
}

export interface BackupMeta {
  version: number;
  updatedAt: string;
  deviceLabel: string;
  totalItems: number;
}

const BACKUP_VERSION = 3;

/* ════════════════════════════════
   2. 디바이스 라벨 추정
   ════════════════════════════════ */

function guessDeviceLabel(): string {
  if (typeof navigator === 'undefined') return '알 수 없는 기기';
  const ua = navigator.userAgent;
  let os = '기기';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac/i.test(ua)) os = 'Mac';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iPhone/iPad';
  else if (/Linux/i.test(ua)) os = 'Linux';
  return os;
}

/* ════════════════════════════════
   3. 로컬 → 페이로드 직렬화
   ════════════════════════════════ */

export async function buildBackupPayload(): Promise<BackupPayload> {
  const [todos, partner, essays, messages, stats] = await Promise.all([
    localDb.todos.toArray(),
    localDb.partner.toArray(),
    localDb.essays.toArray(),
    localDb.messages.toArray(),
    localDb.stats.toArray(),
  ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    deviceLabel: guessDeviceLabel(),
    todos,
    partner,
    essays,
    messages,
    stats,
  };
}

/* ════════════════════════════════
   4. 업로드
   ════════════════════════════════ */

export async function uploadBackup(userId: string): Promise<BackupMeta> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase가 설정되지 않았어요.');
  }
  const fdb = getFirebaseDb();
  if (!fdb) throw new Error('Firestore 초기화 실패');

  const payload = await buildBackupPayload();
  await setDoc(doc(fdb, 'backups', userId), payload);

  return {
    version: payload.version,
    updatedAt: payload.exportedAt,
    deviceLabel: payload.deviceLabel,
    totalItems:
      payload.todos.length +
      payload.partner.length +
      payload.essays.length +
      payload.messages.length +
      payload.stats.length,
  };
}

/* ════════════════════════════════
   5. 메타 조회
   ════════════════════════════════ */

export async function fetchBackupMeta(userId: string): Promise<BackupMeta | null> {
  if (!isFirebaseConfigured) return null;
  const fdb = getFirebaseDb();
  if (!fdb) return null;

  // Firestore DB가 아직 프로비저닝 안 됐거나 오프라인인 경우 조용히 null 반환.
  // loadMeta는 자동 조회라 사용자 명시 액션이 아니므로 에러 노출하지 않음.
  try {
    const snap = await getDoc(doc(fdb, 'backups', userId));
    if (!snap.exists()) return null;

    const data = snap.data() as BackupPayload;
    return {
      version: data.version,
      updatedAt: data.exportedAt,
      deviceLabel: data.deviceLabel,
      totalItems:
        (data.todos?.length ?? 0) +
        (data.partner?.length ?? 0) +
        (data.essays?.length ?? 0) +
        (data.messages?.length ?? 0) +
        (data.stats?.length ?? 0),
    };
  } catch {
    return null;
  }
}

/* ════════════════════════════════
   6. 다운로드 + 로컬 복원
   ════════════════════════════════ */

export async function downloadAndRestore(userId: string): Promise<BackupMeta> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase가 설정되지 않았어요.');
  }
  const fdb = getFirebaseDb();
  if (!fdb) throw new Error('Firestore 초기화 실패');

  const snap = await getDoc(doc(fdb, 'backups', userId));
  if (!snap.exists()) {
    throw new Error('이 계정에 저장된 백업이 없어요.');
  }
  const data = snap.data() as BackupPayload;

  // 트랜잭션으로 전체 교체 (aiConfig 는 제외 — 기존 설정 유지)
  await localDb.transaction(
    'rw',
    [localDb.todos, localDb.partner, localDb.essays, localDb.messages, localDb.stats],
    async () => {
      await localDb.todos.clear();
      await localDb.partner.clear();
      await localDb.essays.clear();
      await localDb.messages.clear();
      await localDb.stats.clear();

      if (data.todos?.length) await localDb.todos.bulkAdd(data.todos as never);
      if (data.partner?.length) await localDb.partner.bulkAdd(data.partner as never);
      if (data.essays?.length) await localDb.essays.bulkAdd(data.essays as never);
      if (data.messages?.length) await localDb.messages.bulkAdd(data.messages as never);
      if (data.stats?.length) await localDb.stats.bulkAdd(data.stats as never);
    }
  );

  return {
    version: data.version,
    updatedAt: data.exportedAt,
    deviceLabel: data.deviceLabel,
    totalItems:
      (data.todos?.length ?? 0) +
      (data.partner?.length ?? 0) +
      (data.essays?.length ?? 0) +
      (data.messages?.length ?? 0) +
      (data.stats?.length ?? 0),
  };
}

/* ════════════════════════════════
   7. 서버 백업 삭제
   ════════════════════════════════ */

export async function deleteBackup(userId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  const fdb = getFirebaseDb();
  if (!fdb) return;
  await deleteDoc(doc(fdb, 'backups', userId));
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 lib/firebase / 인증 함수
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './client';

/* ════════════════════════════════
   에러 메시지 한글화
   ════════════════════════════════ */

function translateAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-email': '이메일 형식이 올바르지 않아요.',
    'auth/user-not-found': '등록되지 않은 이메일이에요.',
    'auth/wrong-password': '비밀번호가 일치하지 않아요.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 틀렸어요.',
    'auth/email-already-in-use': '이미 가입된 이메일이에요.',
    'auth/weak-password': '비밀번호는 6자 이상이어야 해요.',
    'auth/popup-closed-by-user': '로그인 창이 닫혔어요.',
    'auth/popup-blocked': '팝업이 차단됐어요. 브라우저 설정을 확인해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
  };
  return map[code] || '로그인 중 오류가 발생했어요.';
}

/* ════════════════════════════════
   Sign in
   ════════════════════════════════ */

export async function signInWithGoogle(): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase가 설정되지 않았어요. .env.local 을 확인해주세요.');
  }
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth 초기화 실패');

  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code || '';
    throw new Error(translateAuthError(code));
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase가 설정되지 않았어요.');
  }
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth 초기화 실패');

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code || '';
    throw new Error(translateAuthError(code));
  }
}

export async function signInAsGuest(): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase가 설정되지 않았어요.');
  }
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth 초기화 실패');

  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    const code = err.code || '';
    const message = err.message || '';

    // CONFIGURATION_NOT_FOUND / operation-not-allowed / admin-restricted 는
    // 모두 "Firebase Console에서 익명 로그인 미활성화" 상황
    if (
      code === 'auth/operation-not-allowed' ||
      code === 'auth/admin-restricted-operation' ||
      code === 'auth/configuration-not-found' ||
      message.includes('CONFIGURATION_NOT_FOUND')
    ) {
      throw new Error(
        '⚠️ 게스트 로그인이 비활성화 상태입니다.\n' +
        'Firebase Console → Authentication → Sign-in method → 익명을 활성화해주세요.'
      );
    }
    throw new Error(translateAuthError(code));
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase가 설정되지 않았어요.');
  }
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth 초기화 실패');

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code || '';
    throw new Error(translateAuthError(code));
  }
}

/* ════════════════════════════════
   Sign out
   ════════════════════════════════ */

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await fbSignOut(auth);
}

/* ════════════════════════════════
   구독 — 인증 상태 변화
   ════════════════════════════════ */

export function subscribeAuth(callback: (user: User | null) => void): Unsubscribe {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

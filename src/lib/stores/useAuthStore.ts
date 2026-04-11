/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 stores / useAuthStore
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Firebase Auth 상태 스토어.
 * onAuthStateChanged 를 한 번만 구독하고 전역 상태로 노출.
 */

import { create } from 'zustand';
import { getRedirectResult, type User } from 'firebase/auth';
import {
  subscribeAuth,
  signInWithGoogle as fbSignInWithGoogle,
  signInWithEmail as fbSignInWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  signInAsGuest as fbSignInAsGuest,
  signOut as fbSignOut,
} from '@/lib/firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/client';

/* ════════════════════════════════
   STATE
   ════════════════════════════════ */

interface AuthState {
  user: User | null;
  loading: boolean;       // 초기 세션 복원 중
  initialized: boolean;   // onAuthStateChanged 최초 콜백 수신 완료
  error: string | null;

  init: () => void;
  loginGoogle: () => Promise<boolean>;
  loginEmail: (email: string, password: string) => Promise<boolean>;
  signupEmail: (email: string, password: string) => Promise<boolean>;
  loginGuest: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/* ════════════════════════════════
   모듈 스코프 구독 핸들 (중복 방지)
   ════════════════════════════════ */

let unsubscribe: (() => void) | null = null;

/* ════════════════════════════════
   STORE
   ════════════════════════════════ */

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  error: null,

  init: () => {
    if (unsubscribe) return; // 이미 구독 중
    if (!isFirebaseConfigured) {
      set({ loading: false, initialized: true });
      return;
    }
    unsubscribe = subscribeAuth((user) => {
      set({ user, loading: false, initialized: true });
    });

    // redirect 로그인에서 돌아온 경우 결과 처리
    const auth = getFirebaseAuth();
    if (auth) {
      getRedirectResult(auth).catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : '리디렉트 결과 처리 실패';
        set({ error: msg });
      });
    }
  },

  loginGoogle: async () => {
    set({ error: null });
    try {
      await fbSignInWithGoogle();
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '로그인 실패';
      set({ error: msg });
      return false;
    }
  },

  loginEmail: async (email, password) => {
    set({ error: null });
    try {
      await fbSignInWithEmail(email, password);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '로그인 실패';
      set({ error: msg });
      return false;
    }
  },

  signupEmail: async (email, password) => {
    set({ error: null });
    try {
      await fbSignUpWithEmail(email, password);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '가입 실패';
      set({ error: msg });
      return false;
    }
  },

  loginGuest: async () => {
    set({ error: null });
    try {
      await fbSignInAsGuest();
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '게스트 로그인 실패';
      set({ error: msg });
      return false;
    }
  },

  logout: async () => {
    await fbSignOut();
  },

  clearError: () => set({ error: null }),
}));

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/auth / LoginDialog
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 이메일(로그인/가입 토글) + Google 원클릭 로그인.
 */

'use client';

import { useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/client';
import { Loader2, Mail, AlertTriangle, Zap } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'signup';

export function LoginDialog({ open, onClose }: Props) {
  const { loginEmail, signupEmail, loginGuest, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Google 로그인 — 팝업 차단 회피를 위해:
   * 1. 클릭 동기 스택에서 직접 signInWithPopup 호출 (store 경유 X)
   * 2. 팝업 차단 감지 시 signInWithRedirect 로 자동 폴백
   */
  const handleGoogle = async () => {
    setLocalError(null);
    clearError();
    if (!isFirebaseConfigured) {
      setLocalError('Firebase가 설정되지 않았어요.');
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setLocalError('Firebase Auth 초기화 실패');
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      setBusy(true);
      await signInWithPopup(auth, provider);
      setBusy(false);
      onClose();
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code || '';
      setBusy(false);

      // 팝업 차단/실패 시 redirect 방식으로 폴백
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        if (code === 'auth/popup-closed-by-user') {
          setLocalError('로그인 창을 닫으셨어요.');
          return;
        }
        try {
          setBusy(true);
          setLocalError('팝업이 차단돼서 새 페이지로 이동합니다…');
          await signInWithRedirect(auth, provider);
          // 리디렉트되므로 이 줄 이후는 실행 안 됨
        } catch (re: unknown) {
          setBusy(false);
          const rcode = (re as { code?: string })?.code || '';
          setLocalError(
            rcode === 'auth/unauthorized-domain'
              ? '이 도메인이 Firebase 승인 목록에 없어요. (Auth → Settings → 승인된 도메인)'
              : '로그인 실패. 다시 시도해주세요.'
          );
        }
        return;
      }

      if (code === 'auth/unauthorized-domain') {
        setLocalError(
          'localhost가 Firebase 승인 도메인에 없어요. Console → Authentication → Settings → 승인된 도메인에 추가해주세요.'
        );
        return;
      }

      setLocalError('로그인 실패. 다시 시도해주세요.');
    }
  };

  const handleGuest = async () => {
    setLocalError(null);
    clearError();
    setBusy(true);
    const ok = await loginGuest();
    setBusy(false);
    if (ok) onClose();
  };

  const handleEmail = async () => {
    if (!email.trim() || !password.trim()) return;
    setBusy(true);
    const ok =
      mode === 'login'
        ? await loginEmail(email.trim(), password)
        : await signupEmail(email.trim(), password);
    setBusy(false);
    if (ok) onClose();
  };

  const toggleMode = () => {
    clearError();
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
  };

  const configured = isFirebaseConfigured;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl">
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <div className="text-3xl">🌥️</div>
            <h2 className="text-lg font-bold">
              {mode === 'login' ? '로그인' : '계정 만들기'}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              로그인하면 다른 기기에서도 이어쓸 수 있어요
            </p>
          </div>

          {!configured ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 space-y-1">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Firebase 미설정
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                개발자가 <code>.env.local</code> 에 Firebase 키를 넣어야 해요.
              </p>
            </div>
          ) : null}

          {(localError || error) ? (
            <div className="rounded-lg bg-destructive/10 text-destructive text-xs p-2.5">
              {localError || error}
            </div>
          ) : null}

          {/* 게스트 — 메인 CTA */}
          <button
            type="button"
            onClick={handleGuest}
            disabled={busy || !configured}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            게스트로 바로 시작
          </button>
          <p className="text-[10px] text-muted-foreground text-center -mt-3">
            이메일 없이 즉시 백업 시작 · 나중에 정식 계정 전환 가능
          </p>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            또는 계정으로
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy || !configured}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-muted/50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GoogleLogo />
            )}
            Google로 {mode === 'login' ? '로그인' : '가입'}
          </button>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            또는 이메일
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              className="h-10 text-sm"
              autoComplete="email"
              disabled={busy || !configured}
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (6자 이상)"
              className="h-10 text-sm"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={busy || !configured}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleEmail();
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleEmail}
            disabled={busy || !configured || !email.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {mode === 'login' ? '로그인' : '가입하기'}
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary font-semibold hover:underline"
            >
              {mode === 'login' ? '가입하기' : '로그인'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════
   Google 로고 SVG
   ════════════════════════════════ */

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

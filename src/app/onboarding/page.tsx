/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 app/onboarding / 온보딩 3단계 플로우
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePartnerStore } from '@/lib/stores/usePartnerStore';
import { DEFAULT_PARTNERS, THEME_LABELS } from '@/types/partner';
import type { ThemeType, WorldType, Personality } from '@/types/partner';
import { db } from '@/lib/db/dexie';

const THEME_OPTIONS: { key: ThemeType; accent: string }[] = [
  { key: 'auto',   accent: 'border-primary/50 hover:border-primary' },
  { key: 'spring', accent: 'border-pink-300 hover:border-pink-400' },
  { key: 'summer', accent: 'border-sky-300 hover:border-sky-400' },
  { key: 'fall',   accent: 'border-amber-300 hover:border-amber-400' },
  { key: 'winter', accent: 'border-slate-300 hover:border-slate-400' },
];

/* ════════════════════════════════ */

const STEPS = ['theme', 'world', 'partner'] as const;

/* ════════════════════════════════ */

export default function OnboardingPage() {
  const router = useRouter();
  const { createPartner } = usePartnerStore();
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState<ThemeType | null>(null);
  const [world, setWorld] = useState<WorldType | null>(null);
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ── 안전장치 ──
     이미 파트너가 있는 사용자가 실수로 /onboarding 에 재진입하면
     (이전 버전 북마크, 브라우저 뒤로가기 등) createPartner 호출 시
     db.partner.clear() 로 기존 데이터가 덮어써지는 사고를 막는다.
     파트너가 이미 존재하면 즉시 /home 으로 리다이렉트. */
  useEffect(() => {
    let alive = true;
    db.partner
      .toCollection()
      .first()
      .then((p) => {
        if (alive && p) {
          router.replace('/home');
        }
      })
      .catch(() => {
        /* 실패 시 그대로 온보딩 진행 */
      });
    return () => {
      alive = false;
    };
  }, [router]);

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));

  const handleThemeSelect = (t: ThemeType) => {
    setTheme(t);
    // 이름은 사용자가 직접 입력하도록 — 기본값 'auto fill' 제거.
    // 빈 상태에서 placeholder 가 예시를 보여주고, 빈 채로 진행 시
    // handleComplete 에서 DEFAULT_PARTNERS 가 fallback 으로 적용됨.
    setTimeout(next, 300);
  };

  const handleWorldSelect = (w: WorldType) => {
    setWorld(w);
    setTimeout(next, 300);
  };

  const handleComplete = async () => {
    if (submitting) return;

    /* ── state 유실 복구 ──
       AnimatePresence 로 step 전환 중 React state 가 날아가거나,
       브라우저 뒤로가기로 state 리셋된 경우 theme/world 가 null 일 수 있다.
       경고 띄우지 말고 '적절한 기본값' 으로 조용히 fallback 해서
       사용자가 플로우에서 막히지 않게. */
    const finalTheme: ThemeType = theme ?? 'auto';
    const finalWorld: WorldType = world ?? 'modern';

    setSubmitting(true);
    setSubmitError(null);
    try {
      const defaults = DEFAULT_PARTNERS[finalTheme] ?? DEFAULT_PARTNERS.auto;
      await createPartner(
        name.trim() || defaults.name || '파트너',
        finalTheme,
        finalWorld,
        defaults.personality as Personality,
        userName.trim() || undefined
      );
      // 라우팅 — push 가 막히는 엣지 케이스 방어로 replace 사용
      router.replace('/home');
      // 그래도 안 넘어가는 경우 최후의 수단
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname !== '/home') {
          window.location.href = '/home';
        }
      }, 500);
    } catch (err) {
      console.error('[onboarding] createPartner failed:', err);
      const msg =
        err instanceof Error
          ? err.message
          : '설정 저장 중 알 수 없는 오류가 발생했어요';
      setSubmitError(
        `저장 실패: ${msg}\n\n` +
          '시크릿 모드라면 일반 창으로 다시 시도해주세요. IndexedDB 접근이 차단돼 있을 수 있어요.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">

      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step
                ? 'w-8 bg-primary'
                : i < step
                ? 'w-4 bg-primary/40'
                : 'w-4 bg-muted'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 1: Theme ── */}
        {step === 0 && (
          <motion.div
            key="theme"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md text-center space-y-8"
          >
            <div>
              <h1 className="text-2xl font-bold mb-2">어떤 분위기가 좋아요?</h1>
              <p className="text-muted-foreground text-sm">당신의 하루를 기록할 톤을 골라주세요</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {THEME_OPTIONS.map(({ key, accent }) => {
                const meta = THEME_LABELS[key];
                const selected = theme === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleThemeSelect(key)}
                    className={`p-5 rounded-2xl border-2 transition-all duration-300 text-left
                      ${selected
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : `border-border ${accent}`
                      }`}
                  >
                    <div className="text-3xl mb-2">{meta.emoji}</div>
                    <h3 className="font-bold text-base">{meta.label}</h3>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      {meta.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              🌳 나무와 파티클은 현재 달에 자동으로 맞춰지고,<br />
              테마는 UI 색감만 결정해요
            </p>
          </motion.div>
        )}

        {/* ── Step 2: World ── */}
        {step === 1 && (
          <motion.div
            key="world"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md text-center space-y-8"
          >
            <div>
              <h1 className="text-2xl font-bold mb-2">어떤 세계에서 살고 싶어요?</h1>
              <p className="text-muted-foreground text-sm">이야기의 배경이 됩니다</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleWorldSelect('modern')}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left
                  ${world === 'modern'
                    ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/30 scale-[1.02]'
                    : 'border-border hover:border-sky-300'
                  }`}
              >
                <div className="text-4xl mb-3">🏙️</div>
                <h3 className="font-bold text-lg">현대</h3>
                <p className="text-xs text-muted-foreground mt-1">카페, 공원, 도시<br />일상의 기록</p>
              </button>

              <button
                onClick={() => handleWorldSelect('fantasy')}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left
                  ${world === 'fantasy'
                    ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/30 scale-[1.02]'
                    : 'border-border hover:border-violet-300'
                  }`}
              >
                <div className="text-4xl mb-3">🌲</div>
                <h3 className="font-bold text-lg">판타지</h3>
                <p className="text-xs text-muted-foreground mt-1">숲, 마법, 모험<br />동화 같은 이야기</p>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Partner ── */}
        {step === 2 && (
          <motion.div
            key="partner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md text-center space-y-8"
          >
            <div>
              <h1 className="text-2xl font-bold mb-2">파트너의 이름을 지어주세요</h1>
              <p className="text-muted-foreground text-sm">당신의 하루를 함께할 존재입니다</p>
            </div>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                  {theme ? THEME_LABELS[theme].emoji : '🌿'}
                </div>
              </div>

              {/* Partner name input */}
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1.5 text-left ml-1">
                  AI 파트너 이름
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 보리 · 루나 · 서리 · 시아 …"
                    maxLength={10}
                    className="w-full text-center text-lg font-bold py-3 px-4 rounded-2xl
                      bg-card border border-border focus:border-primary focus:outline-none
                      transition-colors placeholder:text-muted-foreground/40"
                  />
                  <span className="absolute right-3 bottom-3 text-[10px] text-muted-foreground">
                    {name.length}/10
                  </span>
                </div>
              </div>

              {/* User name input */}
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1.5 text-left ml-1">
                  당신의 이름 (소설 주인공)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="비워두면 '나'로 불려요"
                    maxLength={12}
                    className="w-full text-center text-base font-medium py-3 px-4 rounded-2xl
                      bg-card border border-border focus:border-primary focus:outline-none
                      transition-colors placeholder:text-muted-foreground/40"
                  />
                  <span className="absolute right-3 bottom-3 text-[10px] text-muted-foreground">
                    {userName.length}/12
                  </span>
                </div>
              </div>

              {/* First greeting preview */}
              <div className="bg-card/50 rounded-2xl p-4 border border-border/50">
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;안녕, <span className="text-primary font-medium">{userName || '너'}</span>.
                  나는 <span className="text-primary font-medium">{name || '...'}</span>이야.
                  {world === 'fantasy'
                    ? ' 이 숲에서 너를 기다리고 있었어.'
                    : ' 오늘 하루를 함께할게.'
                  }&rdquo;
                </p>
              </div>

              {/* Complete button */}
              <button
                onClick={handleComplete}
                disabled={!name.trim() || submitting}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground
                  font-bold text-base hover:bg-primary/90 active:scale-[0.98]
                  disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                {submitting ? '저장 중…' : '시작하기'}
              </button>

              {/* 에러 메시지 */}
              {submitError && (
                <div className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-[11px] text-destructive whitespace-pre-wrap leading-relaxed text-left">
                  ⚠️ {submitError}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/ui / AnimationToggle
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 애니메이션 on/off 빠른 토글.
 * 홈 헤더 우상단, 테마 토글 왼쪽에 작게 배치.
 */

'use client';

import { useEffect } from 'react';
import { Sparkles, SparklesIcon } from 'lucide-react';
import { usePreferenceStore } from '@/lib/stores/usePreferenceStore';

export function AnimationToggle() {
  const { animationsEnabled, init, toggleAnimations } = usePreferenceStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <button
      type="button"
      onClick={toggleAnimations}
      aria-label={animationsEnabled ? '애니메이션 끄기' : '애니메이션 켜기'}
      title={animationsEnabled ? '애니메이션 ON · 탭해서 끄기' : '애니메이션 OFF · 탭해서 켜기'}
      className={`flex items-center gap-1 px-2 py-1.5 rounded-full border transition-colors ${
        animationsEnabled
          ? 'border-primary/40 bg-primary/5 text-primary'
          : 'border-border/60 bg-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {animationsEnabled ? (
        <Sparkles className="w-3.5 h-3.5" />
      ) : (
        <SparklesIcon className="w-3.5 h-3.5 opacity-50" />
      )}
      <span className="text-[10px] font-medium">{animationsEnabled ? 'ON' : 'OFF'}</span>
    </button>
  );
}

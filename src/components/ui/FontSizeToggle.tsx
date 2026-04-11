/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/ui / FontSizeToggle
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 글씨 크기 사이클 토글 (md → lg → xl → sm → md).
 * html font-size 를 조절해서 rem 기반 요소 전체가 비례 스케일.
 */

'use client';

import { useEffect } from 'react';
import { Type } from 'lucide-react';
import {
  usePreferenceStore,
  FONT_SCALE_LABELS,
} from '@/lib/stores/usePreferenceStore';

export function FontSizeToggle() {
  const { fontScale, init, cycleFontScale } = usePreferenceStore();

  useEffect(() => {
    init();
  }, [init]);

  const label = FONT_SCALE_LABELS[fontScale];
  const indicator = fontScale === 'sm' ? '−' : fontScale === 'lg' ? '+' : fontScale === 'xl' ? '++' : '';

  return (
    <button
      type="button"
      onClick={cycleFontScale}
      aria-label={`글씨 크기 (${label}) — 탭해서 다음 크기로`}
      title={`글씨 크기: ${label} · 탭해서 변경`}
      className="flex items-center gap-1 px-2 py-1.5 rounded-full border border-border/60 bg-transparent text-muted-foreground hover:text-foreground transition-colors"
    >
      <Type className="w-3.5 h-3.5" />
      <span className="text-[10px] font-bold">{indicator || 'A'}</span>
    </button>
  );
}

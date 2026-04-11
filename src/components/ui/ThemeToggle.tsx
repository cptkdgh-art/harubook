/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/ui / ThemeToggle
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 5가지 테마 순환 (auto → spring → summer → fall → winter → auto)
 * 한 번 탭으로 다음 테마로.
 */

'use client';

import { usePartnerStore } from '@/lib/stores/usePartnerStore';
import { THEME_LABELS } from '@/types/partner';
import type { ThemeType } from '@/types/partner';

const CYCLE: ThemeType[] = ['auto', 'spring', 'summer', 'fall', 'winter'];

export function ThemeToggle() {
  const { partner, updatePartner } = usePartnerStore();
  if (!partner) return null;

  const current = (partner.theme || 'auto') as ThemeType;
  const cfg = THEME_LABELS[current];

  const handleToggle = async () => {
    const idx = CYCLE.indexOf(current);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    await updatePartner({ theme: next });
  };

  return (
    <button
      onClick={handleToggle}
      aria-label="테마 순환"
      title={`현재: ${cfg.label} — 탭해서 다음 테마로`}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border/60 hover:bg-muted transition-colors"
    >
      <span className="text-sm">{cfg.emoji}</span>
      <span className="text-[11px] font-medium">{cfg.label}</span>
    </button>
  );
}

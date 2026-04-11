/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/ui / ThemeApplier
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 파트너의 테마(4계절 + auto)를 <html data-theme="..."> 로 적용.
 * 기존 'library' 저장 값은 자동으로 'winter'로 마이그레이션.
 * auto 모드는 현재 달 기반으로 실제 계절 계산해서 적용.
 */

'use client';

import { useEffect } from 'react';
import { usePartnerStore } from '@/lib/stores/usePartnerStore';
import { SpringParticles } from './SpringParticles';
import { getCurrentSeason } from '@/lib/seasons';
import type { ThemeType } from '@/types/partner';

/** theme 값이 auto면 현재 계절 반환, 아니면 그대로 */
function resolveThemeColor(theme: ThemeType | undefined): 'spring' | 'summer' | 'fall' | 'winter' {
  if (!theme || theme === 'auto') return getCurrentSeason();
  return theme;
}

export function ThemeApplier() {
  const { partner, loadPartner, updatePartner } = usePartnerStore();

  useEffect(() => {
    loadPartner();
  }, [loadPartner]);

  // 'library' 마이그레이션
  useEffect(() => {
    if (!partner) return;
    const t = partner.theme as unknown as string;
    if (t === 'library') {
      updatePartner({ theme: 'winter' });
    }
  }, [partner, updatePartner]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const resolved = resolveThemeColor(partner?.theme);
    root.setAttribute('data-theme', resolved);
    // dark 모드는 winter 일 때만 (페일 블루 느낌)
    if (resolved === 'winter') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [partner?.theme]);

  // 자정이 지나 월이 바뀌면 auto 모드 사용자의 테마도 자동 갱신
  // → interval로 1분마다 확인 (가벼움)
  useEffect(() => {
    if (partner?.theme !== 'auto') return;
    const tick = setInterval(() => {
      if (typeof document === 'undefined') return;
      const root = document.documentElement;
      const nowResolved = getCurrentSeason();
      if (root.getAttribute('data-theme') !== nowResolved) {
        root.setAttribute('data-theme', nowResolved);
        if (nowResolved === 'winter') root.classList.add('dark');
        else root.classList.remove('dark');
      }
    }, 60_000);
    return () => clearInterval(tick);
  }, [partner?.theme]);

  // 테마가 설정된 파트너가 있으면 파티클 렌더
  // (모든 계절에서 동작 — 파티클 자체는 getCurrentSeason으로 현재 달 기반)
  return partner ? <SpringParticles /> : null;
}

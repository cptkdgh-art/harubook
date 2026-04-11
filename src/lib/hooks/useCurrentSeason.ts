/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 lib/hooks / useCurrentSeason
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 현재 달 기준 계절을 '라이브'로 반환.
 * - 10분마다 체크
 * - 탭 가시성 복귀 시 즉시 체크
 * - 윈도우 포커스 시 즉시 체크
 *
 * 세션이 자정을 넘겨 월이 바뀌더라도 나무/파티클이
 * 새로고침 없이 반응하게 만든다.
 */

'use client';

import { useEffect, useState } from 'react';
import { getCurrentSeason, type SeasonType } from '@/lib/seasons';

const INTERVAL_MS = 10 * 60 * 1000; // 10분

export function useCurrentSeason(): SeasonType {
  const [season, setSeason] = useState<SeasonType>(() => getCurrentSeason());

  useEffect(() => {
    const check = () => {
      const now = getCurrentSeason();
      setSeason((prev) => (prev === now ? prev : now));
    };

    const id = setInterval(check, INTERVAL_MS);

    const onVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) check();
    };
    const onFocus = () => check();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }

    return () => {
      clearInterval(id);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
    };
  }, []);

  return season;
}

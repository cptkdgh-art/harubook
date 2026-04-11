/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/ui / SpringParticles
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 계절별 파티클.
 * 이름은 이전 버전 호환을 위해 SpringParticles 유지하되,
 * 실제로는 현재 계절에 맞는 파티클(벚꽃/물방울/단풍/눈)을 렌더한다.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { SEASON_CONFIG, getCurrentSeason } from '@/lib/seasons';
import { useTodoStore } from '@/lib/stores/useTodoStore';

interface Petal {
  id: number;
  emoji: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  swayDuration: number;
  opacity: number;
}

export function SpringParticles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 파티클도 '캘린더에서 선택한 날짜의 월' 기반 — 나무와 동일한 계절감 유지.
  // 다른 페이지(스토리/설정 등)에서는 selectedDate가 today()로 폴백되어 자연스럽게 현재 달.
  const selectedDate = useTodoStore((s) => s.selectedDate);
  const season = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return getCurrentSeason(isNaN(d.getTime()) ? new Date() : d);
  }, [selectedDate]);
  const cfg = SEASON_CONFIG[season];

  // 파티클 생성 (계절 바뀌면 재생성)
  const petals = useMemo<Petal[]>(() => {
    const arr: Petal[] = [];
    const count = season === 'winter' ? 24 : season === 'fall' ? 16 : 18;
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        emoji: cfg.particles[Math.floor(Math.random() * cfg.particles.length)],
        left: Math.random() * 100,
        // 최소 1.2rem (≈19px) 부터 — 모바일에서도 확실히 보이게
        size: 1.2 + Math.random() * 1.0,
        duration: (season === 'winter' ? 22 : 14) + Math.random() * 16,
        delay: Math.random() * -30,
        swayDuration: 3 + Math.random() * 4,
        // 최소 opacity 0.45 — 흐리지 않게
        opacity: 0.45 + Math.random() * 0.4,
      });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden harubook-petal-layer"
      data-season={season}
      style={{
        // iOS Safari 에서 stacking context 안정화 + GPU layer 강제
        isolation: 'isolate',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        zIndex: 1,
      }}
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className={cfg.spinParticles ? 'harubook-petal' : 'harubook-petal harubook-petal-still'}
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}rem`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s, ${p.swayDuration}s`,
            animationDelay: `${p.delay}s, ${p.delay / 2}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

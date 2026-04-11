/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/tree / HaruTree
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 포인트에 따라 7단계로 자라는 나무.
 * 종(species)은 현재 달의 계절에 따라 자동 결정 — 봄=벚꽃, 여름=야자수,
 * 가을=단풍, 겨울=소나무. SVG 하나로 4종 × 7단계를 표현한다.
 */

'use client';

import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useStatsStore,
  selectStageForDate,
  selectProgressForDate,
  selectNextStageForDate,
  selectEffectivePointsForDate,
  selectSeasonalRawPoints,
} from '@/lib/stores/useStatsStore';
import { SEASON_CONFIG, getCurrentSeason } from '@/lib/seasons';
import { useTodoStore } from '@/lib/stores/useTodoStore';
import { SeasonScenery } from './SeasonScenery';

/* ════════════════════════════════
   TreeSVG — 4종 × 7단계
   treeShape: 'cherry' (봄) / 'maple' (가을) / 'pine' (겨울) / 'palm' (여름)
   ════════════════════════════════ */

export type TreeSpecies = 'cherry' | 'maple' | 'pine' | 'palm';

export function TreeSVG({
  level,
  treeShape = 'cherry',
}: {
  level: number;
  treeShape?: TreeSpecies;
}) {
  const isBroadleaf = treeShape === 'cherry' || treeShape === 'maple';

  return (
    <svg viewBox="0 0 100 120" className="w-full h-full">
      <defs>
        <radialGradient id="haru-leaf" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="var(--haru-leaf-light, #fca5c7)" />
          <stop offset="100%" stopColor="var(--haru-leaf-dark, #e879a8)" />
        </radialGradient>
        <linearGradient id="haru-trunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--haru-trunk-light, #a1724f)" />
          <stop offset="100%" stopColor="var(--haru-trunk-dark, #6b4423)" />
        </linearGradient>
        <radialGradient id="haru-canopy-soft" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="var(--haru-leaf-light, #fca5c7)" stopOpacity="0.95" />
          <stop offset="70%" stopColor="var(--haru-leaf-dark, #e879a8)" stopOpacity="0.92" />
          <stop offset="100%" stopColor="var(--haru-leaf-dark, #e879a8)" stopOpacity="0.7" />
        </radialGradient>
        {/* 단풍잎 심볼 */}
        <symbol id="haru-maple" viewBox="-10 -10 20 20">
          <path d="M0 -9 L2.5 -4 L7.5 -5 L5 -1 L9 2 L3.5 3 L4 8 L1 5 L0 9 L-1 5 L-4 8 L-3.5 3 L-9 2 L-5 -1 L-7.5 -5 L-2.5 -4 Z" />
        </symbol>
        {/* 벚꽃 심볼 — 5장 꽃잎 */}
        <symbol id="haru-blossom5" viewBox="-5 -5 10 10">
          <circle cx="0" cy="-3" r="1.6" />
          <circle cx="2.85" cy="-0.9" r="1.6" />
          <circle cx="1.76" cy="2.43" r="1.6" />
          <circle cx="-1.76" cy="2.43" r="1.6" />
          <circle cx="-2.85" cy="-0.9" r="1.6" />
          <circle cx="0" cy="0" r="0.7" fill="var(--haru-fruit, #fbbf24)" />
        </symbol>
      </defs>

      {/* 땅/언덕 */}
      <ellipse
        cx="50"
        cy="112"
        rx="42"
        ry="6"
        fill="var(--haru-ground, #e7c9d4)"
        opacity="0.6"
      />

      {/* ═════ Lv1: 씨앗 ═════ */}
      {level === 1 && (
        <g>
          <ellipse cx="50" cy="108" rx="6" ry="4" fill="url(#haru-trunk)" />
          <circle cx="50" cy="104" r="4" fill="var(--haru-leaf-dark, #a16455)" />
        </g>
      )}

      {/* ═════ Lv2: 새싹 ═════ */}
      {level === 2 && (
        <g>
          <path d="M50 110 Q50 95 50 85" stroke="url(#haru-trunk)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M50 92 Q42 86 40 78" stroke="var(--haru-leaf-dark, #6dbf5e)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M50 88 Q58 82 60 74" stroke="var(--haru-leaf-dark, #6dbf5e)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="40" cy="77" rx="4" ry="6" fill="url(#haru-leaf)" transform="rotate(-25 40 77)" />
          <ellipse cx="60" cy="73" rx="4" ry="6" fill="url(#haru-leaf)" transform="rotate(25 60 73)" />
        </g>
      )}

      {/* ═════ Lv3: 어린나무 ═════ */}
      {level === 3 && isBroadleaf && (
        <g>
          <rect x="47" y="75" width="6" height="35" rx="2" fill="url(#haru-trunk)" />
          <circle cx="50" cy="65" r="18" fill="url(#haru-leaf)" />
          <circle cx="38" cy="72" r="9" fill="url(#haru-leaf)" opacity="0.85" />
          <circle cx="62" cy="72" r="9" fill="url(#haru-leaf)" opacity="0.85" />
        </g>
      )}
      {level === 3 && treeShape === 'pine' && (
        <g>
          <rect x="47" y="85" width="6" height="25" rx="1" fill="url(#haru-trunk)" />
          <polygon points="50,48 32,88 68,88" fill="url(#haru-leaf)" />
          <circle cx="50" cy="48" r="1.5" fill="var(--haru-blossom, #fff)" />
        </g>
      )}
      {level === 3 && treeShape === 'palm' && (
        <g>
          <path d="M50 110 Q48 85 50 60" stroke="url(#haru-trunk)" strokeWidth="5" strokeLinecap="round" fill="none" />
          <ellipse cx="36" cy="58" rx="15" ry="4" fill="url(#haru-leaf)" transform="rotate(-20 36 58)" />
          <ellipse cx="64" cy="58" rx="15" ry="4" fill="url(#haru-leaf)" transform="rotate(20 64 58)" />
          <ellipse cx="50" cy="48" rx="16" ry="4" fill="url(#haru-leaf)" />
        </g>
      )}

      {/* ═════ Lv4: 나무 ═════ */}
      {level === 4 && isBroadleaf && (
        <g>
          <rect x="45" y="70" width="10" height="40" rx="3" fill="url(#haru-trunk)" />
          <circle cx="50" cy="55" r="24" fill="url(#haru-leaf)" />
          <circle cx="32" cy="66" r="12" fill="url(#haru-leaf)" opacity="0.9" />
          <circle cx="68" cy="66" r="12" fill="url(#haru-leaf)" opacity="0.9" />
          <circle cx="50" cy="38" r="14" fill="url(#haru-leaf)" opacity="0.9" />
        </g>
      )}
      {level === 4 && treeShape === 'pine' && (
        <g>
          <rect x="46" y="80" width="8" height="30" rx="2" fill="url(#haru-trunk)" />
          <polygon points="50,38 28,74 72,74" fill="url(#haru-leaf)" />
          <polygon points="50,58 24,88 76,88" fill="url(#haru-leaf)" opacity="0.95" />
          <circle cx="50" cy="38" r="1.8" fill="var(--haru-blossom, #fff)" />
          <circle cx="34" cy="72" r="1.2" fill="var(--haru-blossom, #fff)" />
        </g>
      )}
      {level === 4 && treeShape === 'palm' && (
        <g>
          <path d="M50 110 Q47 78 50 45" stroke="url(#haru-trunk)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <ellipse cx="30" cy="42" rx="18" ry="5" fill="url(#haru-leaf)" transform="rotate(-20 30 42)" />
          <ellipse cx="70" cy="42" rx="18" ry="5" fill="url(#haru-leaf)" transform="rotate(20 70 42)" />
          <ellipse cx="50" cy="30" rx="20" ry="5" fill="url(#haru-leaf)" />
          <ellipse cx="50" cy="48" rx="16" ry="4" fill="url(#haru-leaf)" opacity="0.85" />
        </g>
      )}

      {/* ═════ Lv5: 꽃나무 ═════ */}
      {level === 5 && isBroadleaf && (
        <g>
          <rect x="44" y="68" width="12" height="42" rx="3" fill="url(#haru-trunk)" />
          <circle cx="50" cy="50" r="28" fill="url(#haru-leaf)" />
          <circle cx="28" cy="62" r="13" fill="url(#haru-leaf)" opacity="0.9" />
          <circle cx="72" cy="62" r="13" fill="url(#haru-leaf)" opacity="0.9" />
          <circle cx="40" cy="42" r="2.5" fill="var(--haru-blossom, #fff)" />
          <circle cx="55" cy="36" r="2.5" fill="var(--haru-blossom, #fff)" />
          <circle cx="62" cy="52" r="2.5" fill="var(--haru-blossom, #fff)" />
          <circle cx="34" cy="58" r="2.5" fill="var(--haru-blossom, #fff)" />
          <circle cx="68" cy="70" r="2.5" fill="var(--haru-blossom, #fff)" />
          <circle cx="48" cy="60" r="2.5" fill="var(--haru-blossom, #fff)" />
        </g>
      )}
      {level === 5 && treeShape === 'pine' && (
        <g>
          <rect x="45" y="76" width="10" height="34" rx="2" fill="url(#haru-trunk)" />
          <polygon points="50,28 24,66 76,66" fill="url(#haru-leaf)" />
          <polygon points="50,48 20,82 80,82" fill="url(#haru-leaf)" opacity="0.95" />
          <circle cx="50" cy="28" r="2" fill="var(--haru-blossom, #fff)" />
          <circle cx="34" cy="58" r="1.8" fill="var(--haru-blossom, #fff)" />
          <circle cx="66" cy="58" r="1.8" fill="var(--haru-blossom, #fff)" />
          <circle cx="28" cy="76" r="1.5" fill="var(--haru-blossom, #fff)" />
          <circle cx="72" cy="76" r="1.5" fill="var(--haru-blossom, #fff)" />
        </g>
      )}
      {level === 5 && treeShape === 'palm' && (
        <g>
          <path d="M50 110 Q46 76 50 38" stroke="url(#haru-trunk)" strokeWidth="7" strokeLinecap="round" fill="none" />
          <ellipse cx="26" cy="36" rx="20" ry="5" fill="url(#haru-leaf)" transform="rotate(-20 26 36)" />
          <ellipse cx="74" cy="36" rx="20" ry="5" fill="url(#haru-leaf)" transform="rotate(20 74 36)" />
          <ellipse cx="50" cy="24" rx="22" ry="5" fill="url(#haru-leaf)" />
          <ellipse cx="32" cy="48" rx="18" ry="4" fill="url(#haru-leaf)" opacity="0.85" transform="rotate(-10 32 48)" />
          <ellipse cx="68" cy="48" rx="18" ry="4" fill="url(#haru-leaf)" opacity="0.85" transform="rotate(10 68 48)" />
          <circle cx="48" cy="40" r="2" fill="var(--haru-blossom, #fff)" />
          <circle cx="54" cy="42" r="2" fill="var(--haru-blossom, #fff)" />
        </g>
      )}

      {/* ═════ Lv6: 열매 ═════ */}
      {level === 6 && isBroadleaf && (
        <g>
          <rect x="43" y="65" width="14" height="45" rx="3" fill="url(#haru-trunk)" />
          <circle cx="50" cy="48" r="30" fill="url(#haru-leaf)" />
          <circle cx="25" cy="58" r="14" fill="url(#haru-leaf)" opacity="0.9" />
          <circle cx="75" cy="58" r="14" fill="url(#haru-leaf)" opacity="0.9" />
          <circle cx="38" cy="52" r="3.5" fill="var(--haru-fruit, #e53e3e)" />
          <circle cx="58" cy="44" r="3.5" fill="var(--haru-fruit, #e53e3e)" />
          <circle cx="66" cy="60" r="3.5" fill="var(--haru-fruit, #e53e3e)" />
          <circle cx="44" cy="68" r="3.5" fill="var(--haru-fruit, #e53e3e)" />
          <circle cx="50" cy="38" r="3.5" fill="var(--haru-fruit, #e53e3e)" />
        </g>
      )}
      {level === 6 && treeShape === 'pine' && (
        <g>
          <rect x="44" y="72" width="12" height="38" rx="3" fill="url(#haru-trunk)" />
          <polygon points="50,22 22,58 78,58" fill="url(#haru-leaf)" />
          <polygon points="50,42 20,72 80,72" fill="url(#haru-leaf)" opacity="0.95" />
          <polygon points="50,60 18,86 82,86" fill="url(#haru-leaf)" />
          <circle cx="40" cy="52" r="2" fill="var(--haru-fruit, #dc2626)" />
          <circle cx="60" cy="50" r="2" fill="var(--haru-fruit, #dc2626)" />
          <circle cx="32" cy="68" r="2" fill="var(--haru-fruit, #dc2626)" />
          <circle cx="68" cy="68" r="2" fill="var(--haru-fruit, #dc2626)" />
        </g>
      )}
      {level === 6 && treeShape === 'palm' && (
        <g>
          <path d="M50 110 Q45 74 50 32" stroke="url(#haru-trunk)" strokeWidth="7" strokeLinecap="round" fill="none" />
          <ellipse cx="24" cy="32" rx="22" ry="6" fill="url(#haru-leaf)" transform="rotate(-20 24 32)" />
          <ellipse cx="76" cy="32" rx="22" ry="6" fill="url(#haru-leaf)" transform="rotate(20 76 32)" />
          <ellipse cx="50" cy="18" rx="24" ry="6" fill="url(#haru-leaf)" />
          <ellipse cx="30" cy="46" rx="20" ry="5" fill="url(#haru-leaf)" opacity="0.85" transform="rotate(-12 30 46)" />
          <ellipse cx="70" cy="46" rx="20" ry="5" fill="url(#haru-leaf)" opacity="0.85" transform="rotate(12 70 46)" />
          <circle cx="46" cy="36" r="3" fill="var(--haru-fruit, #92400e)" />
          <circle cx="54" cy="38" r="3" fill="var(--haru-fruit, #92400e)" />
          <circle cx="50" cy="42" r="2.5" fill="var(--haru-fruit, #92400e)" />
        </g>
      )}

      {/* ═════ Lv7 거목: 벚꽃나무 ═════ */}
      {level >= 7 && treeShape === 'cherry' && (
        <g>
          {/* V-split 밑줄기 */}
          <path d="M43 110 L43 78 Q44 68 32 52" stroke="url(#haru-trunk)" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M57 110 L57 78 Q56 68 68 52" stroke="url(#haru-trunk)" strokeWidth="7" strokeLinecap="round" fill="none" />
          <rect x="43" y="78" width="14" height="34" fill="url(#haru-trunk)" />
          {/* 가지 디테일 */}
          <path d="M50 70 Q58 58 70 48" stroke="url(#haru-trunk)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
          <path d="M50 70 Q42 58 30 48" stroke="url(#haru-trunk)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
          <path d="M50 62 Q50 50 50 40" stroke="url(#haru-trunk)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

          {/* 벚꽃 캐노피 클러스터 */}
          <circle cx="50" cy="38" r="26" fill="url(#haru-canopy-soft)" />
          <circle cx="26" cy="48" r="17" fill="url(#haru-canopy-soft)" />
          <circle cx="74" cy="48" r="17" fill="url(#haru-canopy-soft)" />
          <circle cx="34" cy="22" r="15" fill="url(#haru-canopy-soft)" />
          <circle cx="66" cy="22" r="15" fill="url(#haru-canopy-soft)" />
          <circle cx="18" cy="34" r="12" fill="url(#haru-canopy-soft)" opacity="0.9" />
          <circle cx="82" cy="34" r="12" fill="url(#haru-canopy-soft)" opacity="0.9" />
          <circle cx="50" cy="14" r="11" fill="url(#haru-canopy-soft)" opacity="0.95" />

          {/* 5장 꽃잎 포인트 */}
          <g fill="var(--haru-blossom, #fff)">
            <use href="#haru-blossom5" x="28" y="24" width="8" height="8" />
            <use href="#haru-blossom5" x="62" y="20" width="8" height="8" />
            <use href="#haru-blossom5" x="44" y="14" width="7" height="7" />
            <use href="#haru-blossom5" x="40" y="40" width="7" height="7" />
            <use href="#haru-blossom5" x="58" y="44" width="7" height="7" />
            <use href="#haru-blossom5" x="20" y="38" width="6" height="6" />
            <use href="#haru-blossom5" x="72" y="38" width="6" height="6" />
            <use href="#haru-blossom5" x="48" y="30" width="6" height="6" />
          </g>

          {/* 떨어지는 꽃잎 */}
          <g fill="var(--haru-leaf-light, #fca5c7)" opacity="0.85">
            <ellipse cx="14" cy="72" rx="1.8" ry="0.8" transform="rotate(30 14 72)" />
            <ellipse cx="86" cy="78" rx="1.8" ry="0.8" transform="rotate(-30 86 78)" />
            <ellipse cx="22" cy="92" rx="1.5" ry="0.7" transform="rotate(45 22 92)" />
            <ellipse cx="78" cy="96" rx="1.5" ry="0.7" transform="rotate(-45 78 96)" />
            <ellipse cx="10" cy="100" rx="1.3" ry="0.6" transform="rotate(20 10 100)" />
          </g>

          {/* 바닥 꽃잎 */}
          <ellipse cx="50" cy="112" rx="38" ry="3" fill="var(--haru-leaf-light, #fca5c7)" opacity="0.4" />
        </g>
      )}

      {/* ═════ Lv7 거목: 단풍나무 ═════ */}
      {level >= 7 && treeShape === 'maple' && (
        <g>
          {/* 두꺼운 밑동 + 가지 */}
          <rect x="41" y="58" width="18" height="52" rx="3" fill="url(#haru-trunk)" />
          <path d="M50 62 L28 38" stroke="url(#haru-trunk)" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 62 L72 38" stroke="url(#haru-trunk)" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 58 L50 30" stroke="url(#haru-trunk)" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 46 L34 22" stroke="url(#haru-trunk)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
          <path d="M50 46 L66 22" stroke="url(#haru-trunk)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />

          {/* 잎 덩어리 */}
          <circle cx="50" cy="40" r="28" fill="url(#haru-canopy-soft)" />
          <circle cx="24" cy="48" r="15" fill="url(#haru-canopy-soft)" />
          <circle cx="76" cy="48" r="15" fill="url(#haru-canopy-soft)" />
          <circle cx="32" cy="22" r="13" fill="url(#haru-canopy-soft)" />
          <circle cx="68" cy="22" r="13" fill="url(#haru-canopy-soft)" />

          {/* 단풍잎 악센트 */}
          <g fill="var(--haru-fruit, #dc2626)">
            <use href="#haru-maple" x="24" y="14" width="16" height="16" />
            <use href="#haru-maple" x="60" y="14" width="16" height="16" />
            <use href="#haru-maple" x="42" y="24" width="14" height="14" />
            <use href="#haru-maple" x="14" y="40" width="12" height="12" />
            <use href="#haru-maple" x="74" y="40" width="12" height="12" />
            <use href="#haru-maple" x="36" y="44" width="12" height="12" />
            <use href="#haru-maple" x="52" y="50" width="12" height="12" />
          </g>

          {/* 바람에 날리는 잎 */}
          <g fill="var(--haru-leaf-light, #fdba74)" opacity="0.8">
            <use href="#haru-maple" x="8" y="72" width="7" height="7" />
            <use href="#haru-maple" x="84" y="78" width="7" height="7" />
            <use href="#haru-maple" x="12" y="94" width="6" height="6" />
          </g>

          {/* 바닥 낙엽 */}
          <ellipse cx="50" cy="112" rx="40" ry="3" fill="var(--haru-fruit, #dc2626)" opacity="0.35" />
          <use href="#haru-maple" x="20" y="108" width="6" height="6" fill="var(--haru-fruit, #dc2626)" opacity="0.7" />
          <use href="#haru-maple" x="72" y="108" width="6" height="6" fill="var(--haru-leaf-light, #fdba74)" opacity="0.7" />
          <use href="#haru-maple" x="44" y="110" width="5" height="5" fill="var(--haru-fruit, #dc2626)" opacity="0.6" />
        </g>
      )}

      {/* ═════ Lv7 거목: 소나무 ═════ */}
      {level >= 7 && treeShape === 'pine' && (
        <g>
          <rect x="45" y="78" width="10" height="34" rx="2" fill="url(#haru-trunk)" />
          <rect x="46" y="80" width="2" height="30" fill="var(--haru-trunk-dark, #44403c)" opacity="0.4" />

          {/* 4층 삼각 */}
          <polygon points="50,10 32,34 68,34" fill="url(#haru-leaf)" />
          <polygon points="50,26 24,52 76,52" fill="url(#haru-leaf)" opacity="0.96" />
          <polygon points="50,44 18,70 82,70" fill="url(#haru-leaf)" opacity="0.94" />
          <polygon points="50,60 14,88 86,88" fill="url(#haru-leaf)" />

          {/* 솔잎 텍스쳐 */}
          <g stroke="var(--haru-trunk-dark, #1e293b)" strokeWidth="0.3" opacity="0.25">
            <line x1="40" y1="34" x2="46" y2="30" />
            <line x1="60" y1="34" x2="54" y2="30" />
            <line x1="32" y1="52" x2="40" y2="46" />
            <line x1="68" y1="52" x2="60" y2="46" />
            <line x1="28" y1="70" x2="36" y2="62" />
            <line x1="72" y1="70" x2="64" y2="62" />
            <line x1="22" y1="88" x2="32" y2="78" />
            <line x1="78" y1="88" x2="68" y2="78" />
          </g>

          {/* 눈 덮인 가장자리 */}
          <path d="M32 34 L40 32 L50 30 L60 32 L68 34 L66 34.5 L50 32 L34 34.5 Z" fill="var(--haru-blossom, #fff)" opacity="0.95" />
          <path d="M24 52 L34 49 L50 46 L66 49 L76 52 L74 52.5 L50 48 L26 52.5 Z" fill="var(--haru-blossom, #fff)" opacity="0.92" />
          <path d="M18 70 L30 66 L50 62 L70 66 L82 70 L80 70.5 L50 64 L20 70.5 Z" fill="var(--haru-blossom, #fff)" opacity="0.88" />
          <path d="M14 88 L28 83 L50 78 L72 83 L86 88 L84 88.5 L50 80 L16 88.5 Z" fill="var(--haru-blossom, #fff)" opacity="0.85" />

          {/* 솔방울 */}
          <ellipse cx="36" cy="56" rx="1.5" ry="2.5" fill="var(--haru-fruit, #78350f)" />
          <ellipse cx="64" cy="56" rx="1.5" ry="2.5" fill="var(--haru-fruit, #78350f)" />
          <ellipse cx="50" cy="40" rx="1.3" ry="2" fill="var(--haru-fruit, #78350f)" />

          {/* 바닥 눈 */}
          <ellipse cx="50" cy="112" rx="42" ry="3.5" fill="var(--haru-blossom, #fff)" opacity="0.55" />
          <circle cx="20" cy="108" r="1.2" fill="var(--haru-blossom, #fff)" />
          <circle cx="80" cy="108" r="1.2" fill="var(--haru-blossom, #fff)" />
          <circle cx="14" cy="96" r="1" fill="var(--haru-blossom, #fff)" opacity="0.8" />
          <circle cx="86" cy="98" r="1" fill="var(--haru-blossom, #fff)" opacity="0.8" />
        </g>
      )}

      {/* ═════ Lv7 거목: 야자수 ═════ */}
      {level >= 7 && treeShape === 'palm' && (
        <g>
          {/* 커브 있는 긴 줄기 */}
          <path d="M46 112 Q42 86 48 60 Q52 40 50 26" stroke="url(#haru-trunk)" strokeWidth="9" strokeLinecap="round" fill="none" />
          {/* 줄기 마디 */}
          <g stroke="var(--haru-trunk-dark, #44403c)" strokeWidth="0.6" opacity="0.45" fill="none">
            <path d="M43 100 Q46 99 49 100" />
            <path d="M43 88 Q46 87 49 88" />
            <path d="M44 76 Q47 75 50 76" />
            <path d="M45 62 Q48 61 51 62" />
            <path d="M47 48 Q50 47 52 48" />
            <path d="M49 34 Q52 33 53 34" />
          </g>

          {/* 7개 프론드 */}
          <g fill="url(#haru-leaf)">
            <path d="M50 26 Q32 18 10 14 Q22 22 40 28 Q28 30 14 34 Q30 30 50 28 Z" />
            <path d="M50 26 Q68 18 90 14 Q78 22 60 28 Q72 30 86 34 Q70 30 50 28 Z" />
            <path d="M50 22 Q40 6 28 2 Q34 14 42 22 Q32 18 20 20 Q36 22 50 26 Z" />
            <path d="M50 22 Q60 6 72 2 Q66 14 58 22 Q68 18 80 20 Q64 22 50 26 Z" />
            <path d="M50 26 Q28 32 8 44 Q26 40 42 34 Q32 44 24 58 Q38 40 50 30 Z" opacity="0.92" />
            <path d="M50 26 Q72 32 92 44 Q74 40 58 34 Q68 44 76 58 Q62 40 50 30 Z" opacity="0.92" />
            <path d="M50 28 Q50 10 44 -2 Q48 14 50 24 Q52 14 56 -2 Q50 10 50 28 Z" opacity="0.95" />
          </g>

          {/* 잎 스파인 */}
          <g stroke="var(--haru-leaf-dark, #059669)" strokeWidth="0.8" opacity="0.6" fill="none">
            <path d="M50 26 Q30 24 12 20" />
            <path d="M50 26 Q70 24 88 20" />
            <path d="M50 22 Q42 12 30 4" />
            <path d="M50 22 Q58 12 70 4" />
            <path d="M50 27 Q30 34 12 46" />
            <path d="M50 27 Q70 34 88 46" />
          </g>

          {/* 코코넛 클러스터 */}
          <g fill="var(--haru-fruit, #78350f)">
            <circle cx="44" cy="34" r="3.2" />
            <circle cx="52" cy="32" r="3.2" />
            <circle cx="48" cy="38" r="3" />
            <circle cx="56" cy="36" r="2.8" />
          </g>
          <g fill="var(--haru-trunk-dark, #44403c)" opacity="0.5">
            <circle cx="44" cy="34" r="0.8" />
            <circle cx="52" cy="32" r="0.8" />
            <circle cx="48" cy="38" r="0.7" />
            <circle cx="56" cy="36" r="0.7" />
          </g>

          {/* 모래 + 바다 힌트 */}
          <ellipse cx="50" cy="112" rx="44" ry="3.5" fill="var(--haru-leaf-light, #fde68a)" opacity="0.45" />
          <path d="M6 106 Q14 104 20 106 T34 106" stroke="var(--haru-leaf-dark, #059669)" strokeWidth="0.8" fill="none" opacity="0.5" />
          <path d="M66 106 Q74 104 80 106 T94 106" stroke="var(--haru-leaf-dark, #059669)" strokeWidth="0.8" fill="none" opacity="0.5" />
        </g>
      )}
    </svg>
  );
}

/* ════════════════════════════════
   HaruTree — 포인트 바 + 나무
   ════════════════════════════════ */

export function HaruTree() {
  const { stats, loadStats, levelUpFlash, clearLevelUp, recentGains } = useStatsStore();

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (levelUpFlash) {
      const t = setTimeout(clearLevelUp, 2800);
      return () => clearTimeout(t);
    }
  }, [levelUpFlash, clearLevelUp]);

  // 시즌 단위로 단계가 갱신됨 — 캘린더에서 보고 있는 날짜의 시즌 기준
  const selectedDate = useTodoStore((s) => s.selectedDate);
  const stage = selectStageForDate(stats, selectedDate);
  const next = selectNextStageForDate(stats, selectedDate);
  const progress = selectProgressForDate(stats, selectedDate);
  const effectivePoints = selectEffectivePointsForDate(stats, selectedDate);
  const seasonalRaw = selectSeasonalRawPoints(stats, selectedDate);
  const toNext = next ? Math.max(0, next.minPoints - effectivePoints) : 0;

  // 나무는 '캘린더에서 선택한 날짜의 월' 기반.
  // 사용자가 캘린더를 좌우로 넘기면 그 달의 계절 나무로 즉시 바뀜.
  const season = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return getCurrentSeason(isNaN(d.getTime()) ? new Date() : d);
  }, [selectedDate]);
  const seasonCfg = SEASON_CONFIG[season];
  const treeStyle = useMemo<React.CSSProperties & Record<`--${string}`, string>>(
    () => ({
      '--haru-leaf-light': seasonCfg.leafColors.light,
      '--haru-leaf-dark': seasonCfg.leafColors.dark,
      '--haru-trunk-light': seasonCfg.trunkColors.light,
      '--haru-trunk-dark': seasonCfg.trunkColors.dark,
      '--haru-blossom': seasonCfg.blossomColor,
      '--haru-fruit': seasonCfg.fruitColor,
    }),
    [seasonCfg]
  );

  return (
    <div
      className="relative rounded-3xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 overflow-hidden haru-tree-box"
      data-season={season}
      style={treeStyle}
    >
      {/* 시즌 배경 풍경 (디오라마) */}
      <div className="absolute inset-0 opacity-25 mix-blend-multiply dark:opacity-20 dark:mix-blend-screen pointer-events-none">
        <SeasonScenery season={season} />
      </div>

      {/* 레벨업 flash */}
      <AnimatePresence>
        {levelUpFlash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          >
            <div className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent drop-shadow-lg">
              ✨ LEVEL UP ✨
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-center gap-4">
        {/* 나무 SVG */}
        <motion.div
          key={`${stage.level}-${season}`}
          initial={{ scale: 0.7, opacity: 0.5, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14 }}
          className="relative w-20 h-24 flex-shrink-0"
        >
          <TreeSVG level={stage.level} treeShape={seasonCfg.treeShape} />

          {/* 포인트 게인 */}
          <AnimatePresence>
            {recentGains.map((g) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: 1, y: -40, scale: 1.1 }}
                exit={{ opacity: 0, y: -60 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className="absolute left-1/2 top-0 -translate-x-1/2 text-primary font-black text-lg pointer-events-none drop-shadow-md"
              >
                +{g.amount}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold">{stage.name}</span>
              <span className="text-[10px] text-muted-foreground">Lv.{stage.level}</span>
              <span className="text-[10px] text-muted-foreground/70">
                · {seasonCfg.emoji} {new Date(selectedDate + 'T00:00:00').getMonth() + 1}월
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono" title={`이번 시즌 ${seasonalRaw}P + 이월 ${effectivePoints - seasonalRaw}P`}>
              {effectivePoints.toLocaleString()}P
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
            {stage.description}
          </p>

          {/* 진행 바 */}
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground/80 mt-1">
            {next ? `다음 ${next.name}까지 ${toNext}P` : '최고 단계 달성!'}
          </p>
        </div>
      </div>
    </div>
  );
}

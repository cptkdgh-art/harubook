/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/tree / SeasonScenery
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 시즌별 배경 디오라마 SVG.
 * HaruTree 카드의 absolute 레이어로 깔려서, 메인 나무 뒤에 분위기 풍경을 보여준다.
 * 봄: 벚꽃밭 / 여름: 해변+야자수 / 가을: 단풍 숲 / 겨울: 설산+눈사람
 *
 * 모든 색은 CSS 변수(var(--haru-leaf-light) 등)를 따라가서
 * HaruTree의 시즌 컨텍스트와 자동 동기화된다.
 */

'use client';

import type { SeasonType } from '@/lib/seasons';

interface Props {
  season: SeasonType;
  className?: string;
}

export function SeasonScenery({ season, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden
    >
      {season === 'spring' && <SpringScene />}
      {season === 'summer' && <SummerScene />}
      {season === 'fall' && <FallScene />}
      {season === 'winter' && <WinterScene />}
    </svg>
  );
}

/* ════════════════════════════════
   봄 — 벚꽃밭 + 분홍 산등성이
   ════════════════════════════════ */
function SpringScene() {
  return (
    <g>
      {/* 하늘 그라디언트 느낌 (얇은 가로 줄) */}
      <rect x="0" y="0" width="400" height="200" fill="var(--haru-leaf-light, #fca5c7)" opacity="0.08" />
      {/* 멀리 산 두 겹 */}
      <path
        d="M0 140 Q60 100 120 115 T240 105 T360 120 L400 110 L400 200 L0 200 Z"
        fill="var(--haru-leaf-light, #fca5c7)"
        opacity="0.35"
      />
      <path
        d="M0 160 Q80 130 160 145 T320 140 L400 150 L400 200 L0 200 Z"
        fill="var(--haru-leaf-dark, #ec4899)"
        opacity="0.25"
      />
      {/* 작은 벚꽃나무 1 (좌하) */}
      <g opacity="0.55">
        <rect x="38" y="150" width="4" height="32" fill="var(--haru-trunk-dark, #6b4423)" />
        <circle cx="40" cy="148" r="14" fill="var(--haru-leaf-light, #fca5c7)" />
        <circle cx="30" cy="152" r="9" fill="var(--haru-leaf-light, #fca5c7)" />
        <circle cx="50" cy="152" r="9" fill="var(--haru-leaf-light, #fca5c7)" />
      </g>
      {/* 작은 벚꽃나무 2 (우하) */}
      <g opacity="0.5">
        <rect x="348" y="145" width="4" height="38" fill="var(--haru-trunk-dark, #6b4423)" />
        <circle cx="350" cy="142" r="16" fill="var(--haru-leaf-light, #fca5c7)" />
        <circle cx="338" cy="148" r="10" fill="var(--haru-leaf-light, #fca5c7)" />
        <circle cx="362" cy="148" r="10" fill="var(--haru-leaf-light, #fca5c7)" />
      </g>
      {/* 태양 */}
      <circle cx="320" cy="40" r="14" fill="var(--haru-blossom, #fff)" opacity="0.55" />
      <circle cx="320" cy="40" r="20" fill="var(--haru-blossom, #fff)" opacity="0.2" />
      {/* 흩날리는 점들 */}
      <g fill="var(--haru-blossom, #fff)" opacity="0.6">
        <circle cx="180" cy="50" r="1.6" />
        <circle cx="220" cy="70" r="1.2" />
        <circle cx="100" cy="80" r="1.4" />
        <circle cx="280" cy="65" r="1.3" />
        <circle cx="160" cy="95" r="1" />
        <circle cx="240" cy="50" r="1" />
      </g>
    </g>
  );
}

/* ════════════════════════════════
   여름 — 해변 + 야자수 + 파도 + 태양
   ════════════════════════════════ */
function SummerScene() {
  return (
    <g>
      {/* 하늘 톤 */}
      <rect x="0" y="0" width="400" height="200" fill="var(--haru-leaf-light, #6ee7b7)" opacity="0.06" />
      {/* 멀리 수평선 (바다) */}
      <rect x="0" y="120" width="400" height="40" fill="var(--haru-leaf-dark, #059669)" opacity="0.2" />
      <rect x="0" y="120" width="400" height="20" fill="var(--haru-leaf-light, #6ee7b7)" opacity="0.25" />
      {/* 파도 라인 */}
      <g stroke="var(--haru-blossom, #fef3c7)" strokeWidth="0.8" fill="none" opacity="0.55">
        <path d="M0 130 Q40 126 80 130 T160 130 T240 130 T320 130 T400 130" />
        <path d="M0 142 Q40 138 80 142 T160 142 T240 142 T320 142 T400 142" />
        <path d="M0 152 Q40 148 80 152 T160 152 T240 152 T320 152 T400 152" />
      </g>
      {/* 백사장 (앞쪽) */}
      <path
        d="M0 160 Q100 156 200 162 T400 160 L400 200 L0 200 Z"
        fill="var(--haru-blossom, #fef3c7)"
        opacity="0.45"
      />
      {/* 야자수 (좌측) */}
      <g opacity="0.55">
        <path
          d="M50 195 Q46 165 52 130"
          stroke="var(--haru-trunk-dark, #44403c)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="38" cy="128" rx="14" ry="3" fill="var(--haru-leaf-dark, #059669)" transform="rotate(-25 38 128)" />
        <ellipse cx="66" cy="128" rx="14" ry="3" fill="var(--haru-leaf-dark, #059669)" transform="rotate(25 66 128)" />
        <ellipse cx="52" cy="120" rx="15" ry="3" fill="var(--haru-leaf-dark, #059669)" />
        <circle cx="51" cy="134" r="1.5" fill="var(--haru-fruit, #78350f)" />
        <circle cx="55" cy="134" r="1.5" fill="var(--haru-fruit, #78350f)" />
      </g>
      {/* 야자수 (우측, 살짝 더 큰) */}
      <g opacity="0.5">
        <path
          d="M348 195 Q344 162 352 122"
          stroke="var(--haru-trunk-dark, #44403c)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="332" cy="120" rx="16" ry="3.5" fill="var(--haru-leaf-dark, #059669)" transform="rotate(-25 332 120)" />
        <ellipse cx="368" cy="120" rx="16" ry="3.5" fill="var(--haru-leaf-dark, #059669)" transform="rotate(25 368 120)" />
        <ellipse cx="350" cy="112" rx="17" ry="3.5" fill="var(--haru-leaf-dark, #059669)" />
        <ellipse cx="338" cy="130" rx="14" ry="3" fill="var(--haru-leaf-dark, #059669)" opacity="0.85" transform="rotate(-12 338 130)" />
        <ellipse cx="362" cy="130" rx="14" ry="3" fill="var(--haru-leaf-dark, #059669)" opacity="0.85" transform="rotate(12 362 130)" />
      </g>
      {/* 태양 (밝은 흰빛) */}
      <circle cx="200" cy="48" r="18" fill="var(--haru-blossom, #fef3c7)" opacity="0.7" />
      <circle cx="200" cy="48" r="26" fill="var(--haru-blossom, #fef3c7)" opacity="0.2" />
      {/* 갈매기 */}
      <g stroke="var(--haru-trunk-dark, #44403c)" strokeWidth="1" fill="none" opacity="0.5">
        <path d="M120 60 Q124 56 128 60 Q132 56 136 60" />
        <path d="M260 80 Q263 77 266 80 Q269 77 272 80" />
      </g>
    </g>
  );
}

/* ════════════════════════════════
   가을 — 단풍 숲 + 노을
   ════════════════════════════════ */
function FallScene() {
  return (
    <g>
      <rect x="0" y="0" width="400" height="200" fill="var(--haru-leaf-light, #fdba74)" opacity="0.08" />
      {/* 멀리 단풍 산 두 겹 */}
      <path
        d="M0 130 Q70 90 140 105 T280 95 T400 110 L400 200 L0 200 Z"
        fill="var(--haru-fruit, #dc2626)"
        opacity="0.25"
      />
      <path
        d="M0 150 Q90 120 180 135 T360 130 L400 140 L400 200 L0 200 Z"
        fill="var(--haru-leaf-light, #fdba74)"
        opacity="0.4"
      />
      {/* 흩어진 단풍나무 실루엣들 */}
      <g opacity="0.55">
        {/* 좌측 작은 나무 */}
        <rect x="48" y="155" width="4" height="30" fill="var(--haru-trunk-dark, #451a03)" />
        <circle cx="50" cy="152" r="14" fill="var(--haru-leaf-dark, #ea580c)" />
        <circle cx="40" cy="156" r="9" fill="var(--haru-fruit, #dc2626)" />
        <circle cx="60" cy="156" r="9" fill="var(--haru-leaf-light, #fdba74)" />
      </g>
      <g opacity="0.5">
        {/* 우측 큰 나무 */}
        <rect x="340" y="148" width="5" height="38" fill="var(--haru-trunk-dark, #451a03)" />
        <circle cx="342" cy="144" r="18" fill="var(--haru-fruit, #dc2626)" />
        <circle cx="328" cy="152" r="11" fill="var(--haru-leaf-dark, #ea580c)" />
        <circle cx="356" cy="152" r="11" fill="var(--haru-leaf-light, #fdba74)" />
      </g>
      {/* 중간 작은 나무 */}
      <g opacity="0.4">
        <rect x="200" y="158" width="3" height="24" fill="var(--haru-trunk-dark, #451a03)" />
        <circle cx="201" cy="156" r="10" fill="var(--haru-leaf-dark, #ea580c)" />
      </g>
      {/* 노을 태양 */}
      <circle cx="280" cy="55" r="15" fill="var(--haru-fruit, #dc2626)" opacity="0.55" />
      <circle cx="280" cy="55" r="22" fill="var(--haru-leaf-light, #fdba74)" opacity="0.25" />
      {/* 떨어지는 단풍 점들 */}
      <g fill="var(--haru-fruit, #dc2626)" opacity="0.65">
        <circle cx="120" cy="60" r="1.6" />
        <circle cx="220" cy="80" r="1.4" />
        <circle cx="80" cy="95" r="1.2" />
        <circle cx="160" cy="100" r="1.3" />
      </g>
      <g fill="var(--haru-leaf-light, #fdba74)" opacity="0.7">
        <circle cx="180" cy="65" r="1.4" />
        <circle cx="240" cy="100" r="1.2" />
        <circle cx="100" cy="110" r="1.1" />
      </g>
    </g>
  );
}

/* ════════════════════════════════
   겨울 — 설산 + 눈사람 + 솔숲
   ════════════════════════════════ */
function WinterScene() {
  return (
    <g>
      <rect x="0" y="0" width="400" height="200" fill="var(--haru-leaf-light, #86efac)" opacity="0.05" />
      {/* 멀리 설산 */}
      <path
        d="M0 140 L60 90 L100 110 L160 70 L220 100 L280 80 L340 105 L400 95 L400 200 L0 200 Z"
        fill="var(--haru-trunk-light, #57534e)"
        opacity="0.3"
      />
      {/* 설산 흰 봉우리 (눈) */}
      <path
        d="M50 95 L60 90 L70 96 L65 100 L55 100 Z M150 75 L160 70 L170 78 L165 82 L155 82 Z M270 85 L280 80 L290 88 L285 92 L275 92 Z"
        fill="var(--haru-blossom, #fff)"
        opacity="0.85"
      />
      {/* 눈 덮인 평지 */}
      <path
        d="M0 155 Q100 150 200 158 T400 155 L400 200 L0 200 Z"
        fill="var(--haru-blossom, #fff)"
        opacity="0.55"
      />
      {/* 작은 솔숲 (좌측) */}
      <g opacity="0.55">
        <polygon points="35,160 25,180 45,180" fill="var(--haru-leaf-dark, #166534)" />
        <polygon points="35,150 28,170 42,170" fill="var(--haru-leaf-dark, #166534)" />
        <polygon points="35,140 30,160 40,160" fill="var(--haru-leaf-dark, #166534)" />
        {/* 눈 덮인 가장자리 */}
        <line x1="28" y1="170" x2="42" y2="170" stroke="var(--haru-blossom, #fff)" strokeWidth="1.2" opacity="0.9" />
        <line x1="30" y1="160" x2="40" y2="160" stroke="var(--haru-blossom, #fff)" strokeWidth="1" opacity="0.9" />
      </g>
      <g opacity="0.5">
        <polygon points="65,170 57,185 73,185" fill="var(--haru-leaf-dark, #166534)" />
        <polygon points="65,160 58,178 72,178" fill="var(--haru-leaf-dark, #166534)" />
      </g>
      {/* 눈사람 (우측) */}
      <g opacity="0.85">
        <circle cx="340" cy="170" r="12" fill="var(--haru-blossom, #fff)" />
        <circle cx="340" cy="152" r="9" fill="var(--haru-blossom, #fff)" />
        {/* 눈 */}
        <circle cx="337" cy="150" r="0.9" fill="var(--haru-trunk-dark, #292524)" />
        <circle cx="343" cy="150" r="0.9" fill="var(--haru-trunk-dark, #292524)" />
        {/* 입 */}
        <path d="M337 155 Q340 157 343 155" stroke="var(--haru-trunk-dark, #292524)" strokeWidth="0.6" fill="none" />
        {/* 코 (당근) */}
        <polygon points="340,152 344,153 340,154" fill="var(--haru-fruit, #ea580c)" />
        {/* 단추 */}
        <circle cx="340" cy="167" r="0.8" fill="var(--haru-trunk-dark, #292524)" />
        <circle cx="340" cy="172" r="0.8" fill="var(--haru-trunk-dark, #292524)" />
        {/* 양팔 (가지) */}
        <line x1="328" y1="167" x2="320" y2="160" stroke="var(--haru-trunk-dark, #292524)" strokeWidth="1.2" />
        <line x1="352" y1="167" x2="360" y2="160" stroke="var(--haru-trunk-dark, #292524)" strokeWidth="1.2" />
      </g>
      {/* 차가운 흰 빛 */}
      <circle cx="230" cy="50" r="14" fill="var(--haru-blossom, #fff)" opacity="0.55" />
      <circle cx="230" cy="50" r="22" fill="var(--haru-blossom, #fff)" opacity="0.18" />
      {/* 떨어지는 눈송이 점 */}
      <g fill="var(--haru-blossom, #fff)" opacity="0.85">
        <circle cx="100" cy="40" r="1.4" />
        <circle cx="180" cy="60" r="1.2" />
        <circle cx="260" cy="80" r="1.5" />
        <circle cx="320" cy="50" r="1.2" />
        <circle cx="140" cy="100" r="1.3" />
        <circle cx="200" cy="115" r="1.1" />
        <circle cx="80" cy="120" r="1.2" />
      </g>
    </g>
  );
}

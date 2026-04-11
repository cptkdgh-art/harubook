/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/pricing / PricingPlans
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 4티어 요금제 카드 (MVP — 결제 미연결, 비전 노출용).
 * 현재 사용 중인 티어 자동 하이라이트.
 */

'use client';

import { Leaf, Droplet, Flower2, TreePine, Check, Lock } from 'lucide-react';
import type { User } from 'firebase/auth';

/* ════════════════════════════════
   타입
   ════════════════════════════════ */

type TierId = 'local' | 'mini' | 'plus' | 'pro';

interface Tier {
  id: TierId;
  name: string;
  price: string;
  priceSub: string;
  tagline: string;
  icon: React.ReactNode;
  iconClass: string; // 명시 Tailwind 클래스 (JIT 호환)
  features: string[];
  badge?: string;
  soon?: boolean;
}

const TIERS: Tier[] = [
  {
    id: 'local',
    name: '로컬',
    price: '무료',
    priceSub: '',
    tagline: '이 기기에서, 본인 키로 전부 다 써요',
    icon: <Leaf className="w-5 h-5" />,
    iconClass: 'bg-emerald-500/10 text-emerald-600',
    features: [
      '할 일 · 하루나무 · 주간 소설 전부',
      '본인 OpenRouter 키로 AI 무제한',
      '📁 파일 내보내기/가져오기 (JSON)',
      '기기 간 이동도 파일로 해결',
      '완전한 프라이버시 (서버 전송 0)',
    ],
    badge: '현재 이용 가능',
  },
  {
    id: 'mini',
    name: '미니',
    price: '990원',
    priceSub: '/월',
    tagline: '파일 옮기는 거 귀찮을 때 — 클라우드에 저장',
    icon: <Droplet className="w-5 h-5" />,
    iconClass: 'bg-sky-500/10 text-sky-600',
    features: [
      '로컬 플랜 전부 포함',
      '☁️ 클라우드 수동 백업/복원',
      '다른 기기에서 로그인 → 불러오기',
      '서버에 안전하게 저장 (Firestore)',
      '파일 관리 안 해도 됨',
    ],
    soon: true,
  },
  {
    id: 'plus',
    name: '플러스',
    price: '4,900원',
    priceSub: '/월',
    tagline: 'API 키 발급도 번거롭다면 — 우리가 대신',
    icon: <Flower2 className="w-5 h-5" />,
    iconClass: 'bg-pink-500/10 text-pink-600',
    features: [
      '미니 플랜 전부 포함 (클라우드 백업)',
      '🎁 앱 제공 AI 크레딧 (월 500회)',
      '🔑 OpenRouter 키 발급·충전 불필요',
      '📆 월간 에필로그 AI 생성',
      '🎨 시즌 한정 나무 스킨 (봄·여름·가을·겨울)',
      '💌 소설 이미지 카드 다운로드 (월 10장)',
      '⚡ 신기능 우선 체험',
    ],
    soon: true,
  },
  {
    id: 'pro',
    name: '프로',
    price: '9,900원',
    priceSub: '/월',
    tagline: '여러 파트너·가족과 함께 기록하고 싶을 때',
    icon: <TreePine className="w-5 h-5" />,
    iconClass: 'bg-amber-500/10 text-amber-600',
    features: [
      '플러스 플랜 전부 포함',
      '♾️ AI 무제한 사용',
      '👥 다중 파트너 (최대 3명)',
      '👨‍👩‍👧 가족 공유 (5인까지)',
      '🖼️ 파트너 초상화 AI 생성 (월 5회)',
      '📚 소설 PDF 전자책 내보내기',
      '🎭 프리미엄 테마 & 나무 스킨 전체',
      '🎵 소설 오디오북 변환 (곧 출시)',
    ],
    soon: true,
  },
];

/* ════════════════════════════════
   현재 티어 판정
   ════════════════════════════════ */

function getCurrentTier(_user: User | null): TierId {
  // 로컬 플랜이 실제로 작동하는 유일한 플랜 (로그인 여부 무관)
  // Mini/Plus/Pro 는 아직 결제 시스템 미연동
  return 'local';
}

/* ════════════════════════════════
   컴포넌트
   ════════════════════════════════ */

interface Props {
  user: User | null;
  onNotifyRequest?: (tierId: TierId) => void;
}

export function PricingPlans({ user, onNotifyRequest }: Props) {
  const currentTier = getCurrentTier(user);

  return (
    <div className="space-y-3">
      {TIERS.map((tier) => {
        const isCurrent = tier.id === currentTier;
        return (
          <PlanCard
            key={tier.id}
            tier={tier}
            isCurrent={isCurrent}
            onNotify={onNotifyRequest}
          />
        );
      })}
      <p className="text-center text-[10px] text-muted-foreground pt-1 leading-relaxed">
        💡 로컬·베이직은 <b className="text-foreground">완전 무료</b>로 지금도 사용 가능해요.
        <br />
        플러스·프로는 편의·확장 기능이고 곧 출시예요. 알림 신청해주시면 오픈 즉시 알려드려요.
      </p>
    </div>
  );
}

/* ════════════════════════════════
   개별 카드 (파일 스코프 분리)
   ════════════════════════════════ */

interface PlanCardProps {
  tier: Tier;
  isCurrent: boolean;
  onNotify?: (tierId: TierId) => void;
}

function PlanCard({ tier, isCurrent, onNotify }: PlanCardProps) {
  const ringClass = isCurrent
    ? 'ring-2 ring-primary shadow-md'
    : 'border border-border/50';

  return (
    <div className={`rounded-2xl bg-card/60 p-4 space-y-3 relative ${ringClass}`}>
      {isCurrent ? (
        <span className="absolute -top-2 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
          현재 플랜
        </span>
      ) : null}
      {tier.soon ? (
        <span className="absolute -top-2 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
          곧 출시
        </span>
      ) : null}

      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${tier.iconClass}`}
        >
          {tier.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-bold">{tier.name}</h3>
            <span className="text-sm font-semibold">{tier.price}</span>
            {tier.priceSub ? (
              <span className="text-[10px] text-muted-foreground">{tier.priceSub}</span>
            ) : null}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{tier.tagline}</p>
        </div>
      </div>

      <ul className="space-y-1 pl-1">
        {tier.features.map((f, i) => (
          <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <Check className="w-3 h-3 flex-shrink-0 mt-0.5 text-primary/70" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {tier.soon ? (
        <button
          type="button"
          onClick={() => onNotify?.(tier.id)}
          className="w-full py-2 rounded-lg border border-border/60 text-[11px] font-medium hover:bg-muted/50 flex items-center justify-center gap-1.5"
        >
          <Lock className="w-3 h-3" />
          출시 알림 받기
        </button>
      ) : null}
    </div>
  );
}

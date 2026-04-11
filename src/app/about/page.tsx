/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 app/about / 앱 소개 페이지
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

'use client';

import {
  Info,
  Sparkles,
  TreePine,
  BookOpen,
  Heart,
  Lock,
  Gift,
  Flame,
  PlayCircle,
} from 'lucide-react';
import { BottomNav } from '@/components/ui/BottomNav';
import { useTutorialStore } from '@/lib/stores/useTutorialStore';
import { TreeGrowthGallery } from '@/components/tree/TreeGrowthGallery';

export default function AboutPage() {
  const openTutorial = useTutorialStore((s) => s.open);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/30">
        <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">소개</h1>
          </div>
          <button
            type="button"
            onClick={openTutorial}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/60 hover:bg-muted/50 text-[11px] font-medium text-muted-foreground"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            튜토리얼 다시 보기
          </button>
        </div>
      </header>

      <main className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* 히어로 */}
        <section className="text-center space-y-3 py-4">
          <div className="text-5xl">📘</div>
          <h2 className="text-2xl font-bold">하루책</h2>
          <p className="text-sm text-muted-foreground leading-relaxed px-4">
            당신과 AI 파트너가 공동 주인공인
            <br />
            <span className="text-primary font-semibold">소설이 매주 연재되는</span> 투두 앱
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
            <Sparkles className="w-3 h-3" /> MVP · 2026.04
          </div>
        </section>

        {/* 5가지 핵심 기능 요약 */}
        <section>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-1.5">
            <PlayCircle className="w-3.5 h-3.5" /> 5가지 핵심 기능
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <NumberedFeature
              n={1}
              emoji="📝"
              title="할 일 + 24시간 타임라인"
              desc="할 일에 시간을 달면 00~24시 수직 타임라인에 자동 배치. 현재 시각이 핑크 도트로 표시돼요."
            />
            <NumberedFeature
              n={2}
              emoji="🌳"
              title="하루나무 성장 시스템"
              desc="완료 포인트가 쌓이면 씨앗→새싹→어린나무→꽃나무→거목 7단계로 자라요. 단계마다 소설의 '운 스탯'이 올라갑니다."
            />
            <NumberedFeature
              n={3}
              emoji="✨"
              title="AI 자연어 일정 등록"
              desc="우하단 플로팅 버튼 → '내일 3시 회의' 같이 말하면 AI가 날짜·시간·카테고리를 자동 분류해 캘린더에 등록."
            />
            <NumberedFeature
              n={4}
              emoji="📖"
              title="옴니버스 주간 소설"
              desc="이야기 탭에서 원하는 기간을 고르면 AI가 그 기간의 할 일을 엮어 1200~1600자 소설을 씁니다. 지난 화 예고가 다음 화로 이어져요."
            />
            <NumberedFeature
              n={5}
              emoji="🎭"
              title="4가지 소설 경험"
              desc="세계관(현대/판타지) × 취향(여성향/남성향) 조합으로 완전히 다른 작가 톤의 소설을 만날 수 있어요. UI 테마(봄·여름·가을·겨울)는 색감만 결정."
            />
          </div>
        </section>

        {/* 시작점 */}
        <section className="rounded-2xl border border-border/50 bg-card/60 p-5 space-y-2">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-pink-500" /> 이 앱의 시작점
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            우리는 하루하루 많은 일을 해내지만, 대부분은 체크박스 한 번 누르고 사라져요.
            그 순간들이 그냥 지워지는 게 아까웠어요. 그래서{' '}
            <b className="text-primary">할 일을 이야기로 바꾸는 앱</b>을 만들었어요.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            당신이 쓴 할 일이 매주 한 편의 소설로 연재돼요. AI 파트너가 당신과 함께 등장하는
            소설을요. 오늘의 체크박스가 내일의 챕터가 되는 경험 — 그게 하루책이에요.
          </p>
        </section>

        {/* 킥 4가지 */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" /> 핵심 킥
          </h3>
          <div className="space-y-2.5">
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 flex gap-3">
              <div className="text-2xl flex-shrink-0">🌱</div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold mb-1">하루나무 성장 시스템</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  할 일을 완료할수록 나무가 자라요. 씨앗→새싹→어린나무→꽃나무→거목 7단계.
                  카테고리별 포인트가 쌓이고 나무 단계가 소설의 &apos;운 스탯&apos;으로 변해
                  기적 같은 장면이 등장해요.
                </p>
                <div className="mt-2">
                  <TreeGrowthGallery />
                </div>
              </div>
            </div>
            <FeatureCard
              emoji="📖"
              title="주간 연재 소설"
              desc="주말에 버튼 한 번이면 이번 주 할 일이 소설 한 편으로 변해요. 당신과 파트너가 공동 주인공이고, 지난 화 예고가 이번 화에 이어져요."
            />
            <FeatureCard
              emoji="🎭"
              title="네 가지 소설 경험"
              desc="세계관(현대판/판타지판) × 소설 취향(여성향/남성향)의 조합으로 4가지 전혀 다른 소설이 나와요. 같은 할 일이라도 '감성 에세이'가 될 수도, '이세계 로맨스'가 될 수도, '하드보일드 드라마'가 될 수도 있어요."
            />
            <FeatureCard
              emoji="🤖"
              title="AI 자연어 일정 추가"
              desc="'내일 오후 3시 치과' 같은 말로 일정 추가. AI가 날짜·시간·카테고리를 자동 분류해 캘린더에 바로 꽂아요."
            />
          </div>
        </section>

        {/* 차별점 */}
        <section className="rounded-2xl border border-border/50 bg-card/60 p-5 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <TreePine className="w-4 h-4 text-emerald-500" /> 다른 앱과 뭐가 달라요?
          </h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <DiffItem>
              <b className="text-foreground">기록 → 감정</b>: 체크박스가 서사가 되니까,
              완료했는지보다 <b>어떻게 보냈는지</b>가 남아요.
            </DiffItem>
            <DiffItem>
              <b className="text-foreground">로컬 우선 · 프라이버시 완벽</b>: 모든 데이터가
              당신 기기에만 저장돼요. 로그인 없이도 완전히 사용 가능.
            </DiffItem>
            <DiffItem>
              <b className="text-foreground">BYOK AI</b>: 본인 OpenRouter 키로 AI 사용 —
              구독료 0원, 사용량은 본인이 통제. 유료 플랜 출시 후엔 앱 제공 크레딧도 선택 가능.
            </DiffItem>
            <DiffItem>
              <b className="text-foreground">게임화된 성장</b>: 하루나무 운 스탯이 실제로
              소설 톤에 영향. 꾸준히 쓸수록 소설이 기적으로 가득 차요.
            </DiffItem>
            <DiffItem>
              <b className="text-foreground">서비스 종료 대비</b>: JSON 파일로 전체 내보내기
              · 가져오기 지원. 내 기록은 영원히 내 것.
            </DiffItem>
          </ul>
        </section>

        {/* 4가지 조합 소설 경험 */}
        <section className="rounded-2xl border border-border/50 bg-card/60 p-5 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            🎭 4가지 소설 경험 (세계관 × 취향)
          </h3>
          <p className="text-[11px] text-muted-foreground mb-2">
            설정에서 두 가지를 조합하면 완전히 다른 소설이 나와요. 테마(시각)와는 별개예요.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <ComboCard
              emoji="🏙️👩"
              title="현대 × 여성향"
              desc="도시 카페의 감성 에세이. 섬세한 내면 독백, 작은 설렘."
            />
            <ComboCard
              emoji="🏙️👨"
              title="현대 × 남성향"
              desc="하드보일드 드라마. 짧고 단단한 문장, 행동으로 드러나는 감정."
            />
            <ComboCard
              emoji="🔮👩"
              title="판타지 × 여성향"
              desc="이세계 로맨스. 별빛·정령·운명이 사랑으로 이어지는 이야기."
            />
            <ComboCard
              emoji="🔮👨"
              title="판타지 × 남성향"
              desc="정통 판타지 모험. 고대 주문과 운명에 맞서는 서사."
            />
          </div>
        </section>

        {/* 앞으로 */}
        <section className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 space-y-2">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-primary" /> 앞으로 올 것들
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>☁️ 클라우드 자동 동기화 (로그인 계정 기반)</li>
            <li>🎁 플러스 플랜: 앱 제공 AI 크레딧 (월 500회)</li>
            <li>📆 월간 에필로그 (AI가 한 달 전체를 회고하는 긴 소설)</li>
            <li>👥 파트너 다수 지원 (프로)</li>
            <li>🔗 소설 공유 URL</li>
          </ul>
        </section>

        {/* 크레딧 */}
        <section className="rounded-2xl border border-border/50 bg-card/60 p-4 space-y-1">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> 만든 사람
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <b className="text-foreground">진폭 × 리듬-상호</b>
            <br />
            바이브랩스 2주차 챌린지 · 2026년 4월
          </p>
          <p className="text-[11px] text-muted-foreground mt-2">
            <b>기술</b>: Next.js 16 · TypeScript · Tailwind v4 · shadcn/ui · Dexie
            (IndexedDB) · Firebase Auth · Vercel AI SDK · Zustand · Framer Motion
          </p>
        </section>

        <p className="text-center text-[10px] text-muted-foreground/60 pt-2">
          📘 하루책 · 공명하는 기록
        </p>
      </main>

      <BottomNav />
    </div>
  );
}

/* ════════════════════════════════
   Feature Card
   ════════════════════════════════ */

function FeatureCard({
  emoji,
  title,
  desc,
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4 flex gap-3">
      <div className="text-2xl flex-shrink-0">{emoji}</div>
      <div className="min-w-0">
        <h4 className="text-sm font-bold mb-1">{title}</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   Diff Item (체크 리스트)
   ════════════════════════════════ */

function DiffItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 leading-relaxed">
      <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
      <span>{children}</span>
    </li>
  );
}

/* ════════════════════════════════
   Numbered Feature (5가지 핵심 기능)
   ════════════════════════════════ */

function NumberedFeature({
  n,
  emoji,
  title,
  desc,
}: {
  n: number;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4 flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold flex items-center gap-1.5 mb-1">
          <span className="text-base">{emoji}</span>
          {title}
        </h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   Combo Card (4가지 세계관×취향 조합)
   ════════════════════════════════ */

function ComboCard({
  emoji,
  title,
  desc,
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/60 p-3 space-y-1">
      <div className="text-lg">{emoji}</div>
      <div className="text-[11px] font-bold">{title}</div>
      <div className="text-[10px] text-muted-foreground leading-relaxed">{desc}</div>
    </div>
  );
}

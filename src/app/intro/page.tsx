/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 app/intro / 랜딩 페이지 (챌린지 제출용)
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 신규 방문자에게 보여주는 히어로 + 기능 소개 + CTA.
 * "바로 시작하기" 버튼이 /onboarding 으로 연결.
 */

'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  TreePine,
  BookOpen,
  Wand2,
  Calendar,
  Shield,
  Heart,
  Layers,
  Palette,
  Flame,
  Info,
} from 'lucide-react';

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-background to-background dark:from-pink-950/20 dark:via-background dark:to-background">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl opacity-10 rotate-12">🌸</div>
          <div className="absolute top-40 right-16 text-5xl opacity-10 -rotate-12">🌳</div>
          <div className="absolute top-72 left-20 text-4xl opacity-10">📘</div>
          <div className="absolute bottom-20 right-10 text-5xl opacity-10 rotate-6">✨</div>
        </div>

        <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            바이브랩스 2주차 챌린지 · 2026
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            📘 하루책
          </h1>
          <p className="text-xl md:text-2xl font-bold text-foreground/90 mb-3 leading-snug">
            체크박스 하나가 <span className="text-primary">내일의 챕터</span>가 된다
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
            할 일을 해낼수록 나무가 자라고, 한 주가 끝나면
            <br className="hidden md:inline" />
            AI 파트너가 그 기록을 한 편의 <b className="text-foreground">소설</b>로 써주는 감성 Todo 앱.
          </p>

          {/* 바로 시작하기 CTA */}
          <Link
            href="/onboarding"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-5 h-5" />
            바로 시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <p className="text-[11px] text-muted-foreground/70 mt-4">
            무료 · 브라우저만 있으면 OK · 3분 이내 첫 소설
          </p>
        </div>
      </section>

      {/* ═══════════════ 왜 만들었나 ═══════════════ */}
      <section className="max-w-2xl mx-auto px-6 py-12">
        <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 md:p-8 space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Heart className="w-5 h-5 text-pink-500" />
            왜 만들었나
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            사용자의 <b className="text-foreground">&ldquo;편의성&rdquo;</b>을 최우선으로 했습니다.
            앱에 들어가자마자 튜토리얼로 앱 소개와 사용법을 안내하고,
            지속적으로 사용할 수 있도록 <b className="text-foreground">동기부여 시스템</b>을 설계했습니다.
          </p>
          <div className="pt-2 space-y-2 text-sm leading-relaxed">
            <p className="text-foreground">
              남의 이야기가 아닙니다.
              <br />
              내가 설정한 <b className="text-primary">&ldquo;나만의 할 일 이야기&rdquo;</b> — 그게 우리 하루책입니다.
            </p>
            <p className="text-foreground">
              오늘 할 일을 혼자 한 게 아닙니다.
              <br />
              이 앱에서는 내가 만든 AI 파트너와 <b className="text-primary">&ldquo;함께&rdquo;</b> 합니다.
            </p>
            <p className="text-lg font-bold text-primary pt-2">
              당신은 혼자가 아닙니다.
              <br />
              &ldquo;함께 있습니다.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ 컨셉 ═══════════════ */}
      <section className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-xs font-semibold text-muted-foreground">
            🌱 CONCEPT
          </div>
          <h2 className="text-2xl md:text-3xl font-black leading-tight">
            오늘의 체크박스가
            <br />
            <span className="text-primary">내일의 챕터</span>가 되는 경험
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            보통 todo 앱은 체크박스 하나가 소비되고 사라지지만, 하루책은
            그 기록이 매주 한 편의 소설로 연재됩니다.
            <br />
            사용자와 AI 파트너가 함께 주인공으로 등장하는 <b className="text-foreground">옴니버스 연재</b>를
            만드는 앱입니다.
          </p>
        </div>
      </section>

      {/* ═══════════════ 핵심 기능 ═══════════════ */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-xs font-semibold text-muted-foreground mb-3">
            <Flame className="w-3.5 h-3.5" /> FEATURES
          </div>
          <h2 className="text-2xl md:text-3xl font-black">핵심 기능</h2>
          <p className="text-xs text-muted-foreground mt-2">
            Todo 앱의 기본에 충실하면서도, 이런 차별점을 더했습니다.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Feature
            n={1}
            icon={<Calendar className="w-4 h-4" />}
            title="24시간 수직 타임라인 + 하루나무"
            desc="할 일에 시간을 달면 00~24시 세로 타임라인에 자동 배치. 완료할수록 씨앗 → 새싹 → 어린나무 → 꽃나무 → 거목 7단계로 성장."
          />
          <Feature
            n={2}
            icon={<TreePine className="w-4 h-4" />}
            title="계절별 나무 자동 전환"
            desc="봄은 벚꽃, 여름은 야자수, 가을은 단풍, 겨울은 소나무. 배경 디오라마·파티클도 월별로 통째로 바뀝니다."
          />
          <Feature
            n={3}
            icon={<Layers className="w-4 h-4" />}
            title="시즌 단위 성장 사이클"
            desc="시즌마다 나무가 새로 자라고, 지난 시즌 단계의 -3 만큼만 이월. 한 번 거목 찍으면 끝이 아니라 매 시즌 또 키워야 거목이 됩니다."
          />
          <Feature
            n={4}
            icon={<BookOpen className="w-4 h-4" />}
            title="AI 옴니버스 소설 (2모드)"
            desc="🎲 AI에게 맡기기 (무료) / ✍️ 내가 방향 주기 (-150P). 세계관(현대·판타지) × 취향(여성향·남성향) = 4가지 다른 톤."
          />
          <Feature
            n={5}
            icon={<Wand2 className="w-4 h-4" />}
            title="AI 자연어 일정 등록"
            desc='"내일 3시 회의" "한 달 뒤 영업 미팅" 같이 말하면 AI가 날짜·시간·카테고리 자동 분류해 캘린더에 등록.'
          />
          <Feature
            n={6}
            icon={<Shield className="w-4 h-4" />}
            title="BYOK + Local-First"
            desc="AI 키는 본인 OpenRouter 키 (무료 모델 OK). 데이터는 브라우저 IndexedDB — 오프라인 작동, 서버 업로드 없음."
          />
          <Feature
            n={7}
            icon={<Palette className="w-4 h-4" />}
            title="4계절 UI 테마 + PWA"
            desc="봄·여름·가을·겨울 + 자동 모드. 애니메이션 토글, 6단계 웰컴 튜토리얼, 월간 히트맵, 카테고리별 통계."
          />
          <Feature
            n={8}
            icon={<Heart className="w-4 h-4" />}
            title='"나 자신의 이야기"'
            desc="기록 탭에서 월 단위로 본인 할 일 확인. 나와 AI 파트너가 함께 써나가는, 커스텀도 가능한 연재 소설."
          />
          <Feature
            n={9}
            icon={<Info className="w-4 h-4" />}
            title="무료 · 내보내기/가져오기"
            desc="기본 기능 전부 무료. 로컬 파일로 내보내고 PC·모바일 간 이어서 쓸 수 있음. (편의 유료 플랜은 BM 설계 완료, 미구현)"
          />
        </div>
      </section>

      {/* ═══════════════ 차별점 ═══════════════ */}
      <section className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-xs font-semibold text-muted-foreground mb-3">
            💎 DIFFERENCE
          </div>
          <h2 className="text-2xl md:text-3xl font-black">보통 Todo 앱과의 차이</h2>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/60 divide-y divide-border/40">
          <DiffRow left="체크박스 = 소비" right="체크박스 = 창작의 재료" />
          <DiffRow left="매일 같은 화면" right="계절별로 나무·배경·파티클 전환" />
          <DiffRow left="게임화 = 점수" right="게임화 = 내 이야기가 됨" />
          <DiffRow left="앱 효율 우선" right="기록의 의미 우선" />
          <DiffRow left="게으르면 벌점" right="게으르면 다음 소설이 잔잔해짐" />
        </div>
      </section>

      {/* ═══════════════ 기술 스택 & 규모 ═══════════════ */}
      <section className="max-w-2xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-4">
          {/* 기술 스택 */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              🛠 기술 스택
            </h3>
            <ul className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
              <li>Next.js 16 · TypeScript · Tailwind v4</li>
              <li>Dexie (IndexedDB Local-First)</li>
              <li>Zustand (11 store) · Framer Motion</li>
              <li>OpenRouter BYOK · Vercel AI SDK v6 · Zod</li>
              <li>Firebase Anonymous + Google (선택)</li>
              <li>PWA · Vercel 배포</li>
            </ul>
          </div>

          {/* 규모 */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-1.5">📊 규모</h3>
            <ul className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
              <li>
                <b className="text-foreground">11,000+</b> 라인
              </li>
              <li>
                <b className="text-foreground">77</b> 파일
              </li>
              <li>
                <b className="text-foreground">11</b> 페이지
              </li>
              <li>
                <b className="text-foreground">2주</b> 설계 → 구현 → 배포
              </li>
              <li className="pt-1 text-primary font-medium">진폭 × 리듬-상호</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════ 하단 CTA ═══════════════ */}
      <section className="max-w-2xl mx-auto px-6 pt-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-primary/70 p-8 md:p-10 text-center text-primary-foreground shadow-xl shadow-primary/25">
          <div className="text-4xl mb-3">🌸</div>
          <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight">
            오늘의 체크박스,
            <br />
            내일의 챕터로
          </h2>
          <p className="text-sm opacity-90 mb-6 leading-relaxed">
            3분이면 첫 소설을 받아볼 수 있어요.
            <br />
            AI 파트너가 당신을 기다리고 있습니다.
          </p>
          <Link
            href="/onboarding"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-background text-foreground font-bold text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            바로 시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="text-[11px] opacity-70 mt-4">
            무료 · BYOK (OpenRouter 키) · Local-First
          </p>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="max-w-2xl mx-auto px-6 py-8 text-center">
        <p className="text-[11px] text-muted-foreground/60">
          📘 하루책 · 진폭 × 리듬-상호 · 바이브랩스 2주차 챌린지 · 2026년 4월
        </p>
      </footer>
    </div>
  );
}

/* ════════════════════════════════
   Feature card
   ════════════════════════════════ */
function Feature({
  n,
  icon,
  title,
  desc,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4 flex gap-3 hover:border-primary/40 transition-colors">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs relative">
        <span className="absolute inset-0 flex items-center justify-center">{n}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold mb-1 flex items-center gap-1.5">
          <span className="text-primary">{icon}</span>
          {title}
        </h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   Difference row
   ════════════════════════════════ */
function DiffRow({ left, right }: { left: string; right: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 text-xs">
      <div className="text-right text-muted-foreground line-through decoration-muted-foreground/30">
        {left}
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
      <div className="text-left text-foreground font-medium">{right}</div>
    </div>
  );
}

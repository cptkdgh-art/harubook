/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/tutorial / WelcomeTutorial
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 첫 진입 5단계 웰컴 튜토리얼 오버레이.
 * 각 단계는 이모지·제목·설명·해당 기능 아이콘 일러스트로 구성.
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  CheckCircle2,
  Sparkles,
  CalendarRange,
  Info,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import { useTutorialStore, TUTORIAL_TOTAL_STEPS } from '@/lib/stores/useTutorialStore';

/* ════════════════════════════════
   1. 단계 정의
   ════════════════════════════════ */

interface Step {
  emoji: string;
  title: string;
  desc: React.ReactNode;
  highlight: React.ReactNode;
}

const STEPS: Step[] = [
  {
    emoji: '🌸',
    title: '하루책에 어서 오세요',
    desc: (
      <>
        하루책은 당신의 할 일을 모아
        <br />
        <b className="text-primary">기간별로 한 편의 이야기</b>로 만들어줘요.
        <br />
        매주, 매달, 또는 원하는 기간으로
        <br />
        당신만의 <b>옴니버스 연재</b>가 시작됩니다.
      </>
    ),
    highlight: <BookOpen className="w-12 h-12 text-primary" />,
  },
  {
    emoji: '📝',
    title: '할 일 입력 + 시간 설정',
    desc: (
      <>
        상단 입력창에 할 일을 쓰고,
        <br />
        <b className="text-primary">⏰ 시계 버튼</b>을 눌러 시간을 골라주세요.
        <br />
        <b>24시간제 타임라인</b>에 자동으로 정렬돼요.
        <br />
        <span className="text-[11px] text-muted-foreground">
          (카드 내부의 시간 배지를 탭하면 나중에도 바꿀 수 있어요)
        </span>
      </>
    ),
    highlight: (
      <div className="flex items-center gap-2">
        <div className="h-10 w-24 rounded-lg bg-muted/60 border border-border/60 flex items-center px-2 text-[10px] text-muted-foreground">
          할 일을…
        </div>
        <div className="h-10 w-10 rounded-lg border-2 border-primary bg-primary/10 flex items-center justify-center text-primary animate-pulse">
          <Clock className="w-4 h-4" />
        </div>
      </div>
    ),
  },
  {
    emoji: '✅',
    title: '완료 체크 → 하루나무 성장',
    desc: (
      <>
        끝낸 일은 <b>체크박스</b>를 눌러 완료!
        <br />
        카테고리별 포인트가 쌓이고
        <br />
        <b className="text-primary">🌳 하루나무</b>가 단계별로 자라요.
        <br />
        나무가 커질수록 다음 소설에
        <br />
        <b>기적 같은 장면</b>이 더 많이 등장해요.
      </>
    ),
    highlight: (
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        <div className="text-3xl">🌱→🌳→🌲</div>
      </div>
    ),
  },
  {
    emoji: '✨',
    title: 'AI 파트너에게 말하기',
    desc: (
      <>
        우하단 <b className="text-primary">✨ 플로팅 버튼</b>을 눌러서
        <br />
        자연어로 말해보세요.
        <br />
        <br />
        <span className="text-[11px] bg-muted/50 px-2 py-1 rounded-md font-mono">
          &ldquo;내일 3시 회의&rdquo;
        </span>
        <br />
        <br />
        AI가 날짜·시간·카테고리를 알아서
        <br />
        <b>자동으로 캘린더에 등록</b>해줘요.
      </>
    ),
    highlight: (
      <div className="relative">
        <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute -inset-2 rounded-2xl border-2 border-primary/50 animate-ping" />
      </div>
    ),
  },
  {
    emoji: '📖',
    title: '옴니버스 소설 만들기',
    desc: (
      <>
        <b className="text-primary">이야기 탭</b>에서 기간을 고르면
        <br />
        AI가 그 기간의 할 일을 엮어
        <br />
        <b>약 1200~5000자 소설</b>을 써줘요.
        <br />
        할 일이 많으면 <b>2편으로 나눠</b> 연재되고,
        <br />
        지난 화 예고가 다음 화로 이어져요.
        <br />
        <br />
        <span className="text-[11px] text-muted-foreground">
          💡 🎲 AI 자유(무료) · ✍️ 커스텀 프롬프트(-150P)
          <br />
          현대·판타지 × 여성·남성향 = 4가지 작가 톤
        </span>
      </>
    ),
    highlight: (
      <div className="flex items-center gap-2">
        <CalendarRange className="w-8 h-8 text-primary" />
        <div className="text-2xl">→</div>
        <BookOpen className="w-8 h-8 text-primary" />
      </div>
    ),
  },
  {
    emoji: '🌸',
    title: '계절 따라 바뀌는 나무 · 꾸밈 토글',
    desc: (
      <>
        하루나무는 <b className="text-primary">현재 달에 맞춰</b>
        <br />
        자동으로 종이 바뀌어요.
        <br />
        <br />
        <span className="text-[11px] leading-relaxed">
          🌸 봄: 벚꽃나무 · 분홍 꽃잎
          <br />
          🌊 여름: 야자수 · 물방울 · 해변
          <br />
          🍁 가을: 단풍나무 · 낙엽 · 단풍 숲
          <br />
          ❄️ 겨울: 소나무 · 눈 · 설산
        </span>
        <br />
        <br />
        배경과 파티클도 <b>통째로 바뀌고</b>, UI 테마도
        <br />
        <b className="text-primary">🕰️ 자동 / 봄 / 여름 / 가을 / 겨울</b>로 고를 수 있어요.
        <br />
        <br />
        <span className="text-[11px] text-muted-foreground">
          💡 홈 우상단의 <b className="text-primary">✨ ON/OFF</b> 로 애니메이션을
          {' '}켜고 끌 수 있고,
          <br />
          <b className="text-primary">🕰️</b> 로 테마, <b className="text-primary">?</b> 로 이 튜토리얼을 언제든 다시 볼 수 있어요.
        </span>
      </>
    ),
    highlight: (
      <div className="flex items-center gap-1.5">
        <span className="text-3xl">🌸</span>
        <span className="text-3xl">🌊</span>
        <span className="text-3xl">🍁</span>
        <span className="text-3xl">❄️</span>
      </div>
    ),
  },
  {
    emoji: '🧭',
    title: '더 알고 싶다면?',
    desc: (
      <>
        더 궁금하거나 헷갈리는 게 있다면
        <br />
        하단 네비의 <b className="text-primary">소개</b>와{' '}
        <b className="text-primary">가이드</b> 탭을 확인해보세요.
        <br />
        <br />
        <span className="text-[12px]">
          <b>ℹ️ 소개</b> — 앱 컨셉, 핵심 킥, 차별점,
          <br />
          4가지 소설 경험 조합, 만든 사람 소개
        </span>
        <br />
        <br />
        <span className="text-[12px]">
          <b>🧭 가이드</b> — 5단계 빠른 시작, 메뉴별
          <br />
          역할, FAQ 8개, 꿀팁 6개
        </span>
        <br />
        <br />
        <span className="text-[11px] text-muted-foreground">
          💡 이 튜토리얼은 소개 또는 가이드 탭에서
          <br />
          <b>&ldquo;튜토리얼 다시 보기&rdquo;</b> 버튼으로 언제든 열 수 있어요
        </span>
      </>
    ),
    highlight: (
      <div className="flex items-center gap-3">
        <Link
          href="/about"
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <Info className="w-6 h-6 text-primary" />
          <span className="text-[10px] font-semibold">소개</span>
        </Link>
        <Link
          href="/guide"
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <Compass className="w-6 h-6 text-primary" />
          <span className="text-[10px] font-semibold">가이드</span>
        </Link>
      </div>
    ),
  },
];

/* ════════════════════════════════
   2. 컴포넌트
   ════════════════════════════════ */

export function WelcomeTutorial() {
  const { isOpen, step, init, close, next, prev } = useTutorialStore();
  const pathname = usePathname();

  // 튜토리얼은 홈 (/home) 에서만 자동 노출 — 랜딩/온보딩/기타 페이지에선 방해 X.
  // 단, useTutorialStore.open() 으로 수동 호출되면 어디서든 렌더링됨 (헤더 버튼으로 재시청 가능).
  const isHome = pathname === '/home';

  useEffect(() => {
    if (isHome) {
      init();
    }
  }, [init, isHome]);

  const isLast = step === TUTORIAL_TOTAL_STEPS - 1;
  const isFirst = step === 0;
  const current = STEPS[step];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={close}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl bg-card border border-border/60 shadow-2xl overflow-hidden"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <span className="text-[11px] text-muted-foreground font-semibold">
              {step + 1} / {TUTORIAL_TOTAL_STEPS}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="건너뛰기"
              className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 진행 바 */}
          <div className="h-1 bg-muted/40">
            <motion.div
              className="h-full bg-primary"
              initial={false}
              animate={{ width: `${((step + 1) / TUTORIAL_TOTAL_STEPS) * 100}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
            />
          </div>

          {/* 본문 */}
          <div className="px-6 pt-6 pb-5 min-h-[340px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="flex flex-col items-center text-center gap-3 flex-1"
              >
                <div className="text-5xl leading-none">{current.emoji}</div>
                <h2 className="text-lg font-bold">{current.title}</h2>

                {/* 하이라이트 일러스트 */}
                <div className="my-3 flex items-center justify-center h-20">
                  {current.highlight}
                </div>

                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {current.desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 푸터 네비 */}
          <div className="flex items-center justify-between p-4 border-t border-border/40 gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={isFirst}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/60 disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              이전
            </button>

            {/* 도트 인디케이터 */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted'
                  }`}
                />
              ))}
            </div>

            {isLast ? (
              <button
                type="button"
                onClick={close}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
              >
                시작하기
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
              >
                다음
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

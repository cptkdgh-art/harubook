/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 app/guide / 튜토리얼·FAQ 페이지
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

'use client';

import { useState } from 'react';
import {
  Compass,
  ChevronDown,
  ChevronRight,
  Flower2,
  Sparkles,
  TreePine,
  BookOpen,
  Settings,
  PlayCircle,
} from 'lucide-react';
import { BottomNav } from '@/components/ui/BottomNav';
import { useTutorialStore } from '@/lib/stores/useTutorialStore';

export default function GuidePage() {
  const openTutorial = useTutorialStore((s) => s.open);

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/30">
        <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">가이드</h1>
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
        <section className="text-center space-y-2 py-2">
          <div className="text-4xl">🧭</div>
          <h2 className="text-lg font-bold">5분이면 끝나요</h2>
          <p className="text-xs text-muted-foreground">
            하루책을 처음 쓰는 분을 위한 빠른 가이드
          </p>
        </section>

        {/* 5단계 튜토리얼 */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
            빠른 시작 5단계
          </h3>
          <div className="space-y-3">
            <StepCard
              n={1}
              icon={<Flower2 className="w-4 h-4 text-pink-500" />}
              title="4가지 소설 기본 설정"
            >
              소설의 방향은 <b>3가지 조합</b>으로 결정돼요. 모두 설정에서 언제든 바꿀 수 있어요.
              <ul className="mt-1.5 ml-1 space-y-1 text-[11px]">
                <li>
                  🌍 <b>세계관</b>: 현대판(카페·도시) / 판타지판(정령·별빛)
                </li>
                <li>
                  📖 <b>소설 취향</b>: 여성향(감성·관계 중심) / 남성향(서사·행동 중심)
                </li>
                <li>
                  🎨 <b>테마</b>: 봄·여름·가을·겨울 + 자동 (현재 달에 맞춰) — UI 색감만
                </li>
              </ul>
              <br />
              그리고 파트너 이름도 지어주세요. 이 이름이 소설 속에서 당신과 함께 자라요.
              <br />
              💡 세계관 × 취향 = <b>4가지 조합</b> 으로 같은 할 일도 완전히 다른 소설이 나와요.
            </StepCard>

            <StepCard
              n={2}
              icon={<Sparkles className="w-4 h-4 text-amber-500" />}
              title="AI 연결하기 (선택, 1분)"
            >
              AI 기능(채팅·소설 생성)을 쓰려면 OpenRouter 무료 키가 필요해요.
              <ol className="mt-1.5 ml-1 space-y-0.5 list-decimal list-inside text-[11px]">
                <li>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    openrouter.ai/keys
                  </a>{' '}
                  → Google 로그인
                </li>
                <li>Create Key → 생성된 긴 문자열 전체 복사</li>
                <li>
                  하루책 홈 → 우하단 <b>✨ 플로팅</b> → 설정 → 키 붙여넣기
                </li>
                <li>
                  추천 모델: <b>GPT-OSS 120B ⭐ 무료</b>
                </li>
              </ol>
              💡 AI 없이도 할 일·하루나무·파일 백업은 전부 작동해요.
            </StepCard>

            <StepCard
              n={3}
              icon={<Compass className="w-4 h-4 text-sky-500" />}
              title="첫 할 일 추가하기"
            >
              <b>두 가지 방법</b>:
              <ul className="mt-1.5 ml-1 space-y-0.5 list-disc list-inside text-[11px]">
                <li>
                  <b>수동</b>: 홈 화면 입력창 → 할 일 쓰고 Enter → 카테고리 칩 클릭
                </li>
                <li>
                  <b>AI 채팅</b>: ✨ 플로팅 → <i>&ldquo;내일 3시 회의&rdquo;</i> 같이 자연어로
                  → 자동 분류되어 캘린더에 바로 추가
                </li>
              </ul>
            </StepCard>

            <StepCard
              n={4}
              icon={<TreePine className="w-4 h-4 text-emerald-500" />}
              title="할 일 완료 → 나무 키우기"
            >
              체크박스 탭하면 포인트 획득:
              <ul className="mt-1.5 ml-1 space-y-0.5 text-[11px]">
                <li>💪 성장 · 🎨 창작 = +15P</li>
                <li>🤝 관계 = +12P</li>
                <li>🔧 유지 = +10P</li>
                <li>🧘 회복 = +8P</li>
              </ul>
              <br />
              🌰 0P → 🌱 30P → 🌿 100P → 🌳 250P → 🌸 500P → 🍎 900P → 🌲 1500P+
              <br />
              💡 나무 단계가 높을수록 소설에 기적 같은 순간이 더 많이 등장해요 (운 스탯).
            </StepCard>

            <StepCard
              n={5}
              icon={<BookOpen className="w-4 h-4 text-violet-500" />}
              title="주말에 이번 주 이야기 쓰기"
            >
              <b>이야기</b> 탭 → 기간 선택 후 <b>🎲 AI 자유 작성(무료)</b> 또는
              <b> ✍️ 커스텀 프롬프트(-150P)</b>
              <br />
              AI가 그 기간의 할 일을 파트너·운 스탯에 맞춰 소설로 엮어요
              (할 일 분량에 따라 약 1200~5000자, 많으면 2편 분할).
              <br />
              💡 연재니까 지난 화의 예고가 다음 화 첫 문장에 이어져요.
            </StepCard>
          </div>
        </section>

        {/* 메뉴별 설명 */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
            메뉴별 역할
          </h3>
          <div className="rounded-2xl border border-border/50 bg-card/60 divide-y divide-border/30">
            <MenuRow emoji="🏠" name="홈" desc="오늘의 할 일 + 하루나무 + 캘린더 스트립" />
            <MenuRow emoji="📖" name="이야기" desc="주간 소설 아카이브 + 생성 버튼" />
            <MenuRow emoji="📊" name="기록" desc="월별 완료율·포인트·히트맵·카테고리 통계" />
            <MenuRow emoji="ℹ️" name="소개" desc="앱 컨셉, 킥, 차별점, 만든 사람" />
            <MenuRow emoji="🧭" name="가이드" desc="지금 보고 있는 이 페이지 + FAQ" />
            <MenuRow emoji="⚙️" name="설정" desc="테마·파트너·AI·클라우드·요금제·초기화" />
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
            자주 묻는 질문
          </h3>
          <div className="space-y-2">
            <FaqItem q="AI 연결 안 하면 못 써요?">
              아니요. <b>할 일·하루나무·캘린더·월별 기록·파일 백업</b>은 전부 로컬로 작동해요.
              AI는 채팅으로 자연어 일정 추가와 소설 생성에만 필요해요.
            </FaqItem>
            <FaqItem q="내 데이터는 어디에 저장돼요?">
              브라우저의 IndexedDB(로컬)에 저장돼요. 로그인해도 클라우드 백업은{' '}
              <b>원할 때 수동으로만</b> 올려요. 자동 전송 없음.
            </FaqItem>
            <FaqItem q="OpenRouter 무료 모델이 왜 가끔 막혀요?">
              무료 모델은 글로벌 사용자 풀을 공유해요. 피크 시간에 rate limit이 걸릴 수 있어요.
              설정 → AI → 다른 무료 모델로 바꾸면 대부분 해결돼요.
            </FaqItem>
            <FaqItem q="기기를 바꾸면 기록이 날아가요?">
              <b>설정 → 파일로 저장하기 → 내보내기</b>로 JSON 파일 저장 → 새 기기에서{' '}
              <b>가져오기</b>로 복원. 로그인하면 곧 자동 동기화도 지원 예정.
            </FaqItem>
            <FaqItem q="소설이 맘에 안 들면 다시 쓸 수 있어요?">
              네. 이야기 아카이브에서 삭제 후 다시 생성하면 새로운 소설이 나와요. 같은 할 일
              데이터라도 매번 다르게 써져요 (temperature 0.85).
            </FaqItem>
            <FaqItem q="테마를 바꾸면 기존 소설도 바뀌어요?">
              기존에 쓴 소설은 그대로 남아요. <b>새로 생성하는 소설만</b> 새 테마 톤으로
              나와요. 테마는 앱의 시각(색·폰트·애니)만 바꿔요.
            </FaqItem>
            <FaqItem q="세계관과 소설 취향은 뭐가 달라요?">
              <b>세계관</b>은 배경·장르(현대판/판타지판)이고,{' '}
              <b>소설 취향</b>은 문체·초점(여성향/남성향)이에요. 둘은 독립적이라 자유롭게
              섞을 수 있어요. <b>테마(시각)</b>와도 완전히 분리돼서 &ldquo;겨울 테마 + 판타지판 +
              여성향&rdquo; 같은 조합도 가능해요.
            </FaqItem>
            <FaqItem q="하루나무는 어떻게 자라요?">
              할 일 완료마다 카테고리별로 8~15 포인트. 포인트가 쌓이면 단계가 올라가고, 높은
              단계일수록 다음 소설의 운 스탯이 높아져요. 게임처럼 키우는 재미 + 소설의 서사
              농도 조절.
            </FaqItem>
            <FaqItem q="무료 플랜만 써도 충분한가요?">
              네. 현재 하루책의 모든 핵심 기능은 무료에서 작동해요. 유료 플랜(플러스/프로)은
              "앱 제공 AI 크레딧·월간 에필로그·다중 파트너" 같은 부가 기능으로 곧 출시 예정.
            </FaqItem>
          </div>
        </section>

        {/* 홈 헤더 4개 토글 안내 */}
        <section className="rounded-2xl border border-border/50 bg-card/60 p-5 space-y-2">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> 홈 헤더 우상단 · 4개 빠른 토글
          </h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
            홈 화면 오른쪽 위에 파트너 인사 옆에 작은 원형 버튼 4개가 있어요.
            각 버튼을 탭하면 바로 설정이 바뀌어요.
          </p>
          <ul className="text-[11px] text-muted-foreground space-y-1.5 leading-relaxed">
            <li>
              <b className="text-primary">?</b> — 튜토리얼 다시 보기 (언제든 처음부터)
            </li>
            <li>
              <b className="text-primary">Aa</b> — 글씨 크기 4단계 순환{' '}
              <span className="text-[10px]">
                (보통 → 크게 → 더 크게 → 작게 → 보통)
              </span>
              <br />
              <span className="text-[10px] ml-4">
                UI 전체가 비례 스케일 (90%~125%). 모바일에서도 작동.
              </span>
            </li>
            <li>
              <b className="text-primary">✨ ON/OFF</b> — 꾸밈 애니메이션 켜고 끄기{' '}
              <span className="text-[10px]">(파티클·숨쉬기 효과)</span>
              <br />
              <span className="text-[10px] ml-4 text-amber-600 dark:text-amber-400">
                ⚠️ 파티클 애니메이션은 PC 전용입니다. 모바일은 성능·배터리를 위해
                자동으로 꺼져 있어요.
              </span>
            </li>
            <li>
              <b className="text-primary">🕰️</b> — UI 테마 순환{' '}
              <span className="text-[10px]">(자동 / 봄 / 여름 / 가을 / 겨울)</span>
            </li>
          </ul>
          <p className="text-[10px] text-muted-foreground/70 leading-relaxed pt-1">
            💡 모든 설정은 localStorage 에 저장돼서 새로고침해도 유지돼요.
          </p>
        </section>

        {/* 유용한 팁 */}
        <section className="rounded-2xl border border-border/50 bg-card/60 p-5 space-y-2">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> 꿀팁
          </h3>
          <ul className="text-[11px] text-muted-foreground space-y-1.5 leading-relaxed">
            <li>
              💬 AI 채팅 예시: <i>&ldquo;오늘 저녁 7시 운동&rdquo;</i>,{' '}
              <i>&ldquo;다음 주 월요일 병원&rdquo;</i>, <i>&ldquo;모레 오후 독서&rdquo;</i>
            </li>
            <li>📌 카테고리 고민되면 자동 분류 그대로 둬도 OK — 포인트만 다르게 쌓여요</li>
            <li>🌙 겨울 테마는 다크 모드가 자동 적용돼서 밤에 눈이 편해요</li>
            <li>
              🔍 글씨가 작다면 홈 우상단 <b>Aa</b> 버튼으로 한두 단계 키워보세요
            </li>
            <li>📆 월 헤더 탭하면 풀 캘린더 팝업이 뜨는 거 아세요?</li>
            <li>
              🔑 AI 키 입력 전에도 <b>파일로 저장하기</b>는 로그인 없이 바로 써요
            </li>
            <li>
              ✨ 이야기 탭의 <b>이야기 쓰기</b>는 9~15초 걸려요 (AI 응답 대기)
            </li>
          </ul>
        </section>

        <div className="text-center pt-2">
          <Settings className="w-4 h-4 text-muted-foreground/40 mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground/60">
            더 궁금한 점은 설정 → 초기화 → 온보딩 다시 하기로 처음부터 다시 경험해보세요
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

/* ════════════════════════════════
   Step Card
   ════════════════════════════════ */

function StepCard({
  n,
  icon,
  title,
  children,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4 flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold flex items-center gap-1.5 mb-1.5">
          {icon}
          {title}
        </h4>
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   Menu Row
   ════════════════════════════════ */

function MenuRow({ emoji, name, desc }: { emoji: string; name: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-lg">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold">{name}</div>
        <div className="text-[11px] text-muted-foreground line-clamp-1">{desc}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   FAQ Item (접기 가능)
   ════════════════════════════════ */

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-xs font-bold flex items-center gap-2">
          <span className="text-primary">Q</span>
          {q}
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        )}
      </button>
      {open ? (
        <div className="px-4 pb-3 pt-1 text-[11px] text-muted-foreground leading-relaxed">
          {children}
        </div>
      ) : null}
    </div>
  );
}

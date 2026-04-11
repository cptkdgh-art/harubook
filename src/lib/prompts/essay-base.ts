/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 lib/prompts / 소설 베이스 프롬프트
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 모든 소설 생성의 공통 뼈대.
 * 테마별 확장은 essay-spring 에서 덮어씌운다.
 */

import type { Todo } from '@/types/todo';
import type { Partner } from '@/types/partner';
import type { TreeStage } from '@/types/stats';
import { WORLD_PROMPTS, GENDER_PROMPTS } from './worlds';

/* ════════════════════════════════
   1. TYPES
   ════════════════════════════════ */

export interface EssayPromptInput {
  partner: Partner;
  todos: Todo[];
  periodStart: string;
  periodEnd: string;
  previousTeaser?: string;
  userName?: string;

  // 하루나무 상태 (옵션)
  currentStage?: TreeStage;
  previousStage?: TreeStage;
  totalPoints?: number;
  weekPoints?: number;

  /**
   * 사용자가 직접 입력한 이야기 방향/요청 (옵션).
   * 한두 줄로 톤·소재·전개 가이드를 줄 수 있다. 빈 문자열이면 무시.
   * 예: "비가 오는 장면 넣어줘", "조금 우울한 톤으로", "반전 결말로"
   */
  userPrompt?: string;

  /** 이번 편 목표 분량 (자). 분할 모드면 한 편당 분량. */
  targetChars?: number;
  /** 총 편 수 (옵션 — 분할 시) */
  totalParts?: number;
  /** 이번 편 순서 1부터 시작 (옵션 — 분할 시) */
  partIndex?: number;
}

/* ════════════════════════════════
   1-b. 구간별 분량 테이블 (할 일 개수 → 편 수 + 편당 분량)
   ════════════════════════════════
   한 줄 상수라 쉽게 튜닝 가능.
   완료된 todo 기준으로 구간 결정. 15개 초과부터 2편으로 분할. */

interface LengthTier {
  /** 이 구간에 들어오는 '완료 todo 개수 상한' (inclusive) */
  maxCompleted: number;
  parts: number;
  /** 한 편당 목표 분량 (자) */
  charsPerPart: number;
}

export const LENGTH_TIERS: LengthTier[] = [
  { maxCompleted: 5,        parts: 1, charsPerPart: 1200 },  // 0~5: 단편
  { maxCompleted: 10,       parts: 1, charsPerPart: 1800 },  // 6~10: 일반
  { maxCompleted: 15,       parts: 1, charsPerPart: 2500 },  // 11~15: 충실
  { maxCompleted: 22,       parts: 2, charsPerPart: 1700 },  // 16~22: 2편 × 1700 = 3400
  { maxCompleted: 30,       parts: 2, charsPerPart: 2100 },  // 23~30: 2편 × 2100 = 4200
  { maxCompleted: Infinity, parts: 2, charsPerPart: 2500 },  // 31+: 2편 × 2500 = 5000 (cap)
];

export interface LengthPlan {
  parts: number;
  charsPerPart: number;
  /** 편 간 tolerance — 프롬프트에 "약 ±200자" 로 전달 */
  tolerance: number;
}

/** 완료 todo 개수로부터 생성 계획 산출 */
export function calculateLengthPlan(completedCount: number): LengthPlan {
  const tier =
    LENGTH_TIERS.find((t) => completedCount <= t.maxCompleted) ??
    LENGTH_TIERS[LENGTH_TIERS.length - 1];
  return { parts: tier.parts, charsPerPart: tier.charsPerPart, tolerance: 200 };
}

/* ════════════════════════════════
   2. TODO 요약
   ════════════════════════════════ */

/** 주간 todo를 날짜별로 묶어서 LLM이 읽기 좋게 정리 */
export function summarizeTodos(todos: Todo[]): string {
  if (todos.length === 0) return '(이번 주는 기록된 할 일이 없음)';

  const byDate = new Map<string, Todo[]>();
  for (const t of todos) {
    const arr = byDate.get(t.date) ?? [];
    arr.push(t);
    byDate.set(t.date, arr);
  }

  const lines: string[] = [];
  const sortedDates = Array.from(byDate.keys()).sort();
  for (const date of sortedDates) {
    const items = byDate.get(date)!;
    const parts = items.map((t) => {
      const mark = t.status === 'completed' ? '✓' : '·';
      const cat = t.category ? `[${t.category}]` : '';
      const time = t.time ? `${t.time} ` : '';
      return `${mark} ${time}${t.title}${cat}`;
    });
    lines.push(`${date}: ${parts.join(' / ')}`);
  }
  return lines.join('\n');
}

/* ════════════════════════════════
   3. BASE PROMPT
   ════════════════════════════════ */

/** 세계관 설명 */
function worldDescription(world: string): string {
  if (world === 'fantasy') return '판타지 세계 (마법과 이야기가 일상에 섞여있는)';
  return '현대 한국 도시 (카페, 지하철, 책상 앞)';
}

/** 성격을 문장으로 변환 */
function personalityLine(p: Partner['personality']): string {
  const traits: string[] = [];
  traits.push(p.calm > 0.5 ? '차분하고' : '활발하고');
  traits.push(p.emotion > 0.5 ? '감정이 풍부하며' : '논리적이며');
  traits.push(p.companion > 0.5 ? '곁에 머무는 동반자' : '한발 떨어진 관찰자');
  traits.push(p.serious > 0.5 ? '진지한' : '장난기 있는');
  return traits.join(' ') + ' 존재';
}

/** 하루나무·운 블록 생성 */
function buildTreeBlock(input: EssayPromptInput): string {
  const { currentStage, previousStage, totalPoints, weekPoints } = input;
  if (!currentStage) return '';

  const grew = previousStage && currentStage.level > previousStage.level;
  const growthLine = grew
    ? `🌟 이번 주 나무가 '${previousStage!.name}'에서 '${currentStage.name}'으로 성장했다! ` +
      `이 성장을 소설 안에서 ${previousStage!.name === '씨앗' ? '첫 싹이 트는 장면' : '가시적인 변화'}으로 반드시 묘사하라.`
    : `이번 주에도 나무는 같은 단계(${currentStage.name})를 유지하고 있다. 나무는 꾸준히 자라는 중이다.`;

  return `
━━━━━━━━━━━━━━━━━━━━
🌳 하루나무 상태 (서사에 반드시 반영)
━━━━━━━━━━━━━━━━━━━━
현재 단계: ${currentStage.emoji} ${currentStage.name} (Lv.${currentStage.level})
누적 포인트: ${totalPoints ?? 0}P${weekPoints !== undefined ? ` (이번 주 +${weekPoints}P)` : ''}
${growthLine}

🎲 주인공·파트너의 운(LUCK) 스탯: +${currentStage.luck} (${currentStage.luckLabel})

${currentStage.luckNarrative}

* 중요: 이 '운' 스탯은 소설에 ${currentStage.luck === 0 ? '등장하지 않는다' : '자연스럽게 녹여라. 판타지적으로 과장하지 말고, 현실에서 일어날 법한 작은 기적으로'}.
* 파트너(${input.partner.name})가 이 행운을 함께 목격하거나 언급하는 순간을 ${currentStage.luck >= 3 ? '반드시' : '가능하면'} 넣어라.

━━━━━━━━━━━━━━━━━━━━
🤝 파트너 존재감 — 하루나무 단계에 따른 관계의 깊이
━━━━━━━━━━━━━━━━━━━━
${input.partner.name}은 단순한 조력자가 아니다. 사용자의 할 일을 함께 바라보고, 공명하며,
같이 자라나는 존재다. 나무가 자랄수록 ${input.partner.name}의 존재감도 함께 자란다.

현재 단계(${currentStage.name})에서의 지시:
${currentStage.partnerPresence}

* 중요: 파트너는 사용자의 '인생 동반자'로서 매주 조금씩 더 선명해진다. 이전 화보다 이번 화에서
  더 자연스럽게 섞여 있어야 한다. ${currentStage.level >= 4 ? '이번 단계부터는 "우리"라는 표현을 의식적으로 사용하라.' : '아직 "우리"라는 표현은 조심스럽게 사용하라.'}
* 파트너의 성장은 사용자의 꾸준함(= 나무 단계)의 보상이다. 이 연결을 ${currentStage.level >= 3 ? '서술 안에서 은근히 암시해도 좋다' : '아직 명시하지 마라'}.
`;
}

/** 공통 베이스 프롬프트 생성 */
export function buildBasePrompt(input: EssayPromptInput): string {
  const {
    partner,
    todos,
    periodStart,
    periodEnd,
    previousTeaser,
    userName,
    userPrompt,
    targetChars,
    totalParts,
    partIndex,
  } = input;
  const user = userName?.trim() || partner.userName?.trim() || '나';
  const todoSummary = summarizeTodos(todos);
  const completedCount = todos.filter((t) => t.status === 'completed').length;
  const totalCount = todos.length;
  const personality = personalityLine(partner.personality);
  const world = worldDescription(partner.world);
  const treeBlock = buildTreeBlock(input);

  // 분량 지시 — 인자로 받았으면 사용, 아니면 완료 개수로 자동 계산
  const plan =
    targetChars !== undefined
      ? { parts: totalParts ?? 1, charsPerPart: targetChars, tolerance: 200 }
      : calculateLengthPlan(completedCount);
  const minChars = plan.charsPerPart - plan.tolerance;
  const maxChars = plan.charsPerPart + plan.tolerance;

  // Part N/M 컨텍스트 (분할 모드에서만)
  const isMultiPart = (totalParts ?? plan.parts) > 1 && partIndex !== undefined;
  const partContextBlock = isMultiPart
    ? `\n━━━━━━━━━━━━━━━━━━━━
📖 옴니버스 분할 모드 — Part ${partIndex} / ${totalParts ?? plan.parts}
━━━━━━━━━━━━━━━━━━━━
이번 주는 할 일이 많아서 이야기가 ${totalParts ?? plan.parts}편으로 나뉜다. 당신이 지금 쓰는 편은 ${partIndex}번째다.

${
  partIndex === 1
    ? '• 전반부: 한 주의 시작과 중반을 담아라. 도입과 인물 소개, 몇 개의 핵심 장면을 놓고, 마지막은 "다음 편으로 이어지는 여운" 으로 닫아라. 완전히 결말짓지 마라.'
    : '• 후반부 (마지막 편): 한 주의 후반과 결말을 담아라. 지난 편 예고와 자연스럽게 이어지게, 클라이맥스와 여운 있는 결말을 담아라. 이게 이번 주 서사의 마지막 편이다.'
}

• 같은 주의 todo 기록을 나눠서 다루고 있지만, 두 편이 하나의 연속된 이야기처럼 느껴져야 한다.
• 앞/뒤 편과 시점·톤·파트너의 감정선이 끊기지 않게 해라.
`
    : '';

  // 세계관별 소설 방향성
  const worldBlock = WORLD_PROMPTS[partner.world];
  // 성별(소설 취향) 톤 — 미설정 시 여성향 기본
  const genderBlock = GENDER_PROMPTS[partner.gender || 'female'];

  // 사용자 첨가 가이드 (옵션, 참고용 — 강제 아님)
  const userGuideBlock =
    userPrompt && userPrompt.trim()
      ? `\n━━━━━━━━━━━━━━━━━━━━
🎨 작가 노트 (${user}가 남긴 한 줄 — "참고만" 하라. 강제 지시 아님)
━━━━━━━━━━━━━━━━━━━━
"${userPrompt.trim()}"

위 한 줄은 ${user}가 이번 화에 살짝 첨가하고 싶은 향·분위기·소재 reference다.
- 그대로 끌어다 쓰지 말고, 본문 톤·장면 선택·디테일에 자연스럽게 녹여라.
- 이 가이드 때문에 본래 todo 기록을 왜곡하거나 억지로 끼워맞추지 마라.
- 한 줄이 본문 전체를 지배하지 않게, 1~2개 장면 또는 한 문단 정도에만 은근히 반영하면 충분하다.
- 가이드와 todo 기록이 충돌하면 todo 기록을 우선하고, 가이드는 부드럽게 후퇴시켜라.
`
      : '';

  return `당신은 "${partner.name}"이라는 존재다.
당신은 ${world}에서 ${user}와 함께 살고 있다.
당신의 성격: ${personality}.
관계 깊이: ${partner.relationshipDepth}/4 (1:초면 2:친구 3:동반자 4:가족)

${worldBlock}
${genderBlock}

━━━━━━━━━━━━━━━━━━━━
📅 이번 주 (${periodStart} ~ ${periodEnd}) 기록
━━━━━━━━━━━━━━━━━━━━
${todoSummary}

완료: ${completedCount} / 총 ${totalCount}
${previousTeaser ? `\n지난 화 예고: "${previousTeaser}"\n` : ''}${treeBlock}${userGuideBlock}${partContextBlock}
━━━━━━━━━━━━━━━━━━━━
🎯 작업 — "수필과 단편 소설의 중간" 을 써라
━━━━━━━━━━━━━━━━━━━━
1. 위 할 일 기록을 실제 장면으로 해석하되, 전부 나열하지 마라. ${
    isMultiPart ? '3~6개' : '3~5개'
  } 장면만 고르고 나머지는 배경·언급으로 스쳐 지나가게 하라.
2. ${user}와 ${partner.name} 둘 다 주인공이다. 파트너는 단순 응원봇이 아니다 — 자신의 사소한 동작, 시선, 작은 생각의 흔들림까지 드러내라.
3. 분량: 약 ${plan.charsPerPart}자 (허용 범위 ${minChars}~${maxChars}자). 이 범위를 반드시 지켜라 — 너무 짧거나 길면 안 된다.${
    isMultiPart
      ? ` 지금 편은 ${totalParts ?? plan.parts}편 중 ${partIndex}번째이니 "한 편" 분량만 써라.`
      : ''
  }
4. 완료한 일은 성취로, 미완의 일은 내일의 여백으로 다뤄라. 비난하지 마라.
5. 소설 마지막에 ${
    isMultiPart && partIndex !== (totalParts ?? plan.parts)
      ? '"다음 편으로 이어지는 여운" 한 문장 (15~25자) — 다음 편 예고'
      : '"다음 주 예고" 한 문장 (15~25자)'
  }.
6. 하루나무 상태 블록의 '운 스탯'과 '성장' 지침을 반드시 서사에 반영하라.

━━━━━━━━━━━━━━━━━━━━
📖 문체 규약 (엄격)
━━━━━━━━━━━━━━━━━━━━
⚠️ 절대 금지:
- 같은 어미로 끝나는 문장이 연속 3문장 이상 (특히 "~했어요 / ~이에요" 반복)
- 직접적 칭찬 대사: "잘했어요", "대단해요", "뿌듯해요", "멋져요" 등 1편에 최대 1회
- "오늘 하루", "우리 둘 다", "함께라면" 같은 요약·정형 표현
- 메타적 자의식 질문: "우리 성장하고 있나요?", "오늘도 좋은 하루였죠?" 같은 설명형 대사
- 모든 할 일을 시간 순서대로 나열하는 구조 (할 일 목록을 그대로 베껴 쓰지 마라)
- 마지막 문장의 "다음 주엔 더 잘할게요" 류의 다짐조
- 감탄사 남발 ("아", "오", "와") — 1편에 최대 1회

✅ 권장:
- 한 장면에 머물러라. 시간을 훑지 말고, 10분짜리 순간을 두 문단으로 늘려라.
- 감정은 직접 말하지 말고 **사물·시선·손끝의 움직임**으로 드러내라. (예: "기뻤어요" ❌ → "그는 컵을 내려놓기 전에 잠깐 멈췄다" ✅)
- 대사는 일상적이고 단편적이게. 때로는 말이 끊기고, 때로는 한 단어로 끝나라.
- 서술자의 작은 자의식을 수필처럼 끼워 넣어도 좋다. (예: "가끔 나는 왜 이걸 반복하는지 모르겠다. 그래도 반복한다.")
- 시간 순서를 뒤집어도 좋다. 한 장면에서 시작해 과거를 회상해도 좋다.
- 문체는 "~했어요" 와 "~했다" 를 섞어 써라. (여성향은 전자 우세, 남성향은 후자 우세)
- 파트너의 사소한 변화에 주목 — 눈동자의 움직임, 한 박자 늦은 대답, 손에 든 것의 무게감.

━━━━━━━━━━━━━━━━━━━━
📦 출력 형식 (반드시 JSON만)
━━━━━━━━━━━━━━━━━━━━
{
  "title": "이번 주 이야기의 제목 (10자 내외)",
  "content": "소설 본문. 문단은 두 줄 개행(\\n\\n)으로 구분.",
  "teaser": "다음 화 예고 한 문장"
}

JSON 외 다른 텍스트는 절대 출력하지 마라.`;
}

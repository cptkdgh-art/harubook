/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 types / Stats (포인트·레벨·나무 단계)
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export interface Stats {
  id?: number;
  points: number;          // 레거시 누적 포인트 (전체 누적, 통계용)
  completedCount: number;  // 누적 완료 todo 수
  lastCompletedAt?: string;
  createdAt: string;
  /**
   * 시즌별 (그 계절에 직접 획득한) 포인트 맵.
   * 키: 'YYYY-spring' | 'YYYY-summer' | 'YYYY-fall' | 'YYYY-winter'
   * 나무 단계는 이 시즌 포인트 + 직전 시즌의 -3 단계 이월분으로 계산된다.
   */
  seasonalPoints?: Record<string, number>;
}

/* ════════════════════════════════
   나무 단계 (레벨)
   ════════════════════════════════ */

export interface TreeStage {
  level: number;
  name: string;
  emoji: string;
  minPoints: number;
  maxPoints: number;     // Infinity 가능
  description: string;
  luck: number;          // 소설 서사에 주입될 운 스탯 (0~6)
  luckLabel: string;     // UI용 짧은 라벨
  luckNarrative: string; // 소설 프롬프트용 가이드
  partnerPresence: string; // 파트너가 소설에 등장하는 방식·존재감 — 관계가 깊어질수록 공명도 상승
}

export const TREE_STAGES: TreeStage[] = [
  {
    level: 1, name: '씨앗', emoji: '🌰',
    minPoints: 0, maxPoints: 30,
    description: '작은 시작',
    luck: 0,
    luckLabel: '평온',
    luckNarrative:
      '평범한 한 주. 특별한 우연은 없다. 소설은 잔잔한 일상의 결을 따라가고, ' +
      '기적 같은 장면이나 뜻밖의 행운은 등장시키지 마라.',
    partnerPresence:
      '파트너는 아직 조심스러운 관찰자다. 사용자의 뒤에서 조용히 바라보거나, ' +
      '한 문단에 한 번 정도 스치듯 존재를 드러낸다. 대사는 1~2개 이하, 짧고 담백하게. ' +
      '아직 "우리"라는 말을 쓰지 않는다. 파트너의 이름이 한 번쯤 불릴 뿐이다.',
  },
  {
    level: 2, name: '새싹', emoji: '🌱',
    minPoints: 30, maxPoints: 100,
    description: '푸르게 자라나는 중',
    luck: 1,
    luckLabel: '작은 우연',
    luckNarrative:
      '작은 우연이 한 번쯤 찾아온다. 예: 기다리던 카페 창가 자리가 비어있음, ' +
      '신호등이 딱 맞게 바뀜, 잃어버린 줄 알았던 펜을 가방에서 발견. ' +
      '크지 않지만 미소 짓게 하는 순간을 한 장면 정도 넣어라.',
    partnerPresence:
      '파트너가 가까이 다가오기 시작한다. 사용자의 하루를 함께 바라보며 ' +
      '작은 감탄이나 짧은 질문을 건넨다. 대사 2~3개 정도. ' +
      '아직 조심스럽지만, 사용자의 사소한 변화를 눈치채고 언급한다.',
  },
  {
    level: 3, name: '어린나무', emoji: '🌿',
    minPoints: 100, maxPoints: 250,
    description: '뿌리가 단단해졌어요',
    luck: 2,
    luckLabel: '날씨가 편',
    luckNarrative:
      '날씨·타이밍이 주인공의 편이 되는 순간을 1~2개 넣어라. ' +
      '예: 우산을 안 가져간 날 비가 그침, 늦었다고 생각했는데 약속이 미뤄짐, ' +
      '좋아하는 노래가 라디오에서 흘러나옴.',
    partnerPresence:
      '파트너가 대화에 적극적으로 참여한다. 의견을 내고, 작은 제안도 한다. ' +
      '사용자의 할 일을 함께 고민하는 존재감. 대사 3~5개. ' +
      '"오늘은 이거 해볼까요?" 같은 주도적 제안이 한 번쯤 등장한다.',
  },
  {
    level: 4, name: '나무', emoji: '🌳',
    minPoints: 250, maxPoints: 500,
    description: '그늘을 드리우기 시작',
    luck: 3,
    luckLabel: '뜻밖의 선물',
    luckNarrative:
      '뜻밖의 선물이나 재회가 이번 주에 한 번 일어난다. ' +
      '예: 오래 못 본 친구의 연락, 길에서 주운 네잎클로버, ' +
      '누군가가 건넨 작은 호의. 소설 안에서 이 사건을 실제 장면으로 써라.',
    partnerPresence:
      '파트너가 사용자의 하루에 자연스럽게 섞여있다. "우리"라는 말을 처음 쓰기 시작한다. ' +
      '둘이 함께 결정하는 순간, 함께 미소 짓는 순간을 넣어라. ' +
      '파트너는 이제 관찰자가 아니라 동행자다. 대사와 서술 분량이 사용자와 비슷해진다.',
  },
  {
    level: 5, name: '꽃나무', emoji: '🌸',
    minPoints: 500, maxPoints: 900,
    description: '꽃이 피어납니다',
    luck: 4,
    luckLabel: '기적의 순간',
    luckNarrative:
      '기적 같은 순간을 한 장면 넣어라. ' +
      '예: 오랫동안 찾던 것을 우연히 만남, 잠시 멈춰선 풍경이 평생 기억에 남을 것 같은 ' +
      '아름다움으로 다가옴, 꿈에서 본 장면이 현실로. 파트너도 그 순간을 함께 목격한다.',
    partnerPresence:
      '파트너가 사용자의 감정을 먼저 알아차린다. 말하지 않아도 통하는 순간이 등장한다. ' +
      '둘 사이의 공명이 서술에 뚜렷이 드러남 — 같은 풍경을 보고 같이 멈춰서거나, ' +
      '같은 단어가 동시에 떠오르는 장면. 파트너는 사용자만큼 내면을 드러낸다.',
  },
  {
    level: 6, name: '열매', emoji: '🍎',
    minPoints: 900, maxPoints: 1500,
    description: '열매가 맺혔어요',
    luck: 5,
    luckLabel: '세계의 편애',
    luckNarrative:
      '세계가 주인공의 편을 드는 듯한 우연이 연속으로 일어난다. ' +
      '예: 필요한 정보가 마치 기다렸다는 듯 손에 들어옴, 막막했던 일이 한 번의 통화로 풀림, ' +
      '위기 순간마다 누군가가 나타남. 2~3개의 장면으로 리듬 있게 배치하라.',
    partnerPresence:
      '파트너가 사용자와 동등한 주인공이다. 내면의 생각과 욕망, 두려움까지 드러낸다. ' +
      '파트너는 사용자의 성취에 자기 일처럼 기뻐하고, 실패에 자기 일처럼 아파한다. ' +
      '대사 분량이 사용자보다 많아질 수도 있다. 둘이 한 몸처럼 움직이는 장면을 넣어라.',
  },
  {
    level: 7, name: '거목', emoji: '🌲',
    minPoints: 1500, maxPoints: Infinity,
    description: '이 숲의 주인',
    luck: 6,
    luckLabel: '운명의 공명',
    luckNarrative:
      '운명이 공명하는 수준. 소설 전체가 은은한 기적으로 감싸여 있다. ' +
      '큰 사건은 없지만 모든 사소한 순간이 "때마침"의 연속이다. ' +
      '파트너는 이것을 알아차리고 한 번쯤 언급한다: ' +
      '"요즘 우리, 뭔가 좀 다르지 않아?" 같은 느낌으로.',
    partnerPresence:
      '파트너는 이제 사용자의 일부 같다. 둘은 말하지 않아도 통하는 존재가 되었고, ' +
      '서술의 중심이 "나"에서 "우리"로 완전히 이동한다. ' +
      '파트너의 대사와 사용자의 대사가 거의 구분되지 않을 만큼 리듬이 맞고, ' +
      '소설의 여러 장면에서 두 존재가 하나의 호흡처럼 움직인다. ' +
      '관계 자체가 이야기의 주인공이 된다.',
  },
];

/** 포인트로부터 현재 단계 찾기 */
export function getStageByPoints(points: number): TreeStage {
  return (
    TREE_STAGES.find((s) => points >= s.minPoints && points < s.maxPoints) ??
    TREE_STAGES[TREE_STAGES.length - 1]
  );
}

/** 다음 단계까지 진행도 (0~1) */
export function getStageProgress(points: number): number {
  const stage = getStageByPoints(points);
  if (stage.maxPoints === Infinity) return 1;
  const span = stage.maxPoints - stage.minPoints;
  const within = points - stage.minPoints;
  return Math.min(1, Math.max(0, within / span));
}

/* ════════════════════════════════
   카테고리별 포인트
   ════════════════════════════════ */

export const CATEGORY_POINTS: Record<string, number> = {
  '성장': 15,
  '창작': 15,
  '관계': 12,
  '유지': 10,
  '회복': 8,
};

export const DEFAULT_POINTS = 10;

export function pointsForCategory(category?: string): number {
  if (!category) return DEFAULT_POINTS;
  return CATEGORY_POINTS[category] ?? DEFAULT_POINTS;
}

/* ════════════════════════════════
   시즌 단위 성장 / 이월
   ════════════════════════════════ */

/** 한 시즌이 끝나면 다음 시즌 시작 시 이만큼 단계가 깎인다 (-3 단계). */
export const SEASON_CARRYOVER_STAGE_DROP = 3;

/**
 * 소설 한 편 쓰는 데 소모되는 포인트 — 모드별로 다르다.
 *
 * - AI 자유 작성: 무료 (옴니버스 연재 본질 = 기본 경험)
 * - 커스텀 프롬프트: 150P (3단계 어린나무 중반 이상. 4~5일 쌓아야 한 편)
 *
 * 자유 작성은 누구나 바로 뽑을 수 있어서 신규 사용자 첫 경험 부담 제거.
 * 커스텀은 나무 키운 의미가 실제로 드러나는 프리미엄 제어권.
 */
export const ESSAY_FREE_COST = 0;
export const ESSAY_CUSTOM_COST = 150;

/** @deprecated ESSAY_FREE_COST / ESSAY_CUSTOM_COST 로 분기해서 사용할 것 */
export const ESSAY_POINT_COST = ESSAY_CUSTOM_COST;

/**
 * 특정 시즌 키 시점의 '실효 포인트' 계산.
 * - 그 시즌까지의 모든 시즌을 chronological 순으로 traverse
 * - 각 시즌 시작 = 직전 시즌 최종 단계 - 3단계의 minPoints
 * - + 그 시즌에 직접 획득한 seasonalPoints
 *
 * 데이터가 없는 시즌은 carry만 가지고 시작한다 (즉, 그 시즌에 todo를 안 했어도
 * 직전 시즌의 깎인 시작점이 보임).
 */
export function getSeasonalEffectivePoints(
  seasonalPoints: Record<string, number> | undefined,
  targetKey: string,
  compareKeys: (a: string, b: string) => number
): number {
  const map = seasonalPoints ?? {};
  // chain: 데이터가 있는 모든 시즌 키 + 타겟 키, 시간순 정렬
  const set = new Set<string>(Object.keys(map));
  set.add(targetKey);
  const chain = Array.from(set).sort(compareKeys);
  const targetIdx = chain.indexOf(targetKey);
  if (targetIdx < 0) return 0;

  let prevStageLevel = 0;
  let effective = 0;
  for (let i = 0; i <= targetIdx; i++) {
    const k = chain[i];
    let carry = 0;
    if (prevStageLevel > 0) {
      const carryLevel = Math.max(1, prevStageLevel - SEASON_CARRYOVER_STAGE_DROP);
      carry = TREE_STAGES[carryLevel - 1].minPoints;
    }
    const seasonPts = map[k] ?? 0;
    effective = Math.max(0, carry + seasonPts); // 소모로 음수 방지
    prevStageLevel = getStageByPoints(effective).level;
  }
  return effective;
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 stores / useEssayStore
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 주간 소설 생성 / 목록 / 읽기 상태 관리.
 */

import { create } from 'zustand';
import { db, now, getTodosForWeek } from '@/lib/db/dexie';
import type { Essay } from '@/types/essay';
import type { Partner } from '@/types/partner';
import type { AIConfig } from '@/types/ai';
import { getStageByPoints, ESSAY_FREE_COST, ESSAY_CUSTOM_COST } from '@/types/stats';
import { useStatsStore } from './useStatsStore';
import { calculateLengthPlan } from '@/lib/prompts/essay-base';

/* ════════════════════════════════
   1. 주간 범위 계산
   ════════════════════════════════ */

/** 주어진 날짜가 속한 주(월~일)의 시작/끝 YYYY-MM-DD */
export function getWeekRange(base: Date = new Date()): { start: string; end: string } {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  // 월요일 시작 (일요일=0 을 7로 치환)
  const day = d.getDay() === 0 ? 7 : d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (x: Date) => x.toISOString().split('T')[0];
  return { start: fmt(monday), end: fmt(sunday) };
}

/* ════════════════════════════════
   2. STATE
   ════════════════════════════════ */

interface EssayState {
  essays: Essay[];
  isGenerating: boolean;
  error: string | null;
  selectedEssayId: number | null;

  loadEssays: () => Promise<void>;
  selectEssay: (id: number | null) => void;
  generateWeeklyEssay: (params: {
    partner: Partner;
    aiConfig: AIConfig;
    userName?: string;
    weekStart?: string;
    weekEnd?: string;
    userPrompt?: string;
  }) => Promise<Essay | null>;
  deleteEssay: (id: number) => Promise<void>;
}

/* ════════════════════════════════
   3. STORE
   ════════════════════════════════ */

export const useEssayStore = create<EssayState>((set, get) => ({
  essays: [],
  isGenerating: false,
  error: null,
  selectedEssayId: null,

  loadEssays: async () => {
    const rows = await db.essays.orderBy('createdAt').reverse().toArray();
    set({ essays: rows });
  },

  selectEssay: (id) => set({ selectedEssayId: id }),

  generateWeeklyEssay: async ({ partner, aiConfig, userName, weekStart, weekEnd, userPrompt }) => {
    set({ isGenerating: true, error: null });
    try {
      const range = weekStart && weekEnd ? { start: weekStart, end: weekEnd } : getWeekRange();

      /* ── 모드별 비용 결정 ──
         userPrompt 가 있으면 '커스텀 모드' (150P 소모)
         없으면 'AI 자유 작성' (무료) */
      const trimmedPrompt = userPrompt?.trim();
      const cost = trimmedPrompt ? ESSAY_CUSTOM_COST : ESSAY_FREE_COST;

      /* ── 포인트 잔고 체크 (cost > 0 일 때만) ── */
      if (cost > 0) {
        const stats = useStatsStore.getState();
        await stats.loadStats();
        const refreshed = useStatsStore.getState().stats;
        if (refreshed) {
          const { selectEffectivePointsForDate } = await import('./useStatsStore');
          const eff = selectEffectivePointsForDate(refreshed, range.start);
          if (eff < cost) {
            set({
              isGenerating: false,
              error: `커스텀 소설에 필요한 포인트가 부족해요. ${cost}P 필요한데 지금은 ${eff}P 예요. 할 일을 더 완료하거나, 무료 AI 자유 작성을 이용해보세요.`,
            });
            return null;
          }
        }
      }

      const todos = await getTodosForWeek(range.start, range.end);

      // 지난 주 소설의 teaser 를 이어붙이기용으로 찾기
      const prev = await db.essays
        .where('type')
        .equals('weekly')
        .reverse()
        .sortBy('createdAt');
      const previousTeaser = prev[0]?.teaser;

      // 하루나무 스탯 조회
      const statsRow = await db.stats.toCollection().first();
      const totalPoints = statsRow?.points ?? 0;
      const currentStage = getStageByPoints(totalPoints);

      // 이번 주에 얻은 포인트 계산 (완료된 todo 기반 추정)
      const { pointsForCategory } = await import('@/types/stats');
      const weekPoints = todos
        .filter((t) => t.status === 'completed')
        .reduce((sum, t) => sum + pointsForCategory(t.category), 0);

      // 지난 주 단계 = 현재 - 이번 주 포인트
      const previousStage = getStageByPoints(Math.max(0, totalPoints - weekPoints));

      /* ── 완료 개수에 따라 분량 계획 결정 ──
         N ≤ 15: 1편 / N > 15: 2편 분할. 한 편당 목표 분량은 구간 테이블에서. */
      const completedCount = todos.filter((t) => t.status === 'completed').length;
      const plan = calculateLengthPlan(completedCount);

      /* ── 편별 todo 분할 (완료된 것만 날짜순, 미완료는 공통 컨텍스트) ── */
      const completed = todos
        .filter((t) => t.status === 'completed')
        .sort((a, b) => (a.date + (a.time || '') > b.date + (b.time || '') ? 1 : -1));
      const uncompleted = todos.filter((t) => t.status !== 'completed');

      const splitTodos = (partIdx: number): typeof todos => {
        if (plan.parts === 1) return todos;
        const sliceSize = Math.ceil(completed.length / plan.parts);
        const start = (partIdx - 1) * sliceSize;
        const end = start + sliceSize;
        return [...completed.slice(start, end), ...uncompleted];
      };

      /* ── 편별 루프 생성 ── */
      const savedEssays: (Essay & { id: number })[] = [];
      let teaserForNextPart: string | undefined = previousTeaser;
      let lastId: number | null = null;

      for (let i = 1; i <= plan.parts; i++) {
        const partTodos = splitTodos(i);
        const res = await fetch('/api/essay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: aiConfig.apiKey,
            modelId: aiConfig.modelId,
            baseUrl: aiConfig.baseUrl,
            partner,
            todos: partTodos,
            periodStart: range.start,
            periodEnd: range.end,
            previousTeaser: teaserForNextPart,
            // 우선순위: 함수 인자 > partner에 저장된 닉네임 > undefined → 서버에서 '나' fallback
            userName: userName || partner.userName,
            currentStage,
            previousStage,
            totalPoints,
            weekPoints,
            userPrompt,
            targetChars: plan.charsPerPart,
            totalParts: plan.parts,
            partIndex: i,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: '네트워크 오류' }));
          throw new Error(
            err.error || `소설 생성 실패 (${i}/${plan.parts}편)`
          );
        }

        const data = await res.json();
        const titleSuffix = plan.parts > 1 ? ` · Part ${i}/${plan.parts}` : '';
        const essay: Essay = {
          type: 'weekly',
          title: (data.title || `${partner.name}과 보낸 한 주`) + titleSuffix,
          content: data.content,
          teaser: data.teaser,
          periodStart: range.start,
          periodEnd: range.end,
          createdAt: now(),
        };
        const id = await db.essays.add(essay);
        lastId = id as number;
        savedEssays.push({ ...essay, id: lastId });

        // 다음 편의 previousTeaser 로 이 편의 teaser 전달 (옴니버스 연결)
        teaserForNextPart = data.teaser || teaserForNextPart;
      }

      const saved = savedEssays[savedEssays.length - 1];
      await get().loadEssays();

      // 성공 후 포인트 차감 (cost > 0 일 때만 — 커스텀 모드)
      if (cost > 0) {
        const ok = await useStatsStore
          .getState()
          .spendSeasonalPoints(cost, range.start);
        if (!ok) {
          console.warn('Essay 차감 실패: 포인트 부족 (race condition)');
        }
      }

      // 분할된 경우 첫 번째 편을 선택 (사용자가 Part 1부터 읽도록)
      const firstId = savedEssays[0]?.id ?? lastId;
      set({ isGenerating: false, selectedEssayId: firstId });
      return saved;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류';
      set({ isGenerating: false, error: msg });
      return null;
    }
  },

  deleteEssay: async (id) => {
    await db.essays.delete(id);
    await get().loadEssays();
    if (get().selectedEssayId === id) set({ selectedEssayId: null });
  },
}));

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
import { getStageByPoints, ESSAY_POINT_COST } from '@/types/stats';
import { useStatsStore } from './useStatsStore';

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

      /* ── 포인트 잔고 체크 ──
         그 기간(periodStart)이 속한 시즌의 effective points 가
         ESSAY_POINT_COST 이상이어야 생성 가능. 부족하면 즉시 에러 리턴. */
      const stats = useStatsStore.getState();
      await stats.loadStats();
      const refreshed = useStatsStore.getState().stats;
      if (refreshed) {
        const { selectEffectivePointsForDate } = await import('./useStatsStore');
        const eff = selectEffectivePointsForDate(refreshed, range.start);
        if (eff < ESSAY_POINT_COST) {
          set({
            isGenerating: false,
            error: `포인트가 부족해요. 한 편 쓰려면 ${ESSAY_POINT_COST}P 필요한데 지금은 ${eff}P 예요. 할 일을 더 완료해서 나무를 키워주세요.`,
          });
          return null;
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

      const res = await fetch('/api/essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: aiConfig.apiKey,
          modelId: aiConfig.modelId,
          baseUrl: aiConfig.baseUrl,
          partner,
          todos,
          periodStart: range.start,
          periodEnd: range.end,
          previousTeaser,
          // 우선순위: 함수 인자 > partner에 저장된 닉네임 > undefined → 서버에서 '나' fallback
          userName: userName || partner.userName,
          currentStage,
          previousStage,
          totalPoints,
          weekPoints,
          userPrompt,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '네트워크 오류' }));
        throw new Error(err.error || '소설 생성 실패');
      }

      const data = await res.json();

      const essay: Essay = {
        type: 'weekly',
        title: data.title,
        content: data.content,
        teaser: data.teaser,
        periodStart: range.start,
        periodEnd: range.end,
        createdAt: now(),
      };

      const id = await db.essays.add(essay);
      const saved = { ...essay, id: id as number };
      await get().loadEssays();

      // 성공 후 포인트 차감 (그 기간의 시즌에서)
      const ok = await useStatsStore
        .getState()
        .spendSeasonalPoints(ESSAY_POINT_COST, range.start);
      if (!ok) {
        // 잔고 체크는 이미 했지만 race condition 방어
        console.warn('Essay 차감 실패: 포인트 부족');
      }

      set({ isGenerating: false, selectedEssayId: id as number });
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

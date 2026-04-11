/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 app/story / 소설 아카이브 + 기간 선택 생성
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Sparkles, Loader2, Wand2, ChevronDown, ChevronUp, Coins } from 'lucide-react';
import { useEssayStore, getWeekRange } from '@/lib/stores/useEssayStore';
import { usePartnerStore } from '@/lib/stores/usePartnerStore';
import { useAIStore } from '@/lib/stores/useAIStore';
import {
  useStatsStore,
  selectEffectivePointsForDate,
} from '@/lib/stores/useStatsStore';
import { ESSAY_POINT_COST } from '@/types/stats';
import { EssayCard } from '@/components/story/EssayCard';
import { EssayReader } from '@/components/story/EssayReader';
import { PeriodPicker, type PeriodValue } from '@/components/story/PeriodPicker';
import { BottomNav } from '@/components/ui/BottomNav';
import type { Essay } from '@/types/essay';

export default function StoryPage() {
  const {
    essays,
    isGenerating,
    error,
    selectedEssayId,
    loadEssays,
    selectEssay,
    generateWeeklyEssay,
    deleteEssay,
  } = useEssayStore();
  const { partner, loadPartner } = usePartnerStore();
  const { config, loadConfig } = useAIStore();
  const { stats, loadStats } = useStatsStore();
  const [showSetupHint, setShowSetupHint] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [promptOpen, setPromptOpen] = useState(false);

  // 기본 기간: 이번 주
  const initialPeriod = useMemo<PeriodValue>(() => {
    const { start, end } = getWeekRange();
    return { start, end, label: '이번 주' };
  }, []);
  const [period, setPeriod] = useState<PeriodValue>(initialPeriod);

  useEffect(() => {
    loadEssays();
    loadPartner();
    loadConfig();
    loadStats();
  }, [loadEssays, loadPartner, loadConfig, loadStats]);

  // 그 기간의 시즌 effective points
  const effectivePoints = useMemo(
    () => selectEffectivePointsForDate(stats, period.start),
    [stats, period.start]
  );
  const canAfford = effectivePoints >= ESSAY_POINT_COST;
  const shortBy = Math.max(0, ESSAY_POINT_COST - effectivePoints);

  const selectedEssay = useMemo(
    () => essays.find((e) => e.id === selectedEssayId) || null,
    [essays, selectedEssayId]
  );

  const handleGenerate = async () => {
    if (!partner) return;
    if (!config?.apiKey) {
      setShowSetupHint(true);
      return;
    }
    setShowSetupHint(false);
    const result = await generateWeeklyEssay({
      partner,
      aiConfig: config,
      weekStart: period.start,
      weekEnd: period.end,
      userPrompt: userPrompt.trim() || undefined,
    });
    if (result) {
      // 성공 시 입력란 비우기
      setUserPrompt('');
      setPromptOpen(false);
    }
  };

  const handleRegenerate = async (essay: Essay) => {
    if (!partner || !config?.apiKey) {
      setShowSetupHint(true);
      return;
    }
    await generateWeeklyEssay({
      partner,
      aiConfig: config,
      weekStart: essay.periodStart,
      weekEnd: essay.periodEnd,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/30">
        <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">이야기</h1>
          </div>
          {partner ? (
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-medium">{partner.name}</span>
              과 쌓아가는 옴니버스 연재
            </p>
          ) : null}
        </div>
      </header>

      <main className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* 기간 선택 */}
        <PeriodPicker value={period} onChange={setPeriod} />

        {/* 포인트 상태 + 작가 노트 + CTA */}
        <div className="rounded-2xl border border-border/50 bg-card/60 p-3 space-y-3">
          {/* 포인트 잔고 라인 */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span>이 시즌 포인트</span>
              <b className={canAfford ? 'text-primary' : 'text-destructive'}>
                {effectivePoints.toLocaleString()}P
              </b>
            </div>
            <span className="text-muted-foreground/70">
              한 편 = <b className="text-foreground/80">{ESSAY_POINT_COST}P</b>
            </span>
          </div>

          {/* 작가 노트 토글 (선택) */}
          <button
            type="button"
            onClick={() => setPromptOpen((v) => !v)}
            className="w-full flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5" />
              작가 노트 (선택) — 한 줄 첨가
            </span>
            {promptOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {promptOpen && (
            <div className="space-y-1">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value.slice(0, 120))}
                placeholder="예: 비 오는 장면 살짝 / 약간 쓸쓸한 톤 / 재회 모티프 살짝 섞어줘"
                rows={2}
                className="w-full resize-none rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs leading-relaxed focus:border-primary focus:outline-none placeholder:text-muted-foreground/40"
              />
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                📌 강제 지시 아니에요. AI가 톤·디테일에 살짝 첨가하는 reference로만 써요. {userPrompt.length}/120
              </p>
            </div>
          )}

          {/* 생성 CTA */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !partner || !canAfford}
            className="harubook-cta w-full rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-4 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-semibold text-sm">이야기를 쓰는 중…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold text-sm">
                    {canAfford
                      ? `이 기간으로 이야기 쓰기 · -${ESSAY_POINT_COST}P`
                      : `포인트 ${shortBy}P 더 필요`}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-80 mt-1">
              {period.label} · {period.start} ~ {period.end}
            </p>
          </button>

          {!canAfford && !isGenerating && (
            <p className="text-[10px] text-muted-foreground/70 text-center leading-relaxed">
              🌱 할 일을 더 완료해 나무를 키우면 한 편 더 쓸 수 있어요.
              <br />
              한 편 쓰면 그 시즌 단계가 살짝 떨어지고, 다시 자라서 또 한 편을 쓰는 사이클이에요.
            </p>
          )}
        </div>

        {/* AI 미설정 힌트 */}
        {showSetupHint ? (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-700 dark:text-amber-400">
            먼저 홈 화면의 채팅 버튼에서 AI 설정(OpenRouter 키)을 해주세요.
          </div>
        ) : null}

        {/* 에러 */}
        {error ? (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
            {error}
          </div>
        ) : null}

        {/* 아카이브 헤더 */}
        {essays.length > 0 ? (
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span className="font-semibold">📚 아카이브</span>
            <span>{essays.length}화 연재됨</span>
          </div>
        ) : null}

        {/* 목록 */}
        {essays.length === 0 ? (
          <div className="text-center py-16 px-4">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              아직 쓰여진 이야기가 없어요.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              위에서 기간을 고르고 첫 화를 만들어 보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {essays.map((essay) => (
              <EssayCard
                key={essay.id}
                essay={essay}
                onClick={() => selectEssay(essay.id!)}
                onDelete={deleteEssay}
                onRegenerate={handleRegenerate}
                busy={isGenerating}
              />
            ))}
          </div>
        )}
      </main>

      {/* 상세 리더 */}
      {selectedEssay ? (
        <EssayReader essay={selectedEssay} onClose={() => selectEssay(null)} />
      ) : null}

      <BottomNav />
    </div>
  );
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/tree / TreeGrowthGallery
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 4계절 × 7단계 나무 성장 그리드 팝업.
 * 소개 페이지의 하루나무 카드에 작은 토글 버튼으로 붙는다.
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X } from 'lucide-react';
import { TreeSVG } from './HaruTree';
import { SEASON_CONFIG, type SeasonType } from '@/lib/seasons';

const SEASONS: SeasonType[] = ['spring', 'summer', 'fall', 'winter'];
const LEVELS = [1, 2, 3, 4, 5, 6, 7];
const LEVEL_NAMES = ['씨앗', '새싹', '어린나무', '나무', '꽃나무', '열매', '거목'];

export function TreeGrowthGallery() {
  const [open, setOpen] = useState(false);
  const [season, setSeason] = useState<SeasonType>('spring');

  const cfg = SEASON_CONFIG[season];

  const treeStyle = useMemo<React.CSSProperties & Record<`--${string}`, string>>(
    () => ({
      '--haru-leaf-light': cfg.leafColors.light,
      '--haru-leaf-dark': cfg.leafColors.dark,
      '--haru-trunk-light': cfg.trunkColors.light,
      '--haru-trunk-dark': cfg.trunkColors.dark,
      '--haru-blossom': cfg.blossomColor,
      '--haru-fruit': cfg.fruitColor,
    }),
    [cfg]
  );

  return (
    <>
      {/* 토글 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-[10px] font-medium hover:bg-primary/10 transition-colors"
      >
        <Sprout className="w-3 h-3" />
        성장 곡선 보기
      </button>

      {/* 팝업 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full sm:max-w-md bg-card border border-border/60 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* 헤더 */}
              <div className="px-5 pt-5 pb-3 border-b border-border/40 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-primary" />
                    하루나무 성장 곡선
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    계절마다 나무 모양·색이 달라져요. 현재 달에 맞춰 자동 전환.
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center"
                  aria-label="닫기"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 계절 탭 */}
              <div className="px-5 py-3 flex gap-1.5 overflow-x-auto">
                {SEASONS.map((s) => {
                  const meta = SEASON_CONFIG[s];
                  const active = s === season;
                  return (
                    <button
                      key={s}
                      onClick={() => setSeason(s)}
                      className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                        active
                          ? 'border-primary bg-primary/10 text-primary scale-[1.02]'
                          : 'border-border/50 bg-background/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{meta.emoji}</span>
                      {meta.label}
                      <span className="text-[9px] opacity-60">{meta.months}</span>
                    </button>
                  );
                })}
              </div>

              {/* 성장 그리드 */}
              <div
                className="flex-1 overflow-y-auto px-5 pb-5"
                style={treeStyle}
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {LEVELS.map((lv, i) => (
                    <div
                      key={lv}
                      className="rounded-xl border border-border/40 bg-background/50 p-2 flex flex-col items-center gap-1"
                    >
                      <div className="w-full aspect-square">
                        <TreeSVG level={lv} treeShape={cfg.treeShape} />
                      </div>
                      <div className="text-[9px] font-bold text-foreground/80">
                        Lv.{lv}
                      </div>
                      <div className="text-[9px] text-muted-foreground leading-none">
                        {LEVEL_NAMES[i]}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-muted-foreground/70 mt-4 leading-relaxed text-center">
                  {cfg.tagline}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

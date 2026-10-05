/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/chat / AI 설정 다이얼로그
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * OpenRouter 무료 키 발급 → 붙여넣기 → 모델 선택 3단계 튜토리얼.
 * 신용카드 없이 무료로 시작 가능.
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAIStore } from '@/lib/stores/useAIStore';
import { FREE_MODELS, PAID_MODELS, DEFAULT_MODEL } from '@/types/ai';
import { checkOpenRouterKey } from '@/lib/ai/keyFormat';
import {
  ExternalLink,
  Check,
  Key,
  Sparkles,
  Gift,
  Gem,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

/* ════════════════════════════════
   TYPES
   ════════════════════════════════ */

interface Props {
  open: boolean;
  onClose: () => void;
}

/* ════════════════════════════════
   COMPONENT
   ════════════════════════════════ */

export function AISetupDialog({ open, onClose }: Props) {
  const { config, saveConfig, isConfigured } = useAIStore();
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState(DEFAULT_MODEL.id);
  const [saving, setSaving] = useState(false);
  const [checkMessage, setCheckMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // 다이얼로그가 열릴 때만 기존 config → 로컬 state 동기화
  // (rerender-derived-state-no-effect: open 의존성으로 불필요한 재동기화 억제)
  useEffect(() => {
    if (open && config) {
      setApiKey(config.apiKey || '');
      setModelId(config.modelId || DEFAULT_MODEL.id);
    }
  }, [open, config]);

  const format = checkOpenRouterKey(apiKey);

  const handleSave = async () => {
    if (!format.ok) return;
    setSaving(true);
    setCheckMessage(null);
    // 저장 전에 OpenRouter 에 키가 살아 있는지 확인(과금 없음). 거부된 키는 저장하지 않는다.
    let result: { ok: boolean; message: string; unverified?: boolean } = { ok: true, message: '', unverified: true };
    try {
      const res = await fetch('/api/ai-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: format.key }),
      });
      result = await res.json();
    } catch {
      result = { ok: true, unverified: true, message: '연결 확인을 못 했어요. 키는 저장했어요.' };
    }
    if (!result.ok) {
      setCheckMessage({ ok: false, text: result.message });
      setSaving(false);
      return;
    }
    await saveConfig(format.key, modelId);
    setSaving(false);
    if (result.unverified) {
      setCheckMessage({ ok: true, text: result.message });
      return;
    }
    onClose();
  };

  const keyEntered = format.ok;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-5">

          {/* ════════════════════════════════
              타이틀
              ════════════════════════════════ */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-semibold mb-1">
              <Gift className="w-3 h-3" /> 무료로 시작
            </div>
            <h2 className="text-lg font-bold">AI 연결하기</h2>
            <p className="text-[11px] text-muted-foreground">
              신용카드 없이 1분 안에 설정할 수 있어요
            </p>
          </div>

          {/* ════════════════════════════════
              STEP 1 — OpenRouter 키 발급
              ════════════════════════════════ */}
          <section className="rounded-2xl border border-border/60 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                1
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-bold">OpenRouter 키 발급 (1분)</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  OpenRouter는 300+ AI 모델을 한 곳에서 쓸 수 있는 서비스예요.
                  Google 계정만 있으면 끝.
                </p>
              </div>
            </div>

            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/15 transition-colors text-sm font-semibold text-primary"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                openrouter.ai 에서 키 만들기
              </span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <ol className="text-[11px] text-muted-foreground space-y-1 pl-1">
              <li>
                <span className="font-mono text-primary/80">1</span>. 위 버튼 클릭 → 새 탭 열림
              </li>
              <li>
                <span className="font-mono text-primary/80">2</span>. 우측 상단 <b>Sign In</b> → Google 로그인
              </li>
              <li>
                <span className="font-mono text-primary/80">3</span>. <b>Create Key</b> 버튼 클릭
              </li>
              <li>
                <span className="font-mono text-primary/80">4</span>. 생성된 키 복사 (<code className="text-[10px]">sk-or-v1-...</code>)
              </li>
            </ol>
          </section>

          {/* ════════════════════════════════
              STEP 2 — 키 붙여넣기
              ════════════════════════════════ */}
          <section className="rounded-2xl border border-border/60 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                2
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> 여기에 붙여넣기
                </h3>
              </div>
              {keyEntered && (
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              )}
            </div>

            <Input
              type="password"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setCheckMessage(null); }}
              placeholder="sk-or-v1-..."
              className="h-10 font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
            />

            {apiKey.trim() && !format.ok && format.message && (
              <p className="text-[11px] text-amber-600">{format.message}</p>
            )}
            {checkMessage && (
              <p className={`text-[11px] ${checkMessage.ok ? 'text-emerald-600' : 'text-red-500'}`}>{checkMessage.text}</p>
            )}

            <p className="text-[10px] text-muted-foreground flex items-start gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
              키는 이 기기에만 저장돼요. AI를 부를 때만 하루책 서버를 거쳐 OpenRouter로 전달되고, 서버에는 남기지 않아요.
            </p>
          </section>

          {/* ════════════════════════════════
              STEP 3 — 모델 선택
              ════════════════════════════════ */}
          <section className="rounded-2xl border border-border/60 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                3
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-bold">모델 선택</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  처음이면 <b>무료 모델</b>로 시작하세요. 언제든 바꿀 수 있어요.
                </p>
              </div>
            </div>

            {/* 무료 모델 */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 mb-2">
                <Gift className="w-3 h-3" />
                무료 — 크레딧 없이 바로 사용
              </div>
              <div className="space-y-1.5">
                {FREE_MODELS.map((model) => (
                  <ModelCard
                    key={model.id}
                    id={model.id}
                    name={model.name}
                    selected={modelId === model.id}
                    onSelect={() => setModelId(model.id)}
                    isFree
                  />
                ))}
              </div>
            </div>

            {/* 유료 모델 */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 mb-2 mt-3">
                <Gem className="w-3 h-3" />
                유료 — 품질 ↑ (크레딧 충전 필요)
              </div>
              <div className="space-y-1.5">
                {PAID_MODELS.map((model) => (
                  <ModelCard
                    key={model.id}
                    id={model.id}
                    name={model.name}
                    selected={modelId === model.id}
                    onSelect={() => setModelId(model.id)}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 flex items-start gap-1">
                <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" />
                유료 모델을 쓰려면{' '}
                <a
                  href="https://openrouter.ai/credits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  openrouter.ai/credits
                </a>
                에서 $5부터 충전하세요.
              </p>
            </div>
          </section>

          {/* ════════════════════════════════
              저장 버튼
              ════════════════════════════════ */}
          <button
            onClick={handleSave}
            disabled={!keyEntered || saving}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground
              font-bold text-sm hover:bg-primary/90 active:scale-[0.98]
              disabled:opacity-30 transition-all"
          >
            {saving ? '키 확인 중…' : isConfigured ? '✓ 확인하고 설정 업데이트' : '✓ 확인하고 시작하기'}
          </button>

        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════
   ModelCard — 파일 스코프로 분리
   (rerender-no-inline-components 준수)
   ════════════════════════════════ */

interface ModelCardProps {
  id: string;
  name: string;
  selected: boolean;
  isFree?: boolean;
  onSelect: () => void;
}

function ModelCard({ name, selected, isFree, onSelect }: ModelCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition-all ${
        selected
          ? 'bg-primary/10 border border-primary/40 shadow-sm'
          : 'bg-muted/30 border border-transparent hover:bg-muted/50'
      }`}
    >
      <span className="flex items-center gap-2">
        <span className="font-medium">{name}</span>
        {isFree ? (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
            FREE
          </span>
        ) : null}
      </span>
      {selected ? <Check className="w-4 h-4 text-primary" /> : null}
    </button>
  );
}

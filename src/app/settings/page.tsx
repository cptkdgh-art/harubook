/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 app/settings / 설정 페이지
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 테마 변경, 파트너 이름 변경, AI 설정 재입장, 온보딩 재시작.
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flower2,
  BookOpen,
  Settings as SettingsIcon,
  Sparkles,
  RotateCcw,
  Trash2,
  Cloud,
  CloudUpload,
  CloudDownload,
  LogOut,
  Loader2,
  CheckCircle2,
  FileDown,
  FileUp,
  FileJson,
} from 'lucide-react';
import { exportToFile, parseFile, restoreFromPayload } from '@/lib/backup/file';
import { usePartnerStore } from '@/lib/stores/usePartnerStore';
import { useAIStore } from '@/lib/stores/useAIStore';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useBackupStore } from '@/lib/stores/useBackupStore';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { db } from '@/lib/db/dexie';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/ui/BottomNav';
import { AISetupDialog } from '@/components/chat/AISetupDialog';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { PricingPlans } from '@/components/pricing/PricingPlans';
import { usePwaStore } from '@/lib/stores/usePwaStore';
import { Smartphone, Bell, Lock } from 'lucide-react';
import type { ThemeType, WorldType, GenderType } from '@/types/partner';
import { WORLD_LABELS, GENDER_LABELS, THEME_LABELS, SEASON_MODE_LABELS } from '@/types/partner';
import { resolveSeason, SEASON_CONFIG } from '@/lib/seasons';

export default function SettingsPage() {
  const router = useRouter();
  const { partner, loadPartner, updatePartner } = usePartnerStore();
  const { config, loadConfig, clearConfig } = useAIStore();
  const { user, initialized, init, logout } = useAuthStore();
  const { canInstall, isInstalled, install } = usePwaStore();
  const {
    meta: backupMeta,
    error: backupError,
    successMessage: backupSuccess,
    loadMeta,
    clearFeedback,
  } = useBackupStore();
  const [nameInput, setNameInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [showAISetup, setShowAISetup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [fileStatus, setFileStatus] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [fileBusy, setFileBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPartner();
    loadConfig();
    init();
  }, [loadPartner, loadConfig, init]);

  // 로그인 되면 백업 메타 조회
  useEffect(() => {
    if (user?.uid) loadMeta(user.uid);
  }, [user?.uid, loadMeta]);

  // 피드백 3초 뒤 자동 소거
  useEffect(() => {
    if (backupSuccess || backupError) {
      const t = setTimeout(clearFeedback, 3500);
      return () => clearTimeout(t);
    }
  }, [backupSuccess, backupError, clearFeedback]);

  useEffect(() => {
    if (partner) {
      setNameInput(partner.name);
      setUserNameInput(partner.userName ?? '');
    }
  }, [partner]);

  const handleThemeChange = async (theme: ThemeType) => {
    if (!partner) return;
    await updatePartner({ theme });
  };

  const handleWorldChange = async (world: WorldType) => {
    if (!partner) return;
    await updatePartner({ world });
  };

  const handleGenderChange = async (gender: GenderType) => {
    if (!partner) return;
    await updatePartner({ gender });
  };

  // (season 필드는 제거됨 — theme이 시즌 역할도 흡수)

  const handleNameSave = async () => {
    if (!partner || !nameInput.trim() || nameInput === partner.name) return;
    await updatePartner({ name: nameInput.trim() });
  };

  const handleUserNameSave = async () => {
    if (!partner) return;
    const next = userNameInput.trim() || undefined;
    if (next === (partner.userName ?? undefined)) return;
    await updatePartner({ userName: next });
  };

  const handleResetOnboarding = async () => {
    if (!confirm('파트너 정보와 AI 설정이 모두 삭제됩니다. 온보딩을 다시 시작할까요?')) return;
    await db.partner.clear();
    await db.aiConfig.clear();
    router.push('/onboarding');
  };

  const handleExportFile = async () => {
    setFileStatus(null);
    setFileBusy(true);
    try {
      const result = await exportToFile();
      setFileStatus({
        type: 'success',
        msg: `📁 ${result.filename} 저장됨 (${result.itemCount}개 항목)`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '내보내기 실패';
      setFileStatus({ type: 'error', msg });
    } finally {
      setFileBusy(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileStatus(null);
    setFileBusy(true);
    try {
      const { payload, preview } = await parseFile(file);
      const total =
        preview.todos + preview.partner + preview.essays + preview.messages + preview.stats;
      if (
        !confirm(
          `이 파일을 가져오면 현재 기기 데이터가 덮어씌워져요.\n\n` +
          `내보낸 날짜: ${preview.exportedAt}\n` +
          `총 항목: ${total}개 (할 일 ${preview.todos} · 이야기 ${preview.essays} · 대화 ${preview.messages} · 스탯 ${preview.stats})\n\n` +
          `계속할까요?`
        )
      ) {
        setFileBusy(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      await restoreFromPayload(payload);
      setFileStatus({
        type: 'success',
        msg: `✅ 복원 완료 — ${total}개 항목 가져옴`,
      });
      // 모든 store 재로드
      await loadPartner();
      await loadConfig();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '가져오기 실패';
      setFileStatus({ type: 'error', msg });
    } finally {
      setFileBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearAllData = async () => {
    if (!confirm('정말로 모든 데이터(할 일, 이야기, 파트너, 설정)를 지우시겠어요? 복구할 수 없습니다.')) return;
    await db.todos.clear();
    await db.partner.clear();
    await db.essays.clear();
    await db.messages.clear();
    await db.aiConfig.clear();
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/30">
        <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">설정</h1>
        </div>
      </header>

      <main className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* ── 테마 (4계절 + 자동) ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">테마</h2>
          <p className="text-xs text-muted-foreground mb-3">
            앱의 색감·분위기예요. <b>자동</b>을 고르면 현재 달에 맞춰 전환돼요.
            <br />
            <span className="text-[10px]">
              💡 나무와 파티클은 테마 선택과 무관하게 <b>항상 현재 달</b> 기반이에요.
            </span>
          </p>
          {(() => {
            const currentTheme = partner?.theme ?? 'auto';
            const activeSeason = resolveSeason(currentTheme);
            const activeCfg = SEASON_CONFIG[activeSeason];
            return (
              <>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {(['auto', 'spring', 'summer', 'fall', 'winter'] as const).map((m) => {
                    const cfg = SEASON_MODE_LABELS[m];
                    const active = currentTheme === m;
                    const isAuto = m === 'auto';
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleThemeChange(m)}
                        className={`rounded-xl border-2 p-2 text-center transition-all relative ${
                          active
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border/50 hover:border-border'
                        }`}
                      >
                        <div className="text-xl mb-0.5">{cfg.emoji}</div>
                        <div className="text-[10px] font-bold">{cfg.label}</div>
                        {isAuto && (
                          <div className="text-[9px] text-primary mt-0.5 leading-none">
                            → {SEASON_CONFIG[activeSeason].emoji}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="rounded-xl bg-muted/30 p-3 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-base">{activeCfg.emoji}</span>
                    <b className="text-foreground">
                      {currentTheme === 'auto' ? `자동 → ${activeCfg.label}` : activeCfg.label}
                    </b>
                    <span className="text-[10px] text-muted-foreground/70">
                      · {activeCfg.months}
                    </span>
                  </div>
                  <p className="leading-relaxed">{activeCfg.tagline}</p>
                  {currentTheme === 'auto' && (
                    <p className="text-[10px] text-muted-foreground/70 mt-1.5 leading-relaxed">
                      📅 오늘이 {new Date().getMonth() + 1}월이라 <b>{activeCfg.label}</b> 테마로 자동 적용됐어요.
                      매월 1일에 다음 계절로 자동 전환돼요.
                    </p>
                  )}
                </div>
              </>
            );
          })()}
        </section>

        {/* ── 세계관 ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">소설 세계관</h2>
          <p className="text-xs text-muted-foreground mb-3">
            소설의 배경·장르·분위기가 여기서 결정돼요. 테마(시각)와는 별개예요.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['modern', 'fantasy'] as const).map((w) => {
              const cfg = WORLD_LABELS[w];
              const active = partner?.world === w;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleWorldChange(w)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    active
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{cfg.emoji}</span>
                    <span className="font-bold text-sm">{cfg.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{cfg.tagline}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 소설 취향 (여성향/남성향) ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">소설 취향</h2>
          <p className="text-xs text-muted-foreground mb-3">
            같은 세계관이라도 취향에 따라 문체·초점·장르 경향이 달라져요.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['female', 'male'] as const).map((g) => {
              const cfg = GENDER_LABELS[g];
              const active = (partner?.gender || 'female') === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenderChange(g)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    active
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{cfg.emoji}</span>
                    <span className="font-bold text-sm">{cfg.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{cfg.desc}</p>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground/70 mt-2 leading-relaxed">
            💡 보편적인 소설 시장의 톤을 힌트로 쓰는 거예요. 언제든 바꿀 수 있고, 다음에 쓸 소설에만 반영돼요.
          </p>
        </section>

        {/* ── 나의 이름 (사용자 닉네임) ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">나의 이름 (닉네임)</h2>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            소설에서 <b className="text-primary">주인공으로 등장</b>할 당신의 이름이에요.
            비워두면 그냥 &lsquo;나&rsquo;로 불려요.
          </p>
          <div className="flex gap-2">
            <Input
              value={userNameInput}
              onChange={(e) => setUserNameInput(e.target.value)}
              placeholder="예: 다인, 시연, 하준…"
              maxLength={12}
              className="flex-1"
            />
            <button
              onClick={handleUserNameSave}
              disabled={(userNameInput.trim() || undefined) === (partner?.userName ?? undefined)}
              className="px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
            >
              저장
            </button>
          </div>
          {partner?.userName ? (
            <p className="text-[10px] text-muted-foreground/70 mt-2">
              지금 당신은 소설에서 <b className="text-foreground">{partner.userName}</b>으로 불려요.
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground/70 mt-2">
              아직 닉네임이 없어서 소설에서 <b className="text-foreground">&lsquo;나&rsquo;</b>로 불려요.
            </p>
          )}
        </section>

        {/* ── 파트너 이름 ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">AI 파트너 이름</h2>
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
            당신과 <b className="text-primary">공명하는 AI 파트너</b>의 이름이에요.
            이 이름으로 당신에게 말을 걸고, 오늘의 할 일을 함께 바라보고,
            주간 소설의 또 한 명의 주인공이 돼요.
          </p>
          <p className="text-[11px] text-muted-foreground/80 mb-3 leading-relaxed">
            🌱 할 일을 꾸준히 해낼수록 파트너는 더 선명해지고, 소설 속에서
            당신과 함께 자라요. 처음엔 조용한 관찰자였다가, 점점 동행자가 되고,
            마지막엔 서로 말하지 않아도 통하는 존재가 돼요.
          </p>
          <div className="flex gap-2">
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="예: 보리, 그림자, 혹은 마음대로…"
              maxLength={12}
              className="flex-1"
            />
            <button
              onClick={handleNameSave}
              disabled={!nameInput.trim() || nameInput === partner?.name}
              className="px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
            >
              저장
            </button>
          </div>
          {partner ? (
            <p className="text-[10px] text-muted-foreground/70 mt-2">
              지금은 <b className="text-foreground">{partner.name}</b>이 당신과 함께 자라고 있어요.
            </p>
          ) : null}
        </section>

        {/* ── 앱 설치 (PWA) ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" /> 앱 설치
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            홈 화면에 추가하면 별도 앱처럼 전체화면으로 실행돼요.
          </p>

          {isInstalled ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  설치 완료
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  이미 앱으로 실행 중이에요
                </p>
              </div>
            </div>
          ) : canInstall ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📱</div>
                <div className="flex-1">
                  <p className="text-sm font-bold">하루책을 앱으로 쓰세요</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    홈 화면에 추가하면 브라우저 바 없이 전체화면, 오프라인 로컬 기능 전부 유지.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => install()}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >
                📲 홈 화면에 추가
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                💡 수동 설치 방법:
              </p>
              <ul className="text-[11px] text-muted-foreground space-y-1 pl-1">
                <li>
                  <b>iOS Safari</b>: 하단 공유 버튼 → <b>홈 화면에 추가</b>
                </li>
                <li>
                  <b>Android Chrome</b>: 우상단 ⋮ → <b>홈 화면에 추가</b>
                </li>
                <li>
                  <b>데스크탑 Chrome</b>: 주소창 우측 <b>⊕</b> 아이콘 → 설치
                </li>
              </ul>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                HTTPS 배포 환경에서 자동 설치 프롬프트가 떠요 (localhost 에선 제한적).
              </p>
            </div>
          )}
        </section>

        {/* ── 알림 (곧 출시) ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" /> 할 일 알림
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            시간이 다 되면 파트너가 알려주는 푸시 알림이에요.
          </p>
          <div className="rounded-2xl border-2 border-dashed border-border/60 bg-card/40 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl opacity-60">🔔</span>
              <div className="flex-1">
                <p className="text-sm font-bold flex items-center gap-1.5">
                  푸시 알림
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-bold">
                    곧 출시
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  백그라운드에서도 시간이 되면 알려드려요. Service Worker 기반.
                </p>
              </div>
              <Lock className="w-4 h-4 text-muted-foreground/50" />
            </div>
          </div>
        </section>

        {/* ── 클라우드 백업 ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" /> 클라우드 백업
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            로그인하면 다른 기기에서도 내 기록을 이어쓸 수 있어요.
          </p>

          {!isFirebaseConfigured ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                ⚠️ Firebase 미설정
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                개발자가 <code>.env.local</code> 에 Firebase 키를 넣어야 해요.
                (클라우드 백업 비활성)
              </p>
            </div>
          ) : !initialized ? (
            <div className="rounded-xl border border-border/50 p-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              연결 확인 중…
            </div>
          ) : !user ? (
            <div className="rounded-2xl border-2 border-dashed border-border/60 p-5 text-center space-y-3">
              <div className="text-3xl">🌱</div>
              <div>
                <p className="text-sm font-bold">로컬 모드</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  지금은 이 기기에만 저장되고 있어요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >
                ☁️ 로그인하고 백업 시작
              </button>
              <ul className="text-[10px] text-muted-foreground space-y-1 text-left pt-1">
                <li>✓ 다른 폰·노트북에서 이어쓰기</li>
                <li>✓ 할 일·이야기·하루나무 전부 동기화</li>
                <li>✓ 앱 지우고 재설치해도 복원 가능</li>
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="truncate">
                      {user.isAnonymous
                        ? '게스트 계정'
                        : user.displayName || user.email || '로그인됨'}
                    </span>
                    {user.isAnonymous ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600">
                        GUEST
                      </span>
                    ) : null}
                  </p>
                  {backupMeta ? (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      마지막 백업: {new Date(backupMeta.updatedAt).toLocaleString('ko-KR')} ·{' '}
                      {backupMeta.deviceLabel}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      아직 백업이 없어요
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="로그아웃"
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {backupError ? (
                <div className="rounded-lg bg-destructive/10 text-destructive text-[11px] p-2">
                  {backupError}
                </div>
              ) : null}
              {backupSuccess ? (
                <div className="rounded-lg bg-emerald-500/10 text-emerald-600 text-[11px] p-2">
                  {backupSuccess}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled
                  title="미니 플랜(990원/월)에서 곧 열려요"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/30 text-primary-foreground text-xs font-semibold opacity-70 cursor-not-allowed"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  지금 백업
                </button>
                <button
                  type="button"
                  disabled
                  title="미니 플랜(990원/월)에서 곧 열려요"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-semibold opacity-50 cursor-not-allowed"
                >
                  <CloudDownload className="w-3.5 h-3.5" />
                  가져오기
                </button>
              </div>

              <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                🔒 클라우드 저장은 서버 리소스가 들어서 <b className="text-primary">미니 플랜 (990원/월)</b>로 제공될 예정이에요.
                <br />
                지금은 아래 <b>파일로 저장하기</b>를 쓰시면 무료로 기기 간 이동 가능해요.
              </p>

              {user.isAnonymous ? (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    ⚠️ <b>게스트 계정</b>은 이 브라우저에만 연결돼요. 앱 삭제/쿠키 초기화 시 접근 불가.
                    다른 기기에서도 쓰려면 Google 또는 이메일로 전환하세요. (곧 지원)
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </section>

        {/* ── 파일 백업 (Firestore 불필요, 항상 작동) ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-1.5">
            <FileJson className="w-3.5 h-3.5" /> 파일로 저장하기
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            내 컴퓨터에 JSON 파일로 저장했다가 다른 기기에서 불러올 수 있어요.
            로그인 없이도 작동해요.
          </p>

          <div className="rounded-2xl border border-border/60 p-4 space-y-3">
            {fileStatus ? (
              <div
                className={`rounded-lg text-[11px] p-2.5 ${
                  fileStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {fileStatus.msg}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportFile}
                disabled={fileBusy}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
              >
                {fileBusy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                내보내기
              </button>

              <label
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-xs font-semibold cursor-pointer hover:bg-muted/50 ${
                  fileBusy ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                가져오기
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              💾 서버를 거치지 않아 프라이버시 완벽 · 영구 보관 가능
            </p>
          </div>
        </section>

        {/* ── 요금제 ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">요금제</h2>

          {/* 핵심 철학 박스 */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 mb-3 space-y-1.5">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              🌱 하루책의 본질은 <b>무료</b>예요
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              본인 OpenRouter 키만 있으면 <b>모든 핵심 기능이 무료</b>로 돌아가요.
              할 일·하루나무·주간 소설·AI 채팅·파일 백업 전부요.
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              유료 플랜은 <b className="text-primary">&ldquo;키 발급이 귀찮거나 익숙하지 않은 분들&rdquo;</b>을 위한
              편의 서비스예요. 우리가 크레딧을 대신 관리하고, 소소한 추가 혜택도 드려요.
            </p>
          </div>

          <PricingPlans user={user} onNotifyRequest={() => alert('출시 알림 신청! (곧 구현)')} />
        </section>

        {/* ── AI 설정 ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">AI 연결</h2>
          <p className="text-xs text-muted-foreground mb-3">
            OpenRouter 키를 넣어야 AI 채팅과 소설 생성이 가능해요.
          </p>
          <div className="rounded-xl border border-border/50 p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {config?.apiKey ? '연결됨' : '연결 안 됨'}
              </p>
              {config?.modelId && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {config.modelId}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAISetup(true)}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
              >
                {config?.apiKey ? '변경' : '연결하기'}
              </button>
              {config?.apiKey && (
                <button
                  onClick={async () => {
                    if (confirm('AI 연결을 해제할까요?')) await clearConfig();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground"
                >
                  해제
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── 위험 구역 ── */}
        <section>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">초기화</h2>
          <div className="space-y-2">
            <button
              onClick={handleResetOnboarding}
              className="w-full rounded-xl border border-border/50 p-3 text-left flex items-start gap-3 hover:bg-muted/40"
            >
              <RotateCcw className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">온보딩 다시 하기</p>
                <p className="text-[11px] text-muted-foreground">
                  파트너/테마/세계관을 다시 고릅니다. 할 일과 이야기는 남아요.
                </p>
              </div>
            </button>
            <button
              onClick={handleClearAllData}
              className="w-full rounded-xl border border-destructive/30 p-3 text-left flex items-start gap-3 hover:bg-destructive/5"
            >
              <Trash2 className="w-4 h-4 mt-0.5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">모든 데이터 삭제</p>
                <p className="text-[11px] text-muted-foreground">
                  할 일, 이야기, 파트너, AI 설정 전부. 복구 불가.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* ── 버전 ── */}
        <p className="text-center text-[10px] text-muted-foreground/60 pt-4">
          하루책 · 진폭 × 리듬-상호
        </p>
      </main>

      {/* AI 설정 다이얼로그 재사용 */}
      <AISetupDialog open={showAISetup} onClose={() => setShowAISetup(false)} />

      {/* 로그인 다이얼로그 */}
      <LoginDialog open={showLogin} onClose={() => setShowLogin(false)} />

      <BottomNav />
    </div>
  );
}

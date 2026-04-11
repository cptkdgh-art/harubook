/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/chat / ChatSheet
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Settings, Loader2, ChevronLeft } from 'lucide-react';
import { useChatStore } from '@/lib/stores/useChatStore';
import { useAIStore } from '@/lib/stores/useAIStore';
import { usePartnerStore } from '@/lib/stores/usePartnerStore';
import { useTodoStore } from '@/lib/stores/useTodoStore';
import { AISetupDialog } from './AISetupDialog';

/* ════════════════════════════════
   COMPONENT
   ════════════════════════════════ */

export function ChatSheet() {
  const { messages, isLoading, loadMessages, sendMessage } = useChatStore();
  const { config, isConfigured, loadConfig } = useAIStore();
  const { partner } = usePartnerStore();
  const { loadTodos } = useTodoStore();
  const [input, setInput] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConfig();
    loadMessages();
  }, [loadConfig, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!isConfigured || !config) {
      setShowSetup(true);
      return;
    }
    const msg = input.trim();
    setInput('');
    await sendMessage(msg, config);
    // Refresh todo list after AI action
    loadTodos();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="fixed bottom-20 right-5 z-40 h-14 w-14 rounded-2xl
            bg-primary text-primary-foreground shadow-lg shadow-primary/25
            hover:shadow-xl hover:scale-105 active:scale-95
            transition-all duration-200 flex items-center justify-center"
        >
          <Sparkles className="h-6 w-6" />
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="!h-[75vh] max-h-[75vh] min-h-[400px] rounded-t-3xl p-0 gap-0 overflow-hidden"
        >
          <div className="flex flex-col h-full">

            {/* ════════════════════════════════
                Header — 뒤로 + 타이틀 + 설정 (grid 3분할)
                ════════════════════════════════ */}
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-2 py-2 border-b border-border/30">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs font-medium">뒤로</span>
              </button>
              <div className="flex items-center justify-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm truncate">
                  {partner?.name || 'AI'}에게 말하기
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSetup(true)}
                aria-label="AI 설정"
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* ════════════════════════════════
                Messages
                ════════════════════════════════ */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {!isConfigured && (
                <div className="text-center py-8 space-y-3">
                  <div className="text-3xl">🔑</div>
                  <p className="text-sm text-muted-foreground">
                    AI를 사용하려면 설정이 필요해요
                  </p>
                  <button
                    onClick={() => setShowSetup(true)}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    AI 설정하기 →
                  </button>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                    {msg.action && msg.action.action !== 'chat' && (
                      <div className="mt-1 text-[10px] opacity-60">
                        ✓ {msg.action.action === 'add' ? '추가됨' :
                           msg.action.action === 'delete' ? '삭제됨' :
                           msg.action.action === 'update' ? '수정됨' : '처리됨'}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-3.5 py-2 rounded-2xl rounded-bl-md">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* ════════════════════════════════
                Input
                ════════════════════════════════ */}
            <div className="px-4 py-3 border-t border-border/30">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isConfigured ? '"내일 3시 회의" 같이 말해보세요' : 'AI 설정 먼저 해주세요'}
                  disabled={!isConfigured}
                  className="flex-1 h-10 bg-card/50 border-border/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || !isConfigured}
                  className="h-10 w-10 flex items-center justify-center rounded-xl
                    bg-primary text-primary-foreground disabled:opacity-30
                    transition-all active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </SheetContent>
      </Sheet>

      {/* AI Setup Dialog */}
      <AISetupDialog open={showSetup} onClose={() => setShowSetup(false)} />
    </>
  );
}

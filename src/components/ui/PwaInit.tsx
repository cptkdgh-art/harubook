/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 components/ui / PwaInit
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * PWA 상태 초기화만 담당하는 마운트 전용 컴포넌트.
 * beforeinstallprompt 리스너를 한 번만 등록.
 */

'use client';

import { useEffect } from 'react';
import { usePwaStore } from '@/lib/stores/usePwaStore';

export function PwaInit() {
  const init = usePwaStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return null;
}

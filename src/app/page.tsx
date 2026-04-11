/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 app / 루트 페이지 (온보딩 분기)
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db/dexie';

/* ════════════════════════════════ */

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const partner = await db.partner.toCollection().first();
      if (partner) {
        // 기존 사용자: 바로 홈
        router.replace('/home');
      } else {
        // 신규 방문자: 랜딩 먼저 (거기서 '바로 시작하기' → /onboarding)
        router.replace('/intro');
      }
      setChecking(false);
    }
    check();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="text-4xl">📘</div>
          <p className="text-muted-foreground text-sm">하루책을 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  return null;
}

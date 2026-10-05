/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 api/ai-check / OpenRouter 키 연결 확인
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 저장 전에 키가 실제로 살아 있는지 확인한다. OpenRouter 의 키 정보 조회(GET /api/v1/key)라
 * 모델 호출·과금이 없다. 키는 전달만 하고 저장·로그하지 않는다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkOpenRouterKey } from '@/lib/ai/keyFormat';

export async function POST(req: NextRequest) {
  let apiKey = '';
  try {
    ({ apiKey } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, message: '요청을 읽지 못했어요.' }, { status: 400 });
  }
  const format = checkOpenRouterKey(typeof apiKey === 'string' ? apiKey : '');
  if (!format.ok) return NextResponse.json({ ok: false, message: format.message || '키를 입력해 주세요.' });

  try {
    const res = await fetch('https://openrouter.ai/api/v1/key', {
      headers: { Authorization: `Bearer ${format.key}` },
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ ok: false, message: '🔑 OpenRouter가 이 키를 거부했어요. 삭제됐거나 잘못 복사된 키예요. 새 키를 만들어 붙여넣어 주세요.' });
    }
    if (!res.ok) {
      return NextResponse.json({ ok: true, unverified: true, message: `OpenRouter 확인이 잠시 안 돼요(HTTP ${res.status}). 키는 저장했어요.` });
    }
    const body = (await res.json()) as { data?: { is_free_tier?: boolean; limit_remaining?: number | null } };
    const free = body.data?.is_free_tier;
    return NextResponse.json({
      ok: true,
      message: free ? '✓ 연결됐어요. 크레딧이 없어서 무료 모델만 쓸 수 있어요.' : '✓ 연결됐어요. 무료·유료 모델 모두 쓸 수 있어요.',
      freeTier: !!free,
    });
  } catch {
    return NextResponse.json({ ok: true, unverified: true, message: 'OpenRouter에 연결하지 못했어요(네트워크). 키는 저장했으니 잠시 뒤 써 보세요.' });
  }
}

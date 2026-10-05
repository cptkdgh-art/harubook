/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 lib/ai / OpenRouter 키 형식 검사
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 붙여넣기에서 자주 생기는 실수(앞뒤 공백, 줄바꿈, "Bearer ", 따옴표)를 정리하고
 * 다른 회사 키를 넣었을 때 바로 알려준다. 실제 유효성은 /api/ai-check 가 확인.
 */

export interface KeyFormatResult {
  ok: boolean;
  key: string;
  message: string;
}

export function checkOpenRouterKey(raw: string): KeyFormatResult {
  const key = raw.trim().replace(/^Bearer\s+/i, '').replace(/^["'`]+|["'`]+$/g, '').trim();
  if (!key) return { ok: false, key, message: '' };
  if (/\s/.test(key)) return { ok: false, key, message: '키 중간에 공백이나 줄바꿈이 있어요. 키 값만 다시 붙여넣어 주세요.' };
  if (/^(AIza|AQ\.)/.test(key)) return { ok: false, key, message: 'Google(Gemini) 키예요. 하루책은 OpenRouter 키(sk-or-v1-…)만 받아요.' };
  if (/^sk-ant-/.test(key)) return { ok: false, key, message: 'Anthropic 키예요. 하루책은 OpenRouter 키(sk-or-v1-…)만 받아요.' };
  if (/^sk-(?!or-)/.test(key)) return { ok: false, key, message: 'OpenAI 키예요. 하루책은 OpenRouter 키(sk-or-v1-…)만 받아요.' };
  if (!key.startsWith('sk-or-')) return { ok: false, key, message: 'OpenRouter 키 형식이 아니에요. sk-or-v1- 로 시작하는 키를 붙여넣어 주세요.' };
  if (key.length < 30) return { ok: false, key, message: '키가 너무 짧아요. 발급 화면에서 전체 키를 다시 복사해 주세요.' };
  return { ok: true, key, message: '키 형식이 맞아요.' };
}

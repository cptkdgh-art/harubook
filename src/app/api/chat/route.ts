/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 api/chat / AI 채팅 프록시 (Vercel AI SDK v6 — 텍스트 파싱)
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * generateText + 프롬프트 기반 JSON 지시 + Zod 수동 검증.
 * Output.object 는 무료 모델 미지원이라 사용 안 함.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';

/* ════════════════════════════════
   1. Zod 스키마 (사후 검증용)
   ════════════════════════════════ */

const TodoActionSchema = z.object({
  action: z.enum(['add', 'update', 'delete', 'list', 'chat']),
  todos: z
    .array(
      z.object({
        title: z.string(),
        date: z.string(),
        time: z.string().optional(),
        category: z.enum(['성장', '회복', '관계', '창작', '유지']).optional(),
      })
    )
    .default([]),
  reply: z.string(),
});

type TodoAction = z.infer<typeof TodoActionSchema>;

/* ════════════════════════════════
   2. SYSTEM PROMPT BUILDER
   ════════════════════════════════ */

function buildSystemPrompt(): string {
  const now = new Date();
  const addDays = (d: number) => {
    const x = new Date(now);
    x.setDate(x.getDate() + d);
    return x.toISOString().split('T')[0];
  };
  const today = addDays(0);
  const tomorrow = addDays(1);
  const dayAfter = addDays(2);

  return `당신은 하루책 앱의 할 일 관리 AI 비서입니다. 반드시 JSON 한 덩어리만 출력하세요.
절대 설명, 마크다운 코드 블록, 추가 텍스트를 넣지 마세요. JSON 단독.

📅 날짜 기준 (반드시 사용):
- 오늘: ${today}
- 내일: ${tomorrow}
- 모레: ${dayAfter}

📦 반드시 이 JSON 형식 (다른 텍스트 금지):
{
  "action": "add" | "update" | "delete" | "list" | "chat",
  "todos": [
    {
      "title": "할 일 제목",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "category": "성장" | "회복" | "관계" | "창작" | "유지"
    }
  ],
  "reply": "30자 이내 친근한 한국어 답변"
}

🎯 분류:
- 일정/회의/약속/할 일/운동/공부 언급 → action "add"
- "넣어", "추가해", "할 거야", "있어" → action "add"
- "오늘 뭐 있어" → action "list"
- "안녕", "고마워" → action "chat"

📝 예시 입력과 출력:

입력: 내일 3시에 회의 있어
출력: {"action":"add","todos":[{"title":"회의","date":"${tomorrow}","time":"15:00","category":"유지"}],"reply":"내일 15시 회의 추가!"}

입력: 오늘 저녁 7시 운동
출력: {"action":"add","todos":[{"title":"운동","date":"${today}","time":"19:00","category":"성장"}],"reply":"오늘 19시 운동 추가!"}

입력: 오늘 뭐 남았어
출력: {"action":"list","todos":[],"reply":"오늘 할 일 보여줄게"}

입력: 안녕
출력: {"action":"chat","todos":[],"reply":"안녕! 오늘 뭐 할 계획이야?"}

⚠️ action 이 add/update/delete 일 때만 todos 배열을 채우고, 나머지는 빈 배열 [].
⚠️ time 과 category 는 모르면 생략 가능 (optional).
⚠️ 오직 JSON 한 덩어리. 설명 금지. 마크다운 금지.`;
}

/* ════════════════════════════════
   3. JSON 추출기 (robust)
   ════════════════════════════════ */

function extractJson(raw: string): unknown | null {
  if (!raw) return null;

  // 마크다운 코드 블록 제거
  let cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // 첫 { 부터 마지막 } 까지
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  cleaned = cleaned.slice(first, last + 1);

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/* ════════════════════════════════
   4. ROUTE HANDLER
   ════════════════════════════════ */

export async function POST(req: NextRequest) {
  try {
    const { message, apiKey, modelId, baseUrl } = await req.json();

    if (!apiKey || !modelId) {
      return NextResponse.json({ error: 'AI 설정이 필요해요' }, { status: 400 });
    }

    // 키 길이 검증
    if (typeof apiKey !== 'string' || apiKey.trim().length < 30) {
      return NextResponse.json({
        action: 'chat',
        todos: [],
        reply:
          'OpenRouter 키가 너무 짧아요. 설정에서 키를 다시 복사해 붙여넣어주세요.',
      });
    }

    const provider = createOpenAI({
      apiKey,
      baseURL: baseUrl || 'https://openrouter.ai/api/v1',
      headers: {
        'HTTP-Referer': 'https://harubook.app',
        'X-Title': 'Harubook',
      },
    });

    let result;
    try {
      result = await generateText({
        model: provider(modelId),
        system: buildSystemPrompt(),
        prompt: message,
        temperature: 0.2,
        maxRetries: 0, // 재시도 끄고 원본 에러 노출
      });
    } catch (genErr: unknown) {
      const e = genErr as {
        message?: string;
        cause?: unknown;
        statusCode?: number;
        responseBody?: string;
      };
      console.error('[AI Chat] generateText failed:', {
        message: e.message,
        statusCode: e.statusCode,
        responseBody: e.responseBody,
      });

      const detail = e.responseBody || e.message || '';
      const lower = detail.toLowerCase();

      // 친절한 에러 매핑
      let friendly = `AI 호출 실패 😢 ${detail.slice(0, 120)}`;

      if (
        lower.includes('rate') ||
        lower.includes('429') ||
        lower.includes('temporarily') ||
        lower.includes('capacity')
      ) {
        friendly =
          '🚦 이 모델이 지금 너무 붐벼요. AI 설정에서 다른 무료 모델로 바꿔주세요.';
      } else if (
        lower.includes('no endpoints') ||
        lower.includes('not found')
      ) {
        friendly =
          '📡 이 모델이 OpenRouter에서 사라졌어요. AI 설정에서 다른 모델을 선택해주세요.';
      } else if (lower.includes('user not found') || lower.includes('unauthorized')) {
        friendly =
          '🔑 API 키가 유효하지 않아요. 설정에서 키를 다시 복사해 붙여넣어주세요.';
      } else if (lower.includes('insufficient') || lower.includes('credit')) {
        friendly =
          '💳 크레딧이 부족해요. OpenRouter에서 충전하거나 무료 모델로 바꿔주세요.';
      }

      return NextResponse.json({
        action: 'chat',
        todos: [],
        reply: friendly,
      });
    }

    const raw = result.text;
    console.log('[AI Chat] raw:', raw);

    // 파싱 + Zod 검증
    const parsed = extractJson(raw);
    if (!parsed) {
      return NextResponse.json({
        action: 'chat',
        todos: [],
        reply:
          'AI 응답을 못 읽었어요 (JSON 형식 아님). 다시 말해주거나 다른 모델을 시도해보세요.',
      });
    }

    const validation = TodoActionSchema.safeParse(parsed);
    if (!validation.success) {
      console.error('[AI Chat] Zod validation failed:', validation.error.issues);
      // 느슨하게 복구 — 최소 필드만 있으면 통과
      const loose = parsed as Partial<TodoAction>;
      return NextResponse.json({
        action: loose.action || 'chat',
        todos: Array.isArray(loose.todos) ? loose.todos : [],
        reply: loose.reply || '처리했어!',
      });
    }

    return NextResponse.json(validation.data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'AI 호출 실패';
    console.error('[AI Chat] error:', msg);

    return NextResponse.json({
      action: 'chat',
      todos: [],
      reply: `AI 호출 실패 😢 (${msg.slice(0, 80)})`,
    });
  }
}

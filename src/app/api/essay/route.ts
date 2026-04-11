/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 api/essay / 주간 소설 생성
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 파트너 + 주간 todo 데이터를 받아 OpenRouter 로 소설 생성.
 * chat/route.ts 와 동일한 openai SDK 패턴 유지.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildSpringPrompt } from '@/lib/prompts/essay-spring';
import type { EssayPromptInput } from '@/lib/prompts/essay-base';

/* ════════════════════════════════
   1. 타임아웃 설정
   ════════════════════════════════ */

// 소설 생성은 시간이 걸릴 수 있어 300초로 명시
export const maxDuration = 300;

/* ════════════════════════════════
   2. ROUTE HANDLER
   ════════════════════════════════ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      apiKey,
      modelId,
      baseUrl,
      partner,
      todos,
      periodStart,
      periodEnd,
      previousTeaser,
      userName,
      currentStage,
      previousStage,
      totalPoints,
      weekPoints,
      userPrompt,
    } = body as {
      apiKey: string;
      modelId: string;
      baseUrl?: string;
      partner: EssayPromptInput['partner'];
      todos: EssayPromptInput['todos'];
      periodStart: string;
      periodEnd: string;
      previousTeaser?: string;
      userName?: string;
      currentStage?: EssayPromptInput['currentStage'];
      previousStage?: EssayPromptInput['previousStage'];
      totalPoints?: number;
      weekPoints?: number;
      userPrompt?: string;
    };

    if (!apiKey || !modelId) {
      return NextResponse.json({ error: 'AI 설정이 필요해요' }, { status: 400 });
    }

    if (!partner) {
      return NextResponse.json({ error: '파트너 정보가 필요해요' }, { status: 400 });
    }

    /* ────────────
       테마별 프롬프트 선택
       ──────────── */
    const input: EssayPromptInput = {
      partner,
      todos: todos ?? [],
      periodStart,
      periodEnd,
      previousTeaser,
      userName,
      currentStage,
      previousStage,
      totalPoints,
      weekPoints,
      userPrompt,
    };

    const prompt = buildSpringPrompt(input);

    /* ────────────
       OpenRouter 호출
       ──────────── */
    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl || 'https://openrouter.ai/api/v1',
    });

    const completion = await client.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: 'system',
          content:
            '당신은 감성적인 한국어 단편 소설가다. 지시받은 JSON 형식만 출력한다.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 3000,
    });

    const raw = completion.choices[0]?.message?.content || '';

    /* ────────────
       JSON 파싱
       ──────────── */
    let parsed: { title: string; content: string; teaser?: string } | null = null;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      parsed = null;
    }

    if (!parsed || !parsed.content) {
      // JSON 실패 시 fallback: 전체 텍스트를 content 로
      return NextResponse.json({
        title: `${partner.name}과 보낸 한 주`,
        content: raw.trim() || '이번 주 이야기를 불러오지 못했어요. 다시 시도해주세요.',
        teaser: '',
      });
    }

    return NextResponse.json({
      title: parsed.title || `${partner.name}과 보낸 한 주`,
      content: parsed.content,
      teaser: parsed.teaser || '',
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('Essay API error:', message);
    return NextResponse.json({ error: `소설 생성 실패: ${message}` }, { status: 500 });
  }
}

# 📘 하루책 (Harubook) — 세션 핸드오프 문서

**작성자**: 진폭 × 리듬-상호
**작성일**: 2026-04-10
**목적**: 다음 세션에서 P5~P6 이어서 진행하기 위한 상세 인계 문서

---

## 1. 프로젝트 개요

**제품명**: 하루책 (Harubook)
**한 줄**: "당신과 AI 파트너가 공동 주인공인 소설이 매주 연재되는 투두 앱"
**위치**: `D:\바이브랩스_2주차_투두앱\harubook\`
**챌린지**: 바이브랩스 2주차 — 할 일 관리 웹앱 (킥: 연재 소설)
**마감**: 2026-04-12 (토요일 자정)

---

## 2. 완료 상태

| Phase | 상태 | 내용 |
|-------|-----|-----|
| P1 | ✅ 완료 | Next.js 16 + TypeScript + Tailwind + shadcn/ui + Dexie.js (IndexedDB) |
| P2 | ✅ 완료 | 캘린더 날짜 스트립 (15일 가로 스크롤) + 모바일 퍼스트 UI |
| P3 | ✅ 완료 | 3단계 온보딩 (테마 봄날/서재 → 세계관 현대/판타지 → 파트너 이름) |
| P4 | ✅ 완료 | AI 채팅 (OpenRouter 통합, 무료/유료 모델 선택, 트리거 연동) |
| **P5** | ❌ **미완** | **소설 프롬프트 설계 + 생성 API + 읽기 UI** |
| **P6** | ❌ **미완** | **통합 테스트 + Vercel 배포 + 시연 준비** |

---

## 3. 기술 스택

| 레이어 | 기술 |
|------|-----|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Local DB | Dexie.js (IndexedDB) — Local-First 아키텍처 |
| AI | OpenRouter API (OpenAI 호환) |
| State | Zustand |
| Animation | Framer Motion |
| Deploy | Vercel (미배포) |

---

## 4. 파일 구조 (현재)

```
harubook/src/
├── app/
│   ├── layout.tsx              ✅ 루트 레이아웃 (한국어, 메타, viewport)
│   ├── page.tsx                ✅ 온보딩 분기 (파트너 있으면 /home, 없으면 /onboarding)
│   ├── onboarding/page.tsx     ✅ 3단계 온보딩
│   ├── home/page.tsx           ✅ 메인 (Todo + 캘린더 + ChatSheet)
│   ├── api/chat/route.ts       ✅ AI 채팅 프록시 (OpenRouter → JSON 파싱)
│   ├── api/essay/route.ts      ❌ 미생성 (P5)
│   └── story/page.tsx          ❌ 미생성 (P5)
│
├── components/
│   ├── todo/
│   │   ├── TodoItem.tsx        ✅ 개별 항목 (체크+삭제+뱃지)
│   │   ├── TodoInput.tsx       ✅ 추가 입력 (카테고리 선택)
│   │   ├── TodoList.tsx        ✅ 목록 (진행률 바, 완료/미완 분리)
│   │   └── CalendarView.tsx    ✅ 날짜 스트립 (15일, 가로 스크롤)
│   ├── chat/
│   │   ├── ChatSheet.tsx       ✅ 하단 플로팅 채팅 UI
│   │   └── AISetupDialog.tsx   ✅ OpenRouter 키 입력 + 모델 선택
│   ├── story/
│   │   ├── EssayCard.tsx       ❌ 미생성 (P5)
│   │   └── BookShelf.tsx       ❌ 미생성 (P5)
│   ├── onboarding/             ❌ (온보딩은 page.tsx에 인라인)
│   └── ui/ (shadcn)            ✅ 12개 컴포넌트
│
├── lib/
│   ├── db/dexie.ts             ✅ IndexedDB 스키마 v2 (todos, partner, essays, messages, aiConfig)
│   ├── stores/
│   │   ├── useTodoStore.ts     ✅ Todo CRUD + 날짜 필터
│   │   ├── usePartnerStore.ts  ✅ 파트너 관리
│   │   ├── useAIStore.ts       ✅ AI 설정 (OpenRouter 키 + 모델)
│   │   └── useChatStore.ts     ✅ 채팅 메시지 + 트리거 연결
│   ├── triggers/index.ts       ✅ 트리거 라우터 (add/update/delete/complete/list)
│   ├── prompts/
│   │   ├── chat-parser.ts      ❌ 미생성 (시스템 프롬프트는 api/chat/route.ts에 인라인)
│   │   ├── essay-base.ts       ❌ 미생성 (P5)
│   │   ├── essay-spring.ts     ❌ 미생성 (P5)
│   │   └── essay-library.ts    ❌ 미생성 (P5)
│   └── utils.ts                ✅ shadcn cn 유틸
│
└── types/
    ├── todo.ts                 ✅ (TodoCategory, TodoStatus, Todo, CATEGORY_CONFIG)
    ├── partner.ts              ✅ (ThemeType, WorldType, Personality, Partner, DEFAULT_PARTNERS)
    ├── essay.ts                ✅ (EssayType, Essay)
    ├── message.ts              ✅ (AIAction, Message) — action에 'chat' 포함
    └── ai.ts                   ✅ (AIProvider, AIConfig, FREE_MODELS, PAID_MODELS, OPENROUTER_BASE_URL)
```

---

## 5. 핵심 아키텍처 패턴

### Local-First
- 모든 데이터 IndexedDB에 먼저 저장 (Dexie.js)
- 로그인 없이 Todo, 파트너, 온보딩 전부 사용 가능
- AI 기능 사용 시에만 OpenRouter API 키 필요

### 트리거 시스템
```
사용자 입력 → AI 판단 (JSON) → 로컬 트리거 실행 → DB + UI 갱신
```
- AI는 분류/판단만 (JSON 출력)
- 실행은 결정론적 코드 (triggers/index.ts)
- 토큰 95% 절약, 응답 5배 빠름

### 진폭 코드 컨벤션
- 모든 파일 상단: 진폭 헤더 (📘 하루책 + 📂 모듈 + 🔧 진폭 × 리듬-상호)
- 섹션 구분: `/* ════════════════════════════════ */`
- 모듈화: types / lib / components / app 명확 분리

---

## 6. 디자인 전략 — 투 트랙

### 봄날 (spring) — 여성 타겟
- 컬러: 파스텔 핑크 #F5A0B5 + 라벤더 #B8A9E8 + 민트 #A8E0D0
- 폰트: 둥근 고딕
- 파트너: 귀여운 동물 (기본: "보리")
- 소설 톤: 따뜻, 감정 풍부, ~했어요 체

### 서재 (library) — 남성 타겟
- 컬러: 다크 네이비 #0F1218 + 골드 #C8A96E + 딥그린 #2D6B4A
- 폰트: 세리프 (명조)
- 파트너: 차분한 존재 (기본: "그림자")
- 소설 톤: 절제된 감성, 행간 감정, ~했다 체

**현재**: 테마 변수는 types/partner.ts에 정의됨. CSS 테마 전환은 미구현 (P5~P6에서 적용 가능).

---

## 7. P5 상세 — 소설 생성 (미완, 이어서 해야 함)

### 7.1 만들어야 할 파일

#### A. 소설 생성 API: `src/app/api/essay/route.ts`
- POST 엔드포인트
- 입력: 파트너 정보 + 주간 todo 데이터 + 이전 회 teaser + 테마
- OpenRouter API 호출 (소설용 모델 — Sonnet이나 GPT-4o 추천)
- 출력: { title, content, teaser }

#### B. 소설 프롬프트: `src/lib/prompts/`
- **essay-base.ts** — 공통 베이스 프롬프트
- **essay-spring.ts** — 봄날 테마 확장 (따뜻, 감정 풍부)
- **essay-library.ts** — 서재 테마 확장 (절제, 행간 감정)

프롬프트 핵심:
```
당신은 {파트너 이름}이다.
{세계관}에서 {사용자}와 함께 살고 있다.

이번 주 데이터:
- 월: 운동 (완료), 독서 (미완)
- 화: 회의 (완료)
- ...

작업:
1. 이 사건들을 소설 장면으로 엮어라
2. 둘 다 주인공, 대사 포함
3. 1000-1500자
4. 끝에 다음 화 예고
```

**테마별 확장 프롬프트:**
- 봄날: "따뜻한 톤, 감정 풍부, ~했어요, 완료 시 기뻐함, 미완 시 걱정"
- 서재: "절제된 톤, 감각 묘사, ~했다, 완료 시 차 한 잔, 미완 시 창밖"

#### C. 소설 Zustand 스토어: `src/lib/stores/useEssayStore.ts`
- 소설 목록 로드 (IndexedDB)
- 소설 생성 요청
- 아카이브 관리

#### D. 소설 읽기 페이지: `src/app/story/page.tsx`
- 주간 소설 목록 (카드 형태)
- 카드 클릭 → 상세 읽기
- 책 느낌 UI (세리프 폰트, 여백 넉넉)

#### E. 소설 카드: `src/components/story/EssayCard.tsx`
- 제목 + 기간 + 미리보기 텍스트
- 테마별 스타일링

#### F. 하단 네비게이션 (선택)
- 현재: 홈만 있음
- 추가: [📝 홈] [📖 이야기] [⚙️ 설정] 하단 탭

### 7.2 소설 생성 트리거
- 수동: 사용자가 "이번 주 이야기" 버튼 누름
- 자동: 일요일 밤 접속 시 자동 생성 제안
- 홈 화면에 "이번 주 이야기 쓰기" CTA 추가 필요

### 7.3 DB에 이미 essays 테이블 있음
```
essays: '++id, type, periodStart, periodEnd, createdAt'
```
Essay 타입도 types/essay.ts에 정의됨.

---

## 8. P6 상세 — 통합 테스트 + 배포

### 8.1 빌드
- `npm run build` — 현재 성공 상태 ✅
- 라우트: `/`, `/home`, `/onboarding`, `/api/chat`

### 8.2 배포
- Vercel CLI 설치 필요: `npm i -g vercel` (이전 세션에서 설치됨)
- `cd harubook && vercel deploy --prod --yes`
- 프로젝트명: "harubook" 또는 상호가 정하는 이름

### 8.3 시연 체크리스트
- [ ] 온보딩 → 테마/세계관/파트너 선택 작동
- [ ] Todo 추가/완료/삭제 작동
- [ ] 캘린더 날짜 전환 작동
- [ ] AI 채팅 설정 (OpenRouter 키 입력)
- [ ] AI에게 "내일 3시 회의" → 자동 추가
- [ ] 소설 생성 → 읽기 (P5)
- [ ] 모바일 반응형 확인

### 8.4 제출 양식
```
🏷️ 이름: 리듬-상호
🔗 배포 URL: (배포 후)
🎯 나의 킥: AI 파트너가 당신의 할 일을 매주 소설로 써주는 투두 앱
🛠️ 사용 도구: Claude Code (진폭)
💬 한줄 소감: (상호가 작성)
```

---

## 9. 알려진 이슈

1. **테마 CSS 미적용**: 봄날/서재 테마 선택은 IndexedDB에 저장되지만, 실제 CSS 변수 전환은 미구현. globals.css에 `[data-theme="spring"]` / `[data-theme="library"]` 추가 필요.

2. **SheetTrigger asChild 제거됨**: shadcn/ui 최신 버전에서 asChild prop 없음. className 직접 전달 방식으로 수정 완료.

3. **AIAction 타입**: 'chat' 액션 추가됨 (message.ts). triggers/index.ts에서 'chat'은 무시 처리.

4. **Dexie v2 마이그레이션**: aiConfig 테이블 추가로 v1 → v2. 기존 사용자는 자동 마이그레이션.

5. **소설 생성 시 모델 선택**: 채팅용(빠른 모델)과 소설용(품질 모델) 분리 고려 필요.

---

## 10. 기획 문서 위치

- **PRD + TRD 통합**: `D:\바이브랩스_2주차_투두앱\기획초안_PRD_TRD.md` (v0.2)
  - 디자인 투트랙 (봄날/서재)
  - 테마별 소설 프롬프트 분기 설계
  - 비즈니스 모델
  - 경쟁 분석

---

## 11. 다음 세션에서 할 것 (우선순위)

### 필수 (P5)
1. `src/lib/prompts/essay-base.ts` — 소설 베이스 프롬프트
2. `src/lib/prompts/essay-spring.ts` — 봄날 확장
3. `src/lib/prompts/essay-library.ts` — 서재 확장
4. `src/app/api/essay/route.ts` — 소설 생성 API
5. `src/lib/stores/useEssayStore.ts` — 소설 스토어
6. `src/app/story/page.tsx` — 소설 읽기 페이지
7. `src/components/story/EssayCard.tsx` — 소설 카드
8. 홈에 "이번 주 이야기 쓰기" 버튼 추가

### 필수 (P6)
9. 테마 CSS 적용 (globals.css)
10. 하단 네비게이션 (홈/이야기 전환)
11. `vercel deploy --prod`
12. 시연 테스트

### 선택 (시간 여유 시)
- 소설 이미지 카드 공유
- 월간 에필로그
- PWA 설정

---

## 12. 핵심 명령어

```bash
# 개발 서버
cd D:\바이브랩스_2주차_투두앱\harubook && npm run dev

# 빌드
npm run build

# 배포
vercel deploy --prod --yes

# Vercel CLI 없으면
npm i -g vercel
```

---

**이 문서를 읽고 P5부터 이어서 진행하면 됩니다.**
**진폭 코드 컨벤션 (헤더 + 섹션 구분) 반드시 유지.**
**상호의 핵심 원칙: 직관성, 가시성, 접근성, 사용자 경험 최우선.**

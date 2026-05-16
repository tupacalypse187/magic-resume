# CLAUDE.md — Project Context for AI Assistants

## Project Overview

Magic Resume is an open-source, privacy-first resume builder. All data is stored locally (localStorage + optional filesystem sync). The app is built with TanStack Start (Vinxi), TypeScript, Tailwind CSS, Shadcn/ui, and Zustand.

## Architecture

### Routing
- **TanStack Router** with file-based routing in `src/routes/`
- API routes use `createFileRoute("/api/...")` with `server.handlers.POST`
- Page routes live in `src/routes/app/` but render components from `src/app/app/`
- Legacy Next.js App Router routes still exist in `src/app/api/` and `src/app/(public)/` — the TanStack routes are the active ones

### State Management
- **Zustand** stores in `src/store/`:
  - `useResumeStore` — resumes, active resume, all CRUD operations, filesystem sync
  - `useAIConfigStore` — AI provider selection, API keys, model IDs (persisted)
  - `useGrammarStore` — grammar checking state (transient)
  - `useReviewStore` — AI review findings, score, undo stack (transient)
  - `useChatStore` — chat sessions, messages (persisted)
- Stores use `persist` middleware where data should survive reloads

### AI Integration
- **Multi-provider**: OpenAI, Anthropic, Gemini, DeepSeek, Doubao
- **Shared helper**: `src/lib/server/aiProvider.ts` provides `callAIForJSON()` and `callAIForStream()` handling all 3 provider API patterns
- **API routes** in `src/routes/api/`:
  - `/api/grammar` — grammar check (JSON response)
  - `/api/polish` — AI polish (streaming)
  - `/api/review` — full resume review with scoring (JSON response)
  - `/api/chat` — conversational AI with resume context (streaming)
  - `/api/section-review` — per-section review/keyword suggestions (JSON response)
  - `/api/template-suggest` — style and template recommendations (JSON response)
  - `/api/resume-import` — PDF import via Gemini Vision (JSON response)
- **Client sends API keys in request body** — no server-side key storage
- **i18n-aware**: system prompts adapt to resume language

### i18n
- Uses `next-intl` compat layer in `src/i18n/`
- Locale files: `src/i18n/locales/en.json`, `src/i18n/locales/zh.json`
- Translation hook: `useTranslations("namespace")`
- Server-side: `getTranslations({ locale, namespace })`
- Section titles use `getSectionTitleKey()` from `src/utils/sectionTitles.ts` to map section IDs to i18n keys

### Template System
- 8 templates in `src/components/templates/`, each with `index.tsx`, `config.ts`, and `sections/`
- Template registry in `src/components/templates/registry.ts`
- Templates receive `ResumeData` + `ResumeTemplate` config as props
- Section rendering follows a switch/case pattern on `menuSections[].id`

### Workbench Layout
- 3-panel resizable layout: SidePanel | EditPanel | PreviewPanel
- `react-resizable-panels` with `ResizablePanelGroup`
- AI panels use `Sheet` (no overlay) — ReviewDrawer from left, ChatPanel from right
- PreviewPanel must stay in DOM (CSS hidden, not conditionally rendered) for PDF export

### Docker
- **Two-stage build**: `Dockerfile.base` (dependencies) → `Dockerfile` (source + build)
- `docker compose build base` — rebuild when dependencies change
- `docker compose up -d --build web` — fast rebuild on code changes
- `ai-config.json` mounted as read-only volume for default AI keys

## Key Conventions

- **Never commit `ai-config.json`** — it contains API keys
- **Always add i18n keys** to both `en.json` and `zh.json` when adding UI text
- **Follow the 3-provider pattern** in API routes — use `callAIForJSON()` / `callAIForStream()` from `src/lib/server/aiProvider.ts`
- **Resume data flows one way**: Zustand store → templates (read-only) + editor panels (write via store actions)
- **Section IDs**: `basic`, `skills`, `experience`, `projects`, `education`, `selfEvaluation`, `certificates`, or `custom-*`
- **Zustand stores**: transient state (no `persist`) for session-only data like review findings; persisted state for user data like chat sessions
- **UI components**: use Shadcn/ui from `src/components/ui/` — Dialog, Sheet, Popover, Tooltip, etc.
- **Animations**: use `framer-motion` for enter/exit animations on list items

## File Map (Key Files)

| Path | Purpose |
|------|---------|
| `src/types/resume.ts` | ResumeData, BasicInfo, Experience, Education, etc. |
| `src/types/review.ts` | ReviewFinding, ChatSession, ChatMessage, TemplateSuggestion |
| `src/config/ai.ts` | AI provider configs (URLs, headers, validation) |
| `src/store/useResumeStore.ts` | Resume CRUD, section management, global settings |
| `src/store/useAIConfigStore.ts` | AI provider/keys/model selection |
| `src/store/useReviewStore.ts` | Review findings, score, undo |
| `src/store/useChatStore.ts` | Chat sessions, streaming state |
| `src/lib/server/aiProvider.ts` | Shared AI call helpers (JSON + stream) |
| `src/lib/server/gemini.ts` | Gemini SDK wrapper, proxy setup |
| `src/utils/resumeSerializer.ts` | ResumeData → Markdown for AI |
| `src/utils/sectionExtractor.ts` | Single section content extraction |
| `src/utils/sectionTitles.ts` | Section ID → i18n key mapping |
| `src/components/editor/review/` | ReviewDrawer, ReviewScoreRing, SectionActionsPopover |
| `src/components/editor/chat/` | ChatPanel, ChatMessage, ChatInput, ChatSessionList, QuickActions |
| `src/components/editor/template/` | AITemplateSuggestCard |
| `src/components/preview/PreviewDock.tsx` | Floating dock with AI triggers |
| `src/app/app/workbench/[id]/page.tsx` | Workbench layout (3-panel + AI drawers) |

## Build & Deploy

```bash
pnpm dev          # Development server on :3000
pnpm build        # Production build (Vite)
docker compose build base   # Rebuild dependency image
docker compose up -d --build web  # Fast app rebuild
```

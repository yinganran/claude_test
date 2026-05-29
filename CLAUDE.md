# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Backend (Python FastAPI)
```bash
cd backend
pip install -r requirements.txt   # Install Python dependencies
python main.py                     # Start dev server on :8000 (hot reload enabled)
```

### Frontend (React + TypeScript + Vite)
```bash
cd frontend
npm install        # Install dependencies
npm run dev        # Start dev server on :5173 (proxies /api → :8000)
npm run build      # TypeScript check + production build
npm run preview    # Preview production build
```

No test suite exists currently. The backend is a single `main.py` file; the frontend follows a flat component structure under `src/`.

## Architecture

### Data Flow
1. User uploads files and/or pastes chat text in the React UI
2. Frontend POSTs as `multipart/form-data` to `POST /api/analyze` (proxied by Vite to the FastAPI backend)
3. Backend extracts text: OCR for images (`pytesseract`, with Pillow resizing to 1920px), `PyPDF2` for PDFs, `python-docx` for Word, raw read for TXT/CSV/MD. Images are also base64-encoded for vision model support.
4. All text is concatenated (capped at 50k chars) and sent to DeepSeek via the OpenAI-compatible client, with a detailed Chinese-language `SYSTEM_PROMPT` that requests a strict JSON schema covering problem_analysis, customer_profile, and sales_strategy.
5. The LLM response is parsed with a fallback chain: direct `json.loads` → regex extraction from markdown code fences → brace-pair matching to find the outermost JSON object.
6. Results are returned to the frontend and displayed across three tabs: problem diagnosis, customer profile, sales strategy.

### Backend (`backend/main.py`)
A single-file FastAPI server (~360 lines). Key details:
- **File handling**: `process_uploaded_file()` routes to format-specific extractors based on extension. File size is unbounded; images are thumbnailed to 1920px max before base64 encoding.
- **API key resolution**: Frontend-supplied key takes precedence over `DEEPSEEK_API_KEY` env var.
- **`.env`** already present in the repo at `backend/.env` (loaded via `python-dotenv`). Configurable keys: `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL` (defaults to `https://api.deepseek.com`), `DEEPSEEK_MODEL` (defaults to `deepseek-chat`).
- **Vision support**: When images are present, the request uses the `image_url` content type in the messages array.
- **Response model**: Always returns `{"success": bool, "data": {...}}`. The `data` object mirrors the SYSTEM_PROMPT JSON schema, plus a `_meta` field with model name and token usage.

### Frontend (`frontend/src/`)
React 18 single-page app with Tailwind CSS. No router — a single `App.tsx` switches between upload and result views via state.

| File | Role |
|------|------|
| `App.tsx` | Top-level state (files, chatText, apiKey, model, result, activeTab). Renders upload or results. |
| `components/UploadPanel.tsx` | File drag-and-drop, file list management, textarea paste, API key/model settings (collapsible). |
| `components/AnalysisResult.tsx` | Renders problem_analysis array as severity-coded cards with expandable deep-dive sections (root cause, problem detail, solution). Includes view-toggle between original and improved conversation. |
| `components/CustomerProfile.tsx` | Renders customer_profile as a profile card with quadrant layout for traits, needs, decision info. |
| `components/StrategyPanel.tsx` | Renders sales_strategy with overall assessment, key metrics (success probability, timeline), strategy cards (talking points, avoid topics, value props, questions), reply templates, and next action. |
| `api/index.ts` | Single `analyzeChatRecords()` function using axios, 180s timeout, sends FormData. |
| `types/index.ts` | TypeScript interfaces matching the backend JSON schema. Key types: `ProblemItem`, `CustomerProfile`, `SalesStrategy`, `AnalysisResult`. |

**Tab type** is `'problems' | 'profile' | 'strategy'`. The app auto-switches to the first non-empty tab after analysis completes.

**Vite config** proxies `/api` → `http://localhost:8000`, so the frontend calls `/api/analyze` without a full URL.

## Important Notes
- The entire UI and all AI prompts are in Chinese.
- The backend reads `.env` on import via `load_dotenv()`, so restart is needed after env changes.
- Supported image formats for vision: jpg, jpeg, png, gif, webp, bmp. For text extraction only: pdf, docx, doc, txt, csv, md.

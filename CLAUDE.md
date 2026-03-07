# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Build to dist/
npm run preview  # Preview production build locally
```

No test framework is configured.

## Architecture

**Pure static React/Vite app** — no backend, no server. All AI calls go directly from the browser to the Gemini API.

### Data flow

1. User uploads a PDF CV → `pdfExtractor.js` extracts text via pdf.js
2. User pastes a job description
3. `App.jsx` calls `aiService.js` → `buildCvPrompt()` from `src/prompts/cvPrompt.js` → Gemini API
4. Gemini returns a complete LaTeX document
5. LaTeX is sent to `latexToPdf.js` → `latex.ytotech.com` (fallback: `latexonline.cc`) to compile to PDF
6. ResultStep shows PDF preview + LaTeX code, and optionally generates an application email

### Key files

| File | Role |
|---|---|
| `src/App.jsx` | Orchestrates the 3-step wizard (Upload → Processing → Result), holds all state |
| `src/lib/aiService.js` | Gemini API calls with model fallback chain; `generateTailoredCV` and `generateApplicationEmail` |
| `src/lib/latexToPdf.js` | LaTeX → PDF via external services; `convertLatexToPdf`, `downloadPdf`, `createPdfPreviewUrl` |
| `src/lib/pdfExtractor.js` | PDF text extraction using pdf.js |
| `src/prompts/cvPrompt.js` | The core LaTeX template + instructions injected into the AI prompt |
| `src/prompts/emailPrompt.js` | Prompt for generating application emails (expects JSON response) |
| `src/components/SettingsModal.jsx` | Persists `{ apiKey, geminiModel }` to `localStorage` under key `cv-tailor-settings` |

### AI provider

The app is **Gemini-only**. `aiService.js` tries models in this order when one hits rate limits:
1. `gemini-2.5-flash-lite`
2. `gemini-2.5-flash`
3. `gemini-2.5-pro`

The user can override the starting model via Settings. Settings are loaded from `localStorage` on every page load and auto-open the Settings modal if no API key is found.

### Styling

Tailwind CSS + custom utility classes defined in `src/index.css` (`.card`, `.btn-primary`, `.btn-secondary`, `.input-field`, `.latex-code`). Dark theme with indigo/violet accents.

### No backend

The README references Supabase and edge functions — these have been removed. The app is fully client-side.

### Important 
after each major , update @CLAUDE.md file and up to date with the code.
after each major , update @README.md file and up to date with the code.

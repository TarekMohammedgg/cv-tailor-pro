# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

## Commands

```bash
npm run dev      # Start the Vite dev server at http://localhost:5173
npm run build    # Build the production bundle into dist/
npm run preview  # Preview the production build locally
```

No automated test framework is configured. Use `npm run build` as the main verification step after code changes.

## Architecture

Pure static React/Vite app. There is no backend. Gemini API calls happen directly from the browser, and LaTeX is compiled by external HTTP services.

### Data flow

1. User uploads a PDF CV.
2. `src/lib/pdfExtractor.js` extracts readable text and appends a hidden structured link map for project and certificate URLs.
3. `src/App.jsx` calls `generateTailoredCV()` from `src/lib/aiService.js`.
4. In the default `reference-locked` mode:
   - `src/lib/cvSourceParser.js` removes the hidden link block and parses link metadata.
   - `src/prompts/cvPrompt.js` asks Gemini for structured JSON content only.
   - `src/lib/referenceCvTemplate.js` injects that JSON into a fixed LaTeX master template that matches the reference CV layout.
5. In optional `legacy-freeform` mode, Gemini still writes the entire LaTeX document.
6. `src/lib/latexToPdf.js` compiles LaTeX to PDF through `latex.ytotech.com`, with `latexonline.cc` as fallback.
7. `ResultStep` shows the generated PDF preview, LaTeX, and refinement flow. `EmailSection` can generate an application email from the extracted CV text.

### Key files

| File | Role |
|---|---|
| `src/App.jsx` | Main 3-step workflow and state orchestration |
| `src/lib/aiService.js` | Gemini calls, template-mode branching, JSON parsing, and final LaTeX generation |
| `src/lib/referenceCvTemplate.js` | Locked master template, section-rule styling, ATS-friendly PDF settings, reference link fallbacks, and deterministic LaTeX renderer |
| `src/lib/cvSourceParser.js` | Parses/strips the hidden link metadata block embedded in extracted CV text |
| `src/lib/pdfExtractor.js` | PDF.js extraction plus line/link association heuristics |
| `src/prompts/cvPrompt.js` | Locked-mode JSON prompt plus legacy freeform prompt |
| `src/lib/latexToPdf.js` | LaTeX to PDF conversion and download helpers |
| `src/components/SettingsModal.jsx` | Persists `{ apiKey, geminiModel, templateMode }` in localStorage |

### AI provider

Gemini only. `aiService.js` tries models in this order when one is rate-limited or unavailable:
1. `gemini-2.5-flash-lite`
2. `gemini-2.5-flash`
3. `gemini-2.5-pro`

### Template modes

- `reference-locked` (default): Gemini returns structured resume JSON, and the app renders it into a fixed reference LaTeX template. Use this mode when layout consistency matters.
- `legacy-freeform`: Gemini generates the full LaTeX document. This keeps the old behavior but can drift away from the reference CV formatting.

### Styling

Tailwind CSS plus custom utility classes in `src/index.css`.

### Important

After each major change, update both `AGENTS.md` and `README.md` so they stay aligned with the codebase.


# CV Tailor Pro

Upload a CV PDF, paste a job description, and generate a tailored LaTeX/PDF resume in the browser.

The app now supports a locked master-template workflow so the generated CV can keep the same overall structure, section order, link placement, alignment style, and near-matching header/body sizing of the reference CV.

## Features

- Gemini-only browser-side CV tailoring
- Locked reference-template mode for stable layout, section rules, tuned sans-serif typography, and hyperlinks
- Legacy freeform mode for full-document LaTeX generation
- PDF text extraction with project/certificate link association
- LaTeX preview and ATS/parser-friendly PDF compilation (Unicode mapping + PDF 1.4 output)
- Application email generation based on the extracted CV and job description
- Local-only settings storage for API keys and template preferences

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, add your Gemini API key in Settings, upload a CV PDF, and paste a job description.

## Settings

The app stores settings in `localStorage` under `cv-tailor-settings`.

Available settings:
- `apiKey`
- `geminiModel`
- `templateMode`

Template modes:
- `Reference Locked`: default. Gemini returns structured resume JSON and the app renders it into the rebuilt master LaTeX template.
- `Legacy Freeform`: Gemini writes the whole LaTeX document directly.

## How the locked template flow works

1. `src/lib/pdfExtractor.js` extracts PDF text and appends a hidden structured link map.
2. `src/lib/cvSourceParser.js` strips that hidden metadata before prompt construction and keeps the link associations available for rendering.
3. `src/prompts/cvPrompt.js` asks Gemini for structured JSON only.
4. `src/lib/referenceCvTemplate.js` deterministically renders the final LaTeX using the fixed master template.
5. `src/lib/latexToPdf.js` compiles the LaTeX through `latex.ytotech.com`, then falls back to `latexonline.cc`.

## Build

```bash
npm run build
```

## Project Structure

```text
src/
  App.jsx
  components/
    EmailSection.jsx
    Header.jsx
    ProcessingStep.jsx
    ResultStep.jsx
    SettingsModal.jsx
    StepIndicator.jsx
    UploadStep.jsx
  lib/
    aiService.js
    cvSourceParser.js
    latexToPdf.js
    pdfExtractor.js
    referenceCvTemplate.js
  prompts/
    cvPrompt.js
    emailPrompt.js
```

## Notes

- There is no backend in this project.
- The README previously mentioned Supabase and multiple AI providers; those are no longer part of the app.
- No test runner is configured. Use `npm run build` as the main verification step.



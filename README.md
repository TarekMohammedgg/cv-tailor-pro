# CV Tailor Pro — ATS-Optimized Resume Builder

> Upload your CV + paste a Job Description → AI rewrites your CV in LaTeX → compiles to PDF → saves to Supabase.

## Features

- **AI-Powered CV Tailoring** — Matches your CV to any job description using keywords and ATS best practices
- **Never Fabricates** — Only uses information already in your original CV
- **LaTeX Output** — Professional, clean, single-column ATS-friendly format
- **PDF Compilation** — Converts LaTeX to PDF using free online services
- **Multiple AI Providers** — Google Gemini (free, recommended), OpenAI, or Anthropic Claude
- **Supabase Backend** — Stores original/generated PDFs and history
- **Privacy-First** — API keys stored locally in your browser, never sent to our servers

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              React Frontend (Vite)           │
│  - PDF text extraction (pdf.js)             │
│  - AI provider selection & API key input    │
│  - LaTeX preview & PDF download             │
└────────────┬───────────────┬────────────────┘
             │               │
    ┌────────▼───────┐  ┌───▼──────────────┐
    │  Supabase       │  │ LaTeX → PDF      │
    │  - Storage      │  │ (ytotech.com)    │
    │  - Database     │  │ Free, no key     │
    │  - Edge Funcs   │  └──────────────────┘
    └────────────────┘
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url> cv-tailor-pro
cd cv-tailor-pro
npm install
```

### 2. Get an AI API Key

**Recommended: Google Gemini (Free)**
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key (free tier: 15 RPM, 1M tokens/day)

**Alternative: OpenAI**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key (paid, but cheap with gpt-4o-mini)

**Alternative: Anthropic Claude**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key (paid)

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:5173, click **Settings**, enter your API key, and start generating!

---

## Supabase Setup (Optional — for saving history)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy the **Project URL** and **Anon Key** from Settings → API

### 2. Run the Schema

1. Go to SQL Editor in your Supabase dashboard
2. Paste and run the contents of `supabase/schema.sql`

This creates:
- `cv_generate` table (stores history)
- `cv-files` storage bucket (stores PDFs)
- RLS policies (public access)

### 3. Configure in the App

Enter your Supabase URL and Anon Key in the app's Settings panel.

---

## Edge Function Setup (Only for OpenAI/Claude)

> **Note:** If you use Google Gemini, you don't need this — it works directly from the browser.

### 1. Install Supabase CLI

```bash
npm install -g supabase
supabase login
```

### 2. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### 3. Deploy the Edge Function

```bash
supabase functions deploy generate-cv --no-verify-jwt
```

### 4. Get the Edge Function URL

The URL will be:
```
https://your-project-ref.supabase.co/functions/v1/generate-cv
```

Enter this URL in the app's Settings under "Edge Function URL".

---

## Free Hosting (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/cv-tailor-pro.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Import Project
2. Select your GitHub repo
3. Framework: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Click Deploy

**Alternative: Netlify**
1. Go to [netlify.com](https://www.netlify.com/) → Add New Site
2. Connect your GitHub repo
3. Build: `npm run build`, Publish: `dist`

---

## LaTeX to PDF Conversion

The app uses **latex.ytotech.com** (free, no API key required) to compile LaTeX to PDF.

**Fallback:** If the service is unavailable:
1. Copy the LaTeX code from the result
2. Go to [Overleaf](https://www.overleaf.com)
3. Create a new project → paste the code → compile

---

## Project Structure

```
cv-tailor-pro/
├── index.html                     # Entry HTML
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx                   # React entry
│   ├── App.jsx                    # Main app component
│   ├── index.css                  # Tailwind + custom styles
│   ├── components/
│   │   ├── Header.jsx             # App header
│   │   ├── StepIndicator.jsx      # Progress steps
│   │   ├── SettingsModal.jsx      # API & Supabase config
│   │   ├── UploadStep.jsx         # CV upload + JD input
│   │   ├── ProcessingStep.jsx     # Loading animation
│   │   └── ResultStep.jsx         # LaTeX viewer + PDF download
│   ├── lib/
│   │   ├── supabaseClient.js      # Supabase init & helpers
│   │   ├── aiService.js           # AI provider abstraction
│   │   ├── pdfExtractor.js        # PDF.js text extraction
│   │   └── latexToPdf.js          # LaTeX compilation services
│   └── prompts/
│       └── cvPrompt.js            # AI prompt engineering
├── supabase/
│   ├── schema.sql                 # Database & storage setup
│   └── functions/
│       └── generate-cv/
│           └── index.ts           # AI proxy edge function
└── README.md
```

---

## Supabase Table Schema

| Column           | Type        | Description                  |
|------------------|-------------|------------------------------|
| `id`             | UUID        | Primary key (auto-generated) |
| `user_id`        | UUID (null) | Optional auth user reference |
| `original_cv_url`| TEXT        | Link to uploaded original CV |
| `new_cv_url`     | TEXT        | Link to generated PDF        |
| `job_description`| TEXT        | The target job description   |
| `latex_code`     | TEXT        | Generated LaTeX source       |
| `created_at`     | TIMESTAMPTZ | Timestamp                    |

---

## How It Works

1. **Upload** — You upload your CV (PDF) and the app extracts text using pdf.js
2. **Paste JD** — You paste the target job description
3. **AI Tailoring** — The AI analyzes both and rewrites your CV:
   - Reorders skills/experience to match the JD
   - Adds relevant keywords where they genuinely apply
   - Follows ATS formatting rules (single column, standard headings, no tables)
   - NEVER adds fake information
4. **LaTeX Output** — The result is a clean LaTeX document
5. **PDF Compilation** — LaTeX is compiled to PDF via a free online service
6. **Save & Download** — PDF is saved to Supabase and available for download

---

## License

MIT — use it freely.

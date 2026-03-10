export function buildCvPrompt({ cvText, linkMetadata, jobDescription, refinementInstructions, previousLatex }) {
  const detectedLinks = formatDetectedLinks(linkMetadata)

  return `You are an expert resume writer working inside a STRICTLY LOCKED LaTeX resume template.

Your job is to tailor ONLY the resume CONTENT to the target job description. You are NOT allowed to design, reorder, or rewrite the LaTeX layout. Another system will inject your JSON into a fixed template that already controls spacing, alignments, section headings, and hyperlinks.

## NON-NEGOTIABLE RULES
1. Never invent or fabricate facts, metrics, tools, dates, employers, education, links, or certifications.
2. Keep the section order fixed: Summary, Education, Experience, Projects, Technical Skills, Soft Skills, Courses & Certifications, Languages.
3. Tailor by rewriting and tightening wording only. Do not create new sections.
4. Preserve project names, course names, and credential names closely enough that the renderer can match them to their original links.
5. Do not output LaTeX. Do not output Markdown. Output JSON only.
6. If a source item has a detected link, keep that item in a way that still clearly maps to the same link context.
7. If refinement instructions are present, apply ONLY those requested content edits and keep everything else as stable as possible.

## CONTENT TARGETS
- Summary: 2-3 sentences.
- Education: keep factual and concise.
- Experience: keep the original roles, rewrite bullets for relevance.
- Projects: keep the most relevant original projects, with 2-4 bullets each.
- Technical Skills: return grouped categories.
- Soft Skills: short list.
- Courses & Certifications: preserve original course/certificate names.
- Languages: preserve original languages.

## SOURCE CV TEXT
---
${cvText}
---

## DETECTED LINK MAP
${detectedLinks}

## TARGET JOB DESCRIPTION
---
${jobDescription}
---
${
  refinementInstructions && previousLatex
    ? `
## CURRENT RENDERED CV
---
${previousLatex}
---

## USER REFINEMENT INSTRUCTIONS
${refinementInstructions}
`
    : ''
}
## JSON SCHEMA
Return exactly one JSON object with this shape:
{
  "header": {
    "name": "",
    "title": "",
    "email": "",
    "phone": "",
    "location": "",
    "githubText": "",
    "linkedinText": ""
  },
  "summary": "",
  "education": [
    {
      "degree": "",
      "institution": "",
      "dates": "",
      "details": [""]
    }
  ],
  "experience": [
    {
      "title": "",
      "company": "",
      "dates": "",
      "bullets": [""]
    }
  ],
  "projects": [
    {
      "title": "",
      "linkContext": "",
      "linkLabel": "",
      "bullets": [""]
    }
  ],
  "skillGroups": [
    {
      "label": "",
      "items": [""]
    }
  ],
  "softSkills": [""],
  "certifications": [
    {
      "title": "",
      "issuer": "",
      "linkContext": "",
      "linkLabel": ""
    }
  ],
  "languages": [""]
}

## JSON RULES
- Use plain text only inside JSON values.
- Use empty arrays instead of null.
- Do not include URLs in the JSON.
- For linked projects/certifications, populate linkContext with the source item title that matches the detected link map.
- Use linkLabel exactly as shown in the source when available, e.g. [GitHub], [APK], [Certificate].
- Keep course and project titles stable enough for exact link matching.

## OUTPUT
Return only the JSON object.`
}

export function buildLegacyCvPrompt(cvText, jobDescription, refinementInstructions, previousLatex) {
  return `You are an expert CV/Resume writer. Your task is to tailor the CV below to match the Job Description, then output it using the EXACT LaTeX template provided.

## STRICT RULES
1. ONLY USE INFORMATION FROM THE ORIGINAL CV - Never fabricate or invent anything.
2. Reorder and emphasize the most relevant skills/experiences to match the JD.
3. Naturally incorporate keywords from the JD where they genuinely apply.
4. Keep measurable achievements. Do not invent numbers.
5. Output 1-2 pages maximum.
6. PROJECT LINKS: If the original CV contains a GitHub or project URL for a project (look for [PROJECT_LINK: ...] markers in the CV text), you MUST include it as a \\href{}{} link on the project name line. Use format: \\textbf{Project Name} \\hfill \\href{URL}{\\textit{github.com/...}} \\\\n
## ORIGINAL CV CONTENT
---
${cvText}
---

## TARGET JOB DESCRIPTION
---
${jobDescription}
---

## INSTRUCTIONS
Fill in the LaTeX template below with the tailored CV content. Follow these rules EXACTLY:
- Use \\section*{} for ALL section headings (the asterisk removes numbering).
- Each project must be its OWN block: a bold project name followed by its OWN \\begin{itemize}...\\end{itemize}. NEVER nest one project's bullets inside another project's list.
- Each job in experience must be its OWN block with its OWN \\begin{itemize}...\\end{itemize}.
- Use \\textbf{} for names/titles, \\textit{} for dates/locations.
- Use \\hfill to right-align dates on the same line as titles.
- Technical Skills section: use a simple format like "\\textbf{Category:} item1, item2, item3" with line breaks between categories.
- Courses & Certifications: Include links using \\href{URL}{[Certificate]} if a [PROJECT_LINK: URL] is provided.

## EXACT TEMPLATE TO USE (fill in the content):

\\documentclass[11pt,a4paper]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=0.65in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\usepackage{xcolor}

% Section formatting - no numbering, bold uppercase, line below
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}

% Tighter lists
\\setlist[itemize]{nosep, left=0pt..1.5em, itemsep=2pt, parsep=0pt}

% No page numbers
\\pagestyle{empty}

% Reduce spacing
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

\\begin{document}

% ===== HEADER =====
\\begin{center}
  {\\LARGE\\bfseries CANDIDATE NAME} \\\\[4pt]
  {\\normalsize Job Title} \\\\[4pt]
  email@example.com \\enspace|\\enspace (+20) 123 456 7890 \\enspace|\\enspace City, Country \\\
  \\href{https://linkedin.com/in/username}{linkedin.com/in/username} \\enspace|\\enspace \\href{https://github.com/username}{github.com/username}
\\end{center}

\\vspace{4pt}

% ===== SUMMARY =====
\\section*{Summary}
Write 2-3 sentences tailored to the JD here.

% ===== EDUCATION =====
\\section*{Education}

\\textbf{Degree} \\hfill \\textit{YYYY -- YYYY} \\\
\\textit{University Name, City, Country}
\\begin{itemize}
  \\item GPA: X.XX / 4.0 | Graduation Project: Project Name --- Grade: Excellent
\\end{itemize}

% ===== EXPERIENCE =====
\\section*{Experience}

\\textbf{Job Title} \\hfill \\textit{MM/YYYY -- MM/YYYY} \\\
\\textit{Company Name, City, Country}
\\begin{itemize}
  \\item Achievement 1 with metrics.
  \\item Achievement 2 with metrics.
\\end{itemize}

% Repeat the block above for each job. Each job gets its OWN \\begin{itemize}.

% ===== PROJECTS =====
\\section*{Projects}

\\textbf{Project Name 1} \\hfill \\href{https://github.com/user/repo}{[GitHub]} \\\
\\begin{itemize}
  \\item Detail about this project.
  \\item Another detail about this project.
\\end{itemize}

\\textbf{Project Name 2} \\\
\\begin{itemize}
  \\item Detail about this project.
  \\item Another detail about this project.
\\end{itemize}

% IMPORTANT: Each project is a SEPARATE block.
% The \\textbf{Project Name} line must be OUTSIDE any itemize environment.
% Each project has its OWN \\begin{itemize}...\\end{itemize}.
% If a [PROJECT_LINK: URL] exists for a project, use \\hfill \\href{URL}{[GitHub]} on the name line. If no URL exists, omit the \\hfill \\href{} part (like Project Name 2 above).

% ===== TECHNICAL SKILLS =====
\\section*{Technical Skills}

\\textbf{Languages:} Dart, Python, Java, JavaScript \\\
\\textbf{Mobile Development:} Flutter, Firebase, Supabase, REST APIs, etc. \\\
\\textbf{State Management:} Cubit/Bloc, Provider, etc. \\\
\\textbf{Architecture:} MVVM, Clean Architecture \\\
\\textbf{Backend:} Fast API, Supabase, etc. \\\
\\textbf{Tools \\& Platforms:} Android Studio, VS Code, Git, etc. \\\
\\textbf{UI/UX:} Figma

% ===== SOFT SKILLS =====
\\section*{Soft Skills}
Research, Team Work, Time Management, Communication Skills

% ===== COURSES & CERTIFICATIONS =====
\\section*{Courses \\& Certifications}

\\begin{itemize}
  \\item \\textbf{Course Name} --- \\textit{Institution Name} \\hfill \\href{URL}{[Certificate]}
  \\item \\textbf{Another Course Name} --- \\textit{Institution Name}
\\end{itemize}

% ===== LANGUAGES =====
\\section*{Languages}
Arabic (Native) | English (Fluent)

\\end{document}

## OUTPUT
Output ONLY the filled-in LaTeX code. No explanations. No markdown. Start with \\documentclass and end with \\end{document}.${
  refinementInstructions && previousLatex
    ? `

## CURRENT TAILORED CV (LaTeX - already generated)
---
${previousLatex}
---

## USER REFINEMENT INSTRUCTIONS
The user wants the following specific changes applied to the CURRENT CV above:
${refinementInstructions}

Apply ONLY the requested changes. Keep everything else identical. Output the full updated LaTeX document.`
    : ''
}`
}

function formatDetectedLinks(linkMetadata) {
  if (!Array.isArray(linkMetadata) || linkMetadata.length === 0) {
    return '- No structured links were detected.'
  }

  return linkMetadata
    .map((link) => `- kind=${link.kind} | context=${link.context || ''} | label=${link.label || ''} | url=${link.url || ''}`)
    .join('\n')
}

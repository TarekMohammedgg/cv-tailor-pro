/**
 * Build the prompt for CV tailoring
 * @param {string} cvText - Original CV text
 * @param {string} jobDescription - Target job description
 * @returns {string} - Complete prompt
 */
export function buildCvPrompt(cvText, jobDescription) {
  return `You are an expert CV/Resume writer. Your task is to tailor the CV below to match the Job Description, then output it using the EXACT LaTeX template provided.

## STRICT RULES
1. ONLY USE INFORMATION FROM THE ORIGINAL CV — Never fabricate or invent anything.
2. Reorder and emphasize the most relevant skills/experiences to match the JD.
3. Naturally incorporate keywords from the JD where they genuinely apply.
4. Keep measurable achievements. Do not invent numbers.
5. Output 1-2 pages maximum.

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
- Skills section: use a simple format like "\\textbf{Category:} item1, item2, item3" with line breaks between categories.

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

% Section formatting — no numbering, bold uppercase, line below
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
  email@example.com \\enspace|\\enspace (+20) 123 456 7890 \\enspace|\\enspace City, Country \\\\
  \\href{https://linkedin.com/in/username}{linkedin.com/in/username} \\enspace|\\enspace \\href{https://github.com/username}{github.com/username}
\\end{center}

\\vspace{4pt}

% ===== SUMMARY =====
\\section*{Summary}
Write 2-3 sentences tailored to the JD here.

% ===== EXPERIENCE =====
\\section*{Professional Experience}

\\textbf{Job Title} \\hfill \\textit{MM/YYYY -- MM/YYYY} \\\\
\\textit{Company Name, City, Country}
\\begin{itemize}
  \\item Achievement 1 with metrics.
  \\item Achievement 2 with metrics.
\\end{itemize}

% Repeat the block above for each job. Each job gets its OWN \\begin{itemize}.

% ===== PROJECTS =====
\\section*{Projects}

\\textbf{Project Name 1} \\\\
\\begin{itemize}
  \\item Detail about this project.
  \\item Another detail about this project.
\\end{itemize}

\\textbf{Project Name 2} \\\\
\\begin{itemize}
  \\item Detail about this project.
  \\item Another detail about this project.
\\end{itemize}

% IMPORTANT: Each project is a SEPARATE block.
% The \\textbf{Project Name} line must be OUTSIDE any itemize environment.
% Each project has its OWN \\begin{itemize}...\\end{itemize}.

% ===== EDUCATION =====
\\section*{Education}

\\textbf{Degree} \\hfill \\textit{YYYY -- YYYY} \\\\
\\textit{University Name, City, Country}
\\begin{itemize}
  \\item GPA: X.XX/4.0
  \\item Notable achievement or project.
\\end{itemize}

% ===== SKILLS =====
\\section*{Skills}

\\textbf{Mobile Development:} Flutter, Firebase, REST APIs, etc. \\\\
\\textbf{State Management:} Cubit, Provider, etc. \\\\
\\textbf{Languages:} Dart, Python, etc. \\\\
\\textbf{Tools:} Git, VS Code, etc.

% ===== LANGUAGES =====
\\section*{Languages}
Arabic (Native), English (Fluent)

\\end{document}

## OUTPUT
Output ONLY the filled-in LaTeX code. No explanations. No markdown. Start with \\documentclass and end with \\end{document}.`
}

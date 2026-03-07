/**
 * Build the prompt for generating a professional application email
 * @param {string} cvText - Original CV text
 * @param {string} jobDescription - Target job description
 * @returns {string} - Complete prompt
 */
export function buildEmailPrompt(cvText, jobDescription) {
  return `You are a senior tech recruiter. Write a job application email FROM the candidate TO the hiring team.

## EXACT STRUCTURE TO FOLLOW:

Line 1: "Dear Hiring Team,"
Line 2: [empty line]
Line 3: Opening sentence — state the EXACT job title + ONE sentence proving you match the MOST IMPORTANT JD requirement. Mention years/months of experience if relevant. Keep to 2-3 lines max.
Line 4: [empty line]
Line 5: "Relevant to your requirements:"
Lines 6-8: Exactly 3 bullet points starting with "- ". Each bullet MUST directly answer a SPECIFIC requirement from the Job Description. Use numbers/metrics from the CV when available. Each bullet = 1-2 lines max.
Line 9: [empty line]
Line 10: Closing — ONE sentence. Mention attached CV + availability. Example: "My CV is attached with full project details. I'm available for a call or technical interview at your convenience."
Line 11: [empty line]
Line 12: "Best regards,"
Line 13: [Candidate full name from CV]

## CRITICAL RULES:

1. MAPPING: Read EACH requirement in the Job Description. For the 3 bullets, pick the 3 MOST IMPORTANT JD requirements and find matching evidence from the CV. If the JD asks for "Figma to Flutter UI" and the CV mentions responsive UI, the bullet should say "Responsive UI implementation converting designs into Flutter interfaces across 20+ device types".

2. KEYWORDS: Use the EXACT technologies/tools mentioned in the JD (e.g., if JD says "GetX and Provider", mention both by name — but ONLY if they exist in the CV).

3. NEVER FABRICATE: Only use information from the CV. If the CV doesn't mention a JD requirement, skip it and use another relevant match.

4. NO CLICHÉS: Never use "passionate", "enthusiastic", "excited", "I believe", "I am confident", "I would be a great fit".

5. NO BRACKETS: Never use [Company Name] or [Platform] placeholders. If the company name is in the JD, use it. If not, just skip it.

6. TOTAL LENGTH: 8-12 sentences maximum including the greeting and sign-off.

7. NO BULLET SYMBOLS other than "- " (dash space). Do NOT use * or • or numbers.

## CANDIDATE CV
---
${cvText}
---

## TARGET JOB DESCRIPTION
---
${jobDescription}
---

## OUTPUT FORMAT
Respond ONLY in this exact JSON format. No markdown, no backticks, no explanation:
{"subject":"Application for [Exact Job Title from JD] — [Candidate Full Name]","body":"Dear Hiring Team,\\n\\nOpening sentence here.\\n\\nRelevant to your requirements:\\n- Bullet 1 matching JD requirement.\\n- Bullet 2 matching JD requirement.\\n- Bullet 3 matching JD requirement.\\n\\nClosing sentence here.\\n\\nBest regards,\\n[Candidate Name]","candidateName":"[Name from CV]"}`
}

/**
 * Build the prompt for generating a professional application email
 * @param {string} cvText - Original CV text
 * @param {string} jobDescription - Target job description
 * @returns {string} - Complete prompt
 */
export function buildEmailPrompt(cvText, jobDescription) {
  return `You are a senior HR recruiter with 15+ years of experience. You know exactly what makes a hiring manager stop and read an application email vs. delete it. Write an application email FROM the candidate below TO a hiring team.

## WHAT RECRUITERS ACTUALLY WANT (follow these strictly):
1. SUBJECT LINE: Must include the exact job title from the JD + candidate name. No creativity — recruiters filter by subject. Example: "Application for [Job Title] — [Candidate Name]"
2. OPENING: One sentence max. State the role you're applying for and ONE hook (strongest match to JD). NO "I am writing to express my enthusiastic interest" — that's filler that recruiters skip.
3. VALUE PARAGRAPH: 2-3 bullet-style sentences. Each one = a specific achievement/skill from the CV that directly answers a JD requirement. Use numbers when available. Show impact, not duties.
4. CLOSING: One sentence requesting next steps. Be confident but not pushy. "I'd welcome the opportunity to discuss how I can contribute" is better than begging for an interview.
5. SIGN-OFF: Use "Best regards," followed by candidate name. Do NOT add any contact details or links — those will be added separately by the user.

## CRITICAL RULES:
- TOTAL LENGTH: 8-12 sentences MAXIMUM. Recruiters spend 6 seconds scanning an email.
- NEVER use placeholder brackets like [Company Name] or [Platform] — if the company name is in the JD, use it. If not, write around it naturally.
- NEVER fabricate. Only use what's in the CV.
- NEVER use clichés: "passionate", "enthusiastic", "excited", "I believe I would be a great fit", "I am confident".
- DO use concrete language: numbers, tools, outcomes.
- Tone: Professional, direct, and human. Like a competent colleague — not a desperate applicant.
- Write the email as PLAIN TEXT (no HTML, no markdown).
- End the body with ONLY "Best regards,\\n[Candidate Name]" — nothing else after that.

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
{"subject":"Application for [Exact Job Title] — [Candidate Name]","body":"The email body here. Use \\n for line breaks between paragraphs. End with Best regards,\\n[Name]","candidateName":"Extracted from CV"}`
}

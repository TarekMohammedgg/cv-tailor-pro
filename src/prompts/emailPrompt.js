/**
 * Build the prompt for generating a professional application email
 * @param {string} cvText - Original CV text
 * @param {string} jobDescription - Target job description
 * @returns {string} - Complete prompt
 */
export function buildEmailPrompt(cvText, jobDescription) {
  return `You are an expert career consultant who writes professional job application emails.

## TASK
Generate a professional email to send to a hiring manager / recruitment team along with a CV/resume attachment. The email should be concise, compelling, and tailored to the job description.

## RULES
1. ONLY reference skills, experience, and qualifications that exist in the CV. Never fabricate.
2. Keep the email SHORT — 3-4 paragraphs maximum. Recruiters receive hundreds of emails.
3. Be professional but warm — not robotic or overly formal.
4. Mention 2-3 KEY strengths from the CV that directly match the job requirements.
5. Include a clear call-to-action (e.g., requesting an interview or a call).
6. The email should feel personal and specific to this role — NOT a generic template.
7. Do NOT include the candidate's full address or the company's address — this is an email, not a letter.

## CANDIDATE CV
---
${cvText}
---

## TARGET JOB DESCRIPTION
---
${jobDescription}
---

## OUTPUT FORMAT
Respond ONLY in this exact JSON format, no markdown, no backticks, no extra text:
{"subject":"The email subject line here","body":"The email body here. Use \\n for new lines between paragraphs.","candidateName":"Extracted from CV"}`
}

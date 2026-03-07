import { buildCvPrompt } from '../prompts/cvPrompt.js'
import { buildEmailPrompt } from '../prompts/emailPrompt.js'

/**
 * Generate tailored CV LaTeX using the selected AI provider
 * @param {Object} params
 * @param {string} params.cvText - Extracted CV text
 * @param {string} params.jobDescription - Job description
 * @param {string} params.provider - 'gemini' | 'openai' | 'claude'
 * @param {string} params.apiKey - User's API key
 * @param {string} [params.edgeFunctionUrl] - Supabase Edge Function URL (for OpenAI/Claude)
 * @returns {Promise<string>} - LaTeX code
 */
export async function generateTailoredCV({ cvText, jobDescription, provider, apiKey, edgeFunctionUrl, geminiModel }) {
  const prompt = buildCvPrompt(cvText, jobDescription)

  switch (provider) {
    case 'gemini':
      return callGemini(prompt, apiKey, geminiModel)
    case 'openai':
      return callViaEdgeFunction(prompt, 'openai', apiKey, edgeFunctionUrl)
    case 'claude':
      return callViaEdgeFunction(prompt, 'claude', apiKey, edgeFunctionUrl)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

/**
 * Generate a professional application email
 * @returns {Promise<{subject: string, body: string, candidateName: string}>}
 */
export async function generateApplicationEmail({ cvText, jobDescription, provider, apiKey, edgeFunctionUrl, geminiModel }) {
  const prompt = buildEmailPrompt(cvText, jobDescription)
  let rawText

  switch (provider) {
    case 'gemini':
      rawText = await callGeminiRaw(prompt, apiKey, geminiModel)
      break
    case 'openai':
      rawText = await callViaEdgeFunctionRaw(prompt, 'openai', apiKey, edgeFunctionUrl)
      break
    case 'claude':
      rawText = await callViaEdgeFunctionRaw(prompt, 'claude', apiKey, edgeFunctionUrl)
      break
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }

  // Parse JSON from AI response
  try {
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()
    // Find the JSON object in the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const parsed = JSON.parse(jsonMatch[0])
    return {
      subject: parsed.subject || '',
      body: (parsed.body || '').replace(/\\n/g, '\n'),
      candidateName: parsed.candidateName || '',
    }
  } catch (err) {
    throw new Error('Failed to parse email response. Please try again.')
  }
}

/**
 * Gemini models to try in order (fallback chain)
 * As of March 2026, free tier models are: 2.5 Flash-Lite, 2.5 Flash, 2.5 Pro
 * Old 1.5 and 2.0 models have been deprecated/retired.
 */
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',   // Highest free quota: 15 RPM, 1000 RPD
  'gemini-2.5-flash',        // Balanced: 10 RPM, 500 RPD
  'gemini-2.5-pro',          // Most capable: 5 RPM, 100 RPD
]

/**
 * Call Gemini API directly (CORS-friendly)
 * Tries multiple models as fallback if quota is exceeded
 */
async function callGemini(prompt, apiKey, modelOverride) {
  // If user selected a specific model, try it first
  const modelsToTry = modelOverride
    ? [modelOverride, ...GEMINI_MODELS.filter((m) => m !== modelOverride)]
    : GEMINI_MODELS

  let lastError = null

  for (const model of modelsToTry) {
    try {
      console.log(`Trying Gemini model: ${model}...`)
      const result = await callGeminiModel(prompt, apiKey, model)
      console.log(`Success with ${model}`)
      return result
    } catch (err) {
      console.warn(`${model} failed:`, err.message)
      lastError = err

      // If it's NOT a quota/rate-limit/not-found error, don't try other models
      const isRetryableError =
        err.message?.includes('quota') ||
        err.message?.includes('rate') ||
        err.message?.includes('429') ||
        err.message?.includes('limit') ||
        err.message?.includes('not found') ||
        err.message?.includes('not supported') ||
        err.message?.includes('deprecated') ||
        err.message?.includes('retired')
      if (!isRetryableError) {
        throw err
      }
    }
  }

  throw new Error(
    `All Gemini models exceeded quota. ${lastError?.message || ''}\n\n` +
    'Solutions:\n' +
    '1. Wait a few minutes and try again\n' +
    '2. Create a new API key at https://aistudio.google.com/apikey\n' +
    '3. Enable billing on your Google Cloud project for higher limits'
  )
}

/**
 * Call a specific Gemini model
 */
async function callGeminiModel(prompt, apiKey, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Gemini API error: ${res.status}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

  if (!text) {
    throw new Error('Empty response from Gemini')
  }

  return cleanLatexOutput(text)
}

/**
 * Call OpenAI or Claude via Supabase Edge Function (avoids CORS)
 */
async function callViaEdgeFunction(prompt, provider, apiKey, edgeFunctionUrl) {
  if (!edgeFunctionUrl) {
    throw new Error(
      `${provider === 'openai' ? 'OpenAI' : 'Claude'} requires the Supabase Edge Function. ` +
      'Please deploy the "generate-cv" Edge Function and enter its URL in Settings.'
    )
  }

  const res = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, provider, apiKey }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || `Edge Function error: ${res.status}`)
  }

  const data = await res.json()
  return cleanLatexOutput(data.latex || data.text || '')
}

/**
 * Clean AI output to extract only LaTeX code
 */
function cleanLatexOutput(text) {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```latex\s*/gi, '').replace(/```\s*/g, '')

  // Try to extract just the LaTeX document
  const docMatch = cleaned.match(/\\documentclass[\s\S]*\\end\{document\}/i)
  if (docMatch) {
    cleaned = docMatch[0]
  }

  return cleaned.trim()
}

// ─── Raw text helpers (for email generation) ──────────

/**
 * Call Gemini and return raw text (no LaTeX cleaning)
 */
async function callGeminiRaw(prompt, apiKey, geminiModel) {
  const modelsToTry = geminiModel
    ? [geminiModel, ...GEMINI_MODELS.filter((m) => m !== geminiModel)]
    : GEMINI_MODELS

  let lastError = null
  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `Gemini error: ${res.status}`)
      }
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (!text) throw new Error('Empty response')
      return text
    } catch (err) {
      lastError = err
      const isRetryable = err.message?.includes('quota') || err.message?.includes('429') || err.message?.includes('not found')
      if (!isRetryable) throw err
    }
  }
  throw lastError
}

/**
 * Call Edge Function and return raw text
 */
async function callViaEdgeFunctionRaw(prompt, provider, apiKey, edgeFunctionUrl) {
  if (!edgeFunctionUrl) {
    throw new Error(`${provider} requires the Edge Function URL.`)
  }
  const res = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, provider, apiKey }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || `Edge Function error: ${res.status}`)
  }
  const data = await res.json()
  return data.latex || data.text || ''
}

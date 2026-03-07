import { buildCvPrompt } from '../prompts/cvPrompt.js'
import { buildEmailPrompt } from '../prompts/emailPrompt.js'

/**
 * Generate tailored CV LaTeX
 */
export async function generateTailoredCV({ cvText, jobDescription, provider, apiKey, geminiModel }) {
  const prompt = buildCvPrompt(cvText, jobDescription)

  if (provider !== 'gemini') {
    throw new Error(
      `${provider === 'openai' ? 'OpenAI' : 'Claude'} is not supported in this version. ` +
      'Please use Google Gemini (free) instead.'
    )
  }

  return callGemini(prompt, apiKey, geminiModel)
}

/**
 * Generate a professional application email
 */
export async function generateApplicationEmail({ cvText, jobDescription, provider, apiKey, geminiModel }) {
  const prompt = buildEmailPrompt(cvText, jobDescription)

  if (provider !== 'gemini') {
    throw new Error('Please use Google Gemini for email generation.')
  }

  const rawText = await callGeminiRaw(prompt, apiKey, geminiModel)

  try {
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const parsed = JSON.parse(jsonMatch[0])
    return {
      subject: parsed.subject || '',
      body: (parsed.body || '').replace(/\\n/g, '\n'),
      candidateName: parsed.candidateName || '',
    }
  } catch {
    throw new Error('Failed to parse email response. Please try again.')
  }
}

// ─── Gemini Models ────────────────────────────────

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',   // 15 RPM, 1000 RPD
  'gemini-2.5-flash',        // 10 RPM, 500 RPD
  'gemini-2.5-pro',          // 5 RPM, 100 RPD
]

// ─── Gemini API (with fallback) ───────────────────

async function callGemini(prompt, apiKey, modelOverride) {
  const modelsToTry = modelOverride
    ? [modelOverride, ...GEMINI_MODELS.filter((m) => m !== modelOverride)]
    : GEMINI_MODELS

  let lastError = null

  for (const model of modelsToTry) {
    try {
      console.log(`Trying Gemini model: ${model}...`)
      const text = await fetchGemini(prompt, apiKey, model, 8192)
      return cleanLatexOutput(text)
    } catch (err) {
      console.warn(`${model} failed:`, err.message)
      lastError = err
      if (!isRetryableError(err)) throw err
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

async function callGeminiRaw(prompt, apiKey, geminiModel) {
  const modelsToTry = geminiModel
    ? [geminiModel, ...GEMINI_MODELS.filter((m) => m !== geminiModel)]
    : GEMINI_MODELS

  let lastError = null
  for (const model of modelsToTry) {
    try {
      return await fetchGemini(prompt, apiKey, model, 2048)
    } catch (err) {
      lastError = err
      if (!isRetryableError(err)) throw err
    }
  }
  throw lastError
}

// ─── Shared Helpers ───────────────────────────────

async function fetchGemini(prompt, apiKey, model, maxTokens) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: maxTokens,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Gemini API error: ${res.status}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  if (!text) throw new Error('Empty response from Gemini')
  return text
}

function isRetryableError(err) {
  const msg = err.message?.toLowerCase() || ''
  return (
    msg.includes('quota') ||
    msg.includes('rate') ||
    msg.includes('429') ||
    msg.includes('limit') ||
    msg.includes('not found') ||
    msg.includes('not supported') ||
    msg.includes('deprecated') ||
    msg.includes('retired')
  )
}

function cleanLatexOutput(text) {
  let cleaned = text.replace(/```latex\s*/gi, '').replace(/```\s*/g, '')
  const docMatch = cleaned.match(/\\documentclass[\s\S]*\\end\{document\}/i)
  if (docMatch) cleaned = docMatch[0]
  return cleaned.trim()
}

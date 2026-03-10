import { buildCvPrompt, buildLegacyCvPrompt } from '../prompts/cvPrompt.js'
import { buildEmailPrompt } from '../prompts/emailPrompt.js'
import { parseExtractedCvSource, stripLinkMetadataText } from './cvSourceParser.js'
import { DEFAULT_TEMPLATE_MODE, TEMPLATE_MODES, renderReferenceLockedCv } from './referenceCvTemplate.js'

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
]

export async function generateTailoredCV({
  cvText,
  jobDescription,
  apiKey,
  geminiModel,
  refinementInstructions,
  previousLatex,
  templateMode = DEFAULT_TEMPLATE_MODE,
}) {
  if (templateMode === TEMPLATE_MODES.LEGACY_FREEFORM) {
    const prompt = buildLegacyCvPrompt(cvText, jobDescription, refinementInstructions, previousLatex)
    return callGeminiLatex(prompt, apiKey, geminiModel)
  }

  const cvSource = parseExtractedCvSource(cvText)
  const prompt = buildCvPrompt({
    cvText: cvSource.cleanText,
    linkMetadata: cvSource.links,
    jobDescription,
    refinementInstructions,
    previousLatex,
  })

  const rawText = await callGeminiStructured(prompt, apiKey, geminiModel)
  const structuredCv = parseStructuredCvResponse(rawText)
  return renderReferenceLockedCv(structuredCv, cvSource.links)
}

export async function generateApplicationEmail({ cvText, jobDescription, apiKey, geminiModel }) {
  const prompt = buildEmailPrompt(stripLinkMetadataText(cvText), jobDescription)
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

async function callGeminiLatex(prompt, apiKey, modelOverride) {
  const modelsToTry = modelOverride
    ? [modelOverride, ...GEMINI_MODELS.filter((model) => model !== modelOverride)]
    : GEMINI_MODELS

  let lastError = null

  for (const model of modelsToTry) {
    try {
      console.log(`Trying Gemini model: ${model}...`)
      const text = await fetchGemini(prompt, apiKey, model, 8192)
      return cleanLatexOutput(text)
    } catch (error) {
      console.warn(`${model} failed:`, error.message)
      lastError = error
      if (!isRetryableError(error)) throw error
    }
  }

  throw buildQuotaError(lastError)
}

async function callGeminiStructured(prompt, apiKey, modelOverride) {
  const modelsToTry = modelOverride
    ? [modelOverride, ...GEMINI_MODELS.filter((model) => model !== modelOverride)]
    : GEMINI_MODELS

  let lastError = null

  for (const model of modelsToTry) {
    try {
      console.log(`Trying Gemini model: ${model}...`)
      return await fetchGemini(prompt, apiKey, model, 8192)
    } catch (error) {
      console.warn(`${model} failed:`, error.message)
      lastError = error
      if (!isRetryableError(error)) throw error
    }
  }

  throw buildQuotaError(lastError)
}

async function callGeminiRaw(prompt, apiKey, geminiModel) {
  const modelsToTry = geminiModel
    ? [geminiModel, ...GEMINI_MODELS.filter((model) => model !== geminiModel)]
    : GEMINI_MODELS

  let lastError = null
  for (const model of modelsToTry) {
    try {
      return await fetchGemini(prompt, apiKey, model, 2048)
    } catch (error) {
      lastError = error
      if (!isRetryableError(error)) throw error
    }
  }
  throw lastError
}

async function fetchGemini(prompt, apiKey, model, maxTokens) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: maxTokens,
      },
    }),
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    throw new Error(errorPayload?.error?.message || `Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  if (!text) throw new Error('Empty response from Gemini')
  return text
}

function isRetryableError(error) {
  const message = error.message?.toLowerCase() || ''
  return (
    message.includes('quota') ||
    message.includes('rate') ||
    message.includes('429') ||
    message.includes('limit') ||
    message.includes('not found') ||
    message.includes('not supported') ||
    message.includes('deprecated') ||
    message.includes('retired')
  )
}

function cleanLatexOutput(text) {
  let cleaned = text.replace(/```latex\s*/gi, '').replace(/```\s*/g, '')
  const documentMatch = cleaned.match(/\\documentclass[\s\S]*\\end\{document\}/i)
  if (documentMatch) cleaned = documentMatch[0]
  return cleaned.trim()
}

function parseStructuredCvResponse(rawText) {
  const cleaned = String(rawText || '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AI did not return structured CV data. Please try again.')
  }

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('Failed to parse the structured CV response. Please try again.')
  }
}

function buildQuotaError(lastError) {
  return new Error(
    `All Gemini models exceeded quota. ${lastError?.message || ''}\n\n` +
    'Solutions:\n' +
    '1. Wait a few minutes and try again\n' +
    '2. Create a new API key at https://aistudio.google.com/apikey\n' +
    '3. Enable billing on your Google Cloud project for higher limits'
  )
}

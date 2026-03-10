export const LINK_MAP_START = '[LINK_MAP_START]'
export const LINK_MAP_END = '[LINK_MAP_END]'

export function buildLinkMetadataBlock(links) {
  const normalizedLinks = Array.isArray(links) ? links.filter(Boolean) : []
  if (!normalizedLinks.length) return ''

  return [
    LINK_MAP_START,
    ...normalizedLinks.map((link) => `[LINK] ${JSON.stringify(link)}`),
    LINK_MAP_END,
  ].join('\n')
}

export function parseExtractedCvSource(cvText) {
  const rawText = String(cvText || '')
  const startIndex = rawText.indexOf(LINK_MAP_START)
  const endIndex = rawText.indexOf(LINK_MAP_END)

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return {
      rawText,
      cleanText: rawText.trim(),
      links: [],
    }
  }

  const beforeBlock = rawText.slice(0, startIndex).trimEnd()
  const afterBlock = rawText.slice(endIndex + LINK_MAP_END.length).trimStart()
  const block = rawText.slice(startIndex + LINK_MAP_START.length, endIndex)

  const links = block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('[LINK] '))
    .map((line) => line.slice('[LINK] '.length))
    .map((payload) => {
      try {
        return JSON.parse(payload)
      } catch {
        return null
      }
    })
    .filter(Boolean)

  const cleanText = [beforeBlock, afterBlock]
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return {
    rawText,
    cleanText,
    links,
  }
}

export function stripLinkMetadataText(cvText) {
  return parseExtractedCvSource(cvText).cleanText
}

export function normalizeLookupKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/https?:\/\/(www\.)?/g, '')
    .replace(/\[(.*?)\]/g, '$1')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

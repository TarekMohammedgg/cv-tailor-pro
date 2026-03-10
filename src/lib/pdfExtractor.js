import * as pdfjsLib from 'pdfjs-dist'
import { buildLinkMetadataBlock } from './cvSourceParser.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

const SECTION_HEADINGS = new Set([
  'Summary',
  'Education',
  'Experience',
  'Projects',
  'Technical Skills',
  'Soft Skills',
  'Courses & Certifications',
  'Languages',
])

export async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const allLines = []
  const allLinks = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const pageLines = attachSections(groupTextItemsIntoLines(textContent.items))
    const annotations = await page.getAnnotations()

    allLines.push(...pageLines.map((line) => line.text), '')
    allLinks.push(...extractLinkMetadata(annotations, pageLines, pageNumber))
  }

  const cleanText = allLines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  const linkBlock = buildLinkMetadataBlock(dedupeLinks(allLinks))

  return linkBlock ? `${cleanText}\n\n${linkBlock}` : cleanText
}

function groupTextItemsIntoLines(items) {
  const preparedItems = items
    .map((item) => ({
      text: String(item.str || ''),
      x: Number(item.transform?.[4] || 0),
      y: Number(item.transform?.[5] || 0),
      width: Number(item.width || 0),
    }))
    .filter((item) => item.text.trim())
    .sort((left, right) => {
      if (Math.abs(right.y - left.y) > 2) {
        return right.y - left.y
      }
      return left.x - right.x
    })

  const lines = []

  for (const item of preparedItems) {
    const lastLine = lines[lines.length - 1]
    if (!lastLine || Math.abs(lastLine.y - item.y) > 2.5) {
      lines.push({ y: item.y, items: [item] })
      continue
    }

    lastLine.items.push(item)
  }

  return lines
    .map((line) => {
      const sortedItems = [...line.items].sort((left, right) => left.x - right.x)
      return {
        y: line.y,
        items: sortedItems,
        text: joinLineTokens(sortedItems),
      }
    })
    .filter((line) => line.text)
}

function attachSections(lines) {
  let currentSection = 'header'

  return lines.map((line) => {
    if (SECTION_HEADINGS.has(line.text)) {
      currentSection = normalizeSectionName(line.text)
    }

    return {
      ...line,
      section: currentSection,
    }
  })
}

function extractLinkMetadata(annotations, lines, pageNumber) {
  return annotations
    .filter((annotation) => annotation.subtype === 'Link' && annotation.url)
    .map((annotation) => buildLinkMetadata(annotation, lines, pageNumber))
    .filter(Boolean)
}

function buildLinkMetadata(annotation, lines, pageNumber) {
  const bounds = getBounds(annotation.rect)
  const line = findNearestLine(lines, bounds)
  const labelItems = line ? line.items.filter((item) => overlapsHorizontally(bounds, item)) : []
  const label = labelItems.length ? joinLineTokens(labelItems) : guessLabelFromUrl(annotation.url)
  const kind = determineLinkKind(line, label, annotation.url)

  if (kind === 'external') return null

  return {
    kind,
    context: determineLinkContext(kind, line, label, annotation.url),
    label,
    url: annotation.url,
    lineText: line?.text || '',
    page: pageNumber,
  }
}

function findNearestLine(lines, bounds) {
  const overlappingLine = lines.find((line) => line.y >= bounds.bottom - 3 && line.y <= bounds.top + 3)
  if (overlappingLine) return overlappingLine

  return [...lines]
    .sort((left, right) => Math.abs(left.y - bounds.bottom) - Math.abs(right.y - bounds.bottom))[0]
}

function determineLinkKind(line, label, url) {
  const lowerUrl = String(url || '').toLowerCase()
  const lowerLabel = String(label || '').toLowerCase()
  const lineText = String(line?.text || '').toLowerCase()

  if (line?.section === 'header') {
    return 'header'
  }

  if (line?.section === 'courses_certifications' || lowerLabel.includes('certificate') || lineText.includes('[certificate]')) {
    return 'certification'
  }

  if (line?.section === 'projects' || lowerLabel.includes('github') || lowerLabel.includes('apk') || lineText.includes('[github]') || lineText.includes('[apk]')) {
    return 'project'
  }

  if (lowerUrl.includes('linkedin.com')) {
    return 'header'
  }

  return 'external'
}

function determineLinkContext(kind, line, label, url) {
  if (kind === 'header') {
    if (String(url).toLowerCase().includes('linkedin.com')) return 'LinkedIn'
    if (String(url).toLowerCase().includes('github.com')) return 'GitHub'
    return label || 'Header'
  }

  const lineText = String(line?.text || '')
  return lineText
    .replace(label, '')
    .replace(/\[(GitHub|APK|Certificate)\]/gi, '')
    .replace(/[\s:|-]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function joinLineTokens(items) {
  return items.reduce((text, item, index) => {
    const currentText = item.text.trim()
    if (!currentText) return text
    if (index === 0) return currentText

    const previous = items[index - 1]
    const previousEnd = previous.x + previous.width
    const gap = item.x - previousEnd

    const noLeadingSpace = /^[,.;:!?\]\)]/.test(currentText)
    const noTrailingSpace = /[\[(/-]$/.test(previous.text)
    const shouldJoin = gap < 1.5 || noLeadingSpace || noTrailingSpace

    return shouldJoin ? `${text}${currentText}` : `${text} ${currentText}`
  }, '')
}

function overlapsHorizontally(bounds, item) {
  const itemLeft = item.x
  const itemRight = item.x + item.width
  return itemRight >= bounds.left - 2 && itemLeft <= bounds.right + 2
}

function getBounds(rect) {
  const [x1, y1, x2, y2] = rect || [0, 0, 0, 0]
  return {
    left: Math.min(x1, x2),
    right: Math.max(x1, x2),
    bottom: Math.min(y1, y2),
    top: Math.max(y1, y2),
  }
}

function guessLabelFromUrl(url) {
  const value = String(url || '')
  if (value.includes('linkedin.com')) return 'LinkedIn'
  if (value.includes('github.com')) return '[GitHub]'
  if (value.includes('drive.google.com')) return '[Certificate]'
  return value
}

function normalizeSectionName(heading) {
  return heading
    .toLowerCase()
    .replace(/\s*&\s*/g, '_')
    .replace(/\s+/g, '_')
}

function dedupeLinks(links) {
  const seen = new Set()

  return links.filter((link) => {
    const key = JSON.stringify([link.kind, link.context, link.label, link.url])
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

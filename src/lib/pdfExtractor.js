import * as pdfjsLib from 'pdfjs-dist'

// Set the worker source to CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

/**
 * Extract text from a PDF File object
 * @param {File} file - The PDF file
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item) => item.str)
      .join(' ')
    fullText += pageText + '\n\n'

    const annotations = await page.getAnnotations()
    const links = annotations
      .filter(a => a.subtype === 'Link' && a.url)
      .map(a => `[PROJECT_LINK: ${a.url}]`)
    if (links.length > 0) {
      fullText += links.join('\n') + '\n'
    }
  }

  return fullText.trim()
}

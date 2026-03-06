/**
 * Convert LaTeX code to PDF using free compilation services
 * Tries multiple services as fallbacks
 */

const SERVICES = [
  {
    name: 'LaTeX.ytotech.com',
    compile: compileWithYtotech,
  },
  {
    name: 'latexonline.cc',
    compile: compileWithLatexOnline,
  },
]

/**
 * Convert LaTeX to PDF, trying multiple services
 * @param {string} latexCode - Complete LaTeX document
 * @returns {Promise<Blob>} - PDF as Blob
 */
export async function convertLatexToPdf(latexCode) {
  let lastError = null

  for (const service of SERVICES) {
    try {
      console.log(`Trying ${service.name}...`)
      const pdf = await service.compile(latexCode)
      console.log(`Success with ${service.name}`)
      return pdf
    } catch (err) {
      console.warn(`${service.name} failed:`, err.message)
      lastError = err
    }
  }

  throw new Error(
    `All LaTeX compilation services failed. Last error: ${lastError?.message}. ` +
    'You can copy the LaTeX code and compile it on Overleaf (overleaf.com) instead.'
  )
}

/**
 * YtoTech LaTeX Build API (free, no key required)
 * Docs: https://github.com/YtoTech/latex-on-http
 */
async function compileWithYtotech(latexCode) {
  const res = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'pdflatex',
      resources: [
        {
          main: true,
          content: latexCode,
        },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`ytotech error ${res.status}: ${errText.slice(0, 200)}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/pdf')) {
    // If not PDF, it's an error response
    const errText = await res.text()
    throw new Error(`Compilation failed: ${errText.slice(0, 300)}`)
  }

  return await res.blob()
}

/**
 * latexonline.cc API (free, uses GET with POST body)
 */
async function compileWithLatexOnline(latexCode) {
  const formData = new FormData()
  const blob = new Blob([latexCode], { type: 'application/x-tex' })
  formData.append('file', blob, 'document.tex')

  const res = await fetch('https://latexonline.cc/compile', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`latexonline error: ${res.status}`)
  }

  return await res.blob()
}

/**
 * Create a download link for a PDF Blob
 * @param {Blob} pdfBlob
 * @param {string} filename
 */
export function downloadPdf(pdfBlob, filename = 'tailored_cv.pdf') {
  const url = URL.createObjectURL(pdfBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Create a preview URL for a PDF Blob
 * @param {Blob} pdfBlob
 * @returns {string}
 */
export function createPdfPreviewUrl(pdfBlob) {
  return URL.createObjectURL(pdfBlob)
}

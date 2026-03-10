import React, { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, Sparkles, AlertCircle } from 'lucide-react'
import { stripLinkMetadataText } from '../lib/cvSourceParser.js'

export default function UploadStep({
  cvFile,
  setCvFile,
  cvText,
  setCvText,
  jobDescription,
  setJobDescription,
  onGenerate,
  isConfigured,
  extracting,
  setExtracting,
}) {
  const [dragOver, setDragOver] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const fileInputRef = useRef(null)

  const previewText = stripLinkMetadataText(cvText)
  const extractedWordCount = previewText
    ? previewText.split(/\s+/).filter(Boolean).length
    : 0

  const handleFile = useCallback(
    async (file) => {
      if (!file || file.type !== 'application/pdf') {
        setExtractError('Please upload a PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setExtractError('File size must be under 10MB')
        return
      }

      setExtractError(null)
      setCvFile(file)
      setExtracting(true)

      try {
        const { extractTextFromPdf } = await import('../lib/pdfExtractor.js')
        const text = await extractTextFromPdf(file)
        if (!stripLinkMetadataText(text).trim()) {
          setExtractError('Could not extract text from this PDF. It may be scanned or image-based.')
          setCvText('')
        } else {
          setCvText(text)
        }
      } catch (error) {
        console.error('PDF extraction failed:', error)
        setExtractError('Failed to extract text from PDF: ' + error.message)
        setCvText('')
      } finally {
        setExtracting(false)
      }
    },
    [setCvFile, setCvText, setExtracting]
  )

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault()
      setDragOver(false)
      const file = event.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragOver(true)
  }

  const removeCv = () => {
    setCvFile(null)
    setCvText('')
    setExtractError(null)
  }

  const canGenerate = cvFile && previewText && jobDescription.trim().length > 20 && isConfigured

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4">
      <div className="card">
        <h3 className="font-display font-semibold text-white mb-1">Upload Your CV</h3>
        <p className="text-sm text-gray-500 mb-4">PDF format - text and link metadata will be extracted automatically</p>

        {!cvFile ? (
          <div
            className={`upload-zone ${dragOver ? 'dragover' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(event) => handleFile(event.target.files?.[0])}
              className="hidden"
            />
            <Upload size={32} className="mx-auto mb-3 text-gray-500" />
            <p className="text-sm text-gray-300 font-medium">
              Drop your CV here or <span className="text-indigo-400">browse</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">PDF only, max 10MB</p>
          </div>
        ) : (
          <div className="upload-zone has-file">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <FileText size={20} className="text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-[300px]">
                    {cvFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(cvFile.size / 1024).toFixed(1)} KB
                    {previewText && ` - ${extractedWordCount} words extracted`}
                    {extracting && ' - extracting...' }
                  </p>
                </div>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  removeCv()
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {extractError && (
          <div className="mt-3 flex items-start gap-2 text-sm text-amber-400 bg-amber-400/5 rounded-lg p-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{extractError}</span>
          </div>
        )}

        {previewText && (
          <details className="mt-3">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition">
              Preview extracted text ({previewText.length} characters)
            </summary>
            <pre className="mt-2 text-xs text-gray-400 bg-[#0d0f1a] rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
              {previewText.slice(0, 2000)}
              {previewText.length > 2000 && '...'}
            </pre>
          </details>
        )}
      </div>

      <div className="card">
        <h3 className="font-display font-semibold text-white mb-1">Job Description</h3>
        <p className="text-sm text-gray-500 mb-4">Paste the full job description you are targeting</p>

        <textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the job description here...&#10;&#10;Include role title, responsibilities, required skills, and qualifications for the best results."
          className="input-field min-h-[200px] resize-y text-sm leading-relaxed"
          spellCheck={false}
        />

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-600">
            {jobDescription.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          {jobDescription.trim().length > 0 && jobDescription.trim().length < 50 && (
            <span className="text-xs text-amber-400">Add more detail for better results</span>
          )}
        </div>
      </div>

      <div className="text-center pt-2 pb-8">
        {!isConfigured && (
          <p className="text-sm text-amber-400 mb-3">
            Please configure your API key in Settings first
          </p>
        )}
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5"
        >
          <Sparkles size={18} />
          Generate Tailored CV
        </button>
        <p className="text-xs text-gray-600 mt-3 max-w-sm mx-auto">
          Reference Locked mode keeps the rebuilt master CV structure stable while tailoring the wording to the job.
        </p>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import {
  Download,
  Copy,
  Check,
  Code2,
  FileText,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react'
import { downloadPdf } from '../lib/latexToPdf.js'
import EmailSection from './EmailSection.jsx'

const SUGGESTION_CHIPS = [
  { label: 'Reorder sections', text: 'Move Skills section before Experience.' },
  { label: 'Shorten summary', text: 'Shorten the Summary to 2-3 concise lines.' },
  { label: 'More keywords', text: 'Add more relevant keywords from the job description.' },
  { label: 'Professional tone', text: 'Make the language more formal and professional.' },
  { label: 'Stronger bullets', text: 'Rewrite bullet points to start with strong action verbs and include metrics.' },
]

export default function ResultStep({
  latexCode,
  pdfBlob,
  pdfPreviewUrl,
  compilationError,
  onReset,
  onRegenerate,
  isRegenerating,
  cvText,
  jobDescription,
  settings,
}) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(pdfBlob ? 'preview' : 'latex')
  const [refineOpen, setRefineOpen] = useState(false)
  const [refinementText, setRefinementText] = useState('')

  const handleCopyLatex = async () => {
    try {
      await navigator.clipboard.writeText(latexCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = latexCode
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerate = async () => {
    if (!refinementText.trim() || isRegenerating) return
    await onRegenerate(refinementText)
    setRefinementText('')
  }

  const appendChip = (text) => {
    setRefinementText((prev) => {
      const trimmed = prev.trimEnd()
      return trimmed ? `${trimmed} ${text}` : text
    })
    setRefineOpen(true)
  }

  const handleDownload = () => {
    if (pdfBlob) {
      downloadPdf(pdfBlob, 'tailored_cv.pdf')
    }
  }

  const handleDownloadLatex = () => {
    const blob = new Blob([latexCode], { type: 'application/x-tex' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tailored_cv.tex'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Success Banner */}
      <div className="card bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Your Tailored CV is Ready!
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              ATS-optimized and matched to the job description.
            </p>
          </div>
          <button onClick={onReset} className="btn-secondary flex items-center gap-1.5 text-sm">
            <RotateCcw size={14} />
            New
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-5">
          {pdfBlob && (
            <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
              <Download size={16} />
              Download PDF
            </button>
          )}
          <button onClick={handleDownloadLatex} className="btn-secondary flex items-center gap-2">
            <Code2 size={16} />
            Download .tex
          </button>
          <button onClick={handleCopyLatex} className="btn-secondary flex items-center gap-2">
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy LaTeX'}
          </button>
          <a
            href="https://www.overleaf.com/project"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Open Overleaf
          </a>
        </div>
      </div>

      {/* Compilation Warning */}
      {compilationError && (
        <div className="card border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-300">PDF Compilation Issue</p>
              <p className="text-xs text-amber-400/80 mt-1">
                {compilationError}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                You can copy the LaTeX code and compile it on{' '}
                <a
                  href="https://www.overleaf.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline"
                >
                  Overleaf
                </a>{' '}
                for a guaranteed result.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Refine Panel */}
      <div className="card border-indigo-500/15 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 p-0 overflow-hidden">
        <button
          onClick={() => setRefineOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-sm font-medium text-white">Refine your CV</span>
          </div>
          {refineOpen ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </button>

        {refineOpen && (
          <div className="px-5 pb-5 space-y-4 border-t border-white/5">
            <p className="text-xs text-gray-400 pt-4">
              Describe the changes you'd like applied to your CV:
            </p>

            <textarea
              value={refinementText}
              onChange={(e) => setRefinementText(e.target.value)}
              disabled={isRegenerating}
              placeholder="e.g., Move Skills before Experience, shorten the summary to 2 lines, add more Python keywords..."
              className="input-field w-full resize-none"
              style={{ minHeight: '80px' }}
            />

            <div>
              <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => appendChip(chip.text)}
                    disabled={isRegenerating}
                    className="px-3 py-1 rounded-full text-xs border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating || !refinementText.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegenerating ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                {isRegenerating ? 'Regenerating…' : 'Regenerate CV'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email Generator */}
      <EmailSection
        cvText={cvText}
        jobDescription={jobDescription}
        settings={settings}
      />

      {/* Tabs */}
      <div className={`card p-0 overflow-hidden transition ${isRegenerating ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex border-b border-white/5">
          {pdfBlob && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition ${
                activeTab === 'preview'
                  ? 'text-white border-b-2 border-indigo-500 bg-white/[0.02]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <FileText size={15} />
              PDF Preview
            </button>
          )}
          <button
            onClick={() => setActiveTab('latex')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition ${
              activeTab === 'latex'
                ? 'text-white border-b-2 border-indigo-500 bg-white/[0.02]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Code2 size={15} />
            LaTeX Code
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'preview' && pdfPreviewUrl && (
            <iframe
              src={pdfPreviewUrl}
              className="w-full h-[600px] rounded-lg bg-white"
              title="PDF Preview"
            />
          )}
          {activeTab === 'latex' && (
            <div className="relative">
              <button
                onClick={handleCopyLatex}
                className="absolute top-2 right-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition z-10"
                title="Copy LaTeX"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
              <pre className="latex-code">{latexCode}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

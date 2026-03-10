import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import StepIndicator from './components/StepIndicator.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import UploadStep from './components/UploadStep.jsx'
import ProcessingStep from './components/ProcessingStep.jsx'
import ResultStep from './components/ResultStep.jsx'
import { generateTailoredCV } from './lib/aiService.js'
import { convertLatexToPdf, createPdfPreviewUrl } from './lib/latexToPdf.js'

export default function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [processingStatus, setProcessingStatus] = useState(null)
  const [error, setError] = useState(null)

  const [settings, setSettings] = useState({})

  const [cvFile, setCvFile] = useState(null)
  const [cvText, setCvText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [extracting, setExtracting] = useState(false)

  const [latexCode, setLatexCode] = useState('')
  const [pdfBlob, setPdfBlob] = useState(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [compilationError, setCompilationError] = useState(null)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const isConfigured = Boolean(settings.apiKey)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv-tailor-settings')
      const parsed = saved ? JSON.parse(saved) : {}
      if (!parsed.apiKey) {
        setTimeout(() => setShowSettings(true), 500)
      }
    } catch {
      setTimeout(() => setShowSettings(true), 500)
    }
  }, [])

  const handleSettingsChange = useCallback((nextSettings) => {
    setSettings(nextSettings)
  }, [])

  const handleGenerate = async () => {
    if (!cvText || !jobDescription.trim() || !settings.apiKey) return

    setError(null)
    setCurrentStep(2)
    setCompilationError(null)

    try {
      setProcessingStatus('generating')
      const latex = await generateTailoredCV({
        cvText,
        jobDescription,
        apiKey: settings.apiKey,
        geminiModel: settings.geminiModel,
        templateMode: settings.templateMode,
      })

      if (!latex || !latex.includes('\\documentclass')) {
        throw new Error('AI did not return valid LaTeX code. Please try again.')
      }

      setLatexCode(latex)
      setProcessingStatus('compiling')

      try {
        const blob = await convertLatexToPdf(latex)
        const previewUrl = createPdfPreviewUrl(blob)
        setPdfBlob(blob)
        setPdfPreviewUrl(previewUrl)
      } catch (compileError) {
        console.warn('PDF compilation failed:', compileError)
        setCompilationError(compileError.message)
      }

      setProcessingStatus('done')
      setCurrentStep(3)
    } catch (generationError) {
      console.error('Generation failed:', generationError)
      setError(generationError.message)
      setCurrentStep(1)
      setProcessingStatus(null)
    }
  }

  const handleRegenerate = async (refinementText) => {
    if (!refinementText.trim() || !settings.apiKey) return

    setIsRegenerating(true)
    setError(null)
    setCompilationError(null)

    try {
      const nextLatex = await generateTailoredCV({
        cvText,
        jobDescription,
        apiKey: settings.apiKey,
        geminiModel: settings.geminiModel,
        refinementInstructions: refinementText,
        previousLatex: latexCode,
        templateMode: settings.templateMode,
      })

      if (!nextLatex || !nextLatex.includes('\\documentclass')) {
        throw new Error('AI did not return valid LaTeX code. Please try again.')
      }

      setLatexCode(nextLatex)

      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl)
        setPdfPreviewUrl(null)
        setPdfBlob(null)
      }

      try {
        const blob = await convertLatexToPdf(nextLatex)
        const previewUrl = createPdfPreviewUrl(blob)
        setPdfBlob(blob)
        setPdfPreviewUrl(previewUrl)
      } catch (compileError) {
        console.warn('PDF compilation failed:', compileError)
        setCompilationError(compileError.message)
      }
    } catch (generationError) {
      console.error('Regeneration failed:', generationError)
      setError(generationError.message)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleReset = () => {
    setCvFile(null)
    setCvText('')
    setJobDescription('')
    setLatexCode('')
    setPdfBlob(null)
    setPdfPreviewUrl(null)
    setCompilationError(null)
    setError(null)
    setCurrentStep(1)
    setProcessingStatus(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onSettingsClick={() => setShowSettings(true)}
        isConfigured={isConfigured}
      />

      <main className="flex-1 py-4">
        <StepIndicator currentStep={currentStep} />

        {error && (
          <div className="max-w-3xl mx-auto px-4 mb-6">
            <div className="card border-red-500/20 bg-red-500/5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <span className="text-red-400 text-lg">!</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-300">Something went wrong</p>
                  <p className="text-xs text-red-400/80 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-gray-500 hover:text-white text-sm"
                >
                  x
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <UploadStep
            cvFile={cvFile}
            setCvFile={setCvFile}
            cvText={cvText}
            setCvText={setCvText}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onGenerate={handleGenerate}
            isConfigured={isConfigured}
            extracting={extracting}
            setExtracting={setExtracting}
          />
        )}

        {currentStep === 2 && <ProcessingStep status={processingStatus} />}

        {currentStep === 3 && (
          <ResultStep
            latexCode={latexCode}
            pdfBlob={pdfBlob}
            pdfPreviewUrl={pdfPreviewUrl}
            compilationError={compilationError}
            onReset={handleReset}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
            cvText={cvText}
            jobDescription={jobDescription}
            settings={settings}
          />
        )}
      </main>

      <footer className="text-center py-4 border-t border-white/5">
        <p className="text-xs text-gray-600">
          CV Tailor Pro - your data stays on your device. API keys are stored locally.
        </p>
      </footer>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}

import React, { useState } from 'react'
import { Mail, Loader2, Copy, Check, RefreshCw, ExternalLink } from 'lucide-react'
import { generateApplicationEmail } from '../lib/aiService.js'

export default function EmailSection({ cvText, jobDescription, settings, getEffective, envEdgeFunctionUrl }) {
  const [email, setEmail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedBody, setCopiedBody] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateApplicationEmail({
        cvText,
        jobDescription,
        provider: settings.provider,
        apiKey: settings.apiKey,
        edgeFunctionUrl: getEffective(settings.edgeFunctionUrl, envEdgeFunctionUrl),
        geminiModel: settings.geminiModel,
      })
      setEmail(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text, setter) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  const handleCopyAll = () => {
    const fullEmail = `Subject: ${email.subject}\n\n${email.body}`
    copyToClipboard(fullEmail, setCopiedAll)
  }

  const handleOpenGmail = () => {
    const subject = encodeURIComponent(email.subject)
    const body = encodeURIComponent(email.body)
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank')
  }

  const handleOpenMailto = () => {
    const subject = encodeURIComponent(email.subject)
    const body = encodeURIComponent(email.body)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  // Not generated yet — show generate button
  if (!email && !loading && !error) {
    return (
      <div className="card border-violet-500/10 bg-gradient-to-r from-violet-500/5 to-indigo-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Mail size={20} className="text-violet-400" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-sm">
                Application Email
              </h4>
              <p className="text-xs text-gray-500">
                Generate a professional email to send with your CV
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Mail size={14} />
            Generate
          </button>
        </div>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="card border-violet-500/10">
        <div className="flex items-center justify-center gap-3 py-6">
          <Loader2 size={18} className="animate-spin text-violet-400" />
          <span className="text-sm text-gray-400">Generating professional email...</span>
        </div>
      </div>
    )
  }

  // Error
  if (error && !email) {
    return (
      <div className="card border-red-500/20 bg-red-500/5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={handleGenerate} className="btn-secondary text-sm flex items-center gap-1.5">
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show generated email
  return (
    <div className="card border-violet-500/10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-violet-400" />
          <h4 className="font-display font-semibold text-white text-sm">Application Email</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition"
            title="Regenerate"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Subject */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Subject
          </label>
          <button
            onClick={() => copyToClipboard(email.subject, setCopiedSubject)}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition"
          >
            {copiedSubject ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copiedSubject ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="bg-[#151724] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white font-medium">
          {email.subject}
        </div>
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Body
          </label>
          <button
            onClick={() => copyToClipboard(email.body, setCopiedBody)}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition"
          >
            {copiedBody ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copiedBody ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="bg-[#151724] border border-white/5 rounded-lg px-4 py-3 text-sm text-gray-300 leading-relaxed whitespace-pre-line max-h-[300px] overflow-y-auto">
          {email.body}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={handleCopyAll}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          {copiedAll ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copiedAll ? 'Copied!' : 'Copy All'}
        </button>
        <button
          onClick={handleOpenGmail}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <ExternalLink size={14} />
          Open in Gmail
        </button>
        <button
          onClick={handleOpenMailto}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Mail size={14} />
          Open in Mail App
        </button>
      </div>

      <p className="text-xs text-gray-600">
        Remember to attach your tailored CV before sending.
      </p>
    </div>
  )
}

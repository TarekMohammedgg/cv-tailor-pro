import React, { useState, useEffect } from 'react'
import { Mail, Loader2, Copy, Check, RefreshCw, ExternalLink, User, Phone, Linkedin, Github, Globe, ChevronDown, ChevronUp } from 'lucide-react'
import { generateApplicationEmail } from '../lib/aiService.js'

const CONTACT_STORAGE_KEY = 'cv-tailor-contact-info'

function loadContactInfo() {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveContactInfo(info) {
  localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(info))
}

const CONTACT_FIELDS = [
  { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+20 106 351 9131' },
  { key: 'email', label: 'Email', icon: Mail, placeholder: 'your@email.com' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'linkedin.com/in/yourname' },
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'github.com/yourname' },
  { key: 'portfolio', label: 'Portfolio', icon: Globe, placeholder: 'yourwebsite.com' },
]

export default function EmailSection({ cvText, jobDescription, settings }) {
  const [email, setEmail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedBody, setCopiedBody] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)
  const [showContactEdit, setShowContactEdit] = useState(false)

  const [contactInfo, setContactInfo] = useState(() => loadContactInfo())

  // Update contact info in localStorage when changed
  useEffect(() => {
    saveContactInfo(contactInfo)
  }, [contactInfo])

  const handleContactChange = (key, value) => {
    setContactInfo((prev) => ({ ...prev, [key]: value }))
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateApplicationEmail({
        cvText,
        jobDescription,
        apiKey: settings.apiKey,
        geminiModel: settings.geminiModel,
      })
      setEmail(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Build the signature block from contact info
  const buildSignature = () => {
    const lines = []

    const activeFields = CONTACT_FIELDS.filter((f) => contactInfo[f.key]?.trim())
    if (activeFields.length === 0) return ''

    lines.push('') // empty line before signature
    lines.push('———————————————')

    // Phone & Email on one line if both exist
    const phone = contactInfo.phone?.trim()
    const emailAddr = contactInfo.email?.trim()
    if (phone && emailAddr) {
      lines.push(`${phone}  |  ${emailAddr}`)
    } else if (phone) {
      lines.push(phone)
    } else if (emailAddr) {
      lines.push(emailAddr)
    }

    // LinkedIn
    if (contactInfo.linkedin?.trim()) {
      const val = contactInfo.linkedin.trim()
      lines.push(val.startsWith('http') ? val : `https://${val}`)
    }

    // GitHub
    if (contactInfo.github?.trim()) {
      const val = contactInfo.github.trim()
      lines.push(val.startsWith('http') ? val : `https://${val}`)
    }

    // Portfolio
    if (contactInfo.portfolio?.trim()) {
      const val = contactInfo.portfolio.trim()
      lines.push(val.startsWith('http') ? val : `https://${val}`)
    }

    return lines.join('\n')
  }

  const getFullBody = () => {
    if (!email) return ''
    const signature = buildSignature()
    return email.body + signature
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
    const fullEmail = `Subject: ${email.subject}\n\n${getFullBody()}`
    copyToClipboard(fullEmail, setCopiedAll)
  }

  const handleOpenGmail = () => {
    const subject = encodeURIComponent(email.subject)
    const body = encodeURIComponent(getFullBody())
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank')
  }

  const handleOpenMailto = () => {
    const subject = encodeURIComponent(email.subject)
    const body = encodeURIComponent(getFullBody())
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  // ─── Not generated yet ───
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

  // ─── Loading ───
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

  // ─── Error ───
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

  // ─── Show generated email ───
  const hasContactInfo = CONTACT_FIELDS.some((f) => contactInfo[f.key]?.trim())

  return (
    <div className="card border-violet-500/10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-violet-400" />
          <h4 className="font-display font-semibold text-white text-sm">Application Email</h4>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition"
          title="Regenerate"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Subject */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Subject</label>
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
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Body</label>
          <button
            onClick={() => copyToClipboard(getFullBody(), setCopiedBody)}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition"
          >
            {copiedBody ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copiedBody ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="bg-[#151724] border border-white/5 rounded-lg px-4 py-3 text-sm text-gray-300 leading-relaxed whitespace-pre-line max-h-[400px] overflow-y-auto">
          {email.body}
          {/* Signature preview */}
          {hasContactInfo && (
            <span className="text-gray-500">{buildSignature()}</span>
          )}
        </div>
      </div>

      {/* Contact Info Editor */}
      <div className="border-t border-white/5 pt-3">
        <button
          onClick={() => setShowContactEdit(!showContactEdit)}
          className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-200 transition w-full"
        >
          <User size={13} />
          <span>Contact Info & Signature</span>
          {!hasContactInfo && (
            <span className="text-amber-400 text-[10px] ml-1">(not set)</span>
          )}
          <span className="ml-auto">
            {showContactEdit ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        </button>

        {showContactEdit && (
          <div className="mt-3 space-y-2.5">
            <p className="text-xs text-gray-600">
              These appear at the bottom of your email as a signature. Saved for next time.
            </p>
            {CONTACT_FIELDS.map((field) => {
              const Icon = field.icon
              return (
                <div key={field.key} className="flex items-center gap-2">
                  <Icon size={14} className="text-gray-500 shrink-0" />
                  <input
                    type="text"
                    value={contactInfo[field.key] || ''}
                    onChange={(e) => handleContactChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="input-field text-sm py-1.5"
                  />
                </div>
              )
            })}
          </div>
        )}
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

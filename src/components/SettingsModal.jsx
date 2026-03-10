import React, { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Key, ExternalLink, LayoutTemplate } from 'lucide-react'
import { DEFAULT_TEMPLATE_MODE, TEMPLATE_MODES } from '../lib/referenceCvTemplate.js'

const STORAGE_KEY = 'cv-tailor-settings'
const VALID_MODELS = ['', 'gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro']
const VALID_TEMPLATE_MODES = [TEMPLATE_MODES.LOCKED, TEMPLATE_MODES.LEGACY_FREEFORM]

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw)
    if (parsed.geminiModel && !VALID_MODELS.includes(parsed.geminiModel)) {
      parsed.geminiModel = ''
    }
    if (parsed.templateMode && !VALID_TEMPLATE_MODES.includes(parsed.templateMode)) {
      parsed.templateMode = DEFAULT_TEMPLATE_MODE
    }
    return parsed
  } catch {
    return {}
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export default function SettingsModal({ isOpen, onClose, onSettingsChange }) {
  const [settings, setSettings] = useState(() => ({
    provider: 'gemini',
    apiKey: '',
    geminiModel: '',
    templateMode: DEFAULT_TEMPLATE_MODE,
    ...loadSettings(),
  }))
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    onSettingsChange(settings)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  const handleChange = (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
    onSettingsChange(next)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#1e2030] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="font-display font-bold text-lg text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 ring-2 ring-offset-2 ring-offset-[#1e2030] ring-indigo-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-white">Google Gemini</div>
              <div className="text-xs text-gray-500">Free tier with local browser-side generation</div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <Key size={14} className="text-indigo-400" />
              <h3 className="font-display font-semibold text-sm text-white">API Key</h3>
            </div>

            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mb-3 transition"
            >
              <ExternalLink size={12} />
              Get a Gemini API key from Google AI Studio
            </a>

            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(event) => handleChange('apiKey', event.target.value)}
                placeholder="Paste your Gemini API key here..."
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              Your API key is saved locally on this device only.
            </p>
          </section>

          <section>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Model <span className="text-gray-600">(optional)</span>
            </label>
            <select
              value={settings.geminiModel || ''}
              onChange={(event) => handleChange('geminiModel', event.target.value)}
              className="input-field text-sm"
            >
              <option value="">Auto - recommended</option>
              <option value="gemini-2.5-flash-lite">Flash Lite (fastest)</option>
              <option value="gemini-2.5-flash">Flash (balanced)</option>
              <option value="gemini-2.5-pro">Pro (best quality)</option>
            </select>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <LayoutTemplate size={14} className="text-indigo-400" />
              <h3 className="font-display font-semibold text-sm text-white">CV Template Mode</h3>
            </div>
            <select
              value={settings.templateMode || DEFAULT_TEMPLATE_MODE}
              onChange={(event) => handleChange('templateMode', event.target.value)}
              className="input-field text-sm"
            >
              <option value={TEMPLATE_MODES.LOCKED}>Reference Locked - recommended</option>
              <option value={TEMPLATE_MODES.LEGACY_FREEFORM}>Legacy Freeform</option>
            </select>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Reference Locked keeps the rebuilt master CV structure, alignment, and link placement stable.
              Legacy Freeform lets Gemini write the whole LaTeX document again.
            </p>
          </section>
        </div>

        <div className="p-5 border-t border-white/5">
          <button onClick={onClose} className="btn-primary w-full text-center">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

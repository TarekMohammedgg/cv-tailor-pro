import React, { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Brain, ExternalLink, ChevronDown, ChevronUp, Wrench } from 'lucide-react'

const AI_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Free — up to 1,000 requests/day',
    color: 'from-blue-500 to-cyan-400',
    helpUrl: 'https://aistudio.google.com/apikey',
    helpText: 'Get free API key from Google AI Studio',
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT)',
    description: 'Paid — fast and accurate',
    color: 'from-green-500 to-emerald-400',
    helpUrl: 'https://platform.openai.com/api-keys',
    helpText: 'Get API key from OpenAI Platform',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Paid — excellent quality',
    color: 'from-orange-500 to-amber-400',
    helpUrl: 'https://console.anthropic.com/',
    helpText: 'Get API key from Anthropic Console',
  },
]

const STORAGE_KEY = 'cv-tailor-settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    const validModels = ['', 'gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro']
    if (parsed.geminiModel && !validModels.includes(parsed.geminiModel)) {
      parsed.geminiModel = ''
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
    supabaseUrl: '',
    supabaseAnonKey: '',
    edgeFunctionUrl: '',
    ...loadSettings(),
  }))
  const [showApiKey, setShowApiKey] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    onSettingsChange(settings)
  }, []) // eslint-disable-line

  if (!isOpen) return null

  const handleChange = (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
    onSettingsChange(next)
  }

  const currentProvider = AI_PROVIDERS.find((p) => p.id === settings.provider)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[#1e2030] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="font-display font-bold text-lg text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Step 1: Choose Provider */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-indigo-400" />
              <h3 className="font-display font-semibold text-sm text-white">
                1. Choose AI Provider
              </h3>
            </div>
            <div className="grid gap-2">
              {AI_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleChange('provider', p.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    settings.provider === p.id
                      ? 'border-indigo-500/50 bg-indigo-500/5'
                      : 'border-white/5 hover:border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${p.color} ${
                      settings.provider === p.id
                        ? 'ring-2 ring-offset-2 ring-offset-[#1e2030] ring-indigo-500'
                        : ''
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.description}</div>
                  </div>
                  {settings.provider === p.id && p.id === 'gemini' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      Free
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: API Key */}
          <section>
            <h3 className="font-display font-semibold text-sm text-white mb-1.5">
              2. Enter Your API Key
            </h3>

            <a
              href={currentProvider?.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mb-3 transition"
            >
              <ExternalLink size={12} />
              {currentProvider?.helpText}
            </a>

            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="Paste your API key here..."
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              Your API key is saved locally on your device only. It is never sent to our servers.
            </p>
          </section>

          {/* Gemini Model */}
          {settings.provider === 'gemini' && (
            <section>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Model <span className="text-gray-600">(optional)</span>
              </label>
              <select
                value={settings.geminiModel || ''}
                onChange={(e) => handleChange('geminiModel', e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Auto — recommended</option>
                <option value="gemini-2.5-flash-lite">Flash Lite (fastest)</option>
                <option value="gemini-2.5-flash">Flash (balanced)</option>
                <option value="gemini-2.5-pro">Pro (best quality)</option>
              </select>
            </section>
          )}

          {/* Advanced (collapsed) */}
          <section className="border-t border-white/5 pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition w-full"
            >
              <Wrench size={12} />
              <span>Advanced Settings</span>
              {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-gray-600 mb-3">
                  Pre-configured by the site owner. Only change if you know what you're doing.
                </p>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Supabase URL</label>
                  <input
                    type="url"
                    value={settings.supabaseUrl}
                    onChange={(e) => handleChange('supabaseUrl', e.target.value)}
                    placeholder="Uses default if empty"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Supabase Anon Key</label>
                  <input
                    type="password"
                    value={settings.supabaseAnonKey}
                    onChange={(e) => handleChange('supabaseAnonKey', e.target.value)}
                    placeholder="Uses default if empty"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Edge Function URL</label>
                  <input
                    type="url"
                    value={settings.edgeFunctionUrl}
                    onChange={(e) => handleChange('edgeFunctionUrl', e.target.value)}
                    placeholder="Uses default if empty"
                    className="input-field text-sm"
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5">
          <button onClick={onClose} className="btn-primary w-full text-center">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

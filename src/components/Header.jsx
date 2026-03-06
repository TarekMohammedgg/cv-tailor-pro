import React from 'react'
import { Settings, Sparkles } from 'lucide-react'

export default function Header({ onSettingsClick, isConfigured }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-white tracking-tight">
            CV Tailor Pro
          </h1>
          <p className="text-xs text-gray-500 font-body">
            ATS-Optimized Resume Builder
          </p>
        </div>
      </div>

      <button
        onClick={onSettingsClick}
        className="btn-secondary flex items-center gap-2 text-sm"
      >
        <Settings size={16} />
        <span>Settings</span>
        {!isConfigured && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        )}
      </button>
    </header>
  )
}

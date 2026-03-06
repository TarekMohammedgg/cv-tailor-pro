import React from 'react'
import { Loader2 } from 'lucide-react'

const STATUS_MESSAGES = {
  extracting: 'Extracting text from your CV...',
  generating: 'AI is tailoring your CV to the job description...',
  compiling: 'Compiling LaTeX to PDF...',
  uploading: 'Saving to Supabase...',
  done: 'Complete!',
}

export default function ProcessingStep({ status }) {
  const message = STATUS_MESSAGES[status] || 'Processing...'

  return (
    <div className="max-w-md mx-auto text-center py-16 px-4">
      <div className="relative w-24 h-24 mx-auto mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-pulse-glow" />
        {/* Spinner */}
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-indigo-400 border-r-cyan-400 animate-spin-slow" />
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30" />
        </div>
      </div>

      <h3 className="font-display font-bold text-xl text-white mb-2">
        Working on it...
      </h3>
      <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
        <Loader2 size={14} className="animate-spin" />
        {message}
      </p>

      {/* Progress hints */}
      <div className="mt-8 space-y-2">
        {['extracting', 'generating', 'compiling', 'uploading'].map((step) => {
          const stepOrder = ['extracting', 'generating', 'compiling', 'uploading']
          const currentIndex = stepOrder.indexOf(status)
          const stepIndex = stepOrder.indexOf(step)
          const isDone = stepIndex < currentIndex
          const isCurrent = step === status
          const isPending = stepIndex > currentIndex

          return (
            <div
              key={step}
              className={`flex items-center gap-2 text-xs ${
                isDone
                  ? 'text-green-400'
                  : isCurrent
                  ? 'text-indigo-400'
                  : 'text-gray-600'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isDone
                    ? 'bg-green-400'
                    : isCurrent
                    ? 'bg-indigo-400 animate-pulse'
                    : 'bg-gray-700'
                }`}
              />
              {STATUS_MESSAGES[step]}
            </div>
          )
        })}
      </div>
    </div>
  )
}

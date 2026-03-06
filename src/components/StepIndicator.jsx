import React from 'react'
import { Check } from 'lucide-react'

const STEPS = [
  { label: 'Upload & Configure' },
  { label: 'Processing' },
  { label: 'Download Result' },
]

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {STEPS.map((step, i) => {
        const stepNum = i + 1
        const isActive = stepNum === currentStep
        const isCompleted = stepNum < currentStep

        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2.5">
              <div
                className={`step-dot ${
                  isCompleted ? 'completed' : isActive ? 'active' : 'inactive'
                }`}
              >
                {isCompleted ? <Check size={16} /> : stepNum}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  isActive
                    ? 'text-white'
                    : isCompleted
                    ? 'text-green-400'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-px ${
                  isCompleted ? 'bg-green-500/40' : 'bg-white/10'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

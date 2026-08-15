import React from 'react'

interface Step {
  number: number
  title: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const activeStep = steps.find((s) => s.number === currentStep)

  return (
    <div className="w-full py-1">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[13px] font-bold text-slate-900">{activeStep?.title}</p>
        <p className="text-[11px] font-medium text-slate-400">
          Étape {currentStep} / {steps.length}
        </p>
      </div>
      <div className="flex gap-1.5">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              currentStep >= step.number ? 'bg-[#22C55E]' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

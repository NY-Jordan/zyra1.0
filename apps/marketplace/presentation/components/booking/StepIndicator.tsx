import React from 'react'
import { Check } from 'lucide-react'

interface Step {
  number: number
  title: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full py-2">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
                currentStep > step.number
                  ? 'bg-emerald-500 text-white'
                  : currentStep === step.number
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                  : 'bg-[#F0EAE4] text-slate-400'
              }`}>
                {currentStep > step.number ? <Check className="h-3.5 w-3.5" /> : step.number}
              </div>
              <span className={`mt-1 text-[10px] font-semibold hidden sm:block ${
                currentStep >= step.number ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                currentStep > step.number ? 'bg-emerald-400' : 'bg-[#F0EAE4]'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

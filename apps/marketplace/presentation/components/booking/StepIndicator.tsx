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
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step */}
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {/* Circle */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-semibold
                    ${
                      currentStep > step.number
                        ? 'bg-blue-600 text-white'
                        : currentStep === step.number
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>

                {/* Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2">
                    <div
                      className={`h-full ${
                        currentStep > step.number
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-xs md:text-sm font-medium ${
                  currentStep >= step.number
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

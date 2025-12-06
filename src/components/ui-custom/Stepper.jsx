import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function Stepper({ steps, currentStep, onStepClick, className }) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;
          
          return (
            <div 
              key={step.id || index}
              className={cn(
                'relative flex flex-col items-center gap-2 z-10',
                isClickable && 'cursor-pointer'
              )}
              onClick={() => isClickable && onStepClick(index)}
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                isCompleted && 'bg-indigo-600 border-indigo-600 text-white',
                isCurrent && 'bg-white border-indigo-600 text-indigo-600',
                !isCompleted && !isCurrent && 'bg-white border-slate-200 text-slate-400'
              )}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <div className="text-center">
                <p className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-slate-900' : 'text-slate-500'
                )}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-slate-400 hidden md:block">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
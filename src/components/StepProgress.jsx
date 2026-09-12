import React from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function StepProgress({ currentStep = 1 }) {
  const steps = [
    { id: 1, title: 'Details saved to database', desc: 'Registering participant record' },
    { id: 2, title: 'Certificate created', desc: 'Generating unique ID & security seal' },
    { id: 3, title: 'Certificate ready', desc: 'Rendering high-definition print PDF' },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-soft-lg backdrop-blur-md">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-brand-purple-600 animate-spin" />
        <h3 className="text-base sm:text-lg font-bold text-slate-900 text-center">
          Generating your certificate...
        </h3>
      </div>

      <div className="space-y-3.5">
        {steps.map((step) => {
          const isDone = currentStep > step.id || currentStep === 3;
          const isCurrent = currentStep === step.id && currentStep < 3;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-50/80 border border-emerald-200/70'
                  : isCurrent
                  ? 'bg-brand-purple-50/90 border border-brand-purple-200 shadow-sm'
                  : 'bg-slate-50 border border-slate-100 opacity-60'
              }`}
            >
              <div className="flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-brand-purple-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {step.id}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className={`text-sm font-bold ${isDone ? 'text-emerald-800' : isCurrent ? 'text-brand-purple-900' : 'text-slate-500'}`}>
                  {isDone ? '✓ ' : ''}{step.title}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

interface ProofStatusProps {
  status: 'idle' | 'challenging' | 'generating' | 'verifying' | 'success' | 'error';
  errorMessage?: string;
}

export default function ProofStatus({ status, errorMessage }: ProofStatusProps) {
  if (status === 'idle') return null;

  const steps = [
    { key: 'challenging', label: '1. Requesting Server Challenge Nonce' },
    { key: 'generating', label: '2. Generating Zero-Knowledge Proof (Selective Disclosure)' },
    { key: 'verifying', label: '3. Verifying Proof Server-Side' },
    { key: 'success', label: '✓ Verified Anonymous Volunteer & Issued Session Token' },
  ];

  const getStepState = (stepKey: string) => {
    const order = ['challenging', 'generating', 'verifying', 'success'];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepKey);

    if (status === 'error') return 'error';
    if (currentIndex === stepIndex) return 'active';
    if (currentIndex > stepIndex) return 'done';
    return 'pending';
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
      <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500">
        Zero-Knowledge Verification Pipeline
      </h4>

      <div className="space-y-2">
        {steps.map((step) => {
          const state = getStepState(step.key);
          return (
            <div key={step.key} className="flex items-center text-xs font-medium">
              {state === 'done' && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs mr-2">✓</span>
              )}
              {state === 'active' && (
                <span className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mr-2"></span>
              )}
              {state === 'pending' && (
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px] mr-2">•</span>
              )}
              <span className={state === 'active' ? 'text-blue-600 font-bold' : state === 'done' ? 'text-slate-700' : 'text-slate-400'}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {status === 'error' && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
          <strong>Verification Failed:</strong> {errorMessage || 'Could not verify zero-knowledge proof.'}
        </div>
      )}
    </div>
  );
}

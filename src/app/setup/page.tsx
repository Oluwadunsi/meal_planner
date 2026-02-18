'use client'

import { useState } from 'react';
import HouseholdForm from "@/app/components/setup/HouseholdForm";
import MemberForm from "@/app/components/setup/MemberForm";

export default function SetupPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [householdId, setHouseholdId] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>

        {step === 1 && (
          <HouseholdForm
            onComplete={(id) => {
              setHouseholdId(id)
              setStep(2)
            }}
          />
        )}

        {step === 2 && householdId && (
          <MemberForm householdId={householdId} />
        )}
      </div>
    </main>
  )
}
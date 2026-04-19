'use client'

import InterestPicker from '@/features/matching/components/InterestPicker'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SettingsInner() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('childId')

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...IDが見つかりません</p>
      </div>
    )
  }

  return (
    <main>
      <InterestPicker userId={userId} />
    </main>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsInner />
    </Suspense>
  )
}

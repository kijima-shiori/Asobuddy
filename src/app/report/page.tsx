import { Suspense } from 'react'
import ReportPageClient from './ReportPageClient'

export default function ReportPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ReportPageClient />
    </Suspense>
  )
}

'use client'

import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-bold text-[#2D6F7F]">Account</h1>

      {/* 👇メールアドレス受信設定のための実装 */}
      <button
        onClick={() => router.push('/settings/email')}
        className="bg-orange-400 text-white px-6 py-3 rounded-xl"
      >
        メール受信設定
      </button>
    </div>
  )
}

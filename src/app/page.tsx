'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 relative">
      {/* 🔐 ログイン（右上） */}
      <div className="w-full max-w-[400px] flex justify-end mb-2">
        <button
          onClick={() => router.push('/signin')}
          className="bg-orange-400 text-white px-4 py-2 rounded-xl shadow"
        >
          ログイン
        </button>
      </div>

      {/* 👦👧 イラスト（角丸＋レスポンシブ） */}
      <Image
        src="/images/Asobuddy_TOP.png"
        alt="children"
        width={240}
        height={240}
        className="w-2/3 max-w-[260px] h-auto mb-3 rounded-2xl shadow-md border border-gray-100"
      />

      {/* ロゴ（レスポンシブ） */}
      <Image
        src="/images/Asobuddy_logo.png"
        alt="logo"
        width={260}
        height={230}
        className="w-2/3 max-w-[260px] h-auto mb-1"
      />

      {/* キャッチコピー */}
      <h1 className="text-base sm:text-lg font-bold text-center">
        ことばであそぼう！
        <br />
        せかいのともだちとつながろう 🌏
      </h1>

      {/* CTA */}
      <button
        onClick={() => router.push('/signup')}
        className="mt-6 bg-[#ff914d] text-white px-6 py-3 rounded-xl shadow"
      >
        ▶ はじめてあそぶ
      </button>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function EmailSettingsPage() {
  const router = useRouter()
  const [receiveEmail, setReceiveEmail] = useState(true)
  const [loading, setLoading] = useState(false) // ←①ここ！

  // ② Supabaseはここで1回だけ作る
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // ③ handleSaveはここで1回だけ
  const handleSave = async () => {
    if (loading) return
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('ログインしてください')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      receive_email: receiveEmail,
    })

    if (error) {
      console.error(error)
      alert('保存に失敗しました')
      setLoading(false)
      return
    }

    alert('保存しました！')
    router.push('/account')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 🌌 ヘッダー */}
      <div
        className="h-[280px] flex items-start text-white"
        style={{
          backgroundImage: "url('/images/background_blue-1.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <h1 className="text-left pl-6 pt-10 text-4xl font-bold">
          Email
          <br />
          Reception
        </h1>
      </div>

      {/* 📦 コンテンツ */}
      <div className="px-6 mt-10 max-w-sm ml-6">
        <div className="flex flex-col gap-6">
          {/* 受信する */}
          <div
            onClick={() => setReceiveEmail(true)}
            className={`p-6 rounded-xl shadow-lg cursor-pointer flex items-start gap-3 ${
              receiveEmail
                ? 'bg-[#ff914d] text-white border-2 border-[#ff914d]'
                : 'bg-white text-gray-700 border'
            }`}
          >
            {receiveEmail && <span>✔️</span>}
            <div>
              会話の終了後に、
              <br />
              サマリーをメールで受信する
            </div>
          </div>

          {/* 受信しない */}
          <div
            onClick={() => setReceiveEmail(false)}
            className={`p-6 rounded-xl shadow-lg cursor-pointer flex items-center gap-3 ${
              !receiveEmail
                ? 'bg-[#ff914d] text-white border-2 border-[#ff914d]'
                : 'bg-white text-gray-700 border'
            }`}
          >
            {!receiveEmail && <span>✔️</span>}
            <div>受信しない</div>
          </div>

          {/* OKボタン */}
          <button
            onClick={handleSave}
            disabled={loading} // ←④ここ！
            className="mt-4 bg-[#ff914d] text-white py-3 rounded-xl shadow disabled:opacity-50"
          >
            {loading ? '保存中...' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}

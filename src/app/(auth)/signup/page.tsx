'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSignUp = async () => {
    // ① Supabase Auth にユーザー作成
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert('サインアップに失敗しました：' + error.message)
      return
    }

    const user = data.user
    if (!user) return

    // ③ 次のページへ遷移
    router.push('/account')
  }

  return (
    <div className="relative w-full h-[45vh] px-4 pt-4">
      {/* 上部 45% 背景画像 */}

      <div className="relative w-full h-[45vh] md:h-[50vh] lg:h-[55vh] px-4 pt-4">
        <div
          className="w-full h-full rounded-xl bg-no-repeat bg-cover bg-top"
          style={{
            backgroundImage: "url('/images/login-bg.png')",
          }}
        ></div>

        {/* テキスト配置 */}
        <div className="absolute top-32 left-12 text-left">
          <h1 className="text-5xl font-bold" style={{ color: '#2D6F7F' }}>
            Create
            <br />
            Account
          </h1>
        </div>
      </div>

      {/* 入力欄 */}
      <div className="flex flex-col px-8 mt-12 space-y-6">
        <label className="text-black font-medium font-sans mt-8">
          メールアドレス
        </label>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFA451]"
        />

        <label className="text-black font-medium font-sans mt-6">
          パスワード
        </label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFA451]"
        />

        <button
          onClick={handleSignUp}
          className="w-full bg-[#FFA451] text-white py-3 rounded-lg font-semibold mt-2"
        >
          Next
        </button>
      </div>
    </div>
  )
}

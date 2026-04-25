'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import Image from 'next/image'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [childId, setChildId] = useState<string | null>(null)
  const [Nickname, setNickname] = useState<string>('Nickname')
  const [iconUrl, setIconUrl] = useState<string | null>(null)

  // ログインチェック------------------------------------
  useEffect(() => {
    async function checkSession() {
      const supabase = getSupabase()
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push('/signin')
        return
      }

      const { data: childData, error } = await supabase
        .from('children')
        .select('id, name, icon_url')
        .eq('user_id', data.session.user.id)
        .single()

      if (childData) {
        console.log('子供のid:', childData.id)
        setChildId(childData.id)
        setNickname(childData.name || 'Nickname')
        setIconUrl(childData.icon_url)
      }

      setLoading(false)
    }

    checkSession()
  }, [router])

  if (loading) return <div className="p-10 text-center">Loading...</div>
  // ------------------------------------

  // 画面表示----------------------------------------------------
  return (
    <main className="min-h-screen bg-[#FCF6FF] w-full max-w-md mx-auto flex flex-col relative overflow-hidden">
      {/* トップ画面 */}
      <div className="relative w-full h-[300px] flex-shrink-0">
        <Image
          src="/backbround_purple-1.png"
          alt="home背景"
          fill
          className="object-cover object-top w-full"
          priority
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-5">
          {/* 名前表示 */}
          <h1 className="text-5xl font-black text-[#2D6F7F] text-center mb-6">
            Hi, {Nickname}
          </h1>

          {/* アイコンとキャラクターを横に並べるコンテナ */}
          <div className="flex items-end justify-center gap-0 w-full px-4">
            {/* 男の子 */}
            <div className="relative w-32 h-32 pb-2 flex items-end justify-center translate-y-4">
              <Image
                src="/images/boy.png"
                alt="男の子"
                fill // width/heightの代わりに fill を使う
                sizes="128px"
                style={{ objectFit: 'contain', objectPosition: 'bottom' }}
              />
            </div>

            {/* childrenテーブルの icon_url から画像を表示 */}
            <div className="relative w-32 h-32">
              {iconUrl ? (
                <Image
                  src={iconUrl}
                  alt="アイコン"
                  fill
                  sizes="80px"
                  className="object-cover rounded-full border-4 border-white shadow-xl"
                  unoptimized
                  priority
                />
              ) : (
                <span className="text-6xl">👧</span>
              )}
            </div>

            {/* 女の子 */}
            <div className="relative w-[120px] h-[120px] pb-2 flex items-end justify-center translate-y-4">
              <Image
                src="/images/girl.png"
                alt="女の子"
                fill // width/heightの代わりに fill を使う
                sizes="120px"
                style={{ objectFit: 'contain', objectPosition: 'bottom' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* メインボタン------------------------------------------- */}
      {/* 🚀 メインボタン：友達を探す */}
      <div className="w-full mt-5 px-6 mb-5">
        <button
          onClick={() => childId && router.push(`/matching?childId=${childId}`)}
          className="w-full aspect-[2/1] bg-[#FFA451] text-white hover:bg-[#FFC897] font-bold rounded-2xl shadow-[0px_4px_4px_0_#D5C7DE] active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
        >
          <div className="relative w-15 h-15">
            {/* アイコンのサイズを指定 */}
            <Image
              src="/images/Rocket.svg"
              alt="友達を探す"
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
          <p className="text-[11px] text-[#FFFFFF] font-bold uppercase tracking-wider">
            Let&apos;s Find Friends
          </p>
          <span className="text-xl text-[#27214D]">ともだちを見つける</span>
        </button>
      </div>

      {/* サブボタン------------------------------------------- */}
      <div className="w-full grid grid-cols-2 gap-3 px-6">
        {/* プロフィール */}
        <button
          onClick={() => childId && router.push(`/profile?childId=${childId}`)}
          className="h-30 bg-white border-1 border-[#FFA451] hover:bg-orange-50 rounded-3xl shadow-[0px_4px_4px_0_#D5C7DE] flex flex-col items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <div className="relative w-10 h-10">
            {/* アイコンのサイズを指定 */}
            <Image
              src="/images/Baby.svg"
              alt="プロフィール"
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Profile
            </p>
            <p className="font-bold text-[#27214D]">プロフィール</p>
          </div>
        </button>

        {/* 好きなこと（趣味タグ） */}
        <button
          onClick={() => childId && router.push(`/settings?childId=${childId}`)}
          className="h-30 bg-white border-1 border-[#FFA451] hover:bg-orange-50 rounded-3xl shadow-[0px_4px_4px_0_#D5C7DE] flex flex-col items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <div className="relative w-12 h-12">
            {/* アイコンのサイズを指定 */}
            <Image
              src="/images/Heart.svg"
              alt="好きなこと"
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Hobby
            </p>
            <p className="font-bold text-[#27214D]">好きなこと</p>
          </div>
        </button>

        {/* 設定（ここにログアウトなどを入れる） */}
        <button
          onClick={() => childId && router.push(`/account?childId=${childId}`)}
          className="col-span-2 h-30 bg-white border-1 border-[#FFA451] hover:bg-orange-50 rounded-3xl shadow-[0px_4px_4px_0_#D5C7DE] flex flex-col items-center justify-center gap-2 active:scale-95 transition-all mb-6"
        >
          <div className="relative w-12 h-12">
            {/* アイコンのサイズを指定 */}
            <Image
              src="/images/MoonStars.svg"
              alt="設定"
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Setting
            </p>
            <p className="font-bold text-[#27214D]">設定</p>
          </div>
        </button>
      </div>

      {/* ログアウトボタン（とりあえず下にひっそり置いておく） */}
      <button
        onClick={async () => {
          await getSupabase().auth.signOut()
          router.push('/signin')
        }}
        className="mt-auto py-4 text-gray-500 text-sm font-medium hover:text-gray-400"
      >
        ログアウト
      </button>
    </main>
  )
}

'use client'

import { getSupabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { PartnerProfile } from '@/types'
import { ChildCategoryResponse } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sirivennela } from 'next/font/google'

// 生年月日から年齢を算出---------------------------
const calculateAge = (birthday: string) => {
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// マッチングサクセスページのロジック------------------
export default function MatchingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const sessionId = searchParams.get('session_id')

  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()

    const fetchSessionData = async () => {
      // authからログインしているユーザー情報をとってくる----------------
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('ログインエラーが発生しました')
        return
      }

      const userId = user.id
      // --------------------------------

      // sessionsテーブルからマッチングした子のidを持ってくる--------------
      const { data, error } = await supabase
        .from('sessions')
        .select('child_a_id, child_b_id')
        .eq('id', sessionId)
        .single()

      // 自分がaかbかを特定する
      if (data) {
        const partnerId =
          data.child_a_id === userId ? data.child_b_id : data.child_a_id

        // 相手の情報をchildrenテーブルから取得する
        const { data: childData, error: childError } = await supabase
          .from('children')
          .select('id, name, gender, native_language, icon_url, birthday')
          .eq('id', partnerId)
          .single()

        if (childError) {
          console.error(
            '相手のプロフィール取得に失敗しました:',
            childError.message,
            childError.details,
            childError.hint,
          )
          setLoading(false)
          return
        }

        // パートナーの情報を記録する
        if (childData) {
          const calculatedAge = calculateAge(childData.birthday)

          // パートナーの趣味タグを取得する
          const { data: catData, error: catError } = await supabase
            .from('child_categories')
            .select(
              `category_id,
              categories(id, name)`,
            )
            .eq('child_id', partnerId)

          if (catError) {
            console.error('趣味取得エラー：', catError)
          }

          const hobbies =
            // 型の強制書き換えcatDataを一旦未知のものとし、その後ChildCategoryResponseの型と宣言
            // .select('categories(name)')で結合クエリを使ったから必要
            (catData as unknown as ChildCategoryResponse[] | null)
              ?.map((item) => ({
                id: item.categories?.id || '',
                name: item.categories?.name || '',
              }))
              // 中身が空っぽ（undefined）じゃないものだけ残すフィルター
              .filter((h) => h.id !== '') || []

          console.log('取得できたデータ', childData)
          setPartner({
            ...childData,
            age: calculatedAge,
            hobbies: hobbies,
          } as PartnerProfile)
        }

        setLoading(false)
      }
    }
    fetchSessionData()
  }, [sessionId])

  // ボタンの宣言--------------------------
  const handleStartCall = () => {
    if (sessionId) {
      router.push(`/call?session_id=${sessionId}`)
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard`)
  }

  // 表示部分------------------------------
  return (
    <div
      className="min-h-screen flex flex-col items-center pt-20 px-2 relative overflow-hidden bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: "url('/background_green-2.png'" }}
    >
      <style>{`
        @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(3deg); }
        }
        .animate-float {
        animation: float 4s ease-in-out infinite;
        }
      `}</style>

      {/* URLの中身（SearchParams）を使うページは、『読み込み中（Suspense）』というバリアで囲まないといけない */}
      {/* fallblack:何もない時に表示するもの。今回はloadingの時と同じにする */}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#E2F5F5]">
            <p className="text-[#376171] font-bold">Loading...</p>
          </div>
        }
      >
        {loading ? (
          // loadingがtrueの時、待機画面を出す
          <div className="flex items-center justify-center h-screen">
            <p className="text-[#376171] font-bold">Loading...</p>
          </div>
        ) : (
          // loadingがfalseの時、マッチング相手を表示
          <div className="p-20 flex flex-col items-center justify-center h-full relative z-10 w-full">
            {/* イラスト */}
            <div className="absolute top-[0%] right-[5%] h-[120px] animate-float z-20 pointer-events-none">
              <Image
                src="/rocket.png"
                alt="Space Ship"
                width={120}
                height={120}
                className="w-full h-full object-contain"
              />
            </div>

            {/* カード部分 */}
            <div className="bg-white rounded-[15px] w-full max-w-[800px] pt-16 pb-8 px-12 shadow-[2px_4px_4px_0_#B0CBCC] relative mt-16">
              {/* アイコン */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-8 border-white bg-[#FFEFBA] shadow-md overflow-hidden flex items-center justify-center">
                {partner?.icon_url ? (
                  <Image
                    src={partner.icon_url || ''}
                    alt="icon"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">👧</span>
                )}
              </div>

              {/* 名前 */}
              <h1 className="text-[#2D6F7F] text-5xl font-black text-center mb-8">
                {partner?.name}
              </h1>

              {/* 項目 */}
              <div className="space-y-4 text-[#27214D] font-bold text-lg">
                <div className="w-fit mx-auto space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#4A7A8C] shrink-0" />
                    <p>
                      {partner?.age}才の{partner?.gender}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#4A7A8C] shrink-0" />
                    <p>母国語は{partner?.native_language}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#4A7A8C] shrink-0" />
                    <p>好きなこと</p>
                  </div>
                </div>

                {/* 趣味タグの表示 */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-center text-base">
                  {partner?.hobbies && partner.hobbies.length > 0 ? (
                    partner?.hobbies.map((hobby) => (
                      <div
                        key={hobby.id}
                        className="bg-gray-50 py-1 rounded-lg"
                      >
                        {hobby.name}
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#F8FBFC] py-1 rounded-lg col-span-2">
                      なし
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="w-full max-w-[320px] mt-10 space-y-4 flex flex-col items-center">
              <button
                onClick={handleStartCall}
                className="bg-[#FFA451] hover:bg-[#FFC897] text-white rounded-xl py-4 w-full text-xl shadow-[2px_2px_4px_0_#B0CBCC] transition-colors font-bold"
              >
                友達と会話をはじめる
              </button>
              <button
                onClick={handleCancel}
                className="bg-white w-[50%] text-[#FFA451] hover:bg-[#FFF5EB] border-1 border-[#FFA451] rounded-xl text-lgx shadow-[2px_2px_4px_0_#B0CBCC] font-bold py-4"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Suspense>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const HOBBIES = [
  { id: '1b3d6e76-449f-46e5-99b6-489b1d4d36d9', label: 'アニメ' },
  { id: '32ad008d-da22-4c8d-876e-aa915bd703b1', label: 'スポーツ' },
  { id: '1f255118-5e3f-4127-8fe6-5ca44fbf340e', label: 'りょうり' },
  { id: 'afbb5b74-d160-4286-9ddd-5506e7dd025b', label: 'おんがく' },
  { id: '402bccf4-4058-4175-a56b-39912e360175', label: 'ゲーム' },
  { id: '82e50d51-564c-45e0-90c7-bb4250b8f9f1', label: 'どうぶつ' },
  { id: '40abf83b-c00d-4166-b913-4f12de32bf69', label: 'おえかき' },
  { id: 'a26d8f84-d02c-49a1-a241-e3d937d40854', label: 'えほん' },
  { id: 'f96b5722-fb61-4f23-9201-3c7df010ca5a', label: 'こんちゅう' },
  { id: 'b6403dd0-139e-44a0-8324-317c0748c49c', label: 'うちゅう' },
]

// 窓口を作る何を受け取るか定義
interface InterestPickerProps {
  userId: string
}

// 窓口を開く
export default function InterestPicker({ userId }: InterestPickerProps) {
  const router = useRouter()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  // ページが開いたときに保存済みの趣味を撮ってきて表示
  useEffect(() => {
    const fetchSavedHobbies = async () => {
      if (!userId) return

      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('child_categories')
        .select('category_id')
        .eq('child_id', userId)

      if (error) {
        console.error('趣味の読み込みに失敗：', error.message)
        return
      }

      const savedIds = data.map((item) => item.category_id)
      setSelectedIds(savedIds)
    }
    fetchSavedHobbies()
  }, [userId])

  //---------------  趣味保存ボタンを押したときに実行される内容
  const handleSave = async () => {
    const supabase = getSupabase()

    const insertData = selectedIds.map((catId) => ({
      child_id: userId,
      category_id: catId,
    }))

    await supabase.from('child_categories').delete().eq('child_id', userId)

    const { error } = await supabase
      .from('child_categories')
      .upsert(insertData, { onConflict: 'child_id,category_id' })

    if (error) {
      alert('保存に失敗しました:' + error.message)
    } else {
      setShowSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  const toggleHobby = (id: string) => {
    // すでにボタンを押したidの趣味がカゴに入っていたら
    if (selectedIds.includes(id)) {
      // その趣味をカゴから取り出す（取り出した中身（item）が、消したい ID（id）ではないときだけ、合格！）
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white/50 flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl text-[#1F2937] mb-2 font-bold text-center">
          冒険の準備ができたよ！
        </h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F2FF] mx-auto max-w-md border-x border-gray-100 shadow-xl">
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src="/background_blue.png"
          alt="Hobby Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
          <h1 className="text-5xl font-bold">Hobby</h1>
          <p className="pt-5 font-bold">
            Choose what you like !<br />
            あなたが好きなことをおしえて！
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {HOBBIES.map((hobby) => {
            const isSelected = selectedIds.includes(hobby.id)

            return (
              <button
                key={hobby.id}
                onClick={() => toggleHobby(hobby.id)}
                className={`
                                flex flex-col items-center justify-center
                  h-30 rounded-3xl border-1 border-[#FFA451] hover:bg-orange-50 shadow-[0px_4px_4px_0_#B0B6CE] transition-all
                  ${
                    isSelected
                      ? 'bg-orange-50 border-1 border-[#FFA451]'
                      : 'bg-white border-gray-100 shadow-[0px_4px_4px_0_#B0B6CE]'
                  }
                            `}
              >
                {/* ボタンの中の文字 */}
                <span
                  className={`font-bold text-[#27214D] ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}
                >
                  {hobby.label}
                </span>
              </button>
            )
          })}
        </div>
        <div className="mt-6 mb-10">
          <button
            onClick={handleSave}
            className="w-full py-5 bg-[#FFA451] text-white font-bold hover:bg-[#FFC897] rounded-2xl shadow-[0px_4px_4px_0_#B0B6CE] active:scale-95 transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

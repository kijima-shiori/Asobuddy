'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'

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

export default function InterestPicker() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 仮のID（自分のSupabaseからコピーしたUUID）
  const userId = '17b0a1d9-4656-4939-9ee4-cd2b9e7a5884'

  //---------------  趣味保存ボタンを押したときに実行される内容
  const handleSave = async () => {
    const supabase = getSupabase()

    const insertData = selectedIds.map((catId) => ({
      child_id: userId,
      category_id: catId,
    }))

    const { error } = await supabase
      .from('child_categories')
      .upsert(insertData, { onConflict: 'child_id,category_id' })

    if (error) {
      alert('保存に失敗しました:' + error.message)
    } else {
      alert('カテゴリの登録が完了しました。')
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

  return (
    <div className="min-h-screen bg-white mx-auto max-w-md border-x border-gray-100 shadow-xl">
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src="/background_blue-1.png"
          alt="Hobby Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
          <h1 className="text-4xl font-bold">Hobby</h1>
          <p className="text-sm opacity-90">Choose what you like !</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {HOBBIES.map((hobby) => {
            const isSelected = selectedIds.includes(hobby.id)

            return (
              <button
                key={hobby.id}
                onClick={() => toggleHobby(hobby.id)}
                className={`
                                flex flex-col items-center justify-center
                  aspect-square rounded-2xl border-orange-200 transition-all
                  ${
                    isSelected
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-white border-gray-100 shadow-sm'
                  }
                            `}
              >
                {/* ボタンの中の文字 */}
                <span
                  className={`text-lg font-medium ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}
                >
                  {hobby.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-12 mb-8">
        <button
          onClick={handleSave}
          className="w-full py-4 bg-orange-400 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
        >
          OK
        </button>
      </div>
    </div>
  )
}

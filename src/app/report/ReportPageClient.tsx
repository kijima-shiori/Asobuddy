'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

type ReportData = {
  child: string
  parent: string
  safety_flag: boolean
  reason: string
  //used_words: UsedWord[]
}

export default function ReportPage() {
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<ReportData | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  useEffect(() => {
    if (!sessionId) return

    const fetchReport = async () => {
      try {
        setLoading(true)

        const res = await fetch(`/api/report?sessionId=${sessionId}`)

        if (!res.ok) {
          throw new Error('fetch failed')
        }

        const result = await res.json()

        setData(result)
      } catch (err) {
        console.error(err)
        alert('レポートの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [sessionId])

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      {/* 🌌 背景 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/background_green-2.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <motion.div
        className="absolute top-10 left-4 sm:top-16 sm:left-12 z-0"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <Image
          src="/images/kids-rocket.png"
          alt="kids rocket"
          width={230}
          height={230}
        />
      </motion.div>

      {loading && (
        <p className="text-center text-sm text-gray-500 mb-2">AIが考え中...</p>
      )}
      {/* 🧾 カード */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/90 backdrop-blur-md text-black rounded-3xl p-8 w-[90%] max-w-md shadow-lg"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-[#3c6e71] text-center mb-4">
          🌟 きょうのおはなし🌟
        </h2>
        <div className="mb-4 text-center z-20">
          {!sessionId && (
            <input
              type="file"
              accept="audio/*"
              className="mb-2 bg-white text-black p-2 rounded"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return

                try {
                  const formData = new FormData()
                  formData.append('file', file)

                  setLoading(true)

                  const res1 = await fetch('/api/transcribe', {
                    method: 'POST',
                    body: formData,
                  })

                  if (!res1.ok) throw new Error('transcribe failed')

                  const { text } = await res1.json()

                  const res2 = await fetch('/api/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transcript: text }),
                  })

                  const result = await res2.json()
                  setData(result)
                } catch (err) {
                  console.error(err)
                  alert('音声処理に失敗しました')
                } finally {
                  setLoading(false)
                }
              }}
            />
          )}

          <p className="text-xs text-gray-500">
            {sessionId
              ? '通話内容からレポートを表示しています'
              : '音声ファイルを選択するとレポートが生成されます'}
          </p>
        </div>
        <p className="text-lg text-center leading-relaxed mb-6">
          {data?.child ??
            (sessionId ? '読み込み中...' : '音声を選択してください')}
        </p>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#3c6e71] text-sm underline"
        >
          {isOpen ? 'とじる' : '保護者向けレポートを見る'}
        </button>

        {data && isOpen && (
          <div className="text-sm bg-[#f7f7f7] rounded-xl p-4">
            <p>{data.parent}</p>

            <p
              className={`mt-2 text-xs font-semibold ${
                data.safety_flag ? 'text-green-500' : 'text-red-500'
              }`}
            >
              安全判定: {data.safety_flag ? '危険あり' : '問題なし'}（
              {data.reason}）
            </p>
          </div>
        )}

        <button
          className="w-full bg-[#ff914d] text-white py-3 rounded-xl mt-4 shadow-md"
          onClick={() => router.push('/dashboard')}
        >
          HOMEへ
        </button>
      </motion.div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export default function TestPage() {
  const [childText, setChildText] = useState('')
  const [parentText, setParentText] = useState('')
  const [reason, setReason] = useState('')
  const [safetyFlag, setSafetyFlag] = useState(false)

  const handleUpload = async (file: File) => {
    try {
      console.log('① upload開始')

      const formData = new FormData()
      formData.append('file', file)

      console.log('② transcribe呼ぶ')

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      console.log('③ transcribe返ってきた')

      const data = await res.json()
      console.log('④ transcript:', data)

      const transcript = data.text

      console.log('⑤ report呼ぶ')

      const reportRes = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      })

      console.log('⑥ report返ってきた')

      const reportData = await reportRes.json()
      console.log('⑦ result:', reportData)

      setChildText(reportData.child)
      setParentText(reportData.parent)
      setReason(reportData.reason)
      setSafetyFlag(reportData.safety_flag)
    } catch (e) {
      console.error('❌エラー', e)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Whisperテスト</h1>

      <input
        type="file"
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
        onChange={(e) => {
          const files = (e.target as HTMLInputElement).files
          if (!files || files.length === 0) return
          handleUpload(files[0])
        }}
      />

      <div style={{ marginTop: 30 }}>
        <h2>子ども向け</h2>
        <p style={{ whiteSpace: 'pre-line' }}>{childText}</p>

        <h2 style={{ marginTop: 20 }}>保護者向け</h2>
        <p style={{ whiteSpace: 'pre-line' }}>{parentText}</p>

        {safetyFlag && (
          <div style={{ marginTop: 20, color: 'red' }}>
            <h3>⚠️ 注意が必要な発言</h3>
            <p>{reason}</p>
          </div>
        )}
      </div>
    </div>
  )
}

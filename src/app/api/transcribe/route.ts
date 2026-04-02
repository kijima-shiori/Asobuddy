import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

//  Supabase追加
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    // ① Storage保存（修正版）
    console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    const fileName = `${Date.now()}-${file.name}`

    // 👇 ここ追加（超重要）
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('transcripts')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
      })

    if (uploadError) {
      console.error('uploadError:', uploadError) // ←デバッグ用
      throw new Error('Storage upload failed')
    }

    //  ② URL取得
    const { data: publicUrlData } = supabase.storage
      .from('transcripts')
      .getPublicUrl(fileName)

    const transcriptUrl = publicUrlData.publicUrl

    //  ③ Whisper
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    })

    return NextResponse.json({
      text: transcription.text,
      transcriptUrl, // ★ 追加
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

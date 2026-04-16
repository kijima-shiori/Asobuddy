import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })

    //  Supabase追加
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'mp3'
    const fileName = `${crypto.randomUUID()}.${ext}`
    const arrayBuffer = await file.arrayBuffer()

    // Storageアップロード
    const { error: uploadError } = await supabase.storage
      .from('transcripts')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
      })

    if (uploadError) {
      console.error(uploadError)
      throw new Error('Storage upload failed')
    }

    // 公開URL
    const { data: publicUrlData } = supabase.storage
      .from('transcripts')
      .getPublicUrl(fileName)

    const transcriptUrl = publicUrlData.publicUrl

    // 👇ここ修正ポイント
    const transcription = await openai.audio.transcriptions.create({
      file: new File([arrayBuffer], file.name, { type: file.type }),
      model: 'whisper-1',
    })

    return NextResponse.json({
      text: transcription.text,
      transcriptUrl,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

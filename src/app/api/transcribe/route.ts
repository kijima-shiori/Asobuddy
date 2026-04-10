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
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const fileName = `${Date.now()}-${file.name}`

    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('transcripts')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
      })

    if (uploadError) {
      console.error(uploadError)
      throw new Error('Storage upload failed')
    }

    const { data: publicUrlData } = supabase.storage
      .from('transcripts')
      .getPublicUrl(fileName)

    const transcriptUrl = publicUrlData.publicUrl

    const transcription = await openai.audio.transcriptions.create({
      file,
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

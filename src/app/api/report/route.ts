import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body?.transcript) {
      return NextResponse.json(
        { error: 'transcript required' },
        { status: 400 },
      )
    }

    const transcript = body.transcript

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })

    // 🟢 要約（child + parent）
    const summaryRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `
あなたは要約専用AIです。childとparentを出力してください。
`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
    })

    const summaryContent = summaryRes.choices[0].message.content ?? ''

    const child =
      summaryContent.match(/child:\n([\s\S]*?)\n\nparent:/)?.[1]?.trim() ?? ''

    const parent = summaryContent.match(/parent:\n([\s\S]*)/)?.[1]?.trim() ?? ''

    // 🔴 安全判定
    const safetyRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `
危険な発言があれば true、なければ false。
`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
    })

    const safetyContent = safetyRes.choices[0].message.content ?? ''

    const safety_flag = safetyContent.includes('true')

    // 💾 DB保存
    await supabase.from('call_reports').insert({
      session_id: crypto.randomUUID(),
      summary: parent,
      transcript_url: null,
      safety_flag,
    })

    return NextResponse.json({
      child,
      parent,
      safety_flag,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

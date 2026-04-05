import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const { transcript }: { transcript: string } = await req.json()

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })

    // 👨‍👩‍👧 保護者向け
    const parentRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'あなたは事実のみを正確に伝える日本語ライターです。推測や誇張は禁止です。',
        },
        {
          role: 'user',
          content: `
以下の会話を保護者向けレポートとしてまとめてください。

【出力形式】
要約：
〇〇

安全判定：
〇〇

会話：
${transcript}
`,
        },
      ],
    })

    const parentText = parentRes.choices[0].message.content ?? ''

    // safety_flag 簡易判定
    const dangerWords = [
      'バカ',
      'ばか',
      'うざい',
      'きもい',
      '殺す',
      'ころす',
      '殴る',
      'なぐる',
      '死ね',
      'しね',
      '消えろ',
      'きえろ',
      'エロ',
      'えろ',
    ]

    const safety_flag = dangerWords.some((word) => parentText.includes(word))

    // DB保存
    const { error: insertError } = await supabase.from('call_reports').insert({
      session_id: crypto.randomUUID(), // ランダムなセッションID★ここはMVPなので、実際は通話ごとに一意のIDを生成して保存するべき
      summary: parentText,
      transcript_url: null,
      safety_flag,
    })

    if (insertError) {
      console.error('DB insert error:', insertError)
    }

    // 🧒 子ども向け
    const childRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '子ども向けにやさしく説明する先生です。',
        },
        {
          role: 'user',
          content: `
以下の会話を子ども向けにまとめてください。

きょうのおはなし：
〇〇

会話：
${transcript}
`,
        },
      ],
    })

    return NextResponse.json({
      child: childRes.choices[0].message.content ?? '',
      parent: parentText,
      safety_flag,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Report failed' }, { status: 500 })
  }
}

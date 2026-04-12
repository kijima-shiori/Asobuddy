import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const body = await req.json()

    if (!body?.transcript) {
      return NextResponse.json(
        { error: 'transcript required' },
        { status: 400 },
      )
    }

    const transcript: string = body.transcript

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })

    // 🟢 要約
    const summaryRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `
あなたは要約専用AIです。必ずルールを守ること。

【子ども向け】
・必ず3～4文にする
・ひらがな多め
・名前やチーム名はカタカナ
・やさしい言葉で書く
・意味を変えない
・推測禁止
・何について話したか事実のみを書く


【保護者向け】
・事実のみを書く
・推測禁止
・チーム名は省略しない

【出力形式】

child:
〇〇

parent:
〇〇
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
あなたは安全判定専用AIです。

・危険な発言があれば true
・なければ false
・危険な場合は実際の言葉をそのまま抜き出す
・抽象表現は禁止
・最も強い言葉を優先（例：死ね、消えろ）
・理由は日本語で書く

【出力形式】

safety_flag:
true or false

reason:
危険な言葉があったら使われた英語（日本語に翻訳したものをカッコ内にいれる）を全てそのまま抜き出す。なければ「特になし」
`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
    })

    const safetyContent = safetyRes.choices[0].message.content ?? ''

    const safety_flag =
      safetyContent.match(/safety_flag:\n(true|false)/)?.[1] === 'true'

    const reason = safetyContent.match(/reason:\n([\s\S]*)/)?.[1]?.trim() ?? ''

    // 💾 DB保存
    const { error } = await supabase.from('call_reports').insert({
      session_id: crypto.randomUUID(),
      summary: parent,
      transcript_url: null,
      safety_flag,
    })

    if (error) {
      console.error('Insert error:', error.message)
    }

    return NextResponse.json({
      child,
      parent,
      safety_flag,
      reason,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Report failed' }, { status: 500 })
  }
}

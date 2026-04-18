import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId || sessionId.length < 10) {
      // セッションIDの基本的なバリデーション（例: 10文字以上）
      return NextResponse.json({ error: 'invalid sessionId' }, { status: 400 }) // セッションIDがない、または短すぎる場合は400エラーを返す
    }

    const { data, error } = await supabase
      .from('call_reports')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({
      child: data.summary ?? '',
      parent: data.summary ?? '',
      safety_flag: data.safety_flag ?? false,
      reason: data.reason ?? '',
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const body = await req.json()

    if (!body?.transcript || !body?.sessionId) {
      return NextResponse.json(
        { error: 'transcript and sessionId required' },
        { status: 400 },
      )
    }

    const { transcript, sessionId } = body

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
・名前（Lily, Hana）はそのまま使用すること
・キャラクターの名前はそのまま使用すること
・別の名前に変換しないこと
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
    // 👇 ここ追加
    console.log('=== summaryContent ===')
    console.log(summaryContent)

    const child =
      summaryContent
        .match(/child\s*:\s*([\s\S]*?)\s*parent\s*:/i)?.[1]
        ?.trim() ?? ''

    const parent =
      summaryContent.match(/parent\s*:\s*([\s\S]*)/i)?.[1]?.trim() ?? ''

    // 👇 ここ追加
    console.log('=== child ===', child)
    console.log('=== parent ===', parent)

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

    const safetyMatch = safetyContent.match(/safety_flag:\s*(true|false)/i)
    const safety_flag = safetyMatch?.[1]?.toLowerCase() === 'true'

    const reason =
      safetyContent.match(/reason:\s*([\s\S]*?)$/i)?.[1]?.trim() ?? ''
    // 👇 ここ追加
    console.log('=== safetyContent ===')
    console.log(safetyContent)

    // 💾 DB保存
    const { error } = await supabase.from('call_reports').upsert(
      {
        session_id: sessionId,
        summary: parent,
        transcript_url: null,
        safety_flag,
        reason,
      },
      { onConflict: 'session_id' },
    )

    if (error) {
      console.error('Upsert error:', error.message)
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
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

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
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
      child: data.child_summary ?? '',
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
・名前を間違えない
・やさしい言葉で書く
・難しい言葉は禁止
・漢字は使わない
・意味を変えない
・推測禁止
・何について話したか事実のみを書く

【保護者向け】
・事実のみを書く
・重要な内容を優先して書く
・必ず3文にする
・推測禁止
・チーム名は省略しない

【出力形式】
必ず以下のJSON形式で出力してください。
余計な文章は一切書かないこと。

{
  "child": "〇〇",
  "parent": "〇〇"
}
`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
    })

    const summaryContent = summaryRes.choices[0].message.content ?? ''

    let child = ''
    let parent = ''

    try {
      const summaryJson = JSON.parse(summaryContent)
      child = summaryJson.child ?? ''
      parent = summaryJson.parent ?? ''
    } catch (e) {
      console.error('JSON parse error (summary):', e)
    }

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
・英語の発言の後に、日本語訳を（）で必ずつけること
・可能であれば、だれが発言したかも含めて出力する事

【重要】
・英語の発言の直後に、日本語訳を（）で必ずつけること
・翻訳を省略することは禁止

【出力形式】
必ず以下のJSON形式で出力してください。
余計な文章は一切書かないこと。

{
  "safety_flag": true,
  "reason": "..."
}

【例】
入力: "Just die"
出力:
{
  "safety_flag": true,
  "reason": "Leo: Just die（死ね）"
}

入力: "I hate you"
出力:
{
  "safety_flag": true,
  "reason": "Leo: I hate you（嫌い）"
}
`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
    })

    const safetyContent = safetyRes.choices[0].message.content ?? ''

    let safety_flag = false
    let reason = ''

    try {
      const safetyJson = JSON.parse(safetyContent)
      safety_flag = safetyJson.safety_flag ?? false
      reason = safetyJson.reason ?? ''
    } catch (e) {
      console.error('JSON parse error (safety):', e)
    }

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

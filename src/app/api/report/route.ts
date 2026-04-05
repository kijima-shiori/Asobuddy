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
・2〜3文にする（短すぎは禁止）
・何について話しているかを書く（例：サッカーの話、アニメの話、ゲームの話、本の話、料理の話）
・だれが何を言ったかを少し入れる（登場人物を記述する）
・けんかや気持ちの変化があればやさしく伝える
・ひらがな多めに使用する
・子供向けでは固有名詞もカタカナで書く
・意味が分からない文章は禁止
・推測は禁止、会話に出てきた事実や発言のみを書く
・危険な発言は正確に抜き出して書く
・発言内容の勝手な解釈は禁止
・想像で文章を作るのは禁止

【保護者向け】
・3〜4文で書く（短すぎ禁止）
・会話の流れが分かるように書く
・誰がどのチームやキャラクター、好きなものを支持しているかを書く
・どのように意見が対立したかを書く
・必ず危険となる発言（暴言など）があれば正確に書く。
・必ず危険な発言は誰の発言か抜き出して書く。
・推測は禁止、会話に出てきた発言のみを書く。
・事実のみを書く。
・発言内容の勝手な解釈は禁止。
・想像で文章を作るのは禁止。
・意味が通らない文章は禁止。

【出力形式】

child:
・子供向けでは固有名詞もカタカナで書く
・発言内容の勝手な解釈は禁止

parent:
危険な発言がある場合）
・必ず「誰が『発言内容』と言った」という形式で書く
・発言は必ず会話に存在する原文をそのまま使う（言い換え禁止）
・存在しない発言の生成は禁止
・発言内容の勝手な解釈は禁止
・この形式以外の出力は禁止
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

    // 🔴 安全判定（別AI）
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
・会話に存在していない言葉を追加するのは禁止
・理由は「英語（日本語訳を必ず入れる）という発言がありました」の形式で書く

【出力形式】

safety_flag:
true or false

reason:
「英語（日本語訳）」という発言がありました
例：「Just die（死ね）」という発言がありました
・この形式以外の出力は禁止
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
      reason,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Report failed' }, { status: 500 })
  }
}

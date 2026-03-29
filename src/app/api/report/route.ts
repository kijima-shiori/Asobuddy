import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 🧒 子ども向け
    const childRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "子ども向けにやさしく説明する先生です。",
        },
        {
          role: "user",
          content: `"あなたはルールを厳守するアシスタントです。フォーマット違反は禁止です。"
            以下の会話を子ども向けにまとめてください。これは子ども向けなので、勝手に日本向け等の情報を追加しないでください。
           【絶対ルール】
            ・出力は「きょうのおはなし：」から必ず始める
            ・「きょうのおはなし：」以外の言葉は一切使わない（例：「日本向け」などは禁止）
            ・会話に出てきた内容だけを書く（想像・推測などの勝手な追加は禁止）
            ・ポケモンなど会話に出てきた名前は必ず正確にそのまま使う
            ・1〜2文で簡潔にまとめる
            ・事実だけを書く（例：「一緒に遊んだ」は禁止。これは会話のアプリです）
            ・小学生でも分かる言葉を使う
            ・楽しい雰囲気で書く
            ・何について話したかを入れる（例：「〇〇について話したよ！」など）

            【出力形式（厳守）】
            きょうのおはなし：
            〇〇

            会話：
            ${transcript}
            `,
        },
      ],
    });

    // 👨‍👩‍👧 保護者向け
    const parentRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "あなたは事実のみを正確に伝える日本語ライターです。推測や誇張は禁止です。",
        },
        {
          role: "user",
          content: `
        "あなたはルールを厳守するアシスタントです。フォーマット違反は禁止です。"
        以下の会話を保護者向けレポートとしてまとめてください。

        【絶対ルール】
        ・会話に出てきた事実のみを書く（推測・補完は禁止）
        ・日本語は自然で丁寧な文章にする（不自然な表現は禁止）
        ・誤解を生む表現は禁止（例：「一緒に遊んでいる」など）

        【内容ルール】
        ・2〜3文で簡潔に
        ・子どもの様子が分かる
        ・安心感のある表現

        【出力形式】
        要約：
        〇〇

        安全判定：
        〇〇

        会話：
        ${transcript}
        `
        },
      ],
    });

    return NextResponse.json({
      child: childRes.choices[0].message.content,
      parent: parentRes.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Report failed" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { myCategories, opponentCategories } = await req.json()

    if (!myCategories || !opponentCategories) {
      return NextResponse.json(
        { error: "categoriesが必要です" },
        { status: 400 }
      );
    }

    const prompt = `あなたは子どもたちの会話を助けるAIキャラクターです。
以下の趣味を持つ2人の子どもが沈黙しています。
自分の趣味: ${myCategories.join("、")}
相手の趣味: ${opponentCategories.join("、")}
2人が盛り上がるような質問やお題を1つ、15文字以内で考えて。
例：「すきな きょうりゅうは なに？」
ひらがなとカタカナだけで答えて'

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
    });

    const hint = response.choices[0].message.content;

    return NextResponse.json({ hint });

  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "ヒントの生成に失敗しました" },
      { status: 500 }
    );
  }
}
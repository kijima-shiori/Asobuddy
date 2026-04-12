import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    const { myCategories, opponentCategories } = await req.json()

    if (!myCategories || !opponentCategories) {
=======
    const { categories } = await req.json();

    if (!categories || categories.length === 0) {
>>>>>>> Stashed changes
=======
    const { categories } = await req.json();

    if (!categories || categories.length === 0) {
>>>>>>> Stashed changes
      return NextResponse.json(
        { error: "categoriesが必要です" },
        { status: 400 }
      );
    }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    const prompt = `あなたは子どもたちの会話を助けるAIキャラクターです。
以下の趣味を持つ5歳〜12歳の子ども2人の子どもが沈黙しています。
自分の趣味: ${myCategories.join("、")}
相手の趣味: ${opponentCategories.join("、")}
2人が盛り上がるような質問やお題を1つ、15文字以内で考えて。
例：「すきな きょうりゅうは なに？」
ひらがなとカタカナを多めにする。優しい言葉で書く。省略は禁止。推測は禁止し、事実のみを書くこと。'
=======
    // OpenAIにプロンプトを送る
    const prompt = `子ども同士がビデオ通話中です。共通の趣味は「${categories.join("、")}」です。会話が途切れてしまいました。子どもが次に話せる話題を一言で提案してください。「〇〇について話してみよう！」という形式で、ひらがなを使って子どもにわかりやすく答えてください。`;
>>>>>>> Stashed changes
=======
    // OpenAIにプロンプトを送る
    const prompt = `子ども同士がビデオ通話中です。共通の趣味は「${categories.join("、")}」です。会話が途切れてしまいました。子どもが次に話せる話題を一言で提案してください。「〇〇について話してみよう！」という形式で、ひらがなを使って子どもにわかりやすく答えてください。`;
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
=======
}
>>>>>>> Stashed changes

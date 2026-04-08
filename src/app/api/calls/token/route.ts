import { NextRequest, NextResponse } from "next/server";
import { generateAgoraToken } from "@/lib/agora";

export async function POST(req: NextRequest) {
  try {
    const { channelName, uid } = await req.json();

    // 1. 必須チェック
    if (!channelName || uid === undefined || uid === null) {
      return NextResponse.json(
        { error: "channelNameとuidが必要です" },
        { status: 400 }
      );
    }

    // 2. 根本解決：uidを確実に数値に変換する
    // 文字列で届いても、ここで数値型にキャストします
    const numericUid = Number(uid);

    // 3. 変換後の値が有効な数値かチェック（念のため）
    if (isNaN(numericUid)) {
      return NextResponse.json(
        { error: "uidは数値である必要があります" },
        { status: 400 }
      );
    }

    // 4. 数値に変換した uid を使ってトークンを生成
    const token = generateAgoraToken(channelName, numericUid);

    return NextResponse.json({ token });

  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
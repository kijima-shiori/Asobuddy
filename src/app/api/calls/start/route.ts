import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // 1. 入口のチェック
  const { sessionId } = await req.json();
  console.log("[API Start] 受け取った sessionId:", sessionId);

  if (!sessionId) {
    console.error("[API Start] sessionIdが空です");
    return NextResponse.json({ error: "sessionIdが必要です" }, { status: 400 });
  }

  // 2. 処理直前のチェック
  const now = new Date().toISOString();
  console.log("[API Start] 書き込む時刻:", now);
// sessionsテーブルの started_at を現在の時刻で更新
  const { data, error } = await supabase
    .from("sessions")
    .update({ started_at: now })
    .eq("id", sessionId)
    .select();

  // 3. 結果のチェック
  if (error) {
    console.error("[API Start] Supabase更新エラー:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[API Start] 更新成功！データ:", data);
  return NextResponse.json({ message: "開始時刻を記録しました", data });
}
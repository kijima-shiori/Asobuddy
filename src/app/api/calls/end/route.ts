import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const { sessionId } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: "sessionIdが必要です" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: "終了時刻を記録しました", data });
}

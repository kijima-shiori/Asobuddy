'use client'

import { useState, useEffect, useRef } from "react";
import { getSupabase } from "@/lib/supabase";

const SILENCE_THRESHOLD_SECONDS = 5

export function useAiHint(sessionId: string, myChildId: string) {
  const [hint, setHint] = useState<string>("会話がとぎれたらヒントが出るよ！")
  const [loading, setLoading] = useState(false)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // カテゴリをキャッシュして毎回DBを叩かないようにする
  const categoriesRef = useRef<{ my: string[], opponent: string[] } | null>(null)

  // Supabaseから両者の趣味タグを取得（初回のみ）
  const fetchCategories = async () => {
    if (categoriesRef.current) return categoriesRef.current

    const supabase = getSupabase()

    try {
      // sessionsテーブルからchild_a_id, child_b_idを取得
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("child_a_id, child_b_id")
        .eq("id", sessionId)
        .single()

      if (sessionError || !session) {
        console.error("セッション取得エラー:", sessionError)
        return { my: [], opponent: [] }
      }

      // 相手のchildIdを特定
      const opponentChildId = session.child_a_id === myChildId
        ? session.child_b_id
        : session.child_a_id

      // 自分と相手のカテゴリを別々に取得する関数
      const fetchChildCategories = async (childId: string): Promise<string[]> => {
        // JOINを使ってcategoriesテーブルのnameを一緒に取得する
        const { data, error } = await supabase
          .from("child_categories")
          .select(`
            categories (
              name
            )
          `)
          .eq("child_id", childId);

        if (error || !data) {
          console.error("カテゴリ取得失敗:", error);
          return [];
        }

        // dataは [{ categories: { name: "ポケモン" } }, ...] という形なので、nameだけの配列に変換する
        return data.map((item: any) => item.categories?.name).filter(Boolean);
      }

      // 自分の趣味と相手の趣味を並列で取得
      const [myCategories, opponentCategories] = await Promise.all([
        fetchChildCategories(myChildId),
        fetchChildCategories(opponentChildId)
      ])

      categoriesRef.current = { my: myCategories, opponent: opponentCategories }
      return categoriesRef.current

    } catch (e) {
      console.error("カテゴリ取得エラー:", e)
      return { my: [], opponent: [] }
    }
  }

  // OpenAIでヒントを生成
const generateHint = async () => {
  console.log("generateHint呼ばれた！")
  if (loading || !sessionId) return
  setLoading(true)
  console.log("sessionId:", sessionId) 
  console.log("myChildId:", myChildId) 

    try {
      const { my, opponent } = await fetchCategories()
      const response = await fetch("/api/calls/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ myCategories: my, opponentCategories: opponent })
      })
      const data = await response.json()
      if (data.hint) setHint(data.hint)
    } catch (e) {
      console.error("ヒント生成エラー:", e)
    } finally {
      setLoading(false)
    }
  }

  // 沈黙タイマーをリセット（音声検知時に呼ぶ）
  const resetSilenceTimer = () => {
      console.log("resetSilenceTimer呼ばれた！")
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
    }
    silenceTimerRef.current = setTimeout(() => {
      generateHint()
      resetSilenceTimer()
    }, SILENCE_THRESHOLD_SECONDS * 1000)
  }

  useEffect(() => {
    if (!sessionId) return
    resetSilenceTimer()

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }, [sessionId])

  return { hint, loading, resetSilenceTimer }
}
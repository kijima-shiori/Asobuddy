'use client'

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const SILENCE_THRESHOLD_SECONDS = 10

export function useAiHint(sessionId: string, myChildId: string) {
  const [hint, setHint] = useState<string>("会話が途切れたらヒントが表示されるよ！")
  const [loading, setLoading] = useState(false)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // カテゴリをキャッシュして毎回DBを叩かないようにする
  const categoriesRef = useRef<{ my: string[], opponent: string[] } | null>(null)

  // Supabaseから両者の趣味タグを取得（初回のみ）
  const fetchCategories = async () => {
    if (categoriesRef.current) return categoriesRef.current

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

      // 自分と相手のカテゴリを別々に取得
      const fetchChildCategories = async (childId: string): Promise<string[]> => {
        const { data: childCategories } = await supabase
          .from("child_categories")
          .select("category_id")
          .eq("child_id", childId)

        if (!childCategories || childCategories.length === 0) return []

        const categoryIds = childCategories.map((c: { category_id: string }) => c.category_id)

        const { data: categories } = await supabase
          .from("categories")
          .select("name")
          .in("id", categoryIds)

        return categories?.map((c: { name: string }) => c.name) ?? []
      }

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
    if (loading || !sessionId) return
    setLoading(true)

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
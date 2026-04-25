import { getSupabase } from '@/lib/supabase'

// 生存報告（Heartbeat)を送る関数
export const sendHeartbeat = async (sessionId: string) => {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('status', 'waiting')

  if (error) {
    console.error('Heartbeat error:', error.message)
  }
}

/**
 * 新しいマッチング予約(Session)を作成する
 */
export const createSession = async (userId: string) => {
  const supabase = getSupabase()
  const fifteenSecondAgo = new Date(Date.now() - 15 * 1000).toISOString()
  const freshTime = new Date(Date.now() - 5 * 1000).toISOString()

  // --- ① 2重登録防止：今まさに有効な待機セッションがあるかチェック ---
  const { data: existingActiveSession } = await supabase
    .from('sessions')
    .select('*')
    .eq('child_a_id', userId)
    .eq('status', 'waiting')
    .gt('updated_at', freshTime) // 15秒以内に動いてる「生きてる」やつ
    .limit(1)

  if (existingActiveSession && existingActiveSession.length > 0) {
    console.log(
      '有効なセッションが既にあるので再利用します:',
      existingActiveSession[0].id,
    )
    return existingActiveSession[0]
  }

  // --- ② ゴミ掃除：自分の「本当に古い」待機データだけ消す ---
  await supabase
    .from('sessions')
    .delete()
    .eq('status', 'waiting')
    .eq('child_a_id', userId)
    .lt('updated_at', fifteenSecondAgo) // 15秒以上放置された古いものだけ

  // --- ③ 趣味の取得 ---
  const { data: myInterests } = await supabase
    .from('child_categories')
    .select('category_id')
    .eq('child_id', userId)

  const myCategoryIds = myInterests?.map((i) => i.category_id) || []

  if (myCategoryIds.length === 0) {
    console.log('好きなことが登録されてないよ')
    return { status: 'no_interests' }
  }

  // --- ④ マッチング相手を探す ---
  const { data: waitingSessions } = await supabase
    .from('sessions')
    .select('id, child_a_id')
    .eq('status', 'waiting')
    .neq('child_a_id', userId)
    .gt('updated_at', fifteenSecondAgo)
    .order('created_at', { ascending: true })

  if (waitingSessions && waitingSessions.length > 0) {
    for (const waitingRoom of waitingSessions) {
      const { data: partnerInterests } = await supabase
        .from('child_categories')
        .select('category_id')
        .eq('child_id', waitingRoom.child_a_id)
        .in('category_id', myCategoryIds)

      if (partnerInterests && partnerInterests.length > 0) {
        // マッチング成立処理
        const { data, error } = await supabase
          .from('sessions')
          .update({
            child_b_id: userId,
            status: 'matched',
            matched_at: new Date().toISOString(),
            room_id: waitingRoom.id,
          })
          .eq('id', waitingRoom.id)
          .eq('status', 'waiting')
          .select()
          .single()

        if (!error && data) return data
      }
    }
  }

  // --- ⑤ 誰もいなければ新規作成 ---
  const { data, error } = await supabase
    .from('sessions')
    .insert([
      {
        child_a_id: userId,
        status: 'waiting',
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * セッションをキャンセルする
 */
export const cancelSession = (sessionId: string) => {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sessions?id=eq.${sessionId}`

  fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'cancelled' }),
    keepalive: true,
  })
}

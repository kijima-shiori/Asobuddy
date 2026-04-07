import { supabase } from '@/lib/supabase'

// 生存報告（Heartbeat)を送る関数
export const sendHeartbeat = async (sessionId: string) => {
  const { error } = await supabase
    .from('sessions')
    .update({ created_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('status', 'waiting')

  if (error) {
    console.error('Heartbeat error:', error.message)
  }
}

// ----------------------------------
/**
 * 新しいマッチング予約(Session)を作成する
 * @param childId 作成者のID
 */
export const createSession = async (userId: string) => {
  // 15秒間Heartbeatが確認できなかった人を除外する
  const fifteenSecondAgo = new Date(Date.now() - 15 * 1000).toISOString()
  await supabase
    .from('sessions')
    .delete()
    .eq('status', 'waiting')
    .lt('created_at', fifteenSecondAgo) //lessthan 15秒前よりも古い

  // 自分の好きなことをリストで取得-----------------------------
  const { data: myInterests } = await supabase
    .from('child_categories')
    .select('category_id')
    .eq('child_id', userId)

  const myCategoryIds = myInterests?.map((i) => i.category_id) || []

  // ----------------2重登録禁止
  // 自分がwaitingですでに待っていないかを確認する（Reactの2回実行を防止）
  const { data: existingSession } = await supabase
    .from('sessions')
    .select('*')
    .eq('child_a_id', userId)
    .eq('status', 'waiting')
    .limit(1)

  // すでにwaitingに自分が登録されたら、新しくinsertせずにreturnで終わる。
  if (existingSession && existingSession.length > 0) {
    return existingSession[0]
  }

  // 好きなことが登録されてない場合----------------------
  if (myCategoryIds.length === 0) {
    console.log('好きなことが登録されてないよ')
    return { status: 'no_interests' }
  }

  // 待機中のセッションをリストアップ-----------------------------
  const { data: waitingSessions } = await supabase
    .from('sessions')
    .select('id, child_a_id')
    .eq('status', 'waiting')
    .neq('child_a_id', userId)
    .order('created_at', { ascending: true })

  // waitingリストを一つずつ順番に見る-----------------------------
  if (waitingSessions && waitingSessions.length > 0) {
    for (const waitingRoom of waitingSessions) {
      // その子の趣味を調べて、自分の趣味リスト（myCategoryIds）と合うか確認！
      const { data: partnerInterests } = await supabase
        .from('child_categories')
        .select('category_id')
        .eq('child_id', waitingRoom.child_a_id)
        .in('category_id', myCategoryIds)

      // 共通の趣味が1つでも見つかったら、マッチング成立-----------------------------
      if (partnerInterests && partnerInterests.length > 0) {
        // 合流処理
        const { data, error } = await supabase
          .from('sessions')
          .update({
            child_b_id: userId,
            status: 'matched',
          })
          .eq('id', waitingRoom.id)
          .select()
          .single()

        if (error) throw error
        return data
      }
    }
  }

  // 誰もいなければ、自分がchild_a_idになってwaitingになる
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

import { supabase } from '@/lib/supabase'
import { Session } from '@/types'

// ----------------------------------
/**
 * 新しいマッチング予約(Session)を作成する
 * @param childId 作成者のID
 */
export const createSession = async (childId: string) => {
  const { data, error } = await supabase
    .from('sessions') // 1. どのテーブルに？
    .insert([
      // 2. 何を差し込む？
      {
        child_a_id: childId, // 自分のIDをAに入れる
        status: 'waiting', // 最初は必ず「待ち」状態
      },
    ])
    .select() // 3. 書き込んだ結果を返して！
    .single() // 4. 1件だけ取得する

  if (error) throw error // エラーがあれば投げ飛ばす
  return data as Session // 成功したら「Session型」として返す
}

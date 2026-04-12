'use client'

import { getSupabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PartnerProfile } from '@/types'

export default function MatchingSuccessPage() {
  const searchParams = useSearchParams()

  const sessionId = searchParams.get('session_id')

  const [partner, setPartner] = useState<PartnerProfile | null>(null)

  useEffect(() => {
    const supabase = getSupabase()

    const fetchSessionData = async () => {
      const userId = '99999999-4656-4939-9ee4-cd2b9e7a5884'

      // sessionsテーブルからマッチングした子のidを持ってくる
      const { data, error } = await supabase
        .from('sessions')
        .select('child_a_id, child_b_id')
        .eq('id', sessionId)
        .single()

      // 自分がaかbかを特定する
      if (data) {
        const partnerId =
          data.child_a_id === userId ? data.child_b_id : data.child_a_id

        // パートナーの情報を記録する
        setPartner({
          id: partnerId,
          name: 'Nera',
          gender: 'famale',
          native_language: 'ja',
          icon_url: null,
        })
      }
    }
    fetchSessionData()
  }, [sessionId])

  return (
    <div className="p-8">
      <h1>マッチング成功！</h1>
      {partner && <p>相手の名前は: {partner.name}さんです</p>}
    </div>
  )
}

export type sessionStatus =
  | 'waiting'
  | 'matched'
  | 'active'
  | 'completed'
  | 'cancelled'

export interface Session {
  id: string
  child_a_id: string
  child_b_id: string | null
  status: sessionStatus
  room_id: string | null
  created_at: string
  updated_at: string
  matched_at: string
  started_at: string | null
  ended_at: string | null
}

export interface PartnerProfile {
  id: string
  name: string
  gender: string
  native_language: string
  icon_url: string | null
  birthday: string
  age?: number
  hobbies: { id: string; name: string }[]
}

export type sessionStatus = 'waiting' | 'matched' | 'active' | 'completed'

export interface Session {
  id: string
  child_a_id: string
  child_b_id: string | null
  status: sessionStatus
  room_id: string | null
  created_at: string
}

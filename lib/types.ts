export interface Drop {
  id: string
  content: string
  role: string | null
  years_in_sales: string | null
  industry: string | null
  been_there_count: number
  is_flagged: boolean
  user_id: string | null
  created_at: string
}

export interface Reaction {
  id: string
  drop_id: string
  type: 'been_there' | 'disagree'
  reason: string | null
  created_at: string
}

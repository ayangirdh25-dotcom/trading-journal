export type Trade = {
  id: string
  user_id: string
  market: string
  symbol: string
  direction: 'long' | 'short'
  entry_time: string | null
  exit_time: string | null
  entry_price: number | null
  exit_price: number | null
  size: number | null
  fees: number | null
  pnl: number | null
  r_multiple: number | null
  setup: string | null
  tags: string[]
  notes: string | null
  mood: number | null
  sleep_hours: number | null
  rule_breaks: string[]
  created_at: string
  updated_at: string
}

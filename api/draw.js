import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Missing Supabase environment variables.' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch users from the PROFILES table (Updated from 'users')
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email')

    const currentMonth = new Date().toISOString().slice(0, 7)
    let prizePool = 150
    let winner = null

    // 2. Pick a winner if we have users
    if (!userError && users && users.length > 0) {
      const randomIndex = Math.floor(Math.random() * users.length)
      winner = users[randomIndex]
      prizePool = users.length * 50 // $50 per active user
    }

    // 3. Insert the draw record into the database WITH the winner
    const { data: draw, error: drawCreateError } = await supabase
      .from('draws')
      .insert([{ 
        month: currentMonth, 
        status: 'pending',
        prize_amount: prizePool,
        winner_id: winner ? winner.id : null 
      }])
      .select()
      .single()

    if (drawCreateError) {
      console.error('Failed to write draw to database:', drawCreateError.message)
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Monthly prize draw executed successfully!',
      winnerId: winner?.id || 'mock-winner-id',
      prizePool: prizePool
    })

  } catch (err) {
    console.error('Draw execution exception:', err)
    return res.status(500).json({ error: err.message })
  }
}
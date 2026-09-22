import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Initialize Supabase with the Service Role key for backend admin privileges
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Vercel config: Stripe requires the raw unparsed body to verify the cryptographic signature
export const config = {
  api: { bodyParser: false },
}

// Helper to read the raw body stream
async function getRawBody(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event

  try {
    const rawBody = await getRawBody(req)
    // Verify the event actually came from Stripe
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.client_reference_id

    if (userId) {
      // Update the user's subscription status in your Supabase database
      const { error } = await supabase
        .from('users') // Ensure this matches your actual user profiles table name
        .update({ 
          subscription_status: 'active',
          stripe_customer_id: session.customer 
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating Supabase:', error)
        return res.status(500).json({ error: 'Database update failed' })
      }
      
      console.log(`Successfully activated subscription for user: ${userId}`)
    }
  }

  // Acknowledge receipt of the event
  res.status(200).json({ received: true })
}
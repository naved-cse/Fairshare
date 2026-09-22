import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { priceId, userId, charityId } = req.body

    // Dynamically grab the origin from the request headers (e.g., http://localhost:3000 or your Vercel URL)
    // Fallback to VITE_URL or a default production domain if headers are missing
    const origin = req.headers.origin || process.env.VITE_URL || 'https://fairshare.vercel.app'

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Send them back to the exact current origin's dashboard on success
      success_url: `${origin}/dashboard?payment=success`,
      // Send them back to the exact current origin's subscribe page on cancel
      cancel_url: `${origin}/subscribe`,
      // Pass the Supabase User ID and selected Charity ID to Stripe metadata/reference
      client_reference_id: userId,
      metadata: {
        charityId: charityId || null,
      },
    })

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe Checkout Error:', error)
    res.status(500).json({ error: error.message })
  }
}
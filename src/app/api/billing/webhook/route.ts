<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const data = event.data.object as Stripe.Checkout.Session

      const customerId = data.customer as string
      const subscriptionId = data.subscription as string

      await supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: subscriptionId,
          status: 'active',
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.updated': {
      const data = event.data.object as Stripe.Subscription

      const customerId = data.customer as string
      const status = data.status

      await supabase
        .from('subscriptions')
        .update({ status })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.deleted': {
      const data = event.data.object as Stripe.Subscription

      const customerId = data.customer as string

      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_customer_id', customerId)

      break
    }
  }

  return NextResponse.json({ received: true })
}


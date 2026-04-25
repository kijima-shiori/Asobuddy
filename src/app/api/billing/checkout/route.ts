import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST() {
  console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY)

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    // ★ Next.js 15 では cookies() は Promise
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set(name, value, options)
          },
          remove(name, options) {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          },
        },
      },
    )

    // ★ ユーザー取得
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('❌ No user found → 401')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // ★ 既存 subscription の確認
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let customerId = sub?.stripe_customer_id

    // ★ Stripe customer がなければ作成
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
      })
      customerId = customer.id

      await supabase.from('subscriptions').insert({
        user_id: user.id,
        stripe_customer_id: customerId,
        status: 'incomplete',
      })
    }

    // ★ Checkout Session 作成
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}

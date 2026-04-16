'use client'

import { useEffect, useState } from 'react'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from './CheckoutForm'
import { useRouter } from 'next/navigation'

export default function BillingPage() {
  const router = useRouter()
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null)

  useEffect(() => {
    const init = async () => {
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      )
      setStripePromise(stripe)
    }
    init()
  }, [])

  if (!stripePromise) return null // ローディング中

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 上部画像 */}
      <div className="relative w-full h-[45vh] px-4 pt-4">
        <div
          className="w-full h-full rounded-xl bg-cover bg-top"
          style={{ backgroundImage: "url('/images/login-bg.png')" }}
        ></div>

        {/* ★ Go back ボタン（左寄り・縦中央・丸み強め） */}
        <button
          onClick={() => router.push('/account')}
          className="absolute left-6 top-1/2 -translate-y-1/2 
                     bg-white text-[#27214D] px-4 py-2 
                     rounded-full font-semibold shadow"
        >
          ＜ Go back
        </button>

        {/* ★ My Basket を中央に配置 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold text-[#2D6F7F]">My Basket</h1>
          <p className="text-lg mt-2 text-[#333]">プランを選択してください</p>
        </div>
      </div>

      {/* Stripe Elements */}
      <div className="px-8 mt-8">
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  )
}

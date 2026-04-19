'use client'

import { CardElement } from '@stripe/react-stripe-js'
import { useState } from 'react'

export default function CheckoutForm() {
  const [loading, setLoading] = useState(false)
  const [planSelected, setPlanSelected] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      credentials: 'include',
    })
    const data = await res.json()

    console.log('Checkout API response:', data)

    setLoading(false)

    // Stripe Checkout にリダイレクト
    window.location.href = data.url
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ★ プラン選択（左側丸チェック） */}
      <div className="mb-4">
        <p className="text-[#333] text-lg font-semibold mb-2">プランを選択</p>

        <button
          type="button"
          onClick={() => setPlanSelected(!planSelected)}
          className={`w-full flex items-center gap-4 py-3 px-4 rounded-lg border-2 
            ${planSelected ? 'border-[#FFA451] bg-[#FFF5EC]' : 'border-gray-300 bg-white'}`}
        >
          {/* 左側の丸チェック */}
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${planSelected ? 'border-[#FFA451] bg-[#FFA451]' : 'border-gray-400 bg-white'}`}
          >
            {planSelected && (
              <div className="w-3 h-3 bg-white rounded-full"></div>
            )}
          </div>

          <span className="text-lg font-medium text-[#333]">
            30日プラン（90日）
          </span>
        </button>
      </div>

      {/* クレジットカード情報 */}
      <label className="text-[#333] text-lg font-medium font-sans">
        クレジットカード情報
      </label>

      <div className="border border-gray-300 rounded-lg p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#333',
                fontFamily: 'var(--font-noto)',
              },
            },
          }}
        />
      </div>

      {/* 支払いボタン */}
      <button
        type="submit"
        disabled={loading || !planSelected}
        className={`w-full py-3 rounded-lg font-semibold 
          ${loading || !planSelected ? 'bg-gray-300 text-white' : 'bg-[#FFA451] text-white'}`}
      >
        {loading ? '処理中...' : '支払う'}
      </button>
    </form>
  )
}

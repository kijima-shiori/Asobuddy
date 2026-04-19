'use client'

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

    // Stripe Checkout にリダイレクト
    window.location.href = data.url
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* プラン選択 */}
      <div className="mb-4">
        <p className="text-[#333] text-lg font-semibold mb-2">プランを選択</p>

        <button
          type="button"
          onClick={() => setPlanSelected(!planSelected)}
          className={`w-full flex items-center gap-4 py-3 px-4 rounded-lg border-2 
            ${planSelected ? 'border-[#FFA451] bg-[#FFF5EC]' : 'border-gray-300 bg-white'}`}
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${planSelected ? 'border-[#FFA451] bg-[#FFA451]' : 'border-gray-400 bg-white'}`}
          >
            {planSelected && (
              <div className="w-3 h-3 bg-white rounded-full"></div>
            )}
          </div>

          <span className="text-lg font-medium text-[#333]">
            30日プラン（990円）
          </span>
        </button>
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

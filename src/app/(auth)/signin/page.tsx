"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 上部 45% 背景画像 */}
      <div className="relative w-full h-[45vh]">
        <Image
          src="/images/login-bg.png"
          alt="Login Background"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl font-bold drop-shadow-md">Login</h1>
          <p className="text-sm mt-2 drop-shadow-md">Good to see you back!</p>
        </div>
      </div>

      {/* 入力欄 */}
      <div className="flex flex-col px-8 mt-6 space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFA451]"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFA451]"
        />

        {/* Next ボタン */}
        <button
          className="w-full bg-[#FFA451] text-white py-3 rounded-lg font-semibold mt-2"
        >
          Next
        </button>

        {/* 黒い横線 */}
        <div className="w-full border-t border-black my-4"></div>

        {/* Create Account ボタン → サインアップへ遷移 */}
        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="w-full bg-white border border-[#FFA451] text-[#FFA451] py-3 rounded-lg font-semibold"
>
  Create Account
</button>

      </div>
    </div>
  );
}

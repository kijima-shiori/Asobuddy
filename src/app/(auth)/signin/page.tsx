"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function SignInPage() {
  const router = useRouter();

  // Supabase クライアント
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

   const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

     if (error) {
      alert("ログインに失敗しました：" + error.message);
      return;
    }

       router.push("/account");
  };

 return (
    <div className="relative w-full h-[45vh] px-4 pt-4">

      {/* 上部 45% 背景画像 */}
     
     <div className="relative w-full h-[45vh] md:h-[50vh] lg:h-[55vh] px-4 pt-4">

     <div
      className="w-full h-full rounded-xl bg-no-repeat bg-cover bg-top"
           style={{
             backgroundImage: "url('/images/login-bg.png')",
    }}
       ></div>
        

        {/* テキスト配置 */}
        <div className="absolute top-35 left-12 text-left">
          <h1 className="text-5xl font-bold" style={{ color: "#2D6F7F" }}>
            Login
          </h1>

          <p className="text-lg mt-8 font-medium" style={{ color: "#333333" }}>
            Good to see you back!
          </p>
        </div>
      </div>

      {/* 入力欄 */}
      <div className="flex flex-col px-8 mt-6 space-y-4">
          <label className="text-black font-medium font-sans">メールアドレス</label>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFA451]"
        />
        
          <label className="text-black font-medium font-sansmt-2">パスワード</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFA451]"
        />
        {/* 🔥 ログインボタン */}
        <button
          onClick={handleLogin}
          className="w-full bg-[#FFA451] text-white py-3 rounded-lg font-semibold mt-2"
        >
          Next
        </button>

        <div className="w-full border-t border-black my-4"></div>

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

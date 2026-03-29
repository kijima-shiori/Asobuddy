"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
            Create<br />Account
          </h1>
        </div>
      </div>

      {/* 入力欄 */}
      <div className="flex flex-col px-8 mt-6 space-y-4">

          <label className="text-black font-medium font-sans">名前</label>
        <input
          type="name"
          placeholder="Name"
          value={email}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFA451]"
        />
        
      
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

        <button className="w-full bg-[#FFA451] text-white py-3 rounded-lg font-semibold mt-2">
          Next
        </button>

  

    
      </div>
      </div>
  );
  
}



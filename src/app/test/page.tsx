"use client";

import { useState } from "react";

export default function TestPage() {
  const [childText, setChildText] = useState("");
  const [parentText, setParentText] = useState("");

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Whisper
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const transcript = data.text;

      console.log("Transcript:", transcript);

      // report
      const reportRes = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const reportData = await reportRes.json();

      console.log("結果👇", reportData);

      // UIに反映
      setChildText(reportData.child);
      setParentText(reportData.parent);

    } catch (e) {
      console.error("❌エラー", e);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Whisperテスト</h1>

      <input
        type="file"
        onClick={(e) => {
          (e.target as HTMLInputElement).value = "";
        }}
        onChange={(e) => {
          const files = (e.target as HTMLInputElement).files;

          if (!files || files.length === 0) return;

          handleUpload(files[0]);
        }}
      />

      {/* 👇 UI表示 */}
      <div style={{ marginTop: 30 }}>
        <h2>子ども向け</h2>
        <p style={{ whiteSpace: "pre-line" }}>
          {childText}
        </p>

        <h2 style={{ marginTop: 20 }}>保護者向け</h2>
        <p style={{ whiteSpace: "pre-line" }}>
          {parentText}
        </p>
      </div>
    </div>
  );
}
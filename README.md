# Kids Language Exchange App

子ども向けオンライン言語交換アプリ

---

## 技術スタック

- **Frontend / Backend**: Next.js 16 (App Router)
- **言語**: TypeScript
- **DB**: Supabase (PostgreSQL)
- **通話**: Agora RTC
- **決済**: Stripe
- **AI**: OpenAI (Whisper / GPT)
- **スタイル**: Tailwind CSS

---

## 開発チーム

| 担当 | 機能               | 担当者   |
| ---- | ------------------ | -------- |
| A    | 通話機能・AIヒント | りなりん |
| B    | マッチング機能     | あっこ   |
| C    | AI・レポート機能   | しお     |
| D    | 保護者・認証・決済 | かな     |

---

## ディレクトリ構成

```
src/
├── app/                        # 画面とAPIルート
│   ├── (auth)/
│   │   ├── signin/page.tsx     # ログイン画面
│   │   └── signup/page.tsx     # 新規登録画面
│   ├── dashboard/page.tsx      # ダッシュボード
│   ├── matching/page.tsx       # マッチング画面
│   ├── call/page.tsx           # 通話画面
│   ├── report/page.tsx         # レポート画面
│   └── api/
│       ├── auth/verify/route.ts
│       ├── billing/
│       │   ├── webhook/route.ts
│       │   └── checkout/route.ts
│       ├── matching/enter/route.ts
│       ├── calls/
│       │   ├── token/route.ts  # Agoraトークン発行
│       │   ├── start/route.ts  # 通話開始
│       │   ├── end/route.ts    # 通話終了
│       │   └── hint/route.ts   # AIヒント取得
│       └── report/route.ts
│
├── features/                   # 機能ごとのまとまり
│   ├── auth/                   # D担当：認証
│   │   └── components/
│   ├── matching/               # B担当：マッチング
│   │   ├── components/
│   │   │   ├── Vessel.tsx
│   │   │   ├── MatchCard.tsx
│   │   │   └── InterestPicker.tsx
│   │   ├── hooks/
│   │   │   ├── useHeartbeat.ts
│   │   │   └── useMatchRealtime.ts
│   │   └── services/
│   │       └── matchService.ts
│   ├── call/                   # A担当：通話
│   │   ├── components/
│   │   │   ├── VideoGrid.tsx
│   │   │   ├── CallTimer.tsx
│   │   │   ├── AiHintPanel.tsx
│   │   │   ├── CallControls.tsx
│   │   │   └── CallEndScreen.tsx
│   │   ├── hooks/
│   │   │   ├── useAgoraCall.ts
│   │   │   ├── useCallTimer.ts
│   │   │   └── useAiHint.ts
│   │   └── services/
│   │       └── callService.ts
│   └── report/                 # C担当：レポート
│       ├── components/
│       │   ├── SummaryCard.tsx
│       │   ├── SafetyBadge.tsx
│       │   └── ReportHeader.tsx
│       ├── hooks/
│       │   └── useReport.ts
│       └── services/
│           ├── generateReport.ts
│           ├── transcribeAudio.ts
│           ├── generateSummary.ts
│           └── evaluateSafety.ts
│
├── lib/                        # チーム共通ファイル
│   ├── supabase.ts
│   ├── stripe.ts
│   ├── agora.ts
│   └── openai.ts
│
├── types/                      # チーム共通の型定義
│   └── index.ts
│
└── supabase/
    └── sql/                    # テーブル定義SQL（Supabaseで実行）
        └── create_sessions.sql     # B担当

```

---

## 環境変数

`.env.local` をルートに作成して以下を設定してください。

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Agora
AGORA_APP_ID=
AGORA_APP_CERTIFICATE=

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## セットアップ手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/ms-engineer-bc25-11/TeamA_Section9.git
cd TeamA_Section9

# 2. パッケージをインストール
npm install

# 3. 環境変数を設定
cp .env.local.example .env.local
# .env.localに各自のキーを入力

# 4. 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

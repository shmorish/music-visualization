# 🎵 Music Visualizer

YouTube音声波形ビジュアライザー - React TypeScriptで構築されたYouTubeから音声を取得して波形をリアルタイム表示するWebアプリケーション。Material Design 3を採用し、著作権に配慮したモダンな音楽可視化アプリ。

## ✨ 特徴

- 🎬 **YouTubeプレイリスト対応** - 複数の動画を管理・選択
- 📊 **リアルタイム音声可視化** - 動的な球体アニメーションと波形表示
- ⏯️ **再生コントロール** - プログレスバー付き音声制御
- 🎨 **Material Design 3** - モダンなUI/UXデザイン
- 🌙 **ダークモード対応** - テーマ切り替え機能
- 📱 **レスポンシブデザイン** - モバイル・タブレット・デスクトップ対応

## 🚀 デプロイ

### GitHub Pages
[![Deploy to GitHub Pages](https://github.com/shmorish/music-visualization/actions/workflows/deploy-simple.yml/badge.svg)](https://github.com/shmorish/music-visualization/actions/workflows/deploy-simple.yml)

**Live Demo:** https://shmorish.github.io/music-visualization/

> 📖 **初回セットアップ**: [GitHub Pages セットアップガイド](./GITHUB_PAGES_SETUP.md) を参照してください

### その他のプラットフォーム

#### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shmorish/music-visualization)

#### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shmorish/music-visualization)

## 🛠️ 開発

### 前提条件
- Node.js 16.0.0以上
- npm または yarn

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/shmorish/music-visualization.git
cd music-visualization

# 依存関係をインストール
npm install --legacy-peer-deps

# 開発サーバーを起動
npm run dev
```

### 利用可能なスクリプト

```bash
# 開発
npm run dev              # 開発サーバー起動
npm run preview          # ビルド結果をプレビュー

# ビルド
npm run build            # 本番ビルド
npm run build:prod       # 環境変数付き本番ビルド
npm run build:with-types # 型チェック付きビルド

# コード品質
npm run lint             # ESLint実行
npm run lint:fix         # ESLint自動修正
npm run type-check       # TypeScript型チェック
npm run test:lint        # Lint + 型チェック

# CI/CD
npm run ci               # CIパイプライン実行
npm run deploy           # GitHub Pagesにデプロイ
```

## 🏗️ 技術スタック

### フロントエンド
- **React 18** + **TypeScript** - モダンなReact開発
- **Vite** - 高速ビルドツール
- **Material-UI (MUI) v5** - Material Design 3コンポーネント
- **Emotion** - CSS-in-JS スタイリング

### 音声処理
- **Web Audio API** - リアルタイム音声解析
- **YouTube IFrame Player API** - YouTube動画制御

### 可視化
- **HTML5 Canvas API** - 波形描画
- **React Three Fiber** - 3D可視化 (オプション)
- **Three.js** - 3Dグラフィックス

### 開発・デプロイ
- **ESLint** + **TypeScript ESLint** - コード品質管理
- **GitHub Actions** - CI/CDパイプライン
- **GitHub Pages** / **Netlify** / **Vercel** - 自動デプロイ

## 📁 プロジェクト構造

```
music-visualization/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── AudioProgressBar.tsx    # 再生プログレスバー
│   │   ├── YouTubePlaylist.tsx     # プレイリスト管理
│   │   ├── LeftPanel.tsx           # 可視化表示パネル
│   │   ├── RightPanel.tsx          # コントロールパネル
│   │   └── ...
│   ├── hooks/               # カスタムフック
│   │   ├── useYouTubePlayer.ts     # YouTube Player制御
│   │   ├── useAudioContext.ts      # 音声処理
│   │   └── useVisualization.ts     # 可視化管理
│   ├── types/               # TypeScript型定義
│   └── utils/               # ユーティリティ関数
├── .github/workflows/       # GitHub Actions
│   ├── ci.yml              # 継続的インテグレーション
│   └── deploy.yml          # 継続的デプロイメント
└── public/                  # 静的ファイル
```

## 🔧 設定ファイル

- **vite.config.ts** - Viteビルド設定
- **tsconfig.json** - TypeScript設定
- **.eslintrc.cjs** - ESLint設定
- **netlify.toml** - Netlifyデプロイ設定
- **vercel.json** - Vercelデプロイ設定

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🤝 コントリビューション

プルリクエストや Issue の報告を歓迎します！

1. フォークして feature ブランチを作成
2. 変更をコミット
3. プルリクエストを作成

## 📞 サポート

問題や質問がありましたら、[Issues](https://github.com/shmorish/music-visualization/issues) でお知らせください。
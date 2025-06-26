# 🚀 デプロイメントガイド

このドキュメントでは、Music Visualizerアプリケーションを様々なプラットフォームにデプロイする方法を説明します。

## 📋 目次

- [GitHub Pages](#github-pages)
- [Netlify](#netlify)
- [Vercel](#vercel)
- [その他のプラットフォーム](#その他のプラットフォーム)

## 🔧 GitHub Pages

### 自動デプロイ設定

1. **GitHub Pages を有効化**
   - GitHubリポジトリの Settings > Pages にアクセス
   - Source を "GitHub Actions" に設定

2. **デプロイワークフローの実行**
   ```bash
   git push origin main
   ```
   - mainブランチへのプッシュで自動デプロイが開始されます
   - Actions タブでデプロイ状況を確認できます

3. **アクセス URL**
   - `https://shmorish.github.io/music-visualization/`

### 手動デプロイ

```bash
# 本番ビルド
npm run build:prod

# GitHub Pagesにデプロイ
npm run deploy
```

## 🌐 Netlify

### 自動デプロイ (推奨)

1. **Netlifyアカウントでリポジトリを接続**
   - [Netlify Dashboard](https://app.netlify.com/) にアクセス
   - "New site from Git" を選択
   - GitHubリポジトリを選択

2. **ビルド設定**
   - Build command: `npm run build:prod`
   - Publish directory: `dist`
   - Node version: `20`

3. **環境変数設定**
   ```
   NODE_VERSION=20
   NPM_FLAGS=--legacy-peer-deps
   ```

### ワンクリックデプロイ

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shmorish/music-visualization)

## ⚡ Vercel

### 自動デプロイ (推奨)

1. **Vercelアカウントでリポジトリを接続**
   - [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
   - "New Project" を選択
   - GitHubリポジトリをインポート

2. **設定は自動検出**
   - `vercel.json` の設定が自動適用されます
   - Framework: Vite
   - Build Command: `npm run build:prod`
   - Output Directory: `dist`

### ワンクリックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shmorish/music-visualization)

## 🔧 その他のプラットフォーム

### Firebase Hosting

```bash
# Firebase CLIインストール
npm install -g firebase-tools

# プロジェクト初期化
firebase init hosting

# ビルド
npm run build:prod

# デプロイ
firebase deploy
```

### AWS S3 + CloudFront

```bash
# AWS CLIで設定後
npm run build:prod
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🐛 トラブルシューティング

### よくある問題

1. **ビルドエラー**
   ```bash
   # 依存関係のクリーンインストール
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

2. **パスの問題**
   - `vite.config.ts` の `base` 設定を確認
   - GitHub Pages: `/music-visualization/`
   - その他: `/`

3. **CORS エラー**
   - YouTube APIのオリジン設定を確認
   - HTTPSでのアクセスが必要

4. **メモリ不足**
   ```bash
   # Node.jsメモリ制限を増加
   NODE_OPTIONS="--max-old-space-size=4096" npm run build:prod
   ```

## 📊 パフォーマンス最適化

### ビルド最適化

1. **チャンク分割**
   - vendor (React, React DOM)
   - mui (Material-UI関連)
   - three (Three.js関連)

2. **キャッシュ設定**
   - 静的アセット: 1年間キャッシュ
   - HTMLファイル: キャッシュなし

3. **圧縮**
   - Gzip圧縮有効
   - Brotli圧縮推奨

### モニタリング

- **Lighthouse** でパフォーマンス測定
- **Web Vitals** の監視
- **Bundle Analyzer** でサイズ分析

## 🔐 セキュリティ

### HTTPS必須
- 音声キャプチャには HTTPS が必要
- 本番環境では必ずHTTPSを使用

### CSP設定例

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.youtube.com;
  frame-src https://www.youtube.com;
  connect-src 'self' https://www.youtube.com;
  media-src 'self' blob:;
">
```

## 📞 サポート

デプロイメントに関する問題は、[Issues](https://github.com/shmorish/music-visualization/issues) でお知らせください。
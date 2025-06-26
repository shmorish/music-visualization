# 🔥 Firebase Hosting 完全無料デプロイガイド

Firebase HostingでMusic Visualizerを完全無料でデプロイする詳細手順です。

## 💰 無料プランの魅力

### ✅ 無料で利用できる内容
- **ストレージ**: 10GB (十分すぎる容量)
- **転送量**: 月10GB (個人プロジェクトには十分)
- **カスタムドメイン**: 無制限
- **SSL証明書**: 自動発行・更新
- **CDN**: Googleの世界規模ネットワーク
- **複数サイト**: 無制限

### 📊 このプロジェクトのサイズ
- ビルド後: 約1.3MB
- Gzip圧縮後: 約380KB
- 月間1000アクセスでも転送量は余裕

## 🚀 デプロイ手順

### 方法1: Firebase Console (最も簡単)

#### ステップ1: Firebase プロジェクト作成

1. **Firebase Console にアクセス**
   ```
   https://console.firebase.google.com
   ```

2. **新しいプロジェクトを追加**
   - "プロジェクトを追加" をクリック
   - プロジェクト名: `music-visualizer` (お好みで)
   - 国/地域: 日本
   - Google Analytics: "今回は設定しない" を選択
   - "プロジェクトを作成" をクリック

#### ステップ2: Hosting を有効化

1. **Hosting サービスを開く**
   - 左サイドメニューの "Hosting" をクリック
   - "始める" ボタンをクリック

2. **Firebase CLI のインストール手順が表示**
   - 手順を読んで "次へ" をクリック
   - "コンソールに進む" をクリック

#### ステップ3: 手動ファイルアップロード

1. **ローカルでビルド実行**
   ```bash
   npm run build:prod
   ```

2. **ファイルをアップロード**
   - Hosting ページで "その他のオプション" をクリック
   - "ファイルを手動でアップロード" を選択
   - `dist` フォルダを開いて、中身のファイルをすべて選択
   - ブラウザにドラッグ&ドロップ
   - "デプロイ" をクリック

3. **デプロイ完了**
   - URL が表示されます: `https://PROJECT_ID.web.app`
   - または `https://PROJECT_ID.firebaseapp.com`

---

### 方法2: Firebase CLI (推奨・自動化)

#### ステップ1: CLI インストール

```bash
# Firebase CLI をグローバルインストール
npm install -g firebase-tools

# バージョン確認
firebase --version
```

#### ステップ2: Firebase ログイン

```bash
# ブラウザでGoogleアカウントにログイン
firebase login

# ログイン状況確認
firebase projects:list
```

#### ステップ3: プロジェクト初期化

```bash
# プロジェクトディレクトリで実行
firebase init hosting

# 設定選択:
# ? Please select an option: Use an existing project
# ? Select a default Firebase project: music-visualizer (選択)
# ? What do you want to use as your public directory? dist
# ? Configure as a single-page app (rewrite all urls to /index.html)? Yes
# ? Set up automatic builds and deploys with GitHub? No
# ? File dist/index.html already exists. Overwrite? No
```

#### ステップ4: デプロイ実行

```bash
# ビルドとデプロイを一括実行
npm run deploy:firebase

# または個別に実行
npm run build:prod
firebase deploy
```

#### ステップ5: デプロイ確認

```bash
# デプロイ成功時の出力例:
# ✔  Deploy complete!
# 
# Project Console: https://console.firebase.google.com/project/music-visualizer/overview
# Hosting URL: https://music-visualizer.web.app
```

---

## 🔄 自動デプロイ設定 (GitHub Actions)

### GitHub Actions ワークフロー

```yaml
# .github/workflows/deploy-firebase.yml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'

    - name: Install dependencies
      run: npm ci --legacy-peer-deps

    - name: Build application
      run: npm run build:prod

    - name: Deploy to Firebase
      uses: FirebaseExtended/action-firebase-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: music-visualizer
```

### Firebase Service Account 設定

1. **Firebase Console で Service Account 作成**
   - プロジェクト設定 → サービス アカウント
   - "新しい秘密鍵の生成" をクリック
   - JSONファイルをダウンロード

2. **GitHub Secrets に追加**
   - リポジトリ設定 → Secrets and variables → Actions
   - `FIREBASE_SERVICE_ACCOUNT` という名前でJSONの内容を追加

---

## 🛠️ 設定ファイル詳細

### firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control", 
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### 設定の説明

- **public**: ビルドファイルのディレクトリ
- **rewrites**: SPAルーティング対応
- **headers**: キャッシュ最適化設定

---

## 🔧 高度な設定

### カスタムドメイン設定

1. **Firebase Console でドメイン追加**
   - Hosting → ドメインを追加
   - ドメイン名を入力

2. **DNS設定**
   - Aレコード: Firebase提供のIPアドレス
   - または CNAMEレコード: Firebase提供のホスト名

### プレビューチャンネル

```bash
# プレビューデプロイ
firebase hosting:channel:deploy preview

# 期限付きプレビュー (7日間)
firebase hosting:channel:deploy preview --expires 7d
```

### 複数環境の管理

```bash
# 開発環境用プロジェクト
firebase use --add  # dev-music-visualizer

# 本番環境用プロジェクト  
firebase use --add  # music-visualizer

# 環境切り替え
firebase use default  # 本番
firebase use dev      # 開発
```

---

## 📊 パフォーマンス監視

### Firebase Performance Monitoring

```html
<!-- public/index.html に追加 -->
<script src="/__/firebase/9.0.0/firebase-performance.js"></script>
<script>
  firebase.performance();
</script>
```

### Firebase Analytics

```html
<!-- アクセス解析が必要な場合 -->
<script src="/__/firebase/9.0.0/firebase-analytics.js"></script>
<script>
  firebase.analytics();
</script>
```

---

## 🐛 トラブルシューティング

### ❌ 「firebase command not found」

**解決方法:**
```bash
npm install -g firebase-tools
# または
npx firebase-tools --version
```

### ❌ 「Permission denied」

**解決方法:**
```bash
firebase login
firebase projects:list
```

### ❌ 「Build failed」

**解決方法:**
```bash
# ローカルでビルドテスト
npm install --legacy-peer-deps
npm run build:prod

# エラーがなければデプロイ
firebase deploy
```

### ❌ 「404 not found」

**原因**: SPAのルーティング設定不備

**解決方法:**
- `firebase.json` の rewrites 設定を確認
- すべてのルートが `/index.html` にリダイレクトされるよう設定

### ❌ 音声が再生されない

**解決方法:**
- Firebase Hosting は自動でHTTPS化されるため通常は問題なし
- ブラウザのコンソールでエラー確認

---

## 💡 コスト最適化Tips

### 転送量削減
1. **ファイル圧縮**: Gzip は自動有効
2. **キャッシュ設定**: 静的ファイルの長期キャッシュ
3. **画像最適化**: WebP 形式の使用

### ビルドサイズ削減
```bash
# バンドルサイズ分析
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets/*.js
```

---

## 🎉 完了チェックリスト

- [ ] Firebase プロジェクト作成
- [ ] Hosting 有効化
- [ ] ローカルビルド成功
- [ ] Firebase CLI ログイン
- [ ] 初回デプロイ成功
- [ ] ライブURL での動作確認
- [ ] カスタムドメイン設定 (オプション)

---

## 📞 サポート

### 公式ドキュメント
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### このプロジェクトでの質問
- [Issues](https://github.com/shmorish/music-visualization/issues)

---

## 🚀 デプロイURL例

デプロイ成功時のURL:
- **メインURL**: `https://music-visualizer.web.app`
- **代替URL**: `https://music-visualizer.firebaseapp.com`
- **カスタムドメイン**: `https://your-domain.com` (設定時)

Firebase Hosting なら確実に無料で高速なサイトが公開できます！🔥
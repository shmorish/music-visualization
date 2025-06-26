# 🚀 Netlify完全セットアップガイド

このガイドでは、プライベートリポジトリでもNetlifyに自動デプロイできる設定を詳しく説明します。

## 📋 目次

- [クイックスタート](#クイックスタート)
- [NETLIFY_AUTH_TOKEN 取得](#netlify_auth_token-取得)
- [NETLIFY_SITE_ID 取得](#netlify_site_id-取得)
- [GitHub Secrets 設定](#github-secrets-設定)
- [自動デプロイ確認](#自動デプロイ確認)
- [トラブルシューティング](#トラブルシューティング)

## 🚀 クイックスタート

### 方法1: ドラッグ&ドロップ (最も簡単 - 1分)

1. **ビルド実行**
   ```bash
   npm run build:prod
   ```

2. **Netlify Dropでデプロイ**
   - https://app.netlify.com/drop にアクセス
   - `dist` フォルダをドラッグ&ドロップ
   - 🎉 完了！URLが自動生成されます

### 方法2: 自動デプロイ設定 (5分)

以下の手順で設定すると、GitHubにプッシュするだけで自動デプロイされます。

---

## 🔑 NETLIFY_AUTH_TOKEN 取得

### ステップ1: Netlifyアカウント作成/ログイン

1. **Netlify にアクセス**
   - https://app.netlify.com にアクセス

2. **サインアップ/ログイン**
   - "Sign up" をクリック
   - "GitHub" を選択してログイン
   - または Email でアカウント作成

### ステップ2: Personal Access Token 作成

1. **User Settings を開く**
   - 右上のプロフィール画像をクリック
   - ドロップダウンから "User settings" を選択

2. **Applications タブに移動**
   - 左サイドバーの "Applications" をクリック

3. **Personal access tokens セクション**
   - "Personal access tokens" セクションを見つける
   - "New access token" ボタンをクリック

4. **トークン作成**
   - **Description**: `GitHub Actions Deploy` (わかりやすい名前)
   - **Scopes**: デフォルトのままでOK
   - "Generate token" をクリック

5. **トークンをコピー**
   - 生成されたトークンが表示されます
   - 🚨 **重要**: このトークンは一度しか表示されません！
   - 形式: `nfp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 安全な場所にコピーして保存

---

## 🆔 NETLIFY_SITE_ID 取得

### 方法A: 既存サイトから取得

1. **Netlify Dashboard でサイト選択**
   - https://app.netlify.com/teams/[username]/sites
   - デプロイ済みのサイトをクリック

2. **Site settings を開く**
   - サイトの詳細ページで "Site settings" タブをクリック

3. **Site information セクション**
   - "Site information" セクションを見つける
   - **Site ID** をコピー
   - 形式: `12345678-abcd-1234-efgh-123456789012`

### 方法B: 新しいサイトを作成

1. **Manual deploy でサイト作成**
   ```bash
   # プロジェクトをビルド
   npm run build:prod
   ```

2. **Netlify Drop でデプロイ**
   - https://app.netlify.com/drop
   - `dist` フォルダをドラッグ&ドロップ

3. **Site ID を取得**
   - デプロイ完了後、サイトページに移動
   - "Site settings" → "Site information" で Site ID をコピー

### 方法C: 空のサイトを事前作成

1. **新しいサイトを作成**
   - Netlify Dashboard で "New site from Git" をクリック
   - "Deploy manually" を選択
   - 空のフォルダをアップロード

2. **Site ID を取得**
   - 作成されたサイトの Site settings で Site ID をコピー

---

## ⚙️ GitHub Secrets 設定

### ステップ1: GitHub Repository Settings

1. **リポジトリの Settings にアクセス**
   - https://github.com/shmorish/music-visualization
   - "Settings" タブをクリック

2. **Secrets and variables を開く**
   - 左サイドバーの "Secrets and variables" を展開
   - "Actions" をクリック

### ステップ2: Secrets を追加

1. **NETLIFY_AUTH_TOKEN を追加**
   - "New repository secret" をクリック
   - **Name**: `NETLIFY_AUTH_TOKEN`
   - **Secret**: コピーしたトークン (`nfp_...` で始まる文字列)
   - "Add secret" をクリック

2. **NETLIFY_SITE_ID を追加**
   - 再度 "New repository secret" をクリック
   - **Name**: `NETLIFY_SITE_ID`
   - **Secret**: コピーしたサイトID (UUID形式)
   - "Add secret" をクリック

### ステップ3: 設定確認

設定完了後、以下のように表示されます：
```
Repository secrets
NETLIFY_AUTH_TOKEN        Updated X minutes ago
NETLIFY_SITE_ID          Updated X minutes ago
```

---

## 🔄 自動デプロイ確認

### ステップ1: デプロイワークフローをトリガー

```bash
# コードを変更してプッシュ
git add .
git commit -m "test: Netlify自動デプロイのテスト"
git push origin main
```

### ステップ2: GitHub Actions で確認

1. **Actions タブを開く**
   - GitHub リポジトリの "Actions" タブをクリック

2. **ワークフロー実行を確認**
   - "Deploy to Netlify" ワークフローが実行されることを確認
   - 緑色のチェックマークで成功を確認

### ステップ3: Netlifyで確認

1. **Netlify Dashboard を確認**
   - https://app.netlify.com/teams/[username]/sites
   - 最新のデプロイが表示されることを確認

2. **ライブサイトにアクセス**
   - サイトURLをクリックしてアクセス
   - 変更が反映されていることを確認

---

## 🛠️ トラブルシューティング

### ❌ Error: "Invalid token"

**原因**: NETLIFY_AUTH_TOKEN が正しくない

**解決方法**:
1. Netlifyで新しいトークンを生成
2. GitHub Secretsの値を更新
3. トークンの前後にスペースがないか確認

### ❌ Error: "Site not found"

**原因**: NETLIFY_SITE_ID が正しくない

**解決方法**:
1. Netlify Site settings で正しいSite IDを確認
2. GitHub Secretsの値を更新
3. UUIDの形式であることを確認

### ❌ Error: "Build failed"

**原因**: ビルドエラーまたは依存関係の問題

**解決方法**:
```bash
# ローカルでビルドテスト
npm install --legacy-peer-deps
npm run build:prod

# エラーがなければプッシュ
git push origin main
```

### ❌ サイトが表示されない

**原因**: SPAのルーティング問題

**解決方法**:
- `netlify.toml` ファイルが正しく設定されていることを確認
- リダイレクト設定が適用されていることを確認

### ❌ 音声が再生されない

**原因**: HTTPS証明書またはCORS問題

**解決方法**:
- Netlifyは自動でHTTPS化されるため通常は問題なし
- ブラウザのコンソールでエラーを確認

---

## 🚀 高度な設定

### 環境変数の追加

追加の環境変数が必要な場合：

1. **Netlify Dashboard で設定**
   - Site settings → Environment variables
   - 本番用の環境変数を設定

2. **GitHub Secrets で設定**
   - Actions用の環境変数をSecretsに追加

### カスタムドメインの設定

1. **ドメインを追加**
   - Site settings → Domain management
   - "Add custom domain" をクリック

2. **DNS設定**
   - ドメインプロバイダーでCNAMEレコードを設定
   - Netlifyが提供するDNSサーバーを使用（推奨）

### フォーム処理の有効化

```html
<!-- ContactフォームにNetlify属性追加 -->
<form name="contact" method="POST" data-netlify="true">
  <!-- フォーム要素 -->
</form>
```

---

## 📞 サポート

### 公式ドキュメント
- [Netlify Docs](https://docs.netlify.com/)
- [GitHub Actions Netlify](https://github.com/netlify/actions)

### このプロジェクトでの問題
- [Issues](https://github.com/shmorish/music-visualization/issues) で質問してください

### よくある質問

**Q: 無料プランの制限は？**
A: 月100GBの帯域幅、300分のビルド時間

**Q: カスタムドメインは使える？**
A: はい、無料プランでも利用可能

**Q: HTTPSは自動？**
A: はい、Let's Encryptで自動的にHTTPS化

**Q: プレビューデプロイは？**
A: プルリクエストごとに自動でプレビューURL生成

---

## 🎉 完了チェックリスト

- [ ] Netlifyアカウント作成
- [ ] NETLIFY_AUTH_TOKEN 取得
- [ ] NETLIFY_SITE_ID 取得
- [ ] GitHub Secrets 設定
- [ ] テストプッシュで自動デプロイ確認
- [ ] ライブサイトでの動作確認

すべて完了したら、mainブランチにプッシュするだけで自動デプロイされます！🚀
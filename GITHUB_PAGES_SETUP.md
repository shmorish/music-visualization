# 📖 GitHub Pages セットアップガイド

GitHub Pagesでの自動デプロイを有効にするための手順です。

## 🔧 セットアップ手順

### 1. GitHub リポジトリ設定

1. **GitHubリポジトリにアクセス**
   - https://github.com/shmorish/music-visualization にアクセス

2. **Settings タブを開く**
   - リポジトリページの上部にある "Settings" をクリック

3. **Pages 設定を開く**
   - 左サイドバーの "Pages" をクリック

4. **Source を設定**
   - Source: "Deploy from a branch" を選択
   - Branch: "gh-pages" を選択
   - Folder: "/ (root)" を選択
   - "Save" をクリック

### 2. Actions 権限の確認

1. **Actions 設定を開く**
   - Settings > Actions > General

2. **Workflow permissions を設定**
   - "Read and write permissions" を選択
   - "Allow GitHub Actions to create and approve pull requests" をチェック
   - "Save" をクリック

### 3. デプロイの実行

```bash
# メインブランチにプッシュして自動デプロイを開始
git push origin main
```

### 4. デプロイ状況の確認

1. **Actions タブで確認**
   - リポジトリの "Actions" タブをクリック
   - "Deploy to GitHub Pages (Simple)" ワークフローの実行状況を確認

2. **Pages 設定で URL を確認**
   - Settings > Pages で公開URLを確認
   - 通常: `https://shmorish.github.io/music-visualization/`

## 🔧 トラブルシューティング

### ❌ エラー: "Pages is not enabled"

**原因**: GitHub Pagesが有効になっていない

**解決方法**:
1. Settings > Pages にアクセス
2. Source を "Deploy from a branch" に設定
3. Branch を "gh-pages" に設定

### ❌ エラー: "Permission denied"

**原因**: GitHub Actions の権限が不足

**解決方法**:
1. Settings > Actions > General にアクセス
2. Workflow permissions を "Read and write permissions" に設定

### ❌ エラー: "Build failed"

**原因**: 依存関係やビルドエラー

**解決方法**:
```bash
# ローカルでビルドテスト
npm install --legacy-peer-deps
npm run build:prod

# エラーがなければプッシュ
git push origin main
```

### ❌ ページが表示されない

**原因**: ベースパスの設定問題

**確認方法**:
1. `vite.config.ts` の `base` 設定を確認
2. GitHub Pages URL: `https://username.github.io/repository-name/`
3. Base path: `/repository-name/`

## 🚀 代替デプロイ方法

### 手動デプロイ

GitHub Pagesの自動設定がうまくいかない場合:

```bash
# 手動でgh-pagesブランチにデプロイ
npm run deploy
```

### 他のプラットフォーム

GitHub Pagesでの問題が解決しない場合の代替案:

1. **Netlify** (推奨)
   - [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shmorish/music-visualization)

2. **Vercel**
   - [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shmorish/music-visualization)

## 📞 サポート

設定に問題がある場合は、[Issues](https://github.com/shmorish/music-visualization/issues) でお知らせください。
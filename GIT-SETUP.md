# Git連携のセットアップ手順

Netlifyで自動デプロイするための Git 連携手順です。

---

## Step 1: GitHub でリポジトリを作成

1. **[github.com](https://github.com)** にログイン
2. 右上 **+** → **New repository**
3. 以下を設定して作成：
   - **Repository name**: `gacha-press`（任意）
   - **Description**: ガチャ発売カレンダー
   - **Public** を選択
   - **Add a README file** は付けない（既存のファイルをプッシュするため）

---

## Step 2: ローカルで Git を初期化してプッシュ

ターミナルで `gacha-media` フォルダに移動し、以下を実行：

```bash
cd /Users/asakawa-so/Cursor/gacha-media

# 初回のみ：Git の名前・メールを設定（GitHub に表示される）
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Git はすでに初期化済み。ファイルを追加
git add .

# 初回コミット
git commit -m "Initial commit: ガチャプレス"

# リモートを設定（YOUR_USERNAME と YOUR_REPO を実際の値に変更）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# ブランチ名を main に（GitHub のデフォルト）
git branch -M main

# プッシュ
git push -u origin main
```

※ `YOUR_USERNAME` → あなたの GitHub ユーザー名  
※ `YOUR_REPO` → 作成したリポジトリ名（例: gacha-press）

---

## Step 3: Netlify で Git を連携

1. **[app.netlify.com](https://app.netlify.com)** にログイン
2. **Add new site** → **Import an existing project**
3. **GitHub** を選択して認証
4. リポジトリ一覧から **gacha-press**（作成したリポジトリ）を選択
5. ビルド設定を確認：
   - **Branch to deploy**: `main`
   - **Base directory**: （空欄のまま）
   - **Build command**: （空欄のまま）
   - **Publish directory**: `.`

6. **Deploy site** をクリック

---

## Step 4: 完了

以降、`git add` → `git commit` → `git push` するだけで  
Netlify が自動で新しいバージョンをデプロイします。

```bash
# 例：商品データを更新した場合
git add js/data.js
git commit -m "商品データを更新"
git push
```

---

## トラブルシュート

### リポジトリが選択肢に出ない
- GitHub の Netlify 認証で、該当リポジトリへのアクセスを許可しているか確認
- [GitHub Settings → Applications → Netlify] で権限を確認

### デプロイは成功するがサイトが表示されない
- Netlify の **Site settings → Build & deploy** で **Publish directory** が `.` になっているか確認
- リポジトリのルートに `index.html` があるか確認（`gacha-media` がリポジトリルートであること）

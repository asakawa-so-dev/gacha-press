# ウェブに公開する方法

ガチャプレスをインターネット上で閲覧できるようにする手順です。いずれも**無料**で利用できます。

---

## 方法1: Netlify Drop（いちばん簡単・約1分）

1. **[app.netlify.com/drop](https://app.netlify.com/drop)** を開く
2. **`gacha-media` フォルダ**をそのままドラッグ＆ドロップ
3. 数秒後に `https://○○○.netlify.app` のようなURLが発行される
4. そのURLを共有すれば、誰でも閲覧可能

※アカウント登録は不要（続けて使う場合は登録を推奨）

### GitリポジトリからNetlifyにデプロイする場合

`gacha-media` がリポジトリのサブフォルダにある場合：

1. Netlify で **Site settings** → **Build & deploy** を開く
2. **Base directory** に `gacha-media` を指定
3. **Publish directory** を `.` のまま（または `gacha-media` に）
4. **Deploy site** を実行

※ルート直下に index.html がある構成なら、Base directory は空欄でOK

---

## 方法2: GitHub Pages（永続的・おすすめ）

1. **GitHub**で新規リポジトリを作成（例: `gacha-press`）
2. この `gacha-media` フォルダの中身（index.html, css, js, images）をリポジトリにアップロード
3. **Settings → Pages** を開く
4. **Source** を「Deploy from a branch」に
5. **Branch** を `main`、フォルダを `/ (root)` にして保存
6. 数分後に  
   `https://あなたのユーザー名.github.io/gacha-press/`  
   で公開される

---

## 方法3: Cloudflare Pages

1. **[dash.cloudflare.com](https://dash.cloudflare.com)** にログイン
2. **Workers & Pages** → **Create** → **Direct Upload**
3. `gacha-media` フォルダをZIPにまとめてアップロード
4. デプロイ後、`https://○○○.pages.dev` 形式のURLで公開される

---

## 注意事項

- 画像・データは実際の商品情報ではなくサンプルです
- 本番運用時は各メーカー・権利者に画像利用の許諾を得てください

#!/usr/bin/env python3
"""
no-imageプレースホルダー(24461 bytes)を正しい商品画像に差し替え
gacha-island.jp 記事ページから商品画像を取得
"""

import urllib.request
import urllib.parse
import re
import os
import time
import json
import sys
import ssl
import hashlib

ssl._create_default_https_context = ssl._create_unverified_context
sys.stdout.reconfigure(line_buffering=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(BASE_DIR, "images")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

BAD_HASH = "aaed24cffe5078c6cc3ebc92ad965822"
BAD_SIZES = {7080, 122779, 24461}


def fetch_url(url, timeout=12):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except:
        return None


def download_image(url, filepath):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = resp.read()
            if len(data) < 3000 or len(data) in BAD_SIZES:
                return False
            h = hashlib.md5(data).hexdigest()
            if h == BAD_HASH:
                return False
            with open(filepath, "wb") as f:
                f.write(data)
            return True
    except:
        return False


def is_product_image(url):
    bad = ["gacharakko", "cropped-gacharakko", "logo", "favicon", "icon",
           "banner", "gravatar", "theme", "plugin", "widget", "calendar_"]
    url_lower = url.lower()
    return not any(b in url_lower for b in bad)


def gacha_island_search_and_fetch(name):
    """gacha-island.jpで検索→記事→商品画像を取得"""
    encoded = urllib.parse.quote(name)
    url = f"https://gacha-island.jp/?s={encoded}"
    html = fetch_url(url)
    if not html:
        return None

    links = re.findall(r'href="(https://gacha-island\.jp/\d+/)"', html)
    if not links:
        return None

    for article_url in links[:3]:
        time.sleep(0.3)
        article = fetch_url(article_url)
        if not article:
            continue

        imgs = re.findall(
            r'(https://gacha-island\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?\.(jpg|jpeg|png|webp))',
            article
        )
        for img_url, ext in imgs:
            if is_product_image(img_url) and "-1024x1024" not in img_url:
                return img_url
        # Try 1024x1024 if no smaller found
        for img_url, ext in imgs:
            if is_product_image(img_url):
                return img_url

    return None


def gachapara_monthly_pages(month):
    """gachapara.jpの月別ページから商品名→画像URLのマッピングを取得"""
    month_str = month.replace("-", "")
    results = {}

    for page in range(1, 5):
        if page == 1:
            url = f"https://gachapara.jp/gachagacha-{month_str}/"
        else:
            url = f"https://gachapara.jp/gachagacha-{month_str}/page/{page}/"

        html = fetch_url(url)
        if not html:
            break

        # h3タグで商品名、直後のimgで画像を取得
        h3s = list(re.finditer(r'<h3[^>]*>(.*?)</h3>', html, re.DOTALL))
        for i, h3 in enumerate(h3s):
            name = re.sub(r'<[^>]+>', '', h3.group(1)).strip()
            if not name or len(name) < 3:
                continue
            start = h3.end()
            end = h3s[i+1].start() if i+1 < len(h3s) else len(html)
            section = html[start:end]

            # 300x300サイズの画像を優先
            img_match = re.search(
                r'(https://gachapara\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?-300x300\.\w+)',
                section
            )
            if not img_match:
                img_match = re.search(
                    r'(https://gachapara\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?-\d+x\d+\.\w+)',
                    section
                )
            if img_match:
                img_url = img_match.group(1)
                if is_product_image(img_url):
                    results[name] = img_url

        time.sleep(0.5)

    return results


def normalize(s):
    s = re.sub(r'[　\s]+', ' ', s).strip().lower()
    s = re.sub(r'[！!？?×＆&（）()]', '', s)
    return s


def find_match(product_name, name_map):
    pn = normalize(product_name)
    best_url = None
    best_score = 0

    for name, url in name_map.items():
        sn = normalize(name)
        if pn == sn:
            return url
        if pn in sn or sn in pn:
            score = min(len(pn), len(sn)) / max(len(pn), len(sn))
            if score > best_score:
                best_score = score
                best_url = url

    if best_score > 0.4:
        return best_url
    return None


def load_products():
    data_js = os.path.join(BASE_DIR, "js", "data.js")
    with open(data_js, "r") as f:
        content = f.read()
    products = []
    pattern = re.compile(
        r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)".*?releaseMonth:\s*"([^"]+)"',
        re.DOTALL
    )
    for m in pattern.finditer(content):
        products.append({
            "id": int(m.group(1)),
            "name": m.group(2),
            "month": m.group(3),
        })
    return products


def main():
    products = load_products()

    # 問題のあるファイルを特定
    bad_ids = []
    for f in os.listdir(IMAGES_DIR):
        if not f.endswith(".jpg"):
            continue
        fp = os.path.join(IMAGES_DIR, f)
        sz = os.path.getsize(fp)
        if sz == 24461:
            h = hashlib.md5(open(fp, 'rb').read()).hexdigest()
            if h == BAD_HASH:
                pid = int(f.replace(".jpg", ""))
                bad_ids.append(pid)

    bad_products = [p for p in products if p["id"] in bad_ids]
    print(f"Need to fix {len(bad_products)} products with no-image placeholder")

    # Phase 1: gachapara.jp月別ページからマッピング構築
    print("\n=== Building image map from gachapara monthly pages ===")
    months_needed = set(p["month"] for p in bad_products)
    all_name_maps = {}
    for month in sorted(months_needed):
        print(f"  Fetching {month}...")
        name_map = gachapara_monthly_pages(month)
        all_name_maps[month] = name_map
        print(f"  -> {len(name_map)} products with images")

    # Phase 2: マッチングとダウンロード
    fixed = 0
    still_bad = []

    for i, product in enumerate(bad_products):
        pid = product["id"]
        name = product["name"]
        month = product["month"]
        filepath = os.path.join(IMAGES_DIR, f"{pid:03d}.jpg")

        print(f"\n[{i+1}/{len(bad_products)}] #{pid} {name[:45]}")

        # 1. gachapara月別ページのマッチング
        name_map = all_name_maps.get(month, {})
        img_url = find_match(name, name_map)
        if img_url:
            print(f"  gachapara monthly match!", flush=True)
            os.remove(filepath)
            if download_image(img_url, filepath):
                print(f"  -> OK")
                fixed += 1
                continue
            print(f"  -> bad (same placeholder)")

        # 2. gacha-island.jp記事ページ
        time.sleep(0.5)
        print(f"  gacha-island article...", end=" ", flush=True)
        img_url = gacha_island_search_and_fetch(name)
        if img_url:
            print(f"found!")
            if os.path.exists(filepath):
                os.remove(filepath)
            if download_image(img_url, filepath):
                print(f"  -> OK")
                fixed += 1
                continue
            print(f"  -> bad download")

        # 3. gacha-island 短縮キーワード
        time.sleep(0.5)
        words = name.replace("×", " ").replace("＆", " ").split()
        if len(words) >= 2:
            short = " ".join(words[:2])
            print(f"  gacha-island('{short}')...", end=" ", flush=True)
            img_url = gacha_island_search_and_fetch(short)
            if img_url:
                print(f"found!")
                if os.path.exists(filepath):
                    os.remove(filepath)
                if download_image(img_url, filepath):
                    print(f"  -> OK")
                    fixed += 1
                    continue

        # 4. 全月のマップで検索
        for m, nm in all_name_maps.items():
            if m == month:
                continue
            img_url = find_match(name, nm)
            if img_url:
                print(f"  cross-month match!", flush=True)
                if os.path.exists(filepath):
                    os.remove(filepath)
                if download_image(img_url, filepath):
                    print(f"  -> OK")
                    fixed += 1
                    break
        else:
            print(f"  MISS")
            still_bad.append(product)

    # 残ったプレースホルダーを削除
    for p in still_bad:
        fp = os.path.join(IMAGES_DIR, f"{p['id']:03d}.jpg")
        if os.path.exists(fp):
            sz = os.path.getsize(fp)
            h = hashlib.md5(open(fp, 'rb').read()).hexdigest()
            if h == BAD_HASH:
                os.remove(fp)
                print(f"  Removed placeholder for #{p['id']}")

    # data.js更新: 画像がないものはimage: nullに戻す
    data_js = os.path.join(BASE_DIR, "js", "data.js")
    with open(data_js, "r") as f:
        content = f.read()
    reverted = 0
    for p in still_bad:
        fp = os.path.join(IMAGES_DIR, f"{p['id']:03d}.jpg")
        if not os.path.exists(fp):
            old = f'image: "images/{p["id"]:03d}.jpg"'
            new = 'image: null'
            if old in content:
                content = content.replace(old, new, 1)
                reverted += 1
    with open(data_js, "w") as f:
        f.write(content)

    print(f"\n{'='*60}")
    print(f"Fixed: {fixed}/{len(bad_products)}")
    print(f"Still missing: {len(still_bad)} (reverted to null)")
    if still_bad:
        print(f"Missing IDs: {[p['id'] for p in still_bad]}")


if __name__ == "__main__":
    main()

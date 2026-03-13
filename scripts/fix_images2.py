#!/usr/bin/env python3
"""
7080バイトのロゴ画像を正しい商品画像に差し替え (第2弾)
gachapara.jp の個別記事ページから画像を取得する方式に変更
"""

import urllib.request
import urllib.parse
import re
import os
import time
import json
import sys
import ssl

ssl._create_default_https_context = ssl._create_unverified_context
sys.stdout.reconfigure(line_buffering=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(BASE_DIR, "images")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

BAD_SIZE = 7080
RAKKO_SIZE = 122779


def fetch_url(url, timeout=12):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        return None


def download_image(url, filepath):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = resp.read()
            if len(data) < 2000:
                return False
            if len(data) in (BAD_SIZE, RAKKO_SIZE):
                return False
            with open(filepath, "wb") as f:
                f.write(data)
            return True
    except Exception:
        return False


def is_product_image(url):
    """商品画像のみ通すフィルタ"""
    url_lower = url.lower()
    bad = ["logo", "favicon", "icon", "banner", "gacharakko", "cropped-",
           "gravatar", "amazon", "rakuten", "mercari", "theme", "plugin",
           "widget", "advertisement", "calendar_"]
    if any(b in url_lower for b in bad):
        return False
    if not any(ext in url_lower for ext in [".jpg", ".jpeg", ".png", ".webp"]):
        return False
    return True


def search_gachapara_article(name):
    """gachapara.jpで検索し、記事ページに入って商品画像を取得"""
    encoded = urllib.parse.quote(name)
    url = f"https://gachapara.jp/?s={encoded}"
    html = fetch_url(url)
    if not html:
        return None

    # 検索結果から記事リンクを取得
    link_pattern = re.compile(r'href="(https://gachapara\.jp/[^"]*?/)"[^>]*class="[^"]*post')
    links = link_pattern.findall(html)
    if not links:
        # もう少し広く取る
        link_pattern2 = re.compile(r'<a\s+href="(https://gachapara\.jp/(?!category|tag|page|wp-)[^"]+/)"')
        links = link_pattern2.findall(html)

    if not links:
        return None

    # 最初の記事ページを取得
    article_url = links[0]
    time.sleep(0.3)
    article_html = fetch_url(article_url)
    if not article_html:
        return None

    # 記事内の商品画像を探す（wp-content/uploads 配下で300x300サイズ優先）
    img_pattern = re.compile(
        r'(https://gachapara\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?-300x300\.(jpg|jpeg|png|webp))'
    )
    for m in img_pattern.finditer(article_html):
        img_url = m.group(1)
        if is_product_image(img_url):
            return img_url

    # 300x300がなければ他のサイズ
    img_pattern2 = re.compile(
        r'(https://gachapara\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?\.(jpg|jpeg|png|webp))'
    )
    for m in img_pattern2.finditer(article_html):
        img_url = m.group(1)
        if is_product_image(img_url):
            return img_url

    return None


def search_gachapara_direct(name):
    """gachapara.jp検索結果ページから直接画像を取得（記事に入らない）"""
    encoded = urllib.parse.quote(name)
    url = f"https://gachapara.jp/?s={encoded}"
    html = fetch_url(url)
    if not html:
        return None

    # 検索結果のサムネイルを取得
    img_pattern = re.compile(
        r'(https://gachapara\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?\.(jpg|jpeg|png|webp))'
    )
    for m in img_pattern.finditer(html):
        img_url = m.group(1)
        if is_product_image(img_url):
            return img_url
    return None


def search_gacha_island_article(name):
    """gacha-island.jpで検索し、記事ページに入って商品画像を取得"""
    encoded = urllib.parse.quote(name)
    url = f"https://gacha-island.jp/?s={encoded}"
    html = fetch_url(url)
    if not html:
        return None

    # 記事リンクを取得（数字IDのページ）
    link_pattern = re.compile(r'href="(https://gacha-island\.jp/\d+/)"')
    links = link_pattern.findall(html)
    if not links:
        return None

    article_url = links[0]
    time.sleep(0.3)
    article_html = fetch_url(article_url)
    if not article_html:
        return None

    img_pattern = re.compile(
        r'(https://gacha-island\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?\.(jpg|jpeg|png|webp))'
    )
    for m in img_pattern.finditer(article_html):
        img_url = m.group(1)
        if is_product_image(img_url):
            return img_url

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

    # ロゴ画像(7080) のIDを特定
    bad_ids = []
    for f in os.listdir(IMAGES_DIR):
        if f.endswith(".jpg"):
            fp = os.path.join(IMAGES_DIR, f)
            if os.path.getsize(fp) == BAD_SIZE:
                pid = int(f.replace(".jpg", ""))
                bad_ids.append(pid)

    bad_products = [p for p in products if p["id"] in bad_ids]
    print(f"Need to fix {len(bad_products)} products with logo images")

    fixed = 0
    still_bad = []

    for i, product in enumerate(bad_products):
        pid = product["id"]
        name = product["name"]
        filepath = os.path.join(IMAGES_DIR, f"{pid:03d}.jpg")

        print(f"\n[{i+1}/{len(bad_products)}] #{pid} {name[:45]}")

        # 1. gachapara 記事ページから
        print("  gachapara article...", end=" ", flush=True)
        img_url = search_gachapara_article(name)
        if img_url:
            print("found!", flush=True)
            os.remove(filepath)
            if download_image(img_url, filepath):
                print(f"  -> OK")
                fixed += 1
                time.sleep(0.5)
                continue
            print("  -> bad download")

        # 2. 短いキーワードで再試行
        time.sleep(0.3)
        words = name.replace("×", " ").replace("＆", " ").split()
        if len(words) >= 2:
            short = " ".join(words[:2])
            print(f"  gachapara article('{short}')...", end=" ", flush=True)
            img_url = search_gachapara_article(short)
            if img_url:
                print("found!", flush=True)
                if os.path.exists(filepath):
                    os.remove(filepath)
                if download_image(img_url, filepath):
                    print(f"  -> OK")
                    fixed += 1
                    time.sleep(0.5)
                    continue

        # 3. gacha-island 記事ページから
        time.sleep(0.3)
        print("  gacha-island article...", end=" ", flush=True)
        img_url = search_gacha_island_article(name)
        if img_url:
            print("found!", flush=True)
            if os.path.exists(filepath):
                os.remove(filepath)
            if download_image(img_url, filepath):
                print(f"  -> OK")
                fixed += 1
                time.sleep(0.5)
                continue

        # 4. gacha-island 短いキーワード
        time.sleep(0.3)
        if len(words) >= 2:
            short = " ".join(words[:2])
            print(f"  gacha-island article('{short}')...", end=" ", flush=True)
            img_url = search_gacha_island_article(short)
            if img_url:
                print("found!", flush=True)
                if os.path.exists(filepath):
                    os.remove(filepath)
                if download_image(img_url, filepath):
                    print(f"  -> OK")
                    fixed += 1
                    time.sleep(0.5)
                    continue

        print("  MISS")
        still_bad.append(product)
        time.sleep(0.3)

    # 修正できなかったものはロゴ画像を削除
    for p in still_bad:
        fp = os.path.join(IMAGES_DIR, f"{p['id']:03d}.jpg")
        if os.path.exists(fp) and os.path.getsize(fp) == BAD_SIZE:
            os.remove(fp)

    print(f"\n{'='*60}")
    print(f"Fixed: {fixed}/{len(bad_products)}")
    print(f"Still missing: {len(still_bad)}")
    if still_bad:
        ids = [p["id"] for p in still_bad]
        print(f"Missing IDs: {ids}")
        with open(os.path.join(BASE_DIR, "scripts", "still_missing2.json"), "w") as f:
            json.dump([{"id": p["id"], "name": p["name"]} for p in still_bad], f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
ラッコ画像（gacha-island.jpマスコット）を正しい商品画像に差し替え
複数ソースを順に試行:
  1. gachapara.jp 個別商品検索
  2. takaratomy-arts.co.jp 商品検索
  3. bandai公式 gashapon検索
  4. Google画像検索(html)
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
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

BAD_IDS = [4,16,34,37,47,54,56,59,64,65,67,68,71,75,78,80,82,88,89,93,98,
           102,109,115,117,123,128,129,131,132,133,136,137,140,147,154,156,
           158,160,161,165,166,167,169,171,172,174,179,180,192,193,195,215,
           237,260,261,273,284,
           301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,
           317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,
           333,334,335,336,337,338]

RAKKO_SIZE = 122779  # ラッコ画像のファイルサイズ


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
            if len(data) < 1000:
                return False
            if len(data) == RAKKO_SIZE:
                return False
            with open(filepath, "wb") as f:
                f.write(data)
            return True
    except Exception:
        return False


def is_valid_product_image(url):
    """Filter out known bad image patterns."""
    bad_patterns = [
        "gacharakko", "cropped-gacharakko", "logo", "favicon",
        "icon", "banner", "advertisement", "ad-", "widget",
        "gravatar", "amazon", "rakuten", "mercari", "suruga-ya"
    ]
    url_lower = url.lower()
    return not any(p in url_lower for p in bad_patterns)


def search_gachapara(name):
    """Search gachapara.jp for product image."""
    encoded = urllib.parse.quote(name)
    url = f"https://gachapara.jp/?s={encoded}"
    html = fetch_url(url)
    if not html:
        return None

    # Find product images from search results
    img_pattern = re.compile(
        r'(https://gachapara\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?-300x300\.\w+)'
    )
    for m in img_pattern.finditer(html):
        img_url = m.group(1)
        if is_valid_product_image(img_url):
            return img_url

    # Try without 300x300
    img_pattern2 = re.compile(
        r'(https://gachapara\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?\.\w+)'
    )
    for m in img_pattern2.finditer(html):
        img_url = m.group(1)
        if is_valid_product_image(img_url) and not re.search(r'-\d+x\d+\.', img_url):
            return img_url

    return None


def search_gacha_island_detailed(name):
    """Search gacha-island.jp more carefully, avoiding mascot images."""
    encoded = urllib.parse.quote(name)
    url = f"https://gacha-island.jp/?s={encoded}"
    html = fetch_url(url)
    if not html:
        return None

    # Get all gacha-island product images, filter out mascot
    img_pattern = re.compile(
        r'(https://gacha-island\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?\.\w+)'
    )
    for m in img_pattern.finditer(html):
        img_url = m.group(1)
        if is_valid_product_image(img_url):
            # Prefer images that look like product photos
            if any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                return img_url

    return None


def search_takaratomy(name):
    """Search takaratomy-arts.co.jp for product image."""
    short_name = name.split()[0] if len(name.split()) > 1 else name
    encoded = urllib.parse.quote(short_name)
    url = f"https://www.takaratomy-arts.co.jp/items/search.html?q={encoded}"
    html = fetch_url(url)
    if not html:
        return None

    img_pattern = re.compile(
        r'(https?://www\.takaratomy-arts\.co\.jp/[^"\'<>\s]+?\.\w+)'
    )
    for m in img_pattern.finditer(html):
        img_url = m.group(1)
        if any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png']):
            if is_valid_product_image(img_url):
                return img_url
    return None


def search_bandai_gashapon(name):
    """Search gashapon.jp (Bandai) for product image."""
    short_name = name[:20]
    encoded = urllib.parse.quote(short_name)
    url = f"https://gashapon.jp/search/?q={encoded}"
    html = fetch_url(url)
    if not html:
        return None

    img_pattern = re.compile(
        r'(https?://gashapon\.jp/[^"\'<>\s]+?\.(jpg|jpeg|png))'
    )
    for m in img_pattern.finditer(html):
        img_url = m.group(1)
        if is_valid_product_image(img_url) and 'product' in img_url.lower():
            return img_url
    return None


def search_toysanta(name):
    """Search toysanta.jp for product image."""
    short_name = name[:30]
    encoded = urllib.parse.quote(short_name)
    url = f"https://shop.toysanta.jp/?mode=srh&keyword={encoded}"
    html = fetch_url(url)
    if not html:
        return None

    img_pattern = re.compile(
        r'(https?://[^"\'<>\s]*toysanta[^"\'<>\s]*?\.(jpg|jpeg|png|webp))'
    )
    for m in img_pattern.finditer(html):
        img_url = m.group(1)
        if is_valid_product_image(img_url):
            return img_url
    return None


def load_products():
    data_js = os.path.join(BASE_DIR, "js", "data.js")
    with open(data_js, "r") as f:
        content = f.read()
    products = []
    pattern = re.compile(
        r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)".*?releaseMonth:\s*"([^"]+)".*?maker:\s*"([^"]+)"',
        re.DOTALL
    )
    for m in pattern.finditer(content):
        products.append({
            "id": int(m.group(1)),
            "name": m.group(2),
            "month": m.group(3),
            "maker": m.group(4),
        })
    return products


def main():
    products = load_products()
    bad_products = [p for p in products if p["id"] in BAD_IDS]
    print(f"Need to fix {len(bad_products)} products with ラッコ images")

    fixed = 0
    still_bad = []

    for i, product in enumerate(bad_products):
        pid = product["id"]
        name = product["name"]
        filepath = os.path.join(IMAGES_DIR, f"{pid:03d}.jpg")

        print(f"\n[{i+1}/{len(bad_products)}] #{pid} {name[:40]}")

        # Try multiple sources
        img_url = None

        # 1. gachapara.jp search
        print("  Trying gachapara...", end=" ", flush=True)
        img_url = search_gachapara(name)
        if img_url:
            print(f"found!")
            if os.path.exists(filepath):
                os.remove(filepath)
            if download_image(img_url, filepath):
                print(f"  -> Downloaded OK")
                fixed += 1
                time.sleep(0.5)
                continue
            else:
                print(f"  -> Download failed or was ラッコ again")
                img_url = None

        # 2. gachapara with shorter name
        time.sleep(0.3)
        short_name = name.split("　")[0].split(" ")[0]
        if short_name != name and len(short_name) >= 3:
            print(f"  Trying gachapara with '{short_name}'...", end=" ", flush=True)
            img_url = search_gachapara(short_name)
            if img_url:
                print(f"found!")
                if os.path.exists(filepath):
                    os.remove(filepath)
                if download_image(img_url, filepath):
                    print(f"  -> Downloaded OK")
                    fixed += 1
                    time.sleep(0.5)
                    continue
                else:
                    img_url = None

        # 3. gacha-island detailed search
        time.sleep(0.3)
        print("  Trying gacha-island...", end=" ", flush=True)
        img_url = search_gacha_island_detailed(name)
        if img_url:
            print(f"found!")
            if os.path.exists(filepath):
                os.remove(filepath)
            if download_image(img_url, filepath):
                print(f"  -> Downloaded OK")
                fixed += 1
                time.sleep(0.5)
                continue
            else:
                img_url = None

        # 4. gacha-island with key words
        time.sleep(0.3)
        keywords = name.replace("×", " ").split()
        if len(keywords) >= 2:
            search_term = " ".join(keywords[:2])
            print(f"  Trying gacha-island with '{search_term}'...", end=" ", flush=True)
            img_url = search_gacha_island_detailed(search_term)
            if img_url:
                print(f"found!")
                if os.path.exists(filepath):
                    os.remove(filepath)
                if download_image(img_url, filepath):
                    print(f"  -> Downloaded OK")
                    fixed += 1
                    time.sleep(0.5)
                    continue
                else:
                    img_url = None

        print("  MISS - will use placeholder")
        still_bad.append(product)
        time.sleep(0.3)

    # Remove ラッコ images for still-bad products
    for product in still_bad:
        filepath = os.path.join(IMAGES_DIR, f"{product['id']:03d}.jpg")
        if os.path.exists(filepath) and os.path.getsize(filepath) == RAKKO_SIZE:
            os.remove(filepath)
            print(f"  Removed ラッコ image for #{product['id']}")

    print(f"\n{'='*60}")
    print(f"Fixed: {fixed}/{len(bad_products)}")
    print(f"Still missing: {len(still_bad)}")
    if still_bad:
        print("Missing IDs:", [p["id"] for p in still_bad])

    # Save still-bad list
    with open(os.path.join(BASE_DIR, "scripts", "still_missing.json"), "w") as f:
        json.dump([{"id": p["id"], "name": p["name"]} for p in still_bad], f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()

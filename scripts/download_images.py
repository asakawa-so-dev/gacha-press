#!/usr/bin/env python3
"""
ガチャプレス - 商品画像ダウンロードスクリプト
gachapara.jp と gacha-island.jp から商品画像を取得
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

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(BASE_DIR, "images")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

GACHAPARA_MONTHS = {
    "2026-01": "https://gachapara.jp/gachagacha-202601/",
    "2026-02": "https://gachapara.jp/gachagacha-202602/",
    "2026-03": "https://gachapara.jp/gachagacha-202603/",
}

os.makedirs(IMAGES_DIR, exist_ok=True)


def fetch_url(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  [ERR] fetch failed: {url} => {e}")
        return None


def download_image(url, filepath):
    if os.path.exists(filepath):
        return True
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            with open(filepath, "wb") as f:
                f.write(data)
            return True
    except Exception as e:
        print(f"  [ERR] download failed: {url} => {e}")
        return False


def parse_gachapara_page(html):
    """Parse gachapara page to extract product name -> image URL mapping.
    Products are in h3 tags, images are in the content before the next h3."""
    results = []

    # Find all h3 headings with product names and following images
    # Pattern: <h3...>product_name</h3> ... <img src="image_url" ...>
    # Split by h3 tags
    h3_pattern = re.compile(r'<h3[^>]*>(.*?)</h3>', re.DOTALL)
    h3_matches = list(h3_pattern.finditer(html))

    for i, match in enumerate(h3_matches):
        name_raw = match.group(1)
        # Clean HTML tags from name
        name = re.sub(r'<[^>]+>', '', name_raw).strip()
        if not name or len(name) < 2:
            continue

        # Get content between this h3 and next h3
        start = match.end()
        end = h3_matches[i + 1].start() if i + 1 < len(h3_matches) else len(html)
        section = html[start:end]

        # Find the first product image (not icon/logo) - look for wp-content/uploads
        img_pattern = re.compile(r'(https://gachapara\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?-300x300\.\w+)')
        img_match = img_pattern.search(section)

        if not img_match:
            # Try without size suffix
            img_pattern2 = re.compile(r'(https://gachapara\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?\.\w+)')
            img_match = img_pattern2.search(section)

        if img_match:
            img_url = img_match.group(1)
            results.append({"name": name, "image_url": img_url})

    return results


def normalize_name(name):
    """Normalize product name for matching."""
    name = re.sub(r'[　\s]+', ' ', name).strip()
    name = re.sub(r'[！!？?]', '', name)
    name = name.replace('（', '(').replace('）', ')')
    name = name.replace('＆', '&')
    return name.lower()


def find_best_match(product_name, scraped_items, used_indices):
    """Find best matching scraped item for a product name."""
    pn = normalize_name(product_name)

    best_score = 0
    best_idx = -1

    for idx, item in enumerate(scraped_items):
        if idx in used_indices:
            continue
        sn = normalize_name(item["name"])

        # Exact match
        if pn == sn:
            return idx, 100

        # Check if one contains the other
        if pn in sn or sn in pn:
            score = 80
            if score > best_score:
                best_score = score
                best_idx = idx
            continue

        # Check word overlap
        p_words = set(pn.split())
        s_words = set(sn.split())
        if p_words and s_words:
            common = p_words & s_words
            score = len(common) / max(len(p_words), len(s_words)) * 70
            if score > best_score:
                best_score = score
                best_idx = idx

    if best_score >= 40:
        return best_idx, best_score
    return -1, 0


def load_products():
    """Load product data from data.js."""
    data_js = os.path.join(BASE_DIR, "js", "data.js")
    with open(data_js, "r") as f:
        content = f.read()

    products = []
    pattern = re.compile(
        r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)".*?releaseMonth:\s*"([^"]+)".*?image:\s*(null|"[^"]*")\s*\}',
        re.DOTALL
    )
    for m in pattern.finditer(content):
        products.append({
            "id": int(m.group(1)),
            "name": m.group(2),
            "month": m.group(3),
            "has_image": m.group(4) != "null",
        })
    return products


def scrape_gacha_island_search(product_name):
    """Search gacha-island.jp for a product and get its image."""
    encoded = urllib.parse.quote(product_name)
    url = f"https://gacha-island.jp/?s={encoded}"
    html = fetch_url(url)
    if not html:
        return None

    # Find first result link with image
    pattern = re.compile(r'(https://gacha-island\.jp/wp-content/uploads/\d{4}/\d{2}/[^"\'<>\s]+?\.\w+)')
    match = pattern.search(html)
    if match:
        return match.group(1)
    return None


def main():
    products = load_products()
    print(f"Loaded {len(products)} products from data.js")

    # Phase 1: Scrape gachapara.jp for months 01-03
    all_scraped = {}
    for month, url in GACHAPARA_MONTHS.items():
        print(f"\n--- Fetching gachapara.jp {month} ---")
        html = fetch_url(url)
        if html:
            items = parse_gachapara_page(html)
            all_scraped[month] = items
            print(f"  Found {len(items)} items with images")
            for item in items[:3]:
                print(f"    - {item['name'][:40]}")
        else:
            all_scraped[month] = []
        time.sleep(1)

    # Also check page 2 for each month (gachapara paginates)
    for month, url in GACHAPARA_MONTHS.items():
        for page in [2, 3]:
            page_url = url.replace("/gachagacha-", f"/gachagacha-") + f"?page={page}"
            # gachapara uses /page/N/ style
            page_url = url.rstrip("/") + f"/page/{page}/"
            print(f"  Fetching page {page} for {month}...")
            html = fetch_url(page_url)
            if html:
                items = parse_gachapara_page(html)
                if items:
                    all_scraped[month].extend(items)
                    print(f"  Found {len(items)} additional items on page {page}")
            time.sleep(0.5)

    # Phase 2: Match products to scraped images and download
    image_map = {}  # product_id -> local image path
    downloaded = 0
    failed = 0

    for month in ["2026-01", "2026-02", "2026-03"]:
        scraped = all_scraped.get(month, [])
        month_products = [p for p in products if p["month"] == month]
        used_indices = set()

        print(f"\n--- Matching {month}: {len(month_products)} products, {len(scraped)} scraped ---")

        for product in month_products:
            idx, score = find_best_match(product["name"], scraped, used_indices)
            if idx >= 0:
                used_indices.add(idx)
                img_url = scraped[idx]["image_url"]
                ext = img_url.split(".")[-1].split("?")[0]
                if ext not in ("jpg", "jpeg", "png", "webp"):
                    ext = "jpg"
                filename = f"{product['id']:03d}.{ext}"
                filepath = os.path.join(IMAGES_DIR, filename)

                if download_image(img_url, filepath):
                    image_map[product["id"]] = f"images/{filename}"
                    downloaded += 1
                    print(f"  [OK] #{product['id']} {product['name'][:30]} (score:{score:.0f})")
                else:
                    failed += 1
                time.sleep(0.2)
            else:
                print(f"  [MISS] #{product['id']} {product['name'][:40]}")

    # Phase 3: For 4-6 month products, try gacha-island.jp search
    for month in ["2026-04", "2026-05", "2026-06"]:
        month_products = [p for p in products if p["month"] == month]
        print(f"\n--- Searching gacha-island.jp for {month}: {len(month_products)} products ---")

        for product in month_products:
            if product["id"] in image_map:
                continue
            img_url = scrape_gacha_island_search(product["name"])
            if img_url:
                ext = img_url.split(".")[-1].split("?")[0]
                if ext not in ("jpg", "jpeg", "png", "webp"):
                    ext = "jpg"
                filename = f"{product['id']:03d}.{ext}"
                filepath = os.path.join(IMAGES_DIR, filename)
                if download_image(img_url, filepath):
                    image_map[product["id"]] = f"images/{filename}"
                    downloaded += 1
                    print(f"  [OK] #{product['id']} {product['name'][:30]}")
                else:
                    failed += 1
            else:
                print(f"  [MISS] #{product['id']} {product['name'][:40]}")
            time.sleep(1)

    # Phase 4: For any remaining misses, try gacha-island search as fallback
    missing_products = [p for p in products if p["id"] not in image_map]
    if missing_products:
        print(f"\n--- Fallback search for {len(missing_products)} remaining products ---")
        for product in missing_products[:100]:  # limit to avoid overloading
            img_url = scrape_gacha_island_search(product["name"])
            if img_url:
                ext = img_url.split(".")[-1].split("?")[0]
                if ext not in ("jpg", "jpeg", "png", "webp"):
                    ext = "jpg"
                filename = f"{product['id']:03d}.{ext}"
                filepath = os.path.join(IMAGES_DIR, filename)
                if download_image(img_url, filepath):
                    image_map[product["id"]] = f"images/{filename}"
                    downloaded += 1
                    print(f"  [OK] #{product['id']} {product['name'][:30]}")
                else:
                    failed += 1
            else:
                print(f"  [MISS] #{product['id']} {product['name'][:40]}")
            time.sleep(0.8)

    # Save mapping
    mapping_file = os.path.join(BASE_DIR, "scripts", "image_map.json")
    with open(mapping_file, "w") as f:
        json.dump(image_map, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"Done! Downloaded: {downloaded}, Failed: {failed}")
    print(f"Total products: {len(products)}, With images: {len(image_map)}")
    print(f"Image mapping saved to: {mapping_file}")


if __name__ == "__main__":
    main()

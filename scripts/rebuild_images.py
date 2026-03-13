#!/usr/bin/env python3
"""
全商品画像を正しくマッピングして再構築する。

方針:
1. gachapara.jp の月別一覧ページを全ページ取得
2. 各商品ブロック（h3 + 直後のimg）から「商品名→画像URL」マッピングを構築
3. gacha-island.jp の個別商品ページからも補完
4. data.js の全商品と照合し、最もマッチする画像をダウンロード
5. 既存画像を全削除して、正しい画像のみで再構築
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
import unicodedata

ssl._create_default_https_context = ssl._create_unverified_context
sys.stdout.reconfigure(line_buffering=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(BASE_DIR, "images")
DATA_JS = os.path.join(BASE_DIR, "js", "data.js")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def fetch_url(url, timeout=15):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        return None


def download_image(url, filepath):
    parts = urllib.parse.urlsplit(url)
    path = urllib.parse.quote(parts.path, safe="/")
    encoded_url = urllib.parse.urlunsplit(
        (parts.scheme, parts.netloc, path, parts.query, parts.fragment)
    )
    req = urllib.request.Request(encoded_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) < 2000:
                return False
            with open(filepath, "wb") as f:
                f.write(data)
            return True
    except Exception:
        return False


def normalize(s):
    """正規化: 全角→半角、記号除去、小文字化"""
    s = unicodedata.normalize("NFKC", s)
    s = re.sub(r"[　\s]+", " ", s).strip().lower()
    s = re.sub(r"[！!？?×＆&（）()【】〜~「」『』☆★♪♫・、。,.]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def similarity(a, b):
    """2つの文字列の類似度を計算"""
    na, nb = normalize(a), normalize(b)

    if na == nb:
        return 1.0

    if na in nb or nb in na:
        return 0.9 * min(len(na), len(nb)) / max(len(na), len(nb))

    words_a = set(na.split())
    words_b = set(nb.split())
    if not words_a or not words_b:
        return 0.0

    common = words_a & words_b
    if not common:
        for wa in words_a:
            for wb in words_b:
                if wa in wb or wb in wa:
                    common.add(wa)

    if not common:
        return 0.0

    return len(common) / max(len(words_a), len(words_b))


# ============================================
# Phase 1: gachapara.jp 月別ページからマッピング構築
# ============================================

def scrape_gachapara_month(month_str):
    """gachapara.jp の月別ページから商品名→画像URLを取得"""
    results = []
    for page in range(1, 8):
        if page == 1:
            url = f"https://gachapara.jp/gachagacha-{month_str}/"
        else:
            url = f"https://gachapara.jp/gachagacha-{month_str}/page/{page}/"

        html = fetch_url(url)
        if not html:
            break

        blocks = list(re.finditer(r"<h3[^>]*>(.*?)</h3>", html, re.DOTALL))
        if not blocks:
            break

        page_count = 0
        for i, block in enumerate(blocks):
            h3_raw = re.sub(r"<[^>]+>", "", block.group(1)).strip()
            quoted = re.search(r"「(.+?)」", h3_raw)
            if quoted:
                pname = quoted.group(1)
            else:
                continue

            after = html[block.end() : block.end() + 3000]
            img = re.search(
                r"<img[^>]+src=[\"']"
                r"(https://gachapara\.jp/wp-content/uploads/\d{4}/\d{2}/[^\"'<>\s]+)"
                r"[\"']",
                after,
            )
            if img:
                img_url = img.group(1)
                if "calendar_" not in img_url and "logo" not in img_url:
                    results.append({"name": pname, "img_url": img_url})
                    page_count += 1

        if page_count == 0:
            break
        time.sleep(0.5)

    return results


# ============================================
# Phase 2: gacha-island.jp 個別商品ページからマッピング
# ============================================

def scrape_gacha_island_product(name):
    """gacha-island.jp で商品名を検索し、個別記事の商品画像を取得"""
    encoded = urllib.parse.quote(name)
    html = fetch_url(f"https://gacha-island.jp/?s={encoded}")
    if not html:
        return None

    links = re.findall(r'href="(https://gacha-island\.jp/\d+/)"', html)
    if not links:
        return None

    for link in links[:3]:
        time.sleep(0.3)
        page = fetch_url(link)
        if not page:
            continue

        title_match = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.DOTALL)
        if title_match:
            title = re.sub(r"<[^>]+>", "", title_match.group(1)).strip()
            if similarity(name, title) < 0.3:
                continue

        imgs = re.findall(
            r'src="(https://gacha-island\.jp/wp-content/uploads/20\d{2}/\d{2}/[^"]+)"',
            page,
        )
        for img_url in imgs:
            clean = img_url.split(" ")[0]
            if any(
                x in clean.lower()
                for x in [
                    "gacharakko", "logo", "favicon", "icon",
                    "cropped-", "theme", "gacha-logo",
                ]
            ):
                continue
            if any(clean.lower().endswith(e) for e in [".jpg", ".jpeg", ".png", ".webp"]):
                return clean

    return None


# ============================================
# Phase 3: data.js 読み込み
# ============================================

def load_products():
    with open(DATA_JS, "r") as f:
        content = f.read()
    products = []
    pattern = re.compile(
        r"\{\s*id:\s*(\d+),\s*name:\s*\"([^\"]+)\".*?releaseMonth:\s*\"([^\"]+)\"",
        re.DOTALL,
    )
    for m in pattern.finditer(content):
        products.append(
            {
                "id": int(m.group(1)),
                "name": m.group(2),
                "month": m.group(3),
            }
        )
    return products


# ============================================
# Phase 4: マッチング
# ============================================

def find_best_match(product_name, catalog):
    """catalogの中からproduct_nameに最もマッチするエントリを返す"""
    best_score = 0
    best_entry = None

    for entry in catalog:
        score = similarity(product_name, entry["name"])
        if score > best_score:
            best_score = score
            best_entry = entry

    if best_score >= 0.35:
        return best_entry, best_score
    return None, 0


# ============================================
# Main
# ============================================

def main():
    products = load_products()
    print(f"Total products in data.js: {len(products)}")

    # Phase 1: gachapara.jp monthly pages
    print("\n" + "=" * 60)
    print("Phase 1: Scraping gachapara.jp monthly pages")
    print("=" * 60)

    month_codes = {
        "2026-01": "202601",
        "2026-02": "202602",
        "2026-03": "202603",
        "2026-04": "202604",
        "2026-05": "202605",
        "2026-06": "202606",
    }

    gachapara_catalog = {}
    for month, code in month_codes.items():
        print(f"\n  {month}...", end=" ", flush=True)
        entries = scrape_gachapara_month(code)
        gachapara_catalog[month] = entries
        print(f"{len(entries)} products")
        time.sleep(0.5)

    total_gachapara = sum(len(v) for v in gachapara_catalog.values())
    print(f"\nTotal gachapara entries: {total_gachapara}")

    # Phase 2: Match products to gachapara catalog
    print("\n" + "=" * 60)
    print("Phase 2: Matching products to images")
    print("=" * 60)

    matched = {}  # pid -> img_url
    unmatched = []

    for product in products:
        pid = product["id"]
        name = product["name"]
        month = product["month"]

        catalog = gachapara_catalog.get(month, [])
        entry, score = find_best_match(name, catalog)

        if entry and score >= 0.35:
            matched[pid] = {
                "img_url": entry["img_url"],
                "matched_name": entry["name"],
                "score": score,
                "source": "gachapara",
            }
            catalog.remove(entry)
        else:
            unmatched.append(product)

    print(f"  Matched from gachapara: {len(matched)}")
    print(f"  Unmatched: {len(unmatched)}")

    # Phase 3: Try gacha-island for unmatched
    print("\n" + "=" * 60)
    print("Phase 3: Searching gacha-island.jp for unmatched products")
    print("=" * 60)

    still_unmatched = []
    for i, product in enumerate(unmatched):
        pid = product["id"]
        name = product["name"]
        print(f"  [{i+1}/{len(unmatched)}] #{pid} {name[:40]}...", end=" ", flush=True)

        img_url = scrape_gacha_island_product(name)
        if img_url:
            matched[pid] = {
                "img_url": img_url,
                "matched_name": name,
                "score": 0.5,
                "source": "gacha-island",
            }
            print("found!")
        else:
            words = name.replace("×", " ").replace("＆", " ").split()
            if len(words) >= 2:
                short = " ".join(words[:2])
                time.sleep(0.3)
                img_url = scrape_gacha_island_product(short)
                if img_url:
                    matched[pid] = {
                        "img_url": img_url,
                        "matched_name": name,
                        "score": 0.4,
                        "source": "gacha-island-short",
                    }
                    print(f"found (short)!")
                else:
                    print("MISS")
                    still_unmatched.append(product)
            else:
                print("MISS")
                still_unmatched.append(product)

        time.sleep(0.5)

    print(f"\n  Total matched: {len(matched)}")
    print(f"  Still unmatched: {len(still_unmatched)}")
    if still_unmatched:
        print(f"  Unmatched IDs: {[p['id'] for p in still_unmatched]}")

    # Save mapping for review
    mapping_file = os.path.join(BASE_DIR, "scripts", "image_mapping.json")
    with open(mapping_file, "w") as f:
        json.dump(
            {
                str(pid): {
                    "img_url": info["img_url"],
                    "matched_name": info["matched_name"],
                    "score": round(info["score"], 3),
                    "source": info["source"],
                }
                for pid, info in matched.items()
            },
            f,
            ensure_ascii=False,
            indent=2,
        )
    print(f"\nMapping saved to {mapping_file}")

    # Phase 4: Download images
    print("\n" + "=" * 60)
    print("Phase 4: Downloading images")
    print("=" * 60)

    # Remove ALL existing jpg images
    removed = 0
    for f in os.listdir(IMAGES_DIR):
        if f.endswith(".jpg"):
            os.remove(os.path.join(IMAGES_DIR, f))
            removed += 1
    print(f"  Removed {removed} existing images")

    downloaded = 0
    failed = []
    for pid, info in sorted(matched.items()):
        filepath = os.path.join(IMAGES_DIR, f"{pid:03d}.jpg")
        img_url = info["img_url"]

        success = download_image(img_url, filepath)
        if success:
            downloaded += 1
        else:
            failed.append(pid)

        if downloaded % 50 == 0 and downloaded > 0:
            print(f"  Downloaded {downloaded}...")

        time.sleep(0.2)

    print(f"\n  Downloaded: {downloaded}")
    print(f"  Failed: {len(failed)}")
    if failed:
        print(f"  Failed IDs: {failed}")

    # Phase 5: Update data.js
    print("\n" + "=" * 60)
    print("Phase 5: Updating data.js")
    print("=" * 60)

    with open(DATA_JS, "r") as f:
        content = f.read()

    updated = 0
    for product in products:
        pid = product["id"]
        filepath = os.path.join(IMAGES_DIR, f"{pid:03d}.jpg")

        if os.path.exists(filepath) and os.path.getsize(filepath) > 2000:
            img_path = f"images/{pid:03d}.jpg"
        else:
            img_path = None

        old_pattern = re.compile(
            rf'(id: {pid}, name: "[^"]+".+?)image:\s*(?:null|"[^"]*")',
            re.DOTALL,
        )
        match = old_pattern.search(content)
        if match:
            if img_path:
                new_val = f'{match.group(1)}image: "{img_path}"'
            else:
                new_val = f"{match.group(1)}image: null"
            content = content[: match.start()] + new_val + content[match.end() :]
            updated += 1

    with open(DATA_JS, "w") as f:
        f.write(content)

    img_set = len([f for f in os.listdir(IMAGES_DIR) if f.endswith(".jpg")])
    null_count = content.count("image: null")
    has_image = content.count('image: "images/')

    print(f"  Updated {updated} products in data.js")
    print(f"  With image: {has_image}")
    print(f"  Null image: {null_count}")
    print(f"  JPG files: {img_set}")

    # Print sample matches for verification
    print("\n" + "=" * 60)
    print("Sample matches for verification:")
    print("=" * 60)
    import random
    sample_pids = random.sample(list(matched.keys()), min(20, len(matched)))
    for pid in sorted(sample_pids):
        info = matched[pid]
        product = next(p for p in products if p["id"] == pid)
        print(f"  #{pid} [{info['source']}] score={info['score']:.2f}")
        print(f"    data.js: {product['name'][:50]}")
        print(f"    matched: {info['matched_name'][:50]}")
        print(f"    img: ...{info['img_url'][-50:]}")
        print()


if __name__ == "__main__":
    main()

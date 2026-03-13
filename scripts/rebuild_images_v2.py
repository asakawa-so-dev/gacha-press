#!/usr/bin/env python3
"""
全商品画像を個別記事ページから正確に取得して再構築する。

方針:
1. gachapara.jp 月別ページから「商品名 → 個別記事URL」マッピングを構築
2. 各記事ページにアクセスし、最初のwp-content/uploads画像を取得（=商品画像）
3. data.js の商品名と照合してダウンロード
4. 未マッチ分は gacha-island.jp で補完
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
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def fetch_url(url, timeout=15):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except:
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
    except:
        return False


def normalize(s):
    s = unicodedata.normalize("NFKC", s)
    s = re.sub(r"[　\s]+", " ", s).strip().lower()
    s = re.sub(r"[！!？?×＆&（）()【】〜~「」『』☆★♪♫・、。,.②③④⑤⑥⑦⑧⑨⑩]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def similarity(a, b):
    na, nb = normalize(a), normalize(b)
    if na == nb:
        return 1.0
    if na in nb or nb in na:
        return 0.85 * min(len(na), len(nb)) / max(len(na), len(nb))
    words_a = set(na.split())
    words_b = set(nb.split())
    if not words_a or not words_b:
        return 0.0
    common = words_a & words_b
    if not common:
        for wa in words_a:
            for wb in words_b:
                if len(wa) >= 3 and len(wb) >= 3 and (wa in wb or wb in wa):
                    common.add(wa)
    return len(common) / max(len(words_a), len(words_b)) if common else 0.0


def get_article_product_image(article_url):
    """記事ページから最初の商品画像URLを取得"""
    html = fetch_url(article_url)
    if not html:
        return None

    imgs = re.findall(
        r'<img[^>]+src=["\']([^"\']+)["\']', html
    )
    for img_url in imgs:
        if "wp-content/uploads" not in img_url:
            continue
        if any(
            x in img_url.lower()
            for x in [
                "logo", "icon", "favicon", "gravatar",
                "calendar_", "btn_", "common/", "theme",
            ]
        ):
            continue
        if any(img_url.lower().endswith(e) for e in [".jpg", ".jpeg", ".png", ".webp"]):
            return img_url

    return None


# ============================================
# Phase 1: gachapara.jp月別→記事URL取得
# ============================================

def scrape_gachapara_articles(month_str):
    """月別ページから [{ name, article_url }] を取得"""
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
        for block in blocks:
            h3_inner = block.group(0)
            h3_text = re.sub(r"<[^>]+>", "", block.group(1)).strip()

            quoted = re.search(r"「(.+?)」", h3_text)
            if not quoted:
                continue
            pname = quoted.group(1)

            link = re.search(r'href="([^"]+)"', h3_inner)
            if not link:
                continue
            article_url = link.group(1)

            if article_url.startswith("https://gachapara.jp/") and re.search(r"/\d+/$", article_url):
                results.append({"name": pname, "article_url": article_url})
                page_count += 1

        if page_count == 0:
            break
        time.sleep(0.5)

    return results


# ============================================
# gacha-island fallback
# ============================================

def gacha_island_article_image(name):
    """gacha-island.jp個別記事の商品画像を取得"""
    encoded = urllib.parse.quote(name)
    html = fetch_url(f"https://gacha-island.jp/?s={encoded}")
    if not html:
        return None

    links = re.findall(r'href="(https://gacha-island\.jp/\d+/)"', html)
    for link in links[:3]:
        time.sleep(0.3)
        page = fetch_url(link)
        if not page:
            continue

        title_m = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.DOTALL)
        if title_m:
            title = re.sub(r"<[^>]+>", "", title_m.group(1)).strip()
            if similarity(name, title) < 0.3:
                continue

        imgs = re.findall(
            r'src="(https://gacha-island\.jp/wp-content/uploads/20\d{2}/\d{2}/[^"]+)"',
            page,
        )
        for img_url in imgs:
            clean = img_url.split(" ")[0]
            if any(x in clean.lower() for x in ["gacharakko", "logo", "icon", "cropped-", "theme", "gacha-logo"]):
                continue
            if any(clean.lower().endswith(e) for e in [".jpg", ".jpeg", ".png", ".webp"]):
                return clean

    return None


# ============================================
# Main
# ============================================

def load_products():
    with open(DATA_JS, "r") as f:
        content = f.read()
    products = []
    pattern = re.compile(
        r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)".*?releaseMonth:\s*"([^"]+)"',
        re.DOTALL,
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
    print(f"Total products: {len(products)}")

    # Phase 1: 月別ページから記事URLを取得
    print("\n" + "=" * 60)
    print("Phase 1: Collecting article URLs from monthly pages")
    print("=" * 60)

    month_codes = {
        "2026-01": "202601",
        "2026-02": "202602",
        "2026-03": "202603",
        "2026-04": "202604",
        "2026-05": "202605",
        "2026-06": "202606",
    }

    all_articles = {}  # month -> [{ name, article_url }]
    for month, code in month_codes.items():
        print(f"  {month}...", end=" ", flush=True)
        articles = scrape_gachapara_articles(code)
        all_articles[month] = articles
        print(f"{len(articles)} articles")
        time.sleep(0.5)

    total = sum(len(v) for v in all_articles.values())
    print(f"Total articles: {total}")

    # Phase 2: マッチング（商品名→記事URL）
    print("\n" + "=" * 60)
    print("Phase 2: Matching products to articles")
    print("=" * 60)

    product_matches = {}  # pid -> { article_url, matched_name, score }
    unmatched = []

    for product in products:
        pid = product["id"]
        name = product["name"]
        month = product["month"]

        articles = all_articles.get(month, [])

        best_score = 0
        best_article = None
        for art in articles:
            score = similarity(name, art["name"])
            if score > best_score:
                best_score = score
                best_article = art

        if best_article and best_score >= 0.4:
            product_matches[pid] = {
                "article_url": best_article["article_url"],
                "matched_name": best_article["name"],
                "score": best_score,
            }
            articles.remove(best_article)
        else:
            unmatched.append(product)

    print(f"  Matched: {len(product_matches)}")
    print(f"  Unmatched: {len(unmatched)}")

    # Phase 3: 各記事ページから画像URL取得 + ダウンロード
    print("\n" + "=" * 60)
    print("Phase 3: Fetching images from article pages")
    print("=" * 60)

    # Remove all existing jpg images
    removed = 0
    for f in os.listdir(IMAGES_DIR):
        if f.endswith(".jpg"):
            os.remove(os.path.join(IMAGES_DIR, f))
            removed += 1
    print(f"  Removed {removed} existing images")

    downloaded = 0
    failed_article = []
    image_mapping = {}  # pid -> { img_url, source }

    sorted_matches = sorted(product_matches.items())
    for i, (pid, info) in enumerate(sorted_matches):
        filepath = os.path.join(IMAGES_DIR, f"{pid:03d}.jpg")
        article_url = info["article_url"]

        img_url = get_article_product_image(article_url)
        if img_url and download_image(img_url, filepath):
            downloaded += 1
            image_mapping[pid] = {"img_url": img_url, "source": "gachapara-article"}
        else:
            failed_article.append(pid)

        if (i + 1) % 30 == 0:
            print(f"  Progress: {i+1}/{len(sorted_matches)} (downloaded: {downloaded})")

        time.sleep(0.25)

    print(f"\n  Downloaded from articles: {downloaded}")
    print(f"  Failed articles: {len(failed_article)}")

    # Phase 4: gacha-island for unmatched + failed
    print("\n" + "=" * 60)
    print("Phase 4: gacha-island.jp fallback")
    print("=" * 60)

    fallback_products = unmatched + [
        next(p for p in products if p["id"] == pid)
        for pid in failed_article
    ]
    print(f"  Products to search: {len(fallback_products)}")

    gi_downloaded = 0
    still_missing = []

    for i, product in enumerate(fallback_products):
        pid = product["id"]
        name = product["name"]
        filepath = os.path.join(IMAGES_DIR, f"{pid:03d}.jpg")

        if os.path.exists(filepath) and os.path.getsize(filepath) > 2000:
            continue

        print(f"  [{i+1}/{len(fallback_products)}] #{pid} {name[:40]}...", end=" ", flush=True)

        img_url = gacha_island_article_image(name)
        if img_url and download_image(img_url, filepath):
            gi_downloaded += 1
            image_mapping[pid] = {"img_url": img_url, "source": "gacha-island"}
            print("found!")
        else:
            words = name.replace("×", " ").replace("＆", " ").split()
            if len(words) >= 2:
                short = " ".join(words[:2])
                time.sleep(0.3)
                img_url = gacha_island_article_image(short)
                if img_url and download_image(img_url, filepath):
                    gi_downloaded += 1
                    image_mapping[pid] = {"img_url": img_url, "source": "gacha-island-short"}
                    print("found (short)!")
                else:
                    print("MISS")
                    still_missing.append(product)
            else:
                print("MISS")
                still_missing.append(product)

        time.sleep(0.5)

    print(f"\n  Downloaded from gacha-island: {gi_downloaded}")
    print(f"  Still missing: {len(still_missing)}")
    if still_missing:
        print(f"  Missing IDs: {[p['id'] for p in still_missing]}")

    # Phase 5: data.js 更新
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

    img_count = len([f for f in os.listdir(IMAGES_DIR) if f.endswith(".jpg")])
    null_count = content.count("image: null")
    has_image = content.count('image: "images/')

    print(f"  Updated: {updated}")
    print(f"  With image: {has_image}")
    print(f"  Null: {null_count}")
    print(f"  JPG files: {img_count}")

    # Save mapping for verification
    mapping = {}
    for pid, info in sorted(product_matches.items()):
        product = next(p for p in products if p["id"] == pid)
        mapping[str(pid)] = {
            "product_name": product["name"],
            "matched_to": info["matched_name"],
            "score": round(info["score"], 3),
            "article_url": info["article_url"],
            "source": image_mapping.get(pid, {}).get("source", "unknown"),
        }
    for pid, info in image_mapping.items():
        if str(pid) not in mapping:
            product = next(p for p in products if p["id"] == pid)
            mapping[str(pid)] = {
                "product_name": product["name"],
                "matched_to": product["name"],
                "score": 0.5,
                "article_url": "",
                "source": info["source"],
            }

    with open(os.path.join(BASE_DIR, "scripts", "image_mapping_v2.json"), "w") as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)

    # Verification samples
    print("\n" + "=" * 60)
    print("Verification samples (10 random):")
    print("=" * 60)
    import random
    sample_pids = random.sample([p["id"] for p in products if os.path.exists(os.path.join(IMAGES_DIR, f"{p['id']:03d}.jpg"))], min(10, img_count))
    for pid in sorted(sample_pids):
        product = next(p for p in products if p["id"] == pid)
        info = mapping.get(str(pid), {})
        print(f"  #{pid}: {product['name'][:45]}")
        print(f"    matched: {info.get('matched_to', '?')[:45]}")
        print(f"    score: {info.get('score', '?')}, source: {info.get('source', '?')}")
        print(f"    article: {info.get('article_url', '?')}")
        print()


if __name__ == "__main__":
    main()

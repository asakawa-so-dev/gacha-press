#!/usr/bin/env python3
"""
Verify and fix maker assignments by scraping gachapara.jp article pages.
Strategy:
1. Fetch monthly listing pages (?m=YYYYMM, paginated)
2. Collect all article URLs + titles
3. For each product in data.js, find best-matching article
4. Fetch article page and extract 発売元 (maker)
5. Compare with current maker and log mismatches
"""

import re, json, time, ssl, sys, unicodedata
import urllib.request, urllib.parse

ssl._create_default_https_context = ssl._create_unverified_context

def fetch(url, timeout=15):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")

def normalize(s):
    s = unicodedata.normalize("NFKC", s)
    s = re.sub(r'[\s　]+', '', s)
    s = s.lower()
    s = re.sub(r'[！!？?…・、。,.\-\―\~\～]', '', s)
    return s

def similarity(a, b):
    na, nb = normalize(a), normalize(b)
    if na == nb:
        return 1.0
    if na in nb or nb in na:
        return 0.9
    words_a = set(re.findall(r'[\w]{2,}', na))
    words_b = set(re.findall(r'[\w]{2,}', nb))
    if not words_a or not words_b:
        return 0.0
    overlap = len(words_a & words_b)
    return overlap / max(len(words_a), len(words_b))

def load_data():
    with open("js/data.js", encoding="utf-8") as f:
        content = f.read()
    products = []
    for m in re.finditer(
        r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)".*?maker:\s*"([^"]+)".*?releaseMonth:\s*"([^"]+)"',
        content
    ):
        products.append({
            "id": int(m.group(1)),
            "name": m.group(2),
            "maker": m.group(3),
            "month": m.group(4),
        })
    if not products:
        for m in re.finditer(
            r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)".*?releaseMonth:\s*"([^"]+)".*?maker:\s*"([^"]+)"',
            content
        ):
            products.append({
                "id": int(m.group(1)),
                "name": m.group(2),
                "maker": m.group(4),
                "month": m.group(3),
            })
    return products

def scrape_monthly_articles(year_month):
    """Fetch all articles from gachapara monthly page(s)."""
    articles = []
    page = 1
    while True:
        url = f"https://gachapara.jp/?m={year_month}"
        if page > 1:
            url += f"&paged={page}"
        try:
            html = fetch(url)
        except Exception as e:
            if "404" in str(e) and page > 1:
                break
            print(f"    Error page {page}: {e}", flush=True)
            break

        found = re.findall(
            r'<a[^>]*href="(https://gachapara\.jp/\d+/)"[^>]*title="([^"]*)"',
            html
        )
        if not found:
            found2 = re.findall(
                r'<h2[^>]*class="entry-title"[^>]*>\s*<a[^>]*href="(https://gachapara\.jp/\d+/)"[^>]*>(.*?)</a>',
                html, re.DOTALL
            )
            for u, t in found2:
                clean_t = re.sub(r'<[^>]+>', '', t).strip()
                found.append((u, clean_t))

        if not found:
            break

        seen_urls = set(a[0] for a in articles)
        new_count = 0
        for url, title in found:
            if url not in seen_urls:
                clean_title = re.sub(r'【[^】]*】', '', title).strip()
                clean_title = re.sub(r'カプセルトイ「([^」]+)」.*', r'\1', clean_title)
                articles.append((url, clean_title, title))
                seen_urls.add(url)
                new_count += 1

        if new_count == 0:
            break
        page += 1
        time.sleep(0.5)

    return articles

def extract_maker_from_article(url):
    """Fetch article page and extract maker (発売元)."""
    try:
        html = fetch(url)
    except Exception:
        return None

    patterns = [
        r'発売元[：:\s]*(?:株式会社)?([^\n<]{2,30})',
        r'メーカー[：:\s]*(?:株式会社)?([^\n<]{2,30})',
    ]
    for pat in patterns:
        m = re.search(pat, html)
        if m:
            maker = m.group(1).strip()
            maker = re.sub(r'^株式会社\s*', '', maker)
            maker = re.sub(r'\s*$', '', maker)
            if maker and len(maker) > 1:
                return maker
    return None

MAKER_ALIASES = {
    "タカラトミーアーツ": ["タカラトミーアーツ", "T-ARTS", "TAKARA TOMY A.R.T.S"],
    "バンダイ": ["バンダイ", "BANDAI", "BANDAI NAMCO"],
    "ケンエレファント": ["ケンエレファント", "Kenelephant"],
    "キタンクラブ": ["キタンクラブ", "KITAN CLUB"],
    "ブシロードクリエイティブ": ["ブシロードクリエイティブ", "BUSHIROAD CREATIVE"],
    "ブシロード": ["ブシロード", "BUSHIROAD"],
    "SO-TA": ["SO-TA", "ソータ", "SOTA"],
    "TOYS CABIN": ["TOYS CABIN", "トイズキャビン"],
    "J.DREAM": ["J.DREAM", "ジェイドリーム"],
    "IP4": ["IP4", "アイピーフォー"],
    "エスケイジャパン": ["エスケイジャパン", "SK JAPAN"],
}

def normalize_maker(maker_str):
    """Normalize a scraped maker name to our canonical name."""
    n = normalize(maker_str)
    for canonical, aliases in MAKER_ALIASES.items():
        for alias in aliases:
            if normalize(alias) == n or n in normalize(alias) or normalize(alias) in n:
                return canonical
    return maker_str.strip()

def main():
    products = load_data()
    print(f"Loaded {len(products)} products", flush=True)

    all_articles = {}
    for ym in ["202601", "202602", "202603", "202604", "202605", "202606"]:
        print(f"Scraping gachapara.jp month {ym}...", flush=True)
        arts = scrape_monthly_articles(ym)
        print(f"  Found {len(arts)} articles", flush=True)
        for url, title, raw in arts:
            all_articles[url] = {"title": title, "raw": raw}
        time.sleep(1)

    print(f"\nTotal articles: {len(all_articles)}", flush=True)

    article_list = [(url, info["title"], info["raw"]) for url, info in all_articles.items()]

    matches = {}
    for product in products:
        best_score = 0
        best_art = None
        for url, title, raw in article_list:
            s1 = similarity(product["name"], title)
            s2 = similarity(product["name"], raw)
            score = max(s1, s2)
            if score > best_score:
                best_score = score
                best_art = (url, title, raw)
        if best_score >= 0.35 and best_art:
            matches[product["id"]] = {
                "article_url": best_art[0],
                "article_title": best_art[1],
                "score": best_score,
            }

    print(f"Matched {len(matches)}/{len(products)} products to articles", flush=True)

    mismatches = []
    checked = 0
    for product in products:
        pid = product["id"]
        if pid not in matches:
            continue

        art_url = matches[pid]["article_url"]
        scraped_maker = extract_maker_from_article(art_url)
        checked += 1
        if checked % 20 == 0:
            print(f"  Checked {checked} articles...", flush=True)

        if not scraped_maker:
            time.sleep(0.3)
            continue

        canonical = normalize_maker(scraped_maker)
        if normalize(canonical) != normalize(product["maker"]):
            mismatches.append({
                "id": pid,
                "name": product["name"],
                "current_maker": product["maker"],
                "correct_maker": canonical,
                "scraped_raw": scraped_maker,
                "article_url": art_url,
                "score": matches[pid]["score"],
            })
            print(f"  MISMATCH #{pid} {product['name']}: {product['maker']} -> {canonical}", flush=True)

        time.sleep(0.3)

    print(f"\n=== RESULTS ===", flush=True)
    print(f"Checked: {checked}", flush=True)
    print(f"Mismatches: {len(mismatches)}", flush=True)

    for mm in mismatches:
        print(f"  #{mm['id']} {mm['name']}", flush=True)
        print(f"    {mm['current_maker']} -> {mm['correct_maker']} (raw: {mm['scraped_raw']})", flush=True)

    with open("scripts/maker_fixes.json", "w", encoding="utf-8") as f:
        json.dump(mismatches, f, ensure_ascii=False, indent=2)
    print(f"\nSaved to scripts/maker_fixes.json", flush=True)

if __name__ == "__main__":
    main()

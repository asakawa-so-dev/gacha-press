#!/usr/bin/env python3
"""data.js の image: null を実際の画像パスに更新"""

import json
import re
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(BASE_DIR, "scripts", "image_map.json"), "r") as f:
    image_map = json.load(f)

data_js_path = os.path.join(BASE_DIR, "js", "data.js")
with open(data_js_path, "r") as f:
    content = f.read()

updated = 0
for product_id, img_path in image_map.items():
    img_file = os.path.join(BASE_DIR, img_path)
    if not os.path.exists(img_file):
        continue
    pattern = rf'(id: {product_id}, name: "[^"]*".*?)image: null'
    replacement = rf'\1image: "{img_path}"'
    new_content = re.sub(pattern, replacement, content, count=1)
    if new_content != content:
        content = new_content
        updated += 1

with open(data_js_path, "w") as f:
    f.write(content)

print(f"Updated {updated} products with image paths")

still_null = content.count("image: null")
print(f"Remaining with image: null = {still_null}")

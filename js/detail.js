/* ========================================
   ガチャプレス - 商品詳細ページ
   ======================================== */

const MONTH_LABELS_D = {
  "2026-01": "2026年1月",
  "2026-02": "2026年2月",
  "2026-03": "2026年3月",
  "2026-04": "2026年4月",
  "2026-05": "2026年5月",
  "2026-06": "2026年6月",
};

const INTEREST_STORAGE_KEY = "gacha_press_interest";

function getProductId() {
  return parseInt(new URLSearchParams(window.location.search).get("id"), 10);
}

function getProduct(id) {
  return GACHA_DATA.find((g) => g.id === id);
}

function getInterestIds() {
  try { return JSON.parse(localStorage.getItem(INTEREST_STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function setInterest(id, add) {
  let ids = getInterestIds();
  if (add) { if (!ids.includes(id)) ids.push(id); }
  else { ids = ids.filter((x) => x !== id); }
  localStorage.setItem(INTEREST_STORAGE_KEY, JSON.stringify(ids));
}

function isInterested(id) { return getInterestIds().includes(id); }

function renderDetail(product) {
  const wrap = document.getElementById("detailContent");
  if (!product) {
    wrap.innerHTML = `
      <div class="detail-notfound">
        <div class="detail-notfound-title">商品が見つかりません</div>
        <div class="detail-notfound-text">お探しの商品は存在しないか、削除された可能性があります。</div>
        <a href="index.html" class="detail-back-btn">カレンダーに戻る</a>
      </div>
    `;
    return;
  }

  const interested = isInterested(product.id);
  const imgSrc = product.image || "";
  const imageHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${product.name}">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--ink-muted);">No Image</div>`;
  const interestCount = typeof getRankingCount === "function" ? getRankingCount(product.id, "interest") : 0;
  const purchasedCount = typeof getRankingCount === "function" ? getRankingCount(product.id, "purchased") : 0;

  wrap.innerHTML = `
    <div class="detail-layout">
      <div class="detail-gallery">
        <div class="detail-image-wrap">
          ${imageHtml}
          ${product.isNew ? '<span class="detail-new-badge">NEW</span>' : ""}
        </div>
      </div>
      <div class="detail-info">
        <div class="detail-tags">
          <span class="detail-tag detail-tag-genre">${product.genre}</span>
          <span class="detail-tag detail-tag-maker">${product.maker}</span>
          <span class="detail-tag detail-tag-lineup">全${product.lineup}種</span>
        </div>
        <h1 class="detail-title">${product.name}</h1>
        <div class="detail-meta">
          <div class="detail-price">&yen;${product.price}<small> / 1回</small></div>
          <div class="detail-release">${MONTH_LABELS_D[product.releaseMonth] || product.releaseMonth}発売</div>
        </div>
        <p class="detail-description">${product.description}</p>

        <div class="detail-actions">
          <button type="button" class="detail-btn detail-btn-interest ${interested ? "active" : ""}"
            data-track="interest" data-product-id="${product.id}" data-product-name="${product.name}">
            <span class="detail-btn-text">${interested ? "気になる済み" : "気になる"}</span>
            ${interestCount > 0 ? `<span class="detail-btn-count">${interestCount}</span>` : ""}
          </button>
          <button type="button" class="detail-btn detail-btn-purchased"
            data-track="purchased" data-product-id="${product.id}" data-product-name="${product.name}">
            <span class="detail-btn-text">買った</span>
            ${purchasedCount > 0 ? `<span class="detail-btn-count">${purchasedCount}</span>` : ""}
          </button>
          <button type="button" class="detail-btn detail-btn-share"
            data-track="share" data-product-id="${product.id}" data-product-name="${product.name}">
            <span class="detail-btn-text">共有</span>
          </button>
        </div>
      </div>
    </div>
    <div class="detail-footer-actions">
      <a href="index.html" class="detail-back-link">&larr; カレンダーに戻る</a>
    </div>
  `;

  setupDetailButtonHandlers();
}

function setupDetailButtonHandlers() {
  const container = document.getElementById("detailContent");
  if (!container || container._clickBound) return;
  container._clickBound = true;

  container.addEventListener("click", function(e) {
    const btn = e.target.closest("button[data-track]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const action = btn.getAttribute("data-track");
    const productId = btn.getAttribute("data-product-id");
    const productName = btn.getAttribute("data-product-name");
    const pid = parseInt(productId, 10);
    const product = getProduct(pid);

    if (action === "interest") {
      const was = isInterested(pid);
      setInterest(pid, !was);
      if (!was && typeof incrementRanking === "function") incrementRanking(pid, "interest");
      if (was && typeof decrementRanking === "function") decrementRanking(pid, "interest");
      if (typeof trackButtonClick === "function")
        trackButtonClick(was ? "interest_remove" : "interest_add", "気になる", productId, productName);
      if (product) renderDetail(product);
      return;
    }

    if (action === "share") {
      if (typeof trackButtonClick === "function")
        trackButtonClick("share_click", "共有", productId, productName);
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: productName + " | ガチャプレス", text: productName, url }).catch(() => copyUrl(url));
      } else {
        copyUrl(url);
      }
      return;
    }

    if (action === "purchased") {
      if (typeof incrementRanking === "function") incrementRanking(pid, "purchased");
      if (typeof trackButtonClick === "function")
        trackButtonClick("purchased_click", "買った", productId, productName);
      btn.classList.add("active");
      const text = btn.querySelector(".detail-btn-text");
      if (text) text.textContent = "買った！";
      return;
    }
  });
}

function copyUrl(url) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => alert("URLをコピーしました"));
  } else {
    prompt("URLをコピーしてください:", url);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getProductId();
  const product = getProduct(id);
  document.title = product ? `${product.name} | ガチャプレス` : "商品が見つかりません | ガチャプレス";
  renderDetail(product);
  if (product && typeof trackButtonClick === "function")
    trackButtonClick("detail_page_view", "詳細表示", String(product.id), product.name);
});

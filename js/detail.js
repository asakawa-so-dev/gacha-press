/* ========================================
   ガチャプレス - 商品詳細ページ
   ======================================== */

const MONTH_LABELS = {
  "2026-03": "2026年3月",
  "2026-04": "2026年4月",
  "2026-05": "2026年5月",
  "2026-06": "2026年6月",
};

const GENRE_ICONS = { キャラクター: "🎭", ミニチュア: "🏠", 動物: "🐾", 推し活: "💖" };

const INTEREST_STORAGE_KEY = "gacha_press_interest";

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("id"), 10);
}

function getProduct(id) {
  return GACHA_DATA.find((g) => g.id === id);
}

function getInterestIds() {
  try {
    return JSON.parse(localStorage.getItem(INTEREST_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setInterest(id, add) {
  let ids = getInterestIds();
  if (add) {
    if (!ids.includes(id)) ids.push(id);
  } else {
    ids = ids.filter((x) => x !== id);
  }
  localStorage.setItem(INTEREST_STORAGE_KEY, JSON.stringify(ids));
}

function isInterested(id) {
  return getInterestIds().includes(id);
}

function renderDetail(product) {
  if (!product) {
    document.getElementById("detailContent").innerHTML = `
      <div class="detail-notfound">
        <div class="detail-notfound-icon">🔍</div>
        <div class="detail-notfound-title">商品が見つかりません</div>
        <div class="detail-notfound-text">お探しの商品は存在しないか、削除された可能性があります。</div>
        <a href="index.html" class="detail-back-btn">カレンダーに戻る</a>
      </div>
    `;
    return;
  }

  const interested = isInterested(product.id);
  const imageHtml = product.image
    ? `<img src="${product.image}" alt="${product.name}">`
    : `<div class="detail-noimg">${GENRE_ICONS[product.genre] || "📦"}</div>`;

  document.getElementById("detailContent").innerHTML = `
    <div class="detail-layout">
      <div class="detail-gallery">
        <div class="detail-image-wrap">
          ${imageHtml}
          ${product.isNew ? '<span class="detail-new-badge">NEW</span>' : ""}
        </div>
      </div>
      <div class="detail-info">
        <div class="detail-tags">
          <span class="detail-tag detail-tag-genre">${GENRE_ICONS[product.genre] || ""} ${product.genre}</span>
          <span class="detail-tag detail-tag-maker">${product.maker}</span>
          <span class="detail-tag detail-tag-lineup">全${product.lineup}種</span>
        </div>
        <h1 class="detail-title">${product.name}</h1>
        <div class="detail-meta">
          <div class="detail-price">¥${product.price}<small> / 1回</small></div>
          <div class="detail-release">📅 発売：${MONTH_LABELS[product.releaseMonth] || product.releaseMonth}</div>
        </div>
        <p class="detail-description">${product.description}</p>

        <div class="detail-actions">
          <button type="button" class="detail-btn detail-btn-interest ${interested ? "active" : ""}" 
            data-track="interest" data-product-id="${product.id}" data-product-name="${product.name}">
            <span class="detail-btn-icon">${interested ? "❤️" : "🤍"}</span>
            <span class="detail-btn-text">${interested ? "気になる済み" : "気になる"}</span>
          </button>
          <button type="button" class="detail-btn detail-btn-remind" 
            data-track="remind" data-product-id="${product.id}" data-product-name="${product.name}">
            <span class="detail-btn-icon">⏰</span>
            <span class="detail-btn-text">リマインドする</span>
          </button>
          <button type="button" class="detail-btn detail-btn-share" 
            data-track="share" data-product-id="${product.id}" data-product-name="${product.name}">
            <span class="detail-btn-icon">🔗</span>
            <span class="detail-btn-text">共有する</span>
          </button>
          <button type="button" class="detail-btn detail-btn-purchased" 
            data-track="purchased" data-product-id="${product.id}" data-product-name="${product.name}">
            <span class="detail-btn-icon">✅</span>
            <span class="detail-btn-text">買った</span>
          </button>
        </div>
      </div>
    </div>
    <div class="detail-footer-actions">
      <a href="index.html" class="detail-back-link">← カレンダーに戻る</a>
    </div>
  `;

  setupDetailButtonHandlers();
}

function setupDetailButtonHandlers() {
  const container = document.getElementById("detailContent");
  if (!container || container._clickBound) return;
  container._clickBound = true;

  container.addEventListener("click", function handleBtnClick(e) {
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
      const wasInterested = isInterested(pid);
      setInterest(pid, !wasInterested);
      if (typeof trackButtonClick === "function") {
        trackButtonClick(wasInterested ? "interest_remove" : "interest_add", "気になる", productId, productName);
      }
      if (product) renderDetail(product);
      return;
    }

    if (action === "remind") {
      if (typeof trackButtonClick === "function") {
        trackButtonClick("remind_click", "リマインドする", productId, productName);
      }
      alert("リマインド機能は準備中です。発売日に近づいたら通知をお届けする予定です！");
      return;
    }

    if (action === "share") {
      if (typeof trackButtonClick === "function") {
        trackButtonClick("share_click", "共有する", productId, productName);
      }
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: productName + " | ガチャプレス",
          text: productName,
          url,
        }).catch(() => copyUrl(url));
      } else {
        copyUrl(url);
      }
      return;
    }

    if (action === "purchased") {
      if (typeof trackButtonClick === "function") {
        trackButtonClick("purchased_click", "買った", productId, productName);
      }
      btn.classList.add("active");
      const textEl = btn.querySelector(".detail-btn-text");
      if (textEl) textEl.textContent = "買った！";
      return;
    }
  });
}

function copyUrl(url) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      alert("URLをコピーしました！");
    });
  } else {
    prompt("URLをコピーしてください:", url);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getProductId();
  const product = getProduct(id);
  document.title = product ? `${product.name} | ガチャプレス` : "商品が見つかりません | ガチャプレス";
  renderDetail(product);
  if (product && typeof trackButtonClick === "function") {
    trackButtonClick("detail_page_view", "商品詳細表示", String(product.id), product.name);
  }
});

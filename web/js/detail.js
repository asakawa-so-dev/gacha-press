/* ========================================
   カプる。 - 商品詳細ページ
   ======================================== */

const MONTH_LABELS_D = {
  "2026-01": "2026年1月",
  "2026-02": "2026年2月",
  "2026-03": "2026年3月",
  "2026-04": "2026年4月",
  "2026-05": "2026年5月",
  "2026-06": "2026年6月",
};

function getProductId() {
  return parseInt(new URLSearchParams(window.location.search).get("id"), 10);
}

function getProduct(id) {
  return GACHA_DATA.find((g) => g.id === id);
}

function renderDetail(product) {
  const wrap = document.getElementById("detailContent");
  if (!product) {
    wrap.innerHTML = `
      <div class="detail-notfound">
        <div class="detail-notfound-title">商品が見つかりません</div>
        <div class="detail-notfound-text">お探しの商品は存在しないか、削除された可能性があります。</div>
        <a href="index.html" class="detail-back-btn">さがすに戻る</a>
      </div>
    `;
    return;
  }

  const liked = typeof isLiked === "function" && isLiked(product.id);
  const imgSrc = product.image || (typeof getPlaceholderForGenre === "function" ? getPlaceholderForGenre(product.genre) : "images/placeholder_character.svg");
  const fallback = typeof getPlaceholderForGenre === "function" ? getPlaceholderForGenre(product.genre) : "images/placeholder_character.svg";
  const imageHtml = `<img src="${imgSrc}" alt="${product.name}" onerror="this.onerror=null;this.src='${fallback}'">`;
  const interestCount = typeof getRankingCount === "function" ? getRankingCount(product.id, "interest") : 0;
  const purchasedCount = typeof getRankingCount === "function" ? getRankingCount(product.id, "purchased") : 0;

  const heartSvg = `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  const checkSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const shareSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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

        <div class="detail-reactions">
          <button type="button" class="reaction-btn reaction-like${liked ? ' active' : ''}"
            data-action="like" data-product-id="${product.id}">
            <span class="reaction-icon">${heartSvg}</span>
            <span class="reaction-label">${liked ? '気になる済み' : '気になる'}</span>
            ${interestCount > 0 ? `<span class="reaction-count">${interestCount}</span>` : ''}
          </button>
          <button type="button" class="reaction-btn reaction-bought"
            data-action="bought" data-product-id="${product.id}">
            <span class="reaction-icon">${checkSvg}</span>
            <span class="reaction-label">買った</span>
            ${purchasedCount > 0 ? `<span class="reaction-count">${purchasedCount}</span>` : ''}
          </button>
          <button type="button" class="reaction-btn reaction-share"
            data-action="share" data-product-id="${product.id}" data-product-name="${product.name}">
            <span class="reaction-icon">${shareSvg}</span>
          </button>
        </div>
      </div>
    </div>
    <div class="detail-footer-actions">
      <a href="index.html" class="detail-back-link">&larr; さがすに戻る</a>
    </div>
  `;

  setupReactionHandlers();
}

function setupReactionHandlers() {
  const container = document.getElementById("detailContent");
  if (!container || container._reactionsBound) return;
  container._reactionsBound = true;

  container.addEventListener("click", function(e) {
    const btn = e.target.closest(".reaction-btn");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const action = btn.dataset.action;
    const pid = parseInt(btn.dataset.productId, 10);
    const product = getProduct(pid);

    if (action === "like") {
      var user = null;
      try { user = JSON.parse(localStorage.getItem("gacha_auth_user")); } catch(ex) {}
      if (!user) {
        window.location.href = "mypage.html";
        return;
      }

      if (typeof toggleLike === "function") {
        var added = toggleLike(pid);
        if (added) {
          btn.classList.add("pop");
          setTimeout(function() { btn.classList.remove("pop"); }, 400);
          if (typeof capHapticMedium === "function") capHapticMedium();
        }
      }
      if (typeof trackButtonClick === "function") {
        var was = btn.classList.contains("active");
        trackButtonClick(was ? "interest_remove" : "interest_add", "気になる", String(pid), product ? product.name : "");
      }
      if (product) renderDetail(product);
      return;
    }

    if (action === "bought") {
      if (typeof incrementRanking === "function") incrementRanking(pid, "purchased");
      if (typeof trackButtonClick === "function")
        trackButtonClick("purchased_click", "買った", String(pid), product ? product.name : "");
      btn.classList.add("active");
      btn.classList.add("pop");
      if (typeof capHapticSuccess === "function") capHapticSuccess();
      var label = btn.querySelector(".reaction-label");
      if (label) label.textContent = "買った！";
      setTimeout(function() { btn.classList.remove("pop"); }, 400);

      var countEl = btn.querySelector(".reaction-count");
      var newCount = typeof getRankingCount === "function" ? getRankingCount(pid, "purchased") : 0;
      if (countEl) {
        countEl.textContent = newCount;
      } else if (newCount > 0) {
        var span = document.createElement("span");
        span.className = "reaction-count";
        span.textContent = newCount;
        btn.appendChild(span);
      }
      return;
    }

    if (action === "share") {
      var productName = btn.dataset.productName || "";
      if (typeof trackButtonClick === "function")
        trackButtonClick("share_click", "共有", String(pid), productName);
      if (typeof capHapticLight === "function") capHapticLight();
      var url = window.location.href;
      if (typeof capShare === "function") {
        capShare(productName + " | カプる。", productName, url).then(function() {}).catch(function() { copyUrl(url); });
      } else if (navigator.share) {
        navigator.share({ title: productName + " | カプる。", text: productName, url: url }).catch(function() { copyUrl(url); });
      } else {
        copyUrl(url);
      }
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
  document.title = product ? `${product.name} | カプる。` : "商品が見つかりません | カプる。";
  renderDetail(product);
  if (product && typeof trackButtonClick === "function")
    trackButtonClick("detail_page_view", "詳細表示", String(product.id), product.name);
});

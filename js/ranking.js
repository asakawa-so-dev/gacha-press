/* ========================================
   カプる。 - ランキングページ
   ======================================== */

let activeTab = "interest";

function renderRanking() {
  const container = document.getElementById("rankingList");
  if (!container) return;

  const ranked = getTopRanked(activeTab, 15);

  if (ranked.length === 0) {
    container.innerHTML = `
      <div class="ranking-empty">
        <div class="ranking-empty-title">ランキングデータがありません</div>
        <div class="ranking-empty-text">商品ページで「気になる」「買った」を押すとランキングに反映されます。</div>
        <a href="index.html" class="ranking-empty-link">カレンダーを見る</a>
      </div>
    `;
    return;
  }

  container.innerHTML = ranked.map((entry, i) => {
    const product = GACHA_DATA.find((g) => g.id === entry.id);
    if (!product) return "";

    const imgSrc = product.image || (typeof getPlaceholderForGenre === "function" ? getPlaceholderForGenre(product.genre) : "images/placeholder_character.svg");
    const fallback = typeof getPlaceholderForGenre === "function" ? getPlaceholderForGenre(product.genre) : "images/placeholder_character.svg";
    const imageHtml = `<img src="${imgSrc}" alt="${product.name}" class="ranking-item-img" onerror="this.onerror=null;this.src='${fallback}'">`;

    const interestCount = getRankingCount(product.id, "interest");
    const purchasedCount = getRankingCount(product.id, "purchased");
    const isTop3 = i < 3;

    return `
      <a href="detail.html?id=${product.id}" class="ranking-item ${isTop3 ? "ranking-item-top" : ""}">
        <div class="ranking-item-rank ${isTop3 ? "rank-top" : ""}">
          <span class="ranking-num">${i + 1}</span>
        </div>
        <div class="ranking-item-image">${imageHtml}</div>
        <div class="ranking-item-body">
          <div class="ranking-item-name">${product.name}</div>
          <div class="ranking-item-tags">
            <span class="ranking-item-tag">${product.genre}</span>
            <span class="ranking-item-tag">${product.maker}</span>
            <span class="ranking-item-tag">&yen;${product.price}</span>
          </div>
          <div class="ranking-item-counts">
            <span class="ranking-count ${activeTab === "interest" ? "highlight-interest" : ""}">気になる <strong>${interestCount}</strong></span>
            <span class="ranking-count ${activeTab === "purchased" ? "highlight-purchased" : ""}">買った <strong>${purchasedCount}</strong></span>
          </div>
        </div>
        <div class="ranking-item-bar">
          <div class="ranking-bar-fill bar-${activeTab}" style="width: ${Math.min(100, (entry.count / ranked[0].count) * 100)}%"></div>
        </div>
      </a>
    `;
  }).join("");
}

function setupTabs() {
  document.querySelectorAll(".ranking-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".ranking-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeTab = tab.dataset.tab;
      renderRanking();
    });
  });
}

function setupScrollTopRanking() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 300);
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  ensureDemoRanking();
  setupTabs();
  renderRanking();
  setupScrollTopRanking();
});

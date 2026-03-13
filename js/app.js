/* ========================================
   ガチャプレス - メインアプリケーション
   ======================================== */

const GENRE_ICONS = {
  キャラクター: "🎭",
  ミニチュア: "🏠",
  動物: "🐾",
  推し活: "💖",
};

const CARD_EMOJIS = {
  キャラクター: "✨",
  ミニチュア: "🔍",
  動物: "🐱",
  推し活: "💗",
};

const MONTH_LABELS = {
  "2026-03": "2026年 3月",
  "2026-04": "2026年 4月",
  "2026-05": "2026年 5月",
  "2026-06": "2026年 6月",
};

// ── State ──
const state = {
  selectedMonth: null,
  selectedGenre: null,
  selectedPrice: null,
  selectedMaker: null,
  sortBy: "month-asc",
};

// ── Initialize ──
document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderFilters();
  renderCards();
  setupScrollTop();
  setupSortSelect();
});

// ── Stats ──
function renderStats() {
  const el = document.getElementById("heroStats");
  const thisMonth = GACHA_DATA.filter((g) => g.releaseMonth === "2026-03").length;
  el.innerHTML = `
    <div class="hero-stat">
      <span class="hero-stat-icon">🎯</span>
      <div>
        <div class="hero-stat-num">${GACHA_DATA.length}</div>
        <div class="hero-stat-label">登録商品数</div>
      </div>
    </div>
    <div class="hero-stat">
      <span class="hero-stat-icon">🆕</span>
      <div>
        <div class="hero-stat-num">${thisMonth}</div>
        <div class="hero-stat-label">今月の新商品</div>
      </div>
    </div>
    <div class="hero-stat">
      <span class="hero-stat-icon">🏭</span>
      <div>
        <div class="hero-stat-num">${MAKERS.length}</div>
        <div class="hero-stat-label">メーカー</div>
      </div>
    </div>
  `;
}

// ── Filters ──
function renderFilters() {
  renderFilterPills("monthPills", MONTHS, "month", (v) => MONTH_LABELS[v] || v);
  renderFilterPills("genrePills", GENRES, "genre", (v) => `${GENRE_ICONS[v] || "📦"} ${v}`);
  renderFilterPills("pricePills", PRICES, "price", (v) => `¥${v}`);
  renderFilterPills("makerPills", MAKERS, "maker");
}

function renderFilterPills(containerId, items, group, labelFn) {
  const container = document.getElementById(containerId);
  container.innerHTML = items
    .map((item) => {
      const label = labelFn ? labelFn(item) : item;
      return `<button class="filter-pill" data-filter-group="${group}" data-value="${item}">${label}</button>`;
    })
    .join("");

  container.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.addEventListener("click", () => toggleFilter(group, pill.dataset.value, pill));
  });
}

function toggleFilter(group, value, pill) {
  const key = `selected${group.charAt(0).toUpperCase() + group.slice(1)}`;

  if (state[key] === value) {
    state[key] = null;
    pill.classList.remove("active");
  } else {
    const container = pill.parentElement;
    container.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
    state[key] = value;
    pill.classList.add("active");
  }

  renderCards();
}

function clearFilters() {
  state.selectedMonth = null;
  state.selectedGenre = null;
  state.selectedPrice = null;
  state.selectedMaker = null;

  document.querySelectorAll(".filter-pill.active").forEach((p) => p.classList.remove("active"));
  renderCards();
}

// ── Sort ──
function setupSortSelect() {
  const select = document.getElementById("sortSelect");
  if (!select) return;
  select.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderCards();
  });
}

function sortData(data) {
  const sorted = [...data];
  switch (state.sortBy) {
    case "month-asc":
      return sorted.sort((a, b) => a.releaseMonth.localeCompare(b.releaseMonth));
    case "month-desc":
      return sorted.sort((a, b) => b.releaseMonth.localeCompare(a.releaseMonth));
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    default:
      return sorted;
  }
}

// ── Filter Logic ──
function getFilteredData() {
  return GACHA_DATA.filter((item) => {
    if (state.selectedMonth && item.releaseMonth !== state.selectedMonth) return false;
    if (state.selectedGenre && item.genre !== state.selectedGenre) return false;
    if (state.selectedPrice && item.price !== Number(state.selectedPrice)) return false;
    if (state.selectedMaker && item.maker !== state.selectedMaker) return false;
    return true;
  });
}

// ── Render Cards ──
function renderCards() {
  const container = document.getElementById("cardContainer");
  const filtered = getFilteredData();
  const sorted = sortData(filtered);

  document.getElementById("resultsCount").innerHTML = `<strong>${sorted.length}</strong> 件の商品`;

  if (sorted.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">該当する商品がありません</div>
        <div class="empty-text">フィルター条件を変更してお試しください</div>
      </div>
    `;
    return;
  }

  if (state.sortBy.startsWith("month")) {
    renderGroupedByMonth(container, sorted);
  } else {
    container.innerHTML = `<div class="card-grid">${sorted.map(renderCard).join("")}</div>`;
  }
}

function renderGroupedByMonth(container, data) {
  const groups = {};
  data.forEach((item) => {
    if (!groups[item.releaseMonth]) groups[item.releaseMonth] = [];
    groups[item.releaseMonth].push(item);
  });

  const months = Object.keys(groups).sort(
    state.sortBy === "month-desc" ? (a, b) => b.localeCompare(a) : (a, b) => a.localeCompare(b)
  );

  container.innerHTML = months
    .map(
      (month) => `
      <div class="month-group">
        <div class="month-header">
          <span class="month-badge">📅 ${MONTH_LABELS[month] || month}</span>
          <span class="month-count">${groups[month].length}件</span>
        </div>
        <div class="card-grid">
          ${groups[month].map(renderCard).join("")}
        </div>
      </div>
    `
    )
    .join("");
}

function renderCard(item) {
  const emoji = CARD_EMOJIS[item.genre] || "📦";
  const imageHtml = item.image
    ? `<div class="card-image"><img src="${item.image}" alt="${item.name}" loading="lazy"><span class="card-image-emoji">${emoji}</span></div>`
    : `<div class="card-image"><span class="card-image-emoji-only">${emoji}</span></div>`;
  return `
    <a href="detail.html?id=${item.id}" class="gacha-card">
      ${item.isNew ? '<div class="card-new-badge">NEW</div>' : ""}
      ${imageHtml}
      <div class="card-body">
        <div class="card-tags">
          <span class="card-tag tag-genre">${GENRE_ICONS[item.genre] || ""} ${item.genre}</span>
          <span class="card-tag tag-maker">${item.maker}</span>
          <span class="card-tag tag-lineup">全${item.lineup}種</span>
        </div>
        <div class="card-title">${item.name}</div>
        <div class="card-description">${item.description}</div>
        <div class="card-footer">
          <div class="card-price">¥${item.price}<small> /回</small></div>
          <div class="card-release">${MONTH_LABELS[item.releaseMonth] || item.releaseMonth}</div>
        </div>
      </div>
    </a>
  `;
}

// ── Scroll to Top ──
function setupScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 300);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

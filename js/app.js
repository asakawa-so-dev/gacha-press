/* ========================================
   ガチャプレス - メインアプリケーション
   ======================================== */

const GENRE_ICONS = {
  キャラクター: "🎭",
  ミニチュア: "🏠",
  動物: "🐾",
  フィギュア: "🎨",
  おもしろ: "🤣",
  推し活: "💖",
};

const CARD_EMOJIS = {
  キャラクター: "✨",
  ミニチュア: "🔍",
  動物: "🐱",
  フィギュア: "🗿",
  おもしろ: "🎉",
  推し活: "💗",
};

const MONTH_LABELS = {
  "2026-01": "2026年 1月",
  "2026-02": "2026年 2月",
  "2026-03": "2026年 3月",
  "2026-04": "2026年 4月",
  "2026-05": "2026年 5月",
  "2026-06": "2026年 6月",
};

const GENRE_PLACEHOLDERS = {
  キャラクター: "images/placeholder_character.svg",
  ミニチュア: "images/placeholder_miniature.svg",
  動物: "images/placeholder_animal.svg",
  フィギュア: "images/placeholder_figure.svg",
  おもしろ: "images/placeholder_fun.svg",
  推し活: "images/placeholder_oshi.svg",
};

function getProductImage(item) {
  return item.image || GENRE_PLACEHOLDERS[item.genre] || "images/placeholder_character.svg";
}

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
  if (typeof ensureDemoRanking === "function") ensureDemoRanking();
  renderStats();
  renderCarousel();
  renderFilters();
  renderCards();
  setupScrollTop();
  setupSortSelect();
  setupFilterModal();
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
  const imgSrc = getProductImage(item);
  const imageHtml = `<div class="card-image"><img src="${imgSrc}" alt="${item.name}" loading="lazy"><span class="card-image-emoji">${emoji}</span></div>`;
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

// ── Carousel ──
function renderCarousel() {
  const track = document.getElementById("carouselTrack");
  const dotsEl = document.getElementById("carouselDots");
  if (!track || typeof getTopRanked !== "function") return;

  const top = getTopRanked("interest", 5);
  if (top.length === 0) return;

  const items = top.map((entry, i) => {
    const product = GACHA_DATA.find((g) => g.id === entry.id);
    if (!product) return "";
    const emoji = CARD_EMOJIS[product.genre] || "📦";
    const imgSrc = getProductImage(product);
    const imageHtml = `<img src="${imgSrc}" alt="${product.name}" class="carousel-img">`;
    return `
      <a href="detail.html?id=${product.id}" class="carousel-slide">
        <div class="carousel-rank">${i + 1}</div>
        <div class="carousel-slide-img">${imageHtml}</div>
        <div class="carousel-slide-info">
          <div class="carousel-slide-name">${product.name}</div>
          <div class="carousel-slide-meta">
            <span class="carousel-stat">🤍 ${entry.count}</span>
            <span class="carousel-stat">✅ ${typeof getRankingCount === "function" ? getRankingCount(product.id, "purchased") : 0}</span>
          </div>
          <div class="carousel-slide-price">¥${product.price}</div>
        </div>
      </a>
    `;
  });

  track.innerHTML = items.join("");

  const slides = track.querySelectorAll(".carousel-slide");
  const count = slides.length;
  if (count === 0) return;

  dotsEl.innerHTML = Array.from({ length: count }, (_, i) =>
    `<button class="carousel-dot ${i === 0 ? "active" : ""}" data-idx="${i}"></button>`
  ).join("");

  let current = 0;
  let autoTimer;

  function goTo(idx) {
    current = ((idx % count) + count) % count;
    const slideWidth = slides[0].offsetWidth + 16;
    track.style.transform = `translateX(-${current * slideWidth}px)`;
    dotsEl.querySelectorAll(".carousel-dot").forEach((d, i) =>
      d.classList.toggle("active", i === current)
    );
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), 3500);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  dotsEl.addEventListener("click", (e) => {
    const dot = e.target.closest(".carousel-dot");
    if (!dot) return;
    goTo(parseInt(dot.dataset.idx, 10));
    startAuto();
  });

  track.closest(".carousel-wrapper").addEventListener("mouseenter", stopAuto);
  track.closest(".carousel-wrapper").addEventListener("mouseleave", startAuto);

  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });
  track.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
    startAuto();
  }, { passive: true });

  startAuto();
}

// ── Filter Modal (Mobile) ──
function setupFilterModal() {
  const toggleBtn = document.getElementById("filterToggleBtn");
  const closeBtn = document.getElementById("filterCloseBtn");
  const overlay = document.getElementById("filterOverlay");
  const section = document.getElementById("filterSection");
  if (!toggleBtn || !section) return;

  function openFilter() {
    overlay.classList.add("active");
    overlay.style.display = "block";
    requestAnimationFrame(() => {
      section.classList.add("modal-open");
    });
    document.body.style.overflow = "hidden";
  }

  function closeFilter() {
    section.classList.remove("modal-open");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => {
      overlay.style.display = "none";
    }, 350);
  }

  toggleBtn.addEventListener("click", openFilter);
  if (closeBtn) closeBtn.addEventListener("click", closeFilter);
  if (overlay) overlay.addEventListener("click", closeFilter);
}

// ── Gacha Loading Transition ──
function setupGachaTransition() {
  document.addEventListener("click", handleGachaClick, true);
  document.addEventListener("touchend", handleGachaTouch, { passive: false });
}

let gachaNavigating = false;

function handleGachaTouch(e) {
  const card = e.target.closest("a.gacha-card");
  if (!card || gachaNavigating) return;
  e.preventDefault();
  triggerGachaTransition(card);
}

function handleGachaClick(e) {
  const card = e.target.closest("a.gacha-card");
  if (!card || gachaNavigating) return;
  e.preventDefault();
  e.stopPropagation();
  triggerGachaTransition(card);
}

function triggerGachaTransition(card) {
  if (gachaNavigating) return;
  gachaNavigating = true;
  const href = card.getAttribute("href");
  const overlay = document.getElementById("gachaLoading");
  if (!overlay) {
    window.location.href = href;
    return;
  }
  overlay.classList.add("active");
  setTimeout(() => {
    window.location.href = href;
  }, 2000);
}

setupGachaTransition();

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

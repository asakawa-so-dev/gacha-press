/* ========================================
   カプる。 - メインアプリケーション
   ======================================== */

const MONTH_LABELS = {
  "2026-01": "1月",
  "2026-02": "2月",
  "2026-03": "3月",
  "2026-04": "4月",
  "2026-05": "5月",
  "2026-06": "6月",
};

const MONTH_LABELS_LONG = {
  "2026-01": "2026年 1月",
  "2026-02": "2026年 2月",
  "2026-03": "2026年 3月",
  "2026-04": "2026年 4月",
  "2026-05": "2026年 5月",
  "2026-06": "2026年 6月",
};

function getProductImage(item) {
  return item.image || "";
}

const state = {
  selectedMonth: null,
  selectedGenre: null,
  selectedPrice: null,
  selectedMaker: null,
  searchQuery: "",
  sortBy: "month-asc",
};

document.addEventListener("DOMContentLoaded", () => {
  if (typeof ensureDemoRanking === "function") ensureDemoRanking();
  renderStats();
  renderCarousel();
  renderFilters();
  renderCards();
  setupScrollTop();
  setupSortSelect();
  setupFilterModal();
  setupSearch();
});

window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    const overlay = document.getElementById("gachaLoading");
    if (overlay) overlay.classList.remove("active");
    gachaNavigating = false;
  }
});

// ── Stats ──
function renderStats() {
  const el = document.getElementById("heroStats");
  if (!el) return;
  const thisMonth = GACHA_DATA.filter((g) => g.releaseMonth === "2026-03").length;
  el.innerHTML = `
    <span class="page-stat"><strong>${GACHA_DATA.length}</strong>件</span>
    <span class="page-stat">今月 <strong>${thisMonth}</strong>件</span>
    <span class="page-stat"><strong>${MAKERS.length}</strong>メーカー</span>
  `;
}

// ── Filters ──
function renderFilters() {
  renderFilterPills("monthPills", MONTHS, "month", (v) => MONTH_LABELS[v] || v);
  renderFilterPills("genrePills", GENRES, "genre");
  renderFilterPills("pricePills", PRICES, "price", (v) => `¥${v}`);
  renderFilterPills("makerPills", MAKERS, "maker");
}

function renderFilterPills(containerId, items, group, labelFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
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
  state.searchQuery = "";
  document.querySelectorAll(".filter-pill.active").forEach((p) => p.classList.remove("active"));
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  updateSearchClearVisibility();
  renderCards();
}

// ── Search ──
function setupSearch() {
  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("searchClear");
  if (!input) return;

  let debounceTimer;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.searchQuery = input.value.trim();
      updateSearchClearVisibility();
      renderCards();
    }, 200);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      state.searchQuery = "";
      updateSearchClearVisibility();
      renderCards();
      input.focus();
    });
  }
  updateSearchClearVisibility();
}

function updateSearchClearVisibility() {
  const clearBtn = document.getElementById("searchClear");
  if (clearBtn) clearBtn.style.display = state.searchQuery ? "flex" : "none";
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
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const haystack = [item.name, item.maker, item.genre, item.description || "", item.lineup || ""]
        .join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

// ── Render Cards ──
function renderCards() {
  const container = document.getElementById("cardContainer");
  if (!container) return;
  const filtered = getFilteredData();
  const sorted = sortData(filtered);

  const countEl = document.getElementById("resultsCount");
  if (countEl) countEl.innerHTML = `<strong>${sorted.length}</strong> 件`;

  if (sorted.length === 0) {
    const hint = state.searchQuery
      ? `「${state.searchQuery}」に一致する商品が見つかりません`
      : "該当する商品がありません";
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">-</div>
        <div class="empty-title">${hint}</div>
        <div class="empty-text">条件を変更してお試しください</div>
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
          <span class="month-badge">${MONTH_LABELS_LONG[month] || month}</span>
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
  const imgSrc = getProductImage(item);
  const hasImage = !!imgSrc;
  const imageHtml = hasImage
    ? `<div class="card-image"><img src="${imgSrc}" alt="${item.name}" loading="lazy"></div>`
    : `<div class="card-image"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--ink-muted);">No Image</div></div>`;

  return `
    <a href="detail.html?id=${item.id}" class="gacha-card">
      ${item.isNew ? '<div class="card-new-badge">NEW</div>' : ""}
      ${imageHtml}
      <div class="card-body">
        <div class="card-tags">
          <span class="card-tag">${item.genre}</span>
          <span class="card-tag">${item.maker}</span>
        </div>
        <div class="card-title">${item.name}</div>
        <div class="card-footer">
          <div class="card-price">&yen;${item.price}<small> /回</small></div>
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
    const imgSrc = getProductImage(product);
    const imageHtml = imgSrc
      ? `<img src="${imgSrc}" alt="${product.name}" class="carousel-img">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--ink-muted);font-size:11px;">No Image</div>`;
    const purchased = typeof getRankingCount === "function" ? getRankingCount(product.id, "purchased") : 0;

    return `
      <a href="detail.html?id=${product.id}" class="carousel-slide">
        <div class="carousel-slide-img">${imageHtml}</div>
        <div class="carousel-slide-info">
          <div class="carousel-slide-name">${product.name}</div>
          <div class="carousel-slide-meta">
            <span class="carousel-stat">気になる ${entry.count}</span>
            <span class="carousel-stat">買った ${purchased}</span>
          </div>
          <div class="carousel-slide-price">&yen;${product.price}</div>
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
    const slideWidth = slides[0].offsetWidth + 12;
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

  const wrapper = track.closest(".carousel-wrapper");
  if (wrapper) {
    wrapper.addEventListener("mouseenter", stopAuto);
    wrapper.addEventListener("mouseleave", startAuto);
  }

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
    if (overlay) {
      overlay.style.display = "block";
      requestAnimationFrame(() => overlay.classList.add("active"));
    }
    requestAnimationFrame(() => section.classList.add("modal-open"));
    document.body.style.overflow = "hidden";
  }

  function closeFilter() {
    section.classList.remove("modal-open");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => { if (overlay) overlay.style.display = "none"; }, 350);
  }

  toggleBtn.addEventListener("click", openFilter);
  if (closeBtn) closeBtn.addEventListener("click", closeFilter);
  if (overlay) overlay.addEventListener("click", closeFilter);
}

// ── Gacha Loading Transition ──
let gachaNavigating = false;
let touchStartPos = null;
const TAP_THRESHOLD = 12;

document.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  touchStartPos = { x: t.clientX, y: t.clientY };
}, { passive: true });

function handleGachaTouch(e) {
  const card = e.target.closest("a.gacha-card") || e.target.closest("a.carousel-slide");
  if (!card || gachaNavigating) return;

  if (touchStartPos) {
    const t = e.changedTouches[0];
    const dx = Math.abs(t.clientX - touchStartPos.x);
    const dy = Math.abs(t.clientY - touchStartPos.y);
    if (dx > TAP_THRESHOLD || dy > TAP_THRESHOLD) return;
  }

  e.preventDefault();
  triggerGachaTransition(card);
}

function handleGachaClick(e) {
  if ("ontouchend" in document) return;
  const card = e.target.closest("a.gacha-card") || e.target.closest("a.carousel-slide");
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
  startCapsuleAnimation();
  setTimeout(() => { window.location.href = href; }, 2700);
}

document.addEventListener("click", handleGachaClick, true);
document.addEventListener("touchend", handleGachaTouch, { passive: false });

// ── Capsule Loading Animation ──
function startCapsuleAnimation() {
  const overlay = document.getElementById("gachaLoading");
  if (!overlay) return;
  const capsuleWrap = overlay.querySelector(".capsule-wrap");
  const topHalf = overlay.querySelector(".capsule-top");
  const glowSeam = overlay.querySelector(".capsule-glow-seam");
  const starEl = overlay.querySelector(".capsule-star");
  const burstEl = overlay.querySelector(".capsule-burst");
  const progressBar = overlay.querySelector(".capsule-progress-fill");
  const statusText = overlay.querySelector(".capsule-status");
  const ambientGlow = overlay.querySelector(".capsule-ambient");

  capsuleWrap.classList.remove("twist", "open");
  if (glowSeam) glowSeam.classList.remove("visible");
  if (starEl) starEl.classList.remove("visible");
  if (burstEl) burstEl.innerHTML = "";
  if (progressBar) progressBar.style.width = "0%";
  if (statusText) statusText.textContent = "読み込み中";
  if (ambientGlow) ambientGlow.style.opacity = "0";

  requestAnimationFrame(() => {
    capsuleWrap.classList.add("twist");
    animateProgress(progressBar, 0, 60, 900);

    setTimeout(() => {
      capsuleWrap.classList.remove("twist");
      capsuleWrap.classList.add("open");
      if (glowSeam) glowSeam.classList.add("visible");
      if (statusText) statusText.textContent = "";
      animateProgress(progressBar, 60, 80, 600);
    }, 900);

    setTimeout(() => {
      if (starEl) starEl.classList.add("visible");
      if (ambientGlow) ambientGlow.style.opacity = "1";
      generateBurst(burstEl);
      generateSparkles(burstEl);
      animateProgress(progressBar, 80, 100, 300);
    }, 1500);
  });
}

function animateProgress(el, from, to, duration) {
  if (!el) return;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    el.style.width = (from + (to - from) * t) + "%";
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function generateBurst(container) {
  if (!container) return;
  const colors = ["#3daae0", "#f58520", "#f5c800", "#2888c0"];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * 360 + Math.random() * 20;
    const rad = angle * Math.PI / 180;
    const dist = 40 + Math.random() * 60;
    const tx = Math.cos(rad) * dist;
    const ty = Math.sin(rad) * dist;
    const size = 3 + Math.random() * 5;
    const dot = document.createElement("div");
    dot.className = "burst-dot";
    dot.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${colors[i % 4]};--tx:${tx}px;--ty:${ty}px;animation-delay:${Math.random() * 0.2}s;`;
    container.appendChild(dot);
  }
}

function generateSparkles(container) {
  if (!container) return;
  const colors = ["#3daae0", "#f58520", "#f5c800", "#2888c0"];
  for (let i = 0; i < 6; i++) {
    const sp = document.createElement("div");
    sp.className = "sparkle-dot";
    sp.textContent = "·";
    sp.style.cssText = `left:${-50 + Math.random() * 100}px;top:${-70 + Math.random() * 80}px;font-size:${12 + Math.random() * 12}px;color:${colors[i % 4]};animation-delay:${Math.random() * 0.5}s;`;
    container.appendChild(sp);
  }
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

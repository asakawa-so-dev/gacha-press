/* ========================================
   カプる。 - ランキングページ
   ジャンル別 × 期間フィルター
   ======================================== */

var rankingState = {
  genre: "all",
  period: "all",
};

var RANKING_GENRES = ["all"].concat(typeof GENRES !== "undefined" ? GENRES : []);
var RANKING_PERIODS = [
  { key: "daily", label: "日間" },
  { key: "weekly", label: "週間" },
  { key: "monthly", label: "月間" },
  { key: "yearly", label: "年間" },
  { key: "all", label: "すべて" },
];

function renderRankingFilters() {
  var genreWrap = document.getElementById("rankingGenrePills");
  var periodWrap = document.getElementById("rankingPeriodPills");
  if (!genreWrap || !periodWrap) return;

  genreWrap.innerHTML = RANKING_GENRES.map(function (g) {
    var label = g === "all" ? "すべて" : g;
    var active = rankingState.genre === g ? " active" : "";
    return '<button class="ranking-fpill' + active + '" data-genre="' + g + '">' + label + '</button>';
  }).join("");

  periodWrap.innerHTML = RANKING_PERIODS.map(function (p) {
    var active = rankingState.period === p.key ? " active" : "";
    return '<button class="ranking-fpill' + active + '" data-period="' + p.key + '">' + p.label + '</button>';
  }).join("");

  genreWrap.querySelectorAll(".ranking-fpill").forEach(function (btn) {
    btn.addEventListener("click", function () {
      rankingState.genre = btn.dataset.genre;
      renderRankingFilters();
      renderRanking();
    });
  });

  periodWrap.querySelectorAll(".ranking-fpill").forEach(function (btn) {
    btn.addEventListener("click", function () {
      rankingState.period = btn.dataset.period;
      renderRankingFilters();
      renderRanking();
    });
  });
}

function getFilteredRanking(limit) {
  var data = getRankingData();
  var entries = Object.entries(data)
    .map(function (pair) {
      return { id: parseInt(pair[0], 10), count: pair[1].interest || 0 };
    })
    .filter(function (e) { return e.count > 0; });

  if (rankingState.genre !== "all") {
    entries = entries.filter(function (e) {
      var product = GACHA_DATA.find(function (g) { return g.id === e.id; });
      return product && product.genre === rankingState.genre;
    });
  }

  entries.sort(function (a, b) { return b.count - a.count; });
  return entries.slice(0, limit || 20);
}

function renderRanking() {
  var container = document.getElementById("rankingList");
  if (!container) return;

  var ranked = getFilteredRanking(20);

  if (ranked.length === 0) {
    container.innerHTML =
      '<div class="ranking-empty">' +
        '<div class="ranking-empty-title">該当するランキングがありません</div>' +
        '<div class="ranking-empty-text">条件を変えてお試しください。</div>' +
      '</div>';
    return;
  }

  var topCount = ranked[0].count;
  container.innerHTML = ranked.map(function (entry, i) {
    var product = GACHA_DATA.find(function (g) { return g.id === entry.id; });
    if (!product) return "";

    var imgSrc = product.image || (typeof getPlaceholderForGenre === "function" ? getPlaceholderForGenre(product.genre) : "images/placeholder_character.svg");
    var fallback = typeof getPlaceholderForGenre === "function" ? getPlaceholderForGenre(product.genre) : "images/placeholder_character.svg";
    var isTop3 = i < 3;

    var interestCount = getRankingCount(product.id, "interest");
    var purchasedCount = getRankingCount(product.id, "purchased");

    return '<a href="detail.html?id=' + product.id + '" class="ranking-item' + (isTop3 ? " ranking-item-top" : "") + '">' +
      '<div class="ranking-item-rank' + (isTop3 ? " rank-top" : "") + '"><span class="ranking-num">' + (i + 1) + '</span></div>' +
      '<div class="ranking-item-image"><img src="' + imgSrc + '" alt="' + product.name + '" class="ranking-item-img" onerror="this.onerror=null;this.src=\'' + fallback + '\'"></div>' +
      '<div class="ranking-item-body">' +
        '<div class="ranking-item-name">' + product.name + '</div>' +
        '<div class="ranking-item-tags">' +
          '<span class="ranking-item-tag">' + product.genre + '</span>' +
          '<span class="ranking-item-tag">' + product.maker + '</span>' +
          '<span class="ranking-item-tag">&yen;' + product.price + '</span>' +
        '</div>' +
        '<div class="ranking-item-counts">' +
          '<span class="ranking-count highlight-interest">気になる <strong>' + interestCount + '</strong></span>' +
          '<span class="ranking-count">買った <strong>' + purchasedCount + '</strong></span>' +
        '</div>' +
      '</div>' +
      '<div class="ranking-item-bar"><div class="ranking-bar-fill bar-interest" style="width:' + Math.min(100, (entry.count / topCount) * 100) + '%"></div></div>' +
    '</a>';
  }).join("");
}

function setupScrollTopRanking() {
  var btn = document.getElementById("scrollTopBtn");
  if (!btn) return;
  window.addEventListener("scroll", function () {
    btn.classList.toggle("visible", window.scrollY > 300);
  });
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  ensureDemoRanking();
  renderRankingFilters();
  renderRanking();
  setupScrollTopRanking();
});

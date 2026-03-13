/* ========================================
   ガチャプレス - イベント計測 + ランキングモジュール
   ======================================== */

const GACHA_TRACK = {
  send(action, label, params = {}) {
    const event = {
      action,
      label: label || "",
      ...params,
      timestamp: new Date().toISOString(),
      page: window.location.pathname || "index",
    };

    if (typeof console !== "undefined" && console.debug) {
      console.debug("[GachaTrack]", event);
    }

    try {
      const log = JSON.parse(sessionStorage.getItem("gacha_track_log") || "[]");
      log.push(event);
      if (log.length > 100) log.shift();
      sessionStorage.setItem("gacha_track_log", JSON.stringify(log));
    } catch (e) {}

    if (typeof gtag === "function") {
      gtag("event", action, {
        event_category: "engagement",
        event_label: label,
        ...params,
      });
    }

    window.dispatchEvent(
      new CustomEvent("gacha_track", { detail: event })
    );
  },
};

function trackButtonClick(action, label, productId, productName) {
  GACHA_TRACK.send(action, label, {
    product_id: productId,
    product_name: productName,
  });
}

/* ── ランキングデータ管理（localStorage） ── */
const RANKING_STORAGE_KEY = "gacha_press_ranking";

function getRankingData() {
  try {
    return JSON.parse(localStorage.getItem(RANKING_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveRankingData(data) {
  localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(data));
}

function incrementRanking(productId, type) {
  const data = getRankingData();
  const key = String(productId);
  if (!data[key]) data[key] = { interest: 0, purchased: 0 };
  data[key][type] = (data[key][type] || 0) + 1;
  saveRankingData(data);
}

function decrementRanking(productId, type) {
  const data = getRankingData();
  const key = String(productId);
  if (!data[key]) return;
  data[key][type] = Math.max(0, (data[key][type] || 0) - 1);
  saveRankingData(data);
}

function getRankingCount(productId, type) {
  const data = getRankingData();
  const entry = data[String(productId)];
  return entry ? (entry[type] || 0) : 0;
}

function getTopRanked(type, limit) {
  const data = getRankingData();
  const entries = Object.entries(data)
    .map(([id, counts]) => ({ id: parseInt(id, 10), count: counts[type] || 0 }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit || 10);
  return entries;
}

/** デモ用: 初回アクセス時にサンプルランキングを生成 */
function ensureDemoRanking() {
  const data = getRankingData();
  if (Object.keys(data).length > 0) return;
  const demo = {
    "1":  { interest: 42, purchased: 18 },
    "3":  { interest: 38, purchased: 12 },
    "4":  { interest: 35, purchased: 22 },
    "7":  { interest: 33, purchased: 9 },
    "13": { interest: 31, purchased: 15 },
    "6":  { interest: 28, purchased: 8 },
    "14": { interest: 26, purchased: 11 },
    "8":  { interest: 24, purchased: 14 },
    "16": { interest: 22, purchased: 19 },
    "19": { interest: 20, purchased: 7 },
    "2":  { interest: 18, purchased: 6 },
    "5":  { interest: 16, purchased: 10 },
    "9":  { interest: 15, purchased: 5 },
    "10": { interest: 14, purchased: 13 },
    "15": { interest: 12, purchased: 4 },
    "21": { interest: 11, purchased: 3 },
    "22": { interest: 10, purchased: 16 },
  };
  saveRankingData(demo);
}

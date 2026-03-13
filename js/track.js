/* ========================================
   ガチャプレス - イベント計測モジュール
   Google Analytics等に差し替え可能
   ======================================== */

const GACHA_TRACK = {
  /** 計測イベントを送信 */
  send(action, label, params = {}) {
    const event = {
      action,
      label: label || "",
      ...params,
      timestamp: new Date().toISOString(),
      page: window.location.pathname || "index",
    };

    // 開発時：コンソールに出力
    if (typeof console !== "undefined" && console.debug) {
      console.debug("[GachaTrack]", event);
    }

    // ローカルバッファ（GAなし時の簡易ログ）
    try {
      const log = JSON.parse(sessionStorage.getItem("gacha_track_log") || "[]");
      log.push(event);
      if (log.length > 100) log.shift();
      sessionStorage.setItem("gacha_track_log", JSON.stringify(log));
    } catch (e) {}

    // Google Analytics 4（gtag使用時）
    if (typeof gtag === "function") {
      gtag("event", action, {
        event_category: "engagement",
        event_label: label,
        ...params,
      });
    }

    // カスタムイベント（外部スクリプトがlisten可能）
    window.dispatchEvent(
      new CustomEvent("gacha_track", { detail: event })
    );
  },
};

/** ボタンクリック計測のショートカット */
function trackButtonClick(action, label, productId, productName) {
  GACHA_TRACK.send(action, label, {
    product_id: productId,
    product_name: productName,
  });
}

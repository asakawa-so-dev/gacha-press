/* ========================================
   カプる。 - 気になるリスト（統合）
   「気になる」= 個人リスト保存 + ランキング投票
   ======================================== */
var INTEREST_STORAGE_KEY = "gacha_press_interest";

function getMyList() {
  try { return JSON.parse(localStorage.getItem(INTEREST_STORAGE_KEY) || "[]"); }
  catch (e) { return []; }
}

function saveMyList(list) {
  localStorage.setItem(INTEREST_STORAGE_KEY, JSON.stringify(list));
}

function isLiked(productId) {
  return getMyList().indexOf(productId) !== -1;
}

function toggleLike(productId) {
  var list = getMyList();
  var idx = list.indexOf(productId);
  var added = idx === -1;
  if (added) {
    list.push(productId);
    if (typeof incrementRanking === "function") incrementRanking(productId, "interest");
  } else {
    list.splice(idx, 1);
    if (typeof decrementRanking === "function") decrementRanking(productId, "interest");
  }
  saveMyList(list);
  return added;
}

function renderMyList() {
  var wrap = document.getElementById("mylistContent");
  if (!wrap) return;

  var user = null;
  try { user = JSON.parse(localStorage.getItem("gacha_auth_user")); } catch(e) {}
  if (!user) {
    wrap.innerHTML =
      '<div class="mylist-empty">' +
        '<div class="mylist-empty-icon"><svg viewBox="0 0 24 24" fill="none" width="48" height="48"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>' +
        '<p class="mylist-empty-title">ログインが必要です</p>' +
        '<p class="mylist-empty-text">気になるガチャを保存するには<br>ログインしてください。</p>' +
        '<a href="mypage.html" class="mylist-empty-link">ログインする →</a>' +
      '</div>';
    return;
  }

  var list = getMyList();

  if (list.length === 0) {
    wrap.innerHTML =
      '<div class="mylist-empty">' +
        '<div class="mylist-empty-icon"><svg viewBox="0 0 24 24" fill="none" width="48" height="48"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></div>' +
        '<p class="mylist-empty-title">気になるガチャがありません</p>' +
        '<p class="mylist-empty-text">❤️ をタップして<br>気になるガチャを保存しましょう。</p>' +
        '<a href="index.html" class="mylist-empty-link">ガチャをさがす →</a>' +
      '</div>';
    return;
  }

  var html = '<div class="mylist-count">❤️ ' + list.length + ' 件</div>';
  html += '<div class="mylist-grid">';
  list.forEach(function (id) {
    var product = typeof GACHA_DATA !== "undefined" ? GACHA_DATA.find(function (g) { return g.id === id; }) : null;
    if (!product) return;
    var img = typeof getProductImage === "function" ? getProductImage(product) : (product.image || "images/placeholder_character.svg");
    var fallback = typeof getPlaceholderForGenre === "function" ? getPlaceholderForGenre(product.genre) : "images/placeholder_character.svg";
    html += '<div class="mylist-item">' +
      '<a href="detail.html?id=' + product.id + '" class="mylist-item-link">' +
        '<img src="' + img + '" alt="' + product.name + '" class="mylist-item-img" onerror="this.onerror=null;this.src=\'' + fallback + '\'">' +
        '<div class="mylist-item-info">' +
          '<p class="mylist-item-name">' + product.name + '</p>' +
          '<p class="mylist-item-meta">' + product.maker + ' / &yen;' + product.price + '</p>' +
        '</div>' +
      '</a>' +
      '<button class="mylist-item-remove" data-id="' + product.id + '" aria-label="削除">' +
        '<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</button>' +
    '</div>';
  });
  html += '</div>';
  wrap.innerHTML = html;

  wrap.querySelectorAll(".mylist-item-remove").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toggleLike(parseInt(btn.dataset.id, 10));
      renderMyList();
    });
  });
}

document.addEventListener("DOMContentLoaded", renderMyList);

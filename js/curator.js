/* ========================================
   Curator Profile Page Renderer
   ======================================== */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var wrap = document.getElementById("curatorContent");
    if (!wrap || typeof getCuratorData !== "function") return;

    var params = new URLSearchParams(window.location.search);
    var curatorId = params.get("id");
    var curators = getCuratorData();
    var curator = curators.find(function (c) { return c.id === curatorId; });

    if (!curator) {
      wrap.innerHTML =
        '<div class="article-notfound">' +
          '<p>キュレーターが見つかりません。</p>' +
          '<a href="index.html">さがすに戻る</a>' +
        '</div>';
      return;
    }

    document.title = curator.name + " のキュレーション — カプる。";

    var articles = typeof getArticleData === "function" ? getArticleData() : [];
    var myArticles = articles.filter(function (a) { return curator.articleIds.indexOf(a.id) !== -1; });

    var html = '';

    html += '<div class="curator-profile">';
    html +=   '<div class="curator-profile-avatar" style="--ring-color:' + curator.color + '">';
    html +=     '<img src="' + curator.avatar + '" alt="' + curator.name + '">';
    html +=   '</div>';
    html +=   '<div class="curator-profile-info">';
    html +=     '<h1 class="curator-profile-name">' + curator.name + '</h1>';
    html +=     '<p class="curator-profile-role">' + curator.role + '</p>';
    html +=     '<p class="curator-profile-bio">' + curator.bio + '</p>';
    html +=     '<div class="curator-profile-tags">';
    curator.favoriteGenres.forEach(function (genre) {
      html +=     '<span class="curator-profile-tag">' + genre + '</span>';
    });
    html +=     '</div>';
    html +=     '<p class="curator-profile-stats">' + myArticles.length + ' 本の特集記事</p>';
    html +=   '</div>';
    html += '</div>';

    var otherCurators = curators.filter(function (c) { return c.id !== curatorId; });
    html += '<div class="curator-others">';
    html +=   '<h3 class="curator-others-title">ほかのキュレーター</h3>';
    html +=   '<div class="curator-others-list">';
    otherCurators.forEach(function (oc) {
      html += '<a href="curator.html?id=' + oc.id + '" class="curator-others-item">';
      html +=   '<div class="curator-avatar-ring" style="--ring-color:' + oc.color + '">';
      html +=     '<img src="' + oc.avatar + '" alt="' + oc.name + '" class="curator-avatar-img">';
      html +=   '</div>';
      html +=   '<span class="curator-others-name">' + oc.name + '</span>';
      html += '</a>';
    });
    html +=   '</div>';
    html += '</div>';

    html += '<h2 class="curator-articles-heading">' + curator.name + ' の特集</h2>';
    html += '<div class="article-card-grid">';

    myArticles.forEach(function (a) {
      var coverItem = GACHA_DATA.find(function (g) { return g.id === a.coverProductId; });
      var coverImg = coverItem ? (typeof getProductImage === "function" ? getProductImage(coverItem) : "") : "images/placeholder_character.svg";
      var coverFallback = coverItem ? (typeof getPlaceholderForGenre === "function" ? getPlaceholderForGenre(coverItem.genre) : "images/placeholder_character.svg") : "images/placeholder_character.svg";
      html += '<a href="article.html?id=' + a.id + '" class="article-card">' +
        '<div class="article-card-cover">' +
          '<img src="' + coverImg + '" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'' + coverFallback + '\'">' +
          '<span class="article-card-tag">' + a.tag + '</span>' +
        '</div>' +
        '<div class="article-card-body">' +
          '<h3 class="article-card-title">' + a.title + '</h3>' +
          '<p class="article-card-count">' + a.productIds.length + ' アイテム</p>' +
        '</div>' +
      '</a>';
    });

    html += '</div>';
    html += '<div class="article-back"><a href="index.html">\u2190 さがすに戻る</a></div>';

    wrap.innerHTML = html;
  });
})();

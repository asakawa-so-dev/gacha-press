/* ========================================
   Article Page Renderer
   ======================================== */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var wrap = document.getElementById("articleContent");
    if (!wrap || typeof getArticleData !== "function") return;

    var params = new URLSearchParams(window.location.search);
    var articleId = params.get("id");
    var articles = getArticleData();
    var article = articles.find(function (a) { return a.id === articleId; });

    if (!article) {
      wrap.innerHTML =
        '<div class="article-notfound">' +
          '<p>記事が見つかりません。</p>' +
          '<a href="index.html">さがすに戻る</a>' +
        '</div>';
      return;
    }

    document.title = article.title + " \u2014 カプる。";

    var curators = typeof getCuratorData === "function" ? getCuratorData() : [];
    var curator = article.curatorId ? curators.find(function (c) { return c.id === article.curatorId; }) : null;

    var html = '<article class="article-body">';
    html += '<header class="article-header">';
    html += '<span class="article-page-tag">' + article.tag + '</span>';
    html += '<h1 class="article-page-title">' + article.title + '</h1>';
    if (article.lede) {
      html += '<p class="article-lede">' + article.lede + '</p>';
    }
    if (curator) {
      html += '<a href="curator.html?id=' + curator.id + '" class="article-curator-byline">';
      html +=   '<img src="' + curator.avatar + '" alt="" class="article-curator-byline-img">';
      html +=   '<div class="article-curator-byline-text">';
      html +=     '<span class="article-curator-byline-label">この記事を書いた人</span>';
      html +=     '<span class="article-curator-byline-name">' + curator.name + '</span>';
      html +=     '<span class="article-curator-byline-bio">' + curator.bio + '</span>';
      html +=   '</div>';
      html += '</a>';
    }
    html += '</header>';

    article.body.forEach(function (block) {
      if (block.type === "h2") {
        html += '<h2 class="article-h2">' + block.text + '</h2>';
      } else if (block.type === "p") {
        html += '<p class="article-p">' + block.text + '</p>';
      } else if (block.type === "product") {
        var product = GACHA_DATA.find(function (g) { return g.id === block.id; });
        if (product) {
          var img = typeof getProductImage === "function" ? getProductImage(product) : (product.image || "");
          var fallback = typeof getPlaceholderForGenre === "function" ? getPlaceholderForGenre(product.genre) : "images/placeholder_character.svg";
          var month = (typeof MONTH_LABELS !== "undefined" && MONTH_LABELS[product.releaseMonth]) || product.releaseMonth;
          html +=
            '<a href="detail.html?id=' + product.id + '" class="article-product-card">' +
              '<img src="' + img + '" alt="' + product.name + '" class="article-product-img" onerror="this.onerror=null;this.src=\'' + fallback + '\'">' +
              '<div class="article-product-info">' +
                '<p class="article-product-name">' + product.name + '</p>' +
                '<p class="article-product-meta">' + product.maker + ' / \u00a5' + product.price + ' / ' + month + '</p>' +
              '</div>' +
            '</a>';
        }
      } else if (block.type === "hr") {
        html += '<hr class="article-hr">';
      }
    });

    html += '</article>';
    html += '<div class="article-back"><a href="index.html">\u2190 \u30db\u30fc\u30e0\u306b\u623b\u308b</a></div>';
    wrap.innerHTML = html;
  });
})();

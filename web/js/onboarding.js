/* ========================================
   カプる。 - オンボーディング（初回訪問時）
   実際のUI画面を模したアニメーション付き
   ======================================== */
(function () {
  var OB_KEY = "gacha_onboarding_done";
  if (localStorage.getItem(OB_KEY)) return;

  var slides = [
    {
      title: "カプる。へようこそ",
      body: "ガチャガチャの新商品を発見して、\n気になるアイテムを記録できるアプリです。",
      demo: function () {
        return '<div class="ob-demo ob-demo-welcome">' +
          '<div class="ob-phone">' +
            '<div class="ob-phone-header"><span class="ob-phone-logo">カプる<span style="color:#3daae0">。</span></span></div>' +
            '<div class="ob-phone-cards">' +
              '<div class="ob-mini-card ob-anim-card1"><div class="ob-mini-img" style="background:#ffe0e6"></div><div class="ob-mini-txt"></div><div class="ob-mini-price">¥400</div></div>' +
              '<div class="ob-mini-card ob-anim-card2"><div class="ob-mini-img" style="background:#ddeeff"></div><div class="ob-mini-txt"></div><div class="ob-mini-price">¥300</div></div>' +
              '<div class="ob-mini-card ob-anim-card3"><div class="ob-mini-img" style="background:#e8f5e9"></div><div class="ob-mini-txt"></div><div class="ob-mini-price">¥500</div></div>' +
              '<div class="ob-mini-card ob-anim-card4"><div class="ob-mini-img" style="background:#fff3e0"></div><div class="ob-mini-txt"></div><div class="ob-mini-price">¥400</div></div>' +
            '</div>' +
            '<div class="ob-phone-nav">' +
              '<span class="ob-pnav active">🔍</span><span class="ob-pnav">🏆</span><span class="ob-pnav">❤️</span><span class="ob-pnav">👤</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }
    },
    {
      title: "さがす＆絞り込み",
      body: "キーワード検索やジャンル・価格で\n欲しいガチャをすぐに見つけられます。",
      demo: function () {
        var img1 = "images/001.jpg";
        var img2 = "images/009.jpg";
        var img3 = "images/019.jpg";
        return '<div class="ob-demo ob-demo-search">' +
          '<div class="ob-phone">' +
            '<div class="ob-search-bar">' +
              '<span class="ob-search-icon">🔍</span>' +
              '<span class="ob-search-typing"></span>' +
              '<span class="ob-search-cursor">|</span>' +
            '</div>' +
            '<div class="ob-search-count ob-anim-scount">3 件ヒット</div>' +
            '<div class="ob-search-results">' +
              '<div class="ob-result-card ob-anim-result1">' +
                '<img class="ob-r-img" src="' + img1 + '" onerror="this.style.background=\'#ffe0e6\';this.src=\'\'">' +
                '<div class="ob-r-info"><div class="ob-r-name-text">ちいかわ ソフビフィギュア4</div><div class="ob-r-sub-text">パレード / ¥400</div></div>' +
                '<span class="ob-r-heart">♡</span>' +
              '</div>' +
              '<div class="ob-result-card ob-anim-result2">' +
                '<img class="ob-r-img" src="' + img2 + '" onerror="this.style.background=\'#ddeeff\';this.src=\'\'">' +
                '<div class="ob-r-info"><div class="ob-r-name-text">ちいかわ なんか小さくて…</div><div class="ob-r-sub-text">バンダイ / ¥300</div></div>' +
                '<span class="ob-r-heart">♡</span>' +
              '</div>' +
              '<div class="ob-result-card ob-anim-result3">' +
                '<img class="ob-r-img" src="' + img3 + '" onerror="this.style.background=\'#e8f5e9\';this.src=\'\'">' +
                '<div class="ob-r-info"><div class="ob-r-name-text">ちいかわ おともだち…</div><div class="ob-r-sub-text">タカラトミー / ¥400</div></div>' +
                '<span class="ob-r-heart">♡</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }
    },
    {
      title: "❤️ 気になる",
      body: "ハートをタップするだけでリストに保存。\nランキングにも反映されます。",
      demo: function () {
        var cImg = "images/001.jpg";
        return '<div class="ob-demo ob-demo-heart">' +
          '<div class="ob-phone">' +
            '<div class="ob-heart-card">' +
              '<div class="ob-hc-img"><img src="' + cImg + '" class="ob-hc-img-real" onerror="this.style.display=\'none\'">' +
                '<div class="ob-hc-heart ob-anim-heart">' +
                  '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" class="ob-heart-path"/></svg>' +
                '</div>' +
              '</div>' +
              '<div class="ob-hc-body">' +
                '<div class="ob-hc-name-text">ちいかわ ソフビ…</div>' +
                '<div class="ob-hc-price">¥400</div>' +
              '</div>' +
            '</div>' +
            '<div class="ob-heart-cursor ob-anim-cursor">' +
              '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M6 2L18 12L12 13L16 22L13 23L9 14L6 17Z" fill="#333" stroke="#fff" stroke-width="1"/></svg>' +
            '</div>' +
            '<div class="ob-heart-toast ob-anim-toast">❤️ リストに追加しました</div>' +
          '</div>' +
        '</div>';
      }
    },
    {
      title: "✓ 買った",
      body: "ゲットしたらタップ！\nみんなの購入数がランキングに反映されます。",
      demo: function () {
        return '<div class="ob-demo ob-demo-bought">' +
          '<div class="ob-phone">' +
            '<div class="ob-bought-scene">' +
              '<div class="ob-bought-img" style="background:#ddeeff"></div>' +
              '<div class="ob-bought-info">' +
                '<div class="ob-bought-name"></div>' +
                '<div class="ob-bought-price">¥300 / 1回</div>' +
              '</div>' +
              '<div class="ob-bought-btns">' +
                '<button class="ob-bbtn ob-bbtn-like"><span class="ob-bbtn-icon">❤️</span> 気になる <span class="ob-bbtn-num">58</span></button>' +
                '<button class="ob-bbtn ob-bbtn-bought ob-anim-bought"><span class="ob-bbtn-icon">✓</span> <span class="ob-bbtn-label">買った</span> <span class="ob-bbtn-num ob-bought-num">24</span></button>' +
              '</div>' +
            '</div>' +
            '<div class="ob-bought-cursor ob-anim-cursor2">' +
              '<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M6 2L18 12L12 13L16 22L13 23L9 14L6 17Z" fill="#333" stroke="#fff" stroke-width="1"/></svg>' +
            '</div>' +
          '</div>' +
        '</div>';
      }
    },
    {
      title: "ランキング",
      body: "みんなの「気になる」と「買った」で\n人気ガチャが一目でわかります。",
      demo: function () {
        return '<div class="ob-demo ob-demo-ranking">' +
          '<div class="ob-phone">' +
            '<div class="ob-rank-header">ランキング</div>' +
            '<div class="ob-rank-filters">' +
              '<span class="ob-rfpill active">すべて</span><span class="ob-rfpill">フィギュア</span><span class="ob-rfpill">ぬいぐるみ</span>' +
            '</div>' +
            '<div class="ob-rank-list">' +
              '<div class="ob-rank-item ob-anim-rank1"><span class="ob-rank-num gold">1</span><div class="ob-rank-bar" style="--bar-w:95%"><div class="ob-rank-fill"></div></div><span class="ob-rank-cnt">58</span></div>' +
              '<div class="ob-rank-item ob-anim-rank2"><span class="ob-rank-num silver">2</span><div class="ob-rank-bar" style="--bar-w:82%"><div class="ob-rank-fill"></div></div><span class="ob-rank-cnt">52</span></div>' +
              '<div class="ob-rank-item ob-anim-rank3"><span class="ob-rank-num bronze">3</span><div class="ob-rank-bar" style="--bar-w:70%"><div class="ob-rank-fill"></div></div><span class="ob-rank-cnt">48</span></div>' +
              '<div class="ob-rank-item ob-anim-rank4"><span class="ob-rank-num">4</span><div class="ob-rank-bar" style="--bar-w:58%"><div class="ob-rank-fill"></div></div><span class="ob-rank-cnt">45</span></div>' +
              '<div class="ob-rank-item ob-anim-rank5"><span class="ob-rank-num">5</span><div class="ob-rank-bar" style="--bar-w:48%"><div class="ob-rank-fill"></div></div><span class="ob-rank-cnt">42</span></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }
    }
  ];

  function render() {
    var overlay = document.createElement("div");
    overlay.className = "ob-overlay";
    overlay.id = "obOverlay";

    var card = document.createElement("div");
    card.className = "ob-card";

    var inner = '<div class="ob-slides" id="obSlides">';
    for (var i = 0; i < slides.length; i++) {
      var s = slides[i];
      inner += '<div class="ob-slide' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '">' +
        s.demo() +
        '<h2 class="ob-slide-title">' + s.title + '</h2>' +
        '<p class="ob-slide-body">' + s.body.replace(/\n/g, '<br>') + '</p>' +
      '</div>';
    }
    inner += '</div>';

    inner += '<div class="ob-dots" id="obDots">';
    for (var j = 0; j < slides.length; j++) {
      inner += '<span class="ob-dot' + (j === 0 ? ' active' : '') + '" data-idx="' + j + '"></span>';
    }
    inner += '</div>';

    inner += '<div class="ob-actions">' +
      '<button class="ob-skip" id="obSkip">スキップ</button>' +
      '<button class="ob-next" id="obNext">次へ</button>' +
    '</div>';

    card.innerHTML = inner;
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.classList.add("visible");
    });

    var current = 0;

    function goTo(idx) {
      if (idx < 0 || idx >= slides.length) return;
      var allSlides = overlay.querySelectorAll(".ob-slide");
      var allDots = overlay.querySelectorAll(".ob-dot");
      for (var k = 0; k < allSlides.length; k++) {
        allSlides[k].classList.toggle("active", k === idx);
        allDots[k].classList.toggle("active", k === idx);
      }
      current = idx;
      var nextBtn = document.getElementById("obNext");
      nextBtn.textContent = current === slides.length - 1 ? "はじめる" : "次へ";
    }

    document.getElementById("obNext").addEventListener("click", function () {
      if (current < slides.length - 1) goTo(current + 1);
      else close();
    });

    document.getElementById("obSkip").addEventListener("click", close);

    overlay.querySelectorAll(".ob-dot").forEach(function (dot) {
      dot.addEventListener("click", function () {
        goTo(parseInt(dot.dataset.idx, 10));
      });
    });

    var startX = 0;
    card.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    card.addEventListener("touchend", function (e) {
      var diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) {
        if (diff < 0 && current < slides.length - 1) goTo(current + 1);
        if (diff > 0 && current > 0) goTo(current - 1);
      }
    }, { passive: true });
  }

  function close() {
    localStorage.setItem(OB_KEY, "1");
    var overlay = document.getElementById("obOverlay");
    if (overlay) {
      overlay.classList.remove("visible");
      overlay.classList.add("closing");
      setTimeout(function () { overlay.remove(); }, 350);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(render, 300); });
  } else {
    setTimeout(render, 300);
  }
})();

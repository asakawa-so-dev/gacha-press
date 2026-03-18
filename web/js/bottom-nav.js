/* ========================================
   Mobile Bottom Navigation
   ======================================== */
(function () {
  function currentPage() {
    var path = window.location.pathname;
    if (path.endsWith("/ranking.html")) return "ranking";
    if (path.endsWith("/mylist.html")) return "mylist";
    if (path.endsWith("/mypage.html")) return "mypage";
    if (path.endsWith("/detail.html")) return "search";
    if (path.endsWith("/article.html")) return "search";
    if (path.endsWith("/curator.html")) return "search";
    return "search";
  }

  function navItem(href, label, icon, key, activeKey) {
    var activeClass = key === activeKey ? " active" : "";
    return '<a href="' + href + '" class="mobile-bottom-nav-item' + activeClass + '" data-nav-key="' + key + '">' +
      '<span class="mobile-bottom-nav-icon" aria-hidden="true">' + icon + '</span>' +
      '<span class="mobile-bottom-nav-label">' + label + '</span>' +
    '</a>';
  }

  function buildBottomNav() {
    if (document.getElementById("mobileBottomNav")) return;

    var activeKey = currentPage();
    var isIndex = window.location.pathname.endsWith("/index.html") || window.location.pathname.endsWith("/gacha-media/");
    var nav = document.createElement("nav");
    nav.className = "mobile-bottom-nav";
    nav.id = "mobileBottomNav";
    nav.setAttribute("aria-label", "ナビゲーション");

    var searchIcon = '<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    var rankingIcon = '<svg viewBox="0 0 24 24" fill="none"><path d="M8 21h8M10 21v-3h4v3M5 3h14M7 3v4a5 5 0 0 0 10 0V3M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var listIcon = '<svg viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    var listLockIcon = '<svg viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><rect x="7" y="10" width="10" height="7" rx="1.5" fill="currentColor" opacity="0.5"/><path d="M9.5 10V8a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    var mypageIcon = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M20 21c0-3.3-3.6-6-8-6s-8 2.7-8 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

    var isLoggedIn = false;
    try { isLoggedIn = !!JSON.parse(localStorage.getItem("gacha_auth_user")); } catch(e) {}

    var currentListIcon = isLoggedIn ? listIcon : listLockIcon;
    var listHref = isLoggedIn ? "mylist.html" : "mypage.html";

    var searchHref = isIndex ? "#search" : "index.html";
    if (isIndex && activeKey === "search") activeKey = "search";

    nav.innerHTML =
      navItem(searchHref, "さがす", searchIcon, "search", activeKey) +
      navItem("ranking.html", "ランキング", rankingIcon, "ranking", activeKey) +
      navItem(listHref, "気になる", currentListIcon, "mylist", activeKey) +
      navItem("mypage.html", "マイページ", mypageIcon, "mypage", activeKey);

    document.body.appendChild(nav);
    document.body.classList.add("has-mobile-bottom-nav");

    if (isIndex) {
      var searchNav = nav.querySelector('[data-nav-key="search"]');
      if (searchNav) {
        searchNav.addEventListener("click", function (e) {
          e.preventDefault();
          if (typeof window.setIndexView === "function") window.setIndexView("search");
          nav.querySelectorAll(".mobile-bottom-nav-item").forEach(function (item) {
            item.classList.toggle("active", item.dataset.navKey === "search");
          });
          var searchInput = document.getElementById("searchInput");
          if (searchInput) {
            setTimeout(function () {
              searchInput.focus();
              searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 120);
          }
        });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildBottomNav);
  } else {
    buildBottomNav();
  }
})();

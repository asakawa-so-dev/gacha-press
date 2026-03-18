/* ========================================
   Mobile Bottom Navigation
   ======================================== */
(function () {
  function currentPage() {
    const path = window.location.pathname;
    if (path.endsWith("/ranking.html")) return "ranking";
    if (path.endsWith("/detail.html")) return "index";
    return "index";
  }

  function navItem(href, label, icon, key, activeKey) {
    const activeClass = key === activeKey ? " active" : "";
    return `<a href="${href}" class="mobile-bottom-nav-item${activeClass}" data-nav-key="${key}">
      <span class="mobile-bottom-nav-icon" aria-hidden="true">${icon}</span>
      <span class="mobile-bottom-nav-label">${label}</span>
    </a>`;
  }

  function buildBottomNav() {
    if (document.getElementById("mobileBottomNav")) return;

    const activeKey = currentPage();
    const isIndex = activeKey === "index";
    const nav = document.createElement("nav");
    nav.className = "mobile-bottom-nav";
    nav.id = "mobileBottomNav";
    nav.setAttribute("aria-label", "モバイルボトムナビゲーション");

    const homeIcon = '<svg viewBox="0 0 24 24" fill="none"><path d="M3 10.5l9-7 9 7V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    const searchIcon = '<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    const rankingIcon = '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2-4.5-4.4 6.2-.9L12 3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

    const searchHref = isIndex ? "#search" : "index.html#search";
    const homeHref = isIndex ? "#home" : "index.html";
    const navActiveKey = activeKey === "index"
      ? (window.location.hash === "#search" || window.location.hash === "#searchInput" ? "search" : "index")
      : activeKey;
    nav.innerHTML =
      navItem(homeHref, "ホーム", homeIcon, "index", navActiveKey) +
      navItem(searchHref, "探す", searchIcon, "search", navActiveKey) +
      navItem("ranking.html", "ランキング", rankingIcon, "ranking", navActiveKey);

    document.body.appendChild(nav);
    document.body.classList.add("has-mobile-bottom-nav");

    function setActiveNav(key) {
      nav.querySelectorAll(".mobile-bottom-nav-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.navKey === key);
      });
    }

    if (isIndex) {
      const homeNav = nav.querySelector('[data-nav-key="index"]');
      const searchNav = nav.querySelector('[data-nav-key="search"]');

      if (homeNav) {
        homeNav.addEventListener("click", function (e) {
          e.preventDefault();
          if (typeof window.setIndexView === "function") window.setIndexView("home");
          setActiveNav("index");
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }

      if (searchNav) {
        searchNav.addEventListener("click", function (e) {
          e.preventDefault();
          if (typeof window.setIndexView === "function") window.setIndexView("search");
          setActiveNav("search");
          const searchInput = document.getElementById("searchInput");
          if (searchInput) {
            setTimeout(() => {
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

/* ========================================
   Floating Navbar — Scroll Direction Detection
   Vanilla JS port of floating-navbar.tsx (Framer Motion)
   ======================================== */

(function () {
  const nav = document.getElementById("floatingNav");
  if (!nav) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? currentY / docHeight : 0;
      const direction = currentY - lastScrollY;

      if (scrollProgress < 0.05) {
        nav.classList.remove("visible");
      } else if (direction < 0) {
        nav.classList.add("visible");
      } else {
        nav.classList.remove("visible");
      }

      lastScrollY = currentY;
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ========================================
   Capacitor Native Bridge
   Capacitor API integration for native app features.
   Falls back gracefully when running in a browser.
   ======================================== */

(function () {
  "use strict";

  var isNative = typeof window.Capacitor !== "undefined" && window.Capacitor.isNativePlatform();
  var plugins = isNative ? window.Capacitor.Plugins : {};

  /* --- Status Bar --- */
  function setupStatusBar() {
    if (!isNative || !plugins.StatusBar) return;
    try {
      plugins.StatusBar.setStyle({ style: "LIGHT" });
      plugins.StatusBar.setBackgroundColor({ color: "#ffffff" });
      plugins.StatusBar.setOverlaysWebView({ overlay: false });
    } catch (e) { /* ignore on platforms that don't support it */ }
  }

  /* --- Splash Screen --- */
  function hideSplash() {
    if (!isNative || !plugins.SplashScreen) return;
    try {
      plugins.SplashScreen.hide({ fadeOutDuration: 300 });
    } catch (e) {}
  }

  /* --- Haptics --- */
  window.capHapticLight = function () {
    if (!isNative || !plugins.Haptics) return;
    try {
      plugins.Haptics.impact({ style: "LIGHT" });
    } catch (e) {}
  };

  window.capHapticMedium = function () {
    if (!isNative || !plugins.Haptics) return;
    try {
      plugins.Haptics.impact({ style: "MEDIUM" });
    } catch (e) {}
  };

  window.capHapticSuccess = function () {
    if (!isNative || !plugins.Haptics) return;
    try {
      plugins.Haptics.notification({ type: "SUCCESS" });
    } catch (e) {}
  };

  /* --- Native Share --- */
  window.capShare = function (title, text, url) {
    if (!isNative || !plugins.Share) {
      if (navigator.share) {
        return navigator.share({ title: title, text: text, url: url });
      }
      return Promise.resolve(false);
    }
    return plugins.Share.share({ title: title, text: text, url: url, dialogTitle: "共有" });
  };

  /* --- Android Back Button --- */
  function setupBackButton() {
    if (!isNative || !plugins.App) return;
    plugins.App.addListener("backButton", function (ev) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        plugins.App.exitApp();
      }
    });
  }

  /* --- App State (resume / pause) --- */
  function setupAppState() {
    if (!isNative || !plugins.App) return;
    plugins.App.addListener("appStateChange", function (state) {
      if (state.isActive) {
        document.dispatchEvent(new CustomEvent("app:resume"));
      } else {
        document.dispatchEvent(new CustomEvent("app:pause"));
      }
    });
  }

  /* --- Keyboard handling (iOS) --- */
  function setupKeyboard() {
    if (!isNative || !plugins.Keyboard) return;
    plugins.Keyboard.addListener("keyboardWillShow", function (info) {
      document.body.style.setProperty("--keyboard-height", info.keyboardHeight + "px");
      document.body.classList.add("keyboard-visible");
    });
    plugins.Keyboard.addListener("keyboardWillHide", function () {
      document.body.style.setProperty("--keyboard-height", "0px");
      document.body.classList.remove("keyboard-visible");
    });
  }

  /* --- External Links --- */
  function setupExternalLinks() {
    if (!isNative) return;
    document.addEventListener("click", function (e) {
      var anchor = e.target.closest("a[href]");
      if (!anchor) return;
      var href = anchor.getAttribute("href");
      if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
        var isInternal = href.indexOf(window.location.origin) === 0;
        if (!isInternal) {
          e.preventDefault();
          window.Capacitor.Plugins.Browser
            ? window.Capacitor.Plugins.Browser.open({ url: href })
            : window.open(href, "_system");
        }
      }
    }, true);
  }

  /* --- Service Worker Registration --- */
  function registerServiceWorker() {
    if ("serviceWorker" in navigator && !isNative) {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    }
  }

  /* --- Init --- */
  document.addEventListener("DOMContentLoaded", function () {
    setupStatusBar();
    setupBackButton();
    setupAppState();
    setupKeyboard();
    setupExternalLinks();
    registerServiceWorker();

    setTimeout(hideSplash, 500);
  });

  window._capIsNative = isNative;
})();

/* ========================================
   カプる。 - マイページ / ログイン
   ======================================== */
var AUTH_KEY = "gacha_auth_user";

function getAuthUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
  catch (e) { return null; }
}

function setAuthUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function clearAuthUser() {
  localStorage.removeItem(AUTH_KEY);
}

function renderMyPage() {
  var wrap = document.getElementById("mypageMain");
  if (!wrap) return;

  var user = getAuthUser();
  if (user) {
    renderLoggedIn(wrap, user);
  } else {
    renderLoginScreen(wrap);
  }
}

function renderLoginScreen(wrap) {
  wrap.innerHTML =
    '<div class="auth-container">' +
      '<div class="auth-hero">' +
        '<svg viewBox="0 0 24 24" fill="none" width="48" height="48" class="auth-hero-icon"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M20 21c0-3.3-3.6-6-8-6s-8 2.7-8 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        '<h1 class="auth-title">マイページ</h1>' +
        '<p class="auth-sub">ログインするとリストの保存や<br>ランキングへの投票ができます</p>' +
      '</div>' +

      '<div class="auth-providers">' +
        '<button class="auth-btn auth-btn-email" data-provider="email">' +
          '<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 7l10 6 10-6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>' +
          '<span>メールアドレスで続ける</span>' +
        '</button>' +
        '<button class="auth-btn auth-btn-google" data-provider="google">' +
          '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5z" fill="#4285F4"/><path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22z" fill="#34A853"/><path d="M6.4 13.9A6 6 0 0 1 6 12c0-.7.1-1.3.4-1.9V7.5H3A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.5l3.4-2.6z" fill="#FBBC05"/><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A10 10 0 0 0 12 2 10 10 0 0 0 3 7.5l3.4 2.6c.8-2.4 3-4.2 5.6-4.2z" fill="#EA4335"/></svg>' +
          '<span>Googleで続ける</span>' +
        '</button>' +
        '<button class="auth-btn auth-btn-apple" data-provider="apple">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.65-2.2.46-3.07-.4C3.79 16.17 4.36 9.08 8.9 8.83c1.25.06 2.12.72 2.85.75.97-.2 1.9-.76 2.95-.69 1.22.1 2.13.55 2.72 1.42-2.49 1.51-1.9 4.82.37 5.75-.45 1.2-.99 2.4-1.74 3.22zM12.04 8.78c-.1-2.07 1.61-3.88 3.46-4.03.24 2.3-2.07 4.17-3.46 4.03z"/></svg>' +
          '<span>Appleで続ける</span>' +
        '</button>' +
        '<button class="auth-btn auth-btn-x" data-provider="x">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
          '<span>Xで続ける</span>' +
        '</button>' +
        '<button class="auth-btn auth-btn-line" data-provider="line">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="#06C755"><path d="M12 2C6.48 2 2 5.82 2 10.5c0 4.21 3.74 7.74 8.79 8.4.34.07.81.23.93.52.1.27.07.68.03.95l-.15.91c-.05.27-.21 1.05.92.57s6.12-3.6 8.35-6.17C22.7 13.47 22 11.05 22 10.5 22 5.82 17.52 2 12 2zm-3.76 11.2a.37.37 0 0 1-.37.36H5.75a.37.37 0 0 1-.37-.37V8.87a.37.37 0 0 1 .74 0v3.96h1.75a.37.37 0 0 1 .37.37zm1.54 0a.37.37 0 1 1-.74 0V8.87a.37.37 0 1 1 .74 0v4.33zm4.38 0a.37.37 0 0 1-.65.24l-2.43-3.28v3.04a.37.37 0 1 1-.74 0V8.87a.37.37 0 0 1 .65-.24l2.43 3.28V8.87a.37.37 0 1 1 .74 0v4.33zm3.54-3.36a.37.37 0 1 1 0 .74h-1.75v.93h1.75a.37.37 0 1 1 0 .74h-2.12a.37.37 0 0 1-.37-.37V8.87c0-.2.17-.37.37-.37h2.12a.37.37 0 1 1 0 .74h-1.75v.97h1.75z"/></svg>' +
          '<span>LINEで続ける</span>' +
        '</button>' +
      '</div>' +

      '<p class="auth-notice">アカウント登録・ログインすると<br><a href="#">利用規約</a>と<a href="#">プライバシーポリシー</a>に同意したことになります。</p>' +
    '</div>';

  wrap.querySelectorAll(".auth-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var provider = btn.dataset.provider;
      if (provider === "email") {
        renderEmailForm(wrap);
      } else {
        setAuthUser({ name: "ゲスト", provider: provider });
        renderMyPage();
      }
    });
  });
}

function renderEmailForm(wrap) {
  wrap.innerHTML =
    '<div class="auth-container">' +
      '<button class="auth-back" id="authBack">← 戻る</button>' +
      '<h2 class="auth-title">メールアドレスで続ける</h2>' +
      '<form class="auth-form" id="authEmailForm">' +
        '<label class="auth-field-label">メールアドレス</label>' +
        '<input type="email" class="auth-field" placeholder="example@mail.com" required>' +
        '<label class="auth-field-label">パスワード</label>' +
        '<input type="password" class="auth-field" placeholder="8文字以上" minlength="8" required>' +
        '<button type="submit" class="auth-submit">ログイン / 新規登録</button>' +
      '</form>' +
    '</div>';

  document.getElementById("authBack").addEventListener("click", function () {
    renderMyPage();
  });

  document.getElementById("authEmailForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = this.querySelector('input[type="email"]').value;
    setAuthUser({ name: email.split("@")[0], email: email, provider: "email" });
    renderMyPage();
  });
}

function renderLoggedIn(wrap, user) {
  var listCount = 0;
  try { listCount = JSON.parse(localStorage.getItem("gacha_mylist") || "[]").length; } catch (e) {}

  var providerLabel = { email: "メール", google: "Google", apple: "Apple", x: "X", line: "LINE" };
  var displayProvider = providerLabel[user.provider] || user.provider;

  wrap.innerHTML =
    '<div class="mypage-profile">' +
      '<div class="mypage-avatar">' +
        '<svg viewBox="0 0 24 24" fill="none" width="48" height="48"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M20 21c0-3.3-3.6-6-8-6s-8 2.7-8 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '</div>' +
      '<h1 class="mypage-name">' + (user.name || "ユーザー") + '</h1>' +
      '<p class="mypage-provider">' + displayProvider + 'でログイン中</p>' +
    '</div>' +

    '<div class="mypage-menu">' +
      '<a href="mylist.html" class="mypage-menu-item">' +
        '<span class="mypage-menu-icon"><svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></span>' +
        '<span class="mypage-menu-label">リスト</span>' +
        '<span class="mypage-menu-badge">' + listCount + '</span>' +
        '<span class="mypage-menu-arrow">→</span>' +
      '</a>' +
      '<a href="ranking.html" class="mypage-menu-item">' +
        '<span class="mypage-menu-icon"><svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 21h12M8 21V11h8v10M17 4h3v7h-3M4 8h3v13" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg></span>' +
        '<span class="mypage-menu-label">ランキング</span>' +
        '<span class="mypage-menu-arrow">→</span>' +
      '</a>' +
    '</div>' +

    '<div class="mypage-actions">' +
      '<button class="mypage-logout" id="logoutBtn">ログアウト</button>' +
    '</div>';

  document.getElementById("logoutBtn").addEventListener("click", function () {
    clearAuthUser();
    renderMyPage();
  });
}

document.addEventListener("DOMContentLoaded", renderMyPage);

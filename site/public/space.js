(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function koyu() { return document.documentElement.getAttribute('data-tema') === 'koyu'; }
  var c, x, W, H, S = [], D = Math.min(devicePixelRatio || 1, 2), loop = 0;
  function rs() {
    if (!c) return;
    W = innerWidth; H = innerHeight; c.width = W * D; c.height = H * D; x.setTransform(D, 0, 0, D, 0, 0);
    var n = Math.min(80, Math.round(W * H / 12000)); S = [];
    for (var i = 0; i < n; i++) S.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.1 + .2, v: Math.random() * .06 + .02 });
  }
  function dr() {
    if (!x) return;
    x.clearRect(0, 0, W, H);
    for (var i = 0; i < S.length; i++) {
      var s = S[i];
      if (!RM) { s.y += s.v; if (s.y > H) s.y = 0; }
      x.globalAlpha = .28; x.fillStyle = '#d5deea'; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;
  }
  function stars() {
    if (!koyu()) { if (c) { c.remove(); c = null; } return; }
    if (c) return;
    c = document.createElement('canvas'); c.id = 'sp-stars'; c.setAttribute('aria-hidden', 'true');
    document.body.prepend(c); x = c.getContext('2d'); rs();
    if (!RM && !loop) { loop = 1; (function lp() { if (c && !document.hidden) dr(); requestAnimationFrame(lp); })(); }
  }
  document.addEventListener('ea-tema', stars);
  addEventListener('resize', rs);
  stars();
  var b = document.createElement('button'); b.type = 'button'; b.className = 'sp-back';
  b.innerHTML = '<span aria-hidden="true">←</span> Geri'; b.setAttribute('aria-label', 'Geri dön');
  var home = location.pathname === '/' || location.pathname === '/index.html';
  function upd() { b.hidden = home && !location.hash && !document.querySelector('details[open]'); }
  b.onclick = function () {
    var op = document.querySelector('details[open]');
    if (op && !location.hash && home) { op.open = false; upd(); return; }
    var ref = document.referrer && document.referrer.indexOf(location.origin) === 0;
    if (history.length > 1 && (ref || location.hash)) history.back(); else location.href = '/';
  };
  document.body.appendChild(b); upd();
  addEventListener('hashchange', upd); addEventListener('popstate', upd);
  document.addEventListener('toggle', upd, true);
})();

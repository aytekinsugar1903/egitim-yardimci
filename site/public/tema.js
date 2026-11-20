/* Açık tema varsayılan. Koyu görünüm yalnız bu düğmeyle açılır. */
(function () {
  var K = 'ea-tema';
  function koyuMu() { return document.documentElement.getAttribute('data-tema') === 'koyu'; }
  function uygula(v) {
    if (v === 'koyu') document.documentElement.setAttribute('data-tema', 'koyu');
    else document.documentElement.removeAttribute('data-tema');
    var b = document.getElementById('eaTema');
    if (b) {
      b.textContent = v === 'koyu' ? 'Açık renk' : 'Koyu renk';
      b.setAttribute('aria-pressed', v === 'koyu' ? 'true' : 'false');
    }
    document.dispatchEvent(new Event('ea-tema'));
  }
  try { uygula(localStorage.getItem(K) === 'koyu' ? 'koyu' : ''); } catch (e) { uygula(''); }
  function yerlestir() {
    if (document.getElementById('eaTema')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'eaTema';
    b.className = 'ea-tema';
    b.addEventListener('click', function () {
      var n = koyuMu() ? '' : 'koyu';
      try { localStorage.setItem(K, n); } catch (e) {}
      uygula(n);
    });
    var header = document.querySelector('header.top .w') || document.body;
    header.appendChild(b);
    uygula(koyuMu() ? 'koyu' : '');
    menuKur();
  }
  function menuKur() {
    var nav = document.querySelector('header.top nav');
    if (!nav || nav.dataset.eaMenu) return;
    nav.dataset.eaMenu = '1';
    var ince = window.matchMedia('(hover: hover) and (pointer: fine)');
    function aciklar() { return nav.querySelectorAll('details.navdrop'); }
    function kapat(haric) {
      aciklar().forEach(function (d) { if (d !== haric) d.open = false; });
    }
    nav.addEventListener('toggle', function (e) {
      var d = e.target;
      if (!d || d.tagName !== 'DETAILS' || !d.open) return;
      kapat(d);
    }, true);
    document.addEventListener('click', function (e) {
      var menuBtn = e.target.closest && e.target.closest('.ea-hamburger');
      if (nav.contains(e.target) || menuBtn) return;
      kapat(null);
      nav.classList.remove('ea-acik');
      var hb = document.querySelector('.ea-hamburger');
      if (hb) { hb.setAttribute('aria-expanded', 'false'); hb.setAttribute('aria-label', 'Menüyü aç'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        kapat(null);
        nav.classList.remove('ea-acik');
        var hb = document.querySelector('.ea-hamburger');
        if (hb) hb.setAttribute('aria-expanded', 'false');
      }
    });
    aciklar().forEach(function (d) {
      var bek = 0;
      d.addEventListener('mouseenter', function () {
        if (!ince.matches || window.innerWidth <= 800) return;
        clearTimeout(bek);
        kapat(d);
        d.open = true;
      });
      d.addEventListener('mouseleave', function (e) {
        if (!ince.matches || window.innerWidth <= 800) return;
        if (d.contains(e.relatedTarget)) return;
        bek = setTimeout(function () { d.open = false; }, 220);
      });
    });
    nav.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      kapat(null);
      if (window.innerWidth <= 800) {
        nav.classList.remove('ea-acik');
        var hb = document.querySelector('.ea-hamburger');
        if (hb) hb.setAttribute('aria-expanded', 'false');
      }
    });
    if (!document.querySelector('.ea-hamburger')) {
      var h = document.createElement('button');
      h.type = 'button';
      h.className = 'ea-hamburger';
      h.textContent = 'Menü';
      h.setAttribute('aria-label', 'Menüyü aç');
      h.setAttribute('aria-expanded', 'false');
      h.setAttribute('aria-controls', 'eaAnaMenu');
      nav.id = nav.id || 'eaAnaMenu';
      h.addEventListener('click', function () {
        var ac = nav.classList.toggle('ea-acik');
        h.setAttribute('aria-expanded', ac ? 'true' : 'false');
        h.setAttribute('aria-label', ac ? 'Menüyü kapat' : 'Menüyü aç');
        if (!ac) kapat(null);
      });
      nav.parentNode.insertBefore(h, nav);
    }
  }
  if (document.body) yerlestir();
  else document.addEventListener('DOMContentLoaded', yerlestir);
})();

/* Rehberlik ekranları: sıcak palet, karşılama, tek açık menü. Resmi #doc stiline dokunulmaz. */
(function () {
  'use strict';
  var css = document.createElement('style');
  css.textContent = [
    'body{background:#fff4ec;color:#1c1915}',
    'header{background:#fffaf6;color:#1c1915;border-bottom:1px solid #f0d2c0}',
    'header h1{color:#1c1915}',
    'button{background:#c2410c;color:#fff;border-radius:14px;min-height:48px;font-weight:800}',
    'button.sec{background:#fff;color:#0f766e;border:2px solid #0f766e}',
    'button:hover{transform:translateY(-1px)}',
    '@media(prefers-reduced-motion:reduce){button:hover{transform:none}}',
    '.cat{background:#fff7ef;border-radius:16px}',
    '.ea-merhaba{font-weight:800;font-size:20px;margin:0 0 8px;color:#1c1915}',
    '.welcome{border:1px solid #f0d2c0!important;border-radius:16px!important;background:#fff7ef!important;color:#1c1915!important}',
    '.welcome b{color:#c2410c}',
    '#pwaKur{background:#fffaf6!important;color:#1c1915!important;border:2px solid #c2410c!important}',
    '#pwaKur a{color:#0f766e!important}',
    '#pwaKurYukle{background:#c2410c!important;color:#fff!important;border:0!important;border-radius:14px!important}',
    '.ea-rozet{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:9px;margin-right:8px;background:#fff}',
    '#rhbLisans{background:#fff4ec!important;color:#1c1915!important}',
    '#rhbLisans h1{color:#c2410c!important}',
    '#rhbLisans button{background:#c2410c!important;color:#fff!important;border-radius:14px!important}',
    '#rhbLisans button.sec{background:#fff!important;color:#0f766e!important;border:2px solid #0f766e!important}',
    '#rhbLisans a{color:#0f766e!important}',
    '@media print{#doc{color:#000;background:#fff}header,aside,.noprint,#rhbLisans{display:none!important}}'
  ].join('');
  document.head.appendChild(css);

  function rozetle() {
    var harita = [[/plan|yıllık|günlük/i, '📅', '#fff4d6'], [/tutanak|zümre|kurul|şök/i, '📋', '#e7f8f2'], [/rehber|bep|özel/i, '💬', '#e6fbf6'], [/veli/i, '👪', '#fff0e6'], [/sınav|yazılı/i, '✏️', '#fff6cc'], [/kulüp|sosyal/i, '🎨', '#fde8f3']];
    document.querySelectorAll('#cats .cat').forEach(function (c) {
      var b = c.querySelector(':scope > button');
      if (!b || b.querySelector('.ea-rozet')) return;
      var ad = (b.textContent || '');
      var sec = null;
      harita.forEach(function (x) { if (!sec && x[0].test(ad)) sec = x; });
      sec = sec || [null, '📄', '#fff7ef'];
      c.style.background = sec[2];
      var s = document.createElement('span');
      s.className = 'ea-rozet';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = sec[1];
      var ilk = b.firstChild;
      if (ilk) b.insertBefore(s, ilk); else b.appendChild(s);
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#cats .cat > button');
    if (!b || typeof open !== 'object') return;
    var ad = '';
    var sp = b.querySelector('span');
    if (sp) ad = sp.textContent.replace(/\s*\(\d+\)\s*$/, '').trim();
    if (b.getAttribute('aria-expanded') !== 'true') {
      Object.keys(open).forEach(function (k) { if (k !== ad) open[k] = false; });
    }
  }, true);
  if (typeof window.cats === 'function') {
    var ec = window.cats;
    window.cats = function () { var r = ec.apply(this, arguments); rozetle(); return r; };
    if (typeof open === 'object') {
      var acik = Object.keys(open).filter(function (k) { return open[k]; });
      if (acik.length > 1) {
        acik.slice(0, -1).forEach(function (k) { open[k] = false; });
        try { localStorage.setItem('oy_open', JSON.stringify(open)); } catch (e) {}
        window.cats();
      } else rozetle();
    } else rozetle();
  }
  if (typeof window.home === 'function') {
    var eh = window.home;
    window.home = function () {
      var r = eh.apply(this, arguments);
      var w = document.getElementById('work');
      if (w && !w.querySelector('.ea-merhaba')) {
        var p = document.createElement('p');
        p.className = 'ea-merhaba';
        p.textContent = 'Merhaba, bugün ne hazırlayalım?';
        w.insertBefore(p, w.firstChild);
      }
      return r;
    };
  }
  if (typeof window.profil === 'function') {
    var ep = window.profil;
    window.profil = function () {
      var r = ep.apply(this, arguments);
      var ph = { ad: 'Adınız Soyadınız', brans: 'Branşınız', okul: 'Okul adınız', il: 'İl', ilce: 'İlçe', mudur: 'Okul müdürünün adı', sinif: 'Örn. 9/A', zumre_baskani: 'Ad soyad' };
      document.querySelectorAll('#pform input, #dform input').forEach(function (i) {
        if (ph[i.name] && !i.placeholder) i.placeholder = ph[i.name];
      });
      return r;
    };
  }
  var w0 = document.getElementById('work');
  if (w0 && !w0.querySelector('.ea-merhaba') && /Hoş geldiniz|şablon hazır/.test(w0.textContent || '')) {
    var p0 = document.createElement('p');
    p0.className = 'ea-merhaba';
    p0.textContent = 'Merhaba, bugün ne hazırlayalım?';
    w0.insertBefore(p0, w0.firstChild);
  }
})();

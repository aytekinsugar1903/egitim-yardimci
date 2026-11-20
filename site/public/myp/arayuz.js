/* Evrak Asistanı · Müdür Yardımcısı arayüzü. Modüller, depo anahtarı ve lisans akışı durur. */
(function () {
  'use strict';
  var css = document.createElement('style');
  css.textContent = [
    'body{background:#fff4ec;color:#1c1915;font-size:18px}',
    'header{background:#fffaf6;color:#1c1915;border-bottom:1px solid #f0d2c0}',
    'header h1{color:#1c1915}',
    'header button,button{min-height:48px;border-radius:14px;font-weight:800;font-size:16px;transition:transform .15s ease}',
    'header button{background:#c2410c;color:#fff;border:0}',
    'button{background:#c2410c;border-color:#c2410c;color:#fff}',
    'button.sec{background:#fff;color:#0f766e;border:2px solid #0f766e}',
    'button:hover{transform:translateY(-1px)}',
    '.ea-merhaba{font-weight:800;font-size:20px}',
    '.evcard{border-color:#f0d2c0}',
    '.evcard{border-width:1px;border-radius:16px;box-shadow:0 8px 20px rgba(80,40,10,.05)}',
    'aside{background:#fff}',
    '.grp{border:0;border-radius:14px;overflow:hidden;box-shadow:0 1px 2px rgba(30,58,95,.08);background:#fff}',
    '.grp>button{min-height:52px;background:#f7f4ec;font-weight:800}',
    '.grp li button{min-height:48px;border-radius:10px}',
    '.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}',
    '.card{border-radius:14px;border:1px solid #d9d2c3;padding:12px;background:#fff}',
    '.ea-hizli{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin:8px 0 16px}',
    '.ea-hizli button{min-height:56px;text-align:left;background:#fff;color:#1c1915;border:2px solid #d9d2c3}',
    '.ea-alt{display:none}',
    '@media(max-width:800px){',
    'body{padding-bottom:76px}',
    '.ea-alt{display:grid;grid-template-columns:repeat(4,1fr);position:fixed;left:0;right:0;bottom:0;z-index:30;background:#fffdf8;border-top:1px solid #e4d8c4;padding:6px 4px calc(6px + env(safe-area-inset-bottom));gap:4px}',
    '.ea-alt button{background:transparent;color:#c2410c;border:0;min-height:48px;font-size:15px;font-weight:800}',
    '}',
    '@media print{.ea-alt,.ea-hizli{display:none!important}body{background:#fff;padding:0}}'
  ].join('');
  document.head.appendChild(css);

  var nav = document.createElement('nav');
  nav.className = 'ea-alt';
  nav.setAttribute('aria-label', 'Hızlı menü');
  [['dash', 'Panel'], ['uret', 'Evrak'], ['takvim', 'Takvim'], ['profil', 'Profil']].forEach(function (x) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = x[1];
    b.addEventListener('click', function () { if (typeof go === 'function') go(x[0]); });
    nav.appendChild(b);
  });
  document.body.appendChild(nav);

  if (typeof V !== 'undefined' && V.dash) {
    var eski = V.dash;
    V.dash = function () {
      eski();
      var w = document.getElementById('work');
      if (!w || w.querySelector('.ea-hizli')) return;
      var d = document.createElement('div');
      d.className = 'ea-hizli noprint';
      [['nobet', 'Nöbet planı'], ['uret', 'Evrak üret'], ['beceri', 'Alan şefliği'], ['sgorev', 'Sınav görev yazısı'], ['takvim', 'Bu haftanın takvimi'], ['check', 'Kontrol listesi']].forEach(function (x) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-go', x[0]);
        b.textContent = x[1];
        d.appendChild(b);
      });
      var h2 = w.querySelector('h2');
      if (!w.querySelector('.ea-merhaba')) {
        var m = document.createElement('p');
        m.className = 'ea-merhaba';
        m.textContent = 'Merhaba, bugün ne hazırlayalım?';
        w.insertBefore(m, w.firstChild);
      }
      if (h2 && h2.nextSibling) w.insertBefore(d, h2.nextSibling);
      else w.insertBefore(d, w.firstChild);
    };
    if (typeof cur !== 'undefined' && cur === 'dash') V.dash();
  }
  if (typeof NAV !== 'undefined') {
    NAV.push(['Alan şefliği', [['beceri', 'Beceri eğitimi dosyası'], ['sgorev', 'Sınav görev yazışması']]]);
    if (typeof nav === 'function') nav();
  }
  function rozetM() {
    var harita = [[/öğrenci|devam|nakil/i, '🎒', '#fff4d6'], [/personel|öğretmen/i, '👩‍🏫', '#e7f8f2'], [/yazı|evrak|resm/i, '📄', '#fff0e6'], [/nöbet|takvim/i, '🕒', '#fff6cc'], [/denetim|kontrol/i, '✅', '#e8f8ee'], [/rehber/i, '💬', '#e6fbf6'], [/alan|sınav/i, '🏫', '#fff1e4']];
    document.querySelectorAll('#nav .grp').forEach(function (c) {
      var b = c.querySelector(':scope > button');
      if (!b || b.querySelector('.ea-rozet')) return;
      var sec = null;
      harita.forEach(function (x) { if (!sec && x[0].test(b.textContent || '')) sec = x; });
      sec = sec || [null, '📁', '#fff7ef'];
      c.style.background = sec[2];
      var s = document.createElement('span');
      s.className = 'ea-rozet';
      s.setAttribute('aria-hidden', 'true');
      s.style.cssText = 'display:inline-grid;place-items:center;width:28px;height:28px;border-radius:9px;margin-right:8px';
      s.textContent = sec[1];
      b.insertBefore(s, b.firstChild);
    });
  }
  if (typeof window.nav === 'function') {
    var en = window.nav;
    window.nav = function () { var r = en.apply(this, arguments); rozetM(); return r; };
    rozetM();
  }
  function eaListe(baslik, metin, ids) {
    var h = '<h2>' + baslik + '</h2><p>' + metin + '</p><div class="ea-hizli">';
    ids.forEach(function (id) {
      var t = (typeof OY !== 'undefined' && OY.get) ? OY.get(id) : null;
      if (!t) return;
      h += '<button type="button" data-doc="oy:' + id + '" data-f="{}">' + t.baslik + '</button>';
    });
    h += '</div><p>Çıktı bu cihazda oluşur. Öğrenci kimlik numarası yazmayın.</p>';
    if (typeof W === 'function') W(h);
    else document.getElementById('work').innerHTML = h;
  }
  if (typeof V !== 'undefined') {
    V.beceri = function () {
      eaListe('Beceri eğitimi dosyası', 'Alan şefliği ve koordinatör izleme evrakı. Adlar bu pakete özgüdür.', ['be_dagilim', 'be_dekont', 'be_plan', 'be_devam', 'be_gun', 'be_ay', 'be_not', 'be_ziyaret', 'be_fesih']);
    };
    V.sgorev = function () {
      eaListe('Sınav görev yazışması', 'Öğretmenin görev isteği ve idarenin izleme listesi.', ['sg_istek', 'sg_izleme']);
    };
  }
})();

/* Evrak Asistanı · Müdür Yardımcısı arayüzü. Modüller, depo anahtarı ve lisans akışı durur. */
(function () {
  'use strict';
  var css = document.createElement('style');
  css.textContent = [
    'body{background:#f6f1e7;color:#1c1915;font-size:18px}',
    'header{background:#fffdf8;color:#1c1915;border-bottom:1px solid #e4d8c4}',
    'header h1{color:#1c1915}',
    'header button,button{min-height:48px;border-radius:12px;font-weight:800;font-size:16px}',
    'header button{background:#0f5c4c;color:#fff;border:0}',
    'button{background:#0f5c4c;border-color:#0f5c4c;color:#fff}',
    'button.sec{background:#fff;color:#0f5c4c;border:2px solid #0f5c4c}',
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
    '.ea-alt button{background:transparent;color:#0f5c4c;border:0;min-height:48px;font-size:15px;font-weight:800}',
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
      [['nobet', 'Nöbet planı'], ['uret', 'Evrak üret'], ['kurul', 'Kurullar'], ['sosyal', 'Sosyal etkinlik'], ['takvim', 'Bu haftanın takvimi'], ['check', 'Kontrol listesi']].forEach(function (x) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-go', x[0]);
        b.textContent = x[1];
        d.appendChild(b);
      });
      var h2 = w.querySelector('h2');
      if (h2 && h2.nextSibling) w.insertBefore(d, h2.nextSibling);
      else w.insertBefore(d, w.firstChild);
    };
    if (typeof cur !== 'undefined' && cur === 'dash') V.dash();
  }
})();

/* Ahtapot paneli – Satürn halkası: uygulamalar alt yoldan geçer, arkada kaybolur. */
(function () {
  var wrap = document.querySelector('.agwrap.ag-saturn');
  if (!wrap) return;
  var svg = wrap.querySelector('.agsvg');
  if (!svg) return;
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var APPS = [
    { href: '/evrak/', ad: 'Evrak Asistanı EBYS', kisa: 'EBYS', ozet: 'MEB EBYS’de evrak tarama, özet, cevap ve kayıt yardımcısı.', ic: 'doc', app: 'ebys' },
    { href: '/dys/', ad: 'Evrak Asistanı DYS', kisa: 'DYS', ozet: 'Sağlık Bakanlığı DYS’de evrak tarama, ek okuma ve taslak yardımcısı.', ic: 'board', app: 'dys' },
    { href: '/belgenet/', ad: 'Evrak Asistanı Belgenet', kisa: 'Belgenet', ozet: 'Belgenet (EDYS) kullanan kurumlar için evrak yardımcısı.', ic: 'search', app: 'belgenet' },
    { href: '/mudur-paketi/', ad: 'Müdür Paketi', kisa: 'Müdür Paketi', ozet: 'Evrak tarama ve günlü takip: süreler, kırmızı gecikenler ve “Kimde”.', ic: 'home', app: 'mudur' },
    { href: '/form-toplayici/', ad: 'Form Toplayıcı (Form Birleştirme)', kisa: 'Form Toplayıcı', ozet: 'Alt birim formlarını birleştirir, şablon bozulanı ayırır, takibi tutar.', ic: 'forms', app: 'formt' },
    { href: '/eokul/', ad: 'Okul Pro Devamsızlık Rapor Asistanı', kisa: 'Okul Pro', ozet: 'Rapor, veli izni, faaliyet, devamsızlık ve Not Girişi — e-Okul işleri yerelde.', ic: 'grad', app: 'eokul' },
    { href: '/ogretmen-yardimcisi/', ad: 'Öğretmen Yardımcısı', kisa: 'Öğretmen Yrd.', ozet: 'Yazılı, karne görüşü, zümre / ŞÖK, alan şefliği dosyası, sınav görev isteği ve Not Girişi.', ic: 'user', app: 'oy' },
    { href: '/mudur-yardimcisi/', ad: 'Müdür Yardımcısı', kisa: 'Müdür Yrd.', ozet: 'Nöbet, kadro, ders programı, alan şefliği dosyası, sınav görev izleme ve Not Girişi.', ic: 'users', app: 'myp' },
    { href: '/rehberlik/', ad: 'Rehberlik Yardımcısı', kisa: 'Rehberlik', ozet: 'Görüşme ve veli formları, risk haritası, BEP, yıllık plan, sınıf raporu ve okul icmali.', ic: 'heart', app: 'reh' },
    { href: '/muhasebe/', ad: 'Okul Muhasebe Asistanı', kisa: 'Muhasebe', ozet: 'KBS hak sahibi, doğrudan temin seti ve ek ders kontrolü.', ic: 'book', app: 'muh', yakinda: 1 }
  ];
  var PAL = {
    ebys: { a: '#60a5fa', b: '#1d4ed8', e: '#1e3a8a' },
    dys: { a: '#2dd4bf', b: '#0f766e', e: '#115e59' },
    belgenet: { a: '#c4b5fd', b: '#6d28d9', e: '#4c1d95' },
    mudur: { a: '#818cf8', b: '#3730a3', e: '#1e1b4b' },
    formt: { a: '#f472b6', b: '#be185d', e: '#9d174d' },
    eokul: { a: '#4ade80', b: '#15803d', e: '#14532d' },
    oy: { a: '#fb923c', b: '#c2410c', e: '#7c2d12' },
    myp: { a: '#f87171', b: '#b91c1c', e: '#7f1d1d' },
    reh: { a: '#e879f9', b: '#a21caf', e: '#701a75' },
    muh: { a: '#9ca3af', b: '#4b5563', e: '#1f2937' },
    veli: { a: '#9ca3af', b: '#4b5563', e: '#1f2937' }
  };
  /* 24x24 siluetler; rozet içinde ~%63 doluluk için 1.68 ölçek */
  var GLYPH = {
    ebys: '<path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path fill="#1e3a8a" opacity=".22" d="M14 2v5h5z"/><path fill="none" stroke="#1e3a8a" stroke-width="1.6" stroke-linecap="round" opacity=".5" d="M7.4 9.6h7.2M7.4 12.8h4.6"/><circle cx="16.6" cy="17.2" r="5" fill="#1e3a8a" stroke="#fff" stroke-width="1.3"/><path fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="M14.4 17.3l1.5 1.5 2.9-3.1"/>',
    dys: '<path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path fill="#115e59" opacity=".22" d="M14 2v5h5z"/><path fill="none" stroke="#115e59" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".6" d="M6.4 11.4h2.3l1.4-2.8 2 5.4 1.3-2.6h1.8"/><circle cx="16.6" cy="17.2" r="5" fill="#115e59" stroke="#fff" stroke-width="1.3"/><path fill="#fff" d="M15.8 14.4h1.6v2h2V18h-2v2h-1.6v-2h-2v-1.6h2z"/>',
    belgenet: '<rect x="1.8" y="4.6" width="17.4" height="13.2" rx="2.3"/><path fill="none" stroke="#4c1d95" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".5" d="M3.2 6.3l7.3 5.9 7.3-5.9"/><circle cx="17.8" cy="17.4" r="5" fill="#4c1d95" stroke="#fff" stroke-width="1.3"/><path fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M15.5 17.4h4.6M18.3 15.5l1.9 1.9-1.9 1.9"/>',
    mudur: '<path fill="none" stroke="#fff" stroke-width="1.9" d="M8.4 6.4V5a1.9 1.9 0 0 1 1.9-1.9h3.4A1.9 1.9 0 0 1 15.6 5v1.4"/><rect x="2.2" y="6.4" width="17.6" height="13" rx="2.4"/><path fill="none" stroke="#1e1b4b" stroke-width="1.3" opacity=".35" d="M2.6 11.8h16.8"/><circle cx="17.6" cy="17.4" r="5" fill="#1e1b4b" stroke="#fff" stroke-width="1.3"/><path fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M17.6 14.9v2.7l1.8 1.1"/>',
    formt: '<rect x="1.8" y="2.6" width="7.2" height="8.4" rx="1.5" opacity=".72"/><rect x="1.8" y="13" width="7.2" height="8.4" rx="1.5" opacity=".72"/><path fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M9.6 6.8c1.8 0 1.9 5.2 3.4 5.2M9.6 17.2c1.8 0 1.9-5.2 3.4-5.2"/><rect x="13" y="4.4" width="9.2" height="15.2" rx="1.9"/><path fill="none" stroke="#9d174d" stroke-width="1.5" stroke-linecap="round" opacity=".55" d="M15.2 8.6h4.8M15.2 11.8h4.8M15.2 15h3.2"/>',
    eokul: '<path fill-rule="evenodd" d="M4 5h16a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM2 9h20V7.2H2V9z"/><rect x="7" y="2" width="2.4" height="5" rx="1.1"/><rect x="14.6" y="2" width="2.4" height="5" rx="1.1"/><path fill="none" stroke="#14532d" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" d="M8 15.4l2.3 2.3 5.2-5.4"/>',
    oy: '<path d="M12 7.6c-1.6-1.2-3.5-1.4-5.1-.6C4.5 8.2 3.5 11.1 4.3 14.4c.9 3.6 3.3 6.8 5.4 6.8.9 0 1.4-.5 2.3-.5s1.4.5 2.3.5c2.1 0 4.5-3.2 5.4-6.8.8-3.3-.2-6.2-2.6-7.4-1.6-.8-3.5-.6-5.1.6z"/><path fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" d="M12 7.4c.1-2 .9-3.7 2.4-4.7"/><path d="M13.4 5.3c1.8-1.9 4-2.1 5.1-1.5-.6 1.9-2.7 3-5.1 1.5z" opacity=".85"/><path fill="none" stroke="#7c2d12" stroke-width="1.4" stroke-linecap="round" opacity=".35" d="M7.3 10.3c-.9.8-1.3 2-1.1 3.2"/>',
    myp: '<path d="M6 4h2.6a3.4 3.4 0 0 1 6.8 0H18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><rect x="8.6" y="2.4" width="6.8" height="3.6" rx="1.2" fill="#7f1d1d" opacity=".35"/><g fill="#7f1d1d" opacity=".45"><rect x="6.8" y="9" width="3" height="2.6" rx=".6"/><rect x="10.5" y="9" width="3" height="2.6" rx=".6"/><rect x="14.2" y="9" width="3" height="2.6" rx=".6"/><rect x="6.8" y="12.7" width="3" height="2.6" rx=".6"/><rect x="10.5" y="12.7" width="3" height="2.6" rx=".6"/><rect x="6.8" y="16.4" width="3" height="2.6" rx=".6"/><rect x="14.2" y="16.4" width="3" height="2.6" rx=".6"/></g><rect x="14.2" y="12.7" width="3" height="2.6" rx=".6" fill="#7f1d1d"/><rect x="10.5" y="16.4" width="3" height="2.6" rx=".6" fill="#7f1d1d"/>',
    reh: '<circle cx="8.2" cy="7" r="3.3"/><path d="M1.8 20.4c0-3.7 2.8-6.6 6.4-6.6 2.3 0 4.3 1.2 5.4 3v3.6z"/><path stroke="#701a75" stroke-width="1.3" d="M17.2 21.4s-5.4-3.3-5.4-7a2.9 2.9 0 0 1 5.4-1.5 2.9 2.9 0 0 1 5.4 1.5c0 3.7-5.4 7-5.4 7z"/>',
    muh: '<path fill-rule="evenodd" d="M5 1.6h14A2.4 2.4 0 0 1 21.4 4v16A2.4 2.4 0 0 1 19 22.4H5A2.4 2.4 0 0 1 2.6 20V4A2.4 2.4 0 0 1 5 1.6zm1.7 2.5h10.6v4.3H6.7V4.1zM7 11h2.5v2.5H7V11zm4.25 0h2.5v2.5h-2.5V11zm4.25 0H18v2.5h-2.5V11zM7 15.2h2.5V20H7v-4.8zm4.25 0h2.5v2.5h-2.5v-2.5zm4.25 0H18v2.5h-2.5v-2.5z"/>',
    veli: '<circle cx="8.2" cy="7.2" r="3.1"/><path d="M2.2 19.6c0-3.4 2.7-6 6-6s6 2.6 6 6"/><circle cx="16.4" cy="8.2" r="2.5"/><path d="M13 19.6c.2-2.4 1.8-4.4 4.2-5"/>'
  };
  function badgeSvg(app) {
    var p = PAL[app] || PAL.ebys;
    var g = GLYPH[app] || GLYPH.ebys;
    var id = 'sg-' + app;
    return '<svg viewBox="0 0 48 70" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="' + id + '" x1="8" y1="0" x2="42" y2="70">' +
          '<stop offset="0" stop-color="' + p.a + '"/>' +
          '<stop offset="1" stop-color="' + p.b + '"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + id + 'h" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#fff" stop-opacity=".48"/>' +
          '<stop offset=".4" stop-color="#fff" stop-opacity="0"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + id + 's" x1="0" y1="1" x2="0" y2="0">' +
          '<stop offset="0" stop-color="#000" stop-opacity=".26"/>' +
          '<stop offset=".38" stop-color="#000" stop-opacity="0"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect x="1" y="1" width="46" height="68" rx="12" fill="url(#' + id + ')" stroke="' + p.e + '" stroke-width="1.1"/>' +
      '<rect x="1" y="1" width="46" height="68" rx="12" fill="url(#' + id + 'h)"/>' +
      '<rect x="1" y="1" width="46" height="68" rx="12" fill="url(#' + id + 's)"/>' +
      '<rect x="2.4" y="2.2" width="43.2" height="20" rx="10" fill="#fff" fill-opacity=".13"/>' +
      '<rect x="15" y="59.5" width="18" height="2.6" rx="1.3" fill="#fff" fill-opacity=".42"/>' +
      '<g transform="translate(24 32) scale(1.26) translate(-12 -12)" fill="#fff" stroke="none">' + g + '</g>' +
      '</svg>';
  }

  /* ---------- DOM ---------- */
  var sahne = document.createElement('div');
  sahne.className = 'ag-sahne';
  svg.parentNode.insertBefore(sahne, svg);
  sahne.appendChild(svg);

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { if (attrs[k] != null) n.setAttribute(k, attrs[k]); });
    return n;
  }
  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  var yolArka = svgEl('svg', { 'class': 'saturn-yol arka', 'aria-hidden': 'true' });
  var yolOn = svgEl('svg', { 'class': 'saturn-yol on', 'aria-hidden': 'true' });
  function makeYol(host) {
    var g = svgEl('g', { 'class': 'sat-g' });
    host.appendChild(g);
    return g;
  }
  var gArka = makeYol(yolArka);
  var gOn = makeYol(yolOn);
  var pArka = svgEl('path', { 'class': 'sat-serit arka' });
  var pOn = svgEl('path', { 'class': 'sat-serit on' });
  var pIc = svgEl('path', { 'class': 'sat-cizgi' });
  gArka.appendChild(pArka);
  gOn.appendChild(pOn);
  gOn.appendChild(pIc);

  var appsUl = el('ul', 'saturn-apps', { role: 'list' });
  var nodes = APPS.map(function (a, i) {
    var li = el('li');
    var link = el('a', 'saturn-app' + (a.yakinda ? ' sat-soon' : ''), {
      href: a.href,
      'data-i': String(i),
      'data-app': a.app || '',
      'aria-label': a.ad + (a.yakinda ? ' · Yakında' : '')
    });
    link.innerHTML = '<span class="sat-ic" aria-hidden="true">' + badgeSvg(a.app) + '</span><span class="sat-ad">' + a.kisa + '</span>';
    if (a.yakinda) {
      var yk = el('span', 'sat-yakinda');
      yk.textContent = 'Yakında';
      link.appendChild(yk);
    }
    li.appendChild(link);
    appsUl.appendChild(li);
    return { li: li, a: link, data: a, i: i };
  });
  sahne.appendChild(appsUl);

  var okL = el('button', 'saturn-ok sol', { type: 'button', 'aria-label': 'Önceki uygulama' });
  okL.textContent = '‹';
  var okR = el('button', 'saturn-ok sag', { type: 'button', 'aria-label': 'Sonraki uygulama' });
  okR.textContent = '›';
  sahne.appendChild(okL);
  sahne.appendChild(okR);

  var bilgi = el('div', 'saturn-bilgi', { 'aria-live': 'polite' });
  bilgi.innerHTML = '<a class="saturn-ad" href="#"></a><p class="saturn-etiket">Ne işe yarar</p><p class="saturn-ozet"></p><a class="saturn-git" href="#">Sayfasına gidin →</a>';
  wrap.appendChild(bilgi);
  var onAd = bilgi.querySelector('.saturn-ad');
  var onOzet = bilgi.querySelector('.saturn-ozet');
  var onGit = bilgi.querySelector('.saturn-git');

  /* ---------- geometri ---------- */
  var n = APPS.length;
  var index = 0;
  var angle = 0;
  var stepping = 0, fromA = 0, toA = 0, startT = 0;
  var DUR = 960;
  var MS_PER_TURN = 5700;
  var paused = false, hovering = false, locked = false;
  var dragging = false, moved = false, drag = null, velA = 0, satDragged = false;
  var tilt = 0.29, userTilted = false;
  var lastT = 0, raf = 0;
  var geo = { cx: 450, cy: 428, rx: 392, ry: 96 };
  var sx = 1, sy = 1;

  function vb() {
    var v = svg.viewBox.baseVal;
    return { x: v.x, y: v.y, w: v.width, h: v.height };
  }
  function layout() {
    var v = vb();
    var sm = v.w < 700;
    geo.cx = v.w * 0.5;
    geo.cy = sm ? 195 : 175;
    geo.rx = sm ? 198 : 355;
    if (!userTilted) tilt = sm ? 0.48 : 0.29;
    geo.ry = geo.rx * Math.sin(tilt);
  }

  function pt(th) {
    var sa = Math.sin(tilt);
    return {
      x: geo.cx + geo.rx * Math.sin(th),
      y: geo.cy + geo.rx * sa * Math.cos(th),
      depth: Math.cos(th)
    };
  }
  /* Sürekli 3D karusel: ölçek / opaklık / bulanıklık, yörünge açısının (depth=cos θ) fonksiyonu.
     5 öndeki ikon görünür: merkez büyük, iki orta, iki uçta küçük; ani kesme yok. */
  function satScale(d) {
    var t = (d + 1) / 2;                     /* 0 arka … 1 ön */
    return 0.40 + 0.60 * Math.pow(t, 1.35);
  }
  function satOpacity(d) {
    var t = (d + 1) / 2;
    t = t * t * (3 - 2 * t);
    return 0.42 + 0.58 * t;
  }
  function satBlur(d) {
    return Math.max(0, (0.15 - d)) * 1.15;
  }
  function tanNorm(th, w) {
    var dx = geo.rx * Math.cos(th);
    var dy = -geo.ry * Math.sin(th);
    var len = Math.hypot(dx, dy) || 1;
    return { nx: -dy / len * w, ny: dx / len * w };
  }
  function ribbon(from, to, widthFn, steps) {
    var L = [], R = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var th = from + (to - from) * t;
      var p = pt(th);
      var w = widthFn(th, p.depth);
      var nrm = tanNorm(th, w);
      L.push(p.x + nrm.nx, p.y + nrm.ny);
      R.push(p.x - nrm.nx, p.y - nrm.ny);
    }
    var d = 'M' + L[0].toFixed(1) + ' ' + L[1].toFixed(1);
    for (i = 2; i < L.length; i += 2) d += 'L' + L[i].toFixed(1) + ' ' + L[i + 1].toFixed(1);
    for (i = R.length - 2; i >= 0; i -= 2) d += 'L' + R[i].toFixed(1) + ' ' + R[i + 1].toFixed(1);
    return d + 'Z';
  }
  function midLine(from, to, steps) {
    var d = '';
    for (var i = 0; i <= steps; i++) {
      var th = from + (to - from) * (i / steps);
      var p = pt(th);
      d += (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
    }
    return d;
  }
  function drawRoad() {
    // Ön: kalın yol (θ = -π/2 … π/2, alt yay). Arka: ince, soluk.
    pOn.setAttribute('d', ribbon(-Math.PI / 2, Math.PI / 2, function (th, depth) {
      return 14 + 18 * Math.pow(Math.max(0, depth), 0.9);
    }, 72));
    pOn.setAttribute('fill', '#c2410c');
    pOn.setAttribute('stroke', '#9a3412');
    pOn.setAttribute('stroke-width', '1.2');
    pIc.setAttribute('d', midLine(-Math.PI / 2.1, Math.PI / 2.1, 48));
    pIc.setAttribute('fill', 'none');
    pIc.setAttribute('stroke', '#ffedd5');
    pIc.setAttribute('stroke-width', '2.2');
    pIc.setAttribute('stroke-dasharray', '11 13');
    pIc.setAttribute('stroke-linecap', 'round');
    pIc.setAttribute('stroke-opacity', '0.8');
    pArka.setAttribute('d', ribbon(Math.PI / 2, Math.PI * 1.5, function (th, depth) {
      return 3.5 + 4.5 * Math.pow(Math.max(0, -depth), 0.85);
    }, 56));
    pArka.setAttribute('fill', '#c2410c');
    pArka.setAttribute('fill-opacity', '0.28');
  }

  function wrapIndex(i) { return ((i % n) + n) % n; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function guncelleOn() {
    var a = APPS[wrapIndex(index)];
    var label = a.ad + (a.yakinda ? ' · Yakında' : '');
    onAd.textContent = label;
    onAd.setAttribute('href', a.href);
    onOzet.textContent = a.ozet;
    onGit.setAttribute('href', a.href);
    nodes.forEach(function (nd) { nd.a.classList.toggle('onde', nd.i === wrapIndex(index)); });
    placeBilgi();
  }

  function placeBilgi() {
    var nd = nodes[wrapIndex(Math.round(angle))];
    if (!nd) return;
    var wr = wrap.getBoundingClientRect();
    var r = nd.li.getBoundingClientRect();
    var left = r.left + r.width / 2 - wr.left;
    var top = r.bottom - wr.top + 12;
    bilgi.style.left = left + 'px';
    bilgi.style.top = top + 'px';
    bilgi.style.bottom = 'auto';
    bilgi.style.transform = 'translateX(-50%)';
    bilgi.style.visibility = 'visible';
    bilgi.style.opacity = '1';
    var br = bilgi.getBoundingClientRect();
    var pad = (br.bottom + 16) - wr.bottom;
    var cur = parseFloat(getComputedStyle(wrap).paddingBottom) || 0;
    if (pad > 1) wrap.style.paddingBottom = (cur + pad) + 'px';
    else if (pad < -28 && cur > 0) wrap.style.paddingBottom = Math.max(0, cur + pad) + 'px';
    br = bilgi.getBoundingClientRect();
    var fr = nd.li.getBoundingClientRect();
    wrap.querySelectorAll('a.nd-link').forEach(function (el) {
      var er = el.getBoundingClientRect();
      var hitB = er.width > 2 && er.bottom > br.top - 6 && er.top < br.bottom + 6 && er.right > br.left + 6 && er.left < br.right - 6;
      var hitF = er.width > 2 && er.bottom > fr.top - 4 && er.top < fr.bottom + 4 && er.right > fr.left + 4 && er.left < fr.right - 4;
      el.classList.toggle('sat-altinda', hitB || hitF);
    });
  }

  function yerlestir(frac) {
    var step = (Math.PI * 2) / n;
    nodes.forEach(function (nd) {
      var th = (nd.i - frac) * step;
      while (th > Math.PI) th -= Math.PI * 2;
      while (th <= -Math.PI) th += Math.PI * 2;
      var p = pt(th);
      var d = p.depth;
      var fade = satOpacity(d);
      var scale = satScale(d);
      var blur = satBlur(d);
      var ic = nd.a.querySelector('.sat-ic');
      var icH = (ic && ic.offsetHeight) || 160;
      nd.li.style.left = (p.x * sx) + 'px';
      nd.li.style.top = (p.y * sy) + 'px';
      nd.li.style.opacity = fade.toFixed(3);
      nd.li.style.zIndex = d < -0.05 ? String(1 + Math.round((d + 1) * 40)) : String(300 + Math.round(d * 200));
      nd.a.classList.toggle('arkada', d < -0.05);
      nd.li.style.transformOrigin = '50% ' + (icH / 2) + 'px';
      nd.li.style.transform = 'translate(-50%, -' + (icH / 2) + 'px) scale(' + scale.toFixed(4) + ')';
      nd.li.style.filter = blur > 0.08 ? ('blur(' + blur.toFixed(2) + 'px)') : 'none';
      nd.li.style.pointerEvents = d > -0.05 ? 'auto' : 'none';
      nd.a.tabIndex = d > 0.3 ? 0 : -1;
      nd.li.setAttribute('aria-hidden', d < -0.05 ? 'true' : 'false');
    });
    placeBilgi();
  }

  function placeArrows() {
    var w = sahne.clientWidth || svg.getBoundingClientRect().width;
    var smv = w < 640;
    var kenar = smv ? 24 : 34;
    var y = smv ? 46 * sy : (geo.cy + geo.ry * 0.55) * sy;      /* masaüstünde ön sıra hizası, telefonda üst köşeler */
    okL.style.left = kenar + 'px';
    okL.style.top = y + 'px';
    okR.style.left = (w - kenar) + 'px';
    okR.style.top = y + 'px';
  }
  function fitOverlay() {
    var r = svg.getBoundingClientRect();
    var v = vb();
    sx = r.width / (v.w || 1);
    sy = r.height / (v.h || 1);
    placeArrows();
    yerlestir(angle);
  }

  function setFrontFromAngle() {
    var ni = wrapIndex(Math.round(angle));
    if (ni !== index) { index = ni; guncelleOn(); }
  }

  function don(delta) {
    var hedef = wrapIndex(Math.round(angle)) + delta;
    if (RM) {
      angle = wrapIndex(hedef);
      index = angle;
      guncelleOn();
      yerlestir(angle);
      return;
    }
    var cur = angle;
    var dlt = hedef - cur;
    while (dlt > n / 2) { hedef -= n; dlt = hedef - cur; }
    while (dlt < -n / 2) { hedef += n; dlt = hedef - cur; }
    fromA = angle; toA = hedef; stepping = 1; startT = performance.now();
    velA = 0;
  }

  function kare(ts) {
    var dt = lastT ? Math.min(48, ts - lastT) : 16;
    lastT = ts;
    if (dragging) {
      /* açı pointermove'da güncellenir */
    } else if (stepping) {
      var p = Math.min(1, (ts - startT) / DUR);
      angle = fromA + (toA - fromA) * ease(p);
      yerlestir(angle);
      if (p >= 1) {
        stepping = 0;
        angle = toA;
        while (angle >= n) angle -= n;
        while (angle < 0) angle += n;
        index = wrapIndex(Math.round(angle));
        guncelleOn();
        yerlestir(angle);
        velA = 0;
      }
    } else if (!locked) {
      var dts = dt / 1000;
      var auto = RM ? 0 : (1000 / MS_PER_TURN);
      var target = appHover ? 0 : (hovering ? auto * 0.2 : auto);
      velA += (target - velA) * Math.min(1, dts * 1.6);
      angle += velA * dts;
      if (angle >= n) angle -= n;
      if (angle < 0) angle += n;
      setFrontFromAngle();
      yerlestir(angle);
    }
    raf = requestAnimationFrame(kare);
  }

  var appHover = false;
  nodes.forEach(function (nd) {
    nd.a.addEventListener('mouseenter', function () { appHover = true; });
    nd.a.addEventListener('mouseleave', function () { appHover = false; });
  });
  okL.addEventListener('click', function () { don(-1); });
  okR.addEventListener('click', function () { don(1); });

  nodes.forEach(function (nd) {
    nd.a.addEventListener('click', function (e) {
      if (satDragged) { e.preventDefault(); e.stopPropagation(); return; }
      var front = wrapIndex(Math.round(angle));
      if (nd.i !== front) {
        e.preventDefault();
        var dlt = nd.i - front;
        while (dlt > n / 2) dlt -= n;
        while (dlt < -n / 2) dlt += n;
        don(dlt);
      }
      // merkez: varsayılan navigasyon
    });
  });

  sahne.style.touchAction = 'none';
  sahne.style.cursor = 'grab';
  function onDragMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    var now = performance.now(), pdt = Math.max(1, now - drag.t);
    if (!moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) {
      moved = true;
      dragging = true;
      stepping = 0;
      locked = false;
      sahne.classList.add('grab');
      sahne.style.cursor = 'grabbing';
      try { sahne.setPointerCapture(e.pointerId); } catch (er) {}
    }
    if (!moved) return;
    if (e.cancelable) e.preventDefault();
    var w = sahne.getBoundingClientRect().width || 600;
    var kAng = 2.6 / w * n / 2;
    var kTilt = 2.6 / w * Math.PI * 0.45;
    angle += dx * kAng;
    tilt = Math.max(0.10, Math.min(0.78, tilt + dy * kTilt));
    userTilted = true;
    velA = velA * 0.6 + (dx * kAng / pdt * 1000) * 0.4;
    drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
    while (angle >= n) angle -= n;
    while (angle < 0) angle += n;
    setFrontFromAngle();
    geo.ry = geo.rx * Math.sin(tilt);
    yerlestir(angle);
    placeArrows();
  }
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    if (moved) satDragged = true;
    try { if (moved) sahne.releasePointerCapture(drag.id); } catch (er) {}
    drag = null;
    dragging = false;
    sahne.classList.remove('grab');
    sahne.style.cursor = 'grab';
    removeEventListener('pointermove', onDragMove, true);
    removeEventListener('pointerup', endDrag, true);
    removeEventListener('pointercancel', endDrag, true);
  }
  sahne.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    if (e.target.closest && e.target.closest('.saturn-ok')) return;
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, sx: e.clientX, sy: e.clientY, id: e.pointerId };
    moved = false;
    satDragged = false;
    addEventListener('pointermove', onDragMove, { capture: true, passive: false });
    addEventListener('pointerup', endDrag, true);
    addEventListener('pointercancel', endDrag, true);
  });

  function duraklat() { hovering = true; }
  function devam() { hovering = false; }
  sahne.addEventListener('mouseenter', duraklat);
  sahne.addEventListener('mouseleave', devam);
  bilgi.addEventListener('mouseenter', duraklat);
  bilgi.addEventListener('mouseleave', devam);
  sahne.addEventListener('focusin', duraklat);
  sahne.addEventListener('focusout', function (e) {
    if (!sahne.contains(e.relatedTarget) && !bilgi.contains(e.relatedTarget)) devam();
  });
  bilgi.addEventListener('focusin', duraklat);
  bilgi.addEventListener('focusout', function (e) {
    if (!sahne.contains(e.relatedTarget) && !bilgi.contains(e.relatedTarget)) devam();
  });

  addEventListener('resize', function () { layout(); fitOverlay(); });
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () { layout(); fitOverlay(); }).observe(svg);
  }

  guncelleOn();
  layout();
  fitOverlay();
  lastT = 0;
  raf = requestAnimationFrame(kare);
  wrap._saturnArms = function () {
    var step = (Math.PI * 2) / n;
    return nodes.map(function (nd) {
      var th = (nd.i - angle) * step;
      while (th > Math.PI) th -= Math.PI * 2;
      while (th <= -Math.PI) th += Math.PI * 2;
      var p = pt(th);
      var d = p.depth;
      var ic = nd.a.querySelector('.sat-ic');
      var icH = (ic && ic.offsetHeight) || 160;
      var pad = (icH * 0.5 * satScale(d)) / (sy || 1);
      return {
        k: nd.data.app, i: nd.i, x: p.x, y: p.y, depth: d,
        fade: satOpacity(d), th: th, pad: pad,
        curl: nd.i % 2 ? 1 : -1, scale: satScale(d)
      };
    });
  };
  wrap._saturnGeo = function () { return { cx: geo.cx, cy: geo.cy, rx: geo.rx, ry: geo.ry }; };
  wrap._saturnTo = function (i) {
    locked = true; stepping = 0; velA = 0; dragging = false;
    angle = index = wrapIndex(i);
    guncelleOn(); yerlestir(angle);
  };
  wrap._saturnAt = function (frac) {
    locked = true; stepping = 0; velA = 0; dragging = false;
    angle = frac;
    while (angle >= n) angle -= n;
    while (angle < 0) angle += n;
    index = wrapIndex(Math.round(angle));
    guncelleOn(); yerlestir(angle);
  };
})();

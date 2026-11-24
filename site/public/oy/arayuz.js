/* Evrak Asistanı · Öğretmen Yardımcısı arayüzü. Mevcut şablon, depo anahtarı ve lisans akışı durur. */
(function () {
  'use strict';
  var css = document.createElement('style');
  css.id = 'ea-oy-arayuz';
  css.textContent = [
    '#eaTema,label.ea-tema,.ea-tema{display:none!important}',
    ':root{--ea-k:#c2410c;--ea-k2:#0f766e;--ea-z:#fff4ec;--ea-c:#fff;--ea-ciz:#f0d2c0;--ea-y:#b45309}',
    'body{background:var(--ea-z);color:#1c1915;font-size:18px}',
    'header{background:#fffaf6;color:#1c1915;border-bottom:1px solid var(--ea-ciz);padding:12px 14px;gap:8px}',
    'header h1{font-size:20px;color:#1c1915}',
    'header button,button{min-height:48px;border-radius:14px;padding:10px 16px;font-size:16px;transition:transform .15s ease,box-shadow .15s ease}',
    'header button{background:#c2410c;color:#fff;border:0;font-weight:800}',
    'button{background:#c2410c;border-color:#c2410c;color:#fff;font-weight:800}',
    'button.sec{background:#fff;color:#0f766e;border:2px solid #0f766e}',
    'button:hover{transform:translateY(-1px)}',
    '@media(prefers-reduced-motion:reduce){button:hover{transform:none}}',
    'main{background:transparent}',
    'aside{background:#fff;border-right:1px solid var(--ea-ciz)}',
    '#q{border:2px solid var(--ea-k);border-radius:12px;min-height:48px}',
    '.cat{border:0;background:#fff;border-radius:14px;box-shadow:0 1px 2px rgba(30,58,95,.08);overflow:hidden}',
    '.cat>button{min-height:52px;background:#f7f4ec;color:#1c1915;font-weight:800}',
    '.cat li button{min-height:48px;border-radius:10px;border:1px solid var(--ea-ciz);font-weight:650}',
    '.cat li button.on{background:var(--ea-k);color:#fff;border-color:var(--ea-k)}',
    'section#work{background:transparent}',
    '.form{background:#fff;border:1px solid var(--ea-ciz);border-radius:16px}',
    '.bar button{min-height:48px}',
    '.ea-merhaba{font-weight:800;font-size:20px;margin:0 0 8px}',
    '.ea-rozet{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:9px;margin-right:8px}',
    '.ea-tarih{display:inline-block;background:#fde68a;color:#1c1915;font-weight:800;border-radius:999px;padding:4px 10px;margin-right:8px}',
    '.ea-panel{margin-top:8px}',
    '.ea-kutu{background:#fff;border:1px solid var(--ea-ciz);border-radius:16px;padding:14px;margin:0 0 14px;box-shadow:0 1px 2px rgba(30,58,95,.06)}',
    '.ea-kutu h2{border:0;margin:0 0 6px;font-size:22px}',
    '.ea-satir{display:flex;flex-wrap:wrap;gap:8px}',
    '.ea-kart{min-height:52px;text-align:left;background:#fff;color:#1c1915;border:2px solid var(--ea-ciz);border-radius:14px;padding:10px 12px;font-weight:800}',
    '.ea-kart.on,.ea-kart:hover{border-color:var(--ea-k);background:#eef3fa}',
    '.ea-kart small{display:block;font-weight:600;color:#5c564c}',
    '.ea-adim{font-size:13px;font-weight:800;letter-spacing:.06em;color:var(--ea-y);margin:0 0 6px}',
    '.ea-sss details{background:#fff;border:1px solid var(--ea-ciz);border-radius:12px;padding:4px 12px;margin:8px 0}',
    '.ea-sss summary{min-height:44px;display:flex;align-items:center;font-weight:800;cursor:pointer}',
    '.ea-alt{display:none}',
    '@media(max-width:800px){',
    'body{padding-bottom:76px}',
    'aside{border-right:0;border-bottom:1px solid var(--ea-ciz)}',
    '#doc{padding:16px}',
    '.ea-alt{display:grid;grid-template-columns:repeat(4,1fr);position:fixed;left:0;right:0;bottom:0;z-index:30;background:#fffdf8;border-top:1px solid #e4d8c4;padding:6px 4px calc(6px + env(safe-area-inset-bottom));gap:4px}',
    '.ea-alt button{background:transparent;color:#c2410c;border:0;min-height:48px;font-size:15px;font-weight:800;border-radius:10px}',
    '.ea-kart{flex:1 1 100%}',
    '}',
    '@media(min-width:801px){.ea-kart{flex:1 1 180px}}',
    '@media print{',
    '.ea-alt,.ea-panel,header,aside,.noprint,.bar,.form{display:none!important}',
    'body{background:#fff;padding:0}',
    '#doc{border:0;box-shadow:none;max-width:none;margin:0;padding:0}',
    '}'
  ].join('');
  document.head.appendChild(css);

  var LIMIT = 2;
  var SAYAC = 'oy_ucretsiz_sayac_v1';
  function egitimYili() {
    try { if (typeof OY !== 'undefined' && OY.egitimYili) return OY.egitimYili(); } catch (e) {}
    return '2026-2027';
  }
  function proMu() {
    try {
      var a = JSON.parse(localStorage.getItem('ey_acct') || 'null');
      var e = a && a.ent && a.ent.oy;
      return !!(e && e.exp > Date.now());
    } catch (err) { return false; }
  }
  function sayacOku() {
    var y = egitimYili();
    try {
      var s = JSON.parse(localStorage.getItem(SAYAC) || 'null') || {};
      if (s.yil !== y) s = { yil: y, n: {} };
      s.n = s.n || {};
      return s;
    } catch (e) { return { yil: y, n: {} }; }
  }
  function turId() {
    try { if (typeof cur !== 'undefined' && cur && cur.id) return String(cur.id); } catch (e) {}
    return 'genel';
  }
  function nazik() {
    var t = 'Ücretsiz sürümde bu evrak türünden eğitim yılında 2 çıktı var; hak doldu. Yazdığınız metin bu cihazda duruyor. Sınırsız üretim için Fiyatlar sayfasına bakabilirsiniz.';
    if (typeof msg === 'function') { msg(t, 1); return; }
    var w = document.getElementById('work');
    if (!w) return;
    var d = document.createElement('div');
    d.className = 'msg err noprint';
    d.textContent = t;
    w.insertBefore(d, w.firstChild);
  }
  function ciktiIzni() {
    if (proMu()) return true;
    var s = sayacOku();
    var id = turId();
    var k = s.n[id] || 0;
    if (k >= LIMIT) { nazik(); return false; }
    s.n[id] = k + 1;
    try { localStorage.setItem(SAYAC, JSON.stringify(s)); } catch (e) {}
    return true;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('#bDocx,#bPdf,#bPrint,#yzDocx');
    if (!b) return;
    if (!ciktiIzni()) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  var nav = document.createElement('nav');
  nav.className = 'ea-alt';
  nav.setAttribute('aria-label', 'Hızlı menü');
  [['ana', 'Ana sayfa'], ['liste', 'Şablonlar'], ['profil', 'Profil'], ['hesap', 'Hesap']].forEach(function (x) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = x[1];
    b.setAttribute('data-ea', x[0]);
    nav.appendChild(b);
  });
  document.body.appendChild(nav);
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var k = b.getAttribute('data-ea');
    if (k === 'ana' && typeof home === 'function') home();
    else if (k === 'liste') { var t = document.getElementById('asideTg'); if (t) t.click(); }
    else if (k === 'profil') { var p = document.getElementById('bProfil'); if (p) p.click(); }
    else if (k === 'hesap') { var h = document.getElementById('bHesap'); if (h) h.click(); }
  });

  var SEC = 'oy_secim_v1';
  function okuSec() { try { return JSON.parse(localStorage.getItem(SEC) || 'null') || {}; } catch (e) { return {}; } }
  function yazSec(s) { try { localStorage.setItem(SEC, JSON.stringify(s)); } catch (e) {} }
  function iso(d) { var z = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
  function pazartesi(d) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var g = x.getDay();
    x.setDate(x.getDate() + (g === 0 ? -6 : 1 - g));
    return x;
  }
  function hafta() {
    var tak = (typeof MEBDEF !== 'undefined' && MEBDEF.takvim) ? MEBDEF.takvim : { bas: '2026-09-14', son: '2027-06-25' };
    var p = String(tak.bas || '2026-09-14').split('-');
    var bas = new Date(+p[0], +p[1] - 1, +p[2]);
    var bugun = new Date();
    var h0 = pazartesi(bas), h1 = pazartesi(bugun);
    var no = Math.round((h1 - h0) / 86400000 / 7) + 1;
    if (no < 1) no = 1;
    var bit = new Date(h1); bit.setDate(bit.getDate() + 4);
    var tatil = '';
    (tak.tatilHafta || []).forEach(function (t) {
      if (!t || !t[0]) return;
      var a = String(t[0]).split('-');
      var g = new Date(+a[0], +a[1] - 1, +a[2]);
      if (g >= h1 && g <= bit) tatil = t[1] || 'Tatil haftası';
    });
    return { no: no, bas: h1, bit: bit, yil: tak.yil || '2026-2027', tatil: tatil, ay: bugun.getMonth() + 1 };
  }
  function dersler(sinif) {
    var s = String(sinif), out = [], gor = {};
    var L = (window.TYMMK && TYMMK.liste) || [];
    L.forEach(function (x) {
      if (String(x.s) !== s) return;
      var ad = String(x.d || '').replace(/ Dersi\b.*$/, '').replace(/ Dersi$/, '');
      if (!ad || gor[ad]) return;
      gor[ad] = 1; out.push(ad);
    });
    out.sort(function (a, b) { return a.localeCompare(b, 'tr'); });
    return out;
  }
  function bul(re, n) {
    var a = [];
    (OY.T || []).forEach(function (t) { if (re.test((t.baslik || '') + ' ' + (t.kat || ''))) a.push(t); });
    return a.slice(0, n || 8);
  }
  var TURLER = [
    ['Yıllık plan', /yıllık plan|ünitelendirilmiş/i],
    ['Günlük plan', /günlük ders planı/i],
    ['Maarif Modeli', /Maarif Modeli|öğrenme çıkt|beceri temelli|öğrenme kanıt|süreç değerlendirme/i],
    ['Zümre tutanağı', /zümre öğretmen/i],
    ['ŞÖK tutanağı', /şube öğretmenler|şök/i],
    ['BEP', /\bBEP\b|bireyselleştirilmiş|ZEP/i],
    ['Kulüp raporu', /kulüp|sosyal etkinlik|toplum hizmet/i],
    ['Veli toplantısı', /veli toplant/i],
    ['Rehberlik', /rehberlik|gözlem formu|görüşme formu/i],
    ['Egzersiz / DYK', /egzersiz|DYK|İYEP|haftalık çalışma/i],
    ['Yazılı', /yazılı|sınav|rubrik/i],
    ['Alan şefliği', /alan şef|işyeri|koordinatör|beceri dönemi|dekont|sözleşmesi sonlandırma/i],
    ['Sınav görev yazısı', /sınav görev|görev isteği/i]
  ];
  function onDoldur(id, sec, H) {
    if (id === 'yplan') {
      try {
        var YS = JSON.parse(localStorage.getItem('oy_yplan') || 'null');
        if (YS) {
          if (!YS.ders && sec.ders) YS.ders = sec.ders;
          if (!YS.sinif && sec.sinif) YS.sinif = String(sec.sinif);
          localStorage.setItem('oy_yplan', JSON.stringify(YS));
        }
      } catch (e) {}
      return;
    }
    var cur = {};
    try { cur = JSON.parse(localStorage.getItem('oy_f_' + id) || 'null') || {}; } catch (e) {}
    if (!cur.sinif && sec.sinif) cur.sinif = sec.sinif + '. sınıf';
    if (!cur.ders && sec.ders) cur.ders = sec.ders;
    if (!cur.egitim_yili) cur.egitim_yili = H.yil;
    if (!cur.hafta) cur.hafta = String(H.no);
    if (!cur.baslangic) cur.baslangic = iso(H.bas);
    if (!cur.bitis) cur.bitis = iso(H.bit);
    try { localStorage.setItem('oy_f_' + id, JSON.stringify(cur)); } catch (e) {}
  }
  function ac(id) {
    var sec = okuSec(), H = hafta();
    onDoldur(id, sec, H);
    if (typeof sel === 'function') sel(id);
  }
  function btn(ad, alt, fn) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ea-kart';
    b.appendChild(document.createTextNode(ad));
    if (alt) { var s = document.createElement('small'); s.textContent = alt; b.appendChild(s); }
    b.addEventListener('click', fn);
    return b;
  }
  function ciz(panel) {
    panel.innerHTML = '';
    panel.className = 'ea-panel noprint';
    var H = hafta(), sec = okuSec();
    var kutu = document.createElement('section');
    kutu.className = 'ea-kutu';
    var selam = document.createElement('p');
    selam.className = 'ea-merhaba';
    selam.textContent = 'Merhaba, bugün ne hazırlayalım?';
    panel.appendChild(selam);
    kutu.innerHTML = '<p class="ea-adim">BU HAFTA</p>';
    var h = document.createElement('h2');
    var roz = document.createElement('span');
    roz.className = 'ea-tarih';
    roz.textContent = H.no + '. hafta';
    h.appendChild(roz);
    h.appendChild(document.createTextNode(H.yil));
    kutu.appendChild(h);
    var p = document.createElement('p');
    p.textContent = H.bas.toLocaleDateString('tr-TR') + ' – ' + H.bit.toLocaleDateString('tr-TR') + (H.tatil ? ' · ' + H.tatil : '') + '. Bu haftanın evrakı seçime ve yıllık plana göre listelenir; kazanım kodu uydurulmaz.';
    kutu.appendChild(p);
    if (!proMu()) {
      var u = document.createElement('p');
      u.textContent = 'Ücretsiz sürüm açıktır: her evrak türünden eğitim yılında 2 çıktı. Lisanslı hesapta sınır yoktur. 48 saatlik deneme bağlantıları ayrıca durur.';
      kutu.appendChild(u);
    }
    var unite = null;
    try {
      var YS = JSON.parse(localStorage.getItem('oy_yplan') || 'null');
      if (YS && YS.uniteler) {
        var acc = 0, i;
        for (i = 0; i < YS.uniteler.length; i++) {
          var w = +YS.uniteler[i].hafta || 0;
          if (H.no > acc && H.no <= acc + w) { unite = YS.uniteler[i]; break; }
          acc += w;
        }
      }
    } catch (e) {}
    var up = document.createElement('p');
    up.textContent = unite && unite.ad ? ('Yıllık plandaki ünite: ' + unite.ad) : 'Yıllık planı dersinizle hazırladığınızda bu haftanın ünitesi burada görünür.';
    kutu.appendChild(up);
    var oner = document.createElement('div');
    oner.className = 'ea-satir';
    var ayRe = {
      9: /yıllık plan|zümre öğretmen|kulüp yıllık|veli toplant/i,
      10: /şube öğretmen|günlük ders|yazılı/i,
      11: /yazılı|kulüp aylık|şube öğretmen/i,
      12: /zümre|kulüp/i,
      1: /dönem|karne|zümre/i,
      2: /zümre|şube öğretmen|günlük/i,
      3: /yazılı|kulüp|şube/i,
      4: /veli toplant|kulüp/i,
      5: /yıl sonu|kulüp|BEP/i,
      6: /yıl sonu|kulüp yıl/i
    }[H.ay] || /yıllık plan|günlük ders|kulüp/i;
    bul(ayRe, 4).forEach(function (t) {
      oner.appendChild(btn(t.baslik, t.kat, function () { ac(t.id); }));
    });
    oner.appendChild(btn('Bu haftanın egzersiz / DYK planı', 'Konu sizde, hafta dolu gelir', function () { ac('egz_haftalik'); }));
    kutu.appendChild(oner);
    panel.appendChild(kutu);

    var secim = document.createElement('section');
    secim.className = 'ea-kutu';
    secim.innerHTML = '<p class="ea-adim">1 · KADEME</p><h2>Evrak seç</h2>';
    var kad = document.createElement('div');
    kad.className = 'ea-satir';
    [['ilk', 'İlkokul', '1–4'], ['orta', 'Ortaokul', '5–8'], ['lise', 'Lise', '9–12']].forEach(function (k) {
      var b = btn(k[1], k[2], function () { var s = okuSec(); s.kademe = k[0]; s.sinif = ''; yazSec(s); ciz(panel); });
      if (sec.kademe === k[0]) b.classList.add('on');
      kad.appendChild(b);
    });
    secim.appendChild(kad);
    var siniflar = sec.kademe === 'ilk' ? [1, 2, 3, 4] : sec.kademe === 'orta' ? [5, 6, 7, 8] : sec.kademe === 'lise' ? [9, 10, 11, 12] : [];
    if (siniflar.length) {
      var sBas = document.createElement('p');
      sBas.className = 'ea-adim';
      sBas.textContent = '2 · SINIF';
      secim.appendChild(sBas);
      var sr = document.createElement('div');
      sr.className = 'ea-satir';
      siniflar.forEach(function (n) {
        var b = btn(n + '. sınıf', '', function () { var s = okuSec(); s.sinif = n; s.ders = ''; yazSec(s); ciz(panel); });
        if (String(sec.sinif) === String(n)) b.classList.add('on');
        sr.appendChild(b);
      });
      secim.appendChild(sr);
    }
    if (sec.sinif) {
      var dBas = document.createElement('p');
      dBas.className = 'ea-adim';
      dBas.textContent = '3 · DERS';
      secim.appendChild(dBas);
      var selD = document.createElement('select');
      selD.setAttribute('aria-label', 'Ders');
      selD.style.minHeight = '48px';
      selD.style.width = '100%';
      var o0 = document.createElement('option');
      o0.value = '';
      o0.textContent = 'Ders seçin';
      selD.appendChild(o0);
      var ds = dersler(sec.sinif);
      if (!ds.length) ds = ['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce', 'Din Kültürü ve Ahlak Bilgisi'];
      ds.forEach(function (d) {
        var o = document.createElement('option');
        o.value = d; o.textContent = d;
        if (sec.ders === d) o.selected = true;
        selD.appendChild(o);
      });
      selD.addEventListener('change', function () { var s = okuSec(); s.ders = selD.value; yazSec(s); ciz(panel); });
      secim.appendChild(selD);
    }
    if (sec.ders) {
      var eBas = document.createElement('p');
      eBas.className = 'ea-adim';
      eBas.textContent = '4 · EVRAK TÜRÜ';
      secim.appendChild(eBas);
      var er = document.createElement('div');
      er.className = 'ea-satir';
      TURLER.forEach(function (t) {
        var b = btn(t[0], '', function () { var s = okuSec(); s.tur = t[0]; yazSec(s); ciz(panel); });
        if (sec.tur === t[0]) b.classList.add('on');
        er.appendChild(b);
      });
      secim.appendChild(er);
      var tur = TURLER.filter(function (t) { return t[0] === sec.tur; })[0];
      if (tur) {
        var lr = document.createElement('div');
        lr.className = 'ea-satir';
        var liste = bul(tur[1], 12);
        if (!liste.length) {
          var bos = document.createElement('p');
          bos.textContent = 'Bu türde şablon bulunamadı. Soldaki listeden de arayabilirsiniz.';
          secim.appendChild(bos);
        }
        liste.forEach(function (t) { lr.appendChild(btn(t.baslik, 'Aç · indir · yazdır', function () { ac(t.id); })); });
        secim.appendChild(lr);
      }
    }
    panel.appendChild(secim);

    var egz = document.createElement('section');
    egz.className = 'ea-kutu';
    egz.innerHTML = '<p class="ea-adim">EGZERSİZ PLANLARI</p><h2>DYK, egzersiz, haftalık çalışma</h2><p>Önce türü seçin, haftayı kontrol edin, konuyu kendiniz yazın. Tam dönem planı ile tek haftalık plan ayrıdır.</p>';
    var es = document.createElement('div');
    es.className = 'ea-satir';
    [['egz_sec', 'Egzersiz seçimi', 'Liste'], ['egz_haftalik', 'Bu haftanın planı', 'Tek hafta'], ['ev_egzersiz', 'Egzersiz çalışma planı', 'Dönem'], ['ev_dyk', 'DYK ve İYEP kurs planı', 'Dönem'], ['ev_iyep', 'İYEP izleme formu', 'İzleme']].forEach(function (x) {
      if (OY.get && !OY.get(x[0]) && x[0] !== 'egz_haftalik') return;
      es.appendChild(btn(x[1], x[2], function () { ac(x[0]); }));
    });
    egz.appendChild(es);
    panel.appendChild(egz);

    var sss = document.createElement('section');
    sss.className = 'ea-kutu ea-sss';
    sss.innerHTML = '<h2>Sık sorulanlar</h2>' +
      '<details><summary>Belgeyi nasıl alırım?</summary><p>Şablonu açın, alanları doldurun, Word indir, PDF olarak kaydet veya Yazdır’a basın. İşlem bu cihazda biter.</p></details>' +
      '<details><summary>Öğrenci bilgisi nereye gider?</summary><p>Form bu cihazda saklanır. Sunucuya veya yapay zekâya öğrenci listesi gönderilmez. T.C. kimlik numarası yazmayın.</p></details>' +
      '<details><summary>Kazanım kodu neden boş?</summary><p>Kod uydurulmaz. Güncel çıktıyı tymm.meb.gov.tr programından kendiniz yazarsınız. Yıllık planda “Programdan planı hazırla” resmî program metnini getirir.</p></details>';
    panel.appendChild(sss);
  }
  function ekle() {
    var w = document.getElementById('work');
    if (!w || document.getElementById('eaPanel')) return;
    var p = document.createElement('div');
    p.id = 'eaPanel';
    if (w.firstChild) w.insertBefore(p, w.firstChild);
    else w.appendChild(p);
    ciz(p);
  }
  if (typeof home === 'function') {
    var eh = home;
    home = function () { var r = eh.apply(this, arguments); ekle(); return r; };
  }
  if (typeof profil === 'function') {
    var ep = profil;
    profil = function () { var r = ep.apply(this, arguments); ekle(); return r; };
  }
  ekle();
  function rozetle() {
    var harita = [[/plan|yıllık|günlük|maarif/i, '📅', '#fff4d6'], [/tutanak|zümre|şök|kurul/i, '📋', '#e7f8f2'], [/kulüp|sosyal/i, '🎨', '#fde8f3'], [/bep|özel/i, '🤝', '#e7f1ff'], [/sınav|yazılı/i, '✏️', '#fff6cc'], [/rehber/i, '💬', '#e6fbf6'], [/veli/i, '👪', '#fff0e6'], [/egzersiz|kurs|dyk/i, '🏃', '#e8f8ee'], [/şef|alan/i, '🏫', '#fff1e4']];
    document.querySelectorAll('#cats .cat').forEach(function (c) {
      var b = c.querySelector(':scope > button');
      if (!b || b.querySelector('.ea-rozet')) return;
      var sec = null;
      harita.forEach(function (x) { if (!sec && x[0].test(b.textContent || '')) sec = x; });
      sec = sec || [null, '📄', '#fff7ef'];
      c.style.background = sec[2];
      var s = document.createElement('span');
      s.className = 'ea-rozet';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = sec[1];
      b.insertBefore(s, b.firstChild);
    });
  }
  if (typeof window.cats === 'function') {
    var ec = window.cats;
    window.cats = function () { var r = ec.apply(this, arguments); rozetle(); return r; };
    rozetle();
  }
  if (location.hash.indexOf('sablon=') >= 0) {
    var id = decodeURIComponent((location.hash.split('sablon=')[1] || '').split('&')[0]);
    if (id && typeof sel === 'function') sel(id);
  }
})();

  /* 1.0.19: eski tema seçici artakalını gizle; sıcak paleti koru */
  (function () {
    var st = document.createElement('style');
    st.id = 'ea-tema-gizle';
    st.textContent = '#eaTema,label.ea-tema,.ea-tema{display:none!important}';
    (document.head || document.documentElement).appendChild(st);
    function kilit() {
      try { localStorage.setItem('ea_tema', 'acik'); } catch (e) {}
      try { document.documentElement.removeAttribute('data-tema'); } catch (e) {}
      var n = document.getElementById('eaTema');
      if (n) {
        var w = n.closest ? (n.closest('label') || n.parentNode) : n.parentNode;
        if (w && w.style) w.style.display = 'none';
        n.style.display = 'none';
      }
      if (window.EK && EK.tema) {
        EK.tema.uygula = function () { return 'acik'; };
        EK.tema.ayarla = function () { return 'acik'; };
      }
    }
    kilit();
    setTimeout(kilit, 0);
    document.addEventListener('DOMContentLoaded', kilit);
  })();

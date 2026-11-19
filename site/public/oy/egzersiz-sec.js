/* Egzersiz seçimi ve çalışma dosyası. Metinler özgün taslaktır; süre okul duyurusuna göre doldurulur. */
(function () {
  'use strict';
  if (typeof OY === 'undefined' || !OY.T) return;
  var LISTE = [
    'Akıl ve zekâ oyunları', 'Atletizm', 'Arduino ve robotik', 'Badminton', 'Bale', 'Basketbol', 'Bilek güreşi',
    'Bilgisayar olimpiyatı', 'Biyoloji olimpiyatı', 'Fizik olimpiyatı', 'Matematik olimpiyatı', 'Kimya olimpiyatı',
    'Bisiklet', 'Bocce', 'Boks', 'Dart', 'Drama', 'Ebru', 'Eskrim', 'Fotoğrafçılık', 'Futbol', 'Futsal',
    'Geleneksel Türk okçuluğu', 'Görsel sanatlar', 'Grafik tasarım', 'Güreş',
    'Halk oyunları (Artvin yöresi)', 'Halk oyunları (Aydın yöresi)', 'Halk oyunları (Balıkesir yöresi)',
    'Halk oyunları (Bitlis yöresi)', 'Halk oyunları (Doğu yöreleri)', 'Halk oyunları (Ege yöresi)',
    'Halk oyunları (İç Anadolu yöresi)', 'Halk oyunları (Karadeniz yöresi)', 'Halk oyunları (Güneydoğu yöresi)',
    'Halk oyunları (Akdeniz yöresi)', 'Halk oyunları (Marmara yöresi)', 'Halk oyunları (Trakya yöresi)',
    'Halk oyunları (Trabzon yöresi)', 'Halk oyunları (Sivas yöresi)', 'Halk oyunları (Gaziantep yöresi)',
    'Halk oyunları (Şanlıurfa yöresi)', 'Halk oyunları (Erzurum yöresi)', 'Halk oyunları (Van yöresi)',
    'Halk oyunları (Konya yöresi)', 'Halk oyunları (Kastamonu yöresi)', 'Halk oyunları (Edirne yöresi)',
    'Halk oyunları (Muğla yöresi)', 'Halk oyunları (Hatay yöresi)', 'Halk oyunları (Elazığ yöresi)',
    'Halk oyunları (Diyarbakır yöresi)', 'Halk oyunları (Rize yöresi)', 'Halk oyunları (Samsun yöresi)',
    'Halk oyunları (Adana yöresi)', 'Halk oyunları (Bursa yöresi)', 'Halk oyunları (Ankara yöresi)',
    'Halk oyunları (Kars yöresi)', 'Halk oyunları (Mardin yöresi)', 'Halk oyunları (Ordu yöresi)',
    'Halk oyunları (Malatya yöresi)', 'Halk oyunları (Kocaeli yöresi)',
    'Satranç', 'Voleybol', 'Yüzme', 'Hentbol', 'Masa tenisi', 'Jimnastik', 'Judo', 'Karate', 'Tekvando',
    'Tenis', 'Kros', 'Oryantiring', 'İzcilik', 'Sutopu', 'Kürek', 'Binicilik',
    'Bağlama', 'Gitar', 'Keman', 'Ney', 'Piyano', 'Flüt', 'Ud', 'Kanun', 'Koro', 'Bando', 'Enstrüman topluluğu',
    'Tiyatro', 'Hat', 'Tezhip', 'Seramik', 'Resim', 'Heykel', 'Sinema',
    'Kodlama', 'Model uçak', 'Model roket', 'Mangala', 'Go'
  ];
  var ANAHTAR = 'oy_f_egz_sec';
  function kayit() {
    try { return JSON.parse(localStorage.getItem(ANAHTAR) || 'null') || {}; } catch (e) { return {}; }
  }
  function sakla(v) { try { localStorage.setItem(ANAHTAR, JSON.stringify(v)); } catch (e) {} }
  function varsayilan(ad) {
    return {
      ad: ad, sure: '', yer: '',
      amac: [ad + ' alanında temel duruş ve güvenli çalışma', 'Düzenli katılım ve iş birliği', 'Öğrenilenin küçük bir gösteriyle paylaşılması'],
      hafta: [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) {
        var konu = ['Isınma ve temel duruş', 'Teknik çalışma', 'Eşli veya grup uygulaması', 'Küçük gösteri ve geri bildirim'][(n - 1) % 4];
        return { n: n, konu: konu, etkinlik: ad + ' — ' + konu.toLocaleLowerCase('tr-TR'), deger: 'Gözlem' };
      }),
      ogr: ''
    };
  }
  function satirlar(ta) { return String(ta || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean); }
  function belge(tur, F) {
    var p = (typeof P !== 'undefined' && P) || {};
    var ust = (OY.resmiUst ? OY.resmiUst(p) : [{ t: 'center', x: 'T.C.' }]).slice();
    var bas = tur === 'plan' ? 'Egzersiz Çalışma Planı' : tur === 'yoklama' ? 'Egzersiz Yoklama Çizelgesi' : tur === 'rapor' ? 'Egzersiz Dönem Sonu Raporu' : 'Egzersiz Öğrenci Listesi';
    ust.push({ t: 'h1', x: ('2026-2027 EĞİTİM-ÖĞRETİM YILI ' + bas + ' — ' + (F.ad || '')).toLocaleUpperCase('tr-TR') });
    ust.push({ t: 'kv', rows: [['Egzersiz', F.ad || ''], ['Yer', F.yer || '…………'], ['Haftalık süre', F.sure || 'Okul duyurusuna göre'], ['Öğretmen', (p.ad) || '……………………']] });
    if (tur === 'plan') {
      ust.push({ t: 'h2', x: 'AMAÇLAR' });
      ust.push({ t: 'ul', items: F.amac && F.amac.length ? F.amac : ['………………'] });
      ust.push({ t: 'h2', x: 'HAFTALIK ÇALIŞMA' });
      ust.push({ t: 'table', head: ['Hafta', 'Konu', 'Etkinlik', 'Süre', 'Değerlendirme'], rows: (F.hafta || []).map(function (h) {
        return [String(h.n), h.konu || '', h.etkinlik || '', F.sure || '', h.deger || ''];
      }) });
    } else if (tur === 'yoklama') {
      var ogr = satirlar(F.ogr); if (!ogr.length) ogr = ['', '', ''];
      ust.push({ t: 'table', head: ['Öğrenci', '1', '2', '3', '4', '5', '6', '7', '8'], rows: ogr.map(function (a) { return [a, '', '', '', '', '', '', '', '']; }) });
    } else if (tur === 'rapor') {
      ust.push({ t: 'h2', x: 'YAPILAN ÇALIŞMALAR' });
      ust.push({ t: 'ul', items: (F.hafta || []).map(function (h) { return h.n + '. hafta: ' + (h.konu || ''); }) });
      ust.push({ t: 'h2', x: 'KATILIM' });
      ust.push({ t: 'p', x: (satirlar(F.ogr).length || '……') + ' öğrenci kaydı bu cihazda tutulur.' });
      ust.push({ t: 'h2', x: 'DEĞERLENDİRME' });
      ust.push({ t: 'p', x: 'Dönem sonunda gözlem ve yoklama birlikte okunur. Not veya başarı sırası bu raporda üretilmez.' });
    } else {
      var L = satirlar(F.ogr); if (!L.length) L = ['', '', ''];
      ust.push({ t: 'table', head: ['Sıra', 'Öğrenci (no veya ad)', 'Sınıf', 'İmza'], rows: L.map(function (a, i) {
        var c = a.split(/\s*\|\s*/); return [String(i + 1), c[1] || c[0] || '', c[2] || '', ''];
      }) });
    }
    ust.push({ t: 'note', x: 'Ders dışı egzersiz çalışmasının haftalık süresi okulun duyurusuna göre yazılır. Öğrenci bilgisi bu cihazda kalır; T.C. kimlik numarası yazılmamalıdır.' });
    return ust;
  }
  function indir(F, tur) {
    var bl = belge(tur, F);
    var ad = (F.ad || 'egzersiz') + '-' + tur;
    if (OY.toDocx) {
      var b = new Blob([OY.toDocx(bl)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = ad.replace(/[^\wçğıöşüÇĞİÖŞÜ.-]+/g, '_') + '.docx';
      document.body.appendChild(a); a.click(); a.remove();
    }
  }
  function ekran(ad) {
    var F = kayit();
    if (!F.ad || F.ad !== ad) F = varsayilan(ad);
    else F.ad = ad;
    var w = document.getElementById('work');
    w.innerHTML = '';
    w.appendChild(elBas(ad));
    var form = document.createElement('div');
    form.className = 'form noprint';
    function alan(etiket, deger, yaz) {
      var lab = document.createElement('label');
      lab.textContent = etiket;
      var inp = document.createElement('input');
      inp.value = deger || '';
      inp.addEventListener('input', function () { yaz(inp.value); sakla(F); });
      lab.appendChild(inp);
      form.appendChild(lab);
    }
    alan('Haftalık süre (duyuruya göre)', F.sure, function (v) { F.sure = v; });
    alan('Çalışma yeri', F.yer, function (v) { F.yer = v; });
    var am = document.createElement('label');
    am.className = 'wide';
    am.textContent = 'Amaçlar (her satıra bir)';
    var ta = document.createElement('textarea');
    ta.value = (F.amac || []).join('\n');
    ta.addEventListener('input', function () { F.amac = ta.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean); sakla(F); });
    am.appendChild(ta); form.appendChild(am);
    var og = document.createElement('label');
    og.className = 'wide';
    og.textContent = 'Öğrenci listesi (her satır: no | ad | sınıf)';
    var tog = document.createElement('textarea');
    tog.value = F.ogr || '';
    tog.addEventListener('input', function () { F.ogr = tog.value; sakla(F); });
    og.appendChild(tog); form.appendChild(og);
    w.appendChild(form);
    var hafta = document.createElement('div');
    hafta.className = 'noprint';
    function haftaCiz() {
      hafta.innerHTML = '<h3>Haftalık konu ve etkinlik</h3>';
      (F.hafta || []).forEach(function (h, i) {
        var r = document.createElement('div');
        r.className = 'ea-satir-r';
        ['konu', 'etkinlik', 'deger'].forEach(function (k) {
          var inp = document.createElement('input');
          inp.value = h[k] || '';
          inp.setAttribute('aria-label', (i + 1) + '. hafta ' + k);
          inp.addEventListener('input', function () { h[k] = inp.value; sakla(F); });
          r.appendChild(inp);
        });
        var sil = document.createElement('button');
        sil.type = 'button'; sil.className = 'sec'; sil.textContent = '−';
        sil.setAttribute('aria-label', 'Haftayı sil');
        sil.addEventListener('click', function () { F.hafta.splice(i, 1); sakla(F); haftaCiz(); });
        var yuk = document.createElement('button');
        yuk.type = 'button'; yuk.className = 'sec'; yuk.textContent = '↑';
        yuk.addEventListener('click', function () { if (!i) return; var t = F.hafta[i - 1]; F.hafta[i - 1] = F.hafta[i]; F.hafta[i] = t; sakla(F); haftaCiz(); });
        r.appendChild(yuk); r.appendChild(sil);
        hafta.appendChild(r);
      });
      var ek = document.createElement('button');
      ek.type = 'button'; ek.className = 'sec'; ek.textContent = '+ Hafta ekle';
      ek.addEventListener('click', function () {
        F.hafta.push({ n: F.hafta.length + 1, konu: '', etkinlik: '', deger: 'Gözlem' });
        sakla(F); haftaCiz();
      });
      hafta.appendChild(ek);
    }
    haftaCiz();
    w.appendChild(hafta);
    var bar = document.createElement('div');
    bar.className = 'bar noprint';
    [['plan', 'Çalışma planını indir'], ['liste', 'Öğrenci listesini indir'], ['yoklama', 'Yoklama çizelgesini indir'], ['rapor', 'Dönem sonu raporunu indir']].forEach(function (x) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = x[1];
      b.addEventListener('click', function () { indir(F, x[0]); });
      bar.appendChild(b);
    });
    var geri = document.createElement('button');
    geri.type = 'button'; geri.className = 'sec'; geri.textContent = 'Egzersiz listesine dön';
    geri.addEventListener('click', function () { if (typeof sel === 'function') sel('egz_sec'); });
    bar.appendChild(geri);
    w.appendChild(bar);
    var doc = document.createElement('div');
    doc.id = 'doc';
    doc.innerHTML = OY.toHtml(belge('plan', F));
    w.appendChild(doc);
    sakla(F);
    if (window.EA_LISTE) { var ev = new Event('input'); tog.dispatchEvent(ev); }
  }
  function elBas(ad) {
    var h = document.createElement('h2');
    h.className = 'noprint';
    h.textContent = ad;
    return h;
  }
  function izgara() {
    var w = document.getElementById('work');
    if (!w) return;
    w.innerHTML = '';
    var h = document.createElement('h2');
    h.textContent = 'Egzersiz seçimi';
    var say = document.createElement('p');
    var q = document.createElement('input');
    q.type = 'search';
    q.placeholder = 'Egzersiz ara';
    q.setAttribute('aria-label', 'Egzersiz ara');
    q.style.cssText = 'width:100%;min-height:48px;margin:8px 0';
    var grid = document.createElement('div');
    grid.className = 'ea-egz-grid';
    function ciz() {
      var s = q.value.toLocaleLowerCase('tr-TR');
      var g = LISTE.filter(function (ad) { return !s || ad.toLocaleLowerCase('tr-TR').indexOf(s) >= 0; });
      say.textContent = g.length + ' egzersiz';
      grid.innerHTML = '';
      g.forEach(function (ad) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'ea-egz'; b.textContent = ad;
        b.addEventListener('click', function () { ekran(ad); });
        grid.appendChild(b);
      });
    }
    q.addEventListener('input', ciz);
    w.appendChild(h); w.appendChild(say); w.appendChild(q); w.appendChild(grid);
    if (!document.getElementById('ea-egz-stil')) {
      var st = document.createElement('style');
      st.id = 'ea-egz-stil';
      st.textContent = '.ea-egz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}.ea-egz{min-height:52px;text-align:left;background:#fff;color:#1c1915;border:1px solid #e4d8c4;border-radius:12px;padding:10px 12px;font-weight:700}@media(max-width:800px){.ea-egz-grid{grid-template-columns:1fr}}';
      document.head.appendChild(st);
    }
    ciz();
  }
  if (!OY.T.some(function (t) { return t.id === 'egz_sec'; })) {
    OY.T.push({ id: 'egz_sec', kat: 'Kurs ve Egzersiz', baslik: 'Egzersiz seçimi', kaynak: 'Ders dışı egzersiz çalışma dosyası. Süre okul duyurusuna göre yazılır.', alan: [], egzSec: true });
  }
  if (typeof window.sel === 'function' && !window.__eaEgzSel) {
    window.__eaEgzSel = true;
    var eski = window.sel;
    window.sel = function (id) {
      if (id === 'egz_sec') return izgara();
      return eski.apply(this, arguments);
    };
  }
  window.EA_EGZ = { LISTE: LISTE, izgara: izgara };
})();

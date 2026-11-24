/* Ortak öğrenci/öğretmen listesi. Excel, CSV ve Word tablosu yalnız bu cihazda okunur. */
(function (root) {
  'use strict';
  var ANAHTAR = 'ea_ortak_liste_v1';
  function bos() { return { ogrenci: [], ogretmen: [] }; }
  function oku() {
    try { var v = JSON.parse(localStorage.getItem(ANAHTAR) || 'null'); if (v && v.ogrenci && v.ogretmen) return v; } catch (e) {}
    return bos();
  }
  function yaz(v) { try { localStorage.setItem(ANAHTAR, JSON.stringify(v)); } catch (e) {} }
  function kucuk(s) { return String(s || '').toLocaleLowerCase('tr-TR'); }
  function hucre(bas) {
    var h = kucuk(bas).replace(/\s+/g, ' ');
    if (/öğrenci\s*no|okul\s*no|^no$|numara|sıra/.test(h)) return 'no';
    if (/adı soyadı|ad soyad|isim|adı ve soyadı/.test(h)) return 'ad';
    if (/^adı$|^ad$|öğrenci adı/.test(h)) return 'adi';
    if (/soyad/.test(h)) return 'soy';
    if (/sınıf|şube|sube/.test(h)) return 'sinif';
    if (/branş|brans|alan/.test(h)) return 'brans';
    return '';
  }
  function ayikla(tablo) {
    tablo = (tablo || []).filter(function (r) { return (r || []).some(function (c) { return String(c || '').trim(); }); });
    if (!tablo.length) return { baslik: [], satir: [], eslesme: [] };
    var baslik = tablo[0].map(function (c) { return String(c || '').trim(); });
    var eslesme = baslik.map(hucre);
    var govde = eslesme.some(Boolean) ? tablo.slice(1) : tablo;
    if (!eslesme.some(Boolean)) eslesme = baslik.map(function () { return ''; });
    var satir = govde.map(function (r) {
      var o = { no: '', ad: '', sinif: '', brans: '' };
      var adi = '', soy = '';
      eslesme.forEach(function (k, i) {
        var v = String(r[i] == null ? '' : r[i]).trim();
        if (k === 'no') o.no = v;
        else if (k === 'ad') o.ad = v;
        else if (k === 'adi') adi = v;
        else if (k === 'soy') soy = v;
        else if (k === 'sinif') o.sinif = v;
        else if (k === 'brans') o.brans = v;
      });
      if (!o.ad) o.ad = [adi, soy].filter(Boolean).join(' ');
      return o;
    }).filter(function (o) { return o.ad || o.no; });
    return { baslik: baslik, eslesme: eslesme, satir: satir };
  }
  function satirMetin(list, tur) {
    return list.map(function (o) {
      if (tur === 'ogretmen') return [o.ad, o.brans].filter(Boolean).join(' | ');
      return [o.no, o.ad, o.sinif].filter(Boolean).join(' | ');
    }).join('\n');
  }
  root.EA_LISTE = { oku: oku, yaz: yaz, ayikla: ayikla, satirMetin: satirMetin, hucre: hucre };
  if (typeof document === 'undefined') return;

  var ALANLAR = ['', 'no', 'ad', 'adi', 'soy', 'sinif', 'brans'];
  var ETIKET = { '': 'Yok say', no: 'No', ad: 'Ad soyad', adi: 'Ad', soy: 'Soyad', sinif: 'Sınıf / şube', brans: 'Branş' };
  function turTahmin(metin) {
    var t = kucuk(metin);
    if (/öğretmen|kadrolu|branş/.test(t) && !/öğrenci/.test(t)) return 'ogretmen';
    return 'ogrenci';
  }
  function xlsx() {
    if (root.EK20 && EK20.dosyaOku) return Promise.resolve(null);
    if (root.XLSX) return Promise.resolve(root.XLSX);
    return new Promise(function (ok, no) {
      var s = document.createElement('script');
      s.src = 'xlsx.js';
      s.onload = function () { ok(root.XLSX); };
      s.onerror = function () { no(new Error('Excel okuyucu yüklenemedi.')); };
      document.head.appendChild(s);
    });
  }
  function dosya(file) {
    if (root.EK20 && EK20.dosyaOku) return EK20.dosyaOku(file);
    return xlsx().then(function () {
      return file.arrayBuffer().then(function (buf) {
        var ad = file.name.toLowerCase();
        if (/\.docx$/.test(ad) && EK20 && EK20.docxOku) return EK20.docxOku(buf);
        var X = root.XLSX;
        var wb = /\.(csv|txt)$/.test(ad) ? X.read(new TextDecoder('utf-8').decode(buf), { type: 'string' }) : X.read(new Uint8Array(buf), { type: 'array' });
        var tablo = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' });
        return { tablo: tablo };
      });
    });
  }
  function onizle(tablo, tur, ta) {
    var eski = document.getElementById('eaListeOniz');
    if (eski) eski.remove();
    var kutu = document.createElement('div');
    kutu.id = 'eaListeOniz';
    kutu.className = 'ea-oniz noprint';
    kutu.innerHTML = '<p><b>Sütun eşleştirme</b> — dosya bu cihazda okundu, gönderilmedi.</p>';
    var sec = [];
    var bas = (tablo[0] || []).map(function (c, i) { return String(c || 'Sütun ' + (i + 1)); });
    var otomatik = bas.map(function (h) { return hucre(h); });
    var satir = document.createElement('div');
    satir.className = 'ea-oniz-sec';
    bas.forEach(function (h, i) {
      var lab = document.createElement('label');
      lab.textContent = h;
      var s = document.createElement('select');
      s.setAttribute('aria-label', h);
      ALANLAR.forEach(function (k) {
        var o = document.createElement('option');
        o.value = k; o.textContent = ETIKET[k];
        if (otomatik[i] === k) o.selected = true;
        s.appendChild(o);
      });
      sec.push(s);
      lab.appendChild(s);
      satir.appendChild(lab);
    });
    kutu.appendChild(satir);
    var tab = document.createElement('table');
    tab.className = 'ea-oniz-tab';
    tablo.slice(0, 6).forEach(function (r, ri) {
      var tr = document.createElement('tr');
      (r || []).forEach(function (c) {
        var huc = document.createElement(ri ? 'td' : 'th');
        huc.textContent = String(c || '');
        tr.appendChild(huc);
      });
      tab.appendChild(tr);
    });
    kutu.appendChild(tab);
    var bar = document.createElement('div');
    var tamam = document.createElement('button');
    tamam.type = 'button'; tamam.textContent = 'Listeye ekle';
    var vaz = document.createElement('button');
    vaz.type = 'button'; vaz.className = 'sec'; vaz.textContent = 'Vazgeç';
    vaz.addEventListener('click', function () { kutu.remove(); });
    tamam.addEventListener('click', function () {
      var es = sec.map(function (s) { return s.value; });
      var govde = es.some(Boolean) ? tablo.slice(1) : tablo;
      var ay = ayikla([es.map(function (k) { return { no: 'No', ad: 'Ad Soyad', adi: 'Adı', soy: 'Soyadı', sinif: 'Şube', brans: 'Branş' }[k] || ''; })].concat(govde));
      var depo = oku();
      var hedef = tur === 'ogretmen' ? 'ogretmen' : 'ogrenci';
      ay.satir.forEach(function (o) {
        var varMi = depo[hedef].some(function (x) { return x.ad === o.ad && x.no === o.no; });
        if (!varMi) depo[hedef].push(o);
      });
      yaz(depo);
      if (ta) {
        var ek = satirMetin(ay.satir, hedef);
        ta.value = ta.value && ta.value.trim() ? ta.value.replace(/\s+$/, '') + '\n' + ek : ek;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
      kutu.remove();
      if (typeof msg === 'function') msg(ay.satir.length + ' satır ortak listeye eklendi.');
    });
    bar.appendChild(tamam); bar.appendChild(vaz);
    kutu.appendChild(bar);
    (ta && ta.parentNode ? ta.parentNode : document.getElementById('work') || document.body).appendChild(kutu);
  }
  function dosyaSec(ta, tur) {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.xlsx,.xls,.csv,.txt,.docx';
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      dosya(f).then(function (son) {
        var tablo = son.tablo && son.tablo.length ? son.tablo : (son.satirlar || []).map(function (s) { return [s]; });
        onizle(tablo, tur, ta);
      }).catch(function (e) { if (typeof msg === 'function') msg(e.message || 'Dosya okunamadı', 1); });
    });
    inp.click();
  }
  function ortakDoldur(ta, tur) {
    var depo = oku();
    var liste = tur === 'ogretmen' ? depo.ogretmen : depo.ogrenci;
    if (!liste.length) { if (typeof msg === 'function') msg('Ortak liste boş. Önce Excel veya Word yükleyin.', 1); return; }
    ta.value = satirMetin(liste, tur);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function dugmeler(ta, tur) {
    if (ta.dataset.eaAktar) return;
    ta.dataset.eaAktar = '1';
    var bar = document.createElement('div');
    bar.className = 'ea-aktar noprint';
    function b(yazi, fn) {
      var x = document.createElement('button');
      x.type = 'button'; x.className = 'sec'; x.textContent = yazi;
      x.addEventListener('click', fn);
      bar.appendChild(x);
    }
    b("Excel'den ekle", function () { dosyaSec(ta, tur); });
    b("Word'den ekle", function () { dosyaSec(ta, tur); });
    b('Ortak listeden doldur', function () { ortakDoldur(ta, tur); });
    ta.parentNode.insertBefore(bar, ta);
  }
  function listeMi(lab) {
    var t = kucuk(lab);
    return /öğrenci|öğretmen|katıl|gündem|karar|üye|liste|satır|madde|başlık|etkinlik|amaç|konu|iş\b|kazanım|çıktı/.test(t);
  }
  function editor(ta) {
    if (!ta || ta.dataset.eaSatir || ta.closest('.ea-satir-ed')) return;
    var lab = '';
    var p = ta.closest('label');
    if (p) lab = p.textContent || '';
    else if (ta.getAttribute('aria-label')) lab = ta.getAttribute('aria-label');
    else if (ta.id === 'mOgr' || ta.id === 'mEv') lab = 'öğretmen listesi satır';
    if (ta.tagName !== 'TEXTAREA' || !listeMi(lab)) return;
    ta.dataset.eaSatir = '1';
    var tur = turTahmin(lab);
    dugmeler(ta, tur);
    var kutu = document.createElement('div');
    kutu.className = 'ea-satir-ed noprint';
    function okuSat() { return String(ta.value || '').split('\n'); }
    function yazSat(a) {
      ta.value = a.join('\n');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function ciz() {
      kutu.innerHTML = '';
      var a = okuSat();
      if (!a.length) a = [''];
      a.forEach(function (val, i) {
        var r = document.createElement('div');
        r.className = 'ea-satir-r';
        var inp = document.createElement('input');
        inp.value = val;
        inp.setAttribute('aria-label', 'Satır ' + (i + 1));
        inp.addEventListener('input', function () { var d = okuSat(); d[i] = inp.value; yazSat(d); });
        function btn(t, fn, ad) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'sec'; b.textContent = t;
          b.setAttribute('aria-label', ad);
          b.addEventListener('click', fn);
          return b;
        }
        r.appendChild(inp);
        r.appendChild(btn('↑', function () { if (!i) return; var d = okuSat(); var t = d[i - 1]; d[i - 1] = d[i]; d[i] = t; yazSat(d); ciz(); }, 'Yukarı'));
        r.appendChild(btn('↓', function () { var d = okuSat(); if (i >= d.length - 1) return; var t = d[i + 1]; d[i + 1] = d[i]; d[i] = t; yazSat(d); ciz(); }, 'Aşağı'));
        r.appendChild(btn('−', function () { var d = okuSat(); d.splice(i, 1); if (!d.length) d = ['']; yazSat(d); ciz(); }, 'Satırı sil'));
        kutu.appendChild(r);
      });
      var ek = document.createElement('button');
      ek.type = 'button'; ek.className = 'sec'; ek.textContent = '+ Satır ekle';
      ek.addEventListener('click', function () { var d = okuSat(); d.push(''); yazSat(d); ciz(); });
      kutu.appendChild(ek);
    }
    ta.style.display = 'none';
    ta.parentNode.insertBefore(kutu, ta.nextSibling);
    ciz();
  }
  function tara(kok) {
    (kok || document).querySelectorAll('textarea').forEach(editor);
  }
  var st = document.createElement('style');
  st.textContent = '.ea-aktar{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.ea-aktar button,.ea-satir-r button{min-height:44px}.ea-satir-r{display:flex;gap:4px;margin:4px 0}.ea-satir-r input{flex:1;min-width:0;min-height:44px}.ea-oniz{border:1px solid #e4d8c4;background:#fff;border-radius:12px;padding:10px;margin:8px 0}.ea-oniz-sec{display:flex;flex-wrap:wrap;gap:8px}.ea-oniz-sec label{display:flex;flex-direction:column;font-size:14px;min-width:120px}.ea-oniz-tab{border-collapse:collapse;width:100%;margin:8px 0;font-size:14px}.ea-oniz-tab td,.ea-oniz-tab th{border:1px solid #e4d8c4;padding:4px 6px}@media print{.ea-aktar,.ea-satir-ed,.ea-oniz{display:none!important}}';
  document.head.appendChild(st);
  var bekle = 0;
  new MutationObserver(function () {
    if (bekle) return;
    bekle = requestAnimationFrame(function () { bekle = 0; tara(document.getElementById('work') || document.body); });
  }).observe(document.body, { childList: true, subtree: true });
  tara(document.body);
})(typeof window !== 'undefined' ? window : globalThis);

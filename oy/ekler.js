/* Evrak Asistanı · ÖY 1.12.3 rehberlik eklentileri. Yayıncı: Eyüp ŞEKER.
   - Sınıf listelerim: e-Okul Sınıf Listesi (.xls/.xlsx/.csv) ve Not Girişi Asistanı'ndan aktarım (.json)
   - Formlarda sınıf / öğrenci seçimi (yazarken liste açılır)
   - Rehberlik kayıt defteri (yalnız form adı, tarih, sınıf; öğrenci adı tutulmaz) → yıl sonu ve aylık rapora sayılar
   - Sosyometri / Kimdir Bu?, Sınıf risk haritası, Bireysel görüşme kayıt formu, Aylık rehberlik raporu
   - window.OY_PAKET tanımlıysa (Rehberlik Yardımcısı) yalnız rehberlikle ilgili bölümler gösterilir.
   Tüm veriler bu cihazdaki tarayıcı deposunda kalır; ağa çıkılmaz. */
(function (root) {
'use strict';
if (typeof document === 'undefined' || typeof OY === 'undefined') return;
var SURUM = '1.12.3';
var KAT = 'Rehberlik';
var KAT_OGR = 'Sınıf Listeleri ve Kayıtlar';

/* ---------------- yardımcılar ---------------- */
function el(t, a, c) {
  var e = document.createElement(t); a = a || {};
  Object.keys(a).forEach(function (k) {
    if (a[k] == null) return;
    if (k === 'text') e.textContent = a[k]; else if (k === 'html') e.innerHTML = a[k];
    else if (k === 'on') Object.keys(a.on).forEach(function (v) { e.addEventListener(v, a.on[v]); });
    else e.setAttribute(k, a[k]);
  });
  (c || []).forEach(function (x) { if (x != null) e.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
  return e;
}
function LS(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
function SS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function lines(v) { return String(v || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean); }
function trd(iso) { return OY.trDate(iso); }
function bugun() { return OY.isGunuBugun ? OY.isGunuBugun() : new Date().toISOString().slice(0, 10); }
function low(s) { return String(s || '').toLocaleLowerCase('tr-TR'); }
function P() { return root.P || {}; }
function bilgi(t, err) { if (typeof root.msg === 'function') root.msg(t, err); }
function basHarf(ad) { return String(ad || '').trim().split(/\s+/).filter(Boolean).map(function (w) { return w.charAt(0).toLocaleUpperCase('tr-TR') + '.'; }).join(''); }
function sinifNorm(v) { var t = String(v || '').trim(); if (!t) return ''; var c = root.NGAIce && root.NGAIce.sinifCoz ? root.NGAIce.sinifCoz(t) : ''; return c || t.toLocaleUpperCase('tr-TR').replace(/\s+/g, ''); }
function hash(s) { s = low(s).replace(/\s+/g, ' ').trim(); if (!s) return ''; var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function sinifSira(a, b) { var f = function (z) { var m = /^(\d+|ANA|HAZ)-(.+)$/.exec(z); return m ? [m[1] === 'ANA' ? 0 : m[1] === 'HAZ' ? 8.5 : +m[1], m[2]] : [99, z]; }; var x = f(a), y = f(b); return (x[0] - y[0]) || String(x[1]).localeCompare(String(y[1]), 'tr'); }
function ekran(id, baslik) {
  if (typeof root.land === 'function') root.land(false);
  root.cur = { id: id, baslik: baslik, kaynak: '' };
  if (typeof root.cats === 'function') root.cats();
  var w = document.getElementById('work'); w.innerHTML = '';
  w.appendChild(el('h2', { text: baslik }));
  w.appendChild(el('div', { id: 'msg', class: 'msg hidden' }));
  return w;
}
function indir(ad, blob) { var a = el('a', { href: URL.createObjectURL(blob), download: ad }); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 3000); }
function stil() {
  if (document.getElementById('oyek-stil')) return;
  var s = el('style', { id: 'oyek-stil' });
  s.textContent = [
    '.oyek-drop{border:3px dashed #000;border-radius:8px;padding:18px;text-align:center;background:#f4f7ff;cursor:pointer;margin:8px 0}',
    '.oyek-drop.on{background:#fff3cd}',
    '.oyek-t{border-collapse:collapse;width:100%;margin:8px 0}.oyek-t td,.oyek-t th{border:1px solid #666;padding:4px 6px;text-align:left;vertical-align:middle}.oyek-t th{background:#eee}',
    '.oyek-t select{min-width:120px;max-width:100%}.oyek-t input[type=number]{width:56px}',
    '.oyek-kart{border:2px solid #000;border-radius:8px;padding:10px 12px;margin:8px 0;background:#fff}',
    '.oyek-oto{border:2px solid #c2410c;border-radius:8px;padding:8px 12px;margin:8px 0;background:#eef3ff}',
    '.oyek-sg svg{max-width:100%;height:auto;border:1px solid #999;border-radius:6px;background:#fff}',
    '.oyek-kucuk{font-size:14px;color:#333}'
  ].join('');
  document.head.appendChild(s);
}

/* ---------------- 1) Sınıf listeleri ---------------- */
var KEY_S = 'oy_siniflar';
function siniflar() { return LS(KEY_S, {}); }
function sinifKaydet(L) { SS(KEY_S, L); dlYenile(); }
function sinifAnahtarlari() { return Object.keys(siniflar()).sort(sinifSira); }
function hazirSiniflar() { return sinifAnahtarlari().filter(function (k) { return k.charAt(0) !== '?'; }); }
function ogrenciler(sinif) {
  var L = siniflar(), k = sinifNorm(sinif);
  if (k && L[k]) return L[k].ogrenciler || [];
  if (k) { var e = Object.keys(L).filter(function (x) { return sinifNorm(x) === k; })[0]; return e ? (L[e].ogrenciler || []) : []; }
  return [];
}
function birlestir(gelen) { // {sinif: [{no, ad}]}
  var L = siniflar(), n = 0, s = 0;
  Object.keys(gelen).forEach(function (k) {
    var og = (gelen[k] || []).filter(function (o) { return o && (o.no || o.ad); }).map(function (o) { return { no: String(o.no || '').trim(), ad: String(o.ad || '').trim() }; });
    if (!og.length) return;
    var kk = k.charAt(0) === '?' ? k : (sinifNorm(k) || k); L[kk] = { zaman: Date.now(), ogrenciler: og }; n += og.length; s++;
  });
  sinifKaydet(L); return { sinif: s, ogrenci: n };
}
// Dosya / sayfa adından sınıf: "AMP - 9. Sınıf A BİLİŞİM ...", indirilirken bozulmuş "9._S_n_f_A_B_L..." ve "9-A" biçimleri
function addanSinif(ad) {
  var t = String(ad || '').replace(/\.[a-z]{3,4}$/i, '').replace(/_/g, ' ');
  var c = root.NGAIce && root.NGAIce.sinifCoz ? root.NGAIce.sinifCoz(t) : ''; if (c) return c;
  var m = /(\d{1,2})\s*\.?\s*S[ıiIİ ]n[ıiIİ ]f[ıiIİ]?\s*[\/-]?\s*([A-ZÇĞİÖŞÜ])(?=\s|$|[^A-Za-zÇĞİÖŞÜçğıöşü])/i.exec(t);
  if (m && +m[1] >= 1 && +m[1] <= 12) return +m[1] + '-' + m[2].toLocaleUpperCase('tr-TR');
  m = /(?:^|[\s(])(\d{1,2})\s*[-\/ ]\s*([A-ZÇĞİÖŞÜ])(?=$|[\s)])/.exec(t);
  return m && +m[1] >= 1 && +m[1] <= 12 ? +m[1] + '-' + m[2] : '';
}
function xlsxHazir() {
  if (root.XLSX) return Promise.resolve(root.XLSX);
  return new Promise(function (ok, no) { var s = el('script', { src: 'xlsx.js' }); s.onload = function () { ok(root.XLSX); }; s.onerror = function () { no(new Error('Excel okuyucu yüklenemedi.')); }; document.head.appendChild(s); });
}
function dosyaOku(f) {
  return f.arrayBuffer().then(function (buf) {
    if (/\.json$/i.test(f.name)) {
      var j = JSON.parse(new TextDecoder('utf-8').decode(buf)); var src = j && j.siniflar ? j.siniflar : j, out = {};
      Object.keys(src || {}).forEach(function (k) { var v = src[k]; out[k] = Array.isArray(v) ? v : (v && v.ogrenciler) || []; });
      if (!Object.keys(out).length) throw new Error('dosyada sınıf listesi yok');
      return out;
    }
    return xlsxHazir().then(function (X) {
      var u8 = new Uint8Array(buf), kitap;
      if (/\.(csv|txt)$/i.test(f.name)) { var t; try { t = new TextDecoder('utf-8', { fatal: true }).decode(u8); } catch (e) { t = new TextDecoder('windows-1254').decode(u8); } kitap = X.read(t.replace(/^﻿/, ''), { type: 'string', raw: true }); }
      else kitap = X.read(u8, { type: 'array', codepage: 1254 });
      var out = {}, I = root.NGAIce;
      kitap.SheetNames.forEach(function (ad) {
        if (ad === 'Dersler') return;
        var tablo = X.utils.sheet_to_json(kitap.Sheets[ad], { header: 1, raw: true, defval: '' });
        var Lr = I.listeOku(tablo, ad); if (!Lr || !Lr.ogrenciler.length) return;
        var sinif = Lr.b.varsayilanSinif || (Lr.ogrenciler[0] && Lr.ogrenciler[0].sinif) || addanSinif(f.name) || (kitap.SheetNames.length > 1 ? addanSinif(ad) : '') || '';
        if (!sinif) sinif = '?' + f.name.replace(/\.[^.]+$/, '');
        out[sinif] = (out[sinif] || []).concat(Lr.ogrenciler.map(function (o) { return { no: o.no, ad: o.ad }; }));
      });
      if (!Object.keys(out).length) throw new Error('Okul No sütunu bulunamadı');
      return out;
    });
  });
}
function sinifEkrani() {
  stil();
  var w = ekran('oy_siniflar', 'Sınıf Listelerim');
  w.appendChild(el('p', { text: 'Sınıf listelerini bir kez yükleyin; rehberlik formlarında, BEP\'te, sosyometride ve risk haritasında sınıf ve öğrenci listeden seçilir. Yalnız Okul No ve Ad Soyad tutulur (T.C. kimlik no okunmaz). Veriler bu cihazda kalır; hesap eşitlemesini açarsanız yalnız kendi hesabınıza gider.' }));
  var giris = el('input', { type: 'file', multiple: 'multiple', accept: '.xls,.xlsx,.csv,.txt,.json', hidden: 'hidden', id: 'oyekDosya' });
  var drop = el('div', { class: 'oyek-drop', id: 'oyekDrop', html: '<b>e-Okul Sınıf Listesi</b> (.xls) dosyalarını buraya bırakın ya da tıklayıp seçin<br><span class="oyek-kucuk">Birden çok sınıf seçebilirsiniz. Not Girişi Asistanı\'ndan aktarılan <b>sinif-listeleri.json</b> dosyası da kabul edilir.</span>' });
  w.appendChild(drop); w.appendChild(giris);
  var durum = el('div', { id: 'oyekSDurum' }); w.appendChild(durum);
  function isle(fs) {
    var hata = [], top = { sinif: 0, ogrenci: 0 }, p = Promise.resolve();
    fs.forEach(function (f) { p = p.then(function () { return dosyaOku(f).then(function (o) { var r = birlestir(o); top.sinif += r.sinif; top.ogrenci += r.ogrenci; }).catch(function (e) { hata.push(f.name + ': ' + (e && e.message || e)); }); }); });
    p.then(function () { ciz(); bilgi(top.sinif ? top.sinif + ' sınıf, ' + top.ogrenci + ' öğrenci kaydedildi.' + (hata.length ? ' Okunamayan: ' + hata.join(' · ') : '') : 'Liste bulunamadı. ' + hata.join(' · '), !top.sinif); });
  }
  drop.addEventListener('click', function () { giris.click(); });
  giris.addEventListener('change', function () { if (giris.files.length) isle([].slice.call(giris.files)); giris.value = ''; });
  drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('on'); });
  drop.addEventListener('dragleave', function () { drop.classList.remove('on'); });
  drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('on'); if (e.dataTransfer.files.length) isle([].slice.call(e.dataTransfer.files)); });
  var ad = el('details', { class: 'oyek-kart' }, [el('summary', { text: 'Not Girişi Asistanı\'ndan nasıl aktarılır?' }), el('ol', {}, [
    el('li', { text: 'e-Okul\'da Not Girişi panelinden "Sınıf listelerini otomatik öğren"e basın (bir kez).' }),
    el('li', { text: 'Eklentinin "Excel\'den not girişi" sayfasında "Öğretmen Yardımcısı / Rehberlik Yardımcısı için sınıf listelerini indir" düğmesine basın.' }),
    el('li', { text: 'İnen sinif-listeleri.json dosyasını bu sayfaya bırakın.' })])]);
  w.appendChild(ad);
  var liste = el('div', { id: 'oyekSListe' }); w.appendChild(liste);
  function ciz() {
    var L = siniflar(), ks = sinifAnahtarlari(); liste.innerHTML = '';
    if (!ks.length) { liste.appendChild(el('p', { class: 'oyek-kucuk', text: 'Henüz sınıf listesi yok.' })); return; }
    var t = el('table', { class: 'oyek-t' }, [el('tr', {}, [el('th', { text: 'Sınıf' }), el('th', { text: 'Öğrenci' }), el('th', { text: 'Güncelleme' }), el('th', { text: '' })])]);
    ks.forEach(function (k) {
      if (k.charAt(0) === '?') {
        var gir = el('input', { type: 'text', placeholder: 'ör. 9-A', size: '6', 'data-bekleyen': k });
        gir.addEventListener('change', function () { var y = sinifNorm(gir.value); if (!y) return; var L2 = siniflar(); L2[y] = L2[k]; L2[y].zaman = Date.now(); delete L2[k]; sinifKaydet(L2); ciz(); bilgi(y + ' olarak kaydedildi.'); });
        t.appendChild(el('tr', { style: 'background:#fff3cd' }, [el('td', {}, [el('b', { text: 'Sınıf bulunamadı: ' }), document.createTextNode(k.slice(1) + ' → '), gir]), el('td', { text: String((L[k].ogrenciler || []).length) }), el('td', { text: '' }), el('td', { class: 'oyek-kucuk', text: 'Sınıfı yazıp Enter\'a basın' })]));
        return;
      }
      var acik = el('div', { hidden: 'hidden', class: 'oyek-kucuk' });
      var sil = el('button', { class: 'sec', text: 'Sil', title: 'Bu sınıfın listesini cihazdan sil' });
      sil.addEventListener('click', function () { if (sil.dataset.c !== '1') { sil.dataset.c = '1'; sil.textContent = 'Emin misiniz?'; return; } var L2 = siniflar(); delete L2[k]; sinifKaydet(L2); ciz(); });
      var goster = el('button', { class: 'sec', text: 'Göster' });
      goster.addEventListener('click', function () { acik.hidden = !acik.hidden; if (!acik.hidden && !acik.childNodes.length) acik.textContent = (L[k].ogrenciler || []).map(function (o) { return (o.no ? o.no + ' ' : '') + o.ad; }).join(' · '); });
      t.appendChild(el('tr', {}, [el('td', {}, [el('b', { text: k })]), el('td', { text: String((L[k].ogrenciler || []).length) }), el('td', { text: L[k].zaman ? new Date(L[k].zaman).toLocaleDateString('tr-TR') : '' }), el('td', {}, [goster, ' ', sil, acik])]));
    });
    liste.appendChild(t);
    var tum = el('button', { class: 'sec', id: 'oyekTumSil', text: 'Tüm listeleri sil' });
    tum.addEventListener('click', function () { if (tum.dataset.c !== '1') { tum.dataset.c = '1'; tum.textContent = 'Emin misiniz? Tekrar tıklayın'; return; } sinifKaydet({}); ciz(); bilgi('Tüm sınıf listeleri bu cihazdan silindi.'); });
    liste.appendChild(el('div', { class: 'bar' }, [tum]));
  }
  ciz();
}

/* ---------------- 2) Formlarda sınıf / öğrenci seçimi ---------------- */
function dl(id) { var d = document.getElementById(id); if (!d) { d = el('datalist', { id: id }); document.body.appendChild(d); } return d; }
function dlYenile() { var d = dl('oyekDLSinif'); d.innerHTML = ''; hazirSiniflar().forEach(function (k) { d.appendChild(el('option', { value: k })); }); }
function etiket(inp) { var l = inp.closest('label'); if (!l) return ''; var t = ''; for (var i = 0; i < l.childNodes.length; i++) { var n = l.childNodes[i]; if (n.nodeType === 3) t += n.nodeValue; } return t.trim(); }
function sinifGirdisi(kok) {
  var a = kok.querySelectorAll('input'); for (var i = 0; i < a.length; i++) { if (a[i].name === 'sinif' || /^sınıf/i.test(etiket(a[i]))) return a[i]; } return null;
}
function ogrDoldur(inp) {
  var kok = inp.closest('#dform') || inp.closest('.form') || document;
  var si = sinifGirdisi(kok), L = siniflar(), og = [];
  var hedef = si ? sinifNorm(si.value) : '';
  if (hedef) og = ogrenciler(hedef);
  if (!og.length) Object.keys(L).sort(sinifSira).forEach(function (k) { if (og.length < 600) og = og.concat(L[k].ogrenciler || []); });
  var bh = /baş harf/i.test(etiket(inp)), d = dl('oyekDLOgr'); d.innerHTML = '';
  og.forEach(function (o) { var v = bh ? basHarf(o.ad) + (o.no ? ' (' + o.no + ')' : '') : o.ad + (o.no ? ' (' + o.no + ')' : ''); d.appendChild(el('option', { value: v })); });
}
function bagla() {
  var w = document.getElementById('work'); if (!w) return;
  if (!sinifAnahtarlari().length) return;
  dlYenile();
  w.querySelectorAll('input:not([data-oyek])').forEach(function (inp) {
    if (inp.type && !/^(text|search)$/i.test(inp.type)) return;
    var et = etiket(inp);
    if (inp.name === 'sinif' || /^sınıf/i.test(et)) { inp.setAttribute('data-oyek', 's'); inp.setAttribute('list', 'oyekDLSinif'); inp.setAttribute('autocomplete', 'off'); }
    else if (inp.name === 'ogrenci' || inp.name === 'ogr' || /^öğrenci( \(|$| adı)/i.test(et)) { inp.setAttribute('data-oyek', 'o'); inp.setAttribute('list', 'oyekDLOgr'); inp.setAttribute('autocomplete', 'off'); inp.addEventListener('focus', function () { ogrDoldur(inp); }); }
  });
}

/* ---------------- 3) Rehberlik kayıt defteri ---------------- */
var KEY_K = 'oy_rehber_kayit';
var KAYIT_AD = {
  rehber_ogrenci_gorusme: 'Öğrenci görüşmesi', rhb_bireysel: 'Bireysel görüşme (rehberlik servisi)', rehber_veli_gorusme: 'Veli görüşmesi',
  rehber_ev_ziyareti: 'Ev ziyareti', rehber_aile_bilgi: 'Aile bilgi formu', rehber_gozlem: 'Öğrenci gözlem formu', rehber_rpd_yonlendirme: 'Rehberlik servisine yönlendirme',
  rhb_sosyometri: 'Sosyometri / Kimdir Bu? uygulaması', rhb_risk: 'Sınıf risk haritası', ev_bep: 'BEP', bep_zep: 'BEP / ZEP planı', ev_kaynastirma: 'Kaynaştırma dönem değerlendirmesi',
  veli: 'Veli toplantısı', bep: 'BEP geliştirme birimi toplantısı', deo_izleme: 'Destek eğitim odası izleme', evde_rapor: 'Evde eğitim dönem raporu'
};
function kayitlar() { return LS(KEY_K, []); }
function kayitEkle(id, F) {
  if (!KAYIT_AD[id] || !F) return;
  var ogr = F.ogrenci || F.ogr || '';
  var r = { id: id, t: (F.tarih && /^\d{4}-\d\d-\d\d$/.test(F.tarih)) ? F.tarih : bugun(), s: sinifNorm(F.sinif || ''), o: hash(ogr), z: Date.now() };
  if (id === 'rhb_sosyometri') r.m = F.mod === 'kimdir' ? 'kimdir' : 'sosyometri';
  var L = kayitlar();
  if (L.some(function (x) { return x.id === r.id && x.t === r.t && x.s === r.s && x.o === r.o && (x.m || '') === (r.m || ''); })) return;
  L.push(r); SS(KEY_K, L.slice(-3000));
}
document.addEventListener('click', function (e) {
  var b = e.target && e.target.closest && e.target.closest('#bDocx,#bPdf,#bPrint');
  if (!b || !root.cur) return;
  try { kayitEkle(root.cur.id, root.F); } catch (x) {}
}, true);
function yilAraligi(ey) { var m = /^(\d{4})/.exec(String(ey || '')), y = m ? +m[1] : (function () { var d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; })(); return [y + '-09-01', (y + 1) + '-08-31']; }
function say(fs) { var c = {}; fs.forEach(function (x) { var k = x.id === 'rhb_sosyometri' ? 'rhb_sosyometri_' + (x.m || 'sosyometri') : x.id; c[k] = (c[k] || 0) + 1; }); return c; }
function suz(bas, bit, sinif) { var s = sinifNorm(sinif); return kayitlar().filter(function (x) { return x.t >= bas && x.t <= bit && (!s || !x.s || x.s === s); }); }
function kayitEkrani() {
  stil();
  var w = ekran('oy_kayitlar', 'Rehberlik Kayıtlarım');
  w.appendChild(el('p', { text: 'Rehberlik formlarından Word/PDF aldığınızda ya da yazdırdığınızda burada bir kayıt satırı oluşur: form türü, tarih ve sınıf. Öğrenci adı ve görüşme içeriği tutulmaz. Yıl sonu ve aylık raporlardaki sayılar bu kayıtlardan gelir.' }));
  var L = kayitlar().slice().sort(function (a, b) { return a.t < b.t ? 1 : -1; });
  var c = say(L);
  var oz = el('table', { class: 'oyek-t' }, [el('tr', {}, [el('th', { text: 'Kayıt türü' }), el('th', { text: 'Sayı' })])]);
  Object.keys(KAYIT_AD).forEach(function (k) {
    if (k === 'rhb_sosyometri') { ['sosyometri', 'kimdir'].forEach(function (m) { var n = c['rhb_sosyometri_' + m]; if (n) oz.appendChild(el('tr', {}, [el('td', { text: m === 'kimdir' ? 'Kimdir Bu? uygulaması' : 'Sosyometri uygulaması' }), el('td', { text: String(n) })])); }); return; }
    if (c[k]) oz.appendChild(el('tr', {}, [el('td', { text: KAYIT_AD[k] }), el('td', { text: String(c[k]) })]));
  });
  w.appendChild(el('h3', { text: 'Özet (' + L.length + ' kayıt)' })); w.appendChild(oz);
  var t = el('table', { class: 'oyek-t' }, [el('tr', {}, [el('th', { text: 'Tarih' }), el('th', { text: 'Kayıt' }), el('th', { text: 'Sınıf' }), el('th', { text: '' })])]);
  L.slice(0, 300).forEach(function (x) {
    var sil = el('button', { class: 'sec', text: '−', title: 'Kaydı sil' });
    sil.addEventListener('click', function () { SS(KEY_K, kayitlar().filter(function (y) { return y.z !== x.z; })); kayitEkrani(); });
    t.appendChild(el('tr', {}, [el('td', { text: trd(x.t) }), el('td', { text: x.id === 'rhb_sosyometri' ? (x.m === 'kimdir' ? 'Kimdir Bu? uygulaması' : 'Sosyometri uygulaması') : (KAYIT_AD[x.id] || x.id) }), el('td', { text: x.s || '—' }), el('td', {}, [sil])]));
  });
  w.appendChild(el('h3', { text: 'Kayıtlar' })); w.appendChild(t);
  var tum = el('button', { class: 'sec', text: 'Tüm kayıtları sil' });
  tum.addEventListener('click', function () { if (tum.dataset.c !== '1') { tum.dataset.c = '1'; tum.textContent = 'Emin misiniz? Tekrar tıklayın'; return; } SS(KEY_K, []); kayitEkrani(); });
  w.appendChild(el('div', { class: 'bar' }, [tum]));
}

/* ---------------- 4) Yıl sonu ve aylık rapora kayıtlardan doldurma ---------------- */
var OTO = ' (kayıtlardan)';
function otoListe(eski, yeni) { return lines(eski).filter(function (x) { return x.indexOf(OTO) < 0; }).concat(yeni.map(function (x) { return x + OTO; })).join('\n'); }
function raporDoldur(F, bas, bit) {
  var c = say(suz(bas, bit, F.sinif)), n = function (k) { return c[k] || 0; };
  var yap = [], vel = [];
  [['rehber_ogrenci_gorusme', 'Öğrenci görüşmesi'], ['rehber_gozlem', 'Öğrenci gözlem formu'], ['rhb_sosyometri_sosyometri', 'Sosyometri uygulaması'], ['rhb_sosyometri_kimdir', 'Kimdir Bu? uygulaması'], ['rhb_risk', 'Sınıf risk haritası çalışması'], ['ev_bep', 'BEP hazırlanan öğrenci'], ['bep_zep', 'BEP / ZEP planı'], ['ev_kaynastirma', 'Kaynaştırma dönem değerlendirmesi']].forEach(function (a) { if (n(a[0])) yap.push(a[1] + ': ' + n(a[0])); });
  [['rehber_veli_gorusme', 'Veli görüşmesi'], ['rehber_ev_ziyareti', 'Ev ziyareti'], ['rehber_aile_bilgi', 'Aile bilgi formu'], ['veli', 'Veli toplantısı']].forEach(function (a) { if (n(a[0])) vel.push(a[1] + ': ' + n(a[0])); });
  F.yapilan = otoListe(F.yapilan, yap); F.veli = otoListe(F.veli, vel);
  var g = n('rehber_ogrenci_gorusme'), y = n('rehber_rpd_yonlendirme');
  F.bireysel = 'Bireysel görüşme: ' + g + ', rehberlik servisine yönlendirme: ' + y;
  if (!F.mevcut) { var og = ogrenciler(F.sinif); if (og.length) F.mevcut = String(og.length); }
  return yap.length + vel.length + g + y;
}
function otoKutu(id) {
  var form = document.getElementById('dform'); if (!form || document.getElementById('oyekOto')) return;
  var aylik = id === 'rhb_aylik';
  var kutu = el('div', { class: 'oyek-oto noprint', id: 'oyekOto' }, [
    el('b', { text: 'Kayıtlardan doldur: ' }),
    el('span', { class: 'oyek-kucuk', text: aylik ? 'Seçilen ayda bu sınıf için aldığınız rehberlik formlarını sayar.' : 'Bu eğitim yılında bu sınıf için aldığınız rehberlik formlarını sayar (Rehberlik Kayıtlarım).' }), ' ',
    el('button', { id: 'oyekOtoBtn', text: 'Kayıtlardan doldur', on: { click: function () {
      var F = root.F; (form.querySelectorAll('[name]') || []).forEach(function (i) { F[i.name] = i.value; });
      var ar = yilAraligi(F.egitim_yili);
      if (aylik) { var ay = AYLAR.indexOf(F.ay); if (ay < 0) { bilgi('Önce ayı seçin.', 1); return; } var mo = ay < 4 ? ay + 9 : ay - 3, y = +ar[0].slice(0, 4) + (ay < 4 ? 0 : 1), son = new Date(y, mo, 0).getDate(); ar = [y + '-' + ('0' + mo).slice(-2) + '-01', y + '-' + ('0' + mo).slice(-2) + '-' + son]; }
      var top = raporDoldur(F, ar[0], ar[1]);
      localStorage.setItem('oy_f_' + id, JSON.stringify(F)); root.sel(id);
      bilgi(top ? 'Sayılar kayıtlardan dolduruldu. "(kayıtlardan)" yazan satırlar her doldurmada yenilenir; kendi satırlarınız korunur.' : 'Bu dönem ve sınıf için kayıt bulunamadı. Formlardan Word/PDF aldıkça kayıt oluşur.', !top);
    } } })
  ]);
  form.parentNode.insertBefore(kutu, form);
}

/* ---------------- 5) Mevcut rehberlik formlarına öğrenci ve içerik alanları ---------------- */
var RF_ANAHTAR = { 'Görüşme nedeni': 'neden', 'Görüşme özeti': 'ozet', 'Yönlendirme': 'yonlendirme', 'Veli': 'veli_ad', 'Konu': 'konu', 'Alınan karar': 'karar', 'Adres': 'adres', 'Ziyaret eden': 'ziyaret', 'Gözlemler': 'gozlem', 'Öneriler': 'oneri', 'Anne/baba bilgileri': 'aile', 'Kardeş sayısı': 'kardes', 'Sağlık/özel durum': 'saglik', 'İletişim': 'iletisim', 'Gözlem tarihi/ortamı': 'ortam', 'Gözlenen davranış': 'davranis', 'Sıklık': 'siklik', 'Yorum': 'yorum', 'Yönlendirme nedeni': 'yneden', 'Yapılan çalışmalar': 'calisma' };
var KISA = { 'Veli': 1, 'Kardeş sayısı': 1, 'Ziyaret eden': 1, 'Sıklık': 1, 'Adres': 1, 'İletişim': 1 };
function rehberFormlariGenislet() {
  OY.T.forEach(function (t) {
    if (!/^rehber_/.test(t.id) || t._oyek || !t.build) return;
    var orj = t.build, ornek;
    try { ornek = orj({}, { sinif: '', tarih: '' }); } catch (e) { return; }
    var tab = (ornek || []).filter(function (b) { return b && b.t === 'table' && b.head && b.head[0] === 'Alan'; })[0];
    if (!tab) return;
    var etk = tab.rows.map(function (r) { return r[0]; });
    var yeni = [{ k: 'ogrenci', l: 'Öğrenci (ad soyad / no)' }];
    etk.forEach(function (x) { var k = RF_ANAHTAR[x]; if (k) yeni.push({ k: k, l: x, type: KISA[x] ? undefined : 'area' }); });
    var si = t.alan.map(function (a) { return a.k; }).indexOf('sinif');
    t.alan = t.alan.slice(0, si + 1).concat(yeni, t.alan.slice(si + 1));
    t._oyek = true;
    t.build = function (p, f) {
      var out = orj(p, f);
      out.forEach(function (b) {
        if (!(b && b.t === 'table' && b.head && b.head[0] === 'Alan')) return;
        b.rows = b.rows.map(function (r) {
          var k = RF_ANAHTAR[r[0]], v;
          if (r[0] === 'Öğrenci') v = f.ogrenci; else if (r[0] === 'Tarih') v = f.tarih ? trd(f.tarih) : ''; else if (r[0] === 'Öğretmen') v = (p && p.ad) || ''; else v = k ? f[k] : '';
          return [r[0], v ? String(v) : '\n\n'];
        });
      });
      return out;
    };
  });
  var sr = OY.get('sinif_rehberlik');
  if (sr && !sr._oyek) {
    sr._oyek = true; sr.baslik = 'Sınıf Rehberlik Yıllık Planı';
    sr.alan = sr.alan.concat([{ k: 'ornek', l: 'Örnek temalarla doldur', type: 'select', opts: ['Evet', 'Hayır'] }]);
    var o2 = sr.build;
    sr.build = function (p, f) {
      var out = o2(p, f); if (f.ornek === 'Hayır') return out;
      out.forEach(function (b, i) {
        if (b && b.t === 'table' && b.head && b.head[0] === 'Ay') {
          b.rows = ORNEK_PLAN.map(function (r) { return [r[0], '', r[1], r[2], r[3]]; });
          b.small = true;
        }
        if (b && b.t === 'note' && /iskelet/.test(b.x)) out[i] = { t: 'note', x: 'Temalar örnek önerilerdir; MEB Sınıf Rehberlik Programı\'ndaki kazanımlarla karşılaştırıp düzenleyiniz (Word çıktısında değiştirebilirsiniz).' };
      });
      return out;
    };
  }
}
var ORNEK_PLAN = [
  ['Eylül', 'Akademik', 'Okula ve sınıfa uyum, okul kurallarını tanıma', 'Tanışma oyunu, sınıf sözleşmesi'],
  ['Eylül', 'Sosyal-duygusal', 'Kendini tanıtma ve arkadaşlarını tanıma', 'Ben kimim? etkinliği'],
  ['Ekim', 'Akademik', 'Verimli ders çalışma ve zaman planlama', 'Haftalık çalışma çizelgesi hazırlama'],
  ['Ekim', 'Sosyal-duygusal', 'Arkadaşlık ve iş birliği', 'Grup oyunu ve değerlendirme'],
  ['Kasım', 'Sosyal-duygusal', 'Duyguları tanıma ve ifade etme', 'Duygu kartları ile tartışma'],
  ['Kasım', 'Akademik', 'Sınav kaygısıyla baş etme', 'Nefes ve hazırlık planı çalışması'],
  ['Aralık', 'Sosyal-duygusal', 'Akran zorbalığını tanıma ve önleme', 'Örnek olay üzerinde tartışma'],
  ['Aralık', 'Kariyer', 'İlgi ve yeteneklerini tanıma', 'İlgi alanları listesi hazırlama'],
  ['Ocak', 'Akademik', 'Dönemi değerlendirme ve yeni hedef belirleme', 'Hedef kartı yazma'],
  ['Şubat', 'Sosyal-duygusal', 'Öfke yönetimi ve çatışma çözme', 'Canlandırma (rol oynama)'],
  ['Şubat', 'Kariyer', 'Meslekleri tanıma', 'Meslek tanıtım sunumları'],
  ['Mart', 'Sosyal-duygusal', 'Sağlıklı yaşam ve bağımlılıktan korunma', 'Bilgilendirme ve soru-cevap'],
  ['Mart', 'Akademik', 'Öğrenme yollarını tanıma', 'Öğrenme stili etkinliği'],
  ['Nisan', 'Kariyer', 'Eğitim seçenekleri ve gelecek planı', 'Okul / alan tanıtımı'],
  ['Nisan', 'Sosyal-duygusal', 'Güvenli internet ve kendini koruma', 'Senaryo üzerinde tartışma'],
  ['Mayıs', 'Kariyer', 'Karar verme becerisi', 'Karar ağacı çalışması'],
  ['Mayıs', 'Sosyal-duygusal', 'Teşekkür ve güzel dilekler', 'Arkadaşa not yazma etkinliği'],
  ['Haziran', 'Akademik', 'Yılı değerlendirme ve yaz planı', 'Yıl değerlendirme anketi']
];

/* ---------------- 6) Yeni formlar (ana form motoru) ---------------- */
var AYLAR = ['Eylül', 'Ekim', 'Kasım', 'Aralık', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
function ust(p, baslik) { return (OY.resmiUst ? OY.resmiUst(p) : [{ t: 'center', x: 'T.C.' }]).concat([{ t: 'h1', x: baslik }]); }
function onay(p, f) { return { t: 'onay', x: 'UYGUNDUR', tarih: trd(f.tarih), ad: p.mudur || '……………………', unvan: 'Okul Müdürü' }; }
function yeniFormlar() {
  if (OY.get('rhb_bireysel')) return;
  OY.T.push({ id: 'rhb_bireysel', kat: KAT, baslik: 'Bireysel Görüşme Kayıt Formu (Rehberlik Servisi)', kaynak: 'RPD Hizmetleri Yönetmeliği (RG 14.08.2020/31213); form alanları özgün',
    alan: [{ k: 'ogrenci', l: 'Öğrenci (ad soyad / no)' }, { k: 'sinif', l: 'Sınıf/Şube' }, { k: 'tarih', l: 'Tarih', type: 'date' }, { k: 'saat', l: 'Saat' }, { k: 'oturum', l: 'Görüşme no (kaçıncı görüşme)' },
      { k: 'basvuru', l: 'Başvuru biçimi', type: 'select', opts: ['Kendi isteğiyle', 'Öğretmen yönlendirmesi', 'Veli talebi', 'Okul yönetimi', 'Rehber öğretmenin çağrısı'] },
      { k: 'alan', l: 'Hizmet alanı', type: 'select', opts: ['Eğitsel', 'Kişisel-sosyal', 'Mesleki', 'Aile ile ilgili', 'Diğer'] },
      { k: 'neden', l: 'Başvuru nedeni / gündem', type: 'area' }, { k: 'ozet', l: 'Görüşme özeti (öznel yorum yerine gözlem yazınız)', type: 'area' },
      { k: 'plan', l: 'Yapılacaklar / öğrenciyle varılan karar', type: 'area' },
      { k: 'yonlendirme', l: 'Yönlendirme / bilgilendirme', type: 'select', opts: ['Gerekmedi', 'Veli bilgilendirildi', 'Sınıf rehber öğretmeni bilgilendirildi', 'RAM\'a yönlendirme önerildi', 'Sağlık kuruluşuna yönlendirme önerildi', 'Okul yönetimine bilgi verildi'] },
      { k: 'sonraki', l: 'Sonraki görüşme tarihi', type: 'date' }],
    build: function (p, f) {
      return ust(p, 'BİREYSEL GÖRÜŞME KAYIT FORMU').concat([
        { t: 'kv', rows: [['Eğitim-Öğretim Yılı', f.egitim_yili || OY.egitimYili()], ['Öğrenci', f.ogrenci || '……'], ['Sınıf/Şube', f.sinif || '……'], ['Tarih / saat', trd(f.tarih) + (f.saat ? ' – ' + f.saat : '')], ['Görüşme no', f.oturum || '……'], ['Başvuru biçimi', f.basvuru || '……'], ['Hizmet alanı', f.alan || '……']] },
        { t: 'h2', x: 'BAŞVURU NEDENİ' }, { t: 'p', x: f.neden || '……………………………………' },
        { t: 'h2', x: 'GÖRÜŞME ÖZETİ' }, { t: 'p', x: f.ozet || '……………………………………' },
        { t: 'h2', x: 'YAPILACAKLAR VE KARARLAR' }, { t: 'p', x: f.plan || '……………………………………' },
        { t: 'kv', rows: [['Yönlendirme / bilgilendirme', f.yonlendirme || '……'], ['Sonraki görüşme', f.sonraki ? trd(f.sonraki) : '……']] },
        { t: 'note', x: 'GİZLİDİR. Bu kayıt rehberlik servisinde saklanır; öğrencinin yazılı ya da sözlü izni olmadan üçüncü kişilerle paylaşılmaz (yasal bildirim yükümlülükleri saklıdır).' },
        { t: 'sign', names: [(p.ad || '……………………') + '\n' + (/rehber|pdr|psikolojik/i.test(p.brans || '') ? 'Rehber Öğretmen / Psikolojik Danışman' : (p.brans ? p.brans + ' Öğretmeni' : 'Öğretmen'))] }
      ]);
    } });
  OY.T.push({ id: 'rhb_aylik', kat: KAT, baslik: 'Sınıf Rehberlik Aylık Faaliyet Raporu', kaynak: 'Özgün form; sayılar "Rehberlik Kayıtlarım"dan doldurulabilir',
    alan: [{ k: 'sinif', l: 'Sınıf/Şube' }, { k: 'ay', l: 'Ay', type: 'select', opts: AYLAR }, { k: 'tarih', l: 'Rapor tarihi', type: 'date' }, { k: 'mevcut', l: 'Öğrenci mevcudu' },
      { k: 'yapilan', l: 'Yapılan rehberlik etkinlikleri', type: 'list' }, { k: 'bireysel', l: 'Bireysel görüşme / yönlendirme sayısı (ad yazmayınız)' },
      { k: 'veli', l: 'Veli çalışmaları', type: 'list' }, { k: 'sorun', l: 'Gözlenen genel durum / sorunlar', type: 'area' }, { k: 'oneri', l: 'Rehberlik servisinden beklenen destek', type: 'list' }],
    build: function (p, f) {
      var L = function (k) { var a = lines(f[k]); return a.length ? a : ['……………………………………']; };
      return ust(p, ((f.sinif || p.sinif || '……') + ' SINIFI ' + (f.ay || '……') + ' AYI REHBERLİK FAALİYET RAPORU').toLocaleUpperCase('tr-TR')).concat([
        { t: 'kv', rows: [['Eğitim-Öğretim Yılı', f.egitim_yili || OY.egitimYili()], ['Sınıf/Şube', f.sinif || '……'], ['Öğrenci mevcudu', f.mevcut || '……'], ['Bireysel görüşme / yönlendirme', f.bireysel || '……'], ['Rapor tarihi', trd(f.tarih)]] },
        { t: 'h2', x: 'YAPILAN ETKİNLİKLER' }, { t: 'ul', items: L('yapilan') }, { t: 'h2', x: 'VELİ ÇALIŞMALARI' }, { t: 'ul', items: L('veli') },
        { t: 'h2', x: 'GÖZLEMLER' }, { t: 'p', x: f.sorun || '……………………………………' }, { t: 'h2', x: 'BEKLENEN DESTEK' }, { t: 'ul', items: L('oneri') },
        { t: 'sign', names: [(p.ad || '……………………') + '\nSınıf Rehber Öğretmeni'] }
      ]);
    } });
}

/* ---------------- 7) Öğrenci listesi adımı (sosyometri ve risk haritası ortak) ---------------- */
function ogrParse(liste) { return lines(liste).map(function (x) { var m = /^(\d{1,6})[\s.\-:;,]+(.+)$/.exec(x); return m ? { no: m[1], ad: m[2].trim() } : { no: '', ad: x }; }); }
function goster(o, F) { var a = F.basHarf !== false ? basHarf(o.ad) : o.ad; return a + (o.no ? ' (' + o.no + ')' : ''); }
function listeAdimi(form, F, upd, onDegis) {
  var ks = hazirSiniflar(), si = null;
  var s = el('select', {}); s.appendChild(el('option', { value: '', text: ks.length ? '— Sınıf listelerimden seç —' : 'Sınıf listesi yok (Sınıf Listelerim)' }));
  ks.forEach(function (k) { var o = el('option', { value: k, text: k + ' (' + ogrenciler(k).length + ')' }); if (F.sinif === k) o.selected = true; s.appendChild(o); });
  var ta = el('textarea', { placeholder: 'Her satıra bir öğrenci: Okul No ve Ad Soyad (ör. 123 Ayşe Kaya)', style: 'min-height:160px' }); ta.value = F.liste || '';
  s.addEventListener('change', function () { if (!s.value) return; F.sinif = s.value; if (si) si.value = s.value; F.liste = ogrenciler(s.value).map(function (o) { return (o.no ? o.no + ' ' : '') + o.ad; }).join('\n'); ta.value = F.liste; upd(); if (onDegis) onDegis(); });
  ta.addEventListener('input', function () { F.liste = ta.value; upd(); });
  form.appendChild(el('label', {}, ['Sınıf listesi', s]));
  si = el('input', { type: 'text', value: F.sinif || '' }); si.addEventListener('input', function () { F.sinif = si.value; upd(); });
  form.appendChild(el('label', {}, ['Sınıf/Şube', si]));
  var td = el('input', { type: 'date', value: F.tarih || '' }); td.addEventListener('change', function () { F.tarih = td.value; upd(); });
  form.appendChild(el('label', {}, ['Uygulama tarihi', td]));
  var bh = el('select', {}); [['1', 'Raporda baş harfler (önerilir)'], ['0', 'Raporda tam ad']].forEach(function (x) { var o = el('option', { value: x[0], text: x[1] }); if ((F.basHarf !== false ? '1' : '0') === x[0]) o.selected = true; bh.appendChild(o); });
  bh.addEventListener('change', function () { F.basHarf = bh.value === '1'; upd(); });
  form.appendChild(el('label', {}, ['Ad gösterimi', bh]));
  form.appendChild(el('label', { class: 'wide' }, ['Öğrenciler (' + ogrParse(F.liste).length + ')', ta]));
}

/* ---------------- 8) Sosyometri ve Kimdir Bu? ---------------- */
var KIMDIR0 = ['Arkadaşlarına en çok yardım eden', 'Herkesle iyi geçinen', 'Sınıfta en neşeli olan', 'Bir işi başlatıp herkesi toparlayan', 'Sözünü tutan, güvenilen', 'Derslerde arkadaşlarına konu anlatan', 'Yeni gelen birine ilk yardım eden', 'Haksızlığa karşı çıkan', '(-) Arkadaşlarını en çok kıran', '(-) Sınıfta en yalnız kalan', '(-) Kavgaya en çok karışan', '(-) Sınıfta en çok üzgün görünen'];
function sosDefaults() { return { mod: 'sosyometri', sinif: '', liste: '', tarih: bugun(), basHarf: true, soru: 'Sınıfta birlikte çalışmak (proje / grup ödevi) istediğin üç arkadaşın kimdir? Önce en çok istediğini yaz.', osoru: '', k: 3, sec: {}, osec: {}, oz: KIMDIR0.join('\n'), kim: {}, yorum: '', ogretmen: '' }; }
function sosHesap(F) {
  var og = ogrParse(F.liste), n = og.length, k = Math.max(1, Math.min(5, +F.k || 3));
  var R = og.map(function () { return { say: 0, puan: 0, ilk: 0, olum: 0, kimden: [] }; }), ciftler = [];
  for (var i = 0; i < n; i++) {
    var s = (F.sec && F.sec[i]) || [];
    for (var r = 0; r < k; r++) { var j = s[r]; if (j === '' || j == null || +j === i || +j >= n) continue; j = +j; R[j].say++; R[j].puan += k - r; if (r === 0) R[j].ilk++; R[j].kimden.push(i); }
    var os = (F.osec && F.osec[i]) || []; os.forEach(function (j) { if (j !== '' && j != null && +j !== i && +j < n) R[+j].olum++; });
  }
  for (var a = 0; a < n; a++) for (var b = a + 1; b < n; b++) { var num = function (v) { return v === '' || v == null ? -1 : +v; }, sa = ((F.sec || {})[a] || []).map(num), sb = ((F.sec || {})[b] || []).map(num); if (sa.slice(0, k).indexOf(b) >= 0 && sb.slice(0, k).indexOf(a) >= 0) ciftler.push([a, b]); }
  var esik = Math.max(3, Math.ceil(k * 1.7));
  R.forEach(function (x, i) {
    x.karsilikli = ciftler.filter(function (c) { return c[0] === i || c[1] === i; }).length;
    x.durum = x.say >= esik ? 'Çok seçilen' : x.say === 0 ? 'Hiç seçilmeyen' : x.say === 1 ? 'Az seçilen' : '';
    if (x.olum >= 3) x.durum = (x.durum ? x.durum + '; ' : '') + 'Olumsuz tercihte öne çıkan';
  });
  var cevap = og.filter(function (_, i) { return ((F.sec || {})[i] || []).some(function (v) { return v !== '' && v != null; }); }).length;
  return { og: og, n: n, k: k, R: R, ciftler: ciftler, esik: esik, cevap: cevap };
}
function kimHesap(F) {
  var og = ogrParse(F.liste), oz = lines(F.oz);
  var tab = og.map(function (_, i) { var r = (F.kim || {})[i] || {}; var arti = 0, eksi = 0; var d = oz.map(function (z, t) { var v = +r[t] || 0; if (/^\(-\)/.test(z)) eksi += v; else arti += v; return v; }); return { d: d, arti: arti, eksi: eksi }; });
  return { og: og, oz: oz, tab: tab };
}
function sosBuild(p, F) {
  var kim = F.mod === 'kimdir';
  var o = ust(p, kim ? '"KİMDİR BU?" TEKNİĞİ SONUÇ ÇİZELGESİ' : 'SOSYOMETRİ UYGULAMASI SONUÇ RAPORU');
  if (kim) {
    var K = kimHesap(F);
    o.push({ t: 'kv', rows: [['Eğitim-Öğretim Yılı', F.egitim_yili || OY.egitimYili()], ['Sınıf/Şube', F.sinif || '……'], ['Uygulama tarihi', trd(F.tarih)], ['Öğrenci sayısı', String(K.og.length)]] });
    if (!K.og.length) { o.push({ t: 'p', x: 'Öğrenci listesini giriniz.' }); return o; }
    o.push({ t: 'h2', x: 'ÖZELLİKLER' }); o.push({ t: 'ol', items: K.oz.map(function (z) { return z.replace(/^\(-\)\s*/, '') + (/^\(-\)/.test(z) ? ' (olumsuz)' : ''); }) });
    o.push({ t: 'h2', x: 'ÖĞRENCİLERİN ALDIĞI ADLANDIRMALAR' });
    o.push({ t: 'table', small: true, head: ['Öğrenci'].concat(K.oz.map(function (_, t) { return String(t + 1); })).concat(['Olumlu', 'Olumsuz']), rows: K.og.map(function (s, i) { return [goster(s, F)].concat(K.tab[i].d.map(function (v) { return v ? String(v) : ''; })).concat([String(K.tab[i].arti), String(K.tab[i].eksi)]); }) });
    var oz = K.og.map(function (s, i) { return { s: s, t: K.tab[i] }; });
    var en = oz.filter(function (x) { return x.t.arti; }).sort(function (a, b) { return b.t.arti - a.t.arti; }).slice(0, 5).map(function (x) { return goster(x.s, F) + ' – ' + x.t.arti; });
    var ol = oz.filter(function (x) { return x.t.eksi >= 2; }).sort(function (a, b) { return b.t.eksi - a.t.eksi; }).map(function (x) { return goster(x.s, F) + ' – ' + x.t.eksi; });
    var hic = oz.filter(function (x) { return !x.t.arti && !x.t.eksi; }).map(function (x) { return goster(x.s, F); });
    o.push({ t: 'h2', x: 'ÖNE ÇIKANLAR' });
    o.push({ t: 'kv', rows: [['Olumlu özelliklerle en çok anılanlar', en.join(', ') || '—'], ['Olumsuz özelliklerle 2 ve daha çok anılanlar', ol.join(', ') || '—'], ['Hiç anılmayanlar', hic.join(', ') || '—']] });
  } else {
    var H = sosHesap(F);
    o.push({ t: 'kv', rows: [['Eğitim-Öğretim Yılı', F.egitim_yili || OY.egitimYili()], ['Sınıf/Şube', F.sinif || '……'], ['Uygulama tarihi', trd(F.tarih)], ['Öğrenci sayısı / yanıtlayan', H.n + ' / ' + H.cevap], ['Sosyometrik soru', F.soru || '……'], ['Seçim sayısı', H.k + ' (1. seçim ' + H.k + ' puan, son seçim 1 puan)']].concat(F.osoru ? [['Olumsuz soru', F.osoru]] : []) });
    if (!H.n) { o.push({ t: 'p', x: 'Öğrenci listesini giriniz.' }); return o; }
    var sira = H.og.map(function (s, i) { return i; }).sort(function (a, b) { return H.R[b].puan - H.R[a].puan || H.R[b].say - H.R[a].say; });
    o.push({ t: 'h2', x: 'SEÇİLME ÇİZELGESİ' });
    o.push({ t: 'table', small: true, head: ['Sıra', 'Öğrenci', 'Seçilme', '1. seçim', 'Puan', 'Karşılıklı'].concat(F.osoru ? ['Olumsuz'] : []).concat(['Durum']), rows: sira.map(function (i, x) { var r = H.R[i]; return [String(x + 1), goster(H.og[i], F), String(r.say), String(r.ilk), String(r.puan), String(r.karsilikli)].concat(F.osoru ? [String(r.olum)] : []).concat([r.durum || '']); }) });
    var gr = function (re) { return sira.filter(function (i) { return re.test(H.R[i].durum); }).map(function (i) { return goster(H.og[i], F); }); };
    o.push({ t: 'h2', x: 'ÖZET' });
    o.push({ t: 'kv', rows: [['Çok seçilen (' + H.esik + ' ve üzeri)', gr(/Çok seçilen/).join(', ') || '—'], ['Hiç seçilmeyen', gr(/Hiç seçilmeyen/).join(', ') || '—'], ['Az seçilen (1 seçim)', gr(/Az seçilen/).join(', ') || '—']].concat(F.osoru ? [['Olumsuz tercihte öne çıkan (3+)', gr(/Olumsuz/).join(', ') || '—']] : []).concat([['Karşılıklı seçimler', H.ciftler.map(function (c) { return goster(H.og[c[0]], F) + ' ↔ ' + goster(H.og[c[1]], F); }).join('; ') || '—']]) });
  }
  o.push({ t: 'h2', x: 'DEĞERLENDİRME VE PLANLANAN ÇALIŞMALAR' });
  o.push({ t: 'p', x: F.yorum || 'Hiç seçilmeyen ve olumsuz tercihte öne çıkan öğrencilerle ilgili sınıf içi grup çalışmaları ve oturma düzeni gözden geçirilecek; gerekli görülen öğrenciler rehberlik servisiyle değerlendirilecektir.' });
  o.push({ t: 'note', x: 'GİZLİDİR. Sonuçlar öğrencilerle ve velilerle paylaşılmaz, sınıfta açıklanmaz. Sayılar yalnız bir göstergedir; tanılama amacıyla kullanılmaz, rehberlik servisiyle birlikte yorumlanır.' });
  o.push({ t: 'sign', names: [(F.ogretmen || p.ad || '……………………') + '\nSınıf Rehber Öğretmeni', '……………………\nRehber Öğretmen'] });
  return o;
}
function sosyogramSVG(F) {
  var H = sosHesap(F), n = H.n; if (n < 2) return '';
  var W = 900, Hh = 900, cx = W / 2, cy = Hh / 2;
  var mx = Math.max.apply(null, H.R.map(function (r) { return r.say; }).concat([1]));
  var pos = H.R.map(function (r, i) { var ring = 1 - (r.say / mx); var rad = 90 + ring * 300; var a = (i / n) * Math.PI * 2 - Math.PI / 2; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; });
  var e = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + Hh + '" width="' + W + '" height="' + Hh + '" font-family="Arial,sans-serif">';
  s += '<defs><marker id="ok" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="#555"/></marker></defs><rect width="100%" height="100%" fill="#fff"/>';
  [90, 240, 390].forEach(function (r) { s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#ddd" stroke-dasharray="4 6"/>'; });
  var cift = {}; H.ciftler.forEach(function (c) { cift[c[0] + '-' + c[1]] = cift[c[1] + '-' + c[0]] = 1; });
  for (var i = 0; i < n; i++) {
    var sc = (F.sec && F.sec[i]) || [];
    for (var r = 0; r < H.k; r++) {
      var j = sc[r]; if (j === '' || j == null || +j === i || +j >= n) continue; j = +j;
      if (cift[i + '-' + j]) { if (i < j) s += '<line x1="' + pos[i][0] + '" y1="' + pos[i][1] + '" x2="' + pos[j][0] + '" y2="' + pos[j][1] + '" stroke="#1565c0" stroke-width="3.5"/>'; continue; }
      if (r > 0 && !F.tumOk) continue;
      var dx = pos[j][0] - pos[i][0], dy = pos[j][1] - pos[i][1], L = Math.sqrt(dx * dx + dy * dy) || 1, k = 24 / L;
      s += '<line x1="' + (pos[i][0] + dx * k) + '" y1="' + (pos[i][1] + dy * k) + '" x2="' + (pos[j][0] - dx * k) + '" y2="' + (pos[j][1] - dy * k) + '" stroke="#777" stroke-width="' + (r === 0 ? 1.8 : 1) + '" marker-end="url(#ok)"' + (r > 0 ? ' stroke-dasharray="5 4"' : '') + '/>';
    }
  }
  H.R.forEach(function (r, i) {
    var renk = /Çok seçilen/.test(r.durum) ? '#ffd54f' : /Hiç seçilmeyen/.test(r.durum) ? '#ef9a9a' : /Az seçilen/.test(r.durum) ? '#ffe0b2' : '#c8e6c9';
    var ad = F.basHarf !== false ? basHarf(H.og[i].ad) : H.og[i].ad.split(/\s+/)[0];
    s += '<circle cx="' + pos[i][0] + '" cy="' + pos[i][1] + '" r="22" fill="' + renk + '" stroke="' + (r.olum >= 3 ? '#b71c1c' : '#333') + '" stroke-width="' + (r.olum >= 3 ? 4 : 1.5) + '"/>';
    s += '<text x="' + pos[i][0] + '" y="' + (pos[i][1] + 4) + '" font-size="12" text-anchor="middle">' + e(H.og[i].no || (i + 1)) + '</text>';
    s += '<text x="' + pos[i][0] + '" y="' + (pos[i][1] + 38) + '" font-size="13" text-anchor="middle">' + e(ad) + ' (' + r.say + ')</text>';
  });
  s += '<g font-size="14"><rect x="10" y="10" width="300" height="118" fill="#fff" stroke="#999"/>' +
    '<circle cx="28" cy="30" r="8" fill="#ffd54f" stroke="#333"/><text x="44" y="35">Çok seçilen (merkeze yakın)</text>' +
    '<circle cx="28" cy="52" r="8" fill="#ffe0b2" stroke="#333"/><text x="44" y="57">Az seçilen</text>' +
    '<circle cx="28" cy="74" r="8" fill="#ef9a9a" stroke="#333"/><text x="44" y="79">Hiç seçilmeyen (dış halka)</text>' +
    '<line x1="18" y1="96" x2="40" y2="96" stroke="#1565c0" stroke-width="3.5"/><text x="44" y="101">Karşılıklı seçim</text>' +
    '<line x1="18" y1="116" x2="40" y2="116" stroke="#777" stroke-width="1.8" marker-end="url(#ok)"/><text x="44" y="121">1. seçim (tek yönlü)</text></g>';
  return s + '</svg>';
}
function svgPng(svg, ad) {
  var img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  img.onload = function () { var c = el('canvas'); c.width = 1800; c.height = 1800; var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 1800, 1800); g.drawImage(img, 0, 0, 1800, 1800); URL.revokeObjectURL(url); c.toBlob(function (b) { indir(ad, b); }, 'image/png'); };
  img.src = url;
}
function sosUI() {
  stil();
  OYX.ui.wizard({
    id: 'rhb_sosyometri', baslik: 'Sosyometri ve "Kimdir Bu?" Uygulaması',
    kaynak: 'Rehberlikte kullanılan sosyometri ve "Kimdir Bu?" tekniklerinin özgün uygulama formu; sonuçlar yalnız rehberlik amaçlıdır.',
    defaults: sosDefaults, build: sosBuild,
    onUpd: function (F, kutu) {
      kutu.innerHTML = '';
      if (F.mod === 'kimdir' || ogrParse(F.liste).length < 2) return;
      var svg = sosyogramSVG(F); if (!svg) return;
      var b = el('div', { class: 'oyek-sg oyek-kart' }, [el('b', { text: 'Sosyogram' }), el('div', { html: svg })]);
      var tum = el('label', { class: 'oyek-kucuk' }, [el('input', { type: 'checkbox' }), ' 2. ve sonraki seçimleri de çiz']);
      tum.querySelector('input').checked = !!F.tumOk;
      tum.querySelector('input').addEventListener('change', function (e) { F.tumOk = e.target.checked; kutu.innerHTML = ''; var f = document.getElementById('dform'); if (f && f._upd) f._upd(); });
      b.appendChild(el('div', { class: 'bar' }, [tum, el('button', { class: 'sec', id: 'oyekPng', text: 'Sosyogramı resim (PNG) olarak indir', on: { click: function () { svgPng(svg, 'sosyogram-' + (F.sinif || 'sinif').replace(/[^\wçğıöşüÇĞİÖŞÜ-]+/g, '_') + '.png'); } } })]));
      b.appendChild(el('p', { class: 'oyek-kucuk', text: 'Sosyogram Word çıktısına otomatik girmez; PNG\'yi indirip Word belgesine ekleyebilirsiniz.' }));
      kutu.appendChild(b);
    },
    steps: [
      { ad: 'Sınıf ve uygulama', render: function (form, F, upd) {
        var m = el('select', {}); [['sosyometri', 'Sosyometri (arkadaş seçimi)'], ['kimdir', '"Kimdir Bu?" (özellik eşleştirme)']].forEach(function (x) { var o = el('option', { value: x[0], text: x[1] }); if (F.mod === x[0]) o.selected = true; m.appendChild(o); });
        m.addEventListener('change', function () { F.mod = m.value; upd(); });
        form.appendChild(el('label', {}, ['Uygulama', m]));
        listeAdimi(form, F, upd);
        var soru = el('textarea', {}); soru.value = F.soru || ''; soru.addEventListener('input', function () { F.soru = soru.value; upd(); });
        var os = el('input', { type: 'text', value: F.osoru || '', placeholder: 'Boş bırakılabilir. Ör. Grup çalışmasında birlikte olmak istemediğin arkadaşın kimdir?' }); os.addEventListener('input', function () { F.osoru = os.value; upd(); });
        var k = el('select', {}); [1, 2, 3, 4, 5].forEach(function (v) { var o = el('option', { value: String(v), text: String(v) }); if (+F.k === v) o.selected = true; k.appendChild(o); }); k.addEventListener('change', function () { F.k = +k.value; upd(); });
        var oz = el('textarea', { style: 'min-height:200px' }); oz.value = F.oz || ''; oz.addEventListener('input', function () { F.oz = oz.value; upd(); });
        form.appendChild(el('label', { class: 'wide' }, ['Sosyometrik soru (sosyometri)', soru]));
        form.appendChild(el('label', {}, ['Seçim sayısı', k]));
        form.appendChild(el('label', { class: 'wide' }, ['Olumsuz soru (isteğe bağlı; kurumunuzun uygulamasına göre)', os]));
        form.appendChild(el('label', { class: 'wide' }, ['"Kimdir Bu?" özellikleri (her satıra bir; olumsuz olanların başına (-) yazınız)', oz]));
      } },
      { ad: 'Yanıtları gir', render: function (form, F, upd) {
        var og = ogrParse(F.liste);
        if (!og.length) { form.appendChild(el('p', { class: 'oyx-uyari', text: 'Önce 1. adımda öğrenci listesini girin.' })); return; }
        var kap = el('div', { class: 'wide', style: 'grid-column:1/-1;overflow:auto' }); form.appendChild(kap);
        if (F.mod === 'kimdir') {
          var oz = lines(F.oz); F.kim = F.kim || {};
          kap.appendChild(el('p', { class: 'oyek-kucuk', text: 'Kâğıtları sayıp her öğrencinin her özellik için kaç kez yazıldığını girin. Özellik numaraları: ' + oz.map(function (z, i) { return (i + 1) + ') ' + z; }).join('  ') }));
          var t = el('table', { class: 'oyek-t', id: 'oyekKim' }, [el('tr', {}, [el('th', { text: 'Öğrenci' })].concat(oz.map(function (z, i) { return el('th', { text: String(i + 1), title: z }); })))]);
          og.forEach(function (s, i) {
            var tr = el('tr', {}, [el('td', { text: (s.no ? s.no + ' ' : '') + s.ad })]);
            oz.forEach(function (_, j) { var inp = el('input', { type: 'number', min: '0', max: '99', value: ((F.kim[i] || {})[j]) || '' }); inp.addEventListener('input', function () { F.kim[i] = F.kim[i] || {}; F.kim[i][j] = inp.value; upd(); }); tr.appendChild(el('td', {}, [inp])); });
            t.appendChild(tr);
          });
          kap.appendChild(t); return;
        }
        var k = Math.max(1, Math.min(5, +F.k || 3)); F.sec = F.sec || {}; F.osec = F.osec || {};
        kap.appendChild(el('p', { class: 'oyek-kucuk', text: 'Her öğrencinin kâğıdındaki seçimleri sırasıyla seçin. Kâğıt vermeyen öğrencinin satırını boş bırakın.' }));
        var t2 = el('table', { class: 'oyek-t', id: 'oyekSec' }, [el('tr', {}, [el('th', { text: 'Seçen öğrenci' })].concat(Array.from({ length: k }, function (_, r) { return el('th', { text: (r + 1) + '. seçim' }); })).concat(F.osoru ? [el('th', { text: 'Olumsuz' })] : []))]);
        function secim(i, val, on) { var s = el('select', {}); s.appendChild(el('option', { value: '', text: '—' })); og.forEach(function (o, j) { if (j === i) return; var op = el('option', { value: String(j), text: (o.no ? o.no + ' ' : '') + o.ad }); if (String(val) === String(j)) op.selected = true; s.appendChild(op); }); s.addEventListener('change', function () { on(s.value); upd(); }); return s; }
        og.forEach(function (s, i) {
          var tr = el('tr', {}, [el('td', { text: (s.no ? s.no + ' ' : '') + s.ad })]);
          for (var r = 0; r < k; r++) (function (r) { tr.appendChild(el('td', {}, [secim(i, (F.sec[i] || [])[r], function (v) { F.sec[i] = F.sec[i] || []; F.sec[i][r] = v; })])); })(r);
          if (F.osoru) tr.appendChild(el('td', {}, [secim(i, (F.osec[i] || [])[0], function (v) { F.osec[i] = [v]; })]));
          t2.appendChild(tr);
        });
        kap.appendChild(t2);
      } },
      { ad: 'Değerlendirme ve imza', render: function (form, F, upd) {
        var y = el('textarea', { style: 'min-height:120px' }); y.value = F.yorum || ''; y.addEventListener('input', function () { F.yorum = y.value; upd(); });
        form.appendChild(el('label', { class: 'wide' }, ['Değerlendirme ve planlanan çalışmalar (boşsa örnek metin yazılır)', y]));
        var og = el('input', { type: 'text', value: F.ogretmen || '' }); og.addEventListener('input', function () { F.ogretmen = og.value; upd(); });
        form.appendChild(el('label', {}, ['Sınıf rehber öğretmeni', og]));
      } }
    ]
  });
}

/* ---------------- 9) Sınıf risk haritası ---------------- */
var RISK = [['dev', 'Devamsızlık'], ['bas', 'Akademik güçlük'], ['uyum', 'Uyum / davranış güçlüğü'], ['akm', 'Akran zorbalığına maruz kalma'], ['aku', 'Akran zorbalığı uygulama'], ['aile', 'Aile içi güçlük'], ['eko', 'Ekonomik güçlük'], ['sag', 'Süreğen sağlık sorunu'], ['izo', 'Sosyal yalnızlık'], ['terk', 'Okulu bırakma riski'], ['tek', 'Teknoloji / ekran bağımlılığı belirtisi'], ['dig', 'Diğer']];
function riskBuild(p, F) {
  var og = ogrParse(F.liste), R = F.risk || {};
  var o = ust(p, ((F.sinif || '……') + ' SINIFI RİSK HARİTASI').toLocaleUpperCase('tr-TR'));
  o.push({ t: 'kv', rows: [['Eğitim-Öğretim Yılı', F.egitim_yili || OY.egitimYili()], ['Sınıf/Şube', F.sinif || '……'], ['Tarih', trd(F.tarih)], ['Öğrenci sayısı', String(og.length)]] });
  o.push({ t: 'h2', x: 'RİSK ALANLARINA GÖRE DAĞILIM' });
  o.push({ t: 'table', head: ['Risk alanı', 'Öğrenci sayısı', 'Öğrenciler'], rows: RISK.map(function (r) { var l = og.map(function (s, i) { return (R[i] || {})[r[0]] ? goster(s, F) : null; }).filter(Boolean); return [r[1], String(l.length), l.join(', ')]; }) });
  var bir = og.map(function (s, i) { var a = RISK.filter(function (r) { return (R[i] || {})[r[0]]; }).map(function (r) { return r[1]; }); return a.length ? [goster(s, F), String(a.length), a.join(', '), ((F.notlar || {})[i]) || ''] : null; }).filter(Boolean).sort(function (a, b) { return +b[1] - +a[1]; });
  o.push({ t: 'h2', x: 'ÖĞRENCİ BAZINDA' });
  o.push(bir.length ? { t: 'table', head: ['Öğrenci', 'Alan sayısı', 'Risk alanları', 'Planlanan çalışma'], rows: bir } : { t: 'p', x: 'İşaretlenen öğrenci yok.' });
  o.push({ t: 'note', x: 'GİZLİDİR. Risk haritası gözleme dayalı bir ön belirlemedir, tanı değildir. Yalnız okul rehberlik servisiyle paylaşılır; öğrenci ve velilere açıklanmaz. Birden çok alanda işaretlenen öğrenciler için rehberlik servisiyle görüşülmesi önerilir.' });
  o.push({ t: 'sign', names: [(F.ogretmen || p.ad || '……………………') + '\nSınıf Rehber Öğretmeni', '……………………\nRehber Öğretmen'] });
  return o;
}
function riskUI() {
  stil();
  OYX.ui.wizard({
    id: 'rhb_risk', baslik: 'Sınıf Risk Haritası', kaynak: 'Özgün form; risk alanları gözleme dayalı ön belirleme içindir.',
    defaults: function () { return { sinif: '', liste: '', tarih: bugun(), basHarf: true, risk: {}, notlar: {}, ogretmen: '' }; }, build: riskBuild,
    steps: [
      { ad: 'Sınıf', render: function (form, F, upd) { listeAdimi(form, F, upd); } },
      { ad: 'Risk alanlarını işaretle', render: function (form, F, upd) {
        var og = ogrParse(F.liste); if (!og.length) { form.appendChild(el('p', { class: 'oyx-uyari', text: 'Önce 1. adımda öğrenci listesini girin.' })); return; }
        F.risk = F.risk || {}; F.notlar = F.notlar || {};
        var kap = el('div', { class: 'wide', style: 'grid-column:1/-1;overflow:auto' });
        kap.appendChild(el('p', { class: 'oyek-kucuk', text: 'Gözleminize göre ilgili kutuları işaretleyin. Sütun başlığının üstüne gelince tam adı görünür. ' + RISK.map(function (r, i) { return (i + 1) + ') ' + r[1]; }).join('  ') }));
        var t = el('table', { class: 'oyek-t', id: 'oyekRisk' }, [el('tr', {}, [el('th', { text: 'Öğrenci' })].concat(RISK.map(function (r, i) { return el('th', { text: String(i + 1), title: r[1] }); })).concat([el('th', { text: 'Planlanan çalışma' })]))]);
        og.forEach(function (s, i) {
          var tr = el('tr', {}, [el('td', { text: (s.no ? s.no + ' ' : '') + s.ad })]);
          RISK.forEach(function (r) { var c = el('input', { type: 'checkbox', title: r[1] }); c.checked = !!(F.risk[i] || {})[r[0]]; c.addEventListener('change', function () { F.risk[i] = F.risk[i] || {}; F.risk[i][r[0]] = c.checked; upd(); }); tr.appendChild(el('td', { style: 'text-align:center' }, [c])); });
          var n = el('input', { type: 'text', value: F.notlar[i] || '', style: 'min-width:160px' }); n.addEventListener('input', function () { F.notlar[i] = n.value; upd(); }); tr.appendChild(el('td', {}, [n]));
          t.appendChild(tr);
        });
        kap.appendChild(t); form.appendChild(kap);
      } }
    ]
  });
}

/* ---------------- 10) Kayıt, açılış ve paket süzgeci ---------------- */
var EKRAN = { oy_siniflar: sinifEkrani, oy_kayitlar: kayitEkrani, rhb_sosyometri: sosUI, rhb_risk: riskUI };
function sablonlariEkle() {
  yeniFormlar(); rehberFormlariGenislet();
  [['oy_siniflar', KAT_OGR, 'Sınıf Listelerim (e-Okul / Not Girişi Asistanı)'], ['oy_kayitlar', KAT_OGR, 'Rehberlik Kayıtlarım'], ['rhb_sosyometri', KAT, 'Sosyometri ve "Kimdir Bu?" Uygulaması'], ['rhb_risk', KAT, 'Sınıf Risk Haritası']].forEach(function (x) {
    if (OY.get(x[0])) return;
    OY.T.push({ id: x[0], kat: x[1], baslik: x[2], kaynak: 'ÖY ' + SURUM + ' rehberlik aracı (özgün)', alan: [], oyx: true, build: function () { return []; } });
  });
}
var PAKET_KAT = [KAT, KAT_OGR, 'BEP', 'Özel Eğitim', 'Veli', 'Yazı Şablonları', 'Mevzuat', 'Tüm Evraklar'];
var PAKET_ID = ['rpd_karar'];
function paketSuz() {
  var pk = root.OY_PAKET; if (!pk) return;
  var katlar = pk.katlar || PAKET_KAT, idler = pk.idler || PAKET_ID;
  for (var i = OY.T.length - 1; i >= 0; i--) { var t = OY.T[i]; if (t.ozel) continue; if (katlar.indexOf(t.kat) < 0 && idler.indexOf(t.id) < 0) OY.T.splice(i, 1); }
  try {
    var h1 = document.querySelector('header h1'); if (h1 && h1.firstChild && h1.firstChild.nodeType === 3) h1.firstChild.nodeValue = (pk.ad || 'Rehberlik Yardımcısı') + ' ';
    var sm = h1 && h1.querySelector('small'); if (sm) sm.textContent = 'v' + (pk.surum || SURUM);
    document.title = pk.ad || 'Rehberlik Yardımcısı';
  } catch (e) {}
}
function kanca() {
  sablonlariEkle(); paketSuz();
  if (!root.__oyekSel) {
    if (typeof root.sel !== 'function') { setTimeout(kanca, 30); return; }
    root.__oyekSel = true;
    var eski = root.sel;
    root.sel = function (id) {
      if (EKRAN[id]) { EKRAN[id](); bagla(); return; }
      if (!OY.get(id)) { bilgi('Bu bölüm bu pakette yok.', 1); return; }
      var r = eski.apply(this, arguments);
      try { bagla(); if (id === 'ev_rehber_yilsonu' || id === 'rhb_aylik') otoKutu(id); } catch (e) {}
      return r;
    };
  }
  if (typeof root.cats === 'function') root.cats();
  if (root.OY_PAKET && !root.cur && typeof root.home === 'function' && root.P && root.P.ad && root.P.okul) try { root.home(); } catch (e) {}
  var w = document.getElementById('work');
  if (w && !w.__oyekObs && typeof MutationObserver !== 'undefined') { w.__oyekObs = new MutationObserver(function () { try { bagla(); } catch (e) {} }); w.__oyekObs.observe(w, { childList: true, subtree: true }); }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(kanca, 0); });
else setTimeout(kanca, 0);

root.OYEK = { addanSinif: addanSinif, SURUM: SURUM, siniflar: siniflar, birlestir: birlestir, ogrenciler: ogrenciler, kayitlar: kayitlar, kayitEkle: kayitEkle, raporDoldur: raporDoldur, sosHesap: sosHesap, sosBuild: sosBuild, kimHesap: kimHesap, riskBuild: riskBuild, sosyogramSVG: sosyogramSVG, sinifNorm: sinifNorm, dosyaOku: dosyaOku };
})(typeof window !== 'undefined' ? window : this);

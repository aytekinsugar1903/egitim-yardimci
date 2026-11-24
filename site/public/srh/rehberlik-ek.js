/* Evrak Asistanı · Rehberlik Yardımcısı 1.1 eklentileri. Yayıncı: Eyüp ŞEKER.
   ekler.js'ten SONRA yüklenir; ortak çekirdeğe ve ekler.js'e dokunmaz.
   - Sürüm ayrımı: window.OY_PAKET.tur = 'tam' (rehber öğretmen) | 'sinif' (sınıf rehber öğretmeni), OY_PAKET.haric ile bölüm gizleme
   - Sınıf Rapor Dosyası (.rhbrapor): yıl sonu/aylık sayılar ve risk haritası dağılımı; öğrenci adı içermez
   - Okul Rehberlik İcmali (yalnız tam sürüm): gelen rapor dosyalarını birleştirir; Word/PDF/yazdır ve Excel
   - e-Rehberlik Hazırlık: yıllık plan satırlarını alan alan kopyalamak için; hiçbir sisteme bağlanmaz
   - Yıllık Hedef ve Etkinlik Bankası: eğitim yılına göre genel hedef ve etkinlik önerileri, yıllık plana ekleme
   - Şifreli Yedek ve Sınıf Devri: AES-GCM (parola PBKDF2-SHA256) ile cihazda şifrelenir; ağa çıkılmaz */
(function (root) {
'use strict';
if (typeof document === 'undefined' || typeof OY === 'undefined') return;
var SURUM = '1.1.4';
var KAT = 'Rehberlik';
var KAT_OGR = 'Sınıf Listeleri ve Kayıtlar';
function PK() { return root.OY_PAKET || {}; }
function TUR() { return PK().tur === 'sinif' ? 'sinif' : 'tam'; }

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
function SS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
function lines(v) { return String(v || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean); }
function trd(iso) { return OY.trDate ? OY.trDate(iso) : iso; }
function bugun() { return new Date().toISOString().slice(0, 10); }
function P() { return root.P || {}; }
function bilgi(t, err) { if (typeof root.msg === 'function') root.msg(t, err); }
function EK() { return root.OYEK || {}; }
function ey0() { return OY.egitimYili ? OY.egitimYili() : '2026-2027'; }
function sinifNorm(v) { return EK().sinifNorm ? EK().sinifNorm(v) : String(v || '').trim().toLocaleUpperCase('tr-TR').replace(/\s+/g, ''); }
function sinifSira(a, b) { var f = function (z) { var m = /^(\d+|ANA|HAZ)-(.+)$/.exec(z); return m ? [m[1] === 'ANA' ? 0 : m[1] === 'HAZ' ? 8.5 : +m[1], m[2]] : [99, z]; }; var x = f(a), y = f(b); return (x[0] - y[0]) || String(x[1]).localeCompare(String(y[1]), 'tr'); }
function hazirSiniflar() { var L = EK().siniflar ? EK().siniflar() : {}; return Object.keys(L).filter(function (k) { return k.charAt(0) !== '?'; }).sort(sinifSira); }
function ogrenciler(s) { return EK().ogrenciler ? EK().ogrenciler(s) : []; }
function kayitlar() { return EK().kayitlar ? EK().kayitlar() : LS('oy_rehber_kayit', []); }
function yilAraligi(ey) { var m = /^(\d{4})/.exec(String(ey || '')), y = m ? +m[1] : (function () { var d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; })(); return [y + '-09-01', (y + 1) + '-08-31']; }
var AYLAR = ['Eylül', 'Ekim', 'Kasım', 'Aralık', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos'];
function ayAdi(iso) { var m = +String(iso || '').slice(5, 7); return m ? AYLAR[(m + 3) % 12] : ''; }
function guvenliAd(s) { return String(s || '').replace(/[^\wçğıöşüÇĞİÖŞÜ.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); }
function indir(ad, blob) { var a = el('a', { href: URL.createObjectURL(blob), download: ad }); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 3000); }
function jsonIndir(ad, obj) { indir(ad, new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' })); }
function kopyala(metin, btn) {
  function tamam() { if (btn) { var e = btn.textContent; btn.textContent = 'Kopyalandı ✓'; btn.classList.add('rhb-ok'); setTimeout(function () { btn.textContent = e; btn.classList.remove('rhb-ok'); }, 1400); } }
  function yedek() { var t = el('textarea', { style: 'position:fixed;left:-9999px;top:0' }); t.value = metin; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); tamam(); } catch (e) { bilgi('Kopyalanamadı; metni elle seçip kopyalayın.', 1); } t.remove(); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(metin).then(tamam, yedek); else yedek();
}
function xlsxHazir() {
  if (root.XLSX) return Promise.resolve(root.XLSX);
  return new Promise(function (ok, no) { var s = el('script', { src: 'xlsx.js' }); s.onload = function () { ok(root.XLSX); }; s.onerror = function () { no(new Error('Excel yazıcı yüklenemedi.')); }; document.head.appendChild(s); });
}
function ekran(id, baslik) {
  if (typeof root.land === 'function') root.land(false);
  root.cur = { id: id, baslik: baslik, kaynak: '' };
  if (typeof root.cats === 'function') root.cats();
  var w = document.getElementById('work'); w.innerHTML = '';
  w.appendChild(el('h2', { text: baslik }));
  w.appendChild(el('div', { id: 'msg', class: 'msg hidden' }));
  return w;
}
function ust(p, baslik) { return (OY.resmiUst ? OY.resmiUst(p) : [{ t: 'center', x: 'T.C.' }]).concat([{ t: 'h1', x: baslik }]); }
function stil() {
  if (document.getElementById('rhb11-stil')) return;
  var s = el('style', { id: 'rhb11-stil' });
  s.textContent = [
    '.rhb-kart{border:2px solid #000;border-radius:8px;padding:10px 12px;margin:10px 0;background:#fff}',
    '.rhb-kart h3{margin:0 0 6px}',
    '.rhb-drop{border:3px dashed #000;border-radius:8px;padding:18px;text-align:center;background:#f4f7ff;cursor:pointer;margin:8px 0}',
    '.rhb-drop.on{background:#fff3cd}',
    '.rhb-t{border-collapse:collapse;width:100%;margin:8px 0}.rhb-t td,.rhb-t th{border:1px solid #666;padding:4px 6px;text-align:left;vertical-align:top}.rhb-t th{background:#eee}',
    '.rhb-satir{display:grid;grid-template-columns:160px 1fr auto;gap:6px;align-items:start;margin:4px 0}',
    '.rhb-satir .d{white-space:pre-wrap;background:#f7f7f7;border:1px solid #ccc;border-radius:6px;padding:6px 8px;min-height:22px}',
    '@media(max-width:700px){.rhb-satir{grid-template-columns:1fr}}',
    '.rhb-ok{background:#2e7d32!important;color:#fff!important}',
    '.rhb-kucuk{font-size:14px;color:#333}',
    '.rhb-uyari{background:#fff3cd;border:1px solid #e0c56e;padding:8px 10px;border-radius:6px;margin:8px 0}',
    '.rhb-tamam{opacity:.55}',
    '.rhb-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin:8px 0}',
    '.rhb-form label{display:flex;flex-direction:column;font-weight:600;gap:4px}',
    '.rhb-form input,.rhb-form select{min-height:40px;font-size:16px;padding:4px 8px}'
  ].join('');
  document.head.appendChild(s);
}
function alan(etiket, girdi) { return el('label', {}, [etiket, girdi]); }
function sinifSecici(deger) {
  var dl = document.getElementById('rhbDLSinif'); if (!dl) { dl = el('datalist', { id: 'rhbDLSinif' }); document.body.appendChild(dl); }
  dl.innerHTML = ''; hazirSiniflar().forEach(function (k) { dl.appendChild(el('option', { value: k })); });
  var i = el('input', { list: 'rhbDLSinif', placeholder: 'ör. 9-A', value: deger || '' });
  return i;
}

/* ---------------- 1) Sürüm ayrımı ---------------- */
function haricSuz() {
  var h = PK().haric || [];
  if (TUR() === 'sinif') h = h.concat(['rhb_icmal']);
  if (!h.length) return;
  for (var i = OY.T.length - 1; i >= 0; i--) if (h.indexOf(OY.T[i].id) >= 0) OY.T.splice(i, 1);
}

/* ---------------- 4) Yıllık hedef ve etkinlik bankası ---------------- */
/* Genel hedefi Bakanlık her yıl belirler. Etkinlikler Evrak Asistanı önerisidir; Bakanlık ve RAM materyalleriyle karşılaştırılmalıdır. */
var HEDEF = {
  '2026-2027': {
    ad: 'Selamlaşma',
    kaynak: 'MEB duyurusu, 17.09.2026: 2026-2027 rehberlik ve psikolojik danışma çalışmalarının genel hedefi "Selamlaşma".',
    amac: [
      'Öğrencilerin birbirini fark etmesi, saygı ve nezaketle iletişim kurması',
      'Okula aidiyet duygusunun güçlenmesi',
      'Sosyal-duygusal gelişimin desteklenmesi',
      'Okulda güvenli, kapsayıcı ve olumlu bir iletişim ortamı',
      'Kültürel değerlerimizdeki selamlaşma ve nezaket biçimlerinin tanınması ("köklerden geleceğe")'
    ],
    etk: [
      ['Eylül', 'Sosyal-duygusal', 'Selamlaşmanın önemi; sınıfta ve okulda selamlaşma', '"Günaydın kapısı": sınıfa girişte selamlaşma rutini oluşturma'],
      ['Ekim', 'Sosyal-duygusal', 'Nezaket sözcükleri ve farklı selamlaşma biçimleri', 'Sınıf nezaket sözcükleri panosu hazırlama'],
      ['Kasım', 'Sosyal-duygusal', 'Göz teması, gülümseme ve beden dili', 'Eşli canlandırma: özenli ve özensiz selamlaşma'],
      ['Aralık', 'Sosyal-duygusal', 'Kültürümüzde selamlaşma ve büyüklere saygı', 'Aile büyüklerinden selamlaşma geleneklerini derleme'],
      ['Ocak', 'Sosyal-duygusal', 'Dönemi selamlaşma açısından değerlendirme', 'Sınıf selamlaşma çizelgesini birlikte değerlendirme'],
      ['Şubat', 'Sosyal-duygusal', 'Yeni gelen ve yalnız kalan arkadaşı fark etme', '"Yanında biri olsun" eşleşme etkinliği'],
      ['Mart', 'Sosyal-duygusal', 'Dijital ortamda selamlaşma ve nezaket', 'Mesajlaşma görgüsü üzerine örnek olay tartışması'],
      ['Nisan', 'Sosyal-duygusal', 'Okul çalışanlarını tanıma ve selamlama', 'Okul çalışanlarına teşekkür kartı yazma'],
      ['Mayıs', 'Sosyal-duygusal', 'Selamlaşmanın aidiyete katkısı', 'Sınıf "biz" afişi hazırlama'],
      ['Haziran', 'Sosyal-duygusal', 'Yılı değerlendirme ve vedalaşma', 'Veda ve iyi dilek kartları']
    ],
    veli: ['Veli toplantısında genel hedefin tanıtılması', 'Evde selamlaşma ve nezaket örneklerinin paylaşılması için kısa bilgilendirme notu'],
    ogretmen: ['Öğretmenlerin koridor, bahçe ve kapı önlerinde selamlaşmayı model olarak göstermesi', 'ŞÖK ve zümrede genel hedefe yönelik ortak uygulamanın kararlaştırılması']
  },
  '2025-2026': { ad: 'Aile İçi İletişim-Çocuk Hakları ve Çocuk Kıymeti', kaynak: 'RAM bilgilendirmeleri (2025-2026).', amac: [], etk: [], veli: [], ogretmen: [] }
};
function hedefYil(ey) { return HEDEF[String(ey || ey0()).trim()] || null; }
function plaNaHedefEkle() {
  var sr = OY.get('sinif_rehberlik');
  if (!sr || sr._rhb11) return;
  sr._rhb11 = true;
  if (!sr.alan.some(function (a) { return a.k === 'hedef'; })) sr.alan = sr.alan.concat([{ k: 'hedef', l: 'Genel hedef etkinliklerini ekle', type: 'select', opts: ['Evet', 'Hayır'] }]);
  var onceki = sr.build;
  sr.build = function (p, f) {
    var out = onceki(p, f);
    var H = hedefYil(f && f.egitim_yili);
    if (!f || f.hedef === 'Hayır' || !H || !H.etk.length) return out;
    out.forEach(function (b) {
      if (!(b && b.t === 'table' && b.head && b.head[0] === 'Ay')) return;
      var ek = H.etk.map(function (r) { return [r[0], '', r[1] + ' · Genel hedef: ' + H.ad, r[2], r[3]]; });
      var hepsi = (b.rows || []).concat(ek).map(function (r, i) { return { r: r, i: i }; });
      hepsi.sort(function (x, y) { var a = AYLAR.indexOf(x.r[0]), c = AYLAR.indexOf(y.r[0]); return ((a < 0 ? 99 : a) - (c < 0 ? 99 : c)) || (x.i - y.i); });
      b.rows = hepsi.map(function (x) { return x.r; });
    });
    out.splice(out.length - 2 > 0 ? out.length - 2 : out.length, 0, { t: 'note', x: '"Genel hedef: ' + H.ad + '" satırları Bakanlığın bu yıl için belirlediği genel hedefe yönelik etkinlik önerileridir; okulunuzun rehberlik programı ve RAM materyalleriyle karşılaştırarak düzenleyiniz.' });
    return out;
  };
}
function hedefEkrani() {
  stil();
  var w = ekran('rhb_hedef', 'Yıllık Hedef ve Etkinlik Bankası');
  var ey = ey0(), H = hedefYil(ey);
  if (!H) { w.appendChild(el('p', { class: 'rhb-uyari', text: ey + ' eğitim yılı için genel hedef bu sürümde tanımlı değil. Güncellemeyle eklenecektir.' })); return; }
  w.appendChild(el('div', { class: 'rhb-kart' }, [el('h3', { text: ey + ' genel hedefi: ' + H.ad }), el('p', { class: 'rhb-kucuk', text: H.kaynak })]));
  if (H.amac.length) w.appendChild(el('div', { class: 'rhb-kart' }, [el('h3', { text: 'Amaçlar' }), el('ul', {}, H.amac.map(function (x) { return el('li', { text: x }); }))]));
  var t = el('table', { class: 'rhb-t' }, [el('tr', {}, ['Ay', 'Gelişim alanı', 'Konu', 'Etkinlik önerisi', ''].map(function (x) { return el('th', { text: x }); }))]);
  H.etk.forEach(function (r) {
    var b = el('button', { class: 'sec', text: 'Kopyala' }); b.addEventListener('click', function () { kopyala(r.join('\t'), b); });
    t.appendChild(el('tr', {}, r.map(function (x) { return el('td', { text: x }); }).concat([el('td', {}, [b])])));
  });
  w.appendChild(el('h3', { text: 'Sınıf etkinlikleri (aylara göre)' })); w.appendChild(t);
  if (H.veli.length) w.appendChild(el('div', { class: 'rhb-kart' }, [el('h3', { text: 'Velilere yönelik' }), el('ul', {}, H.veli.map(function (x) { return el('li', { text: x }); }))]));
  if (H.ogretmen.length) w.appendChild(el('div', { class: 'rhb-kart' }, [el('h3', { text: 'Öğretmenlere yönelik' }), el('ul', {}, H.ogretmen.map(function (x) { return el('li', { text: x }); }))]));
  w.appendChild(el('p', { class: 'rhb-uyari', text: 'Etkinlikler Evrak Asistanı önerisidir. Sınıf Rehberlik Yıllık Planı\'nda "Genel hedef etkinliklerini ekle: Evet" seçiliyken bu satırlar plana kendiliğinden eklenir.' }));
  w.appendChild(el('div', { class: 'bar' }, [el('button', { text: 'Yıllık plana git', on: { click: function () { root.sel('sinif_rehberlik'); } } })]));
}

/* ---------------- 2a) Sınıf rapor dosyası ---------------- */
var SAYI = [
  ['rehber_ogrenci_gorusme', 'Öğrenci görüşmesi', 'Öğr. gör.'], ['rehber_veli_gorusme', 'Veli görüşmesi', 'Veli gör.'], ['rehber_ev_ziyareti', 'Ev ziyareti', 'Ev ziy.'],
  ['rehber_aile_bilgi', 'Aile bilgi formu', 'Aile bilgi'], ['rehber_gozlem', 'Gözlem formu', 'Gözlem'], ['rehber_rpd_yonlendirme', 'Rehberlik servisine yönlendirme', 'Yönlendirme'],
  ['rhb_sosyometri', 'Sosyometri / Kimdir Bu?', 'Sosyometri'], ['rhb_risk', 'Risk haritası', 'Risk har.'], ['veli', 'Veli toplantısı', 'Veli topl.']
];
var RISK = [['dev', 'Devamsızlık'], ['bas', 'Akademik güçlük'], ['uyum', 'Uyum / davranış güçlüğü'], ['akm', 'Akran zorbalığına maruz kalma'], ['aku', 'Akran zorbalığı uygulama'], ['aile', 'Aile içi güçlük'], ['eko', 'Ekonomik güçlük'], ['sag', 'Süreğen sağlık sorunu'], ['izo', 'Sosyal yalnızlık'], ['terk', 'Okulu bırakma riski'], ['tek', 'Teknoloji / ekran bağımlılığı belirtisi'], ['dig', 'Diğer']];
function raporVeri(sinif, ey) {
  var s = sinifNorm(sinif), ar = yilAraligi(ey), say = {}, aylik = {};
  kayitlar().forEach(function (x) {
    if (x.t < ar[0] || x.t > ar[1] || (x.s || '') !== s) return;
    say[x.id] = (say[x.id] || 0) + 1;
    var a = ayAdi(x.t); if (a) { aylik[a] = aylik[a] || {}; aylik[a][x.id] = (aylik[a][x.id] || 0) + 1; }
  });
  var risk = null, R = LS('oy_f_rhb_risk', null);
  if (R && sinifNorm(R.sinif) === s) {
    var og = lines(R.liste), dag = {}, riskli = 0;
    og.forEach(function (_, i) { var r = (R.risk || {})[i] || {}, n = 0; RISK.forEach(function (k) { if (r[k[0]]) { dag[k[0]] = (dag[k[0]] || 0) + 1; n++; } }); if (n) riskli++; });
    risk = { ogrenci: og.length, riskli: riskli, alanlar: dag, tarih: R.tarih || '' };
  }
  var ys = null, Y = LS('oy_f_ev_rehber_yilsonu', null);
  if (Y && sinifNorm(Y.sinif) === s) ys = { yapilan: lines(Y.yapilan).map(function (x) { return x.replace(/ \(kayıtlardan\)$/, ''); }), veli: lines(Y.veli).map(function (x) { return x.replace(/ \(kayıtlardan\)$/, ''); }), sorun: String(Y.sorun || ''), oneri: lines(Y.oneri) };
  var mev = ogrenciler(s).length || (Y && +Y.mevcut) || (risk && risk.ogrenci) || 0;
  return { tur: 'rhbrapor', v: 1, uygulama: (PK().ad || 'Rehberlik Yardımcısı') + ' ' + SURUM, okul: P().okul || '', ogretmen: P().ad || '', sinif: s, egitim_yili: ey, olusturma: new Date().toISOString(), mevcut: mev, sayilar: say, aylik: aylik, risk: risk, yilsonu: ys };
}
function raporEkrani() {
  stil();
  var w = ekran('rhb_rapor', 'Sınıf Rapor Dosyası (rehberlik servisine)');
  w.appendChild(el('p', { text: 'Sınıfınızın bu yılki rehberlik çalışmalarını tek bir dosyada toplar; dosyayı okulun rehber öğretmenine gönderirsiniz, o da tüm sınıfları tek tıkla birleştirir. Dosyada öğrenci adı ve görüşme içeriği yoktur: yalnız form sayıları, risk haritasında alan başına öğrenci sayısı ve yıl sonu raporu maddeleri bulunur.' }));
  var fs = el('div', { class: 'rhb-form' });
  var iS = sinifSecici(hazirSiniflar()[0] || ''), iY = el('input', { value: ey0() });
  fs.appendChild(alan('Sınıf/Şube', iS)); fs.appendChild(alan('Eğitim yılı', iY)); w.appendChild(fs);
  var on = el('div', { id: 'rhbRaporOn' }); w.appendChild(on);
  function goster() {
    on.innerHTML = '';
    if (!iS.value.trim()) { on.appendChild(el('p', { class: 'rhb-uyari', text: 'Sınıfı yazın ya da listeden seçin.' })); return null; }
    var V = raporVeri(iS.value, iY.value.trim());
    var t = el('table', { class: 'rhb-t' }, [el('tr', {}, [el('th', { text: 'Çalışma' }), el('th', { text: 'Sayı' })])]);
    SAYI.forEach(function (k) { t.appendChild(el('tr', {}, [el('td', { text: k[1] }), el('td', { text: String(V.sayilar[k[0]] || 0) })])); });
    on.appendChild(el('h3', { text: V.sinif + ' · ' + V.egitim_yili + ' · mevcut ' + (V.mevcut || '—') })); on.appendChild(t);
    on.appendChild(el('p', { class: 'rhb-kucuk', text: V.risk ? 'Risk haritası: ' + V.risk.riskli + ' öğrencide en az bir alan işaretli (adlar dosyaya yazılmaz).' : 'Bu sınıf için kayıtlı risk haritası yok (isteğe bağlı).' }));
    on.appendChild(el('p', { class: 'rhb-kucuk', text: V.yilsonu ? 'Yıl sonu raporu maddeleri dosyaya eklenecek (' + V.yilsonu.oneri.length + ' öneri).' : 'Bu sınıf için doldurulmuş yıl sonu raporu yok; yalnız sayılar gönderilir.' }));
    if (V.yilsonu && V.yilsonu.sorun) on.appendChild(el('p', { class: 'rhb-uyari', text: '"Gözlenen genel sorunlar" metni dosyaya eklenir. Öğrenci adı yazmadığınızdan emin olun.' }));
    return V;
  }
  iS.addEventListener('input', goster); iY.addEventListener('input', goster); goster();
  w.appendChild(el('div', { class: 'bar' }, [el('button', { id: 'rhbRaporIndir', text: 'Rapor dosyasını indir', on: { click: function () {
    var V = goster(); if (!V) return;
    jsonIndir('rehberlik-raporu-' + guvenliAd(V.sinif) + '-' + guvenliAd(V.egitim_yili) + '.rhbrapor', V);
    bilgi('Dosya indirildi. Rehber öğretmene e-posta, EBYS eki ya da USB ile iletebilirsiniz.');
  } } })]));
}

/* ---------------- 2b) Okul rehberlik icmali (tam sürüm) ---------------- */
var KEY_IC = 'rhb_icmal_v1';
function icRaporlar(ey) { var D = LS(KEY_IC, {}); return Object.keys(D).map(function (k) { return D[k]; }).filter(function (r) { return !ey || r.egitim_yili === ey; }).sort(function (a, b) { return sinifSira(a.sinif, b.sinif); }); }
function icEkle(r) { var D = LS(KEY_IC, {}); var k = r.egitim_yili + '|' + r.sinif, e = D[k]; if (e && e.olusturma > r.olusturma) return 'eski'; D[k] = r; SS(KEY_IC, D); return e ? 'guncel' : 'yeni'; }
function icSil(r) { var D = LS(KEY_IC, {}); delete D[r.egitim_yili + '|' + r.sinif]; SS(KEY_IC, D); }
function topla(L) {
  var T = { mevcut: 0, sayilar: {}, risk: { ogrenci: 0, riskli: 0, alanlar: {}, sinif: 0 }, aylik: {} };
  L.forEach(function (r) {
    T.mevcut += +r.mevcut || 0;
    Object.keys(r.sayilar || {}).forEach(function (k) { T.sayilar[k] = (T.sayilar[k] || 0) + r.sayilar[k]; });
    Object.keys(r.aylik || {}).forEach(function (a) { Object.keys(r.aylik[a]).forEach(function (k) { T.aylik[a] = (T.aylik[a] || 0) + r.aylik[a][k]; }); });
    if (r.risk) { T.risk.sinif++; T.risk.ogrenci += r.risk.ogrenci || 0; T.risk.riskli += r.risk.riskli || 0; Object.keys(r.risk.alanlar || {}).forEach(function (k) { T.risk.alanlar[k] = (T.risk.alanlar[k] || 0) + r.risk.alanlar[k]; }); }
  });
  return T;
}
function eksikSiniflar(L) { var var_ = {}; L.forEach(function (r) { var_[r.sinif] = 1; }); return hazirSiniflar().filter(function (k) { return !var_[sinifNorm(k)]; }); }
function icBuild(p, F) {
  var ey = F.ey || ey0(), L = icRaporlar(ey), T = topla(L);
  var o = ust(p, (ey + ' EĞİTİM-ÖĞRETİM YILI OKUL REHBERLİK ÇALIŞMALARI İCMALİ').toLocaleUpperCase('tr-TR'));
  o.push({ t: 'kv', rows: [['Eğitim-Öğretim Yılı', ey], ['Rapor gelen sınıf', String(L.length)], ['Toplam öğrenci (rapor gelen sınıflar)', String(T.mevcut)], ['Hazırlanma tarihi', trd(F.tarih || bugun())]] });
  o.push({ t: 'h2', x: 'SINIFLARA GÖRE REHBERLİK ÇALIŞMALARI' });
  if (!L.length) o.push({ t: 'p', x: 'Henüz rapor dosyası eklenmedi.' });
  else {
    var head = ['Sınıf', 'Sınıf rehber öğretmeni', 'Mevcut'].concat(SAYI.map(function (k) { return k[2]; }));
    var rows = L.map(function (r) { return [r.sinif, r.ogretmen || '……', String(r.mevcut || '')].concat(SAYI.map(function (k) { return String((r.sayilar || {})[k[0]] || 0); })); });
    rows.push(['TOPLAM', '', String(T.mevcut)].concat(SAYI.map(function (k) { return String(T.sayilar[k[0]] || 0); })));
    o.push({ t: 'table', head: head, rows: rows, small: true });
    o.push({ t: 'p', x: 'Kısaltmalar: ' + SAYI.map(function (k) { return k[2] + ' = ' + k[1]; }).join('; ') + '.' });
  }
  var ay = AYLAR.slice(0, 10).filter(function (a) { return T.aylik[a]; });
  if (ay.length) { o.push({ t: 'h2', x: 'AYLARA GÖRE TOPLAM ÇALIŞMA SAYISI' }); o.push({ t: 'table', head: ['Ay', 'Çalışma sayısı'], rows: ay.map(function (a) { return [a, String(T.aylik[a])]; }) }); }
  if (T.risk.sinif) {
    o.push({ t: 'h2', x: 'SINIF RİSK HARİTALARI ÖZETİ' });
    o.push({ t: 'p', x: T.risk.sinif + ' sınıfta risk haritası çalışması yapıldı; ' + T.risk.ogrenci + ' öğrenciden ' + T.risk.riskli + ' öğrencide en az bir alan işaretlendi. Öğrenci adları sınıf rehber öğretmenlerindedir.' });
    o.push({ t: 'table', head: ['Risk alanı', 'Öğrenci sayısı'], rows: RISK.filter(function (k) { return T.risk.alanlar[k[0]]; }).map(function (k) { return [k[1], String(T.risk.alanlar[k[0]])]; }) });
  }
  var on = []; L.forEach(function (r) { ((r.yilsonu && r.yilsonu.oneri) || []).forEach(function (x) { on.push(x + ' (' + r.sinif + ')'); }); });
  if (on.length) { o.push({ t: 'h2', x: 'SINIF REHBER ÖĞRETMENLERİNİN ÖNERİLERİ' }); o.push({ t: 'ul', items: on }); }
  var ek = eksikSiniflar(L);
  if (ek.length) { o.push({ t: 'h2', x: 'RAPORU GELMEYEN SINIFLAR' }); o.push({ t: 'p', x: ek.join(', ') }); }
  if (F.not) { o.push({ t: 'h2', x: 'DEĞERLENDİRME' }); o.push({ t: 'p', x: F.not }); }
  o.push({ t: 'note', x: 'Bu icmal, sınıf rehber öğretmenlerinin gönderdiği rapor dosyalarından oluşturulmuştur; öğrenci adı içermez.' });
  o.push({ t: 'sign', names: [(F.rehber || p.ad || '……………………') + '\nRehber Öğretmen / Psikolojik Danışman'] });
  o.push({ t: 'onay', x: 'UYGUNDUR', tarih: trd(F.tarih || bugun()), ad: p.mudur || '……………………', unvan: 'Okul Müdürü' });
  return o;
}
function icExcel(ey) {
  var L = icRaporlar(ey), T = topla(L);
  return xlsxHazir().then(function (X) {
    var b1 = [['Sınıf', 'Sınıf rehber öğretmeni', 'Mevcut'].concat(SAYI.map(function (k) { return k[1]; }))];
    L.forEach(function (r) { b1.push([r.sinif, r.ogretmen || '', +r.mevcut || 0].concat(SAYI.map(function (k) { return (r.sayilar || {})[k[0]] || 0; }))); });
    b1.push(['TOPLAM', '', T.mevcut].concat(SAYI.map(function (k) { return T.sayilar[k[0]] || 0; })));
    var b2 = [['Risk alanı', 'Öğrenci sayısı']].concat(RISK.map(function (k) { return [k[1], T.risk.alanlar[k[0]] || 0]; }));
    var b3 = [['Ay', 'Çalışma sayısı']].concat(AYLAR.slice(0, 10).map(function (a) { return [a, T.aylik[a] || 0]; }));
    var wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(b1), 'Sınıflar');
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(b2), 'Risk özeti');
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(b3), 'Aylar');
    X.writeFile(wb, 'rehberlik-icmali-' + guvenliAd(ey) + '.xlsx');
  });
}
function icmalEkrani() {
  stil();
  OYX.ui.wizard({
    id: 'rhb_icmal', baslik: 'Okul Rehberlik İcmali (sınıf raporlarını birleştir)', kaynak: 'Sınıf rehber öğretmenlerinin Sınıf Rapor Dosyası (.rhbrapor) çıktılarından oluşturulur; öğrenci adı içermez.',
    defaults: function () { return { ey: ey0(), tarih: bugun(), rehber: '', not: '' }; }, build: icBuild,
    steps: [
      { ad: 'Rapor dosyaları', render: function (form, F, upd) {
        var giris = el('input', { type: 'file', multiple: 'multiple', accept: '.rhbrapor,.json', hidden: 'hidden', id: 'rhbIcDosya' });
        var drop = el('div', { class: 'rhb-drop wide', id: 'rhbIcDrop', style: 'grid-column:1/-1', html: '<b>Sınıf rapor dosyalarını (.rhbrapor)</b> buraya bırakın ya da tıklayıp seçin<br><span class="rhb-kucuk">Aynı sınıfın yenisi gelirse eskisinin yerine geçer.</span>' });
        var durum = el('div', { class: 'wide', style: 'grid-column:1/-1' });
        function isle(fl) {
          var n = { yeni: 0, guncel: 0, eski: 0 }, hata = [], p = Promise.resolve();
          Array.prototype.forEach.call(fl, function (f) { p = p.then(function () { return f.text().then(function (t) { var r = JSON.parse(t); if (!r || r.tur !== 'rhbrapor' || !r.sinif) throw new Error('rapor dosyası değil'); n[icEkle(r)]++; }).catch(function (e) { hata.push(f.name + ': ' + (e && e.message || e)); }); }); });
          p.then(function () { bilgi(n.yeni + ' yeni, ' + n.guncel + ' güncellenen rapor' + (n.eski ? ', ' + n.eski + ' eski dosya atlandı' : '') + (hata.length ? '. Okunamayan: ' + hata.join('; ') : '.'), !!hata.length); ciz(); upd(); });
        }
        drop.addEventListener('click', function () { giris.click(); });
        drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('on'); });
        drop.addEventListener('dragleave', function () { drop.classList.remove('on'); });
        drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('on'); isle(e.dataTransfer.files); });
        giris.addEventListener('change', function () { isle(giris.files); giris.value = ''; });
        var iY = el('input', { value: F.ey || ey0() }); iY.addEventListener('input', function () { F.ey = iY.value.trim(); ciz(); upd(); });
        function ciz() {
          durum.innerHTML = '';
          var L = icRaporlar(F.ey);
          var t = el('table', { class: 'rhb-t' }, [el('tr', {}, ['Sınıf', 'Öğretmen', 'Mevcut', 'Dosya tarihi', ''].map(function (x) { return el('th', { text: x }); }))]);
          L.forEach(function (r) { var s = el('button', { class: 'sec', text: '−', title: 'Raporu kaldır' }); s.addEventListener('click', function () { icSil(r); ciz(); upd(); }); t.appendChild(el('tr', {}, [el('td', { text: r.sinif }), el('td', { text: r.ogretmen || '—' }), el('td', { text: String(r.mevcut || '') }), el('td', { text: trd(String(r.olusturma).slice(0, 10)) }), el('td', {}, [s])])); });
          durum.appendChild(el('h3', { text: L.length + ' sınıfın raporu (' + F.ey + ')' }));
          if (L.length) durum.appendChild(t);
          var ek = eksikSiniflar(L);
          if (ek.length) durum.appendChild(el('p', { class: 'rhb-uyari', text: 'Raporu gelmeyen sınıflar (Sınıf Listelerim\'e göre): ' + ek.join(', ') }));
          durum.appendChild(el('div', { class: 'bar' }, [el('button', { class: 'sec', text: 'Excel (.xlsx) indir', on: { click: function () { icExcel(F.ey).catch(function (e) { bilgi(e.message, 1); }); } } })]));
        }
        form.appendChild(el('label', {}, ['Eğitim yılı', iY])); form.appendChild(drop); form.appendChild(giris); form.appendChild(durum); ciz();
      } },
      { ad: 'İmza ve değerlendirme', render: function (form, F, upd) {
        [['rehber', 'Rehber öğretmen / psikolojik danışman', 'text'], ['tarih', 'Tarih', 'date']].forEach(function (a) { var i = el('input', { type: a[2], value: F[a[0]] || '' }); i.addEventListener('input', function () { F[a[0]] = i.value; upd(); }); form.appendChild(el('label', {}, [a[1], i])); });
        var n = el('textarea', { rows: '5' }); n.value = F.not || ''; n.addEventListener('input', function () { F.not = n.value; upd(); });
        form.appendChild(el('label', { class: 'wide', style: 'grid-column:1/-1' }, ['Genel değerlendirme (isteğe bağlı)', n]));
      } }
    ]
  });
}

/* ---------------- 3) e-Rehberlik hazırlık ekranı ---------------- */
var KEY_ERH = 'rhb_erh_tamam';
function planSatirlari() {
  var t = OY.get('sinif_rehberlik'); if (!t) return null;
  var F = Object.assign({}, OY.defaults ? OY.defaults(t) : {}, LS('oy_f_sinif_rehberlik', {}));
  var b = (t.build(P(), F) || []).filter(function (x) { return x && x.t === 'table' && x.head && x.head[0] === 'Ay'; })[0];
  return b ? { F: F, head: b.head, rows: b.rows } : null;
}
function erhEkrani() {
  stil();
  var w = ekran('rhb_erehberlik', 'e-Rehberlik\'e Giriş Hazırlığı (kopyala-yapıştır)');
  w.appendChild(el('p', { text: 'Sınıf Rehberlik Yıllık Planı\'ndaki satırları alan alan gösterir. e-Rehberlik ya da başka bir sisteme girişi siz yaparsınız: alanın yanındaki "Kopyala" düğmesine basıp ilgili kutuya yapıştırın. Bu ekran hiçbir sisteme bağlanmaz ve otomatik giriş yapmaz.' }));
  var S = planSatirlari();
  if (!S || !S.rows.length) { w.appendChild(el('p', { class: 'rhb-uyari', text: 'Önce Sınıf Rehberlik Yıllık Planı\'nı açıp sınıfınızı seçin.' })); w.appendChild(el('div', { class: 'bar' }, [el('button', { text: 'Yıllık plana git', on: { click: function () { root.sel('sinif_rehberlik'); } } })])); return; }
  var anahtar = sinifNorm(S.F.sinif) + '|' + (S.F.egitim_yili || ey0()), T = LS(KEY_ERH, {}), bitti = T[anahtar] || {};
  var say = el('p', { class: 'rhb-kucuk' });
  function sayac() { var n = S.rows.filter(function (r, i) { return bitti[i + '|' + r[0] + '|' + r[3]]; }).length; say.textContent = (S.F.sinif || 'Sınıf seçilmedi') + ' · ' + S.rows.length + ' satırdan ' + n + ' tanesi girildi olarak işaretli.'; }
  w.appendChild(say);
  w.appendChild(el('div', { class: 'bar' }, [
    el('button', { class: 'sec', text: 'Tüm planı sekmeli metin olarak kopyala', on: { click: function (e) { kopyala([S.head.join('\t')].concat(S.rows.map(function (r) { return r.join('\t'); })).join('\n'), e.target); } } }),
    el('button', { class: 'sec', text: 'Yıllık plana dön', on: { click: function () { root.sel('sinif_rehberlik'); } } })
  ]));
  S.rows.forEach(function (r, i) {
    var k = i + '|' + r[0] + '|' + r[3];
    var kart = el('div', { class: 'rhb-kart' + (bitti[k] ? ' rhb-tamam' : '') });
    var cb = el('input', { type: 'checkbox' }); cb.checked = !!bitti[k];
    cb.addEventListener('change', function () { if (cb.checked) bitti[k] = 1; else delete bitti[k]; T[anahtar] = bitti; SS(KEY_ERH, T); kart.classList.toggle('rhb-tamam', cb.checked); sayac(); });
    kart.appendChild(el('h3', {}, [(i + 1) + '. ' + (r[0] || '') + ' ', el('label', { class: 'rhb-kucuk', style: 'font-weight:400' }, [cb, ' girildi'])]));
    S.head.forEach(function (h, j) {
      var v = String(r[j] == null ? '' : r[j]); if (!v.trim()) return;
      var b = el('button', { class: 'sec', text: 'Kopyala' }); b.addEventListener('click', function () { kopyala(v, b); });
      kart.appendChild(el('div', { class: 'rhb-satir' }, [el('b', { text: h }), el('div', { class: 'd', text: v }), b]));
    });
    w.appendChild(kart);
  });
  sayac();
}

/* ---------------- 5-6) Şifreli yedek ve sınıf devri ---------------- */
var DISLA = /(token|oturum|session|sess_|auth|sifre|parola|password|cookie)/i;
function b64(u8) { var s = '', n = 0x8000; for (var i = 0; i < u8.length; i += n) s += String.fromCharCode.apply(null, u8.subarray(i, i + n)); return btoa(s); }
function unb64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function kripto() { return root.crypto && root.crypto.subtle ? root.crypto.subtle : null; }
function anahtar(pw, tuz, it) {
  var c = kripto();
  return c.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']).then(function (km) {
    return c.deriveKey({ name: 'PBKDF2', salt: tuz, iterations: it, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  });
}
function sifrele(obj, pw, tur) {
  var c = kripto(); if (!c) return Promise.reject(new Error('Bu tarayıcı şifrelemeyi desteklemiyor. Güncel Chrome veya Edge kullanın.'));
  var tuz = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), it = 250000;
  return anahtar(pw, tuz, it).then(function (k) { return c.encrypt({ name: 'AES-GCM', iv: iv }, k, new TextEncoder().encode(JSON.stringify(obj))); })
    .then(function (buf) { return { format: 'rhb-sifreli', v: 1, tur: tur, uygulama: (PK().ad || 'Rehberlik Yardımcısı') + ' ' + SURUM, olusturma: new Date().toISOString(), kdf: { ad: 'PBKDF2-SHA256', tekrar: it, tuz: b64(tuz) }, iv: b64(iv), veri: b64(new Uint8Array(buf)) }; });
}
function coz(zarf, pw) {
  var c = kripto(); if (!c) return Promise.reject(new Error('Bu tarayıcı şifre çözmeyi desteklemiyor.'));
  if (!zarf || zarf.format !== 'rhb-sifreli') return Promise.reject(new Error('Bu dosya Rehberlik Yardımcısı şifreli dosyası değil.'));
  return anahtar(pw, unb64(zarf.kdf.tuz), zarf.kdf.tekrar).then(function (k) { return c.decrypt({ name: 'AES-GCM', iv: unb64(zarf.iv) }, k, unb64(zarf.veri)); })
    .then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); }, function () { throw new Error('Parola yanlış ya da dosya bozuk.'); });
}
function tumVeri() { var o = {}; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (!DISLA.test(k)) o[k] = localStorage.getItem(k); } return o; }
function devirVeri(sinif) {
  var s = sinifNorm(sinif), form = {};
  for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf('oy_f_') !== 0) continue; var v = LS(k, null); if (v && typeof v === 'object' && v.sinif && sinifNorm(v.sinif) === s) form[k] = v; }
  return { tur: 'devir', sinif: s, liste: ogrenciler(s), kayitlar: kayitlar().filter(function (x) { return (x.s || '') === s; }), formlar: form, ogretmen: P().ad || '', okul: P().okul || '' };
}
function devirAl(D, uzerine) {
  var r = { liste: 0, kayit: 0, form: 0, atlanan: [] };
  if (D.liste && D.liste.length && EK().birlestir) { var g = {}; g[D.sinif] = D.liste; r.liste = EK().birlestir(g).ogrenci; }
  var L = kayitlar(), z = {}; L.forEach(function (x) { z[x.z] = 1; });
  (D.kayitlar || []).forEach(function (x) { if (!z[x.z]) { L.push(x); r.kayit++; } });
  SS('oy_rehber_kayit', L.slice(-3000));
  Object.keys(D.formlar || {}).forEach(function (k) {
    var e = LS(k, null);
    if (e && e.sinif && sinifNorm(e.sinif) !== D.sinif && !uzerine) { r.atlanan.push(k.replace(/^oy_f_/, '')); return; }
    SS(k, D.formlar[k]); r.form++;
  });
  return r;
}
function dosyaSec(accept, cb) { var i = el('input', { type: 'file', accept: accept, hidden: 'hidden' }); i.addEventListener('change', function () { if (i.files[0]) cb(i.files[0]); i.remove(); }); document.body.appendChild(i); i.click(); }
function parolaAlani(ph) { return el('input', { type: 'password', autocomplete: 'new-password', placeholder: ph || 'en az 8 karakter' }); }
function yedekEkrani() {
  stil();
  var w = ekran('rhb_yedek', 'Şifreli Yedek ve Sınıf Devri');
  w.appendChild(el('p', { text: 'Rehberlik verileri hassastır. Buradaki dosyalar bu cihazda, sizin belirlediğiniz parolayla şifrelenir (AES-256). Parola hiçbir yere kaydedilmez: unutursanız dosya açılamaz.' }));
  if (!kripto()) w.appendChild(el('p', { class: 'rhb-uyari', text: 'Bu tarayıcı şifrelemeyi desteklemiyor. Güncel Chrome veya Edge ile açın.' }));

  /* A) Tam yedek */
  var a1 = parolaAlani(), a2 = parolaAlani('parolayı tekrar yazın');
  var kA = el('div', { class: 'rhb-kart' }, [el('h3', { text: 'Tüm verilerin şifreli yedeği' }), el('p', { class: 'rhb-kucuk', text: 'Sınıf listeleri, form taslakları, kayıtlar, risk haritası ve sosyometri dahil bu uygulamadaki her şey. Yeni bilgisayara geçerken ya da dönem sonunda kullanın.' }), el('div', { class: 'rhb-form' }, [alan('Parola', a1), alan('Parola (tekrar)', a2)])]);
  kA.appendChild(el('div', { class: 'bar' }, [el('button', { id: 'rhbYedekAl', text: 'Şifreli yedek indir', on: { click: function () {
    if (a1.value.length < 8) { bilgi('Parola en az 8 karakter olmalı.', 1); return; }
    if (a1.value !== a2.value) { bilgi('Parolalar aynı değil.', 1); return; }
    var V = tumVeri();
    sifrele({ tur: 'yedek', veri: V }, a1.value, 'yedek').then(function (z) { jsonIndir('rehberlik-yedek-' + bugun() + '.rhbyedek', z); bilgi(Object.keys(V).length + ' kayıt alanı şifrelenip indirildi.'); a1.value = a2.value = ''; }).catch(function (e) { bilgi(e.message, 1); });
  } } })]));
  w.appendChild(kA);

  /* B) Sınıf devri */
  var dS = sinifSecici(hazirSiniflar()[0] || ''), d1 = parolaAlani(), d2 = parolaAlani('parolayı tekrar yazın'), dOn = el('p', { class: 'rhb-kucuk' });
  function dOnizle() { if (!dS.value.trim()) { dOn.textContent = ''; return; } var D = devirVeri(dS.value); dOn.textContent = D.sinif + ': ' + D.liste.length + ' öğrenci, ' + D.kayitlar.length + ' rehberlik kaydı, ' + Object.keys(D.formlar).length + ' form taslağı devredilecek.'; }
  dS.addEventListener('input', dOnizle);
  var kB = el('div', { class: 'rhb-kart' }, [el('h3', { text: 'Sınıf devri (yeni sınıf rehber öğretmenine)' }), el('p', { class: 'rhb-kucuk', text: 'Yalnız seçilen sınıfın listesi, rehberlik kayıtları ve o sınıfa ait form taslakları (risk haritası, sosyometri, yıl sonu raporu vb.) aktarılır. Parolayı yeni öğretmene dosyadan ayrı bir yoldan (yüz yüze ya da telefonla) iletin.' }), el('div', { class: 'rhb-form' }, [alan('Sınıf/Şube', dS), alan('Parola', d1), alan('Parola (tekrar)', d2)]), dOn]);
  kB.appendChild(el('div', { class: 'bar' }, [el('button', { id: 'rhbDevirAl', text: 'Devir dosyası indir', on: { click: function () {
    if (!dS.value.trim()) { bilgi('Sınıfı seçin.', 1); return; }
    if (d1.value.length < 8) { bilgi('Parola en az 8 karakter olmalı.', 1); return; }
    if (d1.value !== d2.value) { bilgi('Parolalar aynı değil.', 1); return; }
    var D = devirVeri(dS.value);
    sifrele(D, d1.value, 'devir').then(function (z) { jsonIndir('sinif-devri-' + guvenliAd(D.sinif) + '.rhbdevir', z); bilgi('Devir dosyası indirildi.'); d1.value = d2.value = ''; }).catch(function (e) { bilgi(e.message, 1); });
  } } })]));
  dOnizle(); w.appendChild(kB);

  /* C) Geri yükleme / devir alma */
  var g1 = parolaAlani('dosyanın parolası'), gDurum = el('div'), secilen = null, gAd = el('p', { class: 'rhb-kucuk', text: 'Dosya seçilmedi.' });
  var kC = el('div', { class: 'rhb-kart' }, [el('h3', { text: 'Yedeği geri yükle / devir dosyasını al' }), el('p', { class: 'rhb-kucuk', text: '.rhbyedek dosyası bu cihazdaki verilerin yerine geçer. .rhbdevir dosyası yalnız o sınıfı ekler; diğer sınıflarınıza dokunmaz.' })]);
  kC.appendChild(el('div', { class: 'bar' }, [el('button', { class: 'sec', text: 'Dosya seç', on: { click: function () { dosyaSec('.rhbyedek,.rhbdevir,.json', function (f) { secilen = f; gAd.textContent = 'Seçilen: ' + f.name; gDurum.innerHTML = ''; }); } } })]));
  kC.appendChild(gAd); kC.appendChild(el('div', { class: 'rhb-form' }, [alan('Parola', g1)]));
  kC.appendChild(el('div', { class: 'bar' }, [el('button', { id: 'rhbAc', text: 'Dosyayı aç', on: { click: function () {
    if (!secilen) { bilgi('Önce dosya seçin.', 1); return; }
    secilen.text().then(function (t) { return coz(JSON.parse(t), g1.value); }).then(function (D) {
      gDurum.innerHTML = '';
      if (D.tur === 'yedek') {
        var n = Object.keys(D.veri || {}).length;
        gDurum.appendChild(el('p', { class: 'rhb-uyari', text: 'Yedek açıldı: ' + n + ' kayıt alanı. Geri yüklerseniz bu cihazdaki aynı adlı veriler yedektekilerle değişir.' }));
        gDurum.appendChild(el('div', { class: 'bar' }, [el('button', { id: 'rhbGeriYukle', text: 'Geri yükle', on: { click: function () { Object.keys(D.veri).forEach(function (k) { try { localStorage.setItem(k, D.veri[k]); } catch (e) {} }); bilgi('Yedek geri yüklendi. Sayfa yenileniyor…'); setTimeout(function () { location.reload(); }, 900); } } })]));
      } else if (D.tur === 'devir') {
        var on = el('p', { class: 'rhb-kucuk', text: D.sinif + ' sınıfı · ' + (D.liste || []).length + ' öğrenci · ' + (D.kayitlar || []).length + ' kayıt · ' + Object.keys(D.formlar || {}).length + ' form taslağı' + (D.ogretmen ? ' · devreden: ' + D.ogretmen : '') });
        var cb = el('input', { type: 'checkbox' });
        gDurum.appendChild(on);
        gDurum.appendChild(el('label', { class: 'rhb-kucuk' }, [cb, ' Başka sınıfa ait açık taslaklarımın üzerine yaz (işaretlemezseniz o taslaklar atlanır)']));
        gDurum.appendChild(el('div', { class: 'bar' }, [el('button', { id: 'rhbDevirYukle', text: 'Sınıfı al', on: { click: function () { var r = devirAl(D, cb.checked); bilgi(D.sinif + ' alındı: ' + r.liste + ' öğrenci, ' + r.kayit + ' yeni kayıt, ' + r.form + ' form taslağı' + (r.atlanan.length ? '. Atlanan taslaklar: ' + r.atlanan.join(', ') : '.')); } } })]));
      } else throw new Error('Tanınmayan dosya türü.');
    }).catch(function (e) { gDurum.innerHTML = ''; bilgi(e.message, 1); });
  } } })]));
  kC.appendChild(gDurum);
  w.appendChild(kC);
}

/* ---------------- kayıt ve kanca ---------------- */
var EKRAN = { rhb_rapor: raporEkrani, rhb_icmal: icmalEkrani, rhb_erehberlik: erhEkrani, rhb_hedef: hedefEkrani, rhb_yedek: yedekEkrani };
function sablonlar() {
  var L = [
    ['rhb_hedef', KAT, 'Yıllık Hedef ve Etkinlik Bankası (' + ey0() + ')'],
    ['rhb_erehberlik', KAT, 'e-Rehberlik\'e Giriş Hazırlığı (kopyala-yapıştır)'],
    ['rhb_rapor', KAT_OGR, 'Sınıf Rapor Dosyası (rehberlik servisine)'],
    ['rhb_yedek', KAT_OGR, 'Şifreli Yedek ve Sınıf Devri']
  ];
  if (TUR() === 'tam') L.push(['rhb_icmal', KAT, 'Okul Rehberlik İcmali (sınıf raporlarını birleştir)']);
  L.forEach(function (x) { if (OY.get(x[0])) return; OY.T.push({ id: x[0], kat: x[1], baslik: x[2], kaynak: 'Rehberlik Yardımcısı ' + SURUM + ' (özgün)', alan: [], oyx: true, build: function () { return []; } }); });
}
function kanca() {
  if (!root.__oyekSel || !root.OYEK) { setTimeout(kanca, 40); return; }
  if (root.__rhb11) return; root.__rhb11 = true;
  plaNaHedefEkle(); sablonlar(); haricSuz();
  var eski = root.sel;
  root.sel = function (id) { if (EKRAN[id] && OY.get(id)) { EKRAN[id](); return; } return eski.apply(this, arguments); };
  try {
    var pk = PK(), h1 = document.querySelector('header h1');
    /* Başlığın başına logo (img) eklendiği için ilk metin düğümü aranır. */
    var tn = h1 ? Array.prototype.filter.call(h1.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); })[0] : null;
    if (pk.ad && tn) tn.nodeValue = pk.ad + ' ';
    var sm = h1 && h1.querySelector('small'); if (sm) sm.textContent = 'v' + (pk.surum || SURUM);
  } catch (e) {}
  if (!document.getElementById('rhb11-baslik')) document.head.appendChild(el('style', { id: 'rhb11-baslik', text: 'header h1{min-width:min(100%,340px)}' }));
  if (typeof root.cats === 'function') root.cats();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(kanca, 0); });
else setTimeout(kanca, 0);

root.RHB11 = { SURUM: SURUM, raporVeri: raporVeri, icBuild: icBuild, topla: topla, icEkle: icEkle, icRaporlar: icRaporlar, sifrele: sifrele, coz: coz, devirVeri: devirVeri, devirAl: devirAl, tumVeri: tumVeri, HEDEF: HEDEF, planSatirlari: planSatirlari };
})(typeof window !== 'undefined' ? window : this);

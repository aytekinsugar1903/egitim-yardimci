/* Evrak Asistanı · ÖY 1.11.0 plan araçları arayüzü. Yayıncı: Eyüp ŞEKER. */
(function (root) {
'use strict';
if (typeof document === 'undefined') return;
var OYX = root.OYX;
if (!OYX) return;
function lines(v) { return String(v || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean); }

function $(id) { return document.getElementById(id.replace(/^#/, '')); }
function el(t, a, c) {
  if (typeof h === 'function') return h(t, a, c);
  var e = document.createElement(t);
  a = a || {};
  Object.keys(a).forEach(function (k) {
    if (k === 'text') e.textContent = a[k];
    else if (k === 'html') e.innerHTML = a[k];
    else if (k === 'on') Object.keys(a.on).forEach(function (ev) { e.addEventListener(ev, a.on[ev]); });
    else if (a[k] != null) e.setAttribute(k, a[k]);
  });
  (c || []).forEach(function (x) { if (x) e.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
  return e;
}
function kaydet(id, F) { try { localStorage.setItem('oy_f_' + id, JSON.stringify(F)); } catch (e) {} }
function oku(id, def) {
  try { var v = JSON.parse(localStorage.getItem('oy_f_' + id) || 'null'); return v ? Object.assign({}, def, v) : Object.assign({}, def); }
  catch (e) { return Object.assign({}, def); }
}
function stil() {
  if ($('oyx-stil')) return;
  var s = document.createElement('style');
  s.id = 'oyx-stil';
  s.textContent = [
    '.oyx-adimlar{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}',
    '.oyx-adimlar button{min-height:44px;padding:8px 12px}',
    '.oyx-uyari{background:#fff3cd;border:1px solid #e0c56e;padding:8px 10px;border-radius:6px;margin:8px 0}',
    '.oyx-ok{background:#e8f5e9;border:1px solid #a5d6a7;padding:8px 10px;border-radius:6px;margin:8px 0}',
    '.oyx-grid{width:100%;border-collapse:collapse;table-layout:auto}',
    '.oyx-grid th,.oyx-grid td{border:1px solid #ccc;padding:4px 6px;vertical-align:middle}',
    '.oyx-grid td:last-child{width:50%;min-width:200px}',
    '.oyx-grid input,.oyx-grid select{width:100%;min-width:160px;min-height:36px;box-sizing:border-box}',
    '.oyx-gunler{display:grid;grid-template-columns:1fr 80px 110px 110px;gap:6px;align-items:center}',
    '@media(max-width:800px){.oyx-gunler{grid-template-columns:1fr 1fr;}.oyx-gunler .oyx-gh{display:none}}',
    '@media print{.oyx-sayfa{page-break-after:always}.noprint{display:none!important}}',
    '.oyx-not{font-size:13px;color:#444;margin:6px 0}'
  ].join('');
  document.head.appendChild(s);
}
function notIlce() {
  return { t: 'note', x: 'Çıktıyı kullanmadan önce kurumunuzun ve ilçe millî eğitim müdürlüğünün güncel evrak formatını kontrol ediniz. Bu belge resmî onay yerine geçmez.' };
}
function resmiUst(p, baslik, yil) {
  var okul = (p && p.okul) ? p.okul : '';
  var ust = [];
  if (typeof OY !== 'undefined' && OY.resmiUst) ust = OY.resmiUst(p);
  else ust = [{ t: 'center', x: 'T.C.' }, { t: 'center', x: (okul || '…………………… OKULU').toLocaleUpperCase('tr-TR') }];
  ust.push({ t: 'h1', x: ((yil || '2026-2027') + ' EĞİTİM-ÖĞRETİM YILI ' + baslik).toLocaleUpperCase('tr-TR') });
  return ust;
}
function imza(adlar) { return { t: 'sign', names: adlar }; }

function haftaOku(F) {
  return (F.hafta || []).map(function (s) {
    return { gun: s.gun, saat: Number(s.saat) || 0, baslangic: s.baslangic || '', bitis: s.bitis || '' };
  });
}
function tatilSec(F) {
  return {
    ara1: F.ara1 !== false, ara2: F.ara2 !== false, yariyil: F.yariyil !== false,
    resmi: F.resmi !== false, arefe: F.arefe !== false
  };
}
function seansKonulu(F, oneri) {
  var se = OYX.seanslar({ bas: F.bas, bit: F.bit, hafta: haftaOku(F), sec: tatilSec(F) });
  return OYX.konuDoldur(se, F.konular || {}, oneri);
}

function gunProgrami(form, F, upd) {
  var wrap = el('div', { class: 'oyx-gunler' });
  wrap.appendChild(el('div', { class: 'oyx-gh', text: 'Gün' }));
  wrap.appendChild(el('div', { class: 'oyx-gh', text: 'Saat' }));
  wrap.appendChild(el('div', { class: 'oyx-gh', text: 'Başlangıç' }));
  wrap.appendChild(el('div', { class: 'oyx-gh', text: 'Bitiş' }));
  if (!F.hafta) F.hafta = OYX.GUNLER_HAFTA ? [] : [];
  var map = {};
  (F.hafta || []).forEach(function (s) { map[s.gun] = s; });
  var gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  gunler.forEach(function (g) {
    var cur = map[g] || { gun: g, saat: 0, baslangic: '', bitis: '' };
    var sSaat = el('select', {});
    var i;
    for (i = 0; i <= 10; i++) {
      var o = el('option', { value: String(i), text: String(i) });
      if (Number(cur.saat) === i) o.selected = true;
      sSaat.appendChild(o);
    }
    var iB = el('input', { type: 'time', value: cur.baslangic || '' });
    var iS = el('input', { type: 'time', value: cur.bitis || '' });
    function yaz() {
      var saat = Number(sSaat.value) || 0;
      iB.disabled = iS.disabled = saat === 0;
      if (saat === 0) { iB.value = ''; iS.value = ''; }
      map[g] = { gun: g, saat: saat, baslangic: iB.value, bitis: iS.value };
      F.hafta = gunler.map(function (x) { return map[x] || { gun: x, saat: 0, baslangic: '', bitis: '' }; });
      upd();
    }
    sSaat.addEventListener('change', yaz);
    iB.addEventListener('change', yaz);
    iS.addEventListener('change', yaz);
    iB.disabled = iS.disabled = !Number(cur.saat);
    wrap.appendChild(el('label', { text: g }));
    wrap.appendChild(sSaat);
    wrap.appendChild(iB);
    wrap.appendChild(iS);
  });
  form.appendChild(el('p', { class: 'oyx-not noprint', text: 'Haftanın çalışma günlerini, sürelerini ve saat aralığını giriniz.' }));
  form.appendChild(wrap);
}

function tatilKutuları(form, F, upd) {
  var order = [
    ['ara1', OYX.TATIL.ara1.ad],
    ['ara2', OYX.TATIL.ara2.ad],
    ['yariyil', OYX.TATIL.yariyil.ad],
    ['resmi', OYX.TATIL.resmi.ad + ' (29 Ekim, 1 Ocak, 23 Nisan, 1 Mayıs, Kurban 17–19 Mayıs 2027)'],
    ['arefe', OYX.TATIL.arefe.ad + ' (28 Ekim 2026 öğleden sonra, 15 Mayıs 2027)']
  ];
  form.appendChild(el('p', { class: 'oyx-not noprint', text: 'İşaretli tatiller plana dahil edilmez. Arefe işaretliyken o gün seans “yarım gün” olarak kalır.' }));
  order.forEach(function (x) {
    var cb = el('input', { type: 'checkbox' });
    cb.checked = F[x[0]] !== false;
    cb.addEventListener('change', function () { F[x[0]] = cb.checked; upd(); });
    var lb = el('label', { style: 'display:flex;gap:8px;align-items:flex-start;margin:4px 0;min-height:44px' }, [cb, document.createTextNode(x[1])]);
    form.appendChild(lb);
  });
}

function inp(form, F, key, label, typ, ph) {
  var i = el('input', { type: typ || 'text', name: key, placeholder: ph || '', value: F[key] || '' });
  i.addEventListener('input', function () { F[key] = i.value; /* caller upd */ if (form._upd) form._upd(); });
  var lb = el('label', { class: typ === 'textarea' ? 'wide' : '' }, [label, i]);
  form.appendChild(lb);
  return i;
}

function wizard(opt) {
  stil();
  if (typeof land === 'function') land(false);
  var id = opt.id;
  var def = opt.defaults ? opt.defaults() : {};
  var F = oku(id, def);
  if (typeof P !== 'undefined' && opt.prefill !== false) {
    /* Öğretmen adı profilde varsa yalnızca boşsa önerilir; kurum adı asla varsayılan doldurulmaz. */
    if (!F.ogretmen && P.ad) F.ogretmen = P.ad;
  }
  root.F = F;
  var cur = Object.assign({}, (typeof OY !== 'undefined' && OY.get) ? (OY.get(id) || {}) : {}, {
    id: id,
    baslik: opt.baslik,
    kaynak: opt.kaynak || '',
    build: function (p, f) { return opt.build(p || root.P || {}, f || F); }
  });
  root.cur = cur;
  if (typeof cats === 'function') cats();
  var w = $('work');
  if (!w) return;
  w.innerHTML = '';
  w.appendChild(el('h2', { class: 'noprint', text: opt.baslik }));
  if (opt.kaynak) w.appendChild(el('p', { class: 'noprint oyx-not', text: 'Dayanak / durum: ' + opt.kaynak }));
  w.appendChild(el('div', { id: 'msg', class: 'msg hidden' }));
  var adimlar = opt.steps || [];
  var barA = el('div', { class: 'oyx-adimlar noprint', id: 'oyxAdimlar' });
  w.appendChild(barA);
  var form = el('div', { class: 'form noprint', id: 'dform' });
  form._upd = upd;
  w.appendChild(form);
  var uyari = el('div', { id: 'oyxUyari', class: 'noprint' });
  w.appendChild(uyari);
  w.appendChild(el('div', { class: 'bar noprint' }, [
    el('button', { id: 'bDocx', on: { click: function () { if (typeof docx === 'function') docx(); } }, text: 'Word (.docx) indir' }),
    el('button', { id: 'bPdf', on: { click: function () { if (typeof pdf === 'function') pdf(); } }, text: 'PDF olarak kaydet' }),
    el('button', { class: 'sec', id: 'bPrint', on: { click: function () { window.print(); } }, text: 'Yazdır' })
  ]));
  w.appendChild(el('div', { id: 'doc' }));
  var step = 0;
  function upd() {
    kaydet(id, F);
    if (opt.onUpd) opt.onUpd(F, uyari);
    try {
      if (typeof OY !== 'undefined' && OY.toHtml) $('doc').innerHTML = OY.toHtml(cur.build(root.P || {}, F));
    } catch (e) { $('doc').textContent = 'Önizleme hatası: ' + e.message; }
  }
  function goster() {
    barA.innerHTML = '';
    adimlar.forEach(function (s, i) {
      barA.appendChild(el('button', {
        class: i === step ? 'on' : 'sec',
        on: { click: function () { step = i; goster(); } },
        text: (i + 1) + '. ' + s.ad
      }));
    });
    form.innerHTML = '';
    form._upd = upd;
    if (adimlar[step] && adimlar[step].render) adimlar[step].render(form, F, upd);
    upd();
  }
  goster();
}

/* ---------------- Egzersiz ---------------- */
function egzDefaults() {
  return {
    alan: '', alanDiger: '', bas: '2026-10-05', bit: '2027-05-31',
    hafta: [], ara1: true, ara2: true, yariyil: true, resmi: true, arefe: true,
    yer: '', yil: '2026-2027', kurum: '', mudur: '', mudurYrd: '', ogretmen: '',
    ogrenciler: '', konular: {}, sinif: ''
  };
}
function egzSeans(F) {
  return seansKonulu(F, [
    'Isınma ve temel çalışma',
    'Teknik beceri çalışması',
    'Uygulama ve pekiştirme',
    'Ölçme, değerlendirme ve geri bildirim'
  ]);
}
function egzBuild(p, F) {
  var alan = F.alan === 'Diğer (aşağıya yazınız)' ? (F.alanDiger || '…………') : (F.alan || '…………');
  var se = egzSeans(F);
  var hs = OYX.haftalikSaat(haftaOku(F));
  var ts = OYX.toplamSaat(se);
  var o = resmiUst({ okul: F.kurum || (p && p.okul) || '' }, 'Ders Dışı Eğitim (Egzersiz) Çalışma Planı', F.yil || '2026-2027');
  o.push({ t: 'kv', rows: [
    ['Eğitim yılı', F.yil || '2026-2027'],
    ['Egzersiz alanı', alan],
    ['Başlama tarihi', OYX.trDate(F.bas)],
    ['Bitiş tarihi', OYX.trDate(F.bit)],
    ['Çalışma yeri', F.yer || '…………'],
    ['Haftalık süre', hs + ' saat'],
    ['Toplam süre', ts + ' saat'],
    ['Öğretmen', F.ogretmen || ((p && p.ad) || '…………')]
  ]});
  if (hs > 6) o.push({ t: 'note', x: 'Uyarı: Yönetici ve Öğretmenlerin Ders ve Ek Ders Saatlerine İlişkin Karar md. 17 uyarınca ders dışı eğitim çalışmalarında haftada azami 6 saat uygulanır. Girdiğiniz haftalık süre ' + hs + ' saattir; planı buna göre düzenleyiniz.' });
  else o.push({ t: 'note', x: 'Haftalık süre ' + hs + ' saattir (karardaki azami süre 6 saattir). Bir ders yılındaki toplam ek ders saati, okulun toplam ders saatinin %6’sını geçemez; bu sınır okul genelinde kontrol edilir.' });
  o.push({ t: 'h2', x: 'ÇALIŞMA TAKVİMİ' });
  if (!se.length) o.push({ t: 'p', x: 'Haftalık gün ve saat seçildiğinde çalışma günleri burada listelenir.' });
  else o.push({ t: 'table', head: ['Tarih', 'Gün', 'Saat', 'Süre', 'Konu'], rows: se.map(function (s) {
    return [OYX.trDate(s.tarih), s.gun, s.saat, s.sure + ' saat', s.konu || ''];
  })});
  o.push(notIlce());
  o.push(imza([
    (F.ogretmen || (p && p.ad) || '……………………') + '\nÖğretmen',
    (F.mudurYrd || '……………………') + '\nMüdür yardımcısı',
    (F.mudur || '……………………') + '\nOkul müdürü'
  ]));
  /* Öğrenci listesi */
  o.push({ t: 'h1', x: 'EGZERSİZ ÖĞRENCİ LİSTESİ' });
  var ogr = lines(F.ogrenciler);
  var satir = ogr.length ? ogr : ['', '', '', '', ''];
  o.push({ t: 'table', head: ['Sıra', 'Adı soyadı', 'Sınıf / şube', 'Okul no', 'İmza'], rows: satir.map(function (ad, i) {
    var par = String(ad).split(/\s*[;|,]\s*/);
    return [String(i + 1), par[0] || '', par[1] || (F.sinif || ''), par[2] || '', ''];
  })});
  o.push({ t: 'note', x: 'Öğrenci adları yalnızca bu cihazda saklanır; belgeyi paylaşırken kişisel verileri dikkate alınız.' });
  o.push(imza([(F.ogretmen || '……………………') + '\nÖğretmen', (F.mudur || '……………………') + '\nOkul müdürü']));
  /* Veli izin iskeleti */
  o.push({ t: 'h1', x: 'VELİ İZİN BELGESİ (İSKELET)' });
  o.push({ t: 'p', x: (F.kurum || '……………………') + ' Müdürlüğüne' });
  o.push({ t: 'p', x: 'Velisi bulunduğum öğrencinin, 2026-2027 eğitim-öğretim yılında okulunuzda yürütülecek "' + alan + '" ders dışı eğitim (egzersiz) çalışmasına, çalışma gün ve saatlerinde kendi isteğimle katılmasına izin veriyorum. Çalışmanın yeri, günleri ve sorumlulukları bana açıklanmıştır.' });
  o.push({ t: 'kv', rows: [['Öğrencinin adı soyadı', ''], ['Sınıfı / numarası', ''], ['Velinin adı soyadı', ''], ['Yakınlığı', ''], ['Telefon', ''], ['Tarih', '']] });
  o.push({ t: 'p', x: 'Veli imzası: ……………………' });
  o.push(notIlce());
  /* Öğretmen dilekçesi */
  o.push({ t: 'h1', x: 'ÖĞRETMEN DİLEKÇESİ' });
  o.push({ t: 'p', x: (F.kurum || '……………………') + ' Müdürlüğüne' });
  o.push({ t: 'p', x: 'Okulumuzda 2026-2027 eğitim-öğretim yılında ders dışında "' + alan + '" alanında eğitim çalışması yürütmek istiyorum. Çalışmanın ' + OYX.trDate(F.bas) + ' – ' + OYX.trDate(F.bit) + ' tarihleri arasında, ' + (F.yer || 'belirlenecek çalışma yerinde') + ' yapılması planlanmaktadır. Haftalık süre ' + hs + ' saattir. Gereğini arz ederim.' });
  o.push({ t: 'p', x: 'Ek: Çalışma planı, öğrenci listesi, veli izin belgeleri (ilçe evrak setine göre tamamlanacaktır).' });
  o.push(imza([(F.ogretmen || '……………………') + '\nÖğretmen']));
  o.push(notIlce());
  return o;
}

function egzUI() {
  wizard({
    id: 'ev_egzersiz',
    baslik: 'Egzersiz (Ders Dışı Eğitim) Çalışma Planı',
    kaynak: '2010/49 sayılı Genelge (Ders Dışı Eğitim Çalışmaları); Yönetici ve Öğretmenlerin Ders ve Ek Ders Saatlerine İlişkin Karar (RG 16.12.2006/26378) md. 17. İlçe duyurularındaki evrak setini kontrol ediniz.',
    defaults: egzDefaults,
    onUpd: function (F, kutu) {
      var hs = OYX.haftalikSaat(haftaOku(F));
      kutu.innerHTML = '';
      if (hs > 6) kutu.appendChild(el('div', { class: 'oyx-uyari', text: 'Haftalık süre ' + hs + ' saat. Karar md. 17 uyarınca ders dışı eğitimde haftada azami 6 saat uygulanır.' }));
      else if (hs > 0) kutu.appendChild(el('div', { class: 'oyx-ok', text: 'Haftalık süre ' + hs + ' saat. Toplam plan süresi ' + OYX.toplamSaat(egzSeans(F)) + ' saat.' }));
    },
    build: egzBuild,
    steps: [
      { ad: 'Temel Bilgiler', render: function (form, F, upd) {
        var lb = el('label', {}, ['Egzersiz alanı']);
        var sel = el('select', { name: 'alan' });
        sel.appendChild(el('option', { value: '', text: 'Seçiniz' }));
        OYX.ALANLAR.forEach(function (a) {
          var o = el('option', { value: a, text: a });
          if (F.alan === a) o.selected = true;
          sel.appendChild(o);
        });
        var diger = el('input', { type: 'text', placeholder: 'Diğer ise alanı yazınız', value: F.alanDiger || '' });
        function y() { F.alan = sel.value; F.alanDiger = diger.value; upd(); }
        sel.addEventListener('change', y);
        diger.addEventListener('input', y);
        lb.appendChild(sel);
        form.appendChild(lb);
        form.appendChild(el('label', { class: 'wide' }, ['Diğer alan (gerekirse)', diger]));
        form.appendChild(el('p', { class: 'oyx-not', text: 'Liste, 2010/49 kapsamındaki izcilik, spor, halk oyunları, güzel sanatlar ile TÜBİTAK proje çalışmaları dallarını ve okullarda sık kullanılan alanları içerir. İlçe onayına göre kontrol ediniz.' }));
      }},
      { ad: 'Tarih ve Saat', render: function (form, F, upd) {
        inp(form, F, 'bas', 'Başlama tarihi', 'date');
        inp(form, F, 'bit', 'Bitiş tarihi', 'date');
        form.appendChild(el('p', { class: 'oyx-not', text: '2026-2027 için yaygın uygulama aralığı 5 Ekim 2026 – 31 Mayıs 2027’dir; ilçe duyurusu farklıysa tarihleri düzeltiniz.' }));
        gunProgrami(form, F, upd);
      }},
      { ad: 'Tatiller', render: tatilKutuları },
      { ad: 'Çalışma Alanı', render: function (form, F, upd) {
        inp(form, F, 'yer', 'Çalışma yeri', 'text', 'Örn. spor salonu, müzik odası');
      }},
      { ad: 'Plan Bilgileri', render: function (form, F, upd) {
        inp(form, F, 'yil', 'Eğitim yılı', 'text');
        inp(form, F, 'kurum', 'Kurum adı', 'text', 'Kurum adını yazınız (otomatik doldurulmaz)');
        inp(form, F, 'mudur', 'Müdür adı', 'text');
        inp(form, F, 'mudurYrd', 'Müdür yardımcısı', 'text');
        inp(form, F, 'ogretmen', 'Öğretmen adı', 'text');
        inp(form, F, 'sinif', 'Sınıf / şube (liste için)', 'text');
        var ta = el('textarea', { placeholder: 'Her satıra bir öğrenci: Ad Soyad | sınıf | okul no' });
        ta.value = F.ogrenciler || '';
        ta.addEventListener('input', function () { F.ogrenciler = ta.value; upd(); });
        form.appendChild(el('label', { class: 'wide' }, ['Öğrenci listesi (yalnızca bu cihazda saklanır)', ta]));
        form.appendChild(el('p', { class: 'oyx-not', text: 'Aşağıdaki takvimde konu sütununu satır satır düzenleyebilirsiniz. Öneriler kısa iskelettir; resmi içerik değildir.' }));
        var se = egzSeans(F);
        if (se.length) {
          var tbl = el('table', { class: 'oyx-grid noprint' });
          tbl.appendChild(el('thead', {}, [el('tr', {}, ['Tarih', 'Gün', 'Saat', 'Konu'].map(function (h) { return el('th', { text: h }); }))]));
          var tb = el('tbody');
          se.forEach(function (s) {
            var i = el('input', { value: s.konu || '' });
            i.addEventListener('input', function () { F.konular = F.konular || {}; F.konular[s.tarih] = i.value; upd(); });
            tb.appendChild(el('tr', {}, [
              el('td', { text: OYX.trDate(s.tarih) }),
              el('td', { text: s.gun }),
              el('td', { text: s.saat }),
              el('td', {}, [i])
            ]));
          });
          tbl.appendChild(tb);
          form.appendChild(tbl);
        }
      }}
    ]
  });
}

/* ---------------- DYK / İYEP ---------------- */
function dykDefaults() {
  return Object.assign(egzDefaults(), { tur: 'DYK', ders: '', sinif: '', modul: '', yoklamaHafta: '12' });
}
function dykBuild(p, F) {
  var se = OYX.seanslar({ bas: F.bas, bit: F.bit, hafta: haftaOku(F), sec: tatilSec(F) });
  var prog = OYX.programCiktilar(F.ders, F.sinif);
  var yer = OYX.yerlestir(prog.ciktilar, se);
  if (F.konular) yer = yer.map(function (s) {
    if (F.konular[s.tarih]) s.konu = F.konular[s.tarih];
    return s;
  });
  var baslik = F.tur === 'İYEP' ? 'İYEP Kurs Planı' : 'DYK Kurs Planı';
  var o = resmiUst({ okul: F.kurum || (p && p.okul) || '' }, baslik, F.yil || '2026-2027');
  o.push({ t: 'kv', rows: [
    ['Program', F.tur || 'DYK'],
    ['Ders / modül', [F.ders, F.modul].filter(Boolean).join(' — ') || '…………'],
    ['Sınıf', F.sinif || '…………'],
    ['Başlama / bitiş', OYX.trDate(F.bas) + ' – ' + OYX.trDate(F.bit)],
    ['Haftalık süre', OYX.haftalikSaat(haftaOku(F)) + ' saat'],
    ['Toplam süre', OYX.toplamSaat(se) + ' saat'],
    ['Öğretmen', F.ogretmen || ((p && p.ad) || '…………')]
  ]});
  if (!prog.bulunan) o.push({ t: 'note', x: 'Bu ders ve sınıf için uygulamadaki kazanım kütüphanesinde kayıt bulunamadı. Konu / kazanım sütununu kendiniz yazınız.' });
  else o.push({ t: 'note', x: 'Kazanımlar, uygulamadaki öğretim programı verisinden çalışma günlerine sırayla yerleştirildi. Zümre kararınıza göre düzenleyiniz.' });
  o.push({ t: 'h2', x: 'HAFTALIK / GÜNLÜK KAZANIM PLANI' });
  if (!yer.length) o.push({ t: 'p', x: 'Tarih ve haftalık saatleri giriniz.' });
  else o.push({ t: 'table', head: ['Tarih', 'Gün', 'Saat', 'Süre', 'Kazanım / konu'], rows: yer.map(function (s) {
    return [OYX.trDate(s.tarih), s.gun, s.saat, (s.sure || '') + ' saat', s.konu || ''];
  })});
  /* yoklama iskeleti */
  var nH = parseInt(F.yoklamaHafta, 10) || 8;
  var baslikY = ['Okul no', 'Ad soyad'];
  var i;
  for (i = 1; i <= Math.min(nH, 24); i++) baslikY.push(String(i));
  var ogr = lines(F.ogrenciler);
  var ySatir = (ogr.length ? ogr : ['', '', '']).map(function (ad) {
    var par = String(ad).split(/\s*[;|,]\s*/);
    var r = [par[2] || '', par[0] || ''];
    for (i = 0; i < Math.min(nH, 24); i++) r.push('');
    return r;
  });
  o.push({ t: 'h2', x: 'YOKLAMA ÇİZELGESİ (İSKELET)' });
  o.push({ t: 'table', small: true, head: baslikY, rows: ySatir });
  if (F.tur === 'İYEP') {
    o.push({ t: 'h2', x: 'İYEP ÖĞRENCİ İZLEME (İSKELET)' });
    o.push({ t: 'table', head: ['Öğrenci (baş harf önerilir)', 'Modül', 'Ön değerlendirme', 'Son değerlendirme', 'Gözlem'], rows: (ogr.length ? ogr : ['']).map(function (ad) {
      return [String(ad).split(/\s*[;|,]\s*/)[0] || '', F.modul || F.ders || '', '', '', ''];
    }) });
  }
  o.push({ t: 'note', x: 'Dayanak: Destekleme ve Yetiştirme Kursları Yönergesi; İYEP Yönergesi (ilgili hükümler güncel metinden kontrol edilmelidir). Kurs saatlerini mevzuata ve okul onayına göre denetleyiniz.' });
  o.push(notIlce());
  o.push(imza([(F.ogretmen || '……………………') + '\nÖğretmen', (F.mudur || '……………………') + '\nOkul müdürü']));
  return o;
}
function dykUI(mod) {
  wizard({
    id: 'ev_dyk',
    baslik: 'DYK ve İYEP Kurs Planı',
    kaynak: 'Destekleme ve Yetiştirme Kursları Yönergesi; İlkokullarda Yetiştirme Programı (İYEP) Yönergesi. Madde numaraları buraya yazılmamıştır; güncel resmî metinden kontrol ediniz.',
    defaults: function () { var d = dykDefaults(); if (mod === 'İYEP') d.tur = 'İYEP'; return d; },
    build: dykBuild,
    onUpd: function (F, kutu) {
      kutu.innerHTML = '';
      var prog = OYX.programCiktilar(F.ders, F.sinif);
      kutu.appendChild(el('div', { class: prog.bulunan ? 'oyx-ok' : 'oyx-uyari', text: prog.bulunan ? ('Kütüphaneden ' + prog.ciktilar.length + ' kazanım bulundu: ' + prog.ders + ' / ' + prog.sinif) : 'Bu ders-sınıf için kazanım kütüphanesi boş; konuları elle yazınız.' }));
    },
    steps: [
      { ad: 'Program', render: function (form, F, upd) {
        var s = el('select');
        ['DYK', 'İYEP'].forEach(function (t) { var o = el('option', { value: t, text: t }); if (F.tur === t) o.selected = true; s.appendChild(o); });
        s.addEventListener('change', function () { F.tur = s.value; upd(); });
        form.appendChild(el('label', {}, ['Program türü', s]));
        inp(form, F, 'ders', 'Ders / alan', 'text', 'Örn. Matematik, Türkçe');
        inp(form, F, 'sinif', 'Sınıf', 'text', 'Örn. 6 veya 3');
        inp(form, F, 'modul', 'Modül (İYEP için, isteğe bağlı)', 'text', 'Türkçe / Matematik');
        inp(form, F, 'yil', 'Eğitim yılı', 'text');
      }},
      { ad: 'Tarih ve Saat', render: function (form, F, upd) {
        inp(form, F, 'bas', 'Başlama tarihi', 'date');
        inp(form, F, 'bit', 'Bitiş tarihi', 'date');
        gunProgrami(form, F, upd);
      }},
      { ad: 'Tatiller', render: tatilKutuları },
      { ad: 'Kurum ve liste', render: function (form, F, upd) {
        inp(form, F, 'yer', 'Kurs yeri', 'text');
        inp(form, F, 'kurum', 'Kurum adı', 'text', 'Kurum adını yazınız');
        inp(form, F, 'mudur', 'Müdür adı', 'text');
        inp(form, F, 'ogretmen', 'Öğretmen adı', 'text');
        inp(form, F, 'yoklamaHafta', 'Yoklama sütunu (hafta) sayısı', 'text');
        var ta = el('textarea', { placeholder: 'Her satıra: Ad Soyad | sınıf | okul no' });
        ta.value = F.ogrenciler || '';
        ta.addEventListener('input', function () { F.ogrenciler = ta.value; upd(); });
        form.appendChild(el('label', { class: 'wide' }, ['Öğrenci listesi (cihazda kalır)', ta]));
        var se = OYX.yerlestir(OYX.programCiktilar(F.ders, F.sinif).ciktilar, OYX.seanslar({ bas: F.bas, bit: F.bit, hafta: haftaOku(F), sec: tatilSec(F) }));
        if (se.length) {
          form.appendChild(el('p', { class: 'oyx-not', text: 'Yerleşen kazanımları ihtiyaç halinde düzeltiniz.' }));
          var tbl = el('table', { class: 'oyx-grid' });
          var tb = el('tbody');
          se.forEach(function (s) {
            var i = el('input', { value: (F.konular && F.konular[s.tarih]) || s.konu || '' });
            i.addEventListener('input', function () { F.konular = F.konular || {}; F.konular[s.tarih] = i.value; upd(); });
            tb.appendChild(el('tr', {}, [el('td', { text: OYX.trDate(s.tarih) }), el('td', {}, [i])]));
          });
          tbl.appendChild(tb);
          form.appendChild(tbl);
        }
      }}
    ]
  });
}


/* ---------------- Sınav analizi ---------------- */
function saDefaults() {
  return { tur: 'klasik', ders: '', sinif: '', sinavAd: '', tarih: '', esik: '50', yil: '2026-2027',
    soruSay: '5', sorular: [], ogrenciler: '', tablo: '', ogretmen: '', kurum: '' };
}
function saData(F) {
  var sorular = (F.sorular && F.sorular.length) ? F.sorular : [];
  if (!sorular.length) {
    var n = parseInt(F.soruSay, 10) || 0, i;
    for (i = 0; i < n; i++) sorular.push({ no: i + 1, max: F.tur === 'test' ? 1 : 10, kazanım: '', kod: '' });
  }
  var ogr = [];
  lines(F.ogrenciler || F.tablo).forEach(function (sat) {
    var p = sat.split(/\s*[;|\t]\s*/);
    if (p.length < 2) return;
    ogr.push({ no: p[0], ad: p[1], katilim: p[2] || 'Sınava Girdi', puanlar: p.slice(3).map(function (x) { return x; }) });
  });
  if (F._ogrenciNesne) ogr = F._ogrenciNesne;
  if (ogr.length) {
    while (sorular.length && !String(sorular[sorular.length-1].kazanım||'').trim() && !String(sorular[sorular.length-1].kod||'').trim()
      && ogr.every(function (o) { return o.puanlar == null || o.puanlar[sorular.length-1] == null || String(o.puanlar[sorular.length-1]||'')===''; })) {
      sorular = sorular.slice(0, -1);
    }
  }
  return { sorular: sorular, ogrenciler: ogr, esik: parseFloat(F.esik) || 50 };
}
function saBuild(p, F) {
  var d = saData(F);
  var A = OYX.analizHesap(d);
  var o = resmiUst({ okul: F.kurum || (p && p.okul) || '' }, 'Sınav Analizi', F.yil || '2026-2027');
  o.push({ t: 'kv', rows: [
    ['Ders', F.ders || '…………'],
    ['Sınıf', F.sinif || '…………'],
    ['Sınav', F.sinavAd || '…………'],
    ['Tarih', F.tarih ? OYX.trDate(F.tarih) : '…………'],
    ['Tür', F.tur === 'test' ? 'Test' : 'Klasik (açık uçlu / karma)'],
    ['Katılan / kayıt', A.nKatilan + ' / ' + A.nOgrenci],
    ['Sınıf ortalaması', '%' + A.ortalama],
    ['Başarı eşiği', '%' + A.esik],
    ['Öğretmen', F.ogretmen || ((p && p.ad) || '…………')]
  ]});
  o.push({ t: 'h2', x: 'SORU BAZLI BAŞARI' });
  o.push({ t: 'table', head: ['Soru', 'Kazanım', 'Tam puan', 'Ortalama', 'Başarı %'], rows: A.soru.map(function (s) {
    return [String(s.no), (s.kod ? s.kod + ' ' : '') + (s.kazanım || '—'), String(s.max), String(s.ort), s.yuzde == null ? '—' : ('%' + s.yuzde)];
  })});
  o.push({ t: 'h2', x: 'KAZANIM BAZLI BAŞARI' });
  o.push({ t: 'table', head: ['Kazanım', 'Soru sayısı', 'Başarı %'], rows: A.kazanım.map(function (k) {
    return [(k.kod ? k.kod + ' ' : '') + k.ad, String(k.nSoru), k.yuzde == null ? '—' : ('%' + k.yuzde)];
  })});
  o.push({ t: 'h2', x: 'EŞİK ALTINDAKİ KAZANIMLAR' });
  if (!A.basarisiz.length) o.push({ t: 'p', x: 'Belirlenen eşiğin altında kazanım yok.' });
  else o.push({ t: 'table', head: ['Kazanım', 'Başarı %', 'Sorular'], rows: A.basarisiz.map(function (k) {
    return [(k.kod ? k.kod + ' ' : '') + k.ad, '%' + k.yuzde, (k.sorular || []).join(', ')];
  })});
  o.push({ t: 'h2', x: 'TELAFİ PLANI ÖNERİSİ' });
  o.push({ t: 'p', x: A.telafi });
  o.push({ t: 'note', x: 'Öğrenci puanları raporda ad listesi olarak yazdırılmadı; ayrıntılı öğrenci dökümü Excel dışa aktarmada (bu cihazda) kullanılabilir. Veri bu cihazın dışına gönderilmez.' });
  o.push(notIlce());
  o.push(imza([(F.ogretmen || '……………………') + '\nÖğretmen']));
  return o;
}
function saExcelYaz(F) {
  var X = root.XLSX;
  if (!X) { if (typeof msg === 'function') msg('Excel kütüphanesi yüklenemedi.', true); return; }
  var d = saData(F);
  var A = OYX.analizHesap(d);
  var wb = X.utils.book_new();
  X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(
    [['Soru', 'Kazanım', 'Tam puan', 'Ortalama', 'Başarı %']].concat(A.soru.map(function (s) {
      return [s.no, (s.kod ? s.kod + ' ' : '') + (s.kazanım || ''), s.max, s.ort, s.yuzde];
    }))
  ), 'Soru');
  X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(
    [['Kazanım', 'Soru sayısı', 'Başarı %']].concat(A.kazanım.map(function (k) {
      return [(k.kod ? k.kod + ' ' : '') + k.ad, k.nSoru, k.yuzde];
    }))
  ), 'Kazanım');
  X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(
    [['Okul no', 'Ad', 'Alınan', 'Tam', 'Yüzde']].concat(A.ogrenci.map(function (g) {
      return [g.no, g.ad, g.alinan, g.maks, Math.round(g.yuzde * 10) / 10];
    }))
  ), 'Ogrenci');
  X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([['Telafi önerisi'], [A.telafi]]), 'Telafi');
  X.writeFile(wb, 'sinav-analizi.xlsx');
}
function saUI() {
  wizard({
    id: 'sa_analiz',
    baslik: 'Sınav Analizi',
    kaynak: 'Yazılı ve uygulamalı sınav sonuçlarının kazanım / soru bazlı özeti. Veri yalnızca bu cihazda işlenir; yapay zekâya veya buluta gönderilmez. Ölçme-değerlendirme esasları için zümre kararınızı ve ilgili yönergeyi esas alınız.',
    defaults: saDefaults,
    build: saBuild,
    onUpd: function (F, kutu) {
      var A = OYX.analizHesap(saData(F));
      kutu.innerHTML = '';
      kutu.appendChild(el('div', { class: 'oyx-ok', text: 'Katılan ' + A.nKatilan + ' · Sınıf ortalaması %' + A.ortalama + ' · Eşik altı kazanım: ' + A.basarisiz.length }));
    },
    steps: [
      { ad: 'Sınav bilgisi', render: function (form, F, upd) {
        var s = el('select');
        [['klasik', 'Klasik / açık uçlu'], ['test', 'Test (çoktan seçmeli)']].forEach(function (t) {
          var o = el('option', { value: t[0], text: t[1] }); if (F.tur === t[0]) o.selected = true; s.appendChild(o);
        });
        s.addEventListener('change', function () { F.tur = s.value; upd(); });
        form.appendChild(el('label', {}, ['Sınav türü', s]));
        inp(form, F, 'ders', 'Ders', 'text');
        inp(form, F, 'sinif', 'Sınıf / şube', 'text');
        inp(form, F, 'sinavAd', 'Sınav adı', 'text', 'Örn. 1. dönem 1. yazılı');
        inp(form, F, 'tarih', 'Tarih', 'date');
        inp(form, F, 'esik', 'Başarı eşiği (%)', 'text');
        inp(form, F, 'ogretmen', 'Öğretmen', 'text');
        inp(form, F, 'kurum', 'Kurum adı', 'text', 'Kurum adını yazınız');
      }},
      { ad: 'Sorular ve kazanımlar', render: function (form, F, upd) {
        inp(form, F, 'soruSay', 'Soru sayısı', 'text');
        var n = parseInt(F.soruSay, 10) || 0;
        if (!F.sorular) F.sorular = [];
        while (F.sorular.length < n) F.sorular.push({ no: F.sorular.length + 1, max: F.tur === 'test' ? 1 : 10, kazanım: '', kod: '' });
        if (F.sorular.length > n) F.sorular = F.sorular.slice(0, n);
        var tbl = el('table', { class: 'oyx-grid' });
        tbl.appendChild(el('thead', {}, [el('tr', {}, ['No', 'Tam puan', 'Kazanım kodu', 'Kazanım'].map(function (h) { return el('th', { text: h }); }))]));
        var tb = el('tbody');
        F.sorular.forEach(function (q, i) {
          q.no = i + 1;
          function cell(key, typ) {
            var iel = el('input', { type: typ || 'text', value: q[key] != null ? String(q[key]) : '' });
            iel.addEventListener('input', function () { q[key] = typ === 'number' ? iel.value : iel.value; upd(); });
            return el('td', {}, [iel]);
          }
          tb.appendChild(el('tr', {}, [el('td', { text: String(q.no) }), cell('max'), cell('kod'), cell('kazanım')]));
        });
        tbl.appendChild(tb);
        form.appendChild(tbl);
        form.appendChild(el('p', { class: 'oyx-not', text: 'Aynı kazanım kodunu birden fazla soruya yazarsanız analiz bunları birleştirir.' }));
      }},
      { ad: 'Puanlar (Excel)', render: function (form, F, upd) {
        form.appendChild(el('p', { class: 'oyx-not', text: 'OYSS şablonunu veya “Okul No | Ad Soyad | Katılım | Soru puanları” biçimli bir Excel/CSV dosyasını yükleyiniz. Veri bu tarayıcıda kalır.' }));
        var fi = el('input', { type: 'file', accept: '.xlsx,.xls,.csv,.ods' });
        fi.addEventListener('change', function () {
          var f = fi.files && fi.files[0];
          if (!f) return;
          var okuma = function (X) {
            var r = new FileReader();
            r.onload = function () {
              try {
                var wb = X.read(new Uint8Array(r.result), { type: 'array', codepage: 1254 });
                var sayfalar = wb.SheetNames.map(function (ad) {
                  return { ad: ad, aoa: X.utils.sheet_to_json(wb.Sheets[ad], { header: 1, raw: false, defval: '' }) };
                });
                var parsed = OYX.oyssKitapParse(sayfalar);
                if (!parsed.length) { if (typeof msg === 'function') msg('Puan tablosu tanınmadı. Başlıkta okul no / ad ve soru sütunları olmalı.', true); return; }
                var sec = parsed[0];
                if (F.ders) {
                  var v = parsed.filter(function (s) { return (s.sayfa || '').toLocaleLowerCase('tr-TR').indexOf((F.ders || '').toLocaleLowerCase('tr-TR')) >= 0; });
                  if (v.length) sec = v[0];
                }
                F._ogrenciNesne = sec.ogrenciler;
                if (sec.sorular && sec.sorular.length) {
                  F.soruSay = String(sec.sorular.length);
                  F.sorular = sec.sorular.map(function (s, i) {
                    var eski = (F.sorular || [])[i] || {};
                    return { no: s.no, max: s.max || eski.max || 10, kazanım: eski.kazanım || '', kod: eski.kod || '' };
                  });
                }
                if (typeof msg === 'function') msg(sec.ogrenciler.length + ' öğrenci puanı yüklendi' + (sec.sayfa ? (' (' + sec.sayfa + ')') : '') + '.');
                upd();
              } catch (e) { if (typeof msg === 'function') msg('Dosya okunamadı: ' + e.message, true); }
            };
            r.readAsArrayBuffer(f);
          };
          if (root.XLSX) okuma(root.XLSX);
          else if (typeof msg === 'function') msg('Excel kütüphanesi henüz yüklenmedi.', true);
        });
        form.appendChild(el('label', {}, ['Excel / CSV yükle', fi]));
        var ta = el('textarea', { placeholder: 'Elle: okulNo | ad soyad | katılım | p1 | p2 | p3' });
        ta.value = F.ogrenciler || '';
        ta.addEventListener('input', function () { F.ogrenciler = ta.value; F._ogrenciNesne = null; upd(); });
        form.appendChild(el('label', { class: 'wide' }, ['Veya yapıştırın (her satır bir öğrenci)', ta]));
        form.appendChild(el('button', { type: 'button', class: 'sec', on: { click: function () { saExcelYaz(F); } }, text: 'Analizi Excel olarak indir' }));
      }}
    ]
  });
}

/* ---------------- Sosyal kulüp yıllık ---------------- */
function kyDefaults() {
  return { kulup: '', kulupDiger: '', kademe: 'Ortaokul', danisman: '', temsilci: '', yil: '2026-2027', kurum: '', mudur: '', aylar: {}, ogretmen: '' };
}
function kyAyEtkinlik(F, ay) {
  var kayit = (F.aylar || {})[ay];
  if (kayit && String(kayit).trim()) return lines(kayit);
  var otomatik = OYX.BELIRLI.filter(function (x) { return x[0] === ay || x[0].indexOf(ay) >= 0; }).map(function (x) { return x[1]; });
  var kulup = F.kulup === 'Diğer (yazınız)' ? (F.kulupDiger || 'kulüp') : (F.kulup || 'kulüp');
  var iskelet = [kulup + ' amaçları doğrultusunda aylık çalışma'];
  return iskelet.concat(otomatik);
}
function kyBuild(p, F) {
  var kulup = F.kulup === 'Diğer (yazınız)' ? (F.kulupDiger || '…………') : (F.kulup || '…………');
  var o = resmiUst({ okul: F.kurum || (p && p.okul) || '' }, 'Sosyal Kulüp Yıllık Çalışma Planı', F.yil || '2026-2027');
  o.push({ t: 'kv', rows: [
    ['Kulüp', kulup],
    ['Kademe', F.kademe || '…………'],
    ['Danışman öğretmen', F.danisman || F.ogretmen || ((p && p.ad) || '…………')],
    ['Öğrenci temsilcisi', F.temsilci || '…………']
  ]});
  o.push({ t: 'h2', x: 'AYLIK ETKİNLİK DAĞILIMI' });
  var satirlar = [];
  ['Eylül','Ekim','Kasım','Aralık','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran'].forEach(function (ay) {
    satirlar.push([ay, kyAyEtkinlik(F, ay).join('; ')]);
  });
  o.push({ t: 'table', head: ['Ay', 'Etkinlik / belirli gün ve hafta'], rows: satirlar });
  o.push({ t: 'note', x: 'Dayanak: Sosyal Etkinlikler Yönetmeliği (kulüp çalışmaları danışman gözetiminde yürütülür; belgeler e-Okul Sosyal Etkinlik Modülüne işlenir). Belirli gün ve haftalar her yıl güncel listeye göre kontrol edilmelidir.' });
  o.push(notIlce());
  o.push(imza([(F.danisman || F.ogretmen || '……………………') + '\nDanışman öğretmen', (F.mudur || '……………………') + '\nOkul müdürü']));
  return o;
}
function kyUI() {
  wizard({
    id: 'kulup_yillik',
    baslik: 'Sosyal Kulüp Yıllık Çalışma Planı',
    kaynak: 'Sosyal Etkinlikler Yönetmeliği. Zorunlu kulüp adları politika belgesindeki çekirdek listeye; diğer adlar uygulamada sık kullanılan isimlere göredir. Öğretmenler kurulu kararıyla farklı kulüp kurulabilir.',
    defaults: kyDefaults,
    build: kyBuild,
    steps: [
      { ad: 'Kulüp bilgisi', render: function (form, F, upd) {
        var s = el('select');
        s.appendChild(el('option', { value: '', text: 'Seçiniz' }));
        OYX.KULUPLER.forEach(function (k) { var o = el('option', { value: k, text: k }); if (F.kulup === k) o.selected = true; s.appendChild(o); });
        s.addEventListener('change', function () { F.kulup = s.value; upd(); });
        form.appendChild(el('label', {}, ['Kulüp', s]));
        inp(form, F, 'kulupDiger', 'Diğer kulüp adı', 'text');
        var kd = el('select');
        ['Okul öncesi', 'İlkokul', 'Ortaokul', 'Lise'].forEach(function (k) { var o = el('option', { value: k, text: k }); if (F.kademe === k) o.selected = true; kd.appendChild(o); });
        kd.addEventListener('change', function () { F.kademe = kd.value; upd(); });
        form.appendChild(el('label', {}, ['Kademe', kd]));
        inp(form, F, 'danisman', 'Danışman öğretmen', 'text');
        inp(form, F, 'temsilci', 'Öğrenci temsilcisi (isteğe bağlı)', 'text');
        inp(form, F, 'yil', 'Eğitim yılı', 'text');
        inp(form, F, 'kurum', 'Kurum adı', 'text', 'Kurum adını yazınız');
        inp(form, F, 'mudur', 'Müdür adı', 'text');
      }},
      { ad: 'Aylık dağılım', render: function (form, F, upd) {
        form.appendChild(el('p', { class: 'oyx-not', text: 'Boş bırakılan aylara kulüp amacı ve o aya denk gelen belirli gün/hafta önerisi yazılır. Metni dilediğiniz gibi değiştiriniz.' }));
        F.aylar = F.aylar || {};
        ['Eylül','Ekim','Kasım','Aralık','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran'].forEach(function (ay) {
          var ta = el('textarea');
          ta.value = F.aylar[ay] != null ? F.aylar[ay] : kyAyEtkinlik(F, ay).join('\n');
          ta.addEventListener('input', function () { F.aylar[ay] = ta.value; upd(); });
          form.appendChild(el('label', { class: 'wide' }, [ay, ta]));
        });
      }}
    ]
  });
}

/* ---------------- Kulüp aylık rapor ---------------- */
function kaDefaults() { return { kulup: '', kulupDiger: '', ay: 'Eylül', yil: '2026-2027', yapilan: '', katilim: '', kanit: '', sorun: '', oneri: '', danisman: '', kurum: '', mudur: '', ogretmen: '' }; }
function kaBuild(p, F) {
  var kulup = F.kulup === 'Diğer (yazınız)' ? (F.kulupDiger || '…………') : (F.kulup || '…………');
  var o = resmiUst({ okul: F.kurum || (p && p.okul) || '' }, 'Sosyal Kulüp Aylık Faaliyet Raporu', F.yil || '2026-2027');
  o.push({ t: 'kv', rows: [
    ['Kulüp', kulup],
    ['Ay', F.ay || '…………'],
    ['Danışman', F.danisman || F.ogretmen || ((p && p.ad) || '…………')]
  ]});
  o.push({ t: 'h2', x: 'YILLIK PLANDAKİ BU AY' });
  var yillik = {};
  try { yillik = JSON.parse(localStorage.getItem('oy_f_kulup_yillik') || 'null') || {}; } catch (e) { yillik = {}; }
  var plan = (yillik.aylar && yillik.aylar[F.ay]) || (yillik && kyAyEtkinlik(yillik, F.ay).join('\n')) || 'Bu ay için kayıtlı yıllık plan bulunamadı.';
  o.push({ t: 'p', x: String(plan) });
  o.push({ t: 'h2', x: 'YAPILAN ÇALIŞMALAR' });
  o.push({ t: 'p', x: F.yapilan || '…………………………………………' });
  o.push({ t: 'h2', x: 'KATILIM' });
  o.push({ t: 'p', x: F.katilim || '…………………………………………' });
  o.push({ t: 'h2', x: 'KANIT / BELGELENDİRME' });
  o.push({ t: 'p', x: F.kanit || '…………………………………………' });
  o.push({ t: 'h2', x: 'KARŞILAŞILAN SORUNLAR VE ÖNERİLER' });
  o.push({ t: 'p', x: [F.sorun, F.oneri].filter(Boolean).join('\n') || '…………………………………………' });
  o.push({ t: 'note', x: 'Dayanak: Sosyal Etkinlikler Yönetmeliği (çalışmaların kaydı ve e-Okul Sosyal Etkinlik Modülüne işlenmesi). Bu rapor yıllık planla birlikte saklanmalıdır.' });
  o.push(notIlce());
  o.push(imza([(F.danisman || F.ogretmen || '……………………') + '\nDanışman öğretmen', (F.mudur || '……………………') + '\nOkul müdürü']));
  return o;
}
function kaUI() {
  wizard({
    id: 'kulup_aylik',
    baslik: 'Sosyal Kulüp Aylık Faaliyet Raporu',
    kaynak: 'Sosyal Etkinlikler Yönetmeliği. Yıllık planda kayıtlı aynı kulüp ve ay varsa o ayın etkinlikleri otomatik getirilir; raporu buna göre doldurunuz.',
    defaults: kaDefaults,
    build: kaBuild,
    steps: [
      { ad: 'Kulüp ve ay', render: function (form, F, upd) {
        var s = el('select');
        s.appendChild(el('option', { value: '', text: 'Seçiniz' }));
        var yillik = {};
        try { yillik = JSON.parse(localStorage.getItem('oy_f_kulup_yillik') || 'null') || {}; } catch (e) {}
        if (yillik.kulup && !F.kulup) { F.kulup = yillik.kulup; F.kulupDiger = yillik.kulupDiger; F.danisman = F.danisman || yillik.danisman; }
        OYX.KULUPLER.forEach(function (k) { var o = el('option', { value: k, text: k }); if (F.kulup === k) o.selected = true; s.appendChild(o); });
        s.addEventListener('change', function () { F.kulup = s.value; upd(); });
        form.appendChild(el('label', {}, ['Kulüp', s]));
        inp(form, F, 'kulupDiger', 'Diğer kulüp adı', 'text');
        var ay = el('select');
        ['Eylül','Ekim','Kasım','Aralık','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran'].forEach(function (k) { var o = el('option', { value: k, text: k }); if (F.ay === k) o.selected = true; ay.appendChild(o); });
        ay.addEventListener('change', function () { F.ay = ay.value; upd(); });
        form.appendChild(el('label', {}, ['Ay', ay]));
        inp(form, F, 'danisman', 'Danışman öğretmen', 'text');
        inp(form, F, 'yil', 'Eğitim yılı', 'text');
        inp(form, F, 'kurum', 'Kurum adı', 'text', 'Kurum adını yazınız');
        inp(form, F, 'mudur', 'Müdür adı', 'text');
        var plan = (yillik.aylar && yillik.aylar[F.ay]) || '';
        form.appendChild(el('p', { class: 'oyx-not', text: plan ? ('Yıllık plandaki bu ay: ' + plan) : 'Bu kulüp için kayıtlı yıllık plan bulunamadı. Önce “Sosyal Kulüp Yıllık Çalışma Planı”nı doldurabilirsiniz.' }));
      }},
      { ad: 'Rapor', render: function (form, F, upd) {
        function alan(key, label) {
          var ta = el('textarea'); ta.value = F[key] || '';
          ta.addEventListener('input', function () { F[key] = ta.value; upd(); });
          form.appendChild(el('label', { class: 'wide' }, [label, ta]));
        }
        alan('yapilan', 'Yapılan çalışmalar');
        alan('katilim', 'Katılım (öğrenci sayısı, iş birliği)');
        alan('kanit', 'Kanıt / belgelendirme (fotoğraf, ürün, tutanak vb. — dosya eklenmez, kısa açıklama yeter)');
        alan('sorun', 'Karşılaşılan sorunlar');
        alan('oneri', 'Öneriler');
      }}
    ]
  });
}

/* ---------------- BEP / ZEP ---------------- */
function bepDefaults() {
  return { tur: 'BEP', ogr: '', sinif: '', ders: '', program: '', performans: '', uzun: '', kisa: '', yontem: '', arac: '', degerlendirme: '',
    veli: '', ogretmen: '', rehber: '', birim: '', yil: '2026-2027', kurum: '', tarih: '' };
}
function havuzOku(tur) {
  try {
    var v = JSON.parse(localStorage.getItem('oy_bep_havuz') || 'null');
    if (v && v[tur] && v[tur].length) return v[tur];
  } catch (e) {}
  return (tur === 'ZEP' ? ['Konuyu farklı kaynaklardan karşılaştırarak derinleştirebilme', 'Özgün bir ürün veya proje tasarlayabilme', 'Üst düzey bir problemi adım adım çözebilme', 'Öğrendiğini akranlarına açıklayarak aktarabilme']
    : ['Kısa bir metni kendi cümleleriyle anlatabilme', 'Temel dört işlemde doğru sonuca ulaşabilme', 'Sınıf içinde verilen yönergeyi takip edebilme', 'Günlük ihtiyaçlarını sözlü olarak ifade edebilme', 'Belirlenen süre boyunca göreve dikkatini verebilme']);
}
function havuzYaz(tur, liste) {
  var v = {};
  try { v = JSON.parse(localStorage.getItem('oy_bep_havuz') || '{}') || {}; } catch (e) { v = {}; }
  v[tur] = liste;
  try { localStorage.setItem('oy_bep_havuz', JSON.stringify(v)); } catch (e) {}
}
function bepBuild(p, F) {
  var baslik = F.tur === 'ZEP' ? 'Zenginleştirilmiş Eğitim Programı (ZEP)' : 'Bireyselleştirilmiş Eğitim Programı (BEP)';
  var o = resmiUst({ okul: F.kurum || (p && p.okul) || '' }, baslik, F.yil || '2026-2027');
  o.push({ t: 'note', x: 'Öğrenci adı yerine baş harf kullanmanız önerilir. Bu belge Özel Eğitim Hizmetleri Yönetmeliği çerçevesinde BEP geliştirme birimince hazırlanan plana yardımcı bir taslaktır; resmî formun yerini ancak kurumunuzun onayladığı düzenle alır.' });
  o.push({ t: 'kv', rows: [
    ['Program türü', F.tur || 'BEP'],
    ['Öğrenci', F.ogr || '…………'],
    ['Sınıf', F.sinif || '…………'],
    ['Ders / alan', F.ders || '…………'],
    ['Eğitim programı', F.program || '…………'],
    ['Tarih', F.tarih ? OYX.trDate(F.tarih) : '…………']
  ]});
  o.push({ t: 'h2', x: 'MEVCUT PERFORMANS DÜZEYİ' });
  o.push({ t: 'p', x: F.performans || '…………………………………………' });
  o.push({ t: 'h2', x: 'UZUN DÖNEMLİ AMAÇLAR' });
  o.push({ t: 'ul', items: lines(F.uzun).length ? lines(F.uzun) : ['……………………'] });
  o.push({ t: 'h2', x: 'KISA DÖNEMLİ AMAÇLAR' });
  o.push({ t: 'ul', items: lines(F.kisa).length ? lines(F.kisa) : ['……………………'] });
  o.push({ t: 'h2', x: 'YÖNTEM, ARAÇ-GEREÇ VE UYARLAMALAR' });
  o.push({ t: 'p', x: [F.yontem, F.arac].filter(Boolean).join('\n') || '…………………………………………' });
  o.push({ t: 'h2', x: 'DEĞERLENDİRME VE İZLEME' });
  o.push({ t: 'p', x: F.degerlendirme || '…………………………………………' });
  o.push(notIlce());
  o.push(imza([
    (F.ogretmen || (p && p.ad) || '……………………') + '\nÖğretmen',
    (F.rehber || '……………………') + '\nRehber öğretmen',
    (F.birim || '……………………') + '\nBEP geliştirme birimi başkanı',
    (F.veli || '……………………') + '\nVeli'
  ]));
  return o;
}
function bepUI() {
  wizard({
    id: 'ev_bep',
    baslik: 'BEP / ZEP Planı',
    kaynak: 'Özel Eğitim Hizmetleri Yönetmeliği (BEP geliştirme birimi; uzun ve kısa dönemli amaçlar, yöntem, değerlendirme). ZEP, özel yetenekli öğrenci için zenginleştirme planıdır. Örnek hedefler resmî havuz değildir; öğrencinin değerlendirmesine göre düzenleyiniz.',
    defaults: bepDefaults,
    build: bepBuild,
    steps: [
      { ad: 'Öğrenci ve program', render: function (form, F, upd) {
        var s = el('select');
        ['BEP', 'ZEP'].forEach(function (t) { var o = el('option', { value: t, text: t }); if (F.tur === t) o.selected = true; s.appendChild(o); });
        s.addEventListener('change', function () { F.tur = s.value; upd(); });
        form.appendChild(el('label', {}, ['Program türü', s]));
        inp(form, F, 'ogr', 'Öğrenci (baş harf önerilir)', 'text', 'Örn. A.Y.');
        inp(form, F, 'sinif', 'Sınıf / şube', 'text');
        inp(form, F, 'ders', 'Ders / alan', 'text');
        inp(form, F, 'program', 'Uygulanan eğitim programı', 'text');
        inp(form, F, 'tarih', 'Tarih', 'date');
        inp(form, F, 'yil', 'Eğitim yılı', 'text');
        inp(form, F, 'kurum', 'Kurum adı', 'text', 'Kurum adını yazınız');
      }},
      { ad: 'Hedefler', render: function (form, F, upd) {
        var taP = el('textarea'); taP.value = F.performans || '';
        taP.addEventListener('input', function () { F.performans = taP.value; upd(); });
        form.appendChild(el('label', { class: 'wide' }, ['Mevcut performans düzeyi', taP]));
        form.appendChild(el('p', { class: 'oyx-not', text: 'Aşağıdaki örnek hedefler düzenlenebilir bir havuzdur; resmî amaç listesi değildir. İstediğinizi uzun veya kısa döneme ekleyiniz.' }));
        var havuz = havuzOku(F.tur || 'BEP');
        var th = el('textarea'); th.value = havuz.join('\n');
        th.addEventListener('input', function () { havuzYaz(F.tur || 'BEP', lines(th.value)); });
        form.appendChild(el('label', { class: 'wide' }, ['Hedef havuzu (cihazda saklanır)', th]));
        function ekle(hedef, alan) {
          var mevcut = lines(F[alan]);
          if (mevcut.indexOf(hedef) < 0) mevcut.push(hedef);
          F[alan] = mevcut.join('\n'); upd();
        }
        havuz.forEach(function (hdef) {
          var satir = el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin:4px 0;align-items:center' }, [
            el('span', { text: hdef, style: 'flex:1' }),
            el('button', { type: 'button', class: 'sec', on: { click: function () { ekle(hdef, 'uzun'); } }, text: 'Uzun döneme ekle' }),
            el('button', { type: 'button', class: 'sec', on: { click: function () { ekle(hdef, 'kisa'); } }, text: 'Kısa döneme ekle' })
          ]);
          form.appendChild(satir);
        });
        var u = el('textarea'); u.value = F.uzun || '';
        u.addEventListener('input', function () { F.uzun = u.value; upd(); });
        var k = el('textarea'); k.value = F.kisa || '';
        k.addEventListener('input', function () { F.kisa = k.value; upd(); });
        form.appendChild(el('label', { class: 'wide' }, ['Uzun dönemli amaçlar', u]));
        form.appendChild(el('label', { class: 'wide' }, ['Kısa dönemli amaçlar', k]));
      }},
      { ad: 'Yöntem ve imza', render: function (form, F, upd) {
        function alan(key, label) {
          var ta = el('textarea'); ta.value = F[key] || '';
          ta.addEventListener('input', function () { F[key] = ta.value; upd(); });
          form.appendChild(el('label', { class: 'wide' }, [label, ta]));
        }
        alan('yontem', 'Yöntem ve uyarlamalar');
        alan('arac', 'Araç-gereç ve materyal');
        alan('degerlendirme', 'Değerlendirme ve izleme (yol, tarih)');
        inp(form, F, 'ogretmen', 'Öğretmen', 'text');
        inp(form, F, 'rehber', 'Rehber öğretmen', 'text');
        inp(form, F, 'birim', 'BEP birimi başkanı', 'text');
        inp(form, F, 'veli', 'Veli (ad, isteğe bağlı)', 'text');
      }}
    ]
  });
}

/* ---------------- Çocuk kulübü ---------------- */
function ckDefaults() {
  return Object.assign(egzDefaults(), { yas: '1-4. sınıf', ders: 'Çocuk kulübü etkinlikleri', temalar: '' });
}
function ckBuild(p, F) {
  var se = seansKonulu(F, lines(F.temalar).concat(['Oyun ve hareket', 'Sanat ve ifade', 'Okuma ve dinleme', 'Açık hava / doğa']));
  var o = resmiUst({ okul: F.kurum || (p && p.okul) || '' }, 'Çocuk Kulübü Yıllık Etkinlik Planı', F.yil || '2026-2027');
  o.push({ t: 'kv', rows: [
    ['Yaş grubu / sınıf', F.yas || '…………'],
    ['Etkinlik / ders', F.ders || '…………'],
    ['Başlama / bitiş', OYX.trDate(F.bas) + ' – ' + OYX.trDate(F.bit)],
    ['Çalışma yeri', F.yer || '…………'],
    ['Haftalık süre', OYX.haftalikSaat(haftaOku(F)) + ' saat'],
    ['Öğretmen', F.ogretmen || ((p && p.ad) || '…………')]
  ]});
  o.push({ t: 'h2', x: 'ETKİNLİK TAKVİMİ' });
  if (!se.length) o.push({ t: 'p', x: 'Tarih ve haftalık saatleri giriniz.' });
  else o.push({ t: 'table', head: ['Tarih', 'Gün', 'Saat', 'Süre', 'Tema / etkinlik'], rows: se.map(function (s) {
    return [OYX.trDate(s.tarih), s.gun, s.saat, s.sure + ' saat', s.konu || ''];
  })});
  o.push({ t: 'note', x: 'Okul öncesi ve ilkokul çocuk kulübü çalışmaları kurumunuzun uygulama esaslarına ve veli izinlerine göre yürütülmelidir. Temalar öneri iskeletidir.' });
  o.push(notIlce());
  o.push(imza([(F.ogretmen || '……………………') + '\nÖğretmen', (F.mudur || '……………………') + '\nOkul müdürü']));
  return o;
}
function ckUI() {
  wizard({
    id: 'cocuk_kulup',
    baslik: 'Çocuk Kulübü Yıllık Planı',
    kaynak: 'Okul öncesi ve ilkokul düzeyinde ders saatleri dışında veya çocuk kulübü kapsamında yürütülen etkinlik planı. Kurumunuzun yönerge ve veli izin uygulamasını kontrol ediniz.',
    defaults: ckDefaults,
    build: ckBuild,
    steps: [
      { ad: 'Grup ve içerik', render: function (form, F, upd) {
        var s = el('select');
        ['Okul öncesi', '1-4. sınıf', '5-8. sınıf (çocuk kulübü uzantısı)'].forEach(function (k) { var o = el('option', { value: k, text: k }); if (F.yas === k) o.selected = true; s.appendChild(o); });
        s.addEventListener('change', function () { F.yas = s.value; upd(); });
        form.appendChild(el('label', {}, ['Yaş grubu / sınıf', s]));
        inp(form, F, 'ders', 'Etkinlik / kulüp adı', 'text');
        var ta = el('textarea', { placeholder: 'Tema veya ünite (her satıra bir)' });
        ta.value = F.temalar || '';
        ta.addEventListener('input', function () { F.temalar = ta.value; upd(); });
        form.appendChild(el('label', { class: 'wide' }, ['Temalar (isteğe bağlı)', ta]));
        inp(form, F, 'yil', 'Eğitim yılı', 'text');
      }},
      { ad: 'Tarih ve Saat', render: function (form, F, upd) {
        inp(form, F, 'bas', 'Başlama tarihi', 'date');
        inp(form, F, 'bit', 'Bitiş tarihi', 'date');
        gunProgrami(form, F, upd);
      }},
      { ad: 'Tatiller', render: tatilKutuları },
      { ad: 'Kurum', render: function (form, F, upd) {
        inp(form, F, 'yer', 'Çalışma yeri', 'text');
        inp(form, F, 'kurum', 'Kurum adı', 'text', 'Kurum adını yazınız');
        inp(form, F, 'mudur', 'Müdür adı', 'text');
        inp(form, F, 'ogretmen', 'Öğretmen adı', 'text');
      }}
    ]
  });
}

/* ---------------- Performans rubriği Excel ---------------- */
function prDefaults() {
  return { ders: '', sinif: '', gorev: '', yil: '2026-2027', olcutler: 'Hazırlık ve planlama\nUygulama / süreç\nÜrün / sonuç\nSunum ve açıklama',
    duzeyler: 'Başlangıç,Gelişen,Yeterli,İleri', ogrenciler: '', ogretmen: '', kurum: '' };
}
function prSatirlar(F) {
  var olc = lines(F.olcutler);
  var duz = String(F.duzeyler || '').split(/\s*,\s*/).filter(Boolean);
  return { olc: olc, duz: duz.length ? duz : ['Başlangıç', 'Gelişen', 'Yeterli', 'İleri'] };
}
function prBuild(p, F) {
  var s = prSatirlar(F);
  var o = resmiUst({ okul: F.kurum || (p && p.okul) || '' }, 'Performans Görevi Dereceli Puanlama Anahtarı', F.yil || '2026-2027');
  o.push({ t: 'kv', rows: [
    ['Ders', F.ders || '…………'],
    ['Sınıf', F.sinif || '…………'],
    ['Görev', F.gorev || '…………'],
    ['Öğretmen', F.ogretmen || ((p && p.ad) || '…………')]
  ]});
  o.push({ t: 'h2', x: 'DERECELİ PUANLAMA ANAHTARI' });
  var head = ['Ölçüt'].concat(s.duz).concat(['Puan']);
  var rows = s.olc.map(function (ad) { return [ad].concat(s.duz.map(function () { return ''; })).concat(['']); });
  o.push({ t: 'table', head: head, rows: rows.length ? rows : [head.map(function () { return ''; })] });
  o.push({ t: 'note', x: 'Düzey açıklamalarını görevin niteliğine göre doldurunuz. Excel çıktısında öğrenci sütunları da yer alır. Ölçütler resmî zorunlu liste değildir.' });
  o.push(notIlce());
  o.push(imza([(F.ogretmen || '……………………') + '\nÖğretmen']));
  return o;
}
function prExcel(F) {
  var X = root.XLSX;
  if (!X) { if (typeof msg === 'function') msg('Excel kütüphanesi yüklenemedi.', true); return; }
  var s = prSatirlar(F);
  var ogr = lines(F.ogrenciler);
  var head = ['Ölçüt'].concat(s.duz);
  if (ogr.length) head = head.concat(ogr);
  else head = head.concat(['Öğrenci 1', 'Öğrenci 2', 'Öğrenci 3', 'Puan']);
  var rows = [head].concat(s.olc.map(function (ad) { return [ad].concat(head.slice(1).map(function () { return ''; })); }));
  var wb = X.utils.book_new();
  var ws = X.utils.aoa_to_sheet(rows);
  X.utils.book_append_sheet(wb, ws, 'Rubrik');
  X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([
    ['Ders', F.ders || ''], ['Sınıf', F.sinif || ''], ['Görev', F.gorev || ''],
    ['Not', 'Öğrenci adları yalnızca bu dosyada tutulur. Dosyayı paylaşırken kişisel verilere dikkat ediniz.']
  ]), 'Bilgi');
  X.writeFile(wb, 'performans-rubrik.xlsx');
}
function prUI() {
  wizard({
    id: 'perf_excel',
    baslik: 'Performans Rubriği (Excel)',
    kaynak: 'Performans görevi ve dereceli puanlama anahtarı. Yazdırılabilir tablo ve Excel dökümü üretir. Mevcut “Proje / Performans Görevi Dereceli Puanlama Anahtarı” şablonu durur; bu araç Excel çıktısını tamamlar.',
    defaults: prDefaults,
    build: prBuild,
    steps: [
      { ad: 'Görev', render: function (form, F, upd) {
        inp(form, F, 'ders', 'Ders', 'text');
        inp(form, F, 'sinif', 'Sınıf / şube', 'text');
        inp(form, F, 'gorev', 'Performans görevi adı', 'text');
        inp(form, F, 'yil', 'Eğitim yılı', 'text');
        inp(form, F, 'ogretmen', 'Öğretmen', 'text');
        inp(form, F, 'kurum', 'Kurum adı', 'text', 'Kurum adını yazınız');
      }},
      { ad: 'Ölçütler ve Excel', render: function (form, F, upd) {
        var ol = el('textarea'); ol.value = F.olcutler || '';
        ol.addEventListener('input', function () { F.olcutler = ol.value; upd(); });
        form.appendChild(el('label', { class: 'wide' }, ['Ölçütler (her satıra bir)', ol]));
        inp(form, F, 'duzeyler', 'Düzeyler (virgülle)', 'text', 'Başlangıç, Gelişen, Yeterli, İleri');
        var og = el('textarea', { placeholder: 'İsteğe bağlı, her satıra bir öğrenci adı (yalnızca bu cihazda)' });
        og.value = F.ogrenciler || '';
        og.addEventListener('input', function () { F.ogrenciler = og.value; upd(); });
        form.appendChild(el('label', { class: 'wide' }, ['Öğrenci sütunları (isteğe bağlı)', og]));
        form.appendChild(el('button', { type: 'button', on: { click: function () { prExcel(F); } }, text: 'Excel olarak indir' }));
      }}
    ]
  });
}

/* ---------------- Kayıt ve açılış ---------------- */
var SABLONLAR = [
  { id: 'ev_egzersiz', kat: 'Kurs ve Egzersiz', baslik: 'Egzersiz (Ders Dışı Eğitim) Çalışma Planı', ac: egzUI, mevcut: true },
  { id: 'ev_dyk', kat: 'Kurs ve Egzersiz', baslik: 'DYK ve İYEP Kurs Planı', ac: function () { dykUI('DYK'); }, mevcut: true },
  { id: 'ev_iyep', kat: 'Kurs ve Egzersiz', baslik: 'İYEP Öğrenci İzleme ve Değerlendirme Formu', ac: function () { dykUI('İYEP'); }, mevcut: true },
  { id: 'sa_analiz', kat: 'Yazılı / Sınav', baslik: 'Sınav Analizi', ac: saUI },
  { id: 'kulup_yillik', kat: 'Sosyal Etkinlik ve Kulüp', baslik: 'Sosyal Kulüp Yıllık Çalışma Planı', ac: kyUI },
  { id: 'kulup_aylik', kat: 'Sosyal Etkinlik ve Kulüp', baslik: 'Sosyal Kulüp Aylık Faaliyet Raporu', ac: kaUI },
  { id: 'ev_bep', kat: 'BEP', baslik: 'Bireyselleştirilmiş Eğitim Programı (BEP) Formu', ac: bepUI, mevcut: true },
  { id: 'bep_zep', kat: 'BEP', baslik: 'BEP / ZEP Planı', ac: bepUI },
  { id: 'cocuk_kulup', kat: 'Sosyal Etkinlik ve Kulüp', baslik: 'Çocuk Kulübü Yıllık Planı', ac: ckUI },
  { id: 'perf_excel', kat: 'Yazılı / Sınav', baslik: 'Performans Rubriği (Excel)', ac: prUI }
];

function ekleSablonlar() {
  if (typeof OY === 'undefined' || !OY.T) return;
  SABLONLAR.forEach(function (s) {
    var varMi = OY.T.some(function (t) { return t.id === s.id; });
    if (!varMi) {
      OY.T.push({
        id: s.id, kat: s.kat, baslik: s.baslik,
        kaynak: 'ÖY 1.11.0 plan aracı (özgün metin)',
        alan: [], oyx: true, build: function (p, f) { return (OYX.ui && OYX.ui.buildFor && OYX.ui.buildFor(s.id, p, f)) || []; }
      });
    }
  });
}

function ac(id) {
  var s = SABLONLAR.filter(function (x) { return x.id === id; })[0];
  if (!s) return false;
  s.ac();
  return true;
}

OYX.ac = ac;
OYX.SABLONLAR = SABLONLAR;
root.egzersizUI = egzUI;
root.dykUI = dykUI;
root.saUI = saUI;
root.kyUI = kyUI;
root.kaUI = kaUI;
root.bepUI = bepUI;
root.ckUI = ckUI;
root.prUI = prUI;

function kanca() {
  ekleSablonlar();
  if (root.__oyxSel) return;
  var eski = root.sel;
  if (typeof eski !== 'function') { setTimeout(kanca, 30); return; }
  root.__oyxSel = true;
  root.sel = function (id) {
    if (ac(id)) return;
    return eski.apply(this, arguments);
  };
  if (typeof cats === 'function') cats();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kanca);
else kanca();

OYX.ui = Object.assign(OYX.ui || {}, {
  wizard: wizard, egzUI: egzUI, dykUI: dykUI, saUI: saUI, kyUI: kyUI, kaUI: kaUI, bepUI: bepUI, ckUI: ckUI, prUI: prUI,
  egzBuild: egzBuild, dykBuild: dykBuild, saBuild: saBuild, kyBuild: kyBuild, kaBuild: kaBuild, bepBuild: bepBuild, ckBuild: ckBuild, prBuild: prBuild,
  saData: saData, kyAyEtkinlik: kyAyEtkinlik
});
})(typeof window !== 'undefined' ? window : this);

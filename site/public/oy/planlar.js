/* Evrak Asistanı · Öğretmen Yardımcısı 1.12.2 — plan araçları
   Yayıncı: Eyüp ŞEKER. Metinler özgün yazımdır. Öğrenci verisi yalnızca bu cihazda kalır. */
(function (root) {
'use strict';

var GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
var GUNLER_HAFTA = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
var AYLAR = ['Eylül', 'Ekim', 'Kasım', 'Aralık', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];

function pad(n) { return (n < 10 ? '0' : '') + n; }
function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function parseIso(s) {
  var p = String(s || '').split('-');
  if (p.length < 3) return new Date(NaN);
  return new Date(+p[0], +p[1] - 1, +p[2]);
}
function validIso(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parseIso(s).getTime()); }
function addDays(s, n) { var d = parseIso(s); d.setDate(d.getDate() + n); return iso(d); }
function gunAd(s) { var d = parseIso(s); return isNaN(d.getTime()) ? '' : GUNLER[d.getDay()]; }
function gunNo(s) { return parseIso(s).getDay(); } /* 0=Pazar */
function range(a, b) {
  var o = [], d;
  if (!validIso(a) || !validIso(b) || a > b) return o;
  for (d = a; d <= b; d = addDays(d, 1)) o.push(d);
  return o;
}
function trDate(s) {
  if (!validIso(s)) return '…/…/20…';
  var p = s.split('-');
  return p[2] + '.' + p[1] + '.' + p[0];
}
function trNorm(s) {
  return String(s || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u').replace(/[^a-z0-9]+/g, ' ').trim();
}
function lines(v) { return String(v || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean); }
function num(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number' && isFinite(v)) return v;
  var s = String(v).trim().replace(',', '.');
  if (!s || /^(-|—|x|yok|girmedi)$/i.test(s)) return null;
  var n = parseFloat(s);
  return isFinite(n) ? n : null;
}
function sum(arr) { return arr.reduce(function (a, b) { return a + b; }, 0); }

/* ---------- 2026-2027 tatil takvimi (MEB 2026-2027 Çalışma Takvimi + ulusal bayramlar) ---------- */
/* Ara tatil ve yarıyıl tarihleri MEB çalışma takvimindeki hafta içi aralıklardır
   (16–20 Kasım 2026, 25 Ocak–5 Şubat 2027, 8–12 Mart 2027).
   Uygulamada bu aralıkların hemen öncesindeki ve sonrasındaki hafta sonu da
   (son ders günü Cuma ile tatil Pazartesi arası, tatil Cuma ile ilk ders Pazartesi arası)
   plana alınmaz; resmî etiketler hafta içi tarihleri korur.
   Resmî günler: 29 Ekim 2026, 1 Ocak 2027, 23 Nisan 2027, 1 Mayıs 2027,
   Ramazan Bayramı 9–11 Mart 2027, Kurban Bayramı 16–19 Mayıs 2027
   (19 Mayıs aynı zamanda Atatürk'ü Anma, Gençlik ve Spor Bayramı).
   Arefe (saat 13.00'ten): 28 Ekim 2026, 8 Mart 2027 (Ramazan), 15 Mayıs 2027 (Kurban).
   8–11 Mart 2027 ikinci ara tatille çakışır. */
var TATIL = {
  yil: '2026-2027',
  ara1: { id: 'ara1', ad: '1. dönem ara tatili (16–20 Kasım 2026)', gunler: range('2026-11-16', '2026-11-20') },
  ara2: { id: 'ara2', ad: '2. dönem ara tatili (8–12 Mart 2027)', gunler: range('2027-03-08', '2027-03-12') },
  yariyil: { id: 'yariyil', ad: 'Yarıyıl tatili (25 Ocak–5 Şubat 2027)', gunler: range('2027-01-25', '2027-02-05') },
  resmi: { id: 'resmi', ad: 'Resmî tatil günleri', gunler: ['2026-10-29', '2027-01-01', '2027-03-09', '2027-03-10', '2027-03-11', '2027-04-23', '2027-05-01', '2027-05-16', '2027-05-17', '2027-05-18', '2027-05-19'] },
  arefe: { id: 'arefe', ad: 'Arefe (yarım gün)', gunler: ['2026-10-28', '2027-03-08', '2027-05-15'] }
};
var TATIL_SIRA = ['ara1', 'ara2', 'yariyil', 'resmi', 'arefe'];

/* Ara tatil / yarıyıl hafta içi aralığının bitişik hafta sonlarını da kapatır. */
function haftaSonuEkle(gunler) {
  var set = {}, i, t, g;
  for (i = 0; i < (gunler || []).length; i++) set[gunler[i]] = true;
  for (i = 0; i < (gunler || []).length; i++) {
    t = gunler[i];
    g = gunNo(t);
    if (g === 1) { set[addDays(t, -2)] = true; set[addDays(t, -1)] = true; }
    if (g === 5) { set[addDays(t, 1)] = true; set[addDays(t, 2)] = true; }
  }
  return Object.keys(set).sort();
}

function tatilDurum(sec) {
  sec = sec || {};
  var haric = {}, yarim = {}, i, k, g, liste;
  for (i = 0; i < TATIL_SIRA.length; i++) {
    k = TATIL_SIRA[i];
    if (sec[k] === false) continue;
    liste = TATIL[k].gunler;
    if (k === 'ara1' || k === 'ara2' || k === 'yariyil') liste = haftaSonuEkle(liste);
    for (g = 0; g < liste.length; g++) {
      if (k === 'arefe') yarim[liste[g]] = TATIL[k].ad;
      else haric[liste[g]] = TATIL[k].ad;
    }
  }
  /* Arefe, aynı gün resmi veya ara tatildeyse tam gün kapalı sayılır (yarım işaretlenmez). */
  Object.keys(haric).forEach(function (t) { if (yarim[t]) delete yarim[t]; });
  return { haric: haric, yarim: yarim };
}

/* Ders saati 40 dakika kabul edilerek bitiş saati hesaplanır (2 saat → 15:00–16:20). */
function bitisHesap(bas, saat) {
  var p = String(bas || '15:00').split(':');
  if (p.length < 2) p = ['15', '00'];
  var m = (+p[0]) * 60 + (+p[1] || 0) + Math.round((Number(saat) || 0) * 40);
  if (m < 0) m = 0;
  var h = Math.floor(m / 60) % 24, mm = ((m % 60) + 60) % 60;
  return pad(h) + ':' + pad(mm);
}

/* Hafta içi 15:00, hafta sonu 10:00 başlangıç. */
function varsayilanAralik(gun, saat) {
  var ad = String(gun || '');
  var haftaIci = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'].indexOf(ad) >= 0;
  var bas = haftaIci ? '15:00' : '10:00';
  return { baslangic: bas, bitis: bitisHesap(bas, saat) };
}

/* Saat sütunu: yalnızca saat aralığı (ör. 15:00–16:20). Süre asla buraya yazılmaz. */
function saatYazi(s) {
  s = s || {};
  var a = String(s.baslangic || '').trim();
  var b = String(s.bitis || '').trim();
  var t = (a && b) ? (a + '–' + b) : (a || b || '');
  if (s.yarim) t = (t ? t + ' · ' : '') + 'yarım gün';
  return t;
}

function saatEksik(hafta) {
  return (hafta || []).some(function (s) {
    return Number(s && s.saat) > 0 && !(String(s.baslangic || '').trim() && String(s.bitis || '').trim());
  });
}

/**
 * Haftalık program: [{gun: 1-6 veya 0=Pazar, saat: number, baslangic: '16:00', bitis: '17:20'}]
 * sec: tatil anahtarları, true = tatili uygula (hariç tut / arefeyi yarım işaretle)
 */
function seanslar(opts) {
  opts = opts || {};
  var bas = opts.bas, bit = opts.bit, hafta = opts.hafta || [], sec = opts.sec || {};
  var out = [], dur = tatilDurum(sec), gunMap = {}, i, s, d, gun, tarihleri, t, kayit;
  if (!validIso(bas) || !validIso(bit) || bas > bit) return out;
  for (i = 0; i < hafta.length; i++) {
    s = hafta[i];
    if (!s || !(Number(s.saat) > 0)) continue;
    gun = s.gun;
    if (typeof gun === 'string') {
      var gAd = gun;
      gun = GUNLER.indexOf(gAd);
      if (gun < 0) gun = GUNLER_HAFTA.indexOf(gAd);
    }
    gunMap[gun] = s;
  }
  tarihleri = range(bas, bit);
  for (i = 0; i < tarihleri.length; i++) {
    t = tarihleri[i];
    s = gunMap[gunNo(t)];
    if (!s) continue;
    if (dur.haric[t]) continue;
    kayit = {
      tarih: t,
      gun: gunAd(t),
      baslangic: s.baslangic || '',
      bitis: s.bitis || '',
      sure: Number(s.saat) || 0,
      yarim: !!dur.yarim[t],
      yarimAd: dur.yarim[t] || '',
      konu: ''
    };
    kayit.saat = saatYazi(kayit);
    out.push(kayit);
  }
  return out;
}

function haftalikSaat(hafta) {
  return sum((hafta || []).map(function (s) { return Number(s && s.saat) > 0 ? Number(s.saat) : 0; }));
}

function toplamSaat(seans) { return sum((seans || []).map(function (s) { return Number(s.sure) || 0; })); }

function konuDoldur(seans, konular, oneriler) {
  /* konular: {tarih: metin} kaydedilmiş; yoksa kısa iskelet önerisi (döngüsel) */
  oneriler = oneriler || [
    'Isınma ve temel çalışma',
    'Teknik beceri çalışması',
    'Uygulama ve pekiştirme',
    'Ölçme, değerlendirme ve geri bildirim'
  ];
  return (seans || []).map(function (s, i) {
    var k = Object.assign({}, s);
    if (konular && konular[s.tarih] != null && String(konular[s.tarih]).trim()) k.konu = String(konular[s.tarih]).trim();
    else k.konu = oneriler[i % oneriler.length];
    return k;
  });
}


/* ---------- İlkokul / okul öncesi sınav yasağı (md.4/1-b, RG 14.11.2026) ---------- */
function ilkokulSinavYasak(s) {
  var t = String(s || '').toLocaleLowerCase('tr-TR').trim();
  if (!t) return false;
  if (/okul\s*öncesi|okul\s*oncesi|okulöncesi|okuloncesi|anaokul|anasınıf|anasinif|ana\s*sınıf|ana\s*sinif/.test(t)) return true;
  if (/^(0|[1-4])(\D|$)/.test(t)) return true;
  return false;
}
function sinavYasakMetin() {
  return 'Yönetmelik gereği okul öncesi ve ilkokulda sınav yapılmaz (Ölçme ve Değerlendirme Yön. md.4/1-b, RG 14.11.2026). Öğrenme etkinliği ve gözlem formları kullanılabilir.';
}
function siralamaYasakMetin() {
  return 'Sonuçlar öğrenciler, sınıflar, okullar veya iller arasında sıralama, karşılaştırma ya da kıyaslama yapmak amacıyla kullanılamaz (Ölçme ve Değerlendirme Yön. md.4/1-g, RG 14.11.2026). Bu özet yalnızca şube bazında öğrenme eksiklerini görmek içindir.';
}
/* ---------- Sınav analizi ---------- */
function analizHesap(data) {
  data = data || {};
  var sorular = data.sorular || [];
  var ogr = data.ogrenciler || [];
  var esik = data.esik == null ? 50 : Number(data.esik);
  var katilan = ogr.filter(function (o) {
    var k = trNorm(o.katilim || '');
    if (/girmedi|yok|devamsiz|muaf/.test(k) && !/girdi/.test(k)) return false;
    if (/ozel egitim|kopya/.test(k)) return false;
    return (o.puanlar || []).some(function (p) { return num(p) != null; });
  });
  var nKat = katilan.length;
  var soruSonuc = sorular.map(function (q, qi) {
    var max = num(q.max) || 0;
    var puanlar = katilan.map(function (o) { return num((o.puanlar || [])[qi]); }).filter(function (x) { return x != null; });
    var ort = puanlar.length ? sum(puanlar) / puanlar.length : 0;
    var yuzde = max > 0 && puanlar.length ? (ort / max) * 100 : (puanlar.length ? 0 : null);
    return {
      no: q.no != null ? q.no : (qi + 1),
      max: max,
      kazanım: q.kazanım || q.kazanim || '',
      kod: q.kod || '',
      n: puanlar.length,
      ort: Math.round(ort * 100) / 100,
      yuzde: yuzde == null ? null : Math.round(yuzde * 10) / 10
    };
  });
  var ogrToplam = katilan.map(function (o) {
    var alinan = 0, maks = 0, i;
    for (i = 0; i < sorular.length; i++) {
      var p = num((o.puanlar || [])[i]);
      var m = num(sorular[i].max) || 0;
      maks += m;
      if (p != null) alinan += p;
    }
    return { no: o.no, ad: o.ad, alinan: alinan, maks: maks, yuzde: maks > 0 ? (alinan / maks) * 100 : 0 };
  });
  var sinifOrt = nKat ? sum(ogrToplam.map(function (x) { return x.yuzde; })) / nKat : 0;
  var kazMap = {}, i, s, key;
  for (i = 0; i < soruSonuc.length; i++) {
    s = soruSonuc[i];
    key = String(s.kod || s.kazanım || ('Soru ' + s.no)).trim() || ('Soru ' + s.no);
    if (!kazMap[key]) kazMap[key] = { ad: s.kazanım || key, kod: s.kod || '', yuzdeler: [], sorular: [] };
    if (s.yuzde != null) kazMap[key].yuzdeler.push(s.yuzde);
    kazMap[key].sorular.push(s.no);
  }
  var kazanımlar = Object.keys(kazMap).map(function (k) {
    var g = kazMap[k];
    var y = g.yuzdeler.length ? sum(g.yuzdeler) / g.yuzdeler.length : null;
    return { ad: g.ad, kod: g.kod, nSoru: g.sorular.length, sorular: g.sorular, yuzde: y == null ? null : Math.round(y * 10) / 10 };
  });
  var basarisiz = kazanımlar.filter(function (k) { return k.yuzde != null && k.yuzde < esik; })
    .sort(function (a, b) { return a.yuzde - b.yuzde; });
  var telafi = telafiMetin(basarisiz, esik, sinifOrt);
  return {
    nOgrenci: ogr.length,
    nKatilan: nKat,
    ortalama: Math.round(sinifOrt * 10) / 10,
    esik: esik,
    soru: soruSonuc,
    kazanım: kazanımlar,
    basarisiz: basarisiz,
    ogrenci: ogrToplam,
    telafi: telafi
  };
}

function telafiMetin(basarisiz, esik, ortalama) {
  var t = [];
  t.push('Bu metin pedagojik bir öneri taslağıdır; resmî bir telafi programı veya zümre kararı yerine geçmez. Zümre ve okul yönetiminin kararına göre düzenleyiniz.');
  t.push('Sınıf ortalaması %' + (Math.round((ortalama || 0) * 10) / 10) + ' olarak hesaplanmıştır. Başarı eşiği %' + esik + ' alınmıştır (öğretmen değiştirebilir).');
  if (!basarisiz || !basarisiz.length) {
    t.push('Eşik altında kazanım görünmüyor. Mevcut kazanımları pekiştirici kısa alıştırmalar yeterli olabilir.');
    return t.join(' ');
  }
  t.push('Eşik altında kalan kazanımlar öncelik sırasıyla:');
  basarisiz.forEach(function (k, i) {
    t.push((i + 1) + ') ' + (k.kod ? k.kod + ' ' : '') + (k.ad || 'Kazanım') + ' (%' + k.yuzde + ', ' + k.nSoru + ' soru).');
  });
  t.push('Öneri iskeleti: (1) Bu kazanımlar için kısa bir tanıma tekrarı, (2) yönlendirmeli alıştırma, (3) kısa bir izleme değerlendirmesi. Süre ve yöntem dersin niteliğine göre öğretmen tarafından belirlenir.');
  return t.join(' ');
}

function oyssSayfaParse(aoa, sayfaAd) {
  /* aoa: 2D dizi. OYSS şablonu ve genel puan tabloları. */
  var satirlar = (aoa || []).map(function (r) { return (r || []).map(function (c) { return c == null ? '' : String(c).trim(); }); });
  var h = -1, i, j, row, nrm, basliklar = [];
  function baslikMi(cells) {
    var n = cells.map(trNorm);
    var hasNo = n.some(function (x) { return /^(okul\s*no|okulno|ogrenci\s*no|numara|no)$/.test(x) || x === 'okul numarasi' || x.indexOf('okul no') >= 0; });
    var hasAd = n.some(function (x) { return /^(ad|adi|ad soyad|ad soyadi|adi soyadi|ogrenci)$/.test(x) || x.indexOf('ad soyad') >= 0; });
    var hasSoru = n.some(function (x) { return /soru/.test(x) || /^s\s*\d+$/.test(x) || /^\d+$/.test(x); });
    return (hasNo || hasAd) && (hasSoru || hasAd);
  }
  for (i = 0; i < Math.min(satirlar.length, 30); i++) {
    if (baslikMi(satirlar[i])) { h = i; basliklar = satirlar[i]; break; }
  }
  if (h < 0) return null;
  var col = { no: -1, ad: -1, soyad: -1, katilim: -1, soru: [] };
  for (j = 0; j < basliklar.length; j++) {
    nrm = trNorm(basliklar[j]);
    if (col.no < 0 && (/okul\s*no|okulno|ogrenci\s*no|^numara$|^no$/.test(nrm) || nrm === 'okul numarasi')) col.no = j;
    else if (col.soyad < 0 && /soyad/.test(nrm) && !/ad soyad/.test(nrm)) col.soyad = j;
    else if (col.ad < 0 && (/^ad$|^adi$|ad soyad|ogrenci/.test(nrm))) col.ad = j;
    else if (col.katilim < 0 && /katilim/.test(nrm)) col.katilim = j;
    else {
      var m = nrm.match(/(?:soru\s*)(\d+)|(?:^s\s*)(\d+)$|^(\d+)$/);
      if (m) {
        var no = parseInt(m[1] || m[2] || m[3], 10);
        col.soru.push({ no: no, idx: j, baslik: basliklar[j] });
      }
    }
  }
  col.soru.sort(function (a, b) { return a.no - b.no; });
  if (!col.soru.length) return null;
  var ogrenciler = [];
  for (i = h + 1; i < satirlar.length; i++) {
    row = satirlar[i];
    var ad = col.ad >= 0 ? row[col.ad] || '' : '';
    if (col.soyad >= 0) ad = (ad + ' ' + (row[col.soyad] || '')).trim();
    var no = col.no >= 0 ? row[col.no] || '' : '';
    if (!ad && !no) continue;
    var puanlar = col.soru.map(function (s) { return num(row[s.idx]); });
    var bos = puanlar.every(function (p) { return p == null; });
    var kat = col.katilim >= 0 ? (row[col.katilim] || '') : '';
    if (bos && !kat && !ad) continue;
    ogrenciler.push({ no: no, ad: ad, katilim: kat, puanlar: puanlar });
  }
  var sorular = col.soru.map(function (s) {
    var maxM = String(s.baslik).match(/(\d+)\s*puan/i);
    return { no: s.no, max: maxM ? parseInt(maxM[1], 10) : null, kazanım: '', baslik: s.baslik };
  });
  return { sayfa: sayfaAd || '', sorular: sorular, ogrenciler: ogrenciler };
}

function oyssKitapParse(sayfalar) {
  /* sayfalar: [{ad, aoa}] */
  var out = [];
  (sayfalar || []).forEach(function (s) {
    var p = oyssSayfaParse(s.aoa, s.ad);
    if (p && p.ogrenciler.length) out.push(p);
  });
  return out;
}

/* ---------- Kazanım yerleşimi (DYK / yıllık plandaki mevcut çıktılar) ---------- */
function programCiktilar(ders, sinif) {
  var liste = (root.TYMMK && TYMMK.liste) || (typeof TYMMK !== 'undefined' && TYMMK.liste) || [];
  var sn = String(sinif || '').replace(/[^0-9].*$/, '');
  var adaylar = liste.filter(function (x) {
    return String(x.s) === sn && trNorm(x.d).indexOf(trNorm(ders).replace(/ dersi$/, '')) >= 0;
  });
  if (!adaylar.length) {
    adaylar = liste.filter(function (x) {
      return String(x.s) === sn && (trNorm(ders).indexOf(trNorm(x.d).replace(/ dersi.*$/, '')) >= 0 || trNorm(x.d).indexOf(trNorm(ders)) >= 0);
    });
  }
  if (!adaylar.length) {
    /* İYEP özel adı */
    adaylar = liste.filter(function (x) { return /iyep|yetistirme programi/i.test(trNorm(x.d)) && String(x.s) === sn; });
  }
  if (!adaylar.length) return { ders: ders, sinif: sinif, bulunan: false, ciktilar: [] };
  var kurs = adaylar[0];
  var ciktilar = [];
  (kurs.un || []).forEach(function (u) {
    (u.o || []).forEach(function (o) {
      ciktilar.push({ kod: o[0] || '', metin: o[1] || '', unite: u.a || '' });
    });
  });
  return { ders: kurs.d, sinif: kurs.s, bulunan: true, ciktilar: ciktilar, saatlik: kurs.saatlik };
}

function yerlestir(ciktilar, seans) {
  var C = ciktilar || [], S = seans || [], i, j, nC = C.length, nS = S.length, out = [];
  if (!nS) return out;
  if (!nC) {
    return S.map(function (s) { return Object.assign({}, s, { konu: s.konu || 'Kazanım girilmedi' }); });
  }
  if (nS >= nC) {
    var base = Math.floor(nS / nC), extra = nS % nC, idx = 0;
    for (i = 0; i < nC; i++) {
      var adet = base + (i < extra ? 1 : 0);
      for (j = 0; j < adet; j++, idx++) {
        var konu = (C[i].kod ? C[i].kod + ' ' : '') + C[i].metin;
        if (j > 0) konu = 'Pekiştirme: ' + konu;
        out.push(Object.assign({}, S[idx], { konu: konu, kod: C[i].kod, unite: C[i].unite }));
      }
    }
    return out;
  }
  /* daha az seans: kazanımları grupla */
  var per = Math.ceil(nC / nS);
  for (i = 0; i < nS; i++) {
    var parca = C.slice(i * per, Math.min(nC, (i + 1) * per));
    if (!parca.length) parca = [C[nC - 1]];
    out.push(Object.assign({}, S[i], {
      konu: parca.map(function (c) { return (c.kod ? c.kod + ' ' : '') + c.metin; }).join(' / '),
      kod: parca.map(function (c) { return c.kod; }).filter(Boolean).join(', '),
      unite: parca[0].unite
    }));
  }
  return out;
}

/* ---------- Sabit listeler (özgün ifade; 2010/49 dalları + uygulamada sık kullanılan alanlar) ---------- */
var EGZ_ALANLAR = [
  'İzcilik',
  'Futbol', 'Basketbol', 'Voleybol', 'Hentbol', 'Atletizm', 'Güreş', 'Judo', 'Karate', 'Tekvando',
  'Badminton', 'Tenis', 'Masa tenisi', 'Jimnastik', 'Yüzme', 'Kros', 'Oryantiring', 'Kayak', 'Boks', 'Eskrim',
  'Satranç',
  'Türk halk oyunları',
  'Müzik', 'Koro', 'Bağlama', 'Gitar',
  'Resim', 'Heykel', 'Görsel sanatlar', 'Geleneksel el sanatları',
  'Tiyatro', 'Drama', 'Opera', 'Bale', 'Sinema',
  'Model uçak', 'Model roket',
  'TÜBİTAK proje çalışmaları (bilim olimpiyatları ve 2204)',
  'Akıl ve zekâ oyunları',
  'Diğer (aşağıya yazınız)'
];

var KULUPLER = [
  'Kızılay Kulübü', 'Yeşilay Kulübü', 'Beyazay Kulübü', 'Siberay Kulübü',
  'Tarih ve Kültürel Miras Kulübü', 'Tabiat ve Yaşanabilir Çevre Kulübü',
  'Sağlıklı Yaşam ve Fiziksel Aktivite Kulübü', 'Yaşam Becerileri Kulübü',
  'Kültür ve Edebiyat Kulübü', 'Bilim, Fen ve Teknoloji Kulübü', 'Spor Kulübü',
  'Sivil Savunma Kulübü', 'İzcilik Kulübü', 'Müzik Kulübü', 'Görsel Sanatlar Kulübü',
  'Tiyatro Kulübü', 'Satranç Kulübü', 'Gezi, Tanıtma ve Turizm Kulübü',
  'Demokrasi ve İnsan Hakları Kulübü', 'Çevre Koruma Kulübü', 'Kütüphanecilik Kulübü',
  'Münazara Kulübü', 'Girişimcilik Kulübü', 'Yabancı Diller Kulübü',
  'Değerler Kulübü', 'Fotoğrafçılık Kulübü', 'Halk Oyunları Kulübü',
  'Matematik Kulübü', 'Tarih Kulübü', 'Çocuk Hakları Kulübü',
  'Diğer (yazınız)'
];

var BELIRLI = [
  ['Eylül', '15 Temmuz Demokrasi ve Millî Birlik Günü anması (yıl başı)'],
  ['Eylül', 'İlköğretim Haftası'],
  ['Ekim', 'Hayvanları Koruma Günü (4 Ekim)'],
  ['Ekim', '29 Ekim Cumhuriyet Bayramı'],
  ['Ekim', 'Kızılay Haftası (29 Ekim–4 Kasım)'],
  ['Kasım', '10 Kasım Atatürk\'ü Anma'],
  ['Kasım', '24 Kasım Öğretmenler Günü'],
  ['Aralık', 'İnsan Hakları ve Demokrasi Haftası'],
  ['Aralık', 'Tutum, Yatırım ve Türk Malları Haftası'],
  ['Ocak', 'Enerji Tasarrufu Haftası'],
  ['Şubat', 'Sivil Savunma Günü (28 Şubat)'],
  ['Mart', 'Yeşilay Haftası'],
  ['Mart', '12 Mart İstiklal Marşı\'nın Kabulü ve Mehmet Akif Ersoy\'u Anma'],
  ['Mart', '18 Mart Çanakkale Zaferi ve Şehitleri Anma'],
  ['Mart', 'Orman Haftası'],
  ['Nisan', 'Kütüphaneler Haftası'],
  ['Nisan', '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı'],
  ['Mayıs', 'Trafik ve İlk Yardım Haftası'],
  ['Mayıs', '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı'],
  ['Haziran', 'Çevre Koruma Haftası']
];

var BEP_HAVUZ_BEP = [
  'Kısa bir metni kendi cümleleriyle anlatabilme',
  'Temel dört işlemde doğru sonuca ulaşabilme',
  'Sınıf içinde verilen yönergeyi takip edebilme',
  'Günlük ihtiyaçlarını sözlü olarak ifade edebilme',
  'Belirlenen süre boyunca göreve dikkatini verebilme'
];
var BEP_HAVUZ_ZEP = [
  'Konuyu farklı kaynaklardan karşılaştırarak derinleştirebilme',
  'Özgün bir ürün veya proje tasarlayabilme',
  'Üst düzey bir problemi adım adım çözebilme',
  'Öğrendiğini akranlarına açıklayarak aktarabilme'
];

/* ---------- Dışa açık çekirdek ---------- */
var OYX = {
  SURUM: '1.12.2',
  TATIL: TATIL,
  ALANLAR: EGZ_ALANLAR,
  KULUPLER: KULUPLER,
  BELIRLI: BELIRLI,
  parseIso: parseIso,
  validIso: validIso,
  addDays: addDays,
  range: range,
  gunAd: gunAd,
  trDate: trDate,
  tatilDurum: tatilDurum,
  haftaSonuEkle: haftaSonuEkle,
  bitisHesap: bitisHesap,
  varsayilanAralik: varsayilanAralik,
  saatYazi: saatYazi,
  saatEksik: saatEksik,
  seanslar: seanslar,
  haftalikSaat: haftalikSaat,
  toplamSaat: toplamSaat,
  konuDoldur: konuDoldur,
  analizHesap: analizHesap,
  telafiMetin: telafiMetin,
  ilkokulSinavYasak: ilkokulSinavYasak,
  sinavYasakMetin: sinavYasakMetin,
  siralamaYasakMetin: siralamaYasakMetin,
  oyssSayfaParse: oyssSayfaParse,
  oyssKitapParse: oyssKitapParse,
  programCiktilar: programCiktilar,
  yerlestir: yerlestir
};

root.OYX = OYX;
if (typeof document !== 'undefined') {
  /* UI ayrı yüklenir: planlar-ui.js veya aynı dosyanın devamı */
  if (typeof OYX_UI_INIT === 'function') OYX_UI_INIT(root, OYX);
}

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

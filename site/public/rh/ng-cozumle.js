// Not Girişi Asistanı ile ortak sınıf listesi ayrıştırıcısı (ice/cozumle.js ile birebir aynı; değişiklik iki ürüne birlikte yapılmalı).
// 1.7.0 Excel'den not girişi: e-Okul sınıf listesi / not şablonu / serbest tablo ayrıştırma (yalnız bu bilgisayarda; ağ yok).
// Kaynak: 1.6.28-ice cozumle.js'den taşındı ve genişletildi (e-Okul Sınıf Listesi .xls başlığı, şablon üst bilgisi Sınıf/Ders, Adı+Soyadı, soru sütunları).
// Okul adı hiçbir yerde okunmaz/yazılmaz; okula özgü sabit yoktur.
(function (kok) {
  'use strict';
  const sade = (s) => String(s == null ? '' : s).replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase().replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/i̇/g, 'i').replace(/[âàá]/g, 'a').replace(/[îíì]/g, 'i').replace(/[ûúù]/g, 'u').replace(/\s+/g, ' ').trim();
  const hucre = (v) => String(v == null ? '' : v).trim();
  // başlık -> alan
  function alanTuru(h) { const s = sade(h).replace(/[._:]/g, ' ').replace(/\s+/g, ' ').trim(); if (!s) return null;
    if (/^(s ?no|sira( no)?|#)$/.test(s)) return null;
    if (/(okul ?no|ogrenci ?no|okul numarasi|ogrenci numarasi|^numara(si)?$|^no$)/.test(s)) return 'no';
    if (/^soyad(i)?$/.test(s)) return 'soyad';
    if (/(ad(i)? ?soyad|^ad$|^adi$|^isim|ogrenci ad|^ad soyad)/.test(s)) return 'ad';
    if (/^(sinif ?\/ ?sube|sinif ?- ?sube|sinif sube|sinifi|sinif)$/.test(s) || /sinif.*sube/.test(s)) return 'sinif';
    if (/^sube(si)?$/.test(s)) return 'sube';
    if (/^ders(in adi| adi)?$/.test(s)) return 'ders';
    if (/^(s|soru) ?\d{1,2}$|^\d{1,2} ?(soru|s)$/.test(s)) return 'soru';
    if (/(sinav|yazili|puan|^not$|notu|perf|proje|uygulama|^uyg)/.test(s)) return 'puan';
    return null; }
  // "2. Sınav" / "2. Yazılı" -> {tur:'sinav', n:2}; "1. Perf." -> perf 1; "Proje" -> proje 1
  function sutunTuru(h) { const s = sade(h), n = +((s.match(/(\d)/) || [])[1] || 1);
    if (/proje/.test(s)) return { tur: 'proje', n: 1 }; if (/perf/.test(s)) return { tur: 'perf', n: Math.min(n, 3) }; if (/uyg/.test(s)) return { tur: 'uyg', n: Math.min(n, 3) };
    return { tur: 'sinav', n: Math.min(Math.max(n, 1), 6) }; }
  // e-Okul liste başlığı: "AMP - 11. Sınıf / F Şubesi (ALAN) Sınıf Listesi" (sıkı kalıp; okul adındaki sayılarla karışmaz)
  const ESIKI_RE = /(\d{1,2})\s*\.?\s*S[ıiIİ]n[ıiIİ]f[ıiIİ]?\s*[\/-]\s*([A-ZÇĞİÖŞÜa-zçğıöşü])\s*[ŞSşs]ube/i;
  const SINIF_RE = /^(\d{1,2})\s*\.?\s*(?:s[ıi]n[ıi]f[ıi]?)?\s*[-/ .]\s*([A-ZÇĞİÖŞÜa-zçğıöşü])(?:\s*[şs]ube(?:si)?)?$/i;
  function sinifCoz(v, sube) { const t = hucre(v); if (!t) return '';
    if (sube != null && hucre(sube) && /^\d{1,2}\.?$/.test(t.replace(/\s*s[ıi]n[ıi]f[ıi]?/i, '').trim())) return +t.match(/\d+/)[0] + '-' + hucre(sube).toLocaleUpperCase('tr-TR').replace(/\s*[ŞS]UBE(S[İI])?$/, '').slice(0, 1);
    let m = t.match(ESIKI_RE); if (!m && t.length <= 24) m = t.match(SINIF_RE);
    if (m && +m[1] >= 1 && +m[1] <= 12) return +m[1] + '-' + m[2].toLocaleUpperCase('tr-TR');
    /* 1.8.6 anasınıfı / hazırlık: "Anasınıfı / A Şubesi", "Hazırlık Sınıfı / B Şubesi", "ANA-A", "HAZ-B" */
    const o = t.length <= 80 && /^(?:.*?[\s(\/-])?(anas[ıi]n[ıi]f[ıi]?|anaokulu|ana|haz[ıi]rl[ıi]k(?:\s*s[ıi]n[ıi]f[ıi]?)?|haz)\s*[\/ .-]+\s*([a-zçğıöşü])(?:\s*şube(?:si)?)?(?:\s*\(.*\))?(?:\s+s[ıi]n[ıi]f listesi)?\s*$/.exec(t.toLocaleLowerCase('tr-TR'));
    return o ? (/^haz/i.test(o[1]) ? 'HAZ' : 'ANA') + '-' + o[2].toLocaleUpperCase('tr-TR') : ''; }
  function puanCoz(v) { if (v == null) return ''; if (typeof v === 'number') return v >= 0 && v <= 100 ? String(Math.round(v)) : '?';
    const s = sade(v); if (!s) return ''; if (/^(g|girmedi|gelmedi|katilmadi)$/.test(s)) return 'G';
    const x = Number(s.replace(',', '.')); return isFinite(x) && x >= 0 && x <= 100 ? String(Math.round(x)) : '?'; }
  // Okul No: yalnız 1-6 haneli tam sayı (alt bilgi "OOG01001R020" gibi rapor kodları elenir)
  function noCoz(v) { if (typeof v === 'number') return Number.isInteger(v) && v > 0 && v < 1e6 ? String(v) : ''; const t = hucre(v).replace(/\.0+$/, ''); return /^\d{1,6}$/.test(t) ? t : ''; }
  const ETIKET = (s) => { const x = sade(s).replace(/[:.]+$/, '').trim(); return /^(sinif|sinifi|sinif ?\/ ?sube|sinif ?- ?sube|sube)$/.test(x) ? 'sinif' : /^(ders|ders adi|dersin adi)$/.test(x) ? 'ders' : null; };
  // Başlık satırının üstündeki "Sınıf | 11-F" ve "Ders | Matematik" etiket-değer çiftleri (şablon) ve e-Okul liste başlığı
  function ustBilgi(tablo, bi, sayfaAdi) { let sinif = '', ders = '', dersHucre = null;
    for (let i = 0; i < Math.max(bi, 0); i++) { const r = tablo[i] || [];
      for (let c = 0; c < r.length; c++) { const e = ETIKET(r[c]); if (!e) continue; let d = c + 1; while (d < r.length && !hucre(r[d])) d++;
        const deger = d < r.length ? hucre(r[d]) : ''; if (e === 'sinif' && !sinif) sinif = sinifCoz(deger); if (e === 'ders' && !ders) { ders = deger; dersHucre = [i, d < r.length ? d : c + 1]; } }
      if (!ders) r.forEach((h, c) => { const m = !ders && /^\s*ders(?:in)?(?: ?ad[ıi])?\s*[:：=-]\s*(.+)$/i.exec(hucre(h)); if (m && m[1].trim()) { ders = m[1].trim(); dersHucre = [i, c]; } }); // 1.8.5 "Ders: X" tek hücrede
      if (!sinif) r.forEach((h) => { if (!sinif && ESIKI_RE.test(hucre(h))) sinif = sinifCoz(h); }); }
    // 1.8.5 şablon düzeni (başlık 5. satırda): Ders etiketi silinmiş/üstüne yazılmışsa 2. satırdaki ilk etiket olmayan değer
    if (!ders && bi === 4 && tablo[1]) { const r = tablo[1]; for (let c = 0; c < r.length && c < 4; c++) { const v = hucre(r[c]); if (v && !ETIKET(v) && !/^okul no/i.test(sade(v))) { ders = v; dersHucre = [1, c]; break; } } }
    if (!sinif) sinif = sinifCoz(sayfaAdi);
    return { sinif, ders, dersHucre }; }
  // tablo: [[hücre…]…] (bir sayfa). Dönüş: {baslikSatir, sutunlar:[{i,ad,alan}], esle:{no,ad,soyad,sinif,sube,ders,puan:[i…],soru:[i…]}, varsayilanSinif, varsayilanDers, emin}
  function baslikBul(tablo, sayfaAdi) { let en = { skor: 0, i: -1 };
    for (let i = 0; i < Math.min(tablo.length, 25); i++) { const r = tablo[i] || [], al = r.map(alanTuru); if (!al.includes('no')) continue; const sk = new Set(al.filter(Boolean)).size + 1; if (sk > en.skor) en = { skor: sk, i }; }
    const bi = en.i, gen = Math.max(0, ...tablo.slice(0, 60).map((r) => (r || []).length)), bas = bi >= 0 ? (tablo[bi] || []) : Array(gen).fill(''), sutunlar = Array.from({ length: Math.max(bas.length, gen) }, (_, i) => ({ i, ad: hucre(bas[i]) || 'Sütun ' + (i + 1), alan: alanTuru(bas[i]) }));
    const esle = { no: -1, ad: -1, soyad: -1, sinif: -1, sube: -1, ders: -1, puan: [], soru: [] }; sutunlar.forEach((c) => { if (!c.alan) return; if (c.alan === 'puan' || c.alan === 'soru') esle[c.alan].push(c.i); else if (esle[c.alan] < 0) esle[c.alan] = c.i; });
    if (esle.no < 0) { // başlıksız no sütunu: en çok 3-6 haneli tamsayı içeren
      let enc = { n: 0, i: -1 }; for (let c = 0; c < sutunlar.length; c++) { const n = tablo.slice(bi + 1, bi + 60).filter((r) => /^\d{3,6}$/.test(noCoz(r && r[c]))).length; if (n > enc.n) enc = { n, i: c }; } if (enc.n >= 2) esle.no = enc.i; }
    const ub = ustBilgi(tablo, bi, sayfaAdi);
    const emin = bi >= 0 && esle.no >= 0 && (esle.sinif >= 0 || !!ub.sinif);
    return { baslikSatir: bi, sutunlar, esle, varsayilanSinif: ub.sinif, varsayilanDers: ub.ders, dersHucre: ub.dersHucre, emin }; }
  // Puan sütunu seçenekleri: her puan sütunu + soru sütunları varsa "Soru toplamı" (sanal, i = -2)
  function puanSecenekleri(b) { const s = b.esle.puan.map((i) => ({ i, ad: b.sutunlar[i].ad })); if (b.esle.soru.length) s.push({ i: -2, ad: 'Soru toplamı (' + b.esle.soru.length + ' soru)' }); return s; }
  function soruToplam(r, sorular) { const d = sorular.map((i) => puanCoz(r[i])); if (d.every((x) => x === '')) return ''; if (d.some((x) => x === 'G')) return d.every((x) => x === 'G' || x === '') ? 'G' : '?';
    if (d.some((x) => x === '?')) return '?'; const t = d.reduce((a, x) => a + (x === '' ? 0 : +x), 0); return t <= 100 ? String(t) : '?'; }
  // satırlar -> [{sinif, no, ad, ders, puan, sorun}]
  function satirlar(tablo, b, puanSutun, varsayilanSinif, varsayilanDers) { const e = b.esle, cik = [], ps = puanSutun != null ? puanSutun : (e.puan.length ? e.puan[0] : (e.soru.length ? -2 : -1));
    for (let i = b.baslikSatir + 1; i < tablo.length; i++) { const r = tablo[i] || []; const no = e.no >= 0 ? noCoz(r[e.no]) : '';
      if (!no) continue; const sinif = (e.sinif >= 0 ? sinifCoz(r[e.sinif], e.sube >= 0 ? r[e.sube] : null) : '') || varsayilanSinif || b.varsayilanSinif || '';
      const puan = ps === -2 ? soruToplam(r, e.soru) : ps >= 0 ? puanCoz(r[ps]) : '';
      const ders = (e.ders >= 0 ? hucre(r[e.ders]) : '') || varsayilanDers || b.varsayilanDers || '';
      const ad = [e.ad >= 0 ? hucre(r[e.ad]) : '', e.soyad >= 0 ? hucre(r[e.soyad]) : ''].filter(Boolean).join(' ');
      cik.push({ sinif, no, ad, ders, puan, sorun: sorunlar({ sinif, puan }) }); }
    return cik; }
  const sorunlar = (r) => [!sinifCoz(r.sinif) && 'sınıf yok', r.puan === '?' && 'geçersiz puan (0-100 ya da G)'].filter(Boolean).join(', ');
  // Aynı sınıfta tekrarlanan numara sorunlu sayılır
  function ciftleriIsaretle(sat) { const say = {}; sat.forEach((r) => { const k = r.sinif + '|' + r.no; say[k] = (say[k] || 0) + 1; });
    sat.forEach((r) => { if (say[r.sinif + '|' + r.no] > 1 && !/tekrar/.test(r.sorun)) r.sorun = [r.sorun, 'numara tekrarlanmış'].filter(Boolean).join(', '); }); return sat; }
  // Not şablonu: sınıf başına bir sayfa. Üstte Sınıf ve Ders (sarı, öğretmen doldurur), altta Okul No | Ad Soyad | not sütunları
  const SABLON_BAS = 4; // başlık satırı (0 tabanlı): 0 Sınıf, 1 Ders, 2 açıklama, 3 boş, 4 başlık
  function sablonSayfalari(siniflar, ders, notSutunlari) { const ns = notSutunlari.length ? notSutunlari : ['1. Yazılı'];
    return siniflar.map((s) => { const bas = ['Okul No', 'Ad Soyad'].concat(ns), bos = Array(bas.length).fill('');
      const sat = [['Sınıf', s.sinif].concat(bos.slice(2)), ['Ders', ders || ''].concat(bos.slice(2)), ['Okul No\'nun yanına puanı yazın (0-100; girmedi: G). Boş bırakılan yazılmaz. Sınıf ve Okul No\'yu değiştirmeyin.'].concat(bos.slice(1)), bos.slice(), bas];
      s.ogrenciler.forEach((o) => sat.push([o.no, o.ad || ''].concat(ns.map(() => ''))));
      return { ad: s.sinif, satirlar: sat, genislik: [10, 26].concat(ns.map(() => 12)), notSutunu: ns.map((_, i) => i + 2), basSatir: SABLON_BAS, sariHucre: [[1, 1]] }; }); }
  // Ders hücresine açılır liste: son sayfa "Dersler" (sayfadan okunan ya da yerleşik liste). İçe aktarmada bu sayfa atlanır.
  // 1.8.4: dersler dizi (tüm sayfalar aynı) ya da sayfa başına dizi listesi (sayfa i → Dersler sayfasında i. sütun)
  function sablonDersListesi(sf, dersler) { if (!dersler || !dersler.length) return sf;
    if (!Array.isArray(dersler[0])) { const k = "'Dersler'!$A$1:$A$" + dersler.length; sf.forEach((s) => { s.liste = [{ hucre: [1, 1], kaynak: k }]; }); return sf.concat([{ ad: 'Dersler', satirlar: dersler.map((d) => [d]), genislik: [44] }]); }
    const kol = (i) => { let t = ''; i++; while (i) { const m = (i - 1) % 26; t = String.fromCharCode(65 + m) + t; i = Math.floor((i - 1) / 26); } return t; }, n = Math.max(...dersler.map((d) => d.length));
    sf.forEach((s, i) => { const d = dersler[i] || []; if (d.length) s.liste = [{ hucre: [1, 1], kaynak: "'Dersler'!$" + kol(i) + '$1:$' + kol(i) + '$' + d.length }]; });
    return sf.concat([{ ad: 'Dersler', satirlar: Array.from({ length: n }, (_, r) => sf.map((_, i) => (dersler[i] || [])[r] || '')), genislik: sf.map(() => 44) }]); }
  // e-Okul Sınıf Listesi (ya da herhangi bir tablo) -> {sinif, ogrenciler:[{no, ad}]}
  function listeOku(tablo, sayfaAdi) { const b = baslikBul(tablo, sayfaAdi); if (b.esle.no < 0) return null;
    const og = satirlar(tablo, b, -1).map((r) => ({ no: r.no, ad: r.ad, sinif: r.sinif })); return { b, ogrenciler: og }; }
  const api = { sablonDersListesi, sade, alanTuru, sutunTuru, sinifCoz, puanCoz, noCoz, baslikBul, puanSecenekleri, satirlar, sorunlar, ciftleriIsaretle, sablonSayfalari, listeOku, SABLON_BAS };
  if (typeof module !== 'undefined') module.exports = api; else kok.NGAIce = api;
})(typeof window !== 'undefined' ? window : globalThis);

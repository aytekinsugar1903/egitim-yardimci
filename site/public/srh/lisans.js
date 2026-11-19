/* © 2026 Eyüp ŞEKER — Evrak Asistanı Rehberlik Yardımcısı / Sınıf Rehberlik Yardımcısı lisans çekirdeği.
   Aynı sözleşme: evrak-lisans-api (api.otonomevrak.com). EAT1 Ed25519 jetonu, EA-XXXX-XXXX-XXXX-XXXX anahtarı.
   Sunucuya YALNIZCA: lisans anahtarı, kurum kodu, rastgele kurulum kimliği, sürüm, ürün kodu (rehberlik | rehberlikhafif).
   Tam (rehberlik) anahtarı hafif sürümü de açar; hafif (rehberlikhafif) anahtar tam sürümü açmaz.
   Öğrenci / evrak / TC verisi gönderilmez (KVKK). Jeton yerelde açık anahtarla doğrulanır (7 gün çevrimdışı). */
(function (G) {
  'use strict';
  var HAFIF = !!(G.OY_PAKET && G.OY_PAKET.tur === 'sinif');
  var URUN = HAFIF ? 'rehberlikhafif' : 'rehberlik';
  var KABUL = HAFIF ? ['rehberlikhafif', 'rehberlik', '*'] : ['rehberlik', '*'];
  var AD = HAFIF ? 'Sınıf Rehberlik Yardımcısı' : 'Rehberlik Yardımcısı';
  var ACIK_ANAHTAR = '323Rkw1x_X3jmAV-_jadV0jxuNThV6_KY0maIAhTar0';
  var API = 'https://api.otonomevrak.com';
  var SAAT = 3600000, GUN = 24 * SAAT;
  var DENEME_MS = 48 * SAAT;
  var YENILE_MS = GUN;
  var SOZLESME_SURUMU = '2026-11-15';
  var DEPO = HAFIF ? 'srh_lisans_v1' : 'rhb_lisans_v1';
  var SURUM = '1.1.1';

  function b64uDec(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var b = atob(s), u = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  }
  function kkNorm(k) { return String(k || '').replace(/\D/g, ''); }
  function anahtarBicim(k) { return /^EA(-[A-Z0-9]{4}){4}$/.test(String(k || '').trim().toUpperCase()); }

  function tokenParse(tok) {
    var m = /^EAT1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(String(tok || '').trim());
    if (!m) return null;
    try {
      return {
        yuk: JSON.parse(new TextDecoder().decode(b64uDec(m[1]))),
        veri: new TextEncoder().encode('EAT1.' + m[1]),
        imza: b64uDec(m[2])
      };
    } catch (e) { return null; }
  }

  var anahtarP = null;
  async function tokenVerify(tok) {
    var p = tokenParse(tok);
    if (!p || p.imza.length !== 64) return null;
    try {
      anahtarP = anahtarP || crypto.subtle.importKey('raw', b64uDec(ACIK_ANAHTAR), { name: 'Ed25519' }, false, ['verify']);
      var ok = await crypto.subtle.verify({ name: 'Ed25519' }, await anahtarP, p.imza, p.veri);
      return ok ? p.yuk : null;
    } catch (e) { return null; }
  }

  function simdi(kayit, now) {
    var n = now == null ? Date.now() : now;
    return Math.max(n, (kayit && +kayit.sonGorulen) || 0);
  }

  function urunUyuyor(yuk) {
    if (!yuk) return true;
    var p = yuk.product || yuk.urun;
    if (!p) return true; // mevcut typ=lisans/deneme jetonlarında ürün alanı yok (sunucu güncellemesi bekleniyor)
    p = String(p).toLowerCase().replace(/[^a-z0-9]/g, '');
    return KABUL.indexOf(p) >= 0;
  }

  function durumHesapla(kayit, yuk, kurumKodu, now) {
    var t = simdi(kayit, now), kk = kkNorm(kurumKodu);
    function sure(ms) {
      var s = Math.max(0, ms), g = Math.floor(s / GUN), sa = Math.floor((s % GUN) / SAAT), dk = Math.floor((s % SAAT) / 60000);
      return g ? g + ' gün ' + sa + ' saat' : sa ? sa + ' saat ' + dk + ' dk' : dk + ' dk';
    }
    if (!kk) return { durum: 'kurulum', izin: false, mesaj: AD + "'nı kullanmaya başlamak için kurum kodunu girip lisans sözleşmesini onaylayın (48 saatlik deneme başlar)." };
    if (kayit && kayit.token && !yuk) return { durum: 'gecersiz', izin: false, mesaj: 'Lisans bilgisi bozuk ya da değiştirilmiş. Lisans anahtarınızı yeniden girin.' };
    if (yuk) {
      if (!urunUyuyor(yuk)) return { durum: 'gecersiz', izin: false, mesaj: 'Bu lisans başka bir Evrak Asistanı ürünü için verilmiş. ' + AD + ' anahtarı gerekir.' };
      if (kkNorm(yuk.kk) !== kk) return { durum: 'gecersiz', izin: false, mesaj: 'Lisans başka bir kurum kodu için verilmiş (' + yuk.kk + '). Kurum kodunuzu ya da anahtarınızı kontrol edin.' };
      if (yuk.iid !== '*' && kayit && yuk.iid && yuk.iid !== kayit.iid) return { durum: 'gecersiz', izin: false, mesaj: 'Lisans bu cihaz için etkinleştirilmemiş. Lisans anahtarınızı yeniden girin.' };
      var bit = +yuk.bit || +yuk.exp;
      if (bit && t >= bit) return yuk.typ === 'deneme'
        ? { durum: 'bitti', izin: false, plan: 'deneme', bit: bit, mesaj: '48 saatlik deneme süreniz doldu. Devam etmek için kurumunuza ' + AD + ' lisansı alın ve anahtarı girin. Verileriniz silinmedi.' }
        : { durum: 'bitti', izin: false, plan: yuk.plan, bit: bit, mesaj: 'Aboneliğinizin süresi doldu (' + new Date(bit).toLocaleDateString('tr-TR') + '). Yenilemek için lisansınızı uzatın. Verileriniz silinmedi.' };
      if (yuk.typ === 'deneme') return { durum: 'deneme', izin: true, plan: 'deneme', bit: yuk.bit, kalanMs: yuk.bit - t, mesaj: 'Deneme sürümü: ' + sure(yuk.bit - t) + ' kaldı.' };
      var exp = +yuk.exp;
      if (exp && t >= exp) return { durum: 'cevrimdisi', izin: false, plan: yuk.plan, bit: bit, mesaj: 'Lisans 7 gündür doğrulanamadı. İnternet bağlantısını kontrol edip Doğrula düğmesine basın.' };
      var grace = t - (+yuk.iat || 0) > YENILE_MS + 6 * SAAT;
      return {
        durum: 'etkin', izin: true, plan: yuk.plan, bit: bit, kalanMs: bit - t, cevrimdisi: grace,
        mesaj: (yuk.plan === 'yillik' ? 'Yıllık' : yuk.plan === 'aylik' ? 'Aylık' : 'Kurum') + ' lisans etkin — bitiş ' + new Date(bit).toLocaleDateString('tr-TR') + (grace ? ' (çevrimdışı: ' + sure(exp - t) + ' içinde doğrulanmalı)' : '') + '.'
      };
    }
    var bas = kayit && +kayit.yerelDenemeBas;
    if (bas && t < bas + DENEME_MS) return { durum: 'deneme', izin: true, plan: 'deneme', bit: bas + DENEME_MS, kalanMs: bas + DENEME_MS - t, dogrulanmadi: true, mesaj: 'Deneme sürümü: ' + sure(bas + DENEME_MS - t) + ' kaldı (lisans sunucusuna henüz ulaşılamadı).' };
    if (bas) return { durum: 'bitti', izin: false, plan: 'deneme', bit: bas + DENEME_MS, mesaj: '48 saatlik deneme süreniz doldu. Devam etmek için kurumunuza ' + AD + ' lisansı alın ve anahtarı girin. Verileriniz silinmedi.' };
    return { durum: 'kurulum', izin: false, mesaj: 'Lisans sözleşmesini onaylayıp kurum kodunu kaydedin (48 saatlik deneme başlar).' };
  }

  function yukleKayit() {
    try { return JSON.parse(localStorage.getItem(DEPO) || '{}') || {}; } catch (e) { return {}; }
  }
  function yazKayit(k) {
    try { localStorage.setItem(DEPO, JSON.stringify(k)); } catch (e) {}
    return k;
  }
  function iidAl(k) {
    if (!k.iid) k.iid = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
    return k.iid;
  }

  async function post(yol, govde) {
    var ctl = new AbortController();
    var tm = setTimeout(function () { ctl.abort(); }, 12000);
    try {
      var r = await fetch(API + yol, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(govde),
        signal: ctl.signal,
        credentials: 'omit',
        cache: 'no-store'
      });
      var j = null;
      try { j = await r.json(); } catch (e) {}
      return { ok: r.ok, status: r.status, j: j || {} };
    } catch (e) {
      return { ok: false, status: 0, j: { hata: 'Lisans sunucusuna ulaşılamadı (internet bağlantısı).' } };
    } finally { clearTimeout(tm); }
  }

  function govde(k, kk) {
    return { iid: k.iid, kurumKodu: kk, surum: SURUM, urun: URUN };
  }

  async function jetonAl(k, kk, anahtar) {
    iidAl(k);
    if (!k.yerelDenemeBas && !anahtar && !k.anahtar) k.yerelDenemeBas = Date.now();
    var g = govde(k, kk);
    var r = (anahtar || k.anahtar)
      ? await post('/v1/etkinlestir', Object.assign({ anahtar: (anahtar || k.anahtar) }, g))
      : await post('/v1/deneme', g);
    if (r.ok && r.j.token && await (G.EA_LISANS && G.EA_LISANS.tokenVerify ? G.EA_LISANS.tokenVerify(r.j.token) : tokenVerify(r.j.token))) {
      k.token = r.j.token;
      k.hata = '';
      k.sonDogrulama = Date.now();
    } else {
      k.hata = (r.j && r.j.hata) || ('Sunucu yanıtı: ' + r.status);
    }
    if (r.status === 403 || r.status === 410) k.token = '';
    yazKayit(k);
    return { ok: !k.hata, hata: k.hata, kayit: k };
  }

  async function anahtarGir(anahtar, kurumKodu, sozlesme) {
    if (!sozlesme) return { ok: false, hata: 'Önce lisans sözleşmesini onaylayın.' };
    var kk = kkNorm(kurumKodu);
    if (!kk || kk.length < 4) return { ok: false, hata: 'Kurum kodu en az 4 rakam olmalıdır.' };
    var k = yukleKayit();
    k.kk = kk;
    k.sozlesme = { surum: SOZLESME_SURUMU, at: new Date().toISOString() };
    var a = String(anahtar || '').trim();
    if (/^EAT1\./.test(a)) {
      var y = await (G.EA_LISANS && G.EA_LISANS.tokenVerify ? G.EA_LISANS.tokenVerify(a) : tokenVerify(a));
      if (!y) return { ok: false, hata: 'Jeton doğrulanamadı (bozuk ya da değiştirilmiş).' };
      if (!urunUyuyor(y)) return { ok: false, hata: 'Bu jeton başka bir ürün için verilmiş.' };
      if (kkNorm(y.kk) !== kk) return { ok: false, hata: 'Bu jeton ' + y.kk + ' kurum kodu için verilmiş.' };
      iidAl(k);
      k.token = a;
      k.anahtar = '';
      k.hata = '';
      yazKayit(k);
      return { ok: true, kayit: k };
    }
    if (!anahtarBicim(a)) return { ok: false, hata: 'Anahtar biçimi: EA-XXXX-XXXX-XXXX-XXXX' };
    k.anahtar = a.toUpperCase();
    yazKayit(k);
    return jetonAl(k, kk, k.anahtar);
  }

  async function denemeBaslat(kurumKodu, sozlesme) {
    if (!sozlesme) return { ok: false, hata: 'Önce lisans sözleşmesini onaylayın.' };
    var kk = kkNorm(kurumKodu);
    if (!kk || kk.length < 4) return { ok: false, hata: 'Kurum kodu en az 4 rakam olmalıdır.' };
    var k = yukleKayit();
    k.kk = kk;
    k.sozlesme = { surum: SOZLESME_SURUMU, at: new Date().toISOString() };
    if (!k.yerelDenemeBas) k.yerelDenemeBas = Date.now();
    yazKayit(k);
    return jetonAl(k, kk, null);
  }

  async function durum() {
    var k = yukleKayit();
    var now = Date.now();
    if (!k.sonGorulen || now > k.sonGorulen) { k.sonGorulen = now; yazKayit(k); }
    var yuk = k.token ? await (G.EA_LISANS && G.EA_LISANS.tokenVerify ? G.EA_LISANS.tokenVerify(k.token) : tokenVerify(k.token)) : null;
    var d = durumHesapla(k, yuk, k.kk, now);
    var sozOk = !!(k.sozlesme && k.sozlesme.surum === SOZLESME_SURUMU);
    if (!sozOk && d.izin) {
      d.izin = false;
      d.durum = 'kurulum';
      d.mesaj = 'Lisans sözleşmesinin bu sürümünü onaylayın.';
    }
    return Object.assign(d, { anahtarVar: !!k.anahtar, sonHata: k.hata || '', sozlesme: sozOk, kk: k.kk || '', kayit: k });
  }

  async function bakim() {
    var k = yukleKayit();
    var y = null;
    if (k.token) { try { y = tokenParse(k.token); y = y && y.yuk; } catch (e) { y = null; } }
    if (!k.kk) return durum();
    if (!y || (y.typ !== 'deneme' && Date.now() - (+y.iat || 0) > YENILE_MS) || (y.typ === 'deneme' && k.anahtar)) {
      await jetonAl(k, k.kk, k.anahtar || null);
    }
    return durum();
  }

  G.EA_LISANS = {
    URUN: URUN, KABUL: KABUL, AD: AD, HAFIF: HAFIF, API: API, DENEME_MS: DENEME_MS, YENILE_MS: YENILE_MS, GUN: GUN,
    SOZLESME_SURUMU: SOZLESME_SURUMU, ACIK_ANAHTAR: ACIK_ANAHTAR, DEPO: DEPO, SURUM: SURUM,
    tokenParse: tokenParse, tokenVerify: tokenVerify, durumHesapla: durumHesapla,
    kkNorm: kkNorm, anahtarBicim: anahtarBicim, urunUyuyor: urunUyuyor,
    yukleKayit: yukleKayit, yazKayit: yazKayit, durum: durum, bakim: bakim,
    anahtarGir: anahtarGir, denemeBaslat: denemeBaslat, jetonAl: jetonAl
  };
})(typeof self !== 'undefined' ? self : this);
